package com.family.guardian.ui

import android.os.Bundle
import android.widget.Toast
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.camera.lifecycle.ProcessCameraProvider
import androidx.camera.core.CameraSelector
import androidx.camera.core.ImageAnalysis
import androidx.camera.core.Preview
import androidx.camera.view.PreviewView
import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.compose.ui.viewinterop.AndroidView
import androidx.core.content.ContextCompat
import com.family.guardian.R
import com.family.guardian.data.PairingManager
import com.family.guardian.service.GuardianForegroundService
import com.google.mlkit.vision.barcode.BarcodeScanning
import com.google.mlkit.vision.barcode.common.Barcode
import com.google.mlkit.vision.common.InputImage
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import java.util.concurrent.Executors

/**
 * Scans the parent dashboard's pairing QR with CameraX + ML Kit and completes pairing.
 * The camera runs only on this screen and only for pairing.
 */
class PairingActivity : ComponentActivity() {

    private val analysisExecutor = Executors.newSingleThreadExecutor()
    @Volatile private var handled = false

    private val requestCamera =
        registerForActivityResult(androidx.activity.result.contract.ActivityResultContracts.RequestPermission()) { granted ->
            if (!granted) {
                Toast.makeText(this, R.string.pair_camera_needed, Toast.LENGTH_LONG).show()
                finish()
            }
        }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        if (ContextCompat.checkSelfPermission(this, android.Manifest.permission.CAMERA)
            != android.content.pm.PackageManager.PERMISSION_GRANTED) {
            requestCamera.launch(android.Manifest.permission.CAMERA)
        }
        setContent { GuardianTheme { Scanner() } }
    }

    @Composable
    private fun Scanner() {
        Scaffold(topBar = { TopAppBar(title = { Text(getString(R.string.pair_scan)) }) }) { pad ->
            Column(Modifier.padding(pad).fillMaxSize()) {
                Text(getString(R.string.pair_scan_hint), Modifier.padding(16.dp))
                AndroidView(
                    modifier = Modifier.fillMaxSize(),
                    factory = { ctx ->
                        val previewView = PreviewView(ctx)
                        val future = ProcessCameraProvider.getInstance(ctx)
                        future.addListener({
                            bindCamera(future.get(), previewView)
                        }, ContextCompat.getMainExecutor(ctx))
                        previewView
                    }
                )
            }
        }
    }

    private fun bindCamera(provider: ProcessCameraProvider, previewView: PreviewView) {
        val preview = Preview.Builder().build().also { it.setSurfaceProvider(previewView.surfaceProvider) }
        val scanner = BarcodeScanning.getClient()
        val analysis = ImageAnalysis.Builder()
            .setBackpressureStrategy(ImageAnalysis.STRATEGY_KEEP_ONLY_LATEST)
            .build().also { ia ->
                ia.setAnalyzer(analysisExecutor) { proxy ->
                    val media = proxy.image
                    if (media == null) { proxy.close(); return@setAnalyzer }
                    val image = InputImage.fromMediaImage(media, proxy.imageInfo.rotationDegrees)
                    scanner.process(image)
                        .addOnSuccessListener { codes -> codes.firstOrNull()?.let { onQr(it) } }
                        .addOnCompleteListener { proxy.close() }
                }
            }
        provider.unbindAll()
        provider.bindToLifecycle(this, CameraSelector.DEFAULT_BACK_CAMERA, preview, analysis)
    }

    private fun onQr(code: Barcode) {
        val raw = code.rawValue ?: return
        if (handled) return
        val mgr = PairingManager(this)
        val payload = mgr.parseQr(raw) ?: return
        handled = true
        CoroutineScope(Dispatchers.IO).launch {
            val ok = mgr.pair(payload, deviceLabel = android.os.Build.MODEL)
            withContext(Dispatchers.Main) {
                if (ok) {
                    GuardianForegroundService.start(this@PairingActivity)
                    Toast.makeText(this@PairingActivity, R.string.pair_success, Toast.LENGTH_LONG).show()
                    finish()
                } else {
                    handled = false
                    Toast.makeText(this@PairingActivity, R.string.pair_failed, Toast.LENGTH_LONG).show()
                }
            }
        }
    }

    override fun onDestroy() { analysisExecutor.shutdown(); super.onDestroy() }
}
