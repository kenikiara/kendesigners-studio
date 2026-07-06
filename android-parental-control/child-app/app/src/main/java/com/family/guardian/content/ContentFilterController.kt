package com.family.guardian.content

import android.content.Context
import android.content.Intent
import com.family.guardian.blocking.DevicePolicyController
import com.family.guardian.data.ContentFilter

/**
 * Applies the parent's content-filtering choice. Two mechanisms, each with trade-offs:
 *
 * 1) FILTERING PRIVATE DNS (preferred, requires Device Owner)
 *    - Sets a device-wide DNS-over-TLS host (e.g. a family-filtering resolver such as
 *      CleanBrowsing/OpenDNS Family/AdGuard Family). The resolver enforces SafeSearch
 *      and blocks adult/malware categories for EVERY app and browser.
 *    + Encrypted (DoT), negligible battery, cannot be disabled by the child (DO-locked).
 *    + Also forces SafeSearch on Google/Bing/YouTube when the resolver rewrites those.
 *    - Category granularity is the provider's; you don't define per-domain rules.
 *    - DNS filtering can be bypassed by apps that hardcode their own DNS/DoH — rare on a
 *      normal child's phone, and blockable via the VPN path below if needed.
 *
 * 2) LOCAL VpnService BLOCKLIST (optional, no Device Owner needed)
 *    - Captures all traffic locally and drops connections to a domain/category blocklist
 *      you control. Lets you add specific domains the DNS provider misses.
 *    + Works without Device Owner; fully local (no traffic leaves the device via us).
 *    - Uses the single "VPN slot", so it conflicts with a real VPN the family may use.
 *    - Higher battery cost; the child can be prompted by the system VPN dialog and, if
 *      not Device Owner, could revoke it (we re-request and alert if they do).
 *
 * The parent may enable either or both. When both are on, DNS does the heavy lifting and
 * the VPN adds custom per-domain blocks.
 */
class ContentFilterController(context: Context) {

    private val ctx = context.applicationContext
    private val dpc = DevicePolicyController(ctx)

    fun apply(filter: ContentFilter) {
        // Path 1: Private DNS via Device Owner.
        if (dpc.isDeviceOwner) {
            dpc.setFilteringPrivateDns(filter.privateDnsHost)
        }

        // Path 2: optional local VPN blocklist.
        if (filter.useLocalVpn && filter.blockedDomains.isNotEmpty()) {
            FilterVpnService.updateBlocklist(ctx, filter.blockedDomains)
            startVpnIfPrepared()
        } else {
            FilterVpnService.stop(ctx)
        }
    }

    private fun startVpnIfPrepared() {
        // VpnService.prepare returns null if already authorized. When not Device Owner and
        // not yet authorized, the onboarding UI must call prepare() and show the system
        // consent dialog; here we just (re)start if consent already exists.
        if (android.net.VpnService.prepare(ctx) == null) {
            ctx.startForegroundService(Intent(ctx, FilterVpnService::class.java))
        }
    }
}
