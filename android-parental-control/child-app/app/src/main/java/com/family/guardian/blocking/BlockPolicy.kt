package com.family.guardian.blocking

import android.content.Context
import com.family.guardian.data.ChildSettings
import com.family.guardian.data.FirestoreRepository
import com.family.guardian.screentime.ScreenTimeManager
import com.family.guardian.usage.UsageStatsReporter
import com.family.guardian.util.Constants
import com.family.guardian.util.SecureStore

/**
 * Shared decision logic for "should this foreground app be blocked / flagged right now".
 * Used by both the AccessibilityService fallback and periodic enforcement so the two
 * paths never disagree. Reads the cached ChildSettings (refreshed from Firestore).
 */
class BlockPolicy(context: Context) {

    private val ctx = context.applicationContext
    private val store = SecureStore(ctx)
    private val settingsCache = SettingsCache(ctx)
    private val usage = UsageStatsReporter(ctx)
    private val screenTime = ScreenTimeManager(ctx)

    sealed interface Decision {
        data object Allow : Decision
        data class Block(val reason: String) : Decision
        data object Flag : Decision
    }

    fun evaluateForeground(pkg: String): Decision {
        val settings: ChildSettings = settingsCache.get() ?: return Decision.Allow

        if (pkg in settings.blockedApps) return Decision.Block("This app is blocked by your parent.")

        // Per-app daily time limit.
        settings.appTimeLimits[pkg]?.let { limitMin ->
            val usedMin = usage.foregroundMinutesToday(pkg)
            if (usedMin >= limitMin) return Decision.Block("Daily time limit for this app is up.")
        }

        // Overall screen-time budget and bedtime.
        if (screenTime.isInBedtime(settings.bedtime)) return Decision.Block("It's bedtime.")
        if (screenTime.isOverDailyBudget(settings.screenTimeBudgetMin))
            return Decision.Block("Today's screen-time budget is used up.")

        if (pkg in settings.flaggedApps) return Decision.Flag
        return Decision.Allow
    }

    suspend fun raiseFlaggedAppAlert(pkg: String) {
        val fam = store.familyId ?: return
        val dev = store.deviceId ?: return
        FirestoreRepository(fam, dev).raiseAlert(
            Constants.ALERT_FLAGGED_APP,
            "Opened a flagged app.",
            extra = mapOf("package" to pkg)
        )
    }
}
