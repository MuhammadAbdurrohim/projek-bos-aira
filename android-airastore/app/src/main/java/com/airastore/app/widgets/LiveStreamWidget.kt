package com.airastore.app.widgets

import android.content.Context
import android.util.AttributeSet
import android.view.LayoutInflater
import android.widget.FrameLayout
import androidx.core.content.ContextCompat
import androidx.core.view.isVisible
import com.airastore.app.R
import com.airastore.app.databinding.WidgetLiveStreamBinding
import com.airastore.app.models.LiveStream
import com.airastore.app.utils.Extensions.formatThousands
import com.airastore.app.utils.Extensions.loadImageWithPlaceholder
import com.bumptech.glide.Glide

class LiveStreamWidget @JvmOverloads constructor(
    context: Context,
    attrs: AttributeSet? = null,
    defStyleAttr: Int = 0
) : FrameLayout(context, attrs, defStyleAttr) {

    private val binding: WidgetLiveStreamBinding

    init {
        binding = WidgetLiveStreamBinding.inflate(LayoutInflater.from(context), this, true)
        setupAttributes(attrs)
    }

    private fun setupAttributes(attrs: AttributeSet?) {
        attrs?.let {
            val typedArray = context.obtainStyledAttributes(it, R.styleable.LiveStreamWidget)
            
            // Custom attributes
            val showViewerCount = typedArray.getBoolean(R.styleable.LiveStreamWidget_showViewerCount, true)
            binding.tvViewerCount.isVisible = showViewerCount

            val showLiveBadge = typedArray.getBoolean(R.styleable.LiveStreamWidget_showLiveBadge, true)
            binding.tvLiveBadge.isVisible = showLiveBadge

            typedArray.recycle()
        }
    }

    /**
     * Set data live streaming
     */
    fun setLiveStream(liveStream: LiveStream) {
        with(binding) {
            // Thumbnail
            ivThumbnail.loadImageWithPlaceholder(
                liveStream.thumbnail,
                R.drawable.placeholder_live_stream
            )

            // Judul
            tvTitle.text = liveStream.title

            // Nama penjual
            tvSellerName.text = liveStream.seller.name

            // Foto profil penjual
            ivSellerPhoto.loadImageWithPlaceholder(
                liveStream.seller.photoUrl,
                R.drawable.placeholder_profile
            )

            // Badge live
            tvLiveBadge.isVisible = liveStream.isLive

            // Jumlah penonton
            if (liveStream.viewerCount > 0) {
                tvViewerCount.text = liveStream.viewerCount.formatThousands()
                tvViewerCount.isVisible = true
            } else {
                tvViewerCount.isVisible = false
            }

            // Status live streaming
            when {
                liveStream.isLive -> {
                    tvStatus.text = context.getString(R.string.live)
                    tvStatus.setTextColor(ContextCompat.getColor(context, R.color.live_badge))
                }
                liveStream.isScheduled -> {
                    tvStatus.text = context.getString(R.string.scheduled)
                    tvStatus.setTextColor(ContextCompat.getColor(context, R.color.text_secondary))
                }
                liveStream.isEnded -> {
                    tvStatus.text = context.getString(R.string.ended)
                    tvStatus.setTextColor(ContextCompat.getColor(context, R.color.text_secondary))
                }
            }

            // Produk yang dijual
            if (liveStream.products.isNotEmpty()) {
                // Tampilkan preview produk
                rvProducts.apply {
                    adapter = LiveStreamProductAdapter(liveStream.products)
                    isVisible = true
                }
            } else {
                rvProducts.isVisible = false
            }
        }
    }

    /**
     * Set listener untuk klik widget
     */
    fun setOnClickListener(listener: (LiveStream) -> Unit) {
        binding.root.setOnClickListener {
            // TODO: Implement click listener
        }
    }

    /**
     * Set listener untuk klik produk
     */
    fun setOnProductClickListener(listener: (String) -> Unit) {
        // TODO: Implement product click listener
    }

    /**
     * Mulai pemutaran video preview
     */
    fun startPreviewVideo() {
        binding.videoPreview.apply {
            // TODO: Implement video preview playback
        }
    }

    /**
     * Hentikan pemutaran video preview
     */
    fun stopPreviewVideo() {
        binding.videoPreview.apply {
            // TODO: Implement stop video preview
        }
    }

    /**
     * Update jumlah penonton secara real-time
     */
    fun updateViewerCount(count: Int) {
        binding.tvViewerCount.apply {
            text = count.formatThousands()
            isVisible = count > 0
        }
    }

    /**
     * Update status live streaming
     */
    fun updateLiveStatus(isLive: Boolean) {
        binding.apply {
            tvLiveBadge.isVisible = isLive
            tvStatus.text = if (isLive) {
                context.getString(R.string.live)
            } else {
                context.getString(R.string.ended)
            }
            tvStatus.setTextColor(
                ContextCompat.getColor(
                    context,
                    if (isLive) R.color.live_badge else R.color.text_secondary
                )
            )
        }
    }

    override fun onDetachedFromWindow() {
        super.onDetachedFromWindow()
        // Cleanup resources
        stopPreviewVideo()
        Glide.with(this).clear(binding.ivThumbnail)
        Glide.with(this).clear(binding.ivSellerPhoto)
    }
}

// Data class untuk live streaming (pindahkan ke package models jika diperlukan)
data class LiveStream(
    val id: String,
    val title: String,
    val description: String,
    val thumbnail: String,
    val seller: Seller,
    val isLive: Boolean,
    val isScheduled: Boolean,
    val isEnded: Boolean,
    val viewerCount: Int,
    val products: List<String>,
    val scheduledAt: String? = null,
    val startedAt: String? = null,
    val endedAt: String? = null
)

data class Seller(
    val id: String,
    val name: String,
    val photoUrl: String?
)
