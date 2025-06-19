package com.airastore.app.services

import android.content.Context
import im.zego.zegoexpress.ZegoExpressEngine
import im.zego.zegoexpress.entity.ZegoEngineProfile
import im.zego.zegoexpress.entity.ZegoUser
import im.zego.zegoexpress.entity.ZegoRoomConfig
import im.zego.zegoexpress.entity.ZegoRoomState
import im.zego.zegoexpress.callback.IZegoEventHandler
import im.zego.zegoexpress.callback.IZegoRoomStateListener
import im.zego.zegoexpress.callback.IZegoRoomUserUpdateListener
import im.zego.zegoexpress.callback.IZegoIMSendBroadcastMessageCallback
import im.zego.zegoexpress.callback.IZegoIMRecvBroadcastMessageCallback
import im.zego.zegoexpress.entity.ZegoBroadcastMessageInfo
import android.util.Log

object ZegoLiveHelper {
    private const val TAG = "ZegoLiveHelper"
    private var engine: ZegoExpressEngine? = null
    private var isInitialized = false

    fun initEngine(context: Context, appID: Long, appSign: String, userID: String, userName: String) {
        if (isInitialized) return

        val profile = ZegoEngineProfile()
        profile.appID = appID
        profile.appSign = appSign
        profile.scenario = 0 // General scenario

        engine = ZegoExpressEngine.createEngine(profile, context, true)
        val user = ZegoUser(userID, userName)
        engine?.loginRoom("default_room", user, ZegoRoomConfig())

        isInitialized = true
        Log.d(TAG, "ZegoExpressEngine initialized")
    }

    fun startPublishingStream(streamID: String) {
        engine?.startPublishingStream(streamID)
        engine?.startPreview()
        Log.d(TAG, "Start publishing stream: $streamID")
    }

    fun stopPublishingStream() {
        engine?.stopPublishingStream()
        engine?.stopPreview()
        Log.d(TAG, "Stop publishing stream")
    }

    fun startPlayingStream(streamID: String) {
        engine?.startPlayingStream(streamID)
        Log.d(TAG, "Start playing stream: $streamID")
    }

    fun stopPlayingStream(streamID: String) {
        engine?.stopPlayingStream(streamID)
        Log.d(TAG, "Stop playing stream: $streamID")
    }

    fun sendMessage(message: String, callback: IZegoIMSendBroadcastMessageCallback) {
        engine?.sendBroadcastMessage(message, callback)
    }

    fun setOnReceiveMessageListener(listener: IZegoIMRecvBroadcastMessageCallback) {
        engine?.setIMRecvBroadcastMessageCallback(listener)
    }

    fun release() {
        engine?.logoutRoom("default_room")
        ZegoExpressEngine.destroyEngine(null)
        isInitialized = false
        Log.d(TAG, "ZegoExpressEngine destroyed")
    }
}
