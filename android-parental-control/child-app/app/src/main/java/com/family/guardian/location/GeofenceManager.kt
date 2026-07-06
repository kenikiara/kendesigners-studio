package com.family.guardian.location

import android.annotation.SuppressLint
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import com.family.guardian.data.Geofence as SafeZone
import com.google.android.gms.location.Geofence
import com.google.android.gms.location.GeofencingClient
import com.google.android.gms.location.GeofencingRequest
import com.google.android.gms.location.LocationServices
import kotlinx.coroutines.tasks.await

/**
 * Registers the parent's safe zones with the platform Geofencing API. The OS then
 * delivers ENTER/EXIT transitions to GeofenceBroadcastReceiver even while the app is in
 * the background — which is why ACCESS_BACKGROUND_LOCATION is required.
 */
class GeofenceManager(context: Context) {

    private val ctx = context.applicationContext
    private val client: GeofencingClient = LocationServices.getGeofencingClient(ctx)

    private val pendingIntent: PendingIntent by lazy {
        val intent = Intent(ctx, GeofenceBroadcastReceiver::class.java)
        PendingIntent.getBroadcast(
            ctx, 0, intent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_MUTABLE
        )
    }

    @SuppressLint("MissingPermission")
    suspend fun register(zones: List<SafeZone>) {
        if (zones.isEmpty()) { runCatching { client.removeGeofences(pendingIntent).await() }; return }

        val geofences = zones.map { z ->
            var transitions = 0
            if (z.notifyOnEnter) transitions = transitions or Geofence.GEOFENCE_TRANSITION_ENTER
            if (z.notifyOnExit) transitions = transitions or Geofence.GEOFENCE_TRANSITION_EXIT
            Geofence.Builder()
                .setRequestId(z.id)
                .setCircularRegion(z.latitude, z.longitude, z.radiusMeters)
                .setExpirationDuration(Geofence.NEVER_EXPIRE)
                .setTransitionTypes(transitions)
                .setNotificationResponsiveness(60_000) // batch to save battery
                .build()
        }

        val request = GeofencingRequest.Builder()
            .setInitialTrigger(GeofencingRequest.INITIAL_TRIGGER_ENTER)
            .addGeofences(geofences)
            .build()

        // Replace the whole set so removed zones are cleared.
        runCatching { client.removeGeofences(pendingIntent).await() }
        client.addGeofences(request, pendingIntent).await()
    }

    suspend fun clear() {
        runCatching { client.removeGeofences(pendingIntent).await() }
    }
}
