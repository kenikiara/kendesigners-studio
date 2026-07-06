package com.family.guardian.screentime

import android.app.usage.UsageStatsManager
import android.content.Context
import com.family.guardian.data.BedtimeWindow
import java.util.Calendar

/**
 * Computes whether the child is currently in bedtime/downtime or over the daily
 * screen-time budget. "Screen-time used" = total device foreground time today, derived
 * from UsageStatsManager so it survives reboots and app restarts (no fragile counters).
 */
class ScreenTimeManager(context: Context) {

    private val ctx = context.applicationContext
    private val usm = ctx.getSystemService(UsageStatsManager::class.java)

    fun isInBedtime(window: BedtimeWindow?): Boolean {
        if (window == null || !window.enabled) return false
        val now = Calendar.getInstance()
        val minutesNow = now.get(Calendar.HOUR_OF_DAY) * 60 + now.get(Calendar.MINUTE)
        val start = window.startHour * 60 + window.startMinute
        val end = window.endHour * 60 + window.endMinute
        return if (start <= end) {
            minutesNow in start until end
        } else {
            // Window crosses midnight (e.g. 21:00 -> 07:00).
            minutesNow >= start || minutesNow < end
        }
    }

    /** Total foreground device use today, in minutes (excludes this app's own screens). */
    fun screenMinutesUsedToday(): Int {
        val start = startOfTodayMillis()
        val stats = usm.queryUsageStats(
            UsageStatsManager.INTERVAL_DAILY, start, System.currentTimeMillis()
        ) ?: return 0
        val ms = stats
            .filter { it.packageName != ctx.packageName }
            .sumOf { it.totalTimeInForeground }
        return (ms / 60_000).toInt()
    }

    fun isOverDailyBudget(budgetMinutes: Int): Boolean =
        budgetMinutes in 1..screenMinutesUsedToday()

    private fun startOfTodayMillis(): Long = Calendar.getInstance().apply {
        set(Calendar.HOUR_OF_DAY, 0); set(Calendar.MINUTE, 0)
        set(Calendar.SECOND, 0); set(Calendar.MILLISECOND, 0)
    }.timeInMillis
}
