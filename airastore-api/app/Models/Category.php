<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Category extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'slug',
        'description',
        'icon',
        'image',
        'parent_id',
        'is_active',
        'order',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'order' => 'integer',
    ];

    // Relasi dengan produk
    public function products()
    {
        return $this->hasMany(Product::class);
    }

    // Relasi dengan kategori induk
    public function parent()
    {
        return $this->belongsTo(Category::class, 'parent_id');
    }

    // Relasi dengan sub-kategori
    public function children()
    {
        return $this->hasMany(Category::class, 'parent_id');
    }

    // Scope untuk kategori aktif
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    // Scope untuk kategori utama (tanpa parent)
    public function scopeParents($query)
    {
        return $query->whereNull('parent_id');
    }

    // Mendapatkan jumlah produk aktif dalam kategori
    public function getActiveProductsCountAttribute()
    {
        return $this->products()->active()->count();
    }

    // Menghasilkan slug otomatis dari nama
    protected static function boot()
    {
        parent::boot();
        
        static::creating(function ($category) {
            if (empty($category->slug)) {
                $category->slug = \Str::slug($category->name);
            }
        });

        static::updating(function ($category) {
            if ($category->isDirty('name') && empty($category->slug)) {
                $category->slug = \Str::slug($category->name);
            }
        });
    }

    // Mendapatkan path lengkap kategori
    public function getFullPathAttribute()
    {
        $path = [$this->name];
        $category = $this;

        while ($category->parent) {
            $category = $category->parent;
            array_unshift($path, $category->name);
        }

        return implode(' > ', $path);
    }
}
