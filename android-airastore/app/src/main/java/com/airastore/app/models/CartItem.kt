package com.airastore.app.models

import android.os.Parcelable
import com.google.gson.annotations.SerializedName
import kotlinx.parcelize.Parcelize

@Parcelize
data class CartItem(
    @SerializedName("id")
    val id: String,

    @SerializedName("product_id")
    val productId: String,

    @SerializedName("name")
    val name: String,

    @SerializedName("image")
    val image: String,

    @SerializedName("price")
    val price: Double,

    @SerializedName("original_price")
    val originalPrice: Double,

    @SerializedName("quantity")
    val quantity: Int,

    @SerializedName("stock")
    val stock: Int,

    @SerializedName("variant")
    val variant: String? = null,

    @SerializedName("seller")
    val seller: Seller,

    @SerializedName("created_at")
    val createdAt: String,

    @SerializedName("updated_at")
    val updatedAt: String
) : Parcelable {
    val subtotal: Double
        get() = price * quantity

    val isDiscounted: Boolean
        get() = originalPrice > price

    val discountPercentage: Int
        get() = if (isDiscounted) {
            ((originalPrice - price) / originalPrice * 100).toInt()
        } else {
            0
        }
}

// Response wrappers
data class CartResponse(
    @SerializedName("success")
    val success: Boolean,

    @SerializedName("message")
    val message: String?,

    @SerializedName("data")
    val data: CartData
)

data class CartData(
    @SerializedName("items")
    val items: List<CartItem>,

    @SerializedName("total_items")
    val totalItems: Int,

    @SerializedName("subtotal")
    val subtotal: Double,

    @SerializedName("shipping")
    val shipping: Double,

    @SerializedName("tax")
    val tax: Double,

    @SerializedName("total")
    val total: Double
)

data class CartUpdateRequest(
    @SerializedName("product_id")
    val productId: String,

    @SerializedName("quantity")
    val quantity: Int,

    @SerializedName("variant")
    val variant: String? = null
)

data class CartUpdateResponse(
    @SerializedName("success")
    val success: Boolean,

    @SerializedName("message")
    val message: String?,

    @SerializedName("data")
    val data: CartItem
)
