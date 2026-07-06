package com.family.guardian.screentime

import android.content.Context
import android.content.Intent
import com.family.guardian.blocking.DevicePolicyController
import com.family.guardian.data.FirestoreRepository
import com.family.guardian.ui.LockScreenActivity
import com.family.guardian.util.Constants
import com.family.guardian.util.SecureStore
import kotlinx.coroutines.runBlocking

/**
 * Enforces bedtime / over-budget by (a) as Device Owner calling lockNow(), and
 * (b) always showing the full-screen LockScreenActivity "bedtime" screen so the child
 * sees why the phone is locked. Called from the foreground-service loop, from the
 * BEDTIME_NOW command, and from the schedule alarm.
 */
class BedtimeEnforcer(context: Context) {

    private val ctx = context.applicationContext
    private val dpc = DevicePolicyController(ctx)
    private val store = SecureStore(ctx)

    fun enforce(reason: String, raiseAlert: Boolean = false) {
        // Show the bedtime screen first so there is always a visible explanation.
        ctx.startActivity(Intent(ctx, LockScreenActivity::class.java).apply {
            addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK)
            putExtra(LockScreenActivity.EXTRA_REASON, reason)
        })
        // Then hard-lock via Device Owner where available.
        dpc.lockNow()

        if (raiseAlert) {
            val fam = store.familyId; val dev = store.deviceId
            if (fam != null && dev != null) {
                runCatching {
                    runBlocking {
                        FirestoreRepository(fam, dev).raiseAlert(
                            Constants.ALERT_SCREEN_LIMIT, reason
                        )
                    }
                }
            }
        }
    }
}
