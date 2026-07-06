package com.family.guardian

import android.app.Application
import android.app.NotificationChannel
import android.app.NotificationManager
import android.content.Context
import com.family.guardian.util.Constants

/**
 * Application entry point. Creates notification channels and holds process-wide
 * singletons. No analytics or ad SDKs are initialized here — none exist in this app.
 */
class GuardianApplication : Application() {

    override fun onCreate() {
        super.onCreate()
        createNotificationChannels()
    }

    private fun createNotificationChannels() {
        val nm = getSystemService(NotificationManager::class.java)

        // Low-importance, ongoing channel for the persistent monitoring notification.
        nm.createNotificationChannel(
            NotificationChannel(
                Constants.CHANNEL_MONITORING,
                getString(R.string.channel_monitoring),
                NotificationManager.IMPORTANCE_LOW
            ).apply { description = getString(R.string.channel_monitoring_desc) }
        )

        // High-importance channel for on-device notices (bedtime starting, blocked app).
        nm.createNotificationChannel(
            NotificationChannel(
                Constants.CHANNEL_NOTICES,
                getString(R.string.channel_notices),
                NotificationManager.IMPORTANCE_HIGH
            )
        )
    }

    companion object {
        fun from(context: Context) = context.applicationContext as GuardianApplication
    }
}
