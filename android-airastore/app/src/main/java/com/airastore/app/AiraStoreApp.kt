package com.airastore.app

import android.app.Application
import android.app.NotificationChannel
import android.app.NotificationManager
import android.content.Context
import android.os.Build
import com.google.firebase.FirebaseApp
import com.google.firebase.crashlytics.FirebaseCrashlytics

class AiraStoreApp : Application() {

    override fun onCreate() {
        super.onCreate()
        instance = this

        // Initialize Firebase
        FirebaseApp.initializeApp(this)
        FirebaseCrashlytics.getInstance().setCrashlyticsCollectionEnabled(!BuildConfig.DEBUG)

        // Create notification channels
        createNotificationChannels()
    }

    private fun createNotificationChannels() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            // General Channel
            val generalChannel = NotificationChannel(
                CHANNEL_GENERAL,
                getString(R.string.channel_general),
                NotificationManager.IMPORTANCE_DEFAULT
            ).apply {
                description = getString(R.string.channel_general_description)
            }

            // Live Stream Channel
            val liveStreamChannel = NotificationChannel(
                CHANNEL_LIVE_STREAM,
                getString(R.string.channel_live_stream),
                NotificationManager.IMPORTANCE_HIGH
            ).apply {
                description = getString(R.string.channel_live_stream_description)
            }

            // Order Updates Channel
            val orderChannel = NotificationChannel(
                CHANNEL_ORDER,
                getString(R.string.channel_order),
                NotificationManager.IMPORTANCE_DEFAULT
            ).apply {
                description = getString(R.string.channel_order_description)
            }

            // Chat Channel
            val chatChannel = NotificationChannel(
                CHANNEL_CHAT,
                getString(R.string.channel_chat),
                NotificationManager.IMPORTANCE_HIGH
            ).apply {
                description = getString(R.string.channel_chat_description)
            }

            // Register all channels
            val notificationManager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
            notificationManager.createNotificationChannels(
                listOf(
                    generalChannel,
                    liveStreamChannel,
                    orderChannel,
                    chatChannel
                )
            )
        }
    }

    companion object {
        private lateinit var instance: AiraStoreApp

        fun getInstance(): AiraStoreApp = instance

        // Notification Channels
        const val CHANNEL_GENERAL = "general"
        const val CHANNEL_LIVE_STREAM = "live_stream"
        const val CHANNEL_ORDER = "order"
        const val CHANNEL_CHAT = "chat"

        // Shared Preferences
        const val PREF_NAME = "aira_store_pref"
        const val PREF_USER_TOKEN = "user_token"
        const val PREF_USER_ID = "user_id"
        const val PREF_FCM_TOKEN = "fcm_token"
        const val PREF_FIRST_TIME = "first_time"
        const val PREF_DARK_MODE = "dark_mode"
        const val PREF_NOTIFICATION = "notification"

        // API
        const val API_TIMEOUT = 30L
        const val API_RETRY_COUNT = 3
        const val API_RETRY_DELAY = 1000L

        // Cache
        const val CACHE_SIZE = 10L * 1024 * 1024 // 10 MB
        const val CACHE_MAX_AGE = 7 * 24 * 60 * 60 // 7 days
        const val CACHE_MAX_STALE = 30 * 24 * 60 * 60 // 30 days

        // Image
        const val IMAGE_QUALITY = 80
        const val IMAGE_MAX_SIZE = 1024
        const val IMAGE_CACHE_SIZE = 250L * 1024 * 1024 // 250 MB

        // Live Stream
        const val STREAM_QUALITY_HIGH = "720p"
        const val STREAM_QUALITY_MEDIUM = "480p"
        const val STREAM_QUALITY_LOW = "360p"
        const val STREAM_BITRATE_HIGH = 2000000
        const val STREAM_BITRATE_MEDIUM = 1000000
        const val STREAM_BITRATE_LOW = 500000
    }
}
