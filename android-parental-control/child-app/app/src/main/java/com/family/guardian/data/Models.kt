package com.family.guardian.data

/**
 * Plain data models mirrored in Firestore. Field names match the documents described in
 * firebase/SCHEMA.md so (de)serialization is a direct mapping.
 */

/** Parent-controlled settings for a single child device. */
data class ChildSettings(
    val locationIntervalMin: Long = 15,
    val screenTimeBudgetMin: Int = 120,          // daily total budget
    val bedtime: BedtimeWindow? = null,
    val blockedApps: List<String> = emptyList(), // package names hidden/suspended
    val flaggedApps: List<String> = emptyList(), // alert when opened (not blocked)
    val appTimeLimits: Map<String, Int> = emptyMap(), // package -> minutes/day
    val geofences: List<Geofence> = emptyList(),
    val contentFilter: ContentFilter = ContentFilter(),
    val monitoringEnabled: Boolean = true
)

/** Bedtime/downtime window in local time; the phone locks to the bedtime screen. */
data class BedtimeWindow(
    val startHour: Int = 21, val startMinute: Int = 0,
    val endHour: Int = 7, val endMinute: Int = 0,
    val enabled: Boolean = true
)

data class Geofence(
    val id: String = "",
    val name: String = "",
    val latitude: Double = 0.0,
    val longitude: Double = 0.0,
    val radiusMeters: Float = 150f,
    val notifyOnEnter: Boolean = true,
    val notifyOnExit: Boolean = true
)

data class ContentFilter(
    val privateDnsHost: String? = null, // e.g. "family1.dns.cleanbrowsing.org" (Device Owner path)
    val useLocalVpn: Boolean = false,   // optional VpnService blocklist path
    val blockedDomains: List<String> = emptyList()
)

/** A single location report written by the child device. */
data class LocationReport(
    val latitude: Double = 0.0,
    val longitude: Double = 0.0,
    val accuracy: Float = 0f,
    val batteryPct: Int = -1,
    val timestamp: Long = 0L,
    val onDemand: Boolean = false
)

/** One app's usage for a day (epoch-day key). */
data class AppUsage(
    val packageName: String = "",
    val appLabel: String = "",
    val foregroundMs: Long = 0L,
    val epochDay: Long = 0L
)

/** Installed-app inventory entry. */
data class InstalledApp(
    val packageName: String = "",
    val label: String = "",
    val isSystem: Boolean = false,
    val blocked: Boolean = false
)

/** A pending remote command fetched from Firestore after an FCM ping. */
data class Command(
    val id: String = "",
    val verb: String = "",
    val arg: String? = null,
    val createdAt: Long = 0L,
    val ackAt: Long? = null
)

/** Device health/heartbeat the parent dashboard reads. */
data class DeviceHealth(
    val lastSeen: Long = 0L,
    val batteryPct: Int = -1,
    val isDeviceOwner: Boolean = false,
    val foregroundServiceRunning: Boolean = false,
    val batteryUnrestricted: Boolean = false,
    val backgroundLocationGranted: Boolean = false,
    val usageAccessGranted: Boolean = false
)
