package com.airastore.app.viewmodels

import android.net.Uri
import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.airastore.app.models.PaymentMethod
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch

class CheckoutViewModel : ViewModel() {

    private val _paymentSubmissionResult = MutableLiveData<Result>()
    val paymentSubmissionResult: LiveData<Result> = _paymentSubmissionResult

    // Dummy user payment methods for demo; in real app, fetch from repository or API
    private val userPaymentMethods = listOf(
        PaymentMethod(
            id = "1",
            type = "BANK",
            provider = "BCA",
            accountNumber = "1234567890",
            accountName = "PT Airastore"
        ),
        PaymentMethod(
            id = "2",
            type = "BANK",
            provider = "BNI",
            accountNumber = "0987654321",
            accountName = "PT Airastore"
        ),
        PaymentMethod(
            id = "3",
            type = "EWALLET",
            provider = "Dana",
            accountNumber = "081234567890",
            accountName = "PT Airastore"
        ),
        PaymentMethod(
            id = "4",
            type = "EWALLET",
            provider = "OVO",
            accountNumber = "081098765432",
            accountName = "PT Airastore"
        )
    )

    fun getUserPaymentMethods(): List<PaymentMethod> {
        return userPaymentMethods
    }

    fun submitPaymentProof(paymentType: String, proofUri: Uri) {
        viewModelScope.launch {
            _paymentSubmissionResult.value = Result.Loading

            try {
                // TODO: Implement actual upload logic here
                // For demo, simulate delay
                delay(2000)

                // On success
                _paymentSubmissionResult.value = Result.Success
            } catch (e: Exception) {
                _paymentSubmissionResult.value = Result.Error("Gagal mengirim bukti pembayaran: ${e.message}")
            }
        }
    }

    sealed class Result {
        object Success : Result()
        data class Error(val message: String) : Result()
        object Loading : Result()
    }
}
