package com.airastore.app.repository

import com.airastore.app.api.ApiConfig
import com.airastore.app.api.ApiService
import com.airastore.app.utils.SessionManager
import com.google.firebase.auth.FirebaseAuth
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.tasks.await
import kotlinx.coroutines.withContext

class AuthRepository(
    private val apiService: ApiService,
    private val sessionManager: SessionManager,
    private val firebaseAuth: FirebaseAuth = FirebaseAuth.getInstance()
) {
    /**
     * Login dengan email dan password
     */
    suspend fun login(email: String, password: String): ApiConfig.ApiResult<ApiConfig.AuthResponse> {
        return withContext(Dispatchers.IO) {
            try {
                // Login ke Firebase
                val firebaseResult = firebaseAuth.signInWithEmailAndPassword(email, password).await()
                val firebaseUser = firebaseResult.user
                
                if (firebaseUser != null) {
                    // Dapatkan FCM token
                    val fcmToken = sessionManager.getFCMToken()
                    
                    // Login ke backend
                    val loginRequest = ApiConfig.LoginRequest(
                        email = email,
                        password = password,
                        fcm_token = fcmToken
                    )
                    
                    val response = apiService.login(loginRequest)
                    
                    if (response.isSuccessful && response.body() != null) {
                        val authResponse = response.body()!!
                        
                        // Simpan data ke session
                        authResponse.data?.let { authData ->
                            sessionManager.apply {
                                saveAuthToken(authData.token)
                                saveUser(authData.user)
                                setLoggedIn(true)
                            }
                        }
                        
                        ApiConfig.ApiResult.Success(authResponse)
                    } else {
                        // Logout dari Firebase jika backend login gagal
                        firebaseAuth.signOut()
                        ApiConfig.ApiResult.Error(
                            response.code(),
                            response.errorBody()?.string() ?: "Login failed"
                        )
                    }
                } else {
                    ApiConfig.ApiResult.Error(-1, "Firebase authentication failed")
                }
            } catch (e: Exception) {
                ApiConfig.ApiResult.Error(-1, e.message ?: "Unknown error occurred")
            }
        }
    }

    /**
     * Register user baru
     */
    suspend fun register(
        name: String,
        email: String,
        password: String,
        phone: String? = null,
        whatsapp: String? = null
    ): ApiConfig.ApiResult<ApiConfig.AuthResponse> {
        return withContext(Dispatchers.IO) {
            try {
                // Register ke Firebase
                val firebaseResult = firebaseAuth.createUserWithEmailAndPassword(email, password).await()
                val firebaseUser = firebaseResult.user

                if (firebaseUser != null) {
                    // Update display name di Firebase
                    firebaseUser.updateProfile(com.google.firebase.auth.UserProfileChangeRequest.Builder()
                        .setDisplayName(name)
                        .build()
                    ).await()

                    // Dapatkan FCM token
                    val fcmToken = sessionManager.getFCMToken()

                    // Register ke backend
                    val registerRequest = ApiConfig.RegisterRequest(
                        name = name,
                        email = email,
                        password = password,
                        password_confirmation = password,
                        phone = phone,
                        whatsapp = whatsapp,
                        fcm_token = fcmToken
                    )

                    val response = apiService.register(registerRequest)

                    if (response.isSuccessful && response.body() != null) {
                        val authResponse = response.body()!!

                        // Simpan data ke session
                        authResponse.data?.let { authData ->
                            sessionManager.apply {
                                saveAuthToken(authData.token)
                                saveUser(authData.user)
                                setLoggedIn(true)
                            }
                        }

                        ApiConfig.ApiResult.Success(authResponse)
                    } else {
                        // Hapus user Firebase jika backend register gagal
                        firebaseUser.delete().await()
                        ApiConfig.ApiResult.Error(
                            response.code(),
                            response.errorBody()?.string() ?: "Registration failed"
                        )
                    }
                } else {
                    ApiConfig.ApiResult.Error(-1, "Firebase registration failed")
                }
            } catch (e: Exception) {
                ApiConfig.ApiResult.Error(-1, e.message ?: "Unknown error occurred")
            }
        }
    }

    /**
     * Logout user
     */
    suspend fun logout(): ApiConfig.ApiResult<ApiConfig.BaseResponse> {
        return withContext(Dispatchers.IO) {
            try {
                val response = apiService.logout()
                
                // Logout dari Firebase
                firebaseAuth.signOut()
                
                // Clear session
                sessionManager.clearSession()

                if (response.isSuccessful && response.body() != null) {
                    ApiConfig.ApiResult.Success(response.body()!!)
                } else {
                    ApiConfig.ApiResult.Error(
                        response.code(),
                        response.errorBody()?.string() ?: "Logout failed"
                    )
                }
            } catch (e: Exception) {
                // Clear session meskipun terjadi error
                sessionManager.clearSession()
                firebaseAuth.signOut()
                
                ApiConfig.ApiResult.Error(-1, e.message ?: "Unknown error occurred")
            }
        }
    }

    /**
     * Reset password
     */
    suspend fun forgotPassword(email: String): ApiConfig.ApiResult<ApiConfig.BaseResponse> {
        return withContext(Dispatchers.IO) {
            try {
                // Kirim reset password email melalui Firebase
                firebaseAuth.sendPasswordResetEmail(email).await()

                // Notify backend
                val response = apiService.forgotPassword(ApiConfig.ForgotPasswordRequest(email))

                if (response.isSuccessful && response.body() != null) {
                    ApiConfig.ApiResult.Success(response.body()!!)
                } else {
                    ApiConfig.ApiResult.Error(
                        response.code(),
                        response.errorBody()?.string() ?: "Password reset failed"
                    )
                }
            } catch (e: Exception) {
                ApiConfig.ApiResult.Error(-1, e.message ?: "Unknown error occurred")
            }
        }
    }

    /**
     * Update FCM Token
     */
    suspend fun updateFCMToken(token: String): ApiConfig.ApiResult<ApiConfig.BaseResponse> {
        return withContext(Dispatchers.IO) {
            try {
                val response = apiService.updateFCMToken(ApiConfig.UpdateFCMTokenRequest(token))
                
                if (response.isSuccessful && response.body() != null) {
                    // Simpan token ke session
                    sessionManager.saveFCMToken(token)
                    
                    ApiConfig.ApiResult.Success(response.body()!!)
                } else {
                    ApiConfig.ApiResult.Error(
                        response.code(),
                        response.errorBody()?.string() ?: "Failed to update FCM token"
                    )
                }
            } catch (e: Exception) {
                ApiConfig.ApiResult.Error(-1, e.message ?: "Unknown error occurred")
            }
        }
    }
}
