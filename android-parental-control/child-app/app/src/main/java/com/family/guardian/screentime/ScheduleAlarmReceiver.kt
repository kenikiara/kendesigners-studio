package com.family.guardian.screentime

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import com.family.guardian.blocking.SettingsCache

/**
 * Fires at the start of a bedtime window (scheduled via AlarmManager) to enforce
 * bedtime even if the foreground-service loop is asleep. Re-arms itself for the next
 * window. Kept minimal; the loop in GuardianForegroundService is the primary path and
 * this is the belt-and-suspenders backup for exact-time bedtime start.
 */
class ScheduleAlarmReceiver : BroadcastReceiver() {

    override fun onReceive(context: Context, intent: Intent) {
        val settings = SettingsCache(context).get() ?: return
        val screenTime = ScreenTimeManager(context)
        if (screenTime.isInBedtime(settings.bedtime)) {
            BedtimeEnforcer(context).enforce(
                context.getString(com.family.guardian.R.string.bedtime_reason)
            )
        }
        BedtimeScheduler(context).scheduleNext(settings.bedtime)
    }
}
