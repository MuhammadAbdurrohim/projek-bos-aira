<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CartItem;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class CartController extends Controller
{
    public function index(Request $request)
    {
        try {
            $cartItems = CartItem::with(['product.category'])
                ->where('user_id', $request->user()->id)
                ->get();

            $total = $cartItems->sum(function ($item) {
                return $item->subtotal;
            });

            $selectedTotal = $cartItems->where('selected', true)->sum(function ($item) {
                return $item->subtotal;
            });

            return response()->json([
                'message' => 'Daftar item keranjang berhasil diambil',
                'data' => [
                    'items' => $cartItems,
                    'total' => $total,
                    'selected_total' => $selectedTotal,
                    'total_items' => $cartItems->sum('quantity')
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Terjadi kesalahan saat mengambil keranjang',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'product_id' => 'required|exists:products,id',
            'quantity' => 'required|integer|min:1',
            'notes' => 'nullable|string'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validasi gagal',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $product = Product::findOrFail($request->product_id);

            // Cek stok produk
            if ($product->stock < $request->quantity) {
                return response()->json([
                    'message' => 'Stok tidak mencukupi',
                    'available_stock' => $product->stock
                ], 422);
            }

            // Cek apakah produk sudah ada di keranjang
            $existingItem = CartItem::where('user_id', $request->user()->id)
                ->where('product_id', $request->product_id)
                ->first();

            if ($existingItem) {
                // Update quantity jika sudah ada
                $newQuantity = $existingItem->quantity + $request->quantity;
                
                if ($product->stock < $newQuantity) {
                    return response()->json([
                        'message' => 'Stok tidak mencukupi',
                        'available_stock' => $product->stock
                    ], 422);
                }

                $existingItem->quantity = $newQuantity;
                $existingItem->notes = $request->notes;
                $existingItem->save();

                $cartItem = $existingItem;
            } else {
                // Buat item baru jika belum ada
                $cartItem = CartItem::create([
                    'user_id' => $request->user()->id,
                    'product_id' => $request->product_id,
                    'quantity' => $request->quantity,
                    'notes' => $request->notes
                ]);
            }

            $cartItem->load('product.category');

            return response()->json([
                'message' => 'Produk berhasil ditambahkan ke keranjang',
                'data' => $cartItem
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Terjadi kesalahan saat menambahkan ke keranjang',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function update(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'quantity' => 'required|integer|min:0',
            'notes' => 'nullable|string'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validasi gagal',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $cartItem = CartItem::where('user_id', $request->user()->id)
                ->findOrFail($id);

            if ($request->quantity > 0) {
                // Cek stok produk
                if ($cartItem->product->stock < $request->quantity) {
                    return response()->json([
                        'message' => 'Stok tidak mencukupi',
                        'available_stock' => $cartItem->product->stock
                    ], 422);
                }

                $cartItem->quantity = $request->quantity;
                $cartItem->notes = $request->notes;
                $cartItem->save();
            } else {
                $cartItem->delete();
            }

            return response()->json([
                'message' => 'Keranjang berhasil diupdate',
                'data' => $cartItem
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Terjadi kesalahan saat mengupdate keranjang',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function destroy($id)
    {
        try {
            $cartItem = CartItem::where('user_id', auth()->id())
                ->findOrFail($id);

            $cartItem->delete();

            return response()->json([
                'message' => 'Item berhasil dihapus dari keranjang'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Terjadi kesalahan saat menghapus item',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function toggleSelect($id)
    {
        try {
            $cartItem = CartItem::where('user_id', auth()->id())
                ->findOrFail($id);

            $cartItem->selected = !$cartItem->selected;
            $cartItem->save();

            return response()->json([
                'message' => 'Status seleksi item berhasil diupdate',
                'data' => $cartItem
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Terjadi kesalahan saat mengupdate status seleksi',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function selectAll()
    {
        try {
            CartItem::where('user_id', auth()->id())
                ->update(['selected' => true]);

            return response()->json([
                'message' => 'Semua item berhasil diseleksi'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Terjadi kesalahan saat menyeleksi semua item',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function unselectAll()
    {
        try {
            CartItem::where('user_id', auth()->id())
                ->update(['selected' => false]);

            return response()->json([
                'message' => 'Semua item berhasil dibatalkan seleksinya'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Terjadi kesalahan saat membatalkan seleksi semua item',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function clear()
    {
        try {
            CartItem::where('user_id', auth()->id())->delete();

            return response()->json([
                'message' => 'Keranjang berhasil dikosongkan'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Terjadi kesalahan saat mengosongkan keranjang',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
