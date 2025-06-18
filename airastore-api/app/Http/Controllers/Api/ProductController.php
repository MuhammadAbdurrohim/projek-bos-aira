<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

class ProductController extends Controller
{
    public function index(Request $request)
    {
        try {
            $query = Product::with('category')
                ->when($request->category_id, function ($q) use ($request) {
                    return $q->where('category_id', $request->category_id);
                })
                ->when($request->search, function ($q) use ($request) {
                    return $q->where('name', 'like', "%{$request->search}%")
                        ->orWhere('description', 'like', "%{$request->search}%");
                })
                ->when($request->min_price, function ($q) use ($request) {
                    return $q->where('price', '>=', $request->min_price);
                })
                ->when($request->max_price, function ($q) use ($request) {
                    return $q->where('price', '<=', $request->max_price);
                })
                ->when($request->status, function ($q) use ($request) {
                    return $q->where('status', $request->status);
                })
                ->when($request->sort_by, function ($q) use ($request) {
                    $direction = $request->sort_direction ?? 'asc';
                    return $q->orderBy($request->sort_by, $direction);
                }, function ($q) {
                    return $q->latest();
                });

            if ($request->featured) {
                $query->featured();
            }

            if ($request->in_stock) {
                $query->inStock();
            }

            $perPage = $request->per_page ?? 12;
            $products = $query->paginate($perPage);

            return response()->json([
                'message' => 'Daftar produk berhasil diambil',
                'data' => $products
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Terjadi kesalahan saat mengambil daftar produk',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function show($id)
    {
        try {
            $product = Product::with(['category'])->findOrFail($id);

            return response()->json([
                'message' => 'Detail produk berhasil diambil',
                'data' => $product
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Terjadi kesalahan saat mengambil detail produk',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'discount_price' => 'nullable|numeric|min:0|lt:price',
            'stock' => 'required|integer|min:0',
            'category_id' => 'required|exists:categories,id',
            'image' => 'required|image|mimes:jpeg,png,jpg|max:2048',
            'is_featured' => 'boolean',
            'status' => 'required|in:active,inactive,out_of_stock'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validasi gagal',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            // Upload gambar
            $image = $request->file('image');
            $imageName = time() . '.' . $image->getClientOriginalExtension();
            $image->storeAs('public/products', $imageName);

            $product = Product::create([
                'name' => $request->name,
                'description' => $request->description,
                'price' => $request->price,
                'discount_price' => $request->discount_price,
                'stock' => $request->stock,
                'category_id' => $request->category_id,
                'image' => 'products/' . $imageName,
                'is_featured' => $request->is_featured ?? false,
                'status' => $request->status
            ]);

            return response()->json([
                'message' => 'Produk berhasil ditambahkan',
                'data' => $product
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Terjadi kesalahan saat menambahkan produk',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function update(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'discount_price' => 'nullable|numeric|min:0|lt:price',
            'stock' => 'required|integer|min:0',
            'category_id' => 'required|exists:categories,id',
            'image' => 'nullable|image|mimes:jpeg,png,jpg|max:2048',
            'is_featured' => 'boolean',
            'status' => 'required|in:active,inactive,out_of_stock'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validasi gagal',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $product = Product::findOrFail($id);

            // Upload gambar baru jika ada
            if ($request->hasFile('image')) {
                // Hapus gambar lama
                if ($product->image) {
                    Storage::delete('public/' . $product->image);
                }

                $image = $request->file('image');
                $imageName = time() . '.' . $image->getClientOriginalExtension();
                $image->storeAs('public/products', $imageName);
                $product->image = 'products/' . $imageName;
            }

            $product->update([
                'name' => $request->name,
                'description' => $request->description,
                'price' => $request->price,
                'discount_price' => $request->discount_price,
                'stock' => $request->stock,
                'category_id' => $request->category_id,
                'is_featured' => $request->is_featured ?? $product->is_featured,
                'status' => $request->status
            ]);

            return response()->json([
                'message' => 'Produk berhasil diupdate',
                'data' => $product
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Terjadi kesalahan saat mengupdate produk',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function destroy($id)
    {
        try {
            $product = Product::findOrFail($id);

            // Hapus gambar jika ada
            if ($product->image) {
                Storage::delete('public/' . $product->image);
            }

            $product->delete();

            return response()->json([
                'message' => 'Produk berhasil dihapus'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Terjadi kesalahan saat menghapus produk',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function featured()
    {
        try {
            $products = Product::with('category')
                ->featured()
                ->active()
                ->inStock()
                ->latest()
                ->take(10)
                ->get();

            return response()->json([
                'message' => 'Daftar produk unggulan berhasil diambil',
                'data' => $products
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Terjadi kesalahan saat mengambil produk unggulan',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
