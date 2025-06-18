<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LiveStream extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'title',
        'description',
        'thumbnail',
        'status', // scheduled, live, ended
        'stream_key',
        'room_id',
        'scheduled_at',
        'started_at',
        'ended_at',
        'viewer_count',
        'max_viewer_count',
        'products', // Array produk yang ditampilkan saat live
        'settings' // Pengaturan live stream (chat, reaksi, dll)
    ];

    protected $casts = [
        'scheduled_at' => 'datetime',
        'started_at' => 'datetime',
        'ended_at' => 'datetime',
        'products' => 'array',
        'settings' => 'array',
        'viewer_count' => 'integer',
        'max_viewer_count' => 'integer'
    ];

    // Relasi dengan user (streamer)
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // Relasi dengan produk yang ditampilkan
    public function featuredProducts()
    {
        return $this->belongsToMany(Product::class, 'live_stream_products')
            ->withPivot('order', 'is_highlighted')
            ->orderBy('pivot_order');
    }

    // Scope untuk live stream yang aktif
    public function scopeLive($query)
    {
        return $query->where('status', 'live');
    }

    // Scope untuk live stream yang dijadwalkan
    public function scopeScheduled($query)
    {
        return $query->where('status', 'scheduled')
            ->where('scheduled_at', '>', now());
    }

    // Scope untuk live stream yang sudah selesai
    public function scopeEnded($query)
    {
        return $query->where('status', 'ended');
    }

    // Method untuk memulai live stream
    public function startStream()
    {
        if ($this->status !== 'scheduled') {
            throw new \Exception('Live stream hanya bisa dimulai dari status scheduled');
        }

        $this->update([
            'status' => 'live',
            'started_at' => now(),
            'viewer_count' => 0
        ]);

        // Kirim notifikasi ke followers
        $this->notifyFollowers();

        return $this;
    }

    // Method untuk mengakhiri live stream
    public function endStream()
    {
        if ($this->status !== 'live') {
            throw new \Exception('Hanya live stream yang sedang berlangsung yang bisa diakhiri');
        }

        $this->update([
            'status' => 'ended',
            'ended_at' => now()
        ]);

        return $this;
    }

    // Method untuk mengupdate jumlah penonton
    public function updateViewerCount($count)
    {
        $this->viewer_count = $count;
        
        if ($count > ($this->max_viewer_count ?? 0)) {
            $this->max_viewer_count = $count;
        }

        $this->save();
    }

    // Method untuk menambah/menghapus produk dari live stream
    public function updateFeaturedProducts(array $productIds, array $options = [])
    {
        $syncData = [];
        foreach ($productIds as $index => $productId) {
            $syncData[$productId] = [
                'order' => $options['order'][$index] ?? $index + 1,
                'is_highlighted' => $options['highlighted'][$index] ?? false
            ];
        }

        $this->featuredProducts()->sync($syncData);
    }

    // Method untuk mendapatkan statistik live stream
    public function getStats()
    {
        return [
            'duration' => $this->ended_at ? $this->ended_at->diffInMinutes($this->started_at) : null,
            'max_viewers' => $this->max_viewer_count,
            'current_viewers' => $this->status === 'live' ? $this->viewer_count : 0,
            'featured_products_count' => $this->featuredProducts()->count(),
            'started_at' => $this->started_at?->format('Y-m-d H:i:s'),
            'ended_at' => $this->ended_at?->format('Y-m-d H:i:s')
        ];
    }

    // Method untuk mengirim notifikasi ke followers
    protected function notifyFollowers()
    {
        // Implementasi notifikasi ke followers (bisa menggunakan FCM atau sistem notifikasi lainnya)
        // Contoh implementasi dasar
        $followers = $this->user->followers;
        
        foreach ($followers as $follower) {
            // Kirim notifikasi
            \Notification::send($follower, new LiveStreamStarted($this));
        }
    }

    // Method untuk mengecek apakah user bisa menonton
    public function canBeViewedBy(User $user)
    {
        // Implementasi logic akses live stream
        // Contoh: cek status banned, pembatasan usia, dll
        return true;
    }

    // Method untuk generate stream key
    public static function generateStreamKey()
    {
        return md5(uniqid() . time());
    }
}
