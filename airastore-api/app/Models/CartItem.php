<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CartItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'product_id',
        'quantity',
        'selected', // untuk checkbox saat checkout
        'notes'
    ];

    protected $casts = [
        'quantity' => 'integer',
        'selected' => 'boolean'
    ];

    protected $appends = ['subtotal'];

    // Relasi dengan user
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // Relasi dengan produk
    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    // Menghitung subtotal item
    public function getSubtotalAttribute()
    {
        if ($this->product) {
            $price = $this->product->discount_price ?? $this->product->price;
            return $price * $this->quantity;
        }
        return 0;
    }

    // Validasi stok saat menambah/update quantity
    public function validateStock()
    {
        if ($this->product && $this->quantity > $this->product->stock) {
            throw new \Exception('Stok tidak mencukupi. Stok tersedia: ' . $this->product->stock);
        }
        return true;
    }

    // Scope untuk item yang dipilih
    public function scopeSelected($query)
    {
        return $query->where('selected', true);
    }

    // Boot method untuk menambahkan hooks
    protected static function boot()
    {
        parent::boot();

        // Validasi stok sebelum menyimpan
        static::saving(function ($cartItem) {
            $cartItem->validateStock();
        });

        // Hapus item jika quantity 0
        static::saved(function ($cartItem) {
            if ($cartItem->quantity <= 0) {
                $cartItem->delete();
            }
        });
    }

    // Method untuk mengupdate quantity
    public function updateQuantity($quantity)
    {
        if ($quantity <= 0) {
            return $this->delete();
        }

        $this->quantity = $quantity;
        return $this->save();
    }

    // Method untuk toggle selection
    public function toggleSelection()
    {
        $this->selected = !$this->selected;
        return $this->save();
    }

    // Method untuk mendapatkan total harga item yang dipilih untuk user tertentu
    public static function getSelectedTotal($userId)
    {
        return self::where('user_id', $userId)
            ->selected()
            ->with('product')
            ->get()
            ->sum(function ($item) {
                return $item->subtotal;
            });
    }
}
