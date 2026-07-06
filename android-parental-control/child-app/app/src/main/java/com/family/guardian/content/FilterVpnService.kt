package com.family.guardian.content

import android.app.Notification
import android.content.Context
import android.content.Intent
import android.net.VpnService
import android.os.ParcelFileDescriptor
import androidx.core.app.NotificationCompat
import com.family.guardian.R
import com.family.guardian.util.Constants
import java.net.DatagramPacket
import java.net.DatagramSocket
import java.nio.ByteBuffer
import kotlin.concurrent.thread

/**
 * OPTIONAL local content-filter VPN. This is a *local sink* VPN: it does NOT forward
 * traffic to any external server (no third-party analytics/ad relay — see SECURITY.md).
 * It inspects outbound DNS queries and refuses to resolve domains on the blocklist,
 * which prevents the browser/app from reaching them.
 *
 * NOTE: This is a deliberately simple, self-contained implementation intended as the
 * fallback filtering path. A production-grade VPN filter would parse full IP packets and
 * proxy allowed traffic; here we implement DNS-level blocking which covers the common
 * "block these sites" need with far less complexity. The Device-Owner Private DNS path
 * (ContentFilterController path 1) is preferred when available.
 */
class FilterVpnService : VpnService() {

    @Volatile private var running = false
    private var vpnInterface: ParcelFileDescriptor? = null

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        startForeground(FGS_ID, buildNotification())
        if (!running) { running = true; thread(name = "guardian-vpn") { runLoop() } }
        return START_STICKY
    }

    private fun buildNotification(): Notification =
        NotificationCompat.Builder(this, Constants.CHANNEL_MONITORING)
            .setSmallIcon(R.drawable.ic_shield)
            .setContentTitle(getString(R.string.vpn_filter_active))
            .setOngoing(true)
            .build()

    private fun runLoop() {
        val builder = Builder()
            .setSession("GuardianFilter")
            .addAddress("10.0.0.2", 32)
            .addDnsServer("10.0.0.1")     // route DNS to us
            .addRoute("10.0.0.1", 32)
        vpnInterface = builder.establish() ?: return

        val input = vpnInterface!!.fileDescriptor
        val stream = java.io.FileInputStream(input)
        val out = java.io.FileOutputStream(vpnInterface!!.fileDescriptor)
        val packet = ByteBuffer.allocate(32767)

        while (running) {
            val length = stream.read(packet.array())
            if (length <= 0) continue
            val domain = DnsPacket.extractQueryDomain(packet.array(), length)
            if (domain != null && isBlocked(domain)) {
                // Reply with NXDOMAIN-equivalent (drop) — the query never resolves.
                DnsPacket.writeBlockedResponse(packet.array(), length)?.let { out.write(it) }
            } else {
                forwardUpstream(packet.array(), length, out)
            }
            packet.clear()
        }
    }

    private fun forwardUpstream(data: ByteArray, length: Int, out: java.io.FileOutputStream) {
        // Forward the DNS query to a real resolver and write the answer back. The socket
        // is protect()ed so it does NOT loop back through the VPN.
        runCatching {
            DatagramSocket().use { socket ->
                protect(socket)
                val query = DnsPacket.payload(data, length)
                socket.send(DatagramPacket(query, query.size,
                    java.net.InetAddress.getByName(UPSTREAM_DNS), 53))
                val buf = ByteArray(1500)
                val resp = DatagramPacket(buf, buf.size)
                socket.receive(resp)
                DnsPacket.wrapResponse(data, length, buf, resp.length)?.let { out.write(it) }
            }
        }
    }

    private fun isBlocked(domain: String): Boolean =
        blocklist.any { domain == it || domain.endsWith(".$it") }

    override fun onDestroy() {
        running = false
        runCatching { vpnInterface?.close() }
        super.onDestroy()
    }

    companion object {
        private const val FGS_ID = 1002
        private const val UPSTREAM_DNS = "1.1.1.2" // Cloudflare malware-filtering resolver
        @Volatile private var blocklist: List<String> = emptyList()

        fun updateBlocklist(context: Context, domains: List<String>) { blocklist = domains }

        fun stop(context: Context) {
            context.stopService(Intent(context, FilterVpnService::class.java))
        }
    }
}
