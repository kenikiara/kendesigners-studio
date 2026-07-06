package com.family.guardian.fcm

import android.content.Context
import android.media.AudioManager
import android.media.RingtoneManager
import android.os.VibrationEffect
import android.os.Vibrator
import com.family.guardian.blocking.DevicePolicyController
import com.family.guardian.blocking.SettingsCache
import com.family.guardian.content.ContentFilterController
import com.family.guardian.location.GeofenceManager
import com.family.guardian.location.LocationReporter
import com.family.guardian.screentime.BedtimeEnforcer
import com.family.guardian.screentime.BedtimeScheduler
import com.family.guardian.util.Constants

/**
 * Executes a single remote command. Command verbs mirror Constants.CMD_*. Each command
 * is idempotent and safe to re-run (FCM may deliver more than once).
 */
class CommandExecutor(context: Context) {

    private val ctx = context.applicationContext
    private val dpc = DevicePolicyController(ctx)

    suspend fun execute(verb: String, arg: String?) {
        when (verb) {
            Constants.CMD_LOCK_NOW -> dpc.lockNow()

            Constants.CMD_UNLOCK -> {
                // Un-suspend everything and dismiss any block/bedtime screen.
                val settings = SettingsCache(ctx).refresh()
                settings?.blockedApps?.let { dpc.suspendApps(it, false) }
            }

            Constants.CMD_BLOCK_APP -> arg?.let { dpc.suspendApps(listOf(it), true) }
            Constants.CMD_UNBLOCK_APP -> arg?.let { dpc.suspendApps(listOf(it), false) }

            Constants.CMD_LOCATE_NOW -> LocationReporter(ctx).reportOnce(onDemand = true)

            Constants.CMD_RING -> ring()

            Constants.CMD_BEDTIME_NOW ->
                BedtimeEnforcer(ctx).enforce(ctx.getString(com.family.guardian.R.string.bedtime_reason))

            Constants.CMD_END_BEDTIME -> {
                // Nothing to unlock at the framework level; screen unlocks normally and the
                // loop won't re-lock because we clear the manual flag.
                BedtimeScheduler(ctx).scheduleNext(SettingsCache(ctx).refresh()?.bedtime)
            }

            Constants.CMD_REFRESH_SETTINGS -> applyAllSettings()
        }
    }

    /** Re-read settings and (re)apply blocks, geofences, content filter, and bedtime. */
    private suspend fun applyAllSettings() {
        val settings = SettingsCache(ctx).refresh() ?: return
        dpc.suspendApps(settings.blockedApps, true)
        GeofenceManager(ctx).register(settings.geofences)
        ContentFilterController(ctx).apply(settings.contentFilter)
        BedtimeScheduler(ctx).scheduleNext(settings.bedtime)
    }

    private fun ring() {
        // Play the default alarm at full volume and vibrate so the child can find the phone.
        val audio = ctx.getSystemService(AudioManager::class.java)
        audio.setStreamVolume(
            AudioManager.STREAM_ALARM,
            audio.getStreamMaxVolume(AudioManager.STREAM_ALARM),
            0
        )
        val uri = RingtoneManager.getDefaultUri(RingtoneManager.TYPE_ALARM)
        RingtoneManager.getRingtone(ctx, uri)?.play()
        ctx.getSystemService(Vibrator::class.java)?.vibrate(
            VibrationEffect.createWaveform(longArrayOf(0, 800, 400, 800, 400, 800), 0)
        )
    }
}
