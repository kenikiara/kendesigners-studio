package com.family.guardian.ui

import android.content.Intent
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.*
import androidx.compose.material3.Button
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import com.family.guardian.R

/**
 * The AccessibilityService fallback's block screen. Shown over a blocked / over-limit app
 * on devices where the app is NOT Device Owner (so we can't framework-suspend the app).
 * It sends the child back to the home screen and explains the reason.
 */
class BlockOverlayActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        val reason = intent.getStringExtra(EXTRA_REASON) ?: getString(R.string.blocked_generic)
        setContent { GuardianTheme { BlockContent(reason) } }
    }

    @Composable
    private fun BlockContent(reason: String) {
        Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
            Column(
                Modifier.padding(24.dp),
                horizontalAlignment = Alignment.CenterHorizontally,
                verticalArrangement = Arrangement.spacedBy(16.dp)
            ) {
                Text(getString(R.string.blocked_title), style = MaterialTheme.typography.headlineSmall)
                Text(reason, textAlign = TextAlign.Center)
                Button(onClick = { goHome() }) { Text(getString(R.string.blocked_ok)) }
            }
        }
    }

    private fun goHome() {
        startActivity(Intent(Intent.ACTION_MAIN).apply {
            addCategory(Intent.CATEGORY_HOME)
            flags = Intent.FLAG_ACTIVITY_NEW_TASK
        })
        finish()
    }

    @Deprecated("Intentional: block back so the child can't return to the blocked app")
    override fun onBackPressed() { goHome() }

    companion object {
        const val EXTRA_PACKAGE = "package"
        const val EXTRA_REASON = "reason"
    }
}
