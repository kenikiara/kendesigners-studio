package com.family.guardian.blocking

import android.content.Context
import com.family.guardian.data.ChildSettings
import com.family.guardian.data.FirestoreRepository
import com.family.guardian.util.SecureStore
import kotlinx.coroutines.runBlocking

/**
 * A tiny in-memory + Firestore-backed cache of the current ChildSettings. The
 * AccessibilityService path needs a fast, synchronous read on every window change, so
 * we cache the last fetched settings and refresh on a REFRESH_SETTINGS command or on a
 * short TTL. (Firestore also has an offline cache; this avoids per-event awaits.)
 */
class SettingsCache(context: Context) {

    private val store = SecureStore(context.applicationContext)

    fun get(): ChildSettings? {
        cached?.let { if (System.currentTimeMillis() - fetchedAt < TTL_MS) return it }
        return refresh()
    }

    fun refresh(): ChildSettings? {
        val fam = store.familyId ?: return cached
        val dev = store.deviceId ?: return cached
        return runCatching {
            runBlocking { FirestoreRepository(fam, dev).fetchSettings() }
        }.getOrNull()?.also {
            cached = it
            fetchedAt = System.currentTimeMillis()
        } ?: cached
    }

    companion object {
        private const val TTL_MS = 60_000L
        @Volatile private var cached: ChildSettings? = null
        @Volatile private var fetchedAt: Long = 0L
    }
}
