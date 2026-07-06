import { useEffect, useState } from "react";
import {
  collection, doc, getDocs, onSnapshot, query, where, setDoc, serverTimestamp, arrayUnion,
} from "firebase/firestore";
import { db, getWebPushToken } from "./firebase.js";

/**
 * Loads the signed-in parent's family (creating one on first sign-in), subscribes to its
 * child devices and the selected device's settings. Everything is scoped by the Security
 * Rules to this parent's own family.
 */
export function useFamily(user) {
  const [family, setFamily] = useState(null);
  const [devices, setDevices] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [settings, setSettings] = useState(null);

  // Find or create this parent's family.
  useEffect(() => {
    if (!user) return;
    (async () => {
      const q = query(collection(db, "families"), where("ownerUid", "==", user.uid));
      const snap = await getDocs(q);
      if (!snap.empty) {
        const d = snap.docs[0];
        setFamily({ id: d.id, ...d.data() });
      } else {
        const ref = doc(collection(db, "families"));
        await setDoc(ref, { ownerUid: user.uid, memberUids: [], createdAt: Date.now() });
        setFamily({ id: ref.id, ownerUid: user.uid, memberUids: [] });
      }
      // Register/refresh the parent profile (used to hold FCM tokens for alerts).
      await setDoc(doc(db, "parentUsers", user.uid),
        { email: user.email, updatedAt: serverTimestamp() }, { merge: true });

      // Register this browser for web-push alerts (best-effort; needs permission + VAPID).
      const token = await getWebPushToken();
      if (token) {
        await setDoc(doc(db, "parentUsers", user.uid),
          { fcmTokens: arrayUnion(token) }, { merge: true });
      }
    })();
  }, [user]);

  // Subscribe to child devices.
  useEffect(() => {
    if (!family) return;
    return onSnapshot(collection(db, `families/${family.id}/childDevices`), (snap) => {
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setDevices(list);
      setSelectedDevice((cur) => cur ? list.find((d) => d.id === cur.id) || list[0] : list[0]);
    });
  }, [family]);

  // Subscribe to selected device settings.
  useEffect(() => {
    if (!family || !selectedDevice) { setSettings(null); return; }
    return onSnapshot(
      doc(db, `families/${family.id}/childDevices/${selectedDevice.id}/settings/current`),
      (d) => setSettings(d.exists() ? d.data() : defaultSettings())
    );
  }, [family, selectedDevice?.id]);

  return { family, devices, selectedDevice, setSelectedDevice, settings };
}

export function defaultSettings() {
  return {
    locationIntervalMin: 15,
    screenTimeBudgetMin: 120,
    bedtime: { startHour: 21, startMinute: 0, endHour: 7, endMinute: 0, enabled: true },
    blockedApps: [],
    flaggedApps: [],
    appTimeLimits: {},
    geofences: [],
    contentFilter: { privateDnsHost: "", useLocalVpn: false, blockedDomains: [] },
    monitoringEnabled: true,
  };
}
