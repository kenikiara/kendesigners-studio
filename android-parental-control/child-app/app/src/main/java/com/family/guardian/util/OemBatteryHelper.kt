package com.family.guardian.util

import android.content.Context
import android.content.Intent
import android.net.Uri
import android.os.Build
import android.os.PowerManager
import android.provider.Settings

/**
 * Helpers to (a) check whether the app is exempt from battery optimization and
 * (b) deep-link the child/parent into the OEM-specific auto-start / battery pages that
 * kill background apps. See TROUBLESHOOTING.md for the manual steps these open.
 */
object OemBatteryHelper {

    fun isIgnoringBatteryOptimizations(context: Context): Boolean {
        val pm = context.getSystemService(PowerManager::class.java)
        return pm.isIgnoringBatteryOptimizations(context.packageName)
    }

    /** System dialog asking to ignore battery optimization for this app. */
    fun requestIgnoreBatteryOptimizations(context: Context) {
        val intent = Intent(Settings.ACTION_REQUEST_IGNORE_BATTERY_OPTIMIZATIONS).apply {
            data = Uri.parse("package:${context.packageName}")
            addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        }
        context.startActivity(intent)
    }

    /**
     * Best-effort deep link to the OEM auto-start manager. These component names are
     * unofficial and change between versions, so every launch is wrapped in try/catch
     * and falls back to the app's own settings page.
     */
    fun openOemAutoStartSettings(context: Context) {
        val candidates = listOf(
            // Xiaomi / MIUI
            "com.miui.securitycenter" to "com.miui.permcenter.autostart.AutoStartManagementActivity",
            // Huawei
            "com.huawei.systemmanager" to "com.huawei.systemmanager.startupmgr.ui.StartupNormalAppListActivity",
            // OPPO / ColorOS
            "com.coloros.safecenter" to "com.coloros.safecenter.permission.startup.StartupAppListActivity",
            // Vivo
            "com.vivo.permissionmanager" to "com.vivo.permissionmanager.activity.BgStartUpManagerActivity",
            // Letv/others omitted for brevity
        )
        for ((pkg, cls) in candidates) {
            try {
                context.startActivity(Intent().apply {
                    setClassName(pkg, cls)
                    addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                })
                return
            } catch (_: Exception) { /* try next */ }
        }
        openAppDetailsSettings(context)
    }

    fun openAppDetailsSettings(context: Context) {
        context.startActivity(Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS).apply {
            data = Uri.parse("package:${context.packageName}")
            addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        })
    }

    val manufacturer: String get() = Build.MANUFACTURER.lowercase()
}
