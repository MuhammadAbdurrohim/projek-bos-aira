package com.airastore.app.fragments

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.fragment.app.Fragment
import androidx.lifecycle.lifecycleScope
import androidx.recyclerview.widget.LinearLayoutManager
import com.airastore.app.R
import com.airastore.app.adapters.ProductAdapter
import com.airastore.app.databinding.FragmentHomeBinding
import com.airastore.app.models.Product
import com.airastore.app.utils.gone
import com.airastore.app.utils.show
import com.airastore.app.utils.showSnackbar
import com.airastore.app.viewmodels.ProductViewModel
import com.airastore.app.viewmodels.getViewModel
import kotlinx.coroutines.launch

class HomeFragment : Fragment() {

    private var _binding: FragmentHomeBinding? = null
    private val binding get() = _binding!!

    private lateinit var viewModel: ProductViewModel
    private lateinit var productAdapter: ProductAdapter

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentHomeBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        
        viewModel = getViewModel()
        setupViews()
        observeViewModel()
        loadData()
    }

    private fun setupViews() {
        // Setup SwipeRefreshLayout
        binding.swipeRefresh.setOnRefreshListener {
            loadData()
        }

        // Setup RecyclerView
        productAdapter = ProductAdapter(
            onProductClick = { product ->
                navigateToProductDetail(product)
            },
            onAddToCartClick = { product ->
                addToCart(product)
            }
        )

        binding.recyclerView.apply {
            layoutManager = LinearLayoutManager(requireContext())
            adapter = productAdapter
            setHasFixedSize(true)
        }

        // Setup search
        binding.searchView.setOnQueryTextListener(object : androidx.appcompat.widget.SearchView.OnQueryTextListener {
            override fun onQueryTextSubmit(query: String?): Boolean {
                query?.let { searchProducts(it) }
                return true
            }

            override fun onQueryTextChange(newText: String?): Boolean {
                if (newText.isNullOrBlank()) {
                    loadData()
                }
                return true
            }
        })

        // Setup category chips
        setupCategoryChips()

        // Setup banner slider
        setupBannerSlider()

        // Setup live stream preview
        setupLiveStreamPreview()
    }

    private fun observeViewModel() {
        // Observe products
        viewModel.products.observe(viewLifecycleOwner) { result ->
            when (result) {
                is ApiResult.Success -> {
                    binding.swipeRefresh.isRefreshing = false
                    binding.progressBar.gone()
                    
                    if (result.data.isEmpty()) {
                        showEmptyState()
                    } else {
                        hideEmptyState()
                        productAdapter.submitList(result.data)
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
                        binding.root.showSnackbar(getString(R.string.added_to_cart))
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

        // Observe banners
        viewModel.banners.observe(viewLifecycleOwner) { banners ->
            // Update banner slider
        }

        // Observe live streams
        viewModel.liveStreams.observe(viewLifecycleOwner) { streams ->
            // Update live stream preview
        }
    }

    private fun loadData() {
        viewLifecycleOwner.lifecycleScope.launch {
            viewModel.getProducts()
            viewModel.getBanners()
            viewModel.getLiveStreams()
        }
    }

    private fun searchProducts(query: String) {
        viewLifecycleOwner.lifecycleScope.launch {
            viewModel.searchProducts(query)
        }
    }

    private fun setupCategoryChips() {
        // Add category chips dynamically
        viewModel.categories.observe(viewLifecycleOwner) { categories ->
            binding.chipGroup.removeAllViews()
            categories.forEach { category ->
                val chip = com.google.android.material.chip.Chip(requireContext()).apply {
                    text = category.name
                    isCheckable = true
                    setOnCheckedChangeListener { _, isChecked ->
                        if (isChecked) {
                            filterByCategory(category.id)
                        }
                    }
                }
                binding.chipGroup.addView(chip)
            }
        }
    }

    private fun setupBannerSlider() {
        // Setup ViewPager2 for banners
    }

    private fun setupLiveStreamPreview() {
        // Setup live stream preview widget
    }

    private fun showEmptyState() {
        binding.emptyState.root.show()
        binding.recyclerView.gone()
    }

    private fun hideEmptyState() {
        binding.emptyState.root.gone()
        binding.recyclerView.show()
    }

    private fun navigateToProductDetail(product: Product) {
        // Navigate to product detail
    }

    private fun addToCart(product: Product) {
        viewLifecycleOwner.lifecycleScope.launch {
            viewModel.addToCart(product.id, 1)
        }
    }

    private fun filterByCategory(categoryId: String) {
        viewLifecycleOwner.lifecycleScope.launch {
            viewModel.getProductsByCategory(categoryId)
        }
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }

    companion object {
        private const val TAG = "HomeFragment"
    }
}
