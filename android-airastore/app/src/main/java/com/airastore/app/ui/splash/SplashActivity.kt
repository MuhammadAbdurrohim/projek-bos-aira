package com.airastore.app.ui.splash

import android.annotation.SuppressLint
import android.content.Intent
import android.os.Bundle
import android.view.View
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import com.airastore.app.MainActivity
import com.airastore.app.auth.LoginActivity
import com.airastore.app.databinding.ActivitySplashBinding
import com.airastore.app.utils.SessionManager
import com.google.firebase.auth.FirebaseAuth
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch

@SuppressLint("CustomSplashScreen")
class SplashActivity : AppCompatActivity() {

    private lateinit var binding: ActivitySplashBinding
    private lateinit var sessionManager: SessionManager

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivitySplashBinding.inflate(layoutInflater)
        setContentView(binding.root)

        sessionManager = SessionManager(this)

        // Hide system bars
        window.decorView.systemUiVisibility = (
            View.SYSTEM_UI_FLAG_LAYOUT_STABLE
            or View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN
        )

        // Start animation
        binding.lottieAnimation.playAnimation()

        // Check authentication state after delay
        lifecycleScope.launch {
            delay(2000) // 2 seconds delay
            checkAuthState()
        }
    }

    private fun checkAuthState() {
        val currentUser = FirebaseAuth.getInstance().currentUser
        val destination = if (currentUser != null && sessionManager.isLoggedIn()) {
            // User is signed in and has valid session
            MainActivity::class.java
        } else {
            // User is not signed in or session is invalid
            LoginActivity::class.java
        }

        // Navigate to appropriate screen
        startActivity(Intent(this, destination).apply {
            flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK
        })
        finish()
    }

    override fun onDestroy() {
        super.onDestroy()
        binding.lottieAnimation.cancelAnimation()
    }
}
