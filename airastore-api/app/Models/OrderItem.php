<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class OrderItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_id',
        'product_id',
        'quantity',
        'price',
        'subtotal',
        'notes',
        'product_snapshot' // Menyimpan data produk saat pemesanan
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'subtotal' => 'decimal:2',
        'quantity' => 'integer',
        'product_snapshot' => 'array'
    ];

    // Relasi dengan pesanan
    public function order()
    {
        return $this->belongsTo(Order::class);
    }

    // Relasi dengan produk
    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    // Boot method untuk menambahkan hooks
    protected static function boot()
    {
        parent::boot();

        // Sebelum menyimpan, ambil snapshot produk
        static::creating(function ($orderItem) {
            if (!$orderItem->product_snapshot && $orderItem->product) {
                $orderItem->product_snapshot = [
                    'id' => $orderItem->product->id,
                    'name' => $orderItem->product->name,
                    'price' => $orderItem->price,
                    'image' => $orderItem->product->image,
                    'category' => $orderItem->product->category ? [
                        'id' => $orderItem->product->category->id,
                        'name' => $orderItem->product->category->name
                    ] : null
                ];
            }

            // Hitung subtotal jika belum dihitung
            if (!$orderItem->subtotal) {
                $orderItem->subtotal = $orderItem->price * $orderItem->quantity;
            }
        });
    }

    // Method untuk mendapatkan nama produk (dari snapshot atau relasi)
    public function getProductNameAttribute()
    {
        return $this->product_snapshot['name'] ?? $this->product->name ?? 'Produk tidak tersedia';
    }

    // Method untuk mendapatkan gambar produk (dari snapshot atau relasi)
    public function getProductImageAttribute()
    {
        return $this->product_snapshot['image'] ?? $this->product->image ?? null;
    }

    // Method untuk mendapatkan kategori produk (dari snapshot atau relasi)
    public function getProductCategoryAttribute()
    {
        if ($this->product_snapshot && isset($this->product_snapshot['category'])) {
            return $this->product_snapshot['category']['name'];
        }
        
        return $this->product->category->name ?? 'Tanpa kategori';
    }

    // Method untuk memvalidasi stok sebelum membuat item pesanan
    public static function validateStock($productId, $quantity)
    {
        $product = Product::find($productId);
        
        if (!$product) {
            throw new \Exception('Produk tidak ditemukan');
        }

        if ($product->stock < $quantity) {
            throw new \Exception("Stok tidak mencukupi. Stok tersedia: {$product->stock}");
        }

        return true;
    }

    // Method untuk membuat item pesanan dengan validasi
    public static function createWithValidation($orderData)
    {
        // Validasi stok
        self::validateStock($orderData['product_id'], $orderData['quantity']);

        // Ambil data produk
        $product = Product::findOrFail($orderData['product_id']);
        
        // Buat item pesanan
        return self::create([
            'order_id' => $orderData['order_id'],
            'product_id' => $product->id,
            'quantity' => $orderData['quantity'],
            'price' => $product->final_price,
            'subtotal' => $product->final_price * $orderData['quantity'],
            'notes' => $orderData['notes'] ?? null
        ]);
    }
}
