package com.airastore.app.models

import android.os.Parcelable
import com.google.gson.annotations.SerializedName
import kotlinx.parcelize.Parcelize

@Parcelize
data class Product(
    @SerializedName("id")
    val id: String,

    @SerializedName("name")
    val name: String,

    @SerializedName("description")
    val description: String,

    @SerializedName("price")
    val price: Double,

    @SerializedName("sale_price")
    val salePrice: Double? = null,

    @SerializedName("images")
    val images: List<String>,

    @SerializedName("thumbnail")
    val thumbnail: String,

    @SerializedName("category")
    val category: Category,

    @SerializedName("seller")
    val seller: Seller,

    @SerializedName("rating")
    val rating: Float = 0f,

    @SerializedName("review_count")
    val reviewCount: Int = 0,

    @SerializedName("stock")
    val stock: Int = 0,

    @SerializedName("sold_count")
    val soldCount: Int = 0,

    @SerializedName("is_new")
    val isNew: Boolean = false,

    @SerializedName("is_featured")
    val isFeatured: Boolean = false,

    @SerializedName("discount_percentage")
    val discountPercentage: Int = 0,

    @SerializedName("variants")
    val variants: List<ProductVariant> = emptyList(),

    @SerializedName("specifications")
    val specifications: Map<String, String> = emptyMap(),

    @SerializedName("created_at")
    val createdAt: String,

    @SerializedName("updated_at")
    val updatedAt: String
) : Parcelable

@Parcelize
data class Category(
    @SerializedName("id")
    val id: String,

    @SerializedName("name")
    val name: String,

    @SerializedName("icon")
    val icon: String? = null,

    @SerializedName("parent_id")
    val parentId: String? = null,

    @SerializedName("level")
    val level: Int = 0,

    @SerializedName("product_count")
    val productCount: Int = 0
) : Parcelable

@Parcelize
data class Seller(
    @SerializedName("id")
    val id: String,

    @SerializedName("name")
    val name: String,

    @SerializedName("avatar")
    val avatar: String? = null,

    @SerializedName("rating")
    val rating: Float = 0f,

    @SerializedName("review_count")
    val reviewCount: Int = 0,

    @SerializedName("product_count")
    val productCount: Int = 0,

    @SerializedName("follower_count")
    val followerCount: Int = 0,

    @SerializedName("is_verified")
    val isVerified: Boolean = false,

    @SerializedName("is_official")
    val isOfficial: Boolean = false
) : Parcelable

@Parcelize
data class ProductVariant(
    @SerializedName("id")
    val id: String,

    @SerializedName("name")
    val name: String,

    @SerializedName("options")
    val options: List<VariantOption>
) : Parcelable

@Parcelize
data class VariantOption(
    @SerializedName("id")
    val id: String,

    @SerializedName("name")
    val name: String,

    @SerializedName("price")
    val price: Double? = null,

    @SerializedName("stock")
    val stock: Int = 0,

    @SerializedName("image")
    val image: String? = null
) : Parcelable

// Response wrappers
data class ProductListResponse(
    @SerializedName("success")
    val success: Boolean,

    @SerializedName("message")
    val message: String?,

    @SerializedName("data")
    val data: List<Product>,

    @SerializedName("pagination")
    val pagination: Pagination
)

data class ProductDetailResponse(
    @SerializedName("success")
    val success: Boolean,

    @SerializedName("message")
    val message: String?,

    @SerializedName("data")
    val data: Product
)

data class Pagination(
    @SerializedName("current_page")
    val currentPage: Int,

    @SerializedName("total_pages")
    val totalPages: Int,

    @SerializedName("per_page")
    val perPage: Int,

    @SerializedName("total_items")
    val totalItems: Int,

    @SerializedName("has_next_page")
    val hasNextPage: Boolean,

    @SerializedName("has_previous_page")
    val hasPreviousPage: Boolean
)
