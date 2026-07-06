package com.family.guardian.util

import android.content.Context
import android.content.SharedPreferences
import androidx.security.crypto.EncryptedSharedPreferences
import androidx.security.crypto.MasterKey

/**
 * Encrypted local storage for device-scoped secrets: the family id, child device id,
 * and the pairing token. Backed by AES-256 keys held in the Android Keystore (StrongBox
 * where available) via Jetpack Security. Nothing sensitive is written to plain prefs.
 */
class SecureStore(context: Context) {

    private val prefs: SharedPreferences = run {
        val masterKey = MasterKey.Builder(context)
            .setKeyScheme(MasterKey.KeyScheme.AES256_GCM)
            .build()
        EncryptedSharedPreferences.create(
            context,
            "guardian_secure",
            masterKey,
            EncryptedSharedPreferences.PrefKeyEncryptionScheme.AES256_SIV,
            EncryptedSharedPreferences.PrefValueEncryptionScheme.AES256_GCM
        )
    }

    var familyId: String?
        get() = prefs.getString(KEY_FAMILY, null)
        set(v) = prefs.edit().putString(KEY_FAMILY, v).apply()

    var deviceId: String?
        get() = prefs.getString(KEY_DEVICE, null)
        set(v) = prefs.edit().putString(KEY_DEVICE, v).apply()

    /** Parent account uid required to confirm sensitive actions (e.g. unenroll). */
    var parentUid: String?
        get() = prefs.getString(KEY_PARENT, null)
        set(v) = prefs.edit().putString(KEY_PARENT, v).apply()

    val isPaired: Boolean get() = familyId != null && deviceId != null

    fun clear() = prefs.edit().clear().apply()

    private companion object {
        const val KEY_FAMILY = "family_id"
        const val KEY_DEVICE = "device_id"
        const val KEY_PARENT = "parent_uid"
    }
}
