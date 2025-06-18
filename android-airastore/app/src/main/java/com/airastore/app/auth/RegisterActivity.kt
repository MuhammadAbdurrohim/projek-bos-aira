package com.airastore.app.auth

import android.content.Intent
import android.os.Bundle
import androidx.appcompat.app.AppCompatActivity
import androidx.core.widget.addTextChangedListener
import com.airastore.app.MainActivity
import com.airastore.app.R
import com.airastore.app.databinding.ActivityRegisterBinding
import com.airastore.app.utils.gone
import com.airastore.app.utils.show
import com.airastore.app.utils.showSnackbar
import com.airastore.app.viewmodels.AuthViewModel
import com.airastore.app.viewmodels.getViewModel
import com.google.firebase.messaging.FirebaseMessaging

class RegisterActivity : AppCompatActivity() {

    private lateinit var binding: ActivityRegisterBinding
    private lateinit var viewModel: AuthViewModel
    private var fcmToken: String? = null

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityRegisterBinding.inflate(layoutInflater)
        setContentView(binding.root)

        viewModel = getViewModel()
        setupViews()
        observeViewModel()
        getFCMToken()
    }

    private fun setupViews() {
        // Setup toolbar
        setSupportActionBar(binding.toolbar)
        supportActionBar?.setDisplayHomeAsUpEnabled(true)
        binding.toolbar.setNavigationOnClickListener { navigateToLogin() }

        // Setup input fields
        binding.nameInput.addTextChangedListener { validateForm() }
        binding.emailInput.addTextChangedListener { validateForm() }
        binding.passwordInput.addTextChangedListener { validateForm() }
        binding.confirmPasswordInput.addTextChangedListener { validateForm() }
        binding.phoneInput.addTextChangedListener { validateForm() }
        binding.whatsappInput.addTextChangedListener { validateForm() }

        // Setup register button
        binding.registerButton.setOnClickListener {
            if (validateForm()) {
                register()
            }
        }

        // Setup login button
        binding.loginButton.setOnClickListener {
            navigateToLogin()
        }
    }

    private fun observeViewModel() {
        viewModel.registerState.observe(this) { event ->
            event.getContentIfNotHandled()?.let { result ->
                when (result) {
                    is ApiResult.Success -> {
                        binding.registerButton.isLoading = false
                        showSuccessAndNavigate()
                    }
                    is ApiResult.Error -> {
                        binding.registerButton.isLoading = false
                        binding.root.showSnackbar(result.message)
                    }
                    is ApiResult.Loading -> {
                        binding.registerButton.isLoading = true
                    }
                }
            }
        }

        viewModel.isLoading.observe(this) { isLoading ->
            binding.progressBar.visibility = if (isLoading) android.view.View.VISIBLE else android.view.View.GONE
            binding.registerButton.isEnabled = !isLoading
        }

        viewModel.errorMessage.observe(this) { event ->
            event.getContentIfNotHandled()?.let { message ->
                binding.root.showSnackbar(message)
            }
        }
    }

    private fun register() {
        val name = binding.nameInput.text.toString()
        val email = binding.emailInput.text.toString()
        val password = binding.passwordInput.text.toString()
        val confirmPassword = binding.confirmPasswordInput.text.toString()
        val phone = binding.phoneInput.text.toString().takeIf { it.isNotBlank() }
        val whatsapp = binding.whatsappInput.text.toString().takeIf { it.isNotBlank() }

        if (!binding.termsCheckbox.isChecked) {
            binding.root.showSnackbar(getString(R.string.please_accept_terms))
            return
        }

        viewModel.register(
            name = name,
            email = email,
            password = password,
            confirmPassword = confirmPassword,
            phone = phone,
            whatsapp = whatsapp,
            fcmToken = fcmToken
        )
    }

    private fun validateForm(): Boolean {
        var isValid = true
        binding.apply {
            // Validate name
            if (nameInput.text.toString().isBlank()) {
                nameLayout.error = getString(R.string.error_required)
                isValid = false
            } else {
                nameLayout.error = null
            }

            // Validate email
            val email = emailInput.text.toString()
            if (email.isBlank()) {
                emailLayout.error = getString(R.string.error_required)
                isValid = false
            } else if (!android.util.Patterns.EMAIL_ADDRESS.matcher(email).matches()) {
                emailLayout.error = getString(R.string.error_invalid_email)
                isValid = false
            } else {
                emailLayout.error = null
            }

            // Validate password
            val password = passwordInput.text.toString()
            if (password.isBlank()) {
                passwordLayout.error = getString(R.string.error_required)
                isValid = false
            } else if (password.length < 6) {
                passwordLayout.error = getString(R.string.error_password_short)
                isValid = false
            } else {
                passwordLayout.error = null
            }

            // Validate confirm password
            val confirmPassword = confirmPasswordInput.text.toString()
            if (confirmPassword.isBlank()) {
                confirmPasswordLayout.error = getString(R.string.error_required)
                isValid = false
            } else if (password != confirmPassword) {
                confirmPasswordLayout.error = getString(R.string.error_password_mismatch)
                isValid = false
            } else {
                confirmPasswordLayout.error = null
            }

            // Validate phone (optional)
            val phone = phoneInput.text.toString()
            if (phone.isNotBlank() && !android.util.Patterns.PHONE.matcher(phone).matches()) {
                phoneLayout.error = getString(R.string.error_invalid_phone)
                isValid = false
            } else {
                phoneLayout.error = null
            }

            // Validate WhatsApp (optional)
            val whatsapp = whatsappInput.text.toString()
            if (whatsapp.isNotBlank() && !android.util.Patterns.PHONE.matcher(whatsapp).matches()) {
                whatsappLayout.error = getString(R.string.invalid_whatsapp)
                isValid = false
            } else {
                whatsappLayout.error = null
            }

            // Check terms acceptance
            isValid = isValid && termsCheckbox.isChecked
        }

        binding.registerButton.isEnabled = isValid
        return isValid
    }

    private fun getFCMToken() {
        FirebaseMessaging.getInstance().token
            .addOnCompleteListener { task ->
                if (task.isSuccessful) {
                    fcmToken = task.result
                }
            }
    }

    private fun showSuccessAndNavigate() {
        binding.root.showSnackbar(getString(R.string.success_register))
        binding.root.postDelayed({
            startActivity(Intent(this, MainActivity::class.java).apply {
                flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK
            })
            finish()
        }, 1500)
    }

    private fun navigateToLogin() {
        startActivity(Intent(this, LoginActivity::class.java))
        finish()
    }

    companion object {
        private const val TAG = "RegisterActivity"
    }
}
