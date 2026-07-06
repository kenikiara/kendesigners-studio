package com.family.guardian.content

/**
 * Minimal DNS parsing helpers for FilterVpnService. This is intentionally lightweight:
 * it extracts the queried domain name from a DNS query so the VPN can decide whether to
 * block it, and builds pass-through / blocked responses. It is NOT a full IP/UDP stack —
 * see the note in FilterVpnService about the Private DNS path being preferred.
 *
 * Packet layout coming off the TUN interface here is an IPv4 header + UDP header + DNS
 * message. We locate the DNS payload by fixed offsets (20-byte IP header + 8-byte UDP).
 */
object DnsPacket {

    private const val IP_HEADER = 20
    private const val UDP_HEADER = 8
    private const val DNS_OFFSET = IP_HEADER + UDP_HEADER
    private const val DNS_HEADER = 12

    /** Returns the lowercased query name (e.g. "ads.example.com") or null. */
    fun extractQueryDomain(data: ByteArray, length: Int): String? {
        val start = DNS_OFFSET + DNS_HEADER
        if (start >= length) return null
        val sb = StringBuilder()
        var i = start
        while (i < length) {
            val len = data[i].toInt() and 0xFF
            if (len == 0) break
            if (sb.isNotEmpty()) sb.append('.')
            for (j in 1..len) {
                if (i + j >= length) return null
                sb.append((data[i + j].toInt() and 0xFF).toChar())
            }
            i += len + 1
        }
        return sb.toString().lowercase().ifEmpty { null }
    }

    /** The raw DNS message bytes (strip IP+UDP headers) to forward upstream. */
    fun payload(data: ByteArray, length: Int): ByteArray =
        data.copyOfRange(DNS_OFFSET, length)

    /**
     * Build a response for a blocked domain: reuse the request, set the QR (response) bit
     * and RCODE=3 (NXDOMAIN) so the client treats it as "does not exist".
     */
    fun writeBlockedResponse(data: ByteArray, length: Int): ByteArray? {
        if (length < DNS_OFFSET + 4) return null
        val resp = data.copyOf(length)
        // Swap src/dst so it returns to the app (handled by the TUN write path in practice).
        resp[DNS_OFFSET + 2] = (resp[DNS_OFFSET + 2].toInt() or 0x80).toByte() // QR=1
        resp[DNS_OFFSET + 3] = (resp[DNS_OFFSET + 3].toInt() and 0xF0 or 0x03).toByte() // RCODE=3
        return resp
    }

    /** Wrap an upstream DNS answer back into a packet for the TUN interface. */
    fun wrapResponse(request: ByteArray, reqLen: Int, answer: ByteArray, ansLen: Int): ByteArray? {
        // For brevity we return the DNS answer prefixed with the original IP/UDP header
        // region from the request. A production impl recomputes IP/UDP checksums here.
        val header = request.copyOfRange(0, DNS_OFFSET)
        return header + answer.copyOf(ansLen)
    }
}
