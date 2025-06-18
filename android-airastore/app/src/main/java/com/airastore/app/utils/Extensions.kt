package com.airastore.app.utils

import android.content.Context
import android.content.res.Resources
import android.graphics.drawable.Drawable
import android.text.Editable
import android.text.TextWatcher
import android.util.TypedValue
import android.view.View
import android.view.inputmethod.InputMethodManager
import android.widget.EditText
import android.widget.ImageView
import android.widget.Toast
import androidx.annotation.DrawableRes
import androidx.core.content.ContextCompat
import androidx.fragment.app.Fragment
import androidx.lifecycle.LifecycleOwner
import androidx.lifecycle.LiveData
import com.bumptech.glide.Glide
import com.bumptech.glide.load.DataSource
import com.bumptech.glide.load.engine.GlideException
import com.bumptech.glide.request.RequestListener
import com.bumptech.glide.request.target.Target
import com.google.android.material.snackbar.Snackbar
import java.text.NumberFormat
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale
import kotlin.math.roundToInt

/**
 * View Extensions
 */
fun View.show() {
    visibility = View.VISIBLE
}

fun View.hide() {
    visibility = View.INVISIBLE
}

fun View.gone() {
    visibility = View.GONE
}

fun View.showSnackbar(message: String, duration: Int = Snackbar.LENGTH_SHORT) {
    Snackbar.make(this, message, duration).show()
}

fun View.showSnackbarWithAction(
    message: String,
    actionText: String,
    duration: Int = Snackbar.LENGTH_LONG,
    action: () -> Unit
) {
    Snackbar.make(this, message, duration)
        .setAction(actionText) { action() }
        .show()
}

/**
 * Context Extensions
 */
fun Context.showToast(message: String, duration: Int = Toast.LENGTH_SHORT) {
    Toast.makeText(this, message, duration).show()
}

fun Context.getDrawableCompat(@DrawableRes resId: Int): Drawable? {
    return ContextCompat.getDrawable(this, resId)
}

fun Context.dpToPx(dp: Float): Int {
    return TypedValue.applyDimension(
        TypedValue.COMPLEX_UNIT_DIP,
        dp,
        resources.displayMetrics
    ).roundToInt()
}

/**
 * Fragment Extensions
 */
fun Fragment.hideKeyboard() {
    view?.let { activity?.hideKeyboard(it) }
}

fun Context.hideKeyboard(view: View) {
    val inputMethodManager = getSystemService(Context.INPUT_METHOD_SERVICE) as InputMethodManager
    inputMethodManager.hideSoftInputFromWindow(view.windowToken, 0)
}

/**
 * EditText Extensions
 */
fun EditText.afterTextChanged(afterTextChanged: (String) -> Unit) {
    this.addTextChangedListener(object : TextWatcher {
        override fun beforeTextChanged(s: CharSequence?, start: Int, count: Int, after: Int) {}
        override fun onTextChanged(s: CharSequence?, start: Int, before: Int, count: Int) {}
        override fun afterTextChanged(editable: Editable?) {
            afterTextChanged.invoke(editable.toString())
        }
    })
}

/**
 * ImageView Extensions
 */
fun ImageView.loadImage(
    url: String?,
    @DrawableRes placeholder: Int? = null,
    @DrawableRes error: Int? = null,
    onSuccess: (() -> Unit)? = null,
    onError: (() -> Unit)? = null
) {
    val requestBuilder = Glide.with(context)
        .load(url)
        .listener(object : RequestListener<Drawable> {
            override fun onLoadFailed(
                e: GlideException?,
                model: Any?,
                target: Target<Drawable>?,
                isFirstResource: Boolean
            ): Boolean {
                onError?.invoke()
                return false
            }

            override fun onResourceReady(
                resource: Drawable?,
                model: Any?,
                target: Target<Drawable>?,
                dataSource: DataSource?,
                isFirstResource: Boolean
            ): Boolean {
                onSuccess?.invoke()
                return false
            }
        })

    placeholder?.let { requestBuilder.placeholder(it) }
    error?.let { requestBuilder.error(it) }

    requestBuilder.into(this)
}

/**
 * LiveData Extensions
 */
fun <T> LiveData<Event<T>>.observeEvent(owner: LifecycleOwner, onEventUnhandled: (T) -> Unit) {
    observe(owner) { event ->
        event.getContentIfNotHandled()?.let { onEventUnhandled(it) }
    }
}

/**
 * String Extensions
 */
fun String.toFormattedPrice(currencyCode: String = "IDR"): String {
    val formatter = NumberFormat.getCurrencyInstance(Locale("id", "ID"))
    formatter.currency = java.util.Currency.getInstance(currencyCode)
    return formatter.format(this.toDoubleOrNull() ?: 0.0)
}

fun String.toFormattedDate(
    inputPattern: String = "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'",
    outputPattern: String = "dd MMM yyyy, HH:mm"
): String {
    return try {
        val inputFormat = SimpleDateFormat(inputPattern, Locale.getDefault())
        val outputFormat = SimpleDateFormat(outputPattern, Locale.getDefault())
        val date = inputFormat.parse(this) ?: Date()
        outputFormat.format(date)
    } catch (e: Exception) {
        this
    }
}

/**
 * Number Extensions
 */
val Int.dp: Int
    get() = (this * Resources.getSystem().displayMetrics.density).roundToInt()

val Float.dp: Int
    get() = (this * Resources.getSystem().displayMetrics.density).roundToInt()

fun Double.toFormattedPrice(currencyCode: String = "IDR"): String {
    val formatter = NumberFormat.getCurrencyInstance(Locale("id", "ID"))
    formatter.currency = java.util.Currency.getInstance(currencyCode)
    return formatter.format(this)
}

/**
 * Validation Extensions
 */
fun String.isValidEmail(): Boolean {
    return android.util.Patterns.EMAIL_ADDRESS.matcher(this).matches()
}

fun String.isValidPhone(): Boolean {
    return android.util.Patterns.PHONE.matcher(this).matches()
}

fun String.isValidPassword(): Boolean {
    return length >= 6
}
