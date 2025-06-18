<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\CartController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\LiveStreamController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// Public routes
Route::post('register', [AuthController::class, 'register']);
Route::post('login', [AuthController::class, 'login']);

// Products
Route::get('products', [ProductController::class, 'index']);
Route::get('products/featured', [ProductController::class, 'featured']);
Route::get('products/{id}', [ProductController::class, 'show']);

// Categories
Route::get('categories', [CategoryController::class, 'index']);
Route::get('categories/{id}', [CategoryController::class, 'show']);

// Live Streams
Route::get('live-streams', [LiveStreamController::class, 'index']);
Route::get('live-streams/{id}', [LiveStreamController::class, 'show']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    // Auth
    Route::post('logout', [AuthController::class, 'logout']);
    Route::get('profile', [AuthController::class, 'profile']);
    Route::put('profile', [AuthController::class, 'updateProfile']);
    Route::put('password', [AuthController::class, 'updatePassword']);

    // Admin Routes
    Route::middleware('admin')->group(function () {
        // Products Management
        Route::post('products', [ProductController::class, 'store']);
        Route::put('products/{id}', [ProductController::class, 'update']);
        Route::delete('products/{id}', [ProductController::class, 'destroy']);

        // Categories Management
        Route::post('categories', [CategoryController::class, 'store']);
        Route::put('categories/{id}', [CategoryController::class, 'update']);
        Route::delete('categories/{id}', [CategoryController::class, 'destroy']);
        Route::post('categories/reorder', [CategoryController::class, 'reorder']);

        // Orders Management
        Route::put('orders/{id}/status', [OrderController::class, 'updateStatus']);
        Route::put('orders/{id}/payment-status', [OrderController::class, 'updatePaymentStatus']);
    });

    // Cart
    Route::get('cart', [CartController::class, 'index']);
    Route::post('cart', [CartController::class, 'store']);
    Route::put('cart/{id}', [CartController::class, 'update']);
    Route::delete('cart/{id}', [CartController::class, 'destroy']);
    Route::put('cart/{id}/toggle-select', [CartController::class, 'toggleSelect']);
    Route::post('cart/select-all', [CartController::class, 'selectAll']);
    Route::post('cart/unselect-all', [CartController::class, 'unselectAll']);
    Route::delete('cart', [CartController::class, 'clear']);

    // Orders
    Route::get('orders', [OrderController::class, 'index']);
    Route::get('orders/{id}', [OrderController::class, 'show']);
    Route::post('orders', [OrderController::class, 'store']);
    Route::put('orders/{id}/cancel', [OrderController::class, 'cancel']);
    Route::put('orders/{id}/confirm-delivery', [OrderController::class, 'confirmDelivery']);

    // Live Streams
    Route::post('live-streams', [LiveStreamController::class, 'store']);
    Route::put('live-streams/{id}', [LiveStreamController::class, 'update']);
    Route::put('live-streams/{id}/start', [LiveStreamController::class, 'start']);
    Route::put('live-streams/{id}/end', [LiveStreamController::class, 'end']);
    Route::put('live-streams/{id}/viewer-count', [LiveStreamController::class, 'updateViewerCount']);
    Route::get('live-streams/{id}/stats', [LiveStreamController::class, 'getStats']);
});

// Fallback route
Route::fallback(function () {
    return response()->json([
        'message' => 'Endpoint tidak ditemukan. Silakan periksa dokumentasi API.'
    ], 404);
});
