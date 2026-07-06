package com.family.guardian.boot

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import com.family.guardian.service.GuardianForegroundService
import com.family.guardian.work.GuardianWatchdogWorker

/**
 * Restarts monitoring after a reboot or an app update. Handles both BOOT_COMPLETED and
 * LOCKED_BOOT_COMPLETED (direct-boot) so we come up as early as possible, plus
 * MY_PACKAGE_REPLACED so an update doesn't leave monitoring stopped.
 */
class BootReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) {
        when (intent.action) {
            Intent.ACTION_BOOT_COMPLETED,
            Intent.ACTION_LOCKED_BOOT_COMPLETED,
            Intent.ACTION_MY_PACKAGE_REPLACED -> {
                GuardianForegroundService.start(context)
                GuardianWatchdogWorker.ensureScheduled(context)
            }
        }
    }
}
