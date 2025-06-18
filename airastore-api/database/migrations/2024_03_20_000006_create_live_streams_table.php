<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('live_streams', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('title');
            $table->text('description')->nullable();
            $table->string('thumbnail')->nullable();
            $table->enum('status', ['scheduled', 'live', 'ended'])->default('scheduled');
            $table->string('stream_key')->unique();
            $table->string('room_id')->unique();
            $table->timestamp('scheduled_at')->nullable();
            $table->timestamp('started_at')->nullable();
            $table->timestamp('ended_at')->nullable();
            $table->integer('viewer_count')->default(0);
            $table->integer('max_viewer_count')->default(0);
            $table->json('products')->nullable();
            $table->json('settings')->nullable();
            $table->timestamps();
        });

        // Tabel pivot untuk produk yang ditampilkan dalam live stream
        Schema::create('live_stream_products', function (Blueprint $table) {
            $table->foreignId('live_stream_id')->constrained()->onDelete('cascade');
            $table->foreignId('product_id')->constrained()->onDelete('cascade');
            $table->integer('order')->default(0);
            $table->boolean('is_highlighted')->default(false);
            $table->timestamps();

            $table->primary(['live_stream_id', 'product_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('live_stream_products');
        Schema::dropIfExists('live_streams');
    }
};
