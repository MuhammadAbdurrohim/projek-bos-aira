package com.airastore.app.models

import android.os.Parcelable
import com.google.gson.annotations.SerializedName
import kotlinx.parcelize.Parcelize

@Parcelize
data class User(
    @SerializedName("id")
    val id: String,

    @SerializedName("name")
    val name: String,

    @SerializedName("email")
    val email: String,

    @SerializedName("phone")
    val phone: String? = null,

    @SerializedName("whatsapp")
    val whatsapp: String? = null,

    @SerializedName("avatar")
    val avatar: String? = null,

    @SerializedName("avatar_url")
    val avatarUrl: String? = null,

    @SerializedName("is_admin")
    val isAdmin: Boolean = false,

    @SerializedName("fcm_token")
    val fcmToken: String? = null,

    @SerializedName("created_at")
    val createdAt: String? = null,

    @SerializedName("updated_at")
    val updatedAt: String? = null,

    // Data alamat pengiriman
    @SerializedName("shipping_addresses")
    val shippingAddresses: List<ShippingAddress> = emptyList(),

    // Data metode pembayaran yang tersimpan
    @SerializedName("payment_methods")
    val paymentMethods: List<PaymentMethod> = emptyList(),

    // Data statistik user
    @SerializedName("stats")
    val stats: UserStats? = null
) : Parcelable

@Parcelize
data class ShippingAddress(
    @SerializedName("id")
    val id: String,

    @SerializedName("label")
    val label: String, // Contoh: "Rumah", "Kantor"

    @SerializedName("recipient_name")
    val recipientName: String,

    @SerializedName("phone")
    val phone: String,

    @SerializedName("address")
    val address: String,

    @SerializedName("city")
    val city: String,

    @SerializedName("province")
    val province: String,

    @SerializedName("postal_code")
    val postalCode: String,

    @SerializedName("is_primary")
    val isPrimary: Boolean = false,

    @SerializedName("notes")
    val notes: String? = null
) : Parcelable

@Parcelize
data class PaymentMethod(
    @SerializedName("id")
    val id: String,

    @SerializedName("type")
    val type: String, // "CREDIT_CARD", "PAYPAL", dll

    @SerializedName("provider")
    val provider: String,

    @SerializedName("account_number")
    val accountNumber: String? = null,

    @SerializedName("account_name")
    val accountName: String? = null,

    @SerializedName("is_primary")
    val isPrimary: Boolean = false,

    @SerializedName("expires_at")
    val expiresAt: String? = null
) : Parcelable

@Parcelize
data class UserStats(
    @SerializedName("total_orders")
    val totalOrders: Int = 0,

    @SerializedName("total_spent")
    val totalSpent: Double = 0.0,

    @SerializedName("wishlist_count")
    val wishlistCount: Int = 0,

    @SerializedName("cart_count")
    val cartCount: Int = 0,

    @SerializedName("review_count")
    val reviewCount: Int = 0,

    @SerializedName("average_rating")
    val averageRating: Float = 0f,

    @SerializedName("member_since")
    val memberSince: String? = null,

    @SerializedName("last_purchase")
    val lastPurchase: String? = null
) : Parcelable

// Response wrapper untuk API
data class UserResponse(
    @SerializedName("success")
    val success: Boolean,

    @SerializedName("message")
    val message: String?,

    @SerializedName("data")
    val data: User?
)

// Request body untuk update profile
data class UpdateProfileRequest(
    @SerializedName("name")
    val name: String,

    @SerializedName("phone")
    val phone: String?,

    @SerializedName("whatsapp")
    val whatsapp: String?,

    @SerializedName("photo")
    val photo: String? // Base64 encoded image
)

// Request body untuk update password
data class UpdatePasswordRequest(
    @SerializedName("current_password")
    val currentPassword: String,

    @SerializedName("new_password")
    val newPassword: String,

    @SerializedName("confirm_password")
    val confirmPassword: String
)
