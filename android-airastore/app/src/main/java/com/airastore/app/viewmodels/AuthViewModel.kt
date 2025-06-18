package com.airastore.app.viewmodels

import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.airastore.app.api.ApiConfig.ApiResult
import com.airastore.app.models.User
import com.airastore.app.repository.AuthRepository
import com.airastore.app.utils.Event
import kotlinx.coroutines.launch

class AuthViewModel(private val repository: AuthRepository) : ViewModel() {

    // Login state
    private val _loginState = MutableLiveData<Event<ApiResult<User>>>()
    val loginState: LiveData<Event<ApiResult<User>>> = _loginState

    // Register state
    private val _registerState = MutableLiveData<Event<ApiResult<User>>>()
    val registerState: LiveData<Event<ApiResult<User>>> = _registerState

    // Loading state
    private val _isLoading = MutableLiveData<Boolean>()
    val isLoading: LiveData<Boolean> = _isLoading

    // Error message
    private val _errorMessage = MutableLiveData<Event<String>>()
    val errorMessage: LiveData<Event<String>> = _errorMessage

    /**
     * Login dengan email dan password
     */
    fun login(email: String, password: String) {
        viewModelScope.launch {
            try {
                _isLoading.value = true
                
                when (val result = repository.login(email, password)) {
                    is ApiResult.Success -> {
                        result.data.data?.user?.let { user ->
                            _loginState.value = Event(ApiResult.Success(user))
                        } ?: run {
                            _errorMessage.value = Event("User data not found")
                        }
                    }
                    is ApiResult.Error -> {
                        _loginState.value = Event(ApiResult.Error(result.code, result.message))
                        _errorMessage.value = Event(result.message)
                    }
                    is ApiResult.Loading -> {
                        _loginState.value = Event(ApiResult.Loading)
                    }
                }
            } catch (e: Exception) {
                _loginState.value = Event(ApiResult.Error(-1, e.message ?: "Unknown error occurred"))
                _errorMessage.value = Event(e.message ?: "Unknown error occurred")
            } finally {
                _isLoading.value = false
            }
        }
    }

    /**
     * Register user baru
     */
    fun register(name: String, email: String, password: String, phone: String? = null, whatsapp: String? = null) {
        viewModelScope.launch {
            try {
                _isLoading.value = true

                when (val result = repository.register(name, email, password, phone, whatsapp)) {
                    is ApiResult.Success -> {
                        result.data.data?.user?.let { user ->
                            _registerState.value = Event(ApiResult.Success(user))
                        } ?: run {
                            _errorMessage.value = Event("User data not found")
                        }
                    }
                    is ApiResult.Error -> {
                        _registerState.value = Event(ApiResult.Error(result.code, result.message))
                        _errorMessage.value = Event(result.message)
                    }
                    is ApiResult.Loading -> {
                        _registerState.value = Event(ApiResult.Loading)
                    }
                }
            } catch (e: Exception) {
                _registerState.value = Event(ApiResult.Error(-1, e.message ?: "Unknown error occurred"))
                _errorMessage.value = Event(e.message ?: "Unknown error occurred")
            } finally {
                _isLoading.value = false
            }
        }
    }

    /**
     * Logout user
     */
    fun logout(onComplete: (Boolean) -> Unit) {
        viewModelScope.launch {
            try {
                _isLoading.value = true

                when (val result = repository.logout()) {
                    is ApiResult.Success -> {
                        onComplete(true)
                    }
                    is ApiResult.Error -> {
                        _errorMessage.value = Event(result.message)
                        onComplete(false)
                    }
                    is ApiResult.Loading -> {
                        // Do nothing
                    }
                }
            } catch (e: Exception) {
                _errorMessage.value = Event(e.message ?: "Unknown error occurred")
                onComplete(false)
            } finally {
                _isLoading.value = false
            }
        }
    }

    /**
     * Reset password
     */
    fun forgotPassword(email: String, onComplete: (Boolean) -> Unit) {
        viewModelScope.launch {
            try {
                _isLoading.value = true

                when (val result = repository.forgotPassword(email)) {
                    is ApiResult.Success -> {
                        onComplete(true)
                    }
                    is ApiResult.Error -> {
                        _errorMessage.value = Event(result.message)
                        onComplete(false)
                    }
                    is ApiResult.Loading -> {
                        // Do nothing
                    }
                }
            } catch (e: Exception) {
                _errorMessage.value = Event(e.message ?: "Unknown error occurred")
                onComplete(false)
            } finally {
                _isLoading.value = false
            }
        }
    }

    /**
     * Update FCM Token
     */
    fun updateFCMToken(token: String) {
        viewModelScope.launch {
            try {
                when (val result = repository.updateFCMToken(token)) {
                    is ApiResult.Success -> {
                        // Token berhasil diupdate
                    }
                    is ApiResult.Error -> {
                        _errorMessage.value = Event(result.message)
                    }
                    is ApiResult.Loading -> {
                        // Do nothing
                    }
                }
            } catch (e: Exception) {
                _errorMessage.value = Event(e.message ?: "Unknown error occurred")
            }
        }
    }

    /**
     * Validasi input login
     */
    fun validateLoginInput(email: String, password: String): Boolean {
        return when {
            email.isEmpty() -> {
                _errorMessage.value = Event("Email is required")
                false
            }
            !android.util.Patterns.EMAIL_ADDRESS.matcher(email).matches() -> {
                _errorMessage.value = Event("Invalid email format")
                false
            }
            password.isEmpty() -> {
                _errorMessage.value = Event("Password is required")
                false
            }
            password.length < 6 -> {
                _errorMessage.value = Event("Password must be at least 6 characters")
                false
            }
            else -> true
        }
    }

    /**
     * Validasi input register
     */
    fun validateRegisterInput(
        name: String,
        email: String,
        password: String,
        confirmPassword: String,
        phone: String? = null,
        whatsapp: String? = null
    ): Boolean {
        return when {
            name.isEmpty() -> {
                _errorMessage.value = Event("Name is required")
                false
            }
            email.isEmpty() -> {
                _errorMessage.value = Event("Email is required")
                false
            }
            !android.util.Patterns.EMAIL_ADDRESS.matcher(email).matches() -> {
                _errorMessage.value = Event("Invalid email format")
                false
            }
            password.isEmpty() -> {
                _errorMessage.value = Event("Password is required")
                false
            }
            password.length < 6 -> {
                _errorMessage.value = Event("Password must be at least 6 characters")
                false
            }
            password != confirmPassword -> {
                _errorMessage.value = Event("Passwords do not match")
                false
            }
            else -> true
        }
    }
}
