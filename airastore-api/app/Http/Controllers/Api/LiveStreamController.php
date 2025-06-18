<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\LiveStream;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

class LiveStreamController extends Controller
{
    public function index(Request $request)
    {
        try {
            $query = LiveStream::with(['user', 'featuredProducts']);

            // Filter berdasarkan status
            if ($request->status) {
                $query->where('status', $request->status);
            }

            // Filter berdasarkan user
            if ($request->user_id) {
                $query->where('user_id', $request->user_id);
            }

            // Filter live stream yang akan datang
            if ($request->upcoming) {
                $query->where('status', 'scheduled')
                    ->where('scheduled_at', '>', now());
            }

            // Filter live stream yang sedang berlangsung
            if ($request->live) {
                $query->where('status', 'live');
            }

            // Pengurutan
            if ($request->status === 'scheduled') {
                $query->orderBy('scheduled_at', 'asc');
            } else {
                $query->latest();
            }

            $liveStreams = $query->paginate($request->per_page ?? 10);

            return response()->json([
                'message' => 'Daftar live stream berhasil diambil',
                'data' => $liveStreams
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Terjadi kesalahan saat mengambil daftar live stream',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function show($id)
    {
        try {
            $liveStream = LiveStream::with(['user', 'featuredProducts'])
                ->findOrFail($id);

            // Validasi akses
            if (!$liveStream->canBeViewedBy(auth()->user())) {
                return response()->json([
                    'message' => 'Anda tidak memiliki akses ke live stream ini'
                ], 403);
            }

            return response()->json([
                'message' => 'Detail live stream berhasil diambil',
                'data' => $liveStream
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Terjadi kesalahan saat mengambil detail live stream',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'thumbnail' => 'required|image|mimes:jpeg,png,jpg|max:2048',
            'scheduled_at' => 'required|date|after:now',
            'products' => 'nullable|array',
            'products.*.id' => 'exists:products,id',
            'products.*.order' => 'integer|min:1',
            'products.*.is_highlighted' => 'boolean',
            'settings' => 'nullable|array'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validasi gagal',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            // Upload thumbnail
            $thumbnail = $request->file('thumbnail');
            $thumbnailName = time() . '.' . $thumbnail->getClientOriginalExtension();
            $thumbnail->storeAs('public/livestreams', $thumbnailName);

            $liveStream = LiveStream::create([
                'user_id' => auth()->id(),
                'title' => $request->title,
                'description' => $request->description,
                'thumbnail' => 'livestreams/' . $thumbnailName,
                'status' => 'scheduled',
                'stream_key' => LiveStream::generateStreamKey(),
                'room_id' => 'room_' . uniqid(),
                'scheduled_at' => $request->scheduled_at,
                'settings' => $request->settings
            ]);

            // Tambahkan produk jika ada
            if ($request->products) {
                $liveStream->updateFeaturedProducts(
                    collect($request->products)->pluck('id')->toArray(),
                    [
                        'order' => collect($request->products)->pluck('order')->toArray(),
                        'highlighted' => collect($request->products)->pluck('is_highlighted')->toArray()
                    ]
                );
            }

            return response()->json([
                'message' => 'Live stream berhasil dibuat',
                'data' => $liveStream->load(['user', 'featuredProducts'])
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Terjadi kesalahan saat membuat live stream',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function update(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'thumbnail' => 'nullable|image|mimes:jpeg,png,jpg|max:2048',
            'scheduled_at' => 'required|date|after:now',
            'products' => 'nullable|array',
            'products.*.id' => 'exists:products,id',
            'products.*.order' => 'integer|min:1',
            'products.*.is_highlighted' => 'boolean',
            'settings' => 'nullable|array'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validasi gagal',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $liveStream = LiveStream::findOrFail($id);

            if ($liveStream->user_id !== auth()->id()) {
                return response()->json([
                    'message' => 'Anda tidak memiliki akses untuk mengupdate live stream ini'
                ], 403);
            }

            if ($liveStream->status !== 'scheduled') {
                return response()->json([
                    'message' => 'Hanya live stream yang belum dimulai yang dapat diupdate'
                ], 422);
            }

            // Upload thumbnail baru jika ada
            if ($request->hasFile('thumbnail')) {
                if ($liveStream->thumbnail) {
                    Storage::delete('public/' . $liveStream->thumbnail);
                }
                $thumbnail = $request->file('thumbnail');
                $thumbnailName = time() . '.' . $thumbnail->getClientOriginalExtension();
                $thumbnail->storeAs('public/livestreams', $thumbnailName);
                $liveStream->thumbnail = 'livestreams/' . $thumbnailName;
            }

            $liveStream->update([
                'title' => $request->title,
                'description' => $request->description,
                'scheduled_at' => $request->scheduled_at,
                'settings' => $request->settings
            ]);

            // Update produk jika ada
            if ($request->has('products')) {
                $liveStream->updateFeaturedProducts(
                    collect($request->products)->pluck('id')->toArray(),
                    [
                        'order' => collect($request->products)->pluck('order')->toArray(),
                        'highlighted' => collect($request->products)->pluck('is_highlighted')->toArray()
                    ]
                );
            }

            return response()->json([
                'message' => 'Live stream berhasil diupdate',
                'data' => $liveStream->load(['user', 'featuredProducts'])
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Terjadi kesalahan saat mengupdate live stream',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function start($id)
    {
        try {
            $liveStream = LiveStream::findOrFail($id);

            if ($liveStream->user_id !== auth()->id()) {
                return response()->json([
                    'message' => 'Anda tidak memiliki akses untuk memulai live stream ini'
                ], 403);
            }

            $liveStream->startStream();

            return response()->json([
                'message' => 'Live stream berhasil dimulai',
                'data' => $liveStream->load(['user', 'featuredProducts'])
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Terjadi kesalahan saat memulai live stream',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function end($id)
    {
        try {
            $liveStream = LiveStream::findOrFail($id);

            if ($liveStream->user_id !== auth()->id()) {
                return response()->json([
                    'message' => 'Anda tidak memiliki akses untuk mengakhiri live stream ini'
                ], 403);
            }

            $liveStream->endStream();

            return response()->json([
                'message' => 'Live stream berhasil diakhiri',
                'data' => $liveStream->load(['user', 'featuredProducts'])
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Terjadi kesalahan saat mengakhiri live stream',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function updateViewerCount(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'viewer_count' => 'required|integer|min:0'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validasi gagal',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $liveStream = LiveStream::findOrFail($id);
            $liveStream->updateViewerCount($request->viewer_count);

            return response()->json([
                'message' => 'Jumlah penonton berhasil diupdate',
                'data' => [
                    'viewer_count' => $liveStream->viewer_count,
                    'max_viewer_count' => $liveStream->max_viewer_count
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Terjadi kesalahan saat mengupdate jumlah penonton',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function getStats($id)
    {
        try {
            $liveStream = LiveStream::findOrFail($id);

            if ($liveStream->user_id !== auth()->id()) {
                return response()->json([
                    'message' => 'Anda tidak memiliki akses untuk melihat statistik live stream ini'
                ], 403);
            }

            return response()->json([
                'message' => 'Statistik live stream berhasil diambil',
                'data' => $liveStream->getStats()
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Terjadi kesalahan saat mengambil statistik live stream',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
