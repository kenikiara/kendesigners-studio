package com.family.guardian.data

import com.family.guardian.util.Constants
import com.google.firebase.firestore.FirebaseFirestore
import com.google.firebase.firestore.SetOptions
import kotlinx.coroutines.tasks.await

/**
 * Single gateway to Firestore for the child device. All paths are scoped under the
 * device's own family/device documents; the Security Rules enforce that the device may
 * only touch its own data (the app is not trusted to self-limit).
 *
 * Layout:
 *   families/{familyId}/childDevices/{deviceId}
 *     .../settings/current                (parent-writable, device read-only)
 *     .../locationHistory/{auto}          (device append; 7-day TTL by function)
 *     .../usageStats/{epochDay_pkg}
 *     .../commands/{commandId}            (parent create; device acks/deletes)
 *   families/{familyId}/alerts/{auto}     (device create; parent read)
 */
class FirestoreRepository(
    private val familyId: String,
    private val deviceId: String,
    private val db: FirebaseFirestore = FirebaseFirestore.getInstance()
) {
    private fun familyDoc() = db.collection(Constants.COL_FAMILIES).document(familyId)
    private fun deviceDoc() = familyDoc().collection(Constants.COL_DEVICES).document(deviceId)

    suspend fun fetchSettings(): ChildSettings? =
        deviceDoc().collection(Constants.COL_SETTINGS).document("current")
            .get().await().toObject(ChildSettings::class.java)

    fun settingsRef() =
        deviceDoc().collection(Constants.COL_SETTINGS).document("current")

    suspend fun reportLocation(report: LocationReport) {
        deviceDoc().collection(Constants.COL_LOCATIONS).add(report).await()
        // Keep a denormalized "latest" for a fast map read on the dashboard.
        deviceDoc().set(mapOf("lastLocation" to report), SetOptions.merge()).await()
    }

    suspend fun reportUsage(usage: List<AppUsage>) {
        val batch = db.batch()
        val col = deviceDoc().collection(Constants.COL_USAGE)
        usage.forEach { u ->
            batch.set(col.document("${u.epochDay}_${u.packageName}"), u)
        }
        batch.commit().await()
    }

    suspend fun reportInstalledApps(apps: List<InstalledApp>) {
        deviceDoc().set(mapOf("installedApps" to apps), SetOptions.merge()).await()
    }

    suspend fun updateHealth(health: DeviceHealth) {
        deviceDoc().set(mapOf("health" to health), SetOptions.merge()).await()
    }

    suspend fun fetchCommand(commandId: String): Command? =
        deviceDoc().collection(Constants.COL_COMMANDS).document(commandId)
            .get().await().toObject(Command::class.java)?.copy(id = commandId)

    suspend fun ackCommand(commandId: String) {
        // Delete on ack — commands are transient (see SECURITY.md retention table).
        deviceDoc().collection(Constants.COL_COMMANDS).document(commandId).delete().await()
    }

    /**
     * Write an alert for the parent. A Cloud Function fans this out to the parent's
     * devices via FCM (see firebase/functions). Location/usage payloads are never put
     * in the alert body — only the minimum the parent needs to see.
     */
    suspend fun raiseAlert(type: String, message: String, extra: Map<String, Any> = emptyMap()) {
        val doc = mapOf(
            "type" to type,
            "message" to message,
            "deviceId" to deviceId,
            "createdAt" to System.currentTimeMillis(),
            "extra" to extra
        )
        familyDoc().collection(Constants.COL_ALERTS).add(doc).await()
    }
}
