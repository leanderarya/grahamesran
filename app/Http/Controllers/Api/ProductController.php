<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\JsonResponse;

class ProductController extends Controller
{
    public function index(): JsonResponse
    {
        $products = Product::with('vehicles')
            ->where('stock', '>', 0)
            ->select('id', 'sku', 'name', 'category', 'image_path', 'volume_liter', 'stock', 'sell_price', 'workshop_price')
            ->get();

        $categories = Product::where('stock', '>', 0)
            ->whereNotNull('category')
            ->distinct()
            ->pluck('category')
            ->sort()
            ->values();

        return response()->json([
            'products' => $products,
            'categories' => $categories,
        ]);
    }
}
