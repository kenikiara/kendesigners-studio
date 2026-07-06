package com.family.guardian.data

import android.content.Context
import com.family.guardian.util.SecureStore
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.firestore.FirebaseFirestore
import com.google.firebase.firestore.SetOptions
import com.google.firebase.messaging.FirebaseMessaging
import kotlinx.coroutines.tasks.await
import org.json.JSONObject

/**
 * Handles pairing the child device to a family. The parent dashboard generates a QR
 * encoding: { "familyId": ..., "pairingCode": ..., "customToken": ... }. The child app
 * scans it, signs in with the Firebase custom token (scoped by the backend to this
 * family/device only), registers the device, and persists ids in encrypted storage.
 */
class PairingManager(context: Context) {

    private val ctx = context.applicationContext
    private val store = SecureStore(ctx)
    private val auth = FirebaseAuth.getInstance()
    private val db = FirebaseFirestore.getInstance()

    data class PairPayload(val familyId: String, val pairingCode: String, val customToken: String)

    fun parseQr(raw: String): PairPayload? = runCatching {
        val j = JSONObject(raw)
        PairPayload(
            familyId = j.getString("familyId"),
            pairingCode = j.getString("pairingCode"),
            customToken = j.getString("customToken")
        )
    }.getOrNull()

    /**
     * Completes pairing. The custom token was minted by a Cloud Function bound to a
     * pending pairing code; signing in proves the child holds a valid, single-use code.
     */
    suspend fun pair(payload: PairPayload, deviceLabel: String): Boolean = runCatching {
        auth.signInWithCustomToken(payload.customToken).await()
        val uid = auth.currentUser?.uid ?: return false

        // The backend created childDevices/{uid} keyed to the auth uid during code mint.
        val deviceId = uid
        val fcmToken = FirebaseMessaging.getInstance().token.await()

        db.collection("families").document(payload.familyId)
            .collection("childDevices").document(deviceId)
            .set(
                mapOf(
                    "label" to deviceLabel,
                    "pairedAt" to System.currentTimeMillis(),
                    "fcmToken" to fcmToken,
                    "platform" to "android"
                ),
                SetOptions.merge()
            ).await()

        store.familyId = payload.familyId
        store.deviceId = deviceId
        true
    }.getOrDefault(false)

    fun isPaired() = store.isPaired
}
