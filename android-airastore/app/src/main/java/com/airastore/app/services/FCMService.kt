package com.airastore.app.services

import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.media.RingtoneManager
import android.os.Build
import androidx.core.app.NotificationCompat
import com.airastore.app.MainActivity
import com.airastore.app.R
import com.airastore.app.ui.order.OrderDetailActivity
import com.airastore.app.ui.live.LiveStreamActivity
import com.airastore.app.utils.SessionManager
import com.google.firebase.messaging.FirebaseMessagingService
import com.google.firebase.messaging.RemoteMessage
import org.json.JSONObject
import timber.log.Timber

class FCMService : FirebaseMessagingService() {

    private lateinit var sessionManager: SessionManager

    override fun onCreate() {
        super.onCreate()
        sessionManager = SessionManager(this)
    }

    override fun onNewToken(token: String) {
        super.onNewToken(token)
        Timber.d("New FCM Token: $token")
        
        // Simpan token baru ke SessionManager
        sessionManager.saveFCMToken(token)
        
        // Update token ke backend
        updateTokenToServer(token)
    }

    override fun onMessageReceived(remoteMessage: RemoteMessage) {
        super.onMessageReceived(remoteMessage)
        Timber.d("From: ${remoteMessage.from}")

        // Cek jika pesan berisi data payload
        remoteMessage.data.isNotEmpty().let {
            Timber.d("Message data payload: ${remoteMessage.data}")
            handleDataMessage(remoteMessage.data)
        }

        // Cek jika pesan berisi notification payload
        remoteMessage.notification?.let {
            Timber.d("Message Notification Body: ${it.body}")
            it.body?.let { body -> showNotification(it.title, body) }
        }
    }

    private fun handleDataMessage(data: Map<String, String>) {
        try {
            val payload = JSONObject(data["payload"] ?: "{}")
            val type = data["type"] ?: "general"
            
            when (type) {
                "order_status" -> {
                    val orderId = payload.optString("order_id")
                    val status = payload.optString("status")
                    val title = "Status Pesanan"
                    val message = when (status) {
                        "confirmed" -> "Pesanan #$orderId telah dikonfirmasi"
                        "shipped" -> "Pesanan #$orderId telah dikirim"
                        "delivered" -> "Pesanan #$orderId telah diterima"
                        "cancelled" -> "Pesanan #$orderId telah dibatalkan"
                        else -> "Ada update untuk pesanan #$orderId"
                    }
                    showOrderNotification(title, message, orderId)
                }
                
                "live_stream" -> {
                    val streamId = payload.optString("stream_id")
                    val sellerName = payload.optString("seller_name")
                    val title = "Live Stream"
                    val message = "$sellerName sedang live!"
                    showLiveStreamNotification(title, message, streamId)
                }
                
                "chat" -> {
                    val senderId = payload.optString("sender_id")
                    val senderName = payload.optString("sender_name")
                    val message = payload.optString("message")
                    val title = senderName
                    showChatNotification(title, message, senderId)
                }
                
                else -> {
                    val title = data["title"] ?: "Aira Store"
                    val message = data["message"] ?: ""
                    showNotification(title, message)
                }
            }
        } catch (e: Exception) {
            Timber.e(e, "Error parsing FCM data message")
        }
    }

    private fun showNotification(title: String?, message: String) {
        val intent = Intent(this, MainActivity::class.java)
        intent.addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP)
        showNotificationWithIntent(title, message, intent)
    }

    private fun showOrderNotification(title: String, message: String, orderId: String) {
        val intent = Intent(this, OrderDetailActivity::class.java).apply {
            putExtra("order_id", orderId)
            addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP)
        }
        showNotificationWithIntent(title, message, intent, "order_channel")
    }

    private fun showLiveStreamNotification(title: String, message: String, streamId: String) {
        val intent = Intent(this, LiveStreamActivity::class.java).apply {
            putExtra("stream_id", streamId)
            addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP)
        }
        showNotificationWithIntent(title, message, intent, "live_stream_channel")
    }

    private fun showChatNotification(title: String, message: String, senderId: String) {
        val intent = Intent(this, MainActivity::class.java).apply {
            putExtra("open_chat", true)
            putExtra("sender_id", senderId)
            addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP)
        }
        showNotificationWithIntent(title, message, intent, "chat_channel")
    }

    private fun showNotificationWithIntent(
        title: String?,
        message: String,
        intent: Intent,
        channelId: String = getString(R.string.default_notification_channel_id)
    ) {
        val pendingIntent = PendingIntent.getActivity(
            this, 0, intent,
            PendingIntent.FLAG_ONE_SHOT or PendingIntent.FLAG_IMMUTABLE
        )

        val defaultSoundUri = RingtoneManager.getDefaultUri(RingtoneManager.TYPE_NOTIFICATION)
        val notificationBuilder = NotificationCompat.Builder(this, channelId)
            .setSmallIcon(R.drawable.ic_notification)
            .setContentTitle(title)
            .setContentText(message)
            .setAutoCancel(true)
            .setSound(defaultSoundUri)
            .setContentIntent(pendingIntent)
            .setPriority(NotificationCompat.PRIORITY_HIGH)

        val notificationManager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager

        // Buat channel notifikasi untuk Android O dan yang lebih baru
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = when (channelId) {
                "order_channel" -> NotificationChannel(
                    channelId,
                    "Status Pesanan",
                    NotificationManager.IMPORTANCE_HIGH
                )
                "live_stream_channel" -> NotificationChannel(
                    channelId,
                    "Live Stream",
                    NotificationManager.IMPORTANCE_HIGH
                )
                "chat_channel" -> NotificationChannel(
                    channelId,
                    "Chat",
                    NotificationManager.IMPORTANCE_HIGH
                )
                else -> NotificationChannel(
                    channelId,
                    "General",
                    NotificationManager.IMPORTANCE_DEFAULT
                )
            }
            notificationManager.createNotificationChannel(channel)
        }

        notificationManager.notify(getNotificationId(), notificationBuilder.build())
    }

    private fun getNotificationId(): Int {
        return System.currentTimeMillis().toInt()
    }

    private fun updateTokenToServer(token: String) {
        if (sessionManager.isLoggedIn()) {
            val authRepository = AuthRepository(
                ApiConfig.getApiService(sessionManager),
                sessionManager
            )
            
            kotlinx.coroutines.GlobalScope.launch {
                try {
                    authRepository.updateFCMToken(token)
                } catch (e: Exception) {
                    Timber.e(e, "Failed to update FCM token to server")
                }
            }
        }
    }

    companion object {
        private const val TAG = "FCMService"
    }
}
