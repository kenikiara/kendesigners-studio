package com.family.guardian.screentime

import android.app.AlarmManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import com.family.guardian.data.BedtimeWindow
import java.util.Calendar

/** Schedules an exact alarm for the next bedtime-window start. */
class BedtimeScheduler(context: Context) {

    private val ctx = context.applicationContext
    private val am = ctx.getSystemService(AlarmManager::class.java)

    private fun pendingIntent(): PendingIntent {
        val intent = Intent(ctx, ScheduleAlarmReceiver::class.java)
        return PendingIntent.getBroadcast(
            ctx, REQ, intent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )
    }

    fun scheduleNext(window: BedtimeWindow?) {
        val pi = pendingIntent()
        am.cancel(pi)
        if (window == null || !window.enabled) return

        val next = Calendar.getInstance().apply {
            set(Calendar.HOUR_OF_DAY, window.startHour)
            set(Calendar.MINUTE, window.startMinute)
            set(Calendar.SECOND, 0); set(Calendar.MILLISECOND, 0)
            if (before(Calendar.getInstance())) add(Calendar.DAY_OF_YEAR, 1)
        }
        // setAlarmClock survives Doze so bedtime starts on time.
        am.setAlarmClock(AlarmManager.AlarmClockInfo(next.timeInMillis, pi), pi)
    }

    private companion object { const val REQ = 5001 }
}
