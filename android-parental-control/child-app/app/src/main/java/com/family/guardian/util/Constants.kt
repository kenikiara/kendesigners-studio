package com.family.guardian.util

/** Shared constants: notification channels, Firestore paths, and FCM command keys. */
object Constants {
    const val CHANNEL_MONITORING = "guardian_monitoring"
    const val CHANNEL_NOTICES = "guardian_notices"

    const val ONGOING_NOTIFICATION_ID = 1001

    // ---- Firestore top-level collections (see firebase/SCHEMA.md) ----
    const val COL_FAMILIES = "families"
    const val COL_DEVICES = "childDevices"
    const val COL_SETTINGS = "settings"
    const val COL_LOCATIONS = "locationHistory"
    const val COL_USAGE = "usageStats"
    const val COL_ALERTS = "alerts"
    const val COL_COMMANDS = "commands"

    // ---- FCM data-message keys ----
    const val FCM_COMMAND = "command"          // e.g. LOCK_NOW, LOCATE_NOW ...
    const val FCM_COMMAND_ID = "commandId"     // Firestore doc id to fetch/ack
    const val FCM_ARG = "arg"                  // optional (e.g. package name)

    // ---- Remote command verbs ----
    const val CMD_LOCK_NOW = "LOCK_NOW"
    const val CMD_UNLOCK = "UNLOCK"
    const val CMD_BLOCK_APP = "BLOCK_APP"
    const val CMD_UNBLOCK_APP = "UNBLOCK_APP"
    const val CMD_LOCATE_NOW = "LOCATE_NOW"
    const val CMD_RING = "RING"
    const val CMD_BEDTIME_NOW = "BEDTIME_NOW"
    const val CMD_END_BEDTIME = "END_BEDTIME"
    const val CMD_REFRESH_SETTINGS = "REFRESH_SETTINGS"

    // ---- Alert types (mirrored in Cloud Functions) ----
    const val ALERT_GEOFENCE_ENTER = "geofence_enter"
    const val ALERT_GEOFENCE_EXIT = "geofence_exit"
    const val ALERT_FLAGGED_APP = "flagged_app_opened"
    const val ALERT_SCREEN_LIMIT = "screen_time_limit"
    const val ALERT_MONITORING_DISABLED = "monitoring_disabled"

    // Default cadence for periodic location reporting (minutes). Parent-adjustable.
    const val DEFAULT_LOCATION_INTERVAL_MIN = 15L
}
