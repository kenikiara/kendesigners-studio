package com.family.guardian.work

import android.content.Context
import androidx.work.Constraints
import androidx.work.CoroutineWorker
import androidx.work.ExistingPeriodicWorkPolicy
import androidx.work.PeriodicWorkRequestBuilder
import androidx.work.WorkManager
import androidx.work.WorkerParameters
import com.family.guardian.blocking.SettingsCache
import com.family.guardian.location.GeofenceManager
import com.family.guardian.service.GuardianForegroundService
import com.family.guardian.util.SecureStore
import java.util.concurrent.TimeUnit

/**
 * A periodic safety net. WorkManager persists across reboots and OEM kills, so every
 * ~15 minutes it (a) ensures the foreground service is running and (b) re-registers
 * geofences (some OEMs drop them after aggressive memory cleanup). This is what keeps
 * monitoring alive on "battery-killer" devices (see TROUBLESHOOTING.md).
 */
class GuardianWatchdogWorker(
    context: Context,
    params: WorkerParameters
) : CoroutineWorker(context, params) {

    override suspend fun doWork(): Result {
        val ctx = applicationContext
        val store = SecureStore(ctx)
        if (!store.isPaired) return Result.success()

        GuardianForegroundService.start(ctx)
        runCatching {
            val settings = SettingsCache(ctx).get()
            if (settings != null) GeofenceManager(ctx).register(settings.geofences)
        }
        return Result.success()
    }

    companion object {
        private const val NAME = "guardian_watchdog"

        fun ensureScheduled(context: Context) {
            val request = PeriodicWorkRequestBuilder<GuardianWatchdogWorker>(
                15, TimeUnit.MINUTES
            ).setConstraints(Constraints.NONE).build()

            WorkManager.getInstance(context).enqueueUniquePeriodicWork(
                NAME, ExistingPeriodicWorkPolicy.KEEP, request
            )
        }
    }
}
