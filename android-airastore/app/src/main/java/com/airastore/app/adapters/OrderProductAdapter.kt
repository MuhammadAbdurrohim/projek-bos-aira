package com.airastore.app.adapters

import android.view.LayoutInflater
import android.view.ViewGroup
import androidx.recyclerview.widget.DiffUtil
import androidx.recyclerview.widget.ListAdapter
import androidx.recyclerview.widget.RecyclerView
import com.airastore.app.R
import com.airastore.app.databinding.ItemOrderBinding
import com.airastore.app.models.OrderItem
import com.airastore.app.utils.Extensions.loadImageWithPlaceholder
import com.airastore.app.utils.Extensions.toRupiah

class OrderProductAdapter(
    private val onQuantityChange: (OrderItem, Int) -> Unit
) : ListAdapter<OrderItem, OrderProductAdapter.OrderProductViewHolder>(DIFF_CALLBACK) {

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): OrderProductViewHolder {
        val binding = ItemOrderBinding.inflate(
            LayoutInflater.from(parent.context),
            parent,
            false
        )
        return OrderProductViewHolder(binding, onQuantityChange)
    }

    override fun onBindViewHolder(holder: OrderProductViewHolder, position: Int) {
        holder.bind(getItem(position))
    }

    class OrderProductViewHolder(
        private val binding: ItemOrderBinding,
        private val onQuantityChange: (OrderItem, Int) -> Unit
    ) : RecyclerView.ViewHolder(binding.root) {

        fun bind(orderItem: OrderItem) {
            with(binding) {
                ivProduct.loadImageWithPlaceholder(
                    orderItem.product.thumbnail,
                    R.drawable.placeholder_product
                )
                tvName.text = orderItem.product.name
                tvPrice.text = orderItem.product.price.toRupiah()
                etQuantity.setText(orderItem.quantity.toString())

                etQuantity.setOnFocusChangeListener { _, hasFocus ->
                    if (!hasFocus) {
                        val newQuantity = etQuantity.text.toString().toIntOrNull() ?: orderItem.quantity
                        if (newQuantity != orderItem.quantity) {
                            onQuantityChange(orderItem, newQuantity)
                        }
                    }
                }
            }
        }
    }

    companion object {
        private val DIFF_CALLBACK = object : DiffUtil.ItemCallback<OrderItem>() {
            override fun areItemsTheSame(oldItem: OrderItem, newItem: OrderItem): Boolean {
                return oldItem.id == newItem.id
            }

            override fun areContentsTheSame(oldItem: OrderItem, newItem: OrderItem): Boolean {
                return oldItem == newItem
            }
        }
    }
}
