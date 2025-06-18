package com.airastore.app.fragments

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.fragment.app.Fragment
import androidx.fragment.app.viewModels
import androidx.navigation.fragment.findNavController
import androidx.recyclerview.widget.LinearLayoutManager
import com.airastore.app.R
import com.airastore.app.adapters.CartAdapter
import com.airastore.app.databinding.FragmentCartBinding
import com.airastore.app.utils.gone
import com.airastore.app.utils.show
import com.airastore.app.utils.showSnackbar
import com.airastore.app.viewmodels.CartViewModel
import com.airastore.app.viewmodels.ViewModelFactory

class CartFragment : Fragment() {

    private var _binding: FragmentCartBinding? = null
    private val binding get() = _binding!!

    private val viewModel: CartViewModel by viewModels {
        ViewModelFactory.getInstance(requireContext())
    }

    private lateinit var cartAdapter: CartAdapter

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentCartBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        setupViews()
        observeViewModel()
        loadData()
    }

    private fun setupViews() {
        // Setup RecyclerView
        cartAdapter = CartAdapter(
            onQuantityChanged = { cartItem, quantity ->
                viewModel.updateCartItemQuantity(cartItem.id, quantity)
            },
            onRemoveClick = { cartItem ->
                viewModel.removeFromCart(cartItem.id)
            }
        )

        binding.recyclerView.apply {
            layoutManager = LinearLayoutManager(requireContext())
            adapter = cartAdapter
            setHasFixedSize(true)
        }

        // Setup SwipeRefreshLayout
        binding.swipeRefresh.setOnRefreshListener {
            loadData()
        }

        // Setup checkout button
        binding.checkoutButton.setOnClickListener {
            findNavController().navigate(R.id.action_cart_to_checkout)
        }
    }

    private fun observeViewModel() {
        // Observe cart items
        viewModel.cartItems.observe(viewLifecycleOwner) { result ->
            when (result) {
                is ApiResult.Success -> {
                    binding.swipeRefresh.isRefreshing = false
                    binding.progressBar.gone()
                    
                    if (result.data.isEmpty()) {
                        showEmptyState()
                    } else {
                        hideEmptyState()
                        cartAdapter.submitList(result.data)
                        updateTotalPrice(result.data)
                    }
                }
                is ApiResult.Error -> {
                    binding.swipeRefresh.isRefreshing = false
                    binding.progressBar.gone()
                    binding.root.showSnackbar(result.message)
                }
                is ApiResult.Loading -> {
                    if (!binding.swipeRefresh.isRefreshing) {
                        binding.progressBar.show()
                    }
                }
            }
        }

        // Observe cart updates
        viewModel.cartUpdateResult.observe(viewLifecycleOwner) { event ->
            event.getContentIfNotHandled()?.let { result ->
                when (result) {
                    is ApiResult.Success -> {
                        binding.root.showSnackbar(getString(R.string.cart_updated))
                        loadData()
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
    }

    private fun loadData() {
        viewModel.getCartItems()
    }

    private fun updateTotalPrice(cartItems: List<CartItem>) {
        val total = cartItems.sumOf { it.price * it.quantity }
        binding.totalPrice.text = getString(R.string.price_format, total)
        binding.checkoutButton.isEnabled = cartItems.isNotEmpty()
    }

    private fun showEmptyState() {
        binding.emptyState.root.show()
        binding.recyclerView.gone()
        binding.checkoutContainer.gone()
    }

    private fun hideEmptyState() {
        binding.emptyState.root.gone()
        binding.recyclerView.show()
        binding.checkoutContainer.show()
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }

    companion object {
        private const val TAG = "CartFragment"
    }
}
