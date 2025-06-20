<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PaymentAccount;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class PaymentAccountController extends Controller
{
    public function index()
    {
        try {
            $accounts = PaymentAccount::orderBy('type')->get();
            return response()->json([
                'message' => 'Akun pembayaran berhasil diambil',
                'data' => $accounts
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Gagal mengambil akun pembayaran',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'account_name' => 'required|string',
            'account_number' => 'required|string',
            'owner_name' => 'required|string',
            'type' => 'required|in:bank,e-wallet'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validasi gagal',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $account = PaymentAccount::create($request->all());
            return response()->json([
                'message' => 'Akun pembayaran berhasil ditambahkan',
                'data' => $account
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Gagal membuat akun pembayaran',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function update(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'account_name' => 'sometimes|required|string',
            'account_number' => 'sometimes|required|string',
            'owner_name' => 'sometimes|required|string',
            'is_active' => 'sometimes|required|boolean'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validasi gagal',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $account = PaymentAccount::findOrFail($id);
            $account->update($request->all());
            return response()->json([
                'message' => 'Akun pembayaran berhasil diperbarui',
                'data' => $account
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Gagal memperbarui akun pembayaran',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function destroy($id)
    {
        try {
            $account = PaymentAccount::findOrFail($id);
            $account->delete();
            return response()->json([
                'message' => 'Akun pembayaran berhasil dihapus'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Gagal menghapus akun pembayaran',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
