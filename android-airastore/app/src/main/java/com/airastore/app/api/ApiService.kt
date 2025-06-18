package com.airastore.app.api

import com.airastore.app.models.*
import retrofit2.Response
import retrofit2.http.*

interface ApiService {
    /**
     * Authentication
     */
    @POST("auth/login")
    suspend fun login(
        @Body request: LoginRequest
    ): Response<AuthResponse>

    @POST("auth/register")
    suspend fun register(
        @Body request: RegisterRequest
    ): Response<AuthResponse>

    @POST("auth/forgot-password")
    suspend fun forgotPassword(
        @Body request: ForgotPasswordRequest
    ): Response<BaseResponse>

    @POST("auth/reset-password")
    suspend fun resetPassword(
        @Body request: ResetPasswordRequest
    ): Response<BaseResponse>

    @POST("auth/refresh-token")
    suspend fun refreshToken(
        @Body request: RefreshTokenRequest
    ): Response<AuthResponse>

    /**
     * User
     */
    @GET("user/profile")
    suspend fun getProfile(): Response<UserResponse>

    @PUT("user/profile")
    suspend fun updateProfile(
        @Body request: UpdateProfileRequest
    ): Response<UserResponse>

    @PUT("user/password")
    suspend fun updatePassword(
        @Body request: UpdatePasswordRequest
    ): Response<BaseResponse>

    @PUT("user/fcm-token")
    suspend fun updateFcmToken(
        @Body request: UpdateFcmTokenRequest
    ): Response<BaseResponse>

    /**
     * Products
     */
    @GET("products")
    suspend fun getProducts(
        @Query("page") page: Int,
        @Query("limit") limit: Int,
        @Query("category") category: String? = null,
        @Query("search") search: String? = null,
        @Query("sort") sort: String? = null,
        @Query("min_price") minPrice: Double? = null,
        @Query("max_price") maxPrice: Double? = null
    ): Response<ProductListResponse>

    @GET("products/{id}")
    suspend fun getProduct(
        @Path("id") id: String
    ): Response<ProductResponse>

    /**
     * Cart
     */
    @GET("cart")
    suspend fun getCart(): Response<CartResponse>

    @POST("cart/items")
    suspend fun addToCart(
        @Body request: AddToCartRequest
    ): Response<CartResponse>

    @PUT("cart/items/{id}")
    suspend fun updateCartItem(
        @Path("id") id: String,
        @Body request: UpdateCartItemRequest
    ): Response<CartResponse>

    @DELETE("cart/items/{id}")
    suspend fun removeFromCart(
        @Path("id") id: String
    ): Response<CartResponse>

    /**
     * Orders
     */
    @POST("orders")
    suspend fun createOrder(
        @Body request: CreateOrderRequest
    ): Response<OrderResponse>

    @GET("orders")
    suspend fun getOrders(
        @Query("page") page: Int,
        @Query("limit") limit: Int,
        @Query("status") status: String? = null
    ): Response<OrderListResponse>

    @GET("orders/{id}")
    suspend fun getOrder(
        @Path("id") id: String
    ): Response<OrderResponse>

    /**
     * Live Streams
     */
    @GET("live-streams")
    suspend fun getLiveStreams(
        @Query("page") page: Int,
        @Query("limit") limit: Int,
        @Query("status") status: String? = null
    ): Response<LiveStreamListResponse>

    @POST("live-streams")
    suspend fun createLiveStream(
        @Body request: CreateLiveStreamRequest
    ): Response<LiveStreamResponse>

    @GET("live-streams/{id}")
    suspend fun getLiveStream(
        @Path("id") id: String
    ): Response<LiveStreamResponse>

    @PUT("live-streams/{id}")
    suspend fun updateLiveStream(
        @Path("id") id: String,
        @Body request: UpdateLiveStreamRequest
    ): Response<LiveStreamResponse>

    @DELETE("live-streams/{id}")
    suspend fun deleteLiveStream(
        @Path("id") id: String
    ): Response<BaseResponse>
}

// Request and Response classes
data class LoginRequest(
    val email: String,
    val password: String,
    val fcmToken: String? = null
)

data class RegisterRequest(
    val name: String,
    val email: String,
    val password: String,
    val phone: String? = null,
    val whatsapp: String? = null,
    val fcmToken: String? = null
)

data class AuthResponse(
    val success: Boolean,
    val message: String?,
    val data: AuthData?
)

data class AuthData(
    val token: String,
    val user: User
)

data class BaseResponse(
    val success: Boolean,
    val message: String?
)

data class ForgotPasswordRequest(
    val email: String
)

data class ResetPasswordRequest(
    val token: String,
    val password: String,
    val confirmPassword: String
)

data class RefreshTokenRequest(
    val refreshToken: String
)

data class UpdateFcmTokenRequest(
    val fcmToken: String
)

data class ProductListResponse(
    val success: Boolean,
    val message: String?,
    val data: List<Product>,
    val meta: PaginationMeta
)

data class ProductResponse(
    val success: Boolean,
    val message: String?,
    val data: Product?
)

data class CartResponse(
    val success: Boolean,
    val message: String?,
    val data: Cart?
)

data class AddToCartRequest(
    val productId: String,
    val quantity: Int
)

data class UpdateCartItemRequest(
    val quantity: Int
)

data class OrderListResponse(
    val success: Boolean,
    val message: String?,
    val data: List<Order>,
    val meta: PaginationMeta
)

data class OrderResponse(
    val success: Boolean,
    val message: String?,
    val data: Order?
)

data class CreateOrderRequest(
    val shippingAddressId: String,
    val paymentMethodId: String,
    val items: List<OrderItem>
)

data class LiveStreamListResponse(
    val success: Boolean,
    val message: String?,
    val data: List<LiveStream>,
    val meta: PaginationMeta
)

data class LiveStreamResponse(
    val success: Boolean,
    val message: String?,
    val data: LiveStream?
)

data class CreateLiveStreamRequest(
    val title: String,
    val description: String?,
    val scheduledAt: String?,
    val products: List<String>?
)

data class UpdateLiveStreamRequest(
    val title: String?,
    val description: String?,
    val scheduledAt: String?,
    val products: List<String>?
)

data class PaginationMeta(
    val currentPage: Int,
    val lastPage: Int,
    val perPage: Int,
    val total: Int
)
