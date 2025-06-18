<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\CartItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class OrderController extends Controller
{
    public function index(Request $request)
    {
        try {
            $query = Order::with(['items.product'])
                ->where('user_id', $request->user()->id);

            // Filter berdasarkan status
            if ($request->status) {
                $query->where('status', $request->status);
            }

            // Filter berdasarkan tanggal
            if ($request->date_from) {
                $query->whereDate('created_at', '>=', $request->date_from);
            }
            if ($request->date_to) {
                $query->whereDate('created_at', '<=', $request->date_to);
            }

            // Pengurutan
            $query->latest();

            $orders = $query->paginate($request->per_page ?? 10);

            return response()->json([
                'message' => 'Daftar pesanan berhasil diambil',
                'data' => $orders
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Terjadi kesalahan saat mengambil daftar pesanan',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function show($id)
    {
        try {
            $order = Order::with(['items.product', 'user'])
                ->where('user_id', auth()->id())
                ->findOrFail($id);

            return response()->json([
                'message' => 'Detail pesanan berhasil diambil',
                'data' => $order
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Terjadi kesalahan saat mengambil detail pesanan',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'shipping_address' => 'required|array',
            'shipping_address.address' => 'required|string',
            'shipping_address.city' => 'required|string',
            'shipping_address.postal_code' => 'required|string',
            'shipping_phone' => 'required|string',
            'shipping_name' => 'required|string',
            'payment_method' => 'required|string',
            'shipping_fee' => 'required|numeric|min:0',
            'notes' => 'nullable|string'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validasi gagal',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            DB::beginTransaction();

            // Ambil item yang dipilih dari keranjang
            $cartItems = CartItem::with('product')
                ->where('user_id', auth()->id())
                ->where('selected', true)
                ->get();

            if ($cartItems->isEmpty()) {
                return response()->json([
                    'message' => 'Tidak ada item yang dipilih di keranjang'
                ], 422);
            }

            // Validasi stok
            foreach ($cartItems as $item) {
                if ($item->product->stock < $item->quantity) {
                    return response()->json([
                        'message' => "Stok {$item->product->name} tidak mencukupi",
                        'available_stock' => $item->product->stock
                    ], 422);
                }
            }

            // Buat pesanan
            $order = Order::createFromCart(auth()->id(), [
                'shipping_fee' => $request->shipping_fee,
                'address' => $request->shipping_address,
                'phone' => $request->shipping_phone,
                'name' => $request->shipping_name,
                'notes' => $request->notes
            ]);

            // Update payment method
            $order->payment_method = $request->payment_method;
            $order->save();

            DB::commit();

            return response()->json([
                'message' => 'Pesanan berhasil dibuat',
                'data' => $order->load('items.product')
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Terjadi kesalahan saat membuat pesanan',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function cancel($id)
    {
        try {
            $order = Order::where('user_id', auth()->id())
                ->findOrFail($id);

            if (!in_array($order->status, ['pending', 'processing'])) {
                return response()->json([
                    'message' => 'Pesanan tidak dapat dibatalkan'
                ], 422);
            }

            $order->updateStatus('cancelled');

            return response()->json([
                'message' => 'Pesanan berhasil dibatalkan',
                'data' => $order
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Terjadi kesalahan saat membatalkan pesanan',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function confirmDelivery($id)
    {
        try {
            $order = Order::where('user_id', auth()->id())
                ->findOrFail($id);

            if ($order->status !== 'shipped') {
                return response()->json([
                    'message' => 'Status pesanan tidak valid untuk konfirmasi pengiriman'
                ], 422);
            }

            $order->updateStatus('delivered');

            return response()->json([
                'message' => 'Pesanan berhasil dikonfirmasi telah diterima',
                'data' => $order
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Terjadi kesalahan saat mengkonfirmasi pesanan',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // Admin Methods
    public function updateStatus(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'status' => 'required|in:processing,shipped,delivered,cancelled',
            'notes' => 'nullable|string'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validasi gagal',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $order = Order::findOrFail($id);
            $order->updateStatus($request->status, [
                'notes' => $request->notes
            ]);

            return response()->json([
                'message' => 'Status pesanan berhasil diupdate',
                'data' => $order
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Terjadi kesalahan saat mengupdate status pesanan',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function updatePaymentStatus(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'payment_status' => 'required|in:paid,failed,refunded',
            'payment_notes' => 'nullable|string'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validasi gagal',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $order = Order::findOrFail($id);
            
            if ($request->payment_status === 'paid' && $order->payment_status === 'unpaid') {
                $order->paid_at = now();
            }

            $order->payment_status = $request->payment_status;
            $order->save();

            return response()->json([
                'message' => 'Status pembayaran berhasil diupdate',
                'data' => $order
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Terjadi kesalahan saat mengupdate status pembayaran',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
