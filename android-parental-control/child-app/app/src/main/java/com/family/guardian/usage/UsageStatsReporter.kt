package com.family.guardian.usage

import android.app.AppOpsManager
import android.app.usage.UsageStatsManager
import android.content.Context
import android.content.Intent
import android.content.pm.ApplicationInfo
import android.content.pm.PackageManager
import android.os.Process
import android.provider.Settings
import com.family.guardian.data.AppUsage
import com.family.guardian.data.FirestoreRepository
import com.family.guardian.data.InstalledApp
import com.family.guardian.util.SecureStore
import java.time.LocalDate
import java.time.ZoneId
import java.util.Calendar

/**
 * Reports the installed-app inventory and per-app foreground time using
 * UsageStatsManager. PACKAGE_USAGE_STATS is a SPECIAL access granted in
 * Settings → Usage access; hasUsageAccess() checks it and openUsageAccessSettings()
 * deep-links the child/parent to grant it during onboarding.
 */
class UsageStatsReporter(context: Context) {

    private val ctx = context.applicationContext
    private val usm = ctx.getSystemService(UsageStatsManager::class.java)
    private val pm = ctx.packageManager
    private val store = SecureStore(ctx)

    fun hasUsageAccess(): Boolean {
        val appOps = ctx.getSystemService(AppOpsManager::class.java)
        val mode = appOps.unsafeCheckOpNoThrow(
            AppOpsManager.OPSTR_GET_USAGE_STATS, Process.myUid(), ctx.packageName
        )
        return mode == AppOpsManager.MODE_ALLOWED
    }

    fun openUsageAccessSettings() {
        ctx.startActivity(Intent(Settings.ACTION_USAGE_ACCESS_SETTINGS)
            .addFlags(Intent.FLAG_ACTIVITY_NEW_TASK))
    }

    /** Foreground minutes for one package since local midnight today. */
    fun foregroundMinutesToday(pkg: String): Int {
        val start = startOfTodayMillis()
        val stats = usm.queryUsageStats(
            UsageStatsManager.INTERVAL_DAILY, start, System.currentTimeMillis()
        ) ?: return 0
        val ms = stats.filter { it.packageName == pkg }.sumOf { it.totalTimeInForeground }
        return (ms / 60_000).toInt()
    }

    fun installedApps(): List<InstalledApp> {
        val flags = PackageManager.GET_META_DATA
        return pm.getInstalledApplications(flags).map { info ->
            InstalledApp(
                packageName = info.packageName,
                label = pm.getApplicationLabel(info).toString(),
                isSystem = (info.flags and ApplicationInfo.FLAG_SYSTEM) != 0
            )
        }.sortedBy { it.label.lowercase() }
    }

    /** Per-app usage for the given epoch day (defaults to today). */
    fun dailyUsage(epochDay: Long = LocalDate.now().toEpochDay()): List<AppUsage> {
        val date = LocalDate.ofEpochDay(epochDay)
        val zone = ZoneId.systemDefault()
        val start = date.atStartOfDay(zone).toInstant().toEpochMilli()
        val end = date.plusDays(1).atStartOfDay(zone).toInstant().toEpochMilli()

        val stats = usm.queryUsageStats(UsageStatsManager.INTERVAL_DAILY, start, end) ?: return emptyList()
        return stats
            .filter { it.totalTimeInForeground > 0 }
            .groupBy { it.packageName }
            .map { (pkg, list) ->
                AppUsage(
                    packageName = pkg,
                    appLabel = labelFor(pkg),
                    foregroundMs = list.sumOf { it.totalTimeInForeground },
                    epochDay = epochDay
                )
            }
    }

    suspend fun reportAll() {
        val fam = store.familyId ?: return
        val dev = store.deviceId ?: return
        val repo = FirestoreRepository(fam, dev)
        repo.reportInstalledApps(installedApps())
        val usage = dailyUsage()
        if (usage.isNotEmpty()) repo.reportUsage(usage)
    }

    private fun labelFor(pkg: String): String = runCatching {
        pm.getApplicationLabel(pm.getApplicationInfo(pkg, 0)).toString()
    }.getOrDefault(pkg)

    private fun startOfTodayMillis(): Long = Calendar.getInstance().apply {
        set(Calendar.HOUR_OF_DAY, 0); set(Calendar.MINUTE, 0)
        set(Calendar.SECOND, 0); set(Calendar.MILLISECOND, 0)
    }.timeInMillis
}
