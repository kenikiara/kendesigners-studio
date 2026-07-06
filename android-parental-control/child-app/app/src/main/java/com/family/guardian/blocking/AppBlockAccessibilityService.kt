package com.family.guardian.blocking

import android.accessibilityservice.AccessibilityService
import android.content.Intent
import android.view.accessibility.AccessibilityEvent
import com.family.guardian.data.FirestoreRepository
import com.family.guardian.ui.BlockOverlayActivity
import com.family.guardian.util.Constants
import com.family.guardian.util.SecureStore
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.launch

/**
 * FALLBACK blocking for devices where the app is NOT Device Owner.
 *
 * It observes window state changes to learn the current foreground package. If that
 * package is on the block list (or over its time limit), it launches a full-screen
 * BlockOverlayActivity that covers the app until the child navigates away.
 *
 * Trade-offs vs. Device Owner:
 *  - An overlay can be dismissed faster than a framework suspend; a determined child
 *    can flick between apps. It's a deterrent, not a hard wall.
 *  - Requires the child to leave accessibility enabled; if they turn it off we raise a
 *    monitoring_disabled alert (see BlockPolicy.watch()).
 *  + Works with a plain sideloaded install, no factory reset.
 *
 * It is also the cheapest way to detect "flagged app opened" for alerts, and to notice
 * the moment a per-app time limit is exceeded, regardless of Device Owner status.
 */
class AppBlockAccessibilityService : AccessibilityService() {

    private val scope = CoroutineScope(SupervisorJob() + Dispatchers.Default)
    private lateinit var policy: BlockPolicy
    private var lastForegroundPkg: String? = null

    override fun onServiceConnected() {
        super.onServiceConnected()
        policy = BlockPolicy(applicationContext)
    }

    override fun onAccessibilityEvent(event: AccessibilityEvent?) {
        if (event?.eventType != AccessibilityEvent.TYPE_WINDOW_STATE_CHANGED) return
        val pkg = event.packageName?.toString() ?: return
        if (pkg == packageName || pkg == lastForegroundPkg) return
        lastForegroundPkg = pkg

        scope.launch {
            val decision = policy.evaluateForeground(pkg)
            when (decision) {
                is BlockPolicy.Decision.Block -> showOverlay(pkg, decision.reason)
                is BlockPolicy.Decision.Flag -> policy.raiseFlaggedAppAlert(pkg)
                BlockPolicy.Decision.Allow -> Unit
            }
        }
    }

    private fun showOverlay(pkg: String, reason: String) {
        startActivity(Intent(this, BlockOverlayActivity::class.java).apply {
            addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK)
            putExtra(BlockOverlayActivity.EXTRA_PACKAGE, pkg)
            putExtra(BlockOverlayActivity.EXTRA_REASON, reason)
        })
    }

    override fun onInterrupt() {}

    override fun onUnbind(intent: Intent?): Boolean {
        // The child turned accessibility off — tell the parent (best effort).
        val store = SecureStore(applicationContext)
        val fam = store.familyId; val dev = store.deviceId
        if (fam != null && dev != null) {
            scope.launch {
                runCatching {
                    FirestoreRepository(fam, dev).raiseAlert(
                        Constants.ALERT_MONITORING_DISABLED,
                        "The app-blocking accessibility service was turned off."
                    )
                }
            }
        }
        return super.onUnbind(intent)
    }
}
