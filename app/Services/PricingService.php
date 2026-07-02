<?php

namespace App\Services;

use App\Models\Product;

class PricingService
{
    /**
     * Determine the effective selling price for a product based on customer type.
     * Workshop customers get workshop_price if available, otherwise sell_price.
     */
    public function getEffectivePrice(Product $product, string $customerType): float
    {
        if ($customerType === 'workshop' && $product->workshop_price > 0) {
            return (float) $product->workshop_price;
        }

        return (float) $product->sell_price;
    }
}
