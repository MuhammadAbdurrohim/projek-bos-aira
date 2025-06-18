package com.airastore.app.viewmodels

import android.content.Context
import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import com.airastore.app.api.ApiConfig
import com.airastore.app.repository.AuthRepository
import com.airastore.app.utils.SessionManager

/**
 * Factory untuk membuat instance ViewModel dengan dependensinya
 */
class ViewModelFactory private constructor(
    private val context: Context
) : ViewModelProvider.NewInstanceFactory() {

    companion object {
        @Volatile
        private var instance: ViewModelFactory? = null

        fun getInstance(context: Context): ViewModelFactory =
            instance ?: synchronized(this) {
                instance ?: ViewModelFactory(context).also { instance = it }
            }
    }

    @Suppress("UNCHECKED_CAST")
    override fun <T : ViewModel> create(modelClass: Class<T>): T {
        return when {
            // AuthViewModel
            modelClass.isAssignableFrom(AuthViewModel::class.java) -> {
                val sessionManager = SessionManager(context)
                val apiService = ApiConfig.getApiService(sessionManager)
                val repository = AuthRepository(apiService, sessionManager)
                AuthViewModel(repository) as T
            }

            // ProductViewModel
            modelClass.isAssignableFrom(ProductViewModel::class.java) -> {
                val sessionManager = SessionManager(context)
                val apiService = ApiConfig.getApiService(sessionManager)
                val repository = ProductRepository(apiService)
                ProductViewModel(repository) as T
            }

            // CartViewModel
            modelClass.isAssignableFrom(CartViewModel::class.java) -> {
                val sessionManager = SessionManager(context)
                val apiService = ApiConfig.getApiService(sessionManager)
                val repository = CartRepository(apiService)
                CartViewModel(repository) as T
            }

            // OrderViewModel
            modelClass.isAssignableFrom(OrderViewModel::class.java) -> {
                val sessionManager = SessionManager(context)
                val apiService = ApiConfig.getApiService(sessionManager)
                val repository = OrderRepository(apiService)
                OrderViewModel(repository) as T
            }

            // ProfileViewModel
            modelClass.isAssignableFrom(ProfileViewModel::class.java) -> {
                val sessionManager = SessionManager(context)
                val apiService = ApiConfig.getApiService(sessionManager)
                val repository = ProfileRepository(apiService, sessionManager)
                ProfileViewModel(repository) as T
            }

            // LiveStreamViewModel
            modelClass.isAssignableFrom(LiveStreamViewModel::class.java) -> {
                val sessionManager = SessionManager(context)
                val apiService = ApiConfig.getApiService(sessionManager)
                val repository = LiveStreamRepository(apiService)
                LiveStreamViewModel(repository) as T
            }

            // Tambahkan ViewModel lain di sini

            else -> throw IllegalArgumentException("Unknown ViewModel class: ${modelClass.name}")
        }
    }
}

// Placeholder class untuk repository yang belum dibuat
private class ProductRepository(private val apiService: ApiService)
private class CartRepository(private val apiService: ApiService)
private class OrderRepository(private val apiService: ApiService)
private class ProfileRepository(
    private val apiService: ApiService,
    private val sessionManager: SessionManager
)
private class LiveStreamRepository(private val apiService: ApiService)

// Placeholder class untuk ViewModel yang belum dibuat
private class ProductViewModel(private val repository: ProductRepository) : ViewModel()
private class CartViewModel(private val repository: CartRepository) : ViewModel()
private class OrderViewModel(private val repository: OrderRepository) : ViewModel()
private class ProfileViewModel(private val repository: ProfileRepository) : ViewModel()
private class LiveStreamViewModel(private val repository: LiveStreamRepository) : ViewModel()
