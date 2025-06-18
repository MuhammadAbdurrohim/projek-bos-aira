package com.airastore.app.fragments

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.fragment.app.Fragment
import androidx.fragment.app.viewModels
import androidx.navigation.fragment.findNavController
import androidx.recyclerview.widget.GridLayoutManager
import com.airastore.app.R
import com.airastore.app.adapters.ProductAdapter
import com.airastore.app.databinding.FragmentCategoryBinding
import com.airastore.app.utils.gone
import com.airastore.app.utils.show
import com.airastore.app.utils.showSnackbar
import com.airastore.app.viewmodels.ProductViewModel
import com.airastore.app.viewmodels.ViewModelFactory
import com.google.android.material.tabs.TabLayout

class CategoryFragment : Fragment() {

    private var _binding: FragmentCategoryBinding? = null
    private val binding get() = _binding!!

    private val viewModel: ProductViewModel by viewModels {
        ViewModelFactory.getInstance(requireContext())
    }

    private lateinit var productAdapter: ProductAdapter

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentCategoryBinding.inflate(inflater, container, false)
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
        productAdapter = ProductAdapter(
            onItemClick = { product ->
                findNavController().navigate(
                    CategoryFragmentDirections.actionCategoryToProductDetail(product.id)
                )
            }
        )

        binding.recyclerView.apply {
            layoutManager = GridLayoutManager(requireContext(), 2)
            adapter = productAdapter
            setHasFixedSize(true)
        }

        // Setup SwipeRefreshLayout
        binding.swipeRefresh.setOnRefreshListener {
            loadData()
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

        // Setup category tabs
        binding.tabLayout.addOnTabSelectedListener(object : TabLayout.OnTabSelectedListener {
            override fun onTabSelected(tab: TabLayout.Tab?) {
                tab?.let {
                    val categoryId = it.tag as? String
                    categoryId?.let { id -> loadProductsByCategory(id) }
                }
            }

            override fun onTabUnselected(tab: TabLayout.Tab?) {}
            override fun onTabReselected(tab: TabLayout.Tab?) {}
        })
    }

    private fun observeViewModel() {
        // Observe categories
        viewModel.categories.observe(viewLifecycleOwner) { categories ->
            binding.tabLayout.removeAllTabs()
            categories.forEach { category ->
                binding.tabLayout.addTab(
                    binding.tabLayout.newTab()
                        .setText(category.name)
                        .setTag(category.id)
                )
            }
        }

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
    }

    private fun loadData() {
        viewModel.getCategories()
        viewModel.getProducts()
    }

    private fun loadProductsByCategory(categoryId: String) {
        viewModel.getProductsByCategory(categoryId)
    }

    private fun searchProducts(query: String) {
        viewModel.searchProducts(query)
    }

    private fun showEmptyState() {
        binding.emptyState.root.show()
        binding.recyclerView.gone()
    }

    private fun hideEmptyState() {
        binding.emptyState.root.gone()
        binding.recyclerView.show()
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }

    companion object {
        private const val TAG = "CategoryFragment"
    }
}
