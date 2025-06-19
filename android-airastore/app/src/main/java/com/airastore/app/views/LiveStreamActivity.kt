package com.airastore.app.views

import android.os.Bundle
import android.util.Log
import android.view.View
import android.widget.*
import androidx.appcompat.app.AppCompatActivity
import com.airastore.app.R
import com.airastore.app.api.ApiConfig
import com.airastore.app.services.ZegoLiveHelper
import im.zego.zegoexpress.callback.IZegoIMRecvBroadcastMessageCallback
import im.zego.zegoexpress.callback.IZegoIMSendBroadcastMessageCallback
import im.zego.zegoexpress.entity.ZegoBroadcastMessageInfo

class LiveStreamActivity : AppCompatActivity() {

    private lateinit var streamID: String
    private lateinit var userID: String
    private lateinit var userName: String

    private lateinit var videoView: View
    private lateinit var chatListView: ListView
    private lateinit var chatInput: EditText
    private lateinit var sendButton: Button

    private val chatMessages = mutableListOf<String>()
    private lateinit var chatAdapter: ArrayAdapter<String>

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_live_stream)

        videoView = findViewById(R.id.zego_video_view)
        chatListView = findViewById(R.id.chat_list_view)
        chatInput = findViewById(R.id.chat_input)
        sendButton = findViewById(R.id.send_button)

        chatAdapter = ArrayAdapter(this, android.R.layout.simple_list_item_1, chatMessages)
        chatListView.adapter = chatAdapter

        // Get streamID, userID, userName from intent or generate
        streamID = intent.getStringExtra("STREAM_ID") ?: "default_stream"
        userID = "user_${System.currentTimeMillis()}"
        userName = "User"

        // Initialize ZegoLiveHelper
        ZegoLiveHelper.initEngine(this, ApiConfig.ZEGO_APP_ID, ApiConfig.ZEGO_SERVER_SECRET, userID, userName)

        // Start playing stream
        ZegoLiveHelper.startPlayingStream(streamID)

        // Set message receive listener
        ZegoLiveHelper.setOnReceiveMessageListener(object : IZegoIMRecvBroadcastMessageCallback {
            override fun onIMRecvBroadcastMessage(roomID: String?, messageList: MutableList<ZegoBroadcastMessageInfo>?) {
                messageList?.forEach { msg ->
                    runOnUiThread {
                        chatMessages.add("${msg.fromUser.userName}: ${msg.message}")
                        chatAdapter.notifyDataSetChanged()
                        chatListView.smoothScrollToPosition(chatMessages.size - 1)
                    }
                }
            }
        })

        sendButton.setOnClickListener {
            val message = chatInput.text.toString().trim()
            if (message.isNotEmpty()) {
                ZegoLiveHelper.sendMessage(message, object : IZegoIMSendBroadcastMessageCallback {
                    override fun onIMSendBroadcastMessageResult(errorCode: Int, messageID: Long) {
                        runOnUiThread {
                            if (errorCode == 0) {
                                chatMessages.add("Me: $message")
                                chatAdapter.notifyDataSetChanged()
                                chatListView.smoothScrollToPosition(chatMessages.size - 1)
                                chatInput.text.clear()
                            } else {
                                Toast.makeText(this@LiveStreamActivity, "Failed to send message", Toast.LENGTH_SHORT).show()
                            }
                        }
                    }
                })
            }
        }
    }

    override fun onDestroy() {
        super.onDestroy()
        ZegoLiveHelper.stopPlayingStream(streamID)
        ZegoLiveHelper.release()
    }
}
