package com.airastore.app.viewmodels

import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.airastore.app.models.CartItem
import com.airastore.app.repository.CartRepository
import com.airastore.app.utils.ApiResult
import com.airastore.app.utils.Event
import kotlinx.coroutines.launch

class CartViewModel(
    private val cartRepository: CartRepository
) : ViewModel() {

    private val _cartItems = MutableLiveData<ApiResult<List<CartItem>>>()
    val cartItems: LiveData<ApiResult<List<CartItem>>> = _cartItems

    private val _cartUpdateResult = MutableLiveData<Event<ApiResult<CartItem>>>()
    val cartUpdateResult: LiveData<Event<ApiResult<CartItem>>> = _cartUpdateResult

    fun getCartItems() {
        viewModelScope.launch {
            _cartItems.value = ApiResult.Loading
            try {
                val response = cartRepository.getCartItems()
                if (response.success) {
                    _cartItems.value = ApiResult.Success(response.data.items)
                } else {
                    _cartItems.value = ApiResult.Error(response.message ?: "Unknown error occurred")
                }
            } catch (e: Exception) {
                _cartItems.value = ApiResult.Error(e.message ?: "Unknown error occurred")
            }
        }
    }

    fun updateCartItemQuantity(itemId: String, quantity: Int) {
        viewModelScope.launch {
            _cartUpdateResult.value = Event(ApiResult.Loading)
            try {
                val response = cartRepository.updateCartItemQuantity(itemId, quantity)
                if (response.success) {
                    _cartUpdateResult.value = Event(ApiResult.Success(response.data))
                } else {
                    _cartUpdateResult.value = Event(ApiResult.Error(response.message ?: "Unknown error occurred"))
                }
            } catch (e: Exception) {
                _cartUpdateResult.value = Event(ApiResult.Error(e.message ?: "Unknown error occurred"))
            }
        }
    }

    fun removeFromCart(itemId: String) {
        viewModelScope.launch {
            _cartUpdateResult.value = Event(ApiResult.Loading)
            try {
                val response = cartRepository.removeFromCart(itemId)
                if (response.success) {
                    _cartUpdateResult.value = Event(ApiResult.Success(response.data))
                } else {
                    _cartUpdateResult.value = Event(ApiResult.Error(response.message ?: "Unknown error occurred"))
                }
            } catch (e: Exception) {
                _cartUpdateResult.value = Event(ApiResult.Error(e.message ?: "Unknown error occurred"))
            }
        }
    }
}
