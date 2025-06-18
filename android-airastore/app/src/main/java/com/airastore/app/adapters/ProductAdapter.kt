package com.airastore.app.adapters

import android.view.LayoutInflater
import android.view.ViewGroup
import androidx.recyclerview.widget.DiffUtil
import androidx.recyclerview.widget.ListAdapter
import androidx.recyclerview.widget.RecyclerView
import com.airastore.app.R
import com.airastore.app.databinding.ItemProductBinding
import com.airastore.app.models.Product
import com.airastore.app.utils.Extensions.loadImageWithPlaceholder
import com.airastore.app.utils.Extensions.toRupiah

class ProductAdapter(
    private val onItemClick: (Product) -> Unit
) : ListAdapter<Product, ProductAdapter.ProductViewHolder>(DIFF_CALLBACK) {

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ProductViewHolder {
        val binding = ItemProductBinding.inflate(
            LayoutInflater.from(parent.context),
            parent,
            false
        )
        return ProductViewHolder(binding, onItemClick)
    }

    override fun onBindViewHolder(holder: ProductViewHolder, position: Int) {
        holder.bind(getItem(position))
    }

    class ProductViewHolder(
        private val binding: ItemProductBinding,
        private val onItemClick: (Product) -> Unit
    ) : RecyclerView.ViewHolder(binding.root) {

        fun bind(product: Product) {
            with(binding) {
                // Load gambar produk
                ivProduct.loadImageWithPlaceholder(
                    product.thumbnail,
                    R.drawable.placeholder_product
                )

                // Set nama produk
                tvName.text = product.name

                // Set harga
                if (product.salePrice != null) {
                    // Jika ada harga diskon
                    tvPrice.text = product.salePrice.toRupiah()
                    tvOriginalPrice.apply {
                        text = product.price.toRupiah()
                        paintFlags = android.graphics.Paint.STRIKE_THRU_TEXT_FLAG
                    }
                    // Tampilkan badge diskon
                    tvDiscount.apply {
                        text = "-${product.discountPercentage}%"
                        visibility = android.view.View.VISIBLE
                    }
                } else {
                    // Jika tidak ada diskon
                    tvPrice.text = product.price.toRupiah()
                    tvOriginalPrice.visibility = android.view.View.GONE
                    tvDiscount.visibility = android.view.View.GONE
                }

                // Set rating
                if (product.reviewCount > 0) {
                    ratingBar.rating = product.rating
                    tvRating.text = String.format("%.1f", product.rating)
                    tvReviewCount.text = "(${product.reviewCount})"
                    ratingContainer.visibility = android.view.View.VISIBLE
                } else {
                    ratingContainer.visibility = android.view.View.GONE
                }

                // Set badge stok habis
                if (product.stock <= 0) {
                    tvOutOfStock.visibility = android.view.View.VISIBLE
                } else {
                    tvOutOfStock.visibility = android.view.View.GONE
                }

                // Set badge produk baru
                if (product.isNew) {
                    tvNew.visibility = android.view.View.VISIBLE
                } else {
                    tvNew.visibility = android.view.View.GONE
                }

                // Set jumlah terjual
                if (product.sold > 0) {
                    tvSold.text = root.context.getString(R.string.sold, product.sold.toString())
                    tvSold.visibility = android.view.View.VISIBLE
                } else {
                    tvSold.visibility = android.view.View.GONE
                }

                // Set click listener
                root.setOnClickListener {
                    onItemClick(product)
                }
            }
        }
    }

    companion object {
        private val DIFF_CALLBACK = object : DiffUtil.ItemCallback<Product>() {
            override fun areItemsTheSame(oldItem: Product, newItem: Product): Boolean {
                return oldItem.id == newItem.id
            }

            override fun areContentsTheSame(oldItem: Product, newItem: Product): Boolean {
                return oldItem == newItem
            }
        }
    }
}

// ViewHolder untuk tampilan grid
class ProductGridViewHolder(
    private val binding: ItemProductBinding,
    private val onItemClick: (Product) -> Unit
) : RecyclerView.ViewHolder(binding.root) {

    fun bind(product: Product) {
        with(binding) {
            // Sama seperti ProductViewHolder.bind() tetapi dengan layout yang berbeda
            // untuk tampilan grid
            // ...
        }
    }
}

// ViewHolder untuk tampilan list
class ProductListViewHolder(
    private val binding: ItemProductBinding,
    private val onItemClick: (Product) -> Unit
) : RecyclerView.ViewHolder(binding.root) {

    fun bind(product: Product) {
        with(binding) {
            // Sama seperti ProductViewHolder.bind() tetapi dengan layout yang berbeda
            // untuk tampilan list
            // ...
        }
    }
}

// ViewHolder untuk tampilan carousel
class ProductCarouselViewHolder(
    private val binding: ItemProductBinding,
    private val onItemClick: (Product) -> Unit
) : RecyclerView.ViewHolder(binding.root) {

    fun bind(product: Product) {
        with(binding) {
            // Sama seperti ProductViewHolder.bind() tetapi dengan layout yang berbeda
            // untuk tampilan carousel
            // ...
        }
    }
}
