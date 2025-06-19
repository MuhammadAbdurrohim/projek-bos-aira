package com.airastore.app.adapters

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.ImageView
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView
import com.airastore.app.R
import com.airastore.app.models.LiveStream
import com.bumptech.glide.Glide

class LiveStreamAdapter(
    private val liveStreams: List<LiveStream>,
    private val onItemClick: (LiveStream) -> Unit
) : RecyclerView.Adapter<LiveStreamAdapter.LiveStreamViewHolder>() {

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): LiveStreamViewHolder {
        val view = LayoutInflater.from(parent.context).inflate(R.layout.item_live_stream, parent, false)
        return LiveStreamViewHolder(view)
    }

    override fun onBindViewHolder(holder: LiveStreamViewHolder, position: Int) {
        val liveStream = liveStreams[position]
        holder.bind(liveStream)
    }

    override fun getItemCount(): Int = liveStreams.size

    inner class LiveStreamViewHolder(itemView: View) : RecyclerView.ViewHolder(itemView) {
        private val thumbnailImageView: ImageView = itemView.findViewById(R.id.live_stream_thumbnail)
        private val titleTextView: TextView = itemView.findViewById(R.id.live_stream_title)
        private val statusTextView: TextView = itemView.findViewById(R.id.live_stream_status)

        fun bind(liveStream: LiveStream) {
            titleTextView.text = liveStream.title
            statusTextView.text = liveStream.status.capitalize()

            Glide.with(itemView.context)
                .load(liveStream.thumbnail)
                .placeholder(R.drawable.ic_live)
                .into(thumbnailImageView)

            itemView.setOnClickListener {
                onItemClick(liveStream)
            }
        }
    }
}
