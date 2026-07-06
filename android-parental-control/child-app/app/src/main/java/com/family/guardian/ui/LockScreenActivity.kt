package com.family.guardian.ui

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.*
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import com.family.guardian.R

/**
 * Full-screen "bedtime / locked" screen shown during downtime or when the screen-time
 * budget is used up. It always explains WHY (transparency). Back is disabled so the child
 * can't dismiss it; on Device Owner devices lockNow() also engages the real keyguard.
 */
class LockScreenActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        val reason = intent.getStringExtra(EXTRA_REASON) ?: getString(R.string.bedtime_reason)
        setContent { GuardianTheme { LockContent(reason) } }
    }

    @Composable
    private fun LockContent(reason: String) {
        Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
            Column(
                Modifier.padding(24.dp),
                horizontalAlignment = Alignment.CenterHorizontally,
                verticalArrangement = Arrangement.spacedBy(16.dp)
            ) {
                Text(getString(R.string.lock_title), style = MaterialTheme.typography.headlineMedium)
                Text(reason, textAlign = TextAlign.Center, style = MaterialTheme.typography.bodyLarge)
                Text(getString(R.string.lock_footer), textAlign = TextAlign.Center,
                    style = MaterialTheme.typography.bodyMedium)
            }
        }
    }

    // Swallow back so the lock can't be trivially dismissed.
    @Deprecated("Intentional: block back on the lock screen")
    override fun onBackPressed() { /* no-op */ }

    companion object { const val EXTRA_REASON = "reason" }
}
