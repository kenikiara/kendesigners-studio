package com.family.guardian.ui

import android.Manifest
import android.os.Build
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.family.guardian.R
import com.family.guardian.service.GuardianForegroundService
import com.family.guardian.usage.UsageStatsReporter
import com.family.guardian.util.OemBatteryHelper
import com.family.guardian.util.SecureStore
import com.family.guardian.work.GuardianWatchdogWorker

/**
 * The VISIBLE child-facing screen (transparency requirement). It plainly tells the child
 * what is being monitored, shows the pairing state, and walks through the permissions the
 * app needs. Nothing here is hidden — this is intentional and disclosed.
 */
class MainActivity : ComponentActivity() {

    private val requestPermissions =
        registerForActivityResult(ActivityResultContracts.RequestMultiplePermissions()) { }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent { GuardianTheme { HomeScreen() } }
        GuardianWatchdogWorker.ensureScheduled(this)
    }

    @Composable
    private fun HomeScreen() {
        val store = remember { SecureStore(this) }
        var paired by remember { mutableStateOf(store.isPaired) }

        Scaffold(topBar = { TopAppBar(title = { Text(getString(R.string.app_name)) }) }) { pad ->
            Column(
                Modifier.padding(pad).padding(16.dp).verticalScroll(rememberScrollState()),
                verticalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                TransparencyCard()

                if (!paired) {
                    PairingCard(onPaired = {
                        paired = true
                        GuardianForegroundService.start(this@MainActivity)
                    })
                } else {
                    PairedCard()
                    PermissionsCard()
                }
            }
        }
    }

    @Composable
    private fun TransparencyCard() = Card {
        Column(Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
            Text(getString(R.string.transparency_title), style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.Bold)
            Text(getString(R.string.transparency_body))
        }
    }

    @Composable
    private fun PairingCard(onPaired: () -> Unit) = Card {
        Column(Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
            Text(getString(R.string.pair_title), style = MaterialTheme.typography.titleMedium)
            Text(getString(R.string.pair_body))
            Button(onClick = {
                startActivity(android.content.Intent(this@MainActivity, PairingActivity::class.java))
            }) { Text(getString(R.string.pair_scan)) }
        }
    }

    @Composable
    private fun PairedCard() = Card {
        Column(Modifier.padding(16.dp)) {
            Text(getString(R.string.paired_title), style = MaterialTheme.typography.titleMedium)
            Text(getString(R.string.paired_body))
        }
    }

    @Composable
    private fun PermissionsCard() = Card {
        Column(Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
            Text(getString(R.string.perm_title), style = MaterialTheme.typography.titleMedium)

            Button(onClick = { requestForeground() }) { Text(getString(R.string.perm_location)) }
            Button(onClick = { requestBackgroundLocation() }) { Text(getString(R.string.perm_bg_location)) }
            Button(onClick = { UsageStatsReporter(this@MainActivity).openUsageAccessSettings() }) {
                Text(getString(R.string.perm_usage))
            }
            Button(onClick = { OemBatteryHelper.requestIgnoreBatteryOptimizations(this@MainActivity) }) {
                Text(getString(R.string.perm_battery))
            }
            Button(onClick = { OemBatteryHelper.openOemAutoStartSettings(this@MainActivity) }) {
                Text(getString(R.string.perm_autostart))
            }
        }
    }

    private fun requestForeground() {
        val perms = mutableListOf(
            Manifest.permission.ACCESS_FINE_LOCATION,
            Manifest.permission.ACCESS_COARSE_LOCATION
        )
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            perms += Manifest.permission.POST_NOTIFICATIONS
        }
        requestPermissions.launch(perms.toTypedArray())
    }

    private fun requestBackgroundLocation() {
        // Must be requested AFTER foreground location is granted (Android 11+ rule).
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            requestPermissions.launch(arrayOf(Manifest.permission.ACCESS_BACKGROUND_LOCATION))
        }
    }
}
