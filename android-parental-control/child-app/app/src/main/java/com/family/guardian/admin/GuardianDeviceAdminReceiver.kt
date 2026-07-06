package com.family.guardian.admin

import android.app.admin.DeviceAdminReceiver
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import com.family.guardian.blocking.DevicePolicyController
import com.family.guardian.service.GuardianForegroundService

/**
 * Device Admin / Device Owner receiver. Android calls this when admin is enabled and,
 * for a fresh-device QR/afw# enrollment, when provisioning completes.
 */
class GuardianDeviceAdminReceiver : DeviceAdminReceiver() {

    override fun onEnabled(context: Context, intent: Intent) {
        super.onEnabled(context, intent)
        GuardianForegroundService.start(context)
    }

    /** Fired after DO provisioning from the setup wizard (QR / afw#). */
    override fun onProfileProvisioningComplete(context: Context, intent: Intent) {
        super.onProfileProvisioningComplete(context, intent)
        // Apply baseline device-owner hardening immediately, then start monitoring.
        DevicePolicyController(context).applyBaselinePolicies()
        GuardianForegroundService.start(context)
    }

    /**
     * If an admin somehow tries to disable Device Admin, warn. As Device Owner this
     * path is normally blocked, but the app also raises a monitoring_disabled alert
     * from its watchdog if enforcement is lost.
     */
    override fun onDisableRequested(context: Context, intent: Intent): CharSequence =
        "Disabling Family Guardian turns off the safety monitoring your parent set up."

    companion object {
        fun component(context: Context) =
            ComponentName(context, GuardianDeviceAdminReceiver::class.java)
    }
}
