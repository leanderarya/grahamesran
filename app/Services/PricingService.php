<?php

namespace App\Services;

use App\Models\Product;

class PricingService
{
    /**
     * Determine the effective selling price for a product based on customer type.
     * Delegates to Product model method as the single source of truth.
     */
    public function getEffectivePrice(Product $product, string $customerType): float
    {
        return $product->getEffectivePrice($customerType);
    }
}
