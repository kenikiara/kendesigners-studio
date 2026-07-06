package com.family.guardian.location

import android.annotation.SuppressLint
import android.content.Context
import android.os.BatteryManager
import com.family.guardian.data.FirestoreRepository
import com.family.guardian.data.LocationReport
import com.family.guardian.util.SecureStore
import com.google.android.gms.location.LocationServices
import com.google.android.gms.location.Priority
import kotlinx.coroutines.tasks.await

/**
 * Reads a single high-accuracy fix from the Fused Location Provider and writes it to
 * Firestore. Used for periodic reports (from the foreground service loop / WorkManager)
 * and for on-demand LOCATE_NOW commands. The continuous live stream while the parent is
 * actively watching the map is handled by LocationService's requestLocationUpdates.
 */
class LocationReporter(context: Context) {

    private val ctx = context.applicationContext
    private val fused = LocationServices.getFusedLocationProviderClient(ctx)
    private val store = SecureStore(ctx)

    /** Caller must hold ACCESS_FINE_LOCATION (and background location for background use). */
    @SuppressLint("MissingPermission")
    suspend fun reportOnce(onDemand: Boolean) {
        val fam = store.familyId ?: return
        val dev = store.deviceId ?: return
        val location = fused.getCurrentLocation(Priority.PRIORITY_HIGH_ACCURACY, null).await()
            ?: fused.lastLocation.await() ?: return

        val report = LocationReport(
            latitude = location.latitude,
            longitude = location.longitude,
            accuracy = location.accuracy,
            batteryPct = batteryPct(),
            timestamp = System.currentTimeMillis(),
            onDemand = onDemand
        )
        FirestoreRepository(fam, dev).reportLocation(report)
    }

    private fun batteryPct(): Int {
        val bm = ctx.getSystemService(BatteryManager::class.java)
        return bm.getIntProperty(BatteryManager.BATTERY_PROPERTY_CAPACITY)
    }
}
