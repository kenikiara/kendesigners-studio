package com.family.guardian.location

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.util.Log
import com.family.guardian.data.FirestoreRepository
import com.family.guardian.util.Constants
import com.family.guardian.util.SecureStore
import com.google.android.gms.location.Geofence
import com.google.android.gms.location.GeofencingEvent
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.runBlocking

/**
 * Receives geofence transitions from the OS and records an alert. The heavy lifting of
 * notifying the parent is done by a Cloud Function watching the alerts collection, so
 * the device only needs to write a minimal alert doc. We also let the device write it so
 * the transition is captured even if the phone is briefly offline (Firestore queues it).
 */
class GeofenceBroadcastReceiver : BroadcastReceiver() {

    override fun onReceive(context: Context, intent: Intent) {
        val event = GeofencingEvent.fromIntent(intent) ?: return
        if (event.hasError()) { Log.w(TAG, "Geofence error ${event.errorCode}"); return }

        val type = when (event.geofenceTransition) {
            Geofence.GEOFENCE_TRANSITION_ENTER -> Constants.ALERT_GEOFENCE_ENTER
            Geofence.GEOFENCE_TRANSITION_EXIT -> Constants.ALERT_GEOFENCE_EXIT
            else -> return
        }
        val ids = event.triggeringGeofences?.map { it.requestId } ?: return

        val store = SecureStore(context)
        val fam = store.familyId ?: return
        val dev = store.deviceId ?: return
        val repo = FirestoreRepository(fam, dev)

        // goAsync would be cleaner; runBlocking is fine here since the work is a single
        // small write and we keep the receiver alive only briefly.
        val pending = goAsync()
        CoroutineScope(Dispatchers.IO).let {
            runCatching {
                runBlocking {
                    ids.forEach { zoneId ->
                        val verb = if (type == Constants.ALERT_GEOFENCE_ENTER) "entered" else "left"
                        repo.raiseAlert(type, "Child $verb a safe zone.",
                            extra = mapOf("geofenceId" to zoneId))
                    }
                }
            }
            pending.finish()
        }
    }

    private companion object { const val TAG = "GeofenceReceiver" }
}
