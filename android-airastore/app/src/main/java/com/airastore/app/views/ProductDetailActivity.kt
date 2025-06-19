package com.airastore.app.views

import android.os.Bundle
import android.widget.Button
import android.widget.ImageView
import android.widget.TextView
import androidx.appcompat.app.AppCompatActivity
import com.airastore.app.R
import com.airastore.app.models.Product
import com.bumptech.glide.Glide

class ProductDetailActivity : AppCompatActivity() {

    private lateinit var productImage: ImageView
    private lateinit var productName: TextView
    private lateinit var productPrice: TextView
    private lateinit var productDescription: TextView
    private lateinit var buttonBuy: Button

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_product_detail)

        productImage = findViewById(R.id.product_image)
        productName = findViewById(R.id.product_name)
        productPrice = findViewById(R.id.product_price)
        productDescription = findViewById(R.id.product_description)
        buttonBuy = findViewById(R.id.button_buy)

        val productId = intent.getStringExtra("productId")
        // TODO: Fetch product details from backend or local data source using productId
        // For now, using dummy product data
        val product = getProductDetails(productId)

        displayProductDetails(product)

        buttonBuy.setOnClickListener {
            // TODO: Implement purchase flow
        }
    }

    private fun getProductDetails(productId: String?): Product {
        // Dummy product for demonstration
        return Product(
            id = productId ?: "0",
            name = "Sample Product",
            description = "This is a sample product description.",
            price = 100000,
            imageUrl = "https://via.placeholder.com/600x400.png?text=Product+Image"
        )
    }

    private fun displayProductDetails(product: Product) {
        productName.text = product.name
        productPrice.text = "Rp ${product.price}"
        productDescription.text = product.description
        Glide.with(this)
            .load(product.imageUrl)
            .placeholder(R.drawable.ic_placeholder)
            .into(productImage)
    }
}
