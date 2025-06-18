package com.airastore.app.auth

import android.content.Intent
import android.os.Bundle
import androidx.appcompat.app.AppCompatActivity
import androidx.core.widget.addTextChangedListener
import com.airastore.app.MainActivity
import com.airastore.app.R
import com.airastore.app.databinding.ActivityLoginBinding
import com.airastore.app.utils.gone
import com.airastore.app.utils.show
import com.airastore.app.utils.showSnackbar
import com.airastore.app.utils.toast
import com.airastore.app.viewmodels.AuthViewModel
import com.airastore.app.viewmodels.getViewModel
import com.google.firebase.messaging.FirebaseMessaging

class LoginActivity : AppCompatActivity() {

    private lateinit var binding: ActivityLoginBinding
    private lateinit var viewModel: AuthViewModel
    private var fcmToken: String? = null

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityLoginBinding.inflate(layoutInflater)
        setContentView(binding.root)

        viewModel = getViewModel()
        setupViews()
        observeViewModel()
        getFCMToken()
    }

    private fun setupViews() {
        // Setup input fields
        binding.emailInput.addTextChangedListener { validateForm() }
        binding.passwordInput.addTextChangedListener { validateForm() }

        // Setup login button
        binding.loginButton.setOnClickListener {
            login()
        }

        // Setup register button
        binding.registerButton.setOnClickListener {
            startActivity(Intent(this, RegisterActivity::class.java))
        }

        // Setup forgot password button
        binding.forgotPasswordButton.setOnClickListener {
            val email = binding.emailInput.text.toString()
            if (email.isNotBlank() && android.util.Patterns.EMAIL_ADDRESS.matcher(email).matches()) {
                viewModel.forgotPassword(email)
            } else {
                binding.root.showSnackbar(getString(R.string.enter_valid_email))
            }
        }
    }

    private fun observeViewModel() {
        // Observe login result
        viewModel.loginState.observe(this) { event ->
            event.getContentIfNotHandled()?.let { result ->
                when (result) {
                    is ApiResult.Success -> {
                        binding.loginButton.isLoading = false
                        startActivity(Intent(this, MainActivity::class.java))
                        finish()
                    }
                    is ApiResult.Error -> {
                        binding.loginButton.isLoading = false
                        binding.root.showSnackbar(result.message)
                    }
                    is ApiResult.Loading -> {
                        binding.loginButton.isLoading = true
                    }
                }
            }
        }

        // Observe forgot password result
        viewModel.forgotPasswordResult.observe(this) { event ->
            event.getContentIfNotHandled()?.let { result ->
                when (result) {
                    is ApiResult.Success -> {
                        toast(getString(R.string.password_reset_email_sent))
                    }
                    is ApiResult.Error -> {
                        binding.root.showSnackbar(result.message)
                    }
                    is ApiResult.Loading -> {
                        // Show loading if needed
                    }
                }
            }
        }

        // Observe loading state
        viewModel.isLoading.observe(this) { isLoading ->
            if (isLoading) {
                binding.progressBar.show()
            } else {
                binding.progressBar.gone()
            }
        }

        // Observe error messages
        viewModel.errorMessage.observe(this) { event ->
            event.getContentIfNotHandled()?.let { message ->
                binding.root.showSnackbar(message)
            }
        }
    }

    private fun login() {
        val email = binding.emailInput.text.toString()
        val password = binding.passwordInput.text.toString()

        if (viewModel.validateLoginInput(email, password)) {
            viewModel.login(email, password, fcmToken)
        }
    }

    private fun validateForm() {
        val email = binding.emailInput.text.toString()
        val password = binding.passwordInput.text.toString()

        binding.loginButton.isEnabled = email.isNotBlank() && 
                                      android.util.Patterns.EMAIL_ADDRESS.matcher(email).matches() &&
                                      password.isNotBlank() && 
                                      password.length >= 6
    }

    private fun getFCMToken() {
        FirebaseMessaging.getInstance().token
            .addOnCompleteListener { task ->
                if (task.isSuccessful) {
                    fcmToken = task.result
                }
            }
    }

    companion object {
        private const val TAG = "LoginActivity"
    }
}
