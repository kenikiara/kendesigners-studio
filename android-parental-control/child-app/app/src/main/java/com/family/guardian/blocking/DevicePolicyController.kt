package com.family.guardian.blocking

import android.app.admin.DevicePolicyManager
import android.app.admin.FactoryResetProtectionPolicy
import android.content.ComponentName
import android.content.Context
import android.os.Build
import android.os.UserManager
import android.util.Log
import com.family.guardian.admin.GuardianDeviceAdminReceiver

/**
 * The PRIMARY enforcement mechanism. Wraps DevicePolicyManager and only acts when the
 * app is Device Owner. Every method is a no-op (logged) when not DO, so callers can
 * invoke them unconditionally and rely on the AccessibilityService fallback otherwise.
 *
 * Why Device Owner (vs. accessibility overlay)?
 *  - setApplicationHidden/setPackagesSuspended block apps at the framework level; the
 *    child cannot bypass them by dismissing an overlay quickly.
 *  - lockNow() is a real device lock, not a drawn screen.
 *  - Uninstall/factory-reset protection genuinely resists a determined minor.
 * The trade-off is that DO requires a factory reset to provision (see PROVISIONING.md).
 */
class DevicePolicyController(context: Context) {

    private val ctx = context.applicationContext
    private val dpm = ctx.getSystemService(DevicePolicyManager::class.java)
    private val admin: ComponentName = GuardianDeviceAdminReceiver.component(ctx)

    val isDeviceOwner: Boolean get() = dpm.isDeviceOwnerApp(ctx.packageName)

    /** Baseline hardening applied right after provisioning. */
    fun applyBaselinePolicies() {
        if (!isDeviceOwner) return
        // Prevent the child from removing the app or wiping the device to escape control.
        dpm.setUninstallBlocked(admin, ctx.packageName, true)
        addUserRestriction(UserManager.DISALLOW_FACTORY_RESET)
        addUserRestriction(UserManager.DISALLOW_ADD_USER)
        addUserRestriction(UserManager.DISALLOW_SAFE_BOOT) // no safe-boot bypass
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            try {
                dpm.setFactoryResetProtectionPolicy(
                    admin,
                    FactoryResetProtectionPolicy.Builder()
                        .setFactoryResetProtectionEnabled(true)
                        .build()
                )
            } catch (e: Exception) { Log.w(TAG, "FRP policy unsupported: ${e.message}") }
        }
    }

    // ---- App blocking -------------------------------------------------------

    /** Hide an app entirely (disappears from the launcher). */
    fun hideApp(pkg: String, hidden: Boolean) {
        if (!isDeviceOwner) { Log.i(TAG, "hideApp no-op (not DO): $pkg"); return }
        dpm.setApplicationHidden(admin, pkg, hidden)
    }

    /**
     * Suspend apps (visible but greyed out with a system "paused" dialog). Preferred for
     * time-limit enforcement because it's reversible instantly and less jarring than hide.
     */
    fun suspendApps(packages: List<String>, suspended: Boolean) {
        if (!isDeviceOwner) { Log.i(TAG, "suspendApps no-op (not DO)"); return }
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
            dpm.setPackagesSuspended(admin, packages.toTypedArray(), suspended)
        } else {
            packages.forEach { dpm.setApplicationHidden(admin, it, suspended) }
        }
    }

    // ---- Locking ------------------------------------------------------------

    /** Immediately lock the device (bedtime / remote lock). */
    fun lockNow() {
        if (isDeviceOwner) dpm.lockNow()
        // Fallback handled by caller (LockScreenActivity) when not DO.
    }

    // ---- Content filtering: Private DNS (Device Owner path) ------------------

    /**
     * Force a filtering DNS-over-TLS host device-wide (e.g. a family filter provider).
     * Trade-offs vs. the VpnService path:
     *  + System-level, low battery cost, encrypted (DoT), covers ALL apps.
     *  + Cannot be turned off by the child (locked by Device Owner).
     *  - Filtering granularity is whatever the DNS provider offers (category-based),
     *    not per-domain rules you define locally.
     *  - Requires Device Owner (API 29+).
     */
    fun setFilteringPrivateDns(host: String?): Boolean {
        if (!isDeviceOwner || Build.VERSION.SDK_INT < Build.VERSION_CODES.Q) return false
        return try {
            if (host.isNullOrBlank()) {
                dpm.setGlobalPrivateDnsModeOpportunistic(admin)
            } else {
                val result = dpm.setGlobalPrivateDnsModeSpecificHost(admin, host)
                result == DevicePolicyManager.PRIVATE_DNS_SET_NO_ERROR
            }
            true
        } catch (e: Exception) { Log.w(TAG, "Private DNS set failed: ${e.message}"); false }
    }

    // ---- Tamper resistance / cleanup ---------------------------------------

    private fun addUserRestriction(key: String) {
        if (isDeviceOwner) dpm.addUserRestriction(admin, key)
    }

    /** Called only after the parent account confirms unenrollment in-app. */
    fun relinquishDeviceOwner() {
        if (!isDeviceOwner) return
        dpm.setUninstallBlocked(admin, ctx.packageName, false)
        listOf(
            UserManager.DISALLOW_FACTORY_RESET,
            UserManager.DISALLOW_ADD_USER,
            UserManager.DISALLOW_SAFE_BOOT
        ).forEach { runCatching { dpm.clearUserRestriction(admin, it) } }
        dpm.clearDeviceOwnerApp(ctx.packageName)
    }

    private companion object { const val TAG = "DevicePolicyController" }
}
