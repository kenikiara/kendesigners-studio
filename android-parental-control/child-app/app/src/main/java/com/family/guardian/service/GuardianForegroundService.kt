package com.family.guardian.service

import android.app.Notification
import android.app.PendingIntent
import android.app.Service
import android.content.Context
import android.content.Intent
import android.content.pm.ServiceInfo
import android.os.Build
import android.os.IBinder
import androidx.core.app.NotificationCompat
import com.family.guardian.R
import com.family.guardian.blocking.BlockPolicy
import com.family.guardian.blocking.SettingsCache
import com.family.guardian.data.DeviceHealth
import com.family.guardian.data.FirestoreRepository
import com.family.guardian.location.LocationReporter
import com.family.guardian.screentime.BedtimeEnforcer
import com.family.guardian.screentime.ScreenTimeManager
import com.family.guardian.ui.MainActivity
import com.family.guardian.util.Constants
import com.family.guardian.util.OemBatteryHelper
import com.family.guardian.util.SecureStore
import com.family.guardian.usage.UsageStatsReporter
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.Job
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.delay
import kotlinx.coroutines.isActive
import kotlinx.coroutines.launch

/**
 * The always-on heart of the child app. Runs as a typed foreground service with a
 * persistent, visible notification (transparency requirement) and drives a periodic loop:
 *   - report location on the parent-set interval
 *   - re-check bedtime / screen-time budget and enforce
 *   - report usage stats
 *   - write a health heartbeat the parent dashboard reads
 * WorkManager (GuardianWatchdogWorker) re-starts this service if the OS kills it.
 */
class GuardianForegroundService : Service() {

    private val scope = CoroutineScope(SupervisorJob() + Dispatchers.Default)
    private var loopJob: Job? = null

    override fun onCreate() {
        super.onCreate()
        startAsForeground()
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        if (loopJob?.isActive != true) loopJob = scope.launch { monitorLoop() }
        return START_STICKY // ask the OS to recreate us if killed
    }

    private fun startAsForeground() {
        val notification = buildNotification()
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.UPSIDE_DOWN_CAKE) {
            startForeground(
                Constants.ONGOING_NOTIFICATION_ID, notification,
                ServiceInfo.FOREGROUND_SERVICE_TYPE_LOCATION or
                    ServiceInfo.FOREGROUND_SERVICE_TYPE_SPECIAL_USE
            )
        } else {
            startForeground(Constants.ONGOING_NOTIFICATION_ID, notification)
        }
    }

    private fun buildNotification(): Notification {
        val open = PendingIntent.getActivity(
            this, 0, Intent(this, MainActivity::class.java),
            PendingIntent.FLAG_IMMUTABLE
        )
        return NotificationCompat.Builder(this, Constants.CHANNEL_MONITORING)
            .setSmallIcon(R.drawable.ic_shield)
            .setContentTitle(getString(R.string.monitoring_active_title))
            .setContentText(getString(R.string.monitoring_active_text))
            .setContentIntent(open)
            .setOngoing(true)
            .setShowWhen(false)
            .build()
    }

    private suspend fun monitorLoop() {
        val store = SecureStore(this)
        while (scope.isActive) {
            if (!store.isPaired) { delay(30_000); continue }
            val fam = store.familyId!!; val dev = store.deviceId!!
            val repo = FirestoreRepository(fam, dev)
            val settings = SettingsCache(this).get()

            runCatching { LocationReporter(this).reportOnce(onDemand = false) }
            runCatching { UsageStatsReporter(this).reportAll() }

            // Bedtime / budget enforcement.
            settings?.let { s ->
                val st = ScreenTimeManager(this)
                if (st.isInBedtime(s.bedtime)) {
                    BedtimeEnforcer(this).enforce(getString(R.string.bedtime_reason))
                } else if (st.isOverDailyBudget(s.screenTimeBudgetMin)) {
                    BedtimeEnforcer(this).enforce(getString(R.string.budget_reason), raiseAlert = true)
                }
            }

            runCatching { repo.updateHealth(collectHealth(store)) }

            val intervalMin = settings?.locationIntervalMin ?: Constants.DEFAULT_LOCATION_INTERVAL_MIN
            delay(intervalMin.coerceAtLeast(1) * 60_000)
        }
    }

    private fun collectHealth(store: SecureStore): DeviceHealth {
        val usage = UsageStatsReporter(this)
        return DeviceHealth(
            lastSeen = System.currentTimeMillis(),
            isDeviceOwner = com.family.guardian.blocking.DevicePolicyController(this).isDeviceOwner,
            foregroundServiceRunning = true,
            batteryUnrestricted = OemBatteryHelper.isIgnoringBatteryOptimizations(this),
            usageAccessGranted = usage.hasUsageAccess(),
            backgroundLocationGranted = hasBackgroundLocation()
        )
    }

    private fun hasBackgroundLocation(): Boolean =
        checkSelfPermission(android.Manifest.permission.ACCESS_BACKGROUND_LOCATION) ==
            android.content.pm.PackageManager.PERMISSION_GRANTED

    override fun onDestroy() {
        scope.coroutineContext[Job]?.cancel()
        // Ask WorkManager to bring us back if we were killed unexpectedly.
        com.family.guardian.work.GuardianWatchdogWorker.ensureScheduled(this)
        super.onDestroy()
    }

    override fun onBind(intent: Intent?): IBinder? = null

    companion object {
        fun start(context: Context) {
            val intent = Intent(context, GuardianForegroundService::class.java)
            context.startForegroundService(intent)
        }
    }
}
