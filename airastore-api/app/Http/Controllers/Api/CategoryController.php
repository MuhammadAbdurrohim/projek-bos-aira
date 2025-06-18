<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class CategoryController extends Controller
{
    public function index(Request $request)
    {
        try {
            $query = Category::query();

            // Filter berdasarkan parent_id
            if ($request->has('parent_id')) {
                $query->where('parent_id', $request->parent_id);
            }

            // Filter hanya kategori utama
            if ($request->parents_only) {
                $query->whereNull('parent_id');
            }

            // Filter kategori aktif
            if ($request->active_only) {
                $query->where('is_active', true);
            }

            // Pencarian berdasarkan nama
            if ($request->search) {
                $query->where('name', 'like', "%{$request->search}%");
            }

            // Pengurutan
            $query->orderBy('order', 'asc')
                  ->orderBy('name', 'asc');

            // Load relasi jika diperlukan
            if ($request->with_products) {
                $query->with(['products' => function($q) {
                    $q->active()->inStock();
                }]);
            }

            if ($request->with_children) {
                $query->with('children');
            }

            $categories = $query->get();

            return response()->json([
                'message' => 'Daftar kategori berhasil diambil',
                'data' => $categories
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Terjadi kesalahan saat mengambil daftar kategori',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function show($id)
    {
        try {
            $category = Category::with(['parent', 'children', 'products' => function($q) {
                $q->active()->inStock();
            }])->findOrFail($id);

            return response()->json([
                'message' => 'Detail kategori berhasil diambil',
                'data' => $category
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Terjadi kesalahan saat mengambil detail kategori',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'parent_id' => 'nullable|exists:categories,id',
            'icon' => 'nullable|image|mimes:jpeg,png,jpg,svg|max:1024',
            'image' => 'nullable|image|mimes:jpeg,png,jpg|max:2048',
            'is_active' => 'boolean',
            'order' => 'integer|min:0'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validasi gagal',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $categoryData = [
                'name' => $request->name,
                'slug' => Str::slug($request->name),
                'description' => $request->description,
                'parent_id' => $request->parent_id,
                'is_active' => $request->is_active ?? true,
                'order' => $request->order ?? 0
            ];

            // Upload icon jika ada
            if ($request->hasFile('icon')) {
                $icon = $request->file('icon');
                $iconName = 'icon_' . time() . '.' . $icon->getClientOriginalExtension();
                $icon->storeAs('public/categories', $iconName);
                $categoryData['icon'] = 'categories/' . $iconName;
            }

            // Upload image jika ada
            if ($request->hasFile('image')) {
                $image = $request->file('image');
                $imageName = 'image_' . time() . '.' . $image->getClientOriginalExtension();
                $image->storeAs('public/categories', $imageName);
                $categoryData['image'] = 'categories/' . $imageName;
            }

            $category = Category::create($categoryData);

            return response()->json([
                'message' => 'Kategori berhasil ditambahkan',
                'data' => $category
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Terjadi kesalahan saat menambahkan kategori',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function update(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'parent_id' => 'nullable|exists:categories,id',
            'icon' => 'nullable|image|mimes:jpeg,png,jpg,svg|max:1024',
            'image' => 'nullable|image|mimes:jpeg,png,jpg|max:2048',
            'is_active' => 'boolean',
            'order' => 'integer|min:0'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validasi gagal',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $category = Category::findOrFail($id);

            // Validasi parent_id untuk mencegah kategori menjadi anak dari anaknya sendiri
            if ($request->parent_id && $category->id == $request->parent_id) {
                return response()->json([
                    'message' => 'Kategori tidak bisa menjadi anak dari dirinya sendiri'
                ], 422);
            }

            $categoryData = [
                'name' => $request->name,
                'slug' => Str::slug($request->name),
                'description' => $request->description,
                'parent_id' => $request->parent_id,
                'is_active' => $request->is_active ?? $category->is_active,
                'order' => $request->order ?? $category->order
            ];

            // Upload icon baru jika ada
            if ($request->hasFile('icon')) {
                if ($category->icon) {
                    Storage::delete('public/' . $category->icon);
                }
                $icon = $request->file('icon');
                $iconName = 'icon_' . time() . '.' . $icon->getClientOriginalExtension();
                $icon->storeAs('public/categories', $iconName);
                $categoryData['icon'] = 'categories/' . $iconName;
            }

            // Upload image baru jika ada
            if ($request->hasFile('image')) {
                if ($category->image) {
                    Storage::delete('public/' . $category->image);
                }
                $image = $request->file('image');
                $imageName = 'image_' . time() . '.' . $image->getClientOriginalExtension();
                $image->storeAs('public/categories', $imageName);
                $categoryData['image'] = 'categories/' . $imageName;
            }

            $category->update($categoryData);

            return response()->json([
                'message' => 'Kategori berhasil diupdate',
                'data' => $category
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Terjadi kesalahan saat mengupdate kategori',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function destroy($id)
    {
        try {
            $category = Category::findOrFail($id);

            // Cek apakah kategori memiliki produk
            if ($category->products()->count() > 0) {
                return response()->json([
                    'message' => 'Kategori tidak bisa dihapus karena masih memiliki produk'
                ], 422);
            }

            // Hapus icon dan image jika ada
            if ($category->icon) {
                Storage::delete('public/' . $category->icon);
            }
            if ($category->image) {
                Storage::delete('public/' . $category->image);
            }

            $category->delete();

            return response()->json([
                'message' => 'Kategori berhasil dihapus'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Terjadi kesalahan saat menghapus kategori',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function reorder(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'categories' => 'required|array',
            'categories.*.id' => 'required|exists:categories,id',
            'categories.*.order' => 'required|integer|min:0'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validasi gagal',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            foreach ($request->categories as $item) {
                Category::where('id', $item['id'])->update(['order' => $item['order']]);
            }

            return response()->json([
                'message' => 'Urutan kategori berhasil diupdate'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Terjadi kesalahan saat mengupdate urutan kategori',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
