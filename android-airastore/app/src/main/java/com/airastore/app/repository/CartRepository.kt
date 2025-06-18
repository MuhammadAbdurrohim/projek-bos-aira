package com.airastore.app.repository

import com.airastore.app.api.ApiService
import com.airastore.app.models.CartResponse
import com.airastore.app.models.CartUpdateRequest
import com.airastore.app.models.CartUpdateResponse

class CartRepository(private val apiService: ApiService) {

    suspend fun getCartItems(): CartResponse {
        return apiService.getCartItems()
    }

    suspend fun updateCartItemQuantity(itemId: String, quantity: Int): CartUpdateResponse {
        val request = CartUpdateRequest(itemId, quantity)
        return apiService.updateCartItem(request)
    }

    suspend fun removeFromCart(itemId: String): CartUpdateResponse {
        return apiService.removeFromCart(itemId)
    }
}
