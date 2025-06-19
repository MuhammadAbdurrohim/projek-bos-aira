package com.airastore.app.api

import com.airastore.app.BuildConfig
import com.airastore.app.utils.SessionManager
import okhttp3.Interceptor
import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import java.util.concurrent.TimeUnit

object ApiConfig {
    private const val BASE_URL = "http://10.0.2.2:8000/api/" // URL for Android Emulator to access localhost
    private const val TIMEOUT = 60L // Timeout dalam detik

    // ZegoCloud configuration
    const val ZEGO_APP_ID = 1662428519L
    const val ZEGO_SERVER_SECRET = "368956dc72e941792dfbb6e8474a3ddf"

    fun getApiService(sessionManager: SessionManager): ApiService {
        val retrofit = Retrofit.Builder()
            .baseUrl(BASE_URL)
            .addConverterFactory(GsonConverterFactory.create())
            .client(getOkHttpClient(sessionManager))
            .build()

        return retrofit.create(ApiService::class.java)
    }

    private fun getOkHttpClient(sessionManager: SessionManager): OkHttpClient {
        return OkHttpClient.Builder()
            .addInterceptor(getLoggingInterceptor())
            .addInterceptor(getAuthInterceptor(sessionManager))
            .addInterceptor(getHeaderInterceptor())
            .connectTimeout(TIMEOUT, TimeUnit.SECONDS)
            .readTimeout(TIMEOUT, TimeUnit.SECONDS)
            .writeTimeout(TIMEOUT, TimeUnit.SECONDS)
            .build()
    }

    private fun getLoggingInterceptor(): HttpLoggingInterceptor {
        return HttpLoggingInterceptor().apply {
            level = if (BuildConfig.DEBUG) {
                HttpLoggingInterceptor.Level.BODY
            } else {
                HttpLoggingInterceptor.Level.NONE
            }
        }
    }

    private fun getAuthInterceptor(sessionManager: SessionManager): Interceptor {
        return Interceptor { chain ->
            val originalRequest = chain.request()
            val token = sessionManager.getAuthToken()

            // Jika token tersedia, tambahkan ke header
            val request = if (token != null) {
                originalRequest.newBuilder()
                    .header("Authorization", "Bearer $token")
                    .build()
            } else {
                originalRequest
            }

            // Lanjutkan dengan request
            val response = chain.proceed(request)

            // Cek jika response adalah 401 (Unauthorized)
            if (response.code == 401) {
                // Token tidak valid atau expired
                sessionManager.clearSession()
                // TODO: Redirect ke halaman login
            }

            response
        }
    }

    private fun getHeaderInterceptor(): Interceptor {
        return Interceptor { chain ->
            val request = chain.request().newBuilder()
                .addHeader("Accept", "application/json")
                .addHeader("Content-Type", "application/json")
                .addHeader("X-Platform", "android")
                .addHeader("X-App-Version", BuildConfig.VERSION_NAME)
                .build()

            chain.proceed(request)
        }
    }

    // Fungsi untuk menghandle error response
    sealed class ApiResult<out T> {
        data class Success<out T>(val data: T) : ApiResult<T>()
        data class Error(val code: Int, val message: String) : ApiResult<Nothing>()
        object Loading : ApiResult<Nothing>()
    }

    // Extension function untuk mengkonversi Response ke ApiResult
    suspend fun <T> safeApiCall(apiCall: suspend () -> retrofit2.Response<T>): ApiResult<T> {
        return try {
            val response = apiCall()
            if (response.isSuccessful) {
                ApiResult.Success(response.body()!!)
            } else {
                ApiResult.Error(
                    code = response.code(),
                    message = response.errorBody()?.string() ?: "Unknown error occurred"
                )
            }
        } catch (e: Exception) {
            ApiResult.Error(
                code = -1,
                message = e.message ?: "Unknown error occurred"
            )
        }
    }

    // Data class untuk response dasar
    data class BaseResponse(
        val success: Boolean,
        val message: String?,
        val errors: Map<String, List<String>>? = null
    )

    // Data class untuk response autentikasi
    data class AuthResponse(
        val success: Boolean,
        val message: String?,
        val data: AuthData?
    )

    data class AuthData(
        val token: String,
        val user: com.airastore.app.models.User
    )

    // Request bodies
    data class LoginRequest(
        val email: String,
        val password: String,
        val fcm_token: String? = null
    )

    data class RegisterRequest(
        val name: String,
        val email: String,
        val password: String,
        val password_confirmation: String,
        val phone: String? = null,
        val whatsapp: String? = null,
        val fcm_token: String? = null
    )

    data class ForgotPasswordRequest(
        val email: String
    )

    data class UpdateFCMTokenRequest(
        val fcm_token: String
    )
}
