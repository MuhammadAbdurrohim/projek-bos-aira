package com.airastore.app.views

import android.os.Bundle
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.airastore.app.R
import com.airastore.app.adapters.OrderProductAdapter
import com.airastore.app.databinding.ActivityOrderProductBinding
import com.airastore.app.models.OrderItem
import com.airastore.app.utils.Extensions.toRupiah
import com.airastore.app.viewmodels.OrderViewModel
import com.airastore.app.viewmodels.getViewModel
import kotlinx.coroutines.launch

class OrderProductActivity : AppCompatActivity() {

    private lateinit var binding: ActivityOrderProductBinding
    private lateinit var orderViewModel: OrderViewModel
    private lateinit var adapter: OrderProductAdapter

    private var orderItems: MutableList<OrderItem> = mutableListOf()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityOrderProductBinding.inflate(layoutInflater)
        setContentView(binding.root)

        orderViewModel = getViewModel()
        setupRecyclerView()
        observeViewModel()
        loadOrderItems()

        binding.btnPlaceOrder.setOnClickListener {
            placeOrder()
        }
    }

    private fun setupRecyclerView() {
        adapter = OrderProductAdapter { orderItem, newQuantity ->
            updateQuantity(orderItem, newQuantity)
        }
        binding.recyclerView.layoutManager = LinearLayoutManager(this)
        binding.recyclerView.adapter = adapter
    }

    private fun observeViewModel() {
        orderViewModel.orderResult.observe(this) { result ->
            when (result) {
                is ApiResult.Success -> {
                    Toast.makeText(this, getString(R.string.order_success), Toast.LENGTH_SHORT).show()
                    finish()
                }
                is ApiResult.Error -> {
                    Toast.makeText(this, result.message, Toast.LENGTH_SHORT).show()
                }
                is ApiResult.Loading -> {
                    // Show loading if needed
                }
            }
        }
    }

    private fun loadOrderItems() {
        // TODO: Load order items from intent or repository
        // For demo, use empty list
        adapter.submitList(orderItems)
        calculateTotal()
    }

    private fun updateQuantity(orderItem: OrderItem, newQuantity: Int) {
        val index = orderItems.indexOfFirst { it.id == orderItem.id }
        if (index != -1) {
            orderItems[index] = orderItems[index].copy(quantity = newQuantity)
            adapter.notifyItemChanged(index)
            calculateTotal()
        }
    }

    private fun calculateTotal() {
        val total = orderItems.sumOf { it.product.price * it.quantity }
        binding.tvTotalPrice.text = total.toRupiah()
    }

    private fun placeOrder() {
        lifecycleScope.launch {
            orderViewModel.placeOrder(orderItems)
        }
    }
}
