<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'order_number',
        'total_amount',
        'shipping_fee',
        'status', // pending, processing, shipped, delivered, cancelled
        'payment_status', // unpaid, paid, failed, refunded
        'payment_method',
        'shipping_address',
        'shipping_phone',
        'shipping_name',
        'notes',
        'paid_at',
        'cancelled_at',
        'delivered_at'
    ];

    protected $casts = [
        'total_amount' => 'decimal:2',
        'shipping_fee' => 'decimal:2',
        'shipping_address' => 'array',
        'paid_at' => 'datetime',
        'cancelled_at' => 'datetime',
        'delivered_at' => 'datetime'
    ];

    // Relasi dengan user
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // Relasi dengan item pesanan
    public function items()
    {
        return $this->hasMany(OrderItem::class);
    }

    // Generate nomor pesanan unik
    public static function generateOrderNumber()
    {
        $prefix = 'INV';
        $date = now()->format('Ymd');
        $lastOrder = self::whereDate('created_at', today())
            ->latest()
            ->first();

        if ($lastOrder) {
            $lastNumber = intval(substr($lastOrder->order_number, -4));
            $newNumber = str_pad($lastNumber + 1, 4, '0', STR_PAD_LEFT);
        } else {
            $newNumber = '0001';
        }

        return $prefix . $date . $newNumber;
    }

    // Method untuk membuat pesanan dari keranjang
    public static function createFromCart($userId, $shippingData)
    {
        // Ambil item yang dipilih dari keranjang
        $cartItems = CartItem::where('user_id', $userId)
            ->selected()
            ->with('product')
            ->get();

        if ($cartItems->isEmpty()) {
            throw new \Exception('Tidak ada item yang dipilih di keranjang');
        }

        // Hitung total
        $totalAmount = $cartItems->sum(function ($item) {
            return $item->subtotal;
        });

        // Buat pesanan
        $order = self::create([
            'user_id' => $userId,
            'order_number' => self::generateOrderNumber(),
            'total_amount' => $totalAmount,
            'shipping_fee' => $shippingData['shipping_fee'] ?? 0,
            'status' => 'pending',
            'payment_status' => 'unpaid',
            'shipping_address' => $shippingData['address'],
            'shipping_phone' => $shippingData['phone'],
            'shipping_name' => $shippingData['name'],
            'notes' => $shippingData['notes'] ?? null
        ]);

        // Buat item pesanan
        foreach ($cartItems as $cartItem) {
            OrderItem::create([
                'order_id' => $order->id,
                'product_id' => $cartItem->product_id,
                'quantity' => $cartItem->quantity,
                'price' => $cartItem->product->final_price,
                'subtotal' => $cartItem->subtotal
            ]);

            // Kurangi stok produk
            $cartItem->product->decrement('stock', $cartItem->quantity);
        }

        // Hapus item dari keranjang
        CartItem::where('user_id', $userId)->selected()->delete();

        return $order;
    }

    // Method untuk mengupdate status pesanan
    public function updateStatus($status, $additionalData = [])
    {
        $this->status = $status;

        switch ($status) {
            case 'paid':
                $this->payment_status = 'paid';
                $this->paid_at = now();
                break;
            case 'cancelled':
                $this->cancelled_at = now();
                // Kembalikan stok
                foreach ($this->items as $item) {
                    $item->product->increment('stock', $item->quantity);
                }
                break;
            case 'delivered':
                $this->delivered_at = now();
                break;
        }

        foreach ($additionalData as $key => $value) {
            $this->$key = $value;
        }

        return $this->save();
    }

    // Scope untuk filter berdasarkan status
    public function scopeStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    // Mendapatkan total item dalam pesanan
    public function getTotalItemsAttribute()
    {
        return $this->items->sum('quantity');
    }

    // Mendapatkan total keseluruhan termasuk ongkir
    public function getGrandTotalAttribute()
    {
        return $this->total_amount + $this->shipping_fee;
    }
}
