/**
 * Family Guardian — Cloud Functions (Node 20, firebase-functions v2).
 *
 * Responsibilities:
 *   - Pairing: mint a single-use custom token + pairing code for a child device.
 *   - Command relay: parent enqueues a command; we push it to the device via FCM.
 *   - Alerts: fan out alerts (geofence / flagged app / screen-time / monitoring off)
 *     created by the device to the parent's devices via FCM.
 *   - Geofence evaluation: a server-side backup that evaluates each new location against
 *     the family's safe zones (in case the on-device geofence receiver missed one).
 *   - Retention: scheduled cleanup of location history, usage, alerts, pairing codes.
 *   - Deletion: parent-initiated cascade delete of a child's data or the whole family.
 *
 * No third-party analytics/ad SDKs are used. All auth checks confirm the caller is a
 * guardian of the family before doing anything.
 */

const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { onDocumentCreated, onDocumentUpdated } = require("firebase-functions/v2/firestore");
const { onSchedule } = require("firebase-functions/v2/scheduler");
const admin = require("firebase-admin");

admin.initializeApp();
const db = admin.firestore();
const messaging = admin.messaging();

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function assertGuardian(familyId, uid) {
  if (!uid) throw new HttpsError("unauthenticated", "Sign in required.");
  const snap = await db.doc(`families/${familyId}`).get();
  if (!snap.exists) throw new HttpsError("not-found", "Family not found.");
  const fam = snap.data();
  const isGuardian = fam.ownerUid === uid || (fam.memberUids || []).includes(uid);
  if (!isGuardian) throw new HttpsError("permission-denied", "Not a guardian of this family.");
  return fam;
}

async function notifyGuardians(familyId, title, body, data = {}) {
  const famSnap = await db.doc(`families/${familyId}`).get();
  if (!famSnap.exists) return;
  const fam = famSnap.data();
  const guardianUids = [fam.ownerUid, ...(fam.memberUids || [])].filter(Boolean);

  // Guardian FCM tokens are stored on their user profile docs.
  const tokens = [];
  for (const uid of guardianUids) {
    const u = await db.doc(`parentUsers/${uid}`).get();
    const t = u.exists ? u.data().fcmTokens || [] : [];
    tokens.push(...t);
  }
  if (tokens.length === 0) return;

  await messaging.sendEachForMulticast({
    tokens,
    notification: { title, body },
    data: Object.fromEntries(Object.entries(data).map(([k, v]) => [k, String(v)])),
    android: { priority: "high" },
  });
}

// ---------------------------------------------------------------------------
// Pairing
// ---------------------------------------------------------------------------

/**
 * Parent calls this to start pairing a new child device. Returns a payload the parent
 * dashboard encodes into a QR code. The child app scans it and signs in with the custom
 * token, which carries { familyId, role: "child" } claims used by the Security Rules.
 */
exports.createPairingCode = onCall(async (request) => {
  const { familyId, deviceLabel } = request.data || {};
  await assertGuardian(familyId, request.auth?.uid);

  // Reserve a deviceId (also the child's auth uid) and mint a custom token bound to it.
  const deviceRef = db.collection(`families/${familyId}/childDevices`).doc();
  const deviceId = deviceRef.id;

  const customToken = await admin.auth().createCustomToken(deviceId, {
    familyId,
    role: "child",
  });

  const code = Math.random().toString(36).slice(2, 10).toUpperCase();
  await db.doc(`families/${familyId}/pairingCodes/${code}`).set({
    deviceIdReserved: deviceId,
    deviceLabel: deviceLabel || "Child device",
    used: false,
    expiresAt: Date.now() + 15 * 60 * 1000, // 15 minutes
  });

  // The QR encodes exactly what PairingManager.parseQr() expects.
  return { familyId, pairingCode: code, customToken, deviceId };
});

// ---------------------------------------------------------------------------
// Command relay
// ---------------------------------------------------------------------------

/**
 * Parent enqueues a remote command. We persist it (so it survives if the device is
 * offline) and send a high-priority FCM data message so the device wakes and executes.
 */
exports.relayCommand = onCall(async (request) => {
  const { familyId, deviceId, verb, arg } = request.data || {};
  await assertGuardian(familyId, request.auth?.uid);

  const cmdRef = db.collection(`families/${familyId}/childDevices/${deviceId}/commands`).doc();
  await cmdRef.set({
    verb,
    arg: arg || null,
    createdAt: Date.now(),
    ackAt: null,
  });

  const deviceSnap = await db.doc(`families/${familyId}/childDevices/${deviceId}`).get();
  const token = deviceSnap.exists ? deviceSnap.data().fcmToken : null;
  if (token) {
    await messaging.send({
      token,
      data: { command: verb, commandId: cmdRef.id, arg: arg || "" },
      android: { priority: "high" },
    });
  }
  return { ok: true, commandId: cmdRef.id };
});

// ---------------------------------------------------------------------------
// Alerts → notify parent
// ---------------------------------------------------------------------------

/**
 * Fan out every alert the device writes (geofence enter/exit, flagged app, screen-time
 * limit, monitoring disabled) to the parent's devices via FCM.
 */
exports.onAlertCreated = onDocumentCreated(
  "families/{familyId}/alerts/{alertId}",
  async (event) => {
    const alert = event.data?.data();
    if (!alert) return;
    const { familyId } = event.params;

    const titles = {
      geofence_enter: "Safe zone entered",
      geofence_exit: "Safe zone left",
      flagged_app_opened: "Flagged app opened",
      screen_time_limit: "Screen-time limit reached",
      monitoring_disabled: "Monitoring turned off",
    };
    const title = titles[alert.type] || "Family Guardian alert";
    await notifyGuardians(familyId, title, alert.message || "", {
      type: alert.type,
      deviceId: alert.deviceId || "",
    });
  }
);

// ---------------------------------------------------------------------------
// Server-side geofence evaluation (backup for the on-device receiver)
// ---------------------------------------------------------------------------

function haversineMeters(a, b) {
  const R = 6371000;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  const h = Math.sin(dLat / 2) ** 2 + Math.sin(dLng / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
  return 2 * R * Math.asin(Math.sqrt(h));
}

/**
 * When a device's lastLocation updates, compare against the family's geofences and,
 * if the inside/outside state changed since last evaluation, write an alert. This is a
 * safety net; the primary path is the on-device Geofencing API. We store per-zone state
 * under the device doc to detect transitions and avoid duplicate alerts.
 */
exports.evaluateGeofences = onDocumentUpdated(
  "families/{familyId}/childDevices/{deviceId}",
  async (event) => {
    const before = event.data?.before.data() || {};
    const after = event.data?.after.data() || {};
    const loc = after.lastLocation;
    if (!loc || JSON.stringify(before.lastLocation) === JSON.stringify(loc)) return;

    const { familyId, deviceId } = event.params;
    const settingsSnap = await db
      .doc(`families/${familyId}/childDevices/${deviceId}/settings/current`)
      .get();
    const geofences = settingsSnap.exists ? settingsSnap.data().geofences || [] : [];
    if (geofences.length === 0) return;

    const prevState = after._geofenceState || {};
    const nextState = {};
    const batch = db.batch();
    let changed = false;

    for (const g of geofences) {
      const inside =
        haversineMeters(
          { lat: loc.latitude, lng: loc.longitude },
          { lat: g.latitude, lng: g.longitude }
        ) <= g.radiusMeters;
      nextState[g.id] = inside;

      const was = prevState[g.id];
      if (was !== undefined && was !== inside) {
        const type = inside ? "geofence_enter" : "geofence_exit";
        if ((inside && g.notifyOnEnter) || (!inside && g.notifyOnExit)) {
          const verb = inside ? "entered" : "left";
          batch.set(db.collection(`families/${familyId}/alerts`).doc(), {
            type,
            message: `Child ${verb} ${g.name}.`,
            deviceId,
            createdAt: Date.now(),
            extra: { geofenceId: g.id, source: "server" },
          });
          changed = true;
        }
      }
    }

    batch.set(
      db.doc(`families/${familyId}/childDevices/${deviceId}`),
      { _geofenceState: nextState },
      { merge: true }
    );
    if (changed || JSON.stringify(prevState) !== JSON.stringify(nextState)) await batch.commit();
  }
);

// ---------------------------------------------------------------------------
// Retention — scheduled cleanup
// ---------------------------------------------------------------------------

async function deleteOlderThan(collectionGroup, field, cutoffMs, batchSize = 300) {
  const snap = await db
    .collectionGroup(collectionGroup)
    .where(field, "<", cutoffMs)
    .limit(batchSize)
    .get();
  if (snap.empty) return 0;
  const batch = db.batch();
  snap.docs.forEach((d) => batch.delete(d.ref));
  await batch.commit();
  return snap.size;
}

exports.cleanupLocationHistory = onSchedule("every 6 hours", async () => {
  const cutoff = Date.now() - 7 * 24 * 60 * 60 * 1000; // 7 days
  let removed;
  do { removed = await deleteOlderThan("locationHistory", "timestamp", cutoff); }
  while (removed === 300);
});

exports.cleanupUsageStats = onSchedule("every 24 hours", async () => {
  const cutoffDay = Math.floor(Date.now() / 86400000) - 30; // epoch-day, 30 days
  let removed;
  do { removed = await deleteOlderThan("usageStats", "epochDay", cutoffDay); }
  while (removed === 300);
});

exports.cleanupAlerts = onSchedule("every 24 hours", async () => {
  const cutoff = Date.now() - 90 * 24 * 60 * 60 * 1000; // 90 days
  let removed;
  do { removed = await deleteOlderThan("alerts", "createdAt", cutoff); }
  while (removed === 300);
});

exports.cleanupPairingCodes = onSchedule("every 30 minutes", async () => {
  const snap = await db.collectionGroup("pairingCodes").where("expiresAt", "<", Date.now()).get();
  const batch = db.batch();
  snap.docs.forEach((d) => batch.delete(d.ref));
  if (!snap.empty) await batch.commit();
});

// ---------------------------------------------------------------------------
// Deletion (parent control over their data)
// ---------------------------------------------------------------------------

async function recursiveDelete(ref) {
  // Uses the Admin SDK's recursive delete for a doc and all subcollections.
  await admin.firestore().recursiveDelete(ref);
}

exports.deleteChildData = onCall(async (request) => {
  const { familyId, deviceId } = request.data || {};
  await assertGuardian(familyId, request.auth?.uid);
  await recursiveDelete(db.doc(`families/${familyId}/childDevices/${deviceId}`));
  // Also revoke the child device's auth so its token can no longer be used.
  try { await admin.auth().deleteUser(deviceId); } catch (_) { /* may not exist */ }
  return { ok: true };
});

exports.deleteFamily = onCall(async (request) => {
  const { familyId } = request.data || {};
  await assertGuardian(familyId, request.auth?.uid);
  await recursiveDelete(db.doc(`families/${familyId}`));
  return { ok: true };
});
