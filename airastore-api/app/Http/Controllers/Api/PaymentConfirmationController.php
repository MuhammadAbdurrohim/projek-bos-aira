<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class PaymentConfirmationController extends Controller
{
    public function index(Request $request)
    {
        try {
            $orders = Order::with('user')
                ->whereNotNull('payment_proof')
                ->where('verification_status', 'pending')
                ->orderBy('created_at', 'desc')
                ->get();

            return response()->json([
                'message' => 'Daftar pembayaran menunggu verifikasi',
                'data' => $orders
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Gagal mengambil data pembayaran',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function update(Request $request, $orderId)
    {
        $validator = Validator::make($request->all(), [
            'action' => 'required|in:approve,reject',
            'admin_notes' => 'nullable|string'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validasi gagal',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $order = Order::findOrFail($orderId);

            if ($request->action === 'approve') {
                $order->verification_status = 'approved';
                $order->payment_status = 'paid';
            } else {
                $order->verification_status = 'rejected';
                $order->admin_notes = $request->admin_notes;
            }
            $order->save();

            return response()->json([
                'message' => 'Status pembayaran berhasil diupdate',
                'data' => $order
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Terjadi kesalahan saat memperbarui pembayaran',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function history(Request $request)
    {
        try {
            $query = Order::with('user')->whereNotNull('payment_proof');

            if ($request->has('verification_status')) {
                $query->where('verification_status', $request->verification_status);
            }

            if ($request->has('payment_method')) {
                $query->where('payment_method', $request->payment_method);
            }

            if ($request->has('date_from')) {
                $query->whereDate('created_at', '>=', $request->date_from);
            }
            if ($request->has('date_to')) {
                $query->whereDate('created_at', '<=', $request->date_to);
            }

            if ($request->has('search')) {
                $search = $request->search;
                $query->where(function ($q) use ($search) {
                    $q->where('order_number', 'like', "%{$search}%")
                      ->orWhereHas('user', function ($q2) use ($search) {
                          $q2->where('name', 'like', "%{$search}%");
                      });
                });
            }

            $data = $query->orderBy('created_at', 'desc')->get();

            return response()->json([
                'message' => 'Riwayat pembayaran berhasil diambil',
                'data' => $data
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Gagal mengambil riwayat pembayaran',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function export(Request $request)
    {
        try {
            $query = Order::whereNotNull('payment_proof');

            if ($request->has('verification_status')) {
                $query->where('verification_status', $request->verification_status);
            }

            if ($request->has('payment_method')) {
                $query->where('payment_method', $request->payment_method);
            }

            if ($request->has('date_from')) {
                $query->whereDate('created_at', '>=', $request->date_from);
            }
            if ($request->has('date_to')) {
                $query->whereDate('created_at', '<=', $request->date_to);
            }

            $orders = $query->orderBy('created_at', 'desc')->get();

            $csvHeader = "Order ID,User Name,Total Amount,Payment Method,Verification Status,Created At\n";
            $csvData = '';
            foreach ($orders as $order) {
                $csvData .= "{$order->id},\"{$order->user->name}\",{$order->total_amount},{$order->payment_method},{$order->verification_status},{$order->created_at}\n";
            }
            $csv = $csvHeader . $csvData;

            $fileName = 'payment_report_' . date('Y-m-d_H-i-s') . '.csv';

            return response($csv)
                ->header('Content-Type', 'text/csv')
                ->header('Content-Disposition', "attachment; filename={$fileName}");
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Gagal mengekspor laporan pembayaran',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
