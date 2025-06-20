package com.airastore.app

import android.os.Bundle
import android.view.View
import androidx.activity.viewModels
import androidx.appcompat.app.AppCompatActivity
import androidx.navigation.NavController
import androidx.navigation.fragment.NavHostFragment
import androidx.navigation.ui.setupWithNavController
import com.airastore.app.databinding.ActivityMainBinding
import com.airastore.app.utils.SessionManager
import com.airastore.app.viewmodels.AuthViewModel
import com.airastore.app.viewmodels.ViewModelFactory
import com.google.android.material.bottomnavigation.BottomNavigationView
import com.google.firebase.messaging.FirebaseMessaging

class MainActivity : AppCompatActivity() {

    private lateinit var binding: ActivityMainBinding
    private lateinit var navController: NavController
    private lateinit var sessionManager: SessionManager

    private val authViewModel: AuthViewModel by viewModels {
        ViewModelFactory.getInstance(this)
    }

    private val cartViewModel: CartViewModel by viewModels {
        ViewModelFactory.getInstance(this)
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityMainBinding.inflate(layoutInflater)
        setContentView(binding.root)

        sessionManager = SessionManager(this)
        setupNavigation()
        setupBottomNavigation()
        observeCartUpdates()
        updateFCMToken()
        handleIntent(intent)
    }

    private fun setupNavigation() {
        val navHostFragment = supportFragmentManager
            .findFragmentById(R.id.fragment_container) as NavHostFragment
        navController = navHostFragment.navController

        // Setup bottom navigation dengan navigation controller
        binding.bottomNavigation.setupWithNavController(navController)

        // Listener untuk perubahan destinasi navigasi
        navController.addOnDestinationChangedListener { _, destination, _ ->
            // Sembunyikan bottom navigation pada halaman tertentu
            when (destination.id) {
                R.id.productDetailFragment,
                R.id.checkoutFragment,
                R.id.liveStreamFragment -> {
                    binding.bottomNavigation.visibility = View.GONE
                }
                else -> {
                    binding.bottomNavigation.visibility = View.VISIBLE
                }
            }
        }
    }

    private fun setupBottomNavigation() {
        binding.bottomNavigation.apply {
            // Listener untuk item bottom navigation
            setOnItemSelectedListener { item ->
                when (item.itemId) {
                    R.id.nav_home -> {
                        navController.navigate(R.id.homeFragment)
                        true
                    }
                    R.id.nav_category -> {
                        navController.navigate(R.id.categoryFragment)
                        true
                    }
                    R.id.nav_cart -> {
                        navController.navigate(R.id.cartFragment)
                        true
                    }
                    R.id.nav_account -> {
                        navController.navigate(R.id.nav_account)
                        true
                    }
                    R.id.nav_order_history -> {
                        navController.navigate(R.id.nav_order_history)
                        true
                    }
                    R.id.nav_profile -> {
                        navController.navigate(R.id.profileFragment)
                        true
                    }
                    else -> false
                }
            }

            // Listener untuk reselect item bottom navigation
            setOnItemReselectedListener { item ->
                when (item.itemId) {
                    R.id.nav_home -> {
                        // Scroll ke atas jika di home
                        navController.popBackStack(R.id.homeFragment, false)
                    }
                    R.id.nav_category -> {
                        // Reset filter kategori
                        navController.popBackStack(R.id.categoryFragment, false)
                    }
                    R.id.nav_cart -> {
                        // Refresh cart
                        navController.popBackStack(R.id.cartFragment, false)
                    }
                    R.id.nav_profile -> {
                        // Tidak ada aksi khusus
                        navController.popBackStack(R.id.profileFragment, false)
                    }
                }
            }
        }

        // Update badge jumlah item di keranjang
        updateCartBadge(sessionManager.getCartCount())
    }

    private fun observeCartUpdates() {
        cartViewModel.cartItems.observe(this) { result ->
            when (result) {
                is ApiResult.Success -> {
                    val count = result.data.size
                    sessionManager.setCartCount(count)
                    updateCartBadge(count)
                }
                else -> { /* Handle error states if needed */ }
            }
        }
        // Initial load
        cartViewModel.getCartItems()
    }

    private fun updateCartBadge(count: Int) {
        val badge = binding.bottomNavigation.getOrCreateBadge(R.id.nav_cart)
        if (count > 0) {
            badge.isVisible = true
            badge.number = count
        } else {
            badge.isVisible = false
        }
    }

    private fun updateFCMToken() {
        FirebaseMessaging.getInstance().token.addOnCompleteListener { task ->
            if (task.isSuccessful) {
                val token = task.result
                authViewModel.updateFCMToken(token)
            }
        }
    }

    private fun handleIntent(intent: Intent?) {
        intent?.let {
            when {
                it.getBooleanExtra("open_chat", false) -> {
                    val senderId = it.getStringExtra("sender_id")
                    // TODO: Buka chat dengan sender
                }
                it.hasExtra("order_id") -> {
                    val orderId = it.getStringExtra("order_id")
                    // TODO: Buka detail order
                }
                it.hasExtra("stream_id") -> {
                    val streamId = it.getStringExtra("stream_id")
                    // TODO: Buka live stream
                }
            }
        }
    }

    override fun onNewIntent(intent: Intent?) {
        super.onNewIntent(intent)
        handleIntent(intent)
    }

    companion object {
        private const val TAG = "MainActivity"
    }
}
