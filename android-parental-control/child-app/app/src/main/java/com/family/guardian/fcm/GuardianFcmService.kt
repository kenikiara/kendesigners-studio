package com.family.guardian.fcm

import com.family.guardian.data.FirestoreRepository
import com.family.guardian.util.Constants
import com.family.guardian.util.SecureStore
import com.google.firebase.firestore.FirebaseFirestore
import com.google.firebase.firestore.SetOptions
import com.google.firebase.messaging.FirebaseMessagingService
import com.google.firebase.messaging.RemoteMessage
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.runBlocking

/**
 * Receives high-priority FCM data messages carrying remote commands from the parent
 * (relayed by a Cloud Function). The message body is minimal — a verb + a commandId.
 * The device then fetches full command detail from Firestore over TLS, executes it, and
 * acks by deleting the command doc.
 */
class GuardianFcmService : FirebaseMessagingService() {

    override fun onNewToken(token: String) {
        // Register this device's FCM token so the parent's Cloud Function can reach it.
        val store = SecureStore(this)
        val fam = store.familyId ?: return
        val dev = store.deviceId ?: return
        FirebaseFirestore.getInstance()
            .collection(Constants.COL_FAMILIES).document(fam)
            .collection(Constants.COL_DEVICES).document(dev)
            .set(mapOf("fcmToken" to token), SetOptions.merge())
    }

    override fun onMessageReceived(message: RemoteMessage) {
        val data = message.data
        val verb = data[Constants.FCM_COMMAND] ?: return
        val commandId = data[Constants.FCM_COMMAND_ID]
        val arg = data[Constants.FCM_ARG]

        val executor = CommandExecutor(applicationContext)
        // Commands are short; run synchronously within the FCM callback window.
        runBlocking(Dispatchers.Default) {
            executor.execute(verb, arg)
            if (commandId != null) ackCommand(commandId)
        }
    }

    private suspend fun ackCommand(commandId: String) {
        val store = SecureStore(this)
        val fam = store.familyId ?: return
        val dev = store.deviceId ?: return
        runCatching { FirestoreRepository(fam, dev).ackCommand(commandId) }
    }
}
