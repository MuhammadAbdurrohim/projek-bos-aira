package com.airastore.app.fragments

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.fragment.app.Fragment
import androidx.recyclerview.widget.LinearLayoutManager
import com.airastore.app.adapters.OrderProductAdapter
import com.airastore.app.databinding.FragmentOrderHistoryBinding
import com.airastore.app.viewmodels.OrderViewModel
import com.airastore.app.viewmodels.getViewModel

class OrderHistoryFragment : Fragment() {

    private var _binding: FragmentOrderHistoryBinding? = null
    private val binding get() = _binding!!

    private lateinit var orderViewModel: OrderViewModel
    private lateinit var adapter: OrderProductAdapter

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentOrderHistoryBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        orderViewModel = getViewModel()
        setupRecyclerView()
        observeOrders()
        loadOrders()
    }

    private fun setupRecyclerView() {
        adapter = OrderProductAdapter { _, _ -> 
            // No quantity change in order history
        }
        binding.recyclerView.layoutManager = LinearLayoutManager(requireContext())
        binding.recyclerView.adapter = adapter
    }

    private fun observeOrders() {
        orderViewModel.orderHistory.observe(viewLifecycleOwner) { result ->
            when (result) {
                is ApiResult.Success -> {
                    adapter.submitList(result.data)
                    binding.emptyState.root.visibility = if (result.data.isEmpty()) View.VISIBLE else View.GONE
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

    private fun loadOrders() {
        orderViewModel.getOrderHistory()
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}
