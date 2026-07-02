<?php

namespace Database\Seeders;

use App\Models\Product;
use Illuminate\Database\Seeder;

class OilSeeder extends Seeder
{
    /**
     * Seed oli dari invoice PT. Gunung Mas Indah — 18 Juni 2026.
     * No Invoice: 03524/CR/GMI/06/2026
     *
     * Harga beli (cost_price) = harga dus / jumlah pcs per dus.
     * Harga jual (sell_price) = markup ~30% dari harga beli, dibulatkan.
     * Harga bengkel (workshop_price) = ~15% lebih murah dari harga jual.
     * Stok = 1 dus per produk (dikonversi ke jumlah pcs).
     */
    public function run(): void
    {
        $oils = [
            // ── ENDURO Series ──
            [
                'sku'          => 'OLI-0001',
                'name'         => 'Enduro Matic 10W-30',
                'category'     => 'Oli',
                'stock'        => 6,        // 1 DUS = 6 pcs
                'cost_price'   => 49369,    // 296.216 / 6
                'sell_price'   => 65000,
                'workshop_price' => 56000,
                'volume_liter' => 0.8,
            ],
            [
                'sku'          => 'OLI-0002',
                'name'         => 'Enduro 4T 20W-50',
                'category'     => 'Oli',
                'stock'        => 6,        // 1 DUS = 6 pcs (6×0.8L)
                'cost_price'   => 43153,    // 258.919 / 6
                'sell_price'   => 57000,
                'workshop_price' => 49000,
                'volume_liter' => 0.8,
            ],
            [
                'sku'          => 'OLI-0003',
                'name'         => 'Enduro 4T 20W-50',
                'category'     => 'Oli',
                'stock'        => 6,        // 1 DUS = 6 pcs (6×1L)
                'cost_price'   => 50631,    // 303.784 / 6
                'sell_price'   => 66000,
                'workshop_price' => 57000,
                'volume_liter' => 1.0,
            ],
            [
                'sku'          => 'OLI-0004',
                'name'         => 'Enduro 4T Racing 10W-40',
                'category'     => 'Oli',
                'stock'        => 6,        // 1 DUS = 6 pcs
                'cost_price'   => 63874,    // 383.243 / 6
                'sell_price'   => 83000,
                'workshop_price' => 72000,
                'volume_liter' => 1.0,
            ],
            [
                'sku'          => 'OLI-0005',
                'name'         => 'Enduro Matic G 20W-40',
                'category'     => 'Oli',
                'stock'        => 6,        // 1 DUS = 6 pcs
                'cost_price'   => 48559,    // 291.351 / 6
                'sell_price'   => 63000,
                'workshop_price' => 55000,
                'volume_liter' => 0.8,
            ],
            [
                'sku'          => 'OLI-0006',
                'name'         => 'Enduro Matic S 10W-30',
                'category'     => 'Oli',
                'stock'        => 6,        // 1 DUS = 6 pcs
                'cost_price'   => 47928,    // 287.568 / 6
                'sell_price'   => 63000,
                'workshop_price' => 55000,
                'volume_liter' => 0.8,
            ],
            [
                'sku'          => 'OLI-0013',
                'name'         => 'Enduro Gear Matic',
                'category'     => 'Oli',
                'stock'        => 24,       // 1 DUS = 24 pcs
                'cost_price'   => 12703,    // 304.866 / 24
                'sell_price'   => 17000,
                'workshop_price' => 15000,
                'volume_liter' => 0.12,     // 120 ML
            ],

            // ── FASTRON Series ──
            [
                'sku'          => 'OLI-0007',
                'name'         => 'Fastron Techno 10W-40',
                'category'     => 'Oli',
                'stock'        => 6,        // 1 DUS = 6 pcs
                'cost_price'   => 73243,    // 439.459 / 6
                'sell_price'   => 95000,
                'workshop_price' => 82000,
                'volume_liter' => 1.0,
            ],

            // ── PRIMA Series ──
            [
                'sku'          => 'OLI-0008',
                'name'         => 'Prima XP 20W-50 SL',
                'category'     => 'Oli',
                'stock'        => 6,        // 1 DUS = 6 pcs
                'cost_price'   => 49910,    // 299.460 / 6
                'sell_price'   => 65000,
                'workshop_price' => 56000,
                'volume_liter' => 1.0,
            ],

            // ── MEDITRAN Series ──
            [
                'sku'          => 'OLI-0009',
                'name'         => 'Meditran S 40',
                'category'     => 'Oli',
                'stock'        => 20,       // 1 DUS = 20 pcs
                'cost_price'   => 51441,    // 1.028.829 / 20
                'sell_price'   => 67000,
                'workshop_price' => 58000,
                'volume_liter' => 1.0,
            ],

            // ── MESRAN Series ──
            [
                'sku'          => 'OLI-0010',
                'name'         => 'Mesran Super 20W-50',
                'category'     => 'Oli',
                'stock'        => 24,       // 1 DUS = 24 pcs (24×0.8L)
                'cost_price'   => 40270,    // 966.486 / 24
                'sell_price'   => 53000,
                'workshop_price' => 46000,
                'volume_liter' => 0.8,
            ],
            [
                'sku'          => 'OLI-0011',
                'name'         => 'Mesran Super 20W-50',
                'category'     => 'Oli',
                'stock'        => 20,       // 1 DUS = 20 pcs (20×1L)
                'cost_price'   => 47658,    // 953.153 / 20
                'sell_price'   => 62000,
                'workshop_price' => 54000,
                'volume_liter' => 1.0,
            ],
            [
                'sku'          => 'OLI-0012',
                'name'         => 'Mesran B 40',
                'category'     => 'Oli',
                'stock'        => 20,       // 1 DUS = 20 pcs
                'cost_price'   => 49369,    // 987.387 / 20
                'sell_price'   => 65000,
                'workshop_price' => 56000,
                'volume_liter' => 1.0,
            ],
        ];

        foreach ($oils as $oil) {
            Product::updateOrCreate(
                ['sku' => $oil['sku']],
                [
                    'name'           => $oil['name'],
                    'category'       => $oil['category'],
                    'stock'          => $oil['stock'],
                    'cost_price'     => $oil['cost_price'],
                    'sell_price'     => $oil['sell_price'],
                    'workshop_price' => $oil['workshop_price'],
                    'volume_liter'   => $oil['volume_liter'],
                    'image_path'     => null,
                ],
            );
        }
    }
}
