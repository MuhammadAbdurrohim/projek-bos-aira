package com.airastore.app.views

import android.content.Context
import android.graphics.Canvas
import android.graphics.Paint
import android.graphics.drawable.Drawable
import android.text.Editable
import android.text.TextWatcher
import android.util.AttributeSet
import android.view.LayoutInflater
import android.view.View
import android.widget.FrameLayout
import android.widget.LinearLayout
import androidx.annotation.DrawableRes
import androidx.core.content.ContextCompat
import com.airastore.app.R
import com.airastore.app.databinding.ViewCustomInputBinding
import com.airastore.app.databinding.ViewLoadingButtonBinding
import com.airastore.app.utils.dp
import com.google.android.material.textfield.TextInputEditText
import com.google.android.material.textfield.TextInputLayout

/**
 * Custom Input View that combines TextInputLayout with additional features
 */
class CustomInputView @JvmOverloads constructor(
    context: Context,
    attrs: AttributeSet? = null,
    defStyleAttr: Int = 0
) : FrameLayout(context, attrs, defStyleAttr) {

    private val binding: ViewCustomInputBinding

    init {
        binding = ViewCustomInputBinding.inflate(LayoutInflater.from(context), this, true)

        // Get custom attributes
        context.theme.obtainStyledAttributes(
            attrs,
            R.styleable.CustomInputView,
            0, 0
        ).apply {
            try {
                binding.textInputLayout.apply {
                    // Hint
                    hint = getString(R.styleable.CustomInputView_hint)
                    
                    // Start Icon
                    getDrawable(R.styleable.CustomInputView_startIcon)?.let {
                        startIconDrawable = it
                    }
                    
                    // End Icon
                    getDrawable(R.styleable.CustomInputView_endIcon)?.let {
                        endIconDrawable = it
                    }
                    
                    // Input Type
                    binding.textInputEditText.inputType = getInt(
                        R.styleable.CustomInputView_android_inputType,
                        binding.textInputEditText.inputType
                    )
                }
            } finally {
                recycle()
            }
        }
    }

    fun getText(): String = binding.textInputEditText.text.toString()

    fun setText(text: String) {
        binding.textInputEditText.setText(text)
    }

    fun setError(error: String?) {
        binding.textInputLayout.error = error
    }

    fun addTextChangedListener(watcher: TextWatcher) {
        binding.textInputEditText.addTextChangedListener(watcher)
    }
}

/**
 * Loading Button that shows loading state
 */
class LoadingButton @JvmOverloads constructor(
    context: Context,
    attrs: AttributeSet? = null,
    defStyleAttr: Int = 0
) : FrameLayout(context, attrs, defStyleAttr) {

    private val binding: ViewLoadingButtonBinding

    init {
        binding = ViewLoadingButtonBinding.inflate(LayoutInflater.from(context), this, true)

        context.theme.obtainStyledAttributes(
            attrs,
            R.styleable.LoadingButton,
            0, 0
        ).apply {
            try {
                binding.button.apply {
                    text = getString(R.styleable.LoadingButton_text)
                    isEnabled = getBoolean(R.styleable.LoadingButton_enabled, true)
                }
            } finally {
                recycle()
            }
        }
    }

    fun setText(text: String) {
        binding.button.text = text
    }

    fun setLoading(isLoading: Boolean) {
        binding.progressBar.visibility = if (isLoading) View.VISIBLE else View.GONE
        binding.button.visibility = if (isLoading) View.INVISIBLE else View.VISIBLE
        binding.button.isEnabled = !isLoading
    }

    fun setEnabled(enabled: Boolean) {
        binding.button.isEnabled = enabled
    }

    fun setOnClickListener(listener: OnClickListener) {
        binding.button.setOnClickListener(listener)
    }
}

/**
 * Badge View for showing count
 */
class BadgeView @JvmOverloads constructor(
    context: Context,
    attrs: AttributeSet? = null,
    defStyleAttr: Int = 0
) : View(context, attrs, defStyleAttr) {

    private var count: Int = 0
    private val paint: Paint = Paint(Paint.ANTI_ALIAS_FLAG)
    private val textPaint: Paint = Paint(Paint.ANTI_ALIAS_FLAG)
    private val size: Int = 16.dp

    init {
        paint.color = ContextCompat.getColor(context, R.color.primary)
        textPaint.apply {
            color = ContextCompat.getColor(context, R.color.white)
            textSize = 12.dp.toFloat()
            textAlign = Paint.Align.CENTER
        }
    }

    override fun onMeasure(widthMeasureSpec: Int, heightMeasureSpec: Int) {
        setMeasuredDimension(size, size)
    }

    override fun onDraw(canvas: Canvas) {
        super.onDraw(canvas)
        
        // Draw circle
        canvas.drawCircle(size / 2f, size / 2f, size / 2f, paint)
        
        // Draw count
        if (count > 0) {
            val text = if (count > 99) "99+" else count.toString()
            canvas.drawText(
                text,
                size / 2f,
                size / 2f + textPaint.textSize / 3,
                textPaint
            )
        }
    }

    fun setCount(count: Int) {
        this.count = count
        visibility = if (count > 0) View.VISIBLE else View.GONE
        invalidate()
    }
}

/**
 * Rating View for showing star rating
 */
class RatingView @JvmOverloads constructor(
    context: Context,
    attrs: AttributeSet? = null,
    defStyleAttr: Int = 0
) : LinearLayout(context, attrs, defStyleAttr) {

    private var rating: Float = 0f
    private val maxStars: Int = 5
    private val starSize: Int = 24.dp
    private val starMargin: Int = 4.dp
    private var starFilled: Drawable? = null
    private var starEmpty: Drawable? = null

    init {
        orientation = HORIZONTAL

        context.theme.obtainStyledAttributes(
            attrs,
            R.styleable.RatingView,
            0, 0
        ).apply {
            try {
                rating = getFloat(R.styleable.RatingView_rating, 0f)
                starFilled = getDrawable(R.styleable.RatingView_starFilled)
                    ?: ContextCompat.getDrawable(context, R.drawable.ic_star_filled)
                starEmpty = getDrawable(R.styleable.RatingView_starEmpty)
                    ?: ContextCompat.getDrawable(context, R.drawable.ic_star_empty)
            } finally {
                recycle()
            }
        }

        setupStars()
    }

    private fun setupStars() {
        removeAllViews()
        
        for (i in 0 until maxStars) {
            val star = View(context).apply {
                background = if (i < rating) starFilled else starEmpty
                layoutParams = LayoutParams(starSize, starSize).apply {
                    marginEnd = if (i < maxStars - 1) starMargin else 0
                }
            }
            addView(star)
        }
    }

    fun setRating(rating: Float) {
        this.rating = rating.coerceIn(0f, maxStars.toFloat())
        setupStars()
    }
}
