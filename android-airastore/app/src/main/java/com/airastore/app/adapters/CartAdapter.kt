package com.airastore.app.adapters

import android.view.LayoutInflater
import android.view.ViewGroup
import androidx.recyclerview.widget.DiffUtil
import androidx.recyclerview.widget.ListAdapter
import androidx.recyclerview.widget.RecyclerView
import com.airastore.app.R
import com.airastore.app.databinding.ItemCartBinding
import com.airastore.app.models.CartItem
import com.airastore.app.utils.Extensions.loadImageWithPlaceholder
import com.airastore.app.utils.Extensions.toRupiah
import com.airastore.app.utils.gone
import com.airastore.app.utils.show

class CartAdapter(
    private val onQuantityChanged: (CartItem, Int) -> Unit,
    private val onRemoveClick: (CartItem) -> Unit
) : ListAdapter<CartItem, CartAdapter.CartViewHolder>(DIFF_CALLBACK) {

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): CartViewHolder {
        val binding = ItemCartBinding.inflate(
            LayoutInflater.from(parent.context),
            parent,
            false
        )
        return CartViewHolder(binding, onQuantityChanged, onRemoveClick)
    }

    override fun onBindViewHolder(holder: CartViewHolder, position: Int) {
        holder.bind(getItem(position))
    }

    class CartViewHolder(
        private val binding: ItemCartBinding,
        private val onQuantityChanged: (CartItem, Int) -> Unit,
        private val onRemoveClick: (CartItem) -> Unit
    ) : RecyclerView.ViewHolder(binding.root) {

        fun bind(item: CartItem) {
            with(binding) {
                // Load product image
                productImage.loadImageWithPlaceholder(
                    item.image,
                    R.drawable.placeholder_product
                )

                // Product name
                productName.text = item.name

                // Variant (if any)
                if (item.variant != null) {
                    variantText.text = item.variant
                    variantText.show()
                } else {
                    variantText.gone()
                }

                // Price
                if (item.isDiscounted) {
                    originalPrice.apply {
                        text = item.originalPrice.toRupiah()
                        paintFlags = android.graphics.Paint.STRIKE_THRU_TEXT_FLAG
                        show()
                    }
                    discountBadge.apply {
                        text = "-${item.discountPercentage}%"
                        show()
                    }
                } else {
                    originalPrice.gone()
                    discountBadge.gone()
                }
                price.text = item.price.toRupiah()

                // Seller name
                sellerName.text = item.seller.name

                // Quantity
                quantityText.text = item.quantity.toString()
                
                // Decrease quantity button
                decreaseButton.apply {
                    isEnabled = item.quantity > 1
                    setOnClickListener {
                        onQuantityChanged(item, item.quantity - 1)
                    }
                }

                // Increase quantity button
                increaseButton.apply {
                    isEnabled = item.quantity < item.stock
                    setOnClickListener {
                        onQuantityChanged(item, item.quantity + 1)
                    }
                }

                // Remove button
                removeButton.setOnClickListener {
                    onRemoveClick(item)
                }

                // Subtotal
                subtotal.text = item.subtotal.toRupiah()
            }
        }
    }

    companion object {
        private val DIFF_CALLBACK = object : DiffUtil.ItemCallback<CartItem>() {
            override fun areItemsTheSame(oldItem: CartItem, newItem: CartItem): Boolean {
                return oldItem.id == newItem.id
            }

            override fun areContentsTheSame(oldItem: CartItem, newItem: CartItem): Boolean {
                return oldItem == newItem
            }
        }
    }
}
