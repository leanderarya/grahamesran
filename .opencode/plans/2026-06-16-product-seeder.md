# Product Seeder Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a ProductSeeder with 42 sparepart products, fix typos, set realistic profit margins, and link products to compatible vehicles.

**Architecture:** Single seeder file that creates products and syncs vehicle relationships via the `product_vehicle` pivot table. Follows existing seeder patterns (like VehicleSeeder).

**Tech Stack:** Laravel 12, Eloquent ORM, MySQL

---

### Task 1: Create ProductSeeder with Fixed Typos, Profit Margins, and Vehicle Relations

**Files:**
- Create: `database/seeders/ProductSeeder.php`
- Modify: `database/seeders/DatabaseSeeder.php`

**Changes from original seeder:**
1. Fix typo: `"Bbrek pad Grandmax"` → `"Break pad Grandmax"`
2. Add realistic sell prices (margin 10-30% depending on category)
3. Add vehicle relationships via `->vehicles()->sync([...])` after product creation
4. Register seeder in `DatabaseSeeder.php`

**Margin strategy:**
- Fast-moving items (sekering, klip, karet, soket): ~20-30% margin
- Medium items (kabel busi, FO, platina, tabung busi): ~15-25% margin
- High-value items (break pad, rotak, stabiling, rack end): ~10-20% margin
- Round to nearest Rp 500 for clean pricing

**Vehicle mapping (based on product names):**

| SKU | Product | Vehicles |
|-----|---------|----------|
| GM-0001 | Stabiling Innova | Toyota Innova Gen 1, Innova Reborn |
| GM-0002 | Stabiling Avanza | Toyota Avanza Gen 1, Gen 2, Gen 3 |
| GM-0003 | Stabiling APV | UNIVERSAL SEMUA MOBIL |
| GM-0004 | Stabiling Granmax | Daihatsu Gran Max |
| GM-0005 | Stabiling Calya/Sigra | Toyota Calya, Daihatsu Sigra |
| GM-0006 | Rack end Sigra | Daihatsu Sigra |
| GM-0007 | Rack end Avanza | Toyota Avanza Gen 1, Gen 2, Gen 3 |
| GM-0008 | Rack end Jazz | Honda Jazz GD3, GE8, GK5 |
| GM-0009 | Drag link Futura | UNIVERSAL SEMUA MOBIL |
| GM-0010 | Kabel 0,8/20m | UNIVERSAL SEMUA MOBIL |
| GM-0011 | Swet Rem PS/L300 | UNIVERSAL SEMUA MOBIL |
| GM-0012 | Soket sein T10 | UNIVERSAL SEMUA MOBIL + MOTOR |
| GM-0013 | Platina Kijang | Toyota Innova Gen 1 (Kijang) |
| GM-0014 | Tabung Busi+seal | UNIVERSAL SEMUA MOBIL |
| GM-0015 | Led mata 3 (12 volt) | UNIVERSAL SEMUA MOBIL + MOTOR |
| GM-0016 | CO Kijang Assy | Toyota Innova Gen 1 (Kijang) |
| GM-0017 | CM Kijang Assy | Toyota Innova Gen 1 (Kijang) |
| GM-0018 | FO Avanza | Toyota Avanza Gen 1, Gen 2, Gen 3 |
| GM-0019 | FO Kijang | Toyota Innova Gen 1 (Kijang) |
| GM-0020 | Kabel Busi | UNIVERSAL SEMUA MOBIL |
| GM-0021 | Break pad Panther | UNIVERSAL SEMUA MOBIL |
| GM-0022 | Break pad Granmax | Daihatsu Gran Max |
| GM-0023 | Break pad L300 | UNIVERSAL SEMUA MOBIL |
| GM-0024 | Break pad Avanza | Toyota Avanza Gen 1, Gen 2, Gen 3 |
| GM-0025 | Klip Avanza | Toyota Avanza Gen 1, Gen 2, Gen 3 |
| GM-0026 | Klip Jazz | Honda Jazz GD3, GE8, GK5 |
| GM-0027 | Klip Innova | Toyota Innova Gen 1, Innova Reborn |
| GM-0028 | Klip merah+hijau | UNIVERSAL SEMUA MOBIL |
| GM-0029 | Break pad Innova | Toyota Innova Gen 1, Innova Reborn |
| GM-0030 | Sekering Tancap | UNIVERSAL SEMUA MOBIL |
| GM-0031 | Sekering Micro | UNIVERSAL SEMUA MOBIL |
| GM-0032 | Sekering Tabung 10A | UNIVERSAL SEMUA MOBIL |
| GM-0033 | Karet Gentong shock | UNIVERSAL SEMUA MOBIL |
| GM-0034 | Karet mata shock | UNIVERSAL SEMUA MOBIL |
| GM-0035 | Sekering mini | UNIVERSAL SEMUA MOBIL |
| GM-0036 | Fitting lampu Plastik | UNIVERSAL SEMUA MOBIL |
| GM-0037 | Soket Relay K4 | UNIVERSAL SEMUA MOBIL |
| GM-0038 | Soket Tancap | UNIVERSAL SEMUA MOBIL |
| GM-0039 | Rotak Futura | UNIVERSAL SEMUA MOBIL |
| GM-0040 | Rotak Zebra | UNIVERSAL SEMUA MOBIL |
| GM-0041 | Klem Aki Besar | UNIVERSAL SEMUA MOBIL |
| GM-0042 | Klem Aki Kecil | UNIVERSAL SEMUA MOBIL |

- [ ] **Step 1: Create `database/seeders/ProductSeeder.php`**

```php
<?php

namespace Database\Seeders;

use App\Models\Product;
use App\Models\Vehicle;
use Illuminate\Database\Seeder;

class ProductSeeder extends Seeder
{
    public function run(): void
    {
        // Cache vehicle IDs for mapping
        $vehicles = Vehicle::all()->keyBy(fn ($v) => $v->brand . '|' . $v->model . '|' . $v->year_generation);
        $universalMobil = Vehicle::where('brand', 'UNIVERSAL')->where('model', 'SEMUA MOBIL')->first();
        $universalMotor = Vehicle::where('brand', 'UNIVERSAL')->where('model', 'SEMUA MOTOR')->first();

        $products = [
            [
                'sku' => 'GM-0001', 'name' => 'Stabilizer Innova', 'stock' => 2,
                'cost_price' => 75000, 'sell_price' => 85000,
                'vehicles' => [
                    'Toyota|Innova|Gen 1 (2004-2015)',
                    'Toyota|Innova Reborn|Gen 2 (2015-2022)',
                ],
            ],
            [
                'sku' => 'GM-0002', 'name' => 'Stabilizer Avanza', 'stock' => 2,
                'cost_price' => 60000, 'sell_price' => 70000,
                'vehicles' => [
                    'Toyota|Avanza|Gen 1 (2003-2011)',
                    'Toyota|Avanza|Gen 2 (2011-2021)',
                    'Toyota|Avanza|Gen 3 (2021-Now)',
                ],
            ],
            [
                'sku' => 'GM-0003', 'name' => 'Stabilizer APV', 'stock' => 2,
                'cost_price' => 60000, 'sell_price' => 70000,
                'vehicles' => ['UNIVERSAL|SEMUA MOBIL|-'],
            ],
            [
                'sku' => 'GM-0004', 'name' => 'Stabilizer Granmax', 'stock' => 2,
                'cost_price' => 60000, 'sell_price' => 70000,
                'vehicles' => ['Daihatsu|Gran Max|All Gen'],
            ],
            [
                'sku' => 'GM-0005', 'name' => 'Stabilizer Calya/Sigra', 'stock' => 2,
                'cost_price' => 85000, 'sell_price' => 95000,
                'vehicles' => [
                    'Toyota|Calya|Gen 1 (2016-Now)',
                    'Daihatsu|Sigra|Gen 1 (2016-Now)',
                ],
            ],
            [
                'sku' => 'GM-0006', 'name' => 'Rack end Sigra', 'stock' => 2,
                'cost_price' => 95000, 'sell_price' => 110000,
                'vehicles' => ['Daihatsu|Sigra|Gen 1 (2016-Now)'],
            ],
            [
                'sku' => 'GM-0007', 'name' => 'Rack end Avanza', 'stock' => 1,
                'cost_price' => 90000, 'sell_price' => 105000,
                'vehicles' => [
                    'Toyota|Avanza|Gen 1 (2003-2011)',
                    'Toyota|Avanza|Gen 2 (2011-2021)',
                    'Toyota|Avanza|Gen 3 (2021-Now)',
                ],
            ],
            [
                'sku' => 'GM-0008', 'name' => 'Rack end Jazz', 'stock' => 2,
                'cost_price' => 95000, 'sell_price' => 110000,
                'vehicles' => [
                    'Honda|Jazz|GD3 (2001-2007)',
                    'Honda|Jazz|GE8 (2007-2014)',
                    'Honda|Jazz|GK5 (2014-2021)',
                ],
            ],
            [
                'sku' => 'GM-0009', 'name' => 'Drag link Futura', 'stock' => 2,
                'cost_price' => 80000, 'sell_price' => 95000,
                'vehicles' => ['UNIVERSAL|SEMUA MOBIL|-'],
            ],
            [
                'sku' => 'GM-0010', 'name' => 'Kabel 0,8/20m', 'stock' => 5,
                'cost_price' => 30000, 'sell_price' => 35000,
                'vehicles' => ['UNIVERSAL|SEMUA MOBIL|-'],
            ],
            [
                'sku' => 'GM-0011', 'name' => 'Swet Rem PS/L300', 'stock' => 5,
                'cost_price' => 19000, 'sell_price' => 25000,
                'vehicles' => ['UNIVERSAL|SEMUA MOBIL|-'],
            ],
            [
                'sku' => 'GM-0012', 'name' => 'Soket sein T10', 'stock' => 25,
                'cost_price' => 3600, 'sell_price' => 5000,
                'vehicles' => ['UNIVERSAL|SEMUA MOBIL|-', 'UNIVERSAL|SEMUA MOTOR|-'],
            ],
            [
                'sku' => 'GM-0013', 'name' => 'Platina Kijang', 'stock' => 10,
                'cost_price' => 19000, 'sell_price' => 25000,
                'vehicles' => ['Toyota|Innova|Gen 1 (2004-2015)'],
            ],
            [
                'sku' => 'GM-0014', 'name' => 'Tabung Busi+seal', 'stock' => 12,
                'cost_price' => 11000, 'sell_price' => 15000,
                'vehicles' => ['UNIVERSAL|SEMUA MOBIL|-'],
            ],
            [
                'sku' => 'GM-0015', 'name' => 'LED mata 3 (12 volt)', 'stock' => 40,
                'cost_price' => 3000, 'sell_price' => 5000,
                'vehicles' => ['UNIVERSAL|SEMUA MOBIL|-', 'UNIVERSAL|SEMUA MOTOR|-'],
            ],
            [
                'sku' => 'GM-0016', 'name' => 'CO Kijang Assy', 'stock' => 1,
                'cost_price' => 115000, 'sell_price' => 135000,
                'vehicles' => ['Toyota|Innova|Gen 1 (2004-2015)'],
            ],
            [
                'sku' => 'GM-0017', 'name' => 'CM Kijang Assy', 'stock' => 1,
                'cost_price' => 165000, 'sell_price' => 190000,
                'vehicles' => ['Toyota|Innova|Gen 1 (2004-2015)'],
            ],
            [
                'sku' => 'GM-0018', 'name' => 'FO Avanza', 'stock' => 2,
                'cost_price' => 28000, 'sell_price' => 35000,
                'vehicles' => [
                    'Toyota|Avanza|Gen 1 (2003-2011)',
                    'Toyota|Avanza|Gen 2 (2011-2021)',
                    'Toyota|Avanza|Gen 3 (2021-Now)',
                ],
            ],
            [
                'sku' => 'GM-0019', 'name' => 'FO Kijang', 'stock' => 5,
                'cost_price' => 26000, 'sell_price' => 32000,
                'vehicles' => ['Toyota|Innova|Gen 1 (2004-2015)'],
            ],
            [
                'sku' => 'GM-0020', 'name' => 'Kabel Busi', 'stock' => 6,
                'cost_price' => 60000, 'sell_price' => 75000,
                'vehicles' => ['UNIVERSAL|SEMUA MOBIL|-'],
            ],
            [
                'sku' => 'GM-0021', 'name' => 'Break pad Panther', 'stock' => 2,
                'cost_price' => 120000, 'sell_price' => 140000,
                'vehicles' => ['UNIVERSAL|SEMUA MOBIL|-'],
            ],
            [
                'sku' => 'GM-0022', 'name' => 'Break pad Granmax', 'stock' => 2,
                'cost_price' => 120000, 'sell_price' => 140000,
                'vehicles' => ['Daihatsu|Gran Max|All Gen'],
            ],
            [
                'sku' => 'GM-0023', 'name' => 'Break pad L300', 'stock' => 2,
                'cost_price' => 135000, 'sell_price' => 155000,
                'vehicles' => ['UNIVERSAL|SEMUA MOBIL|-'],
            ],
            [
                'sku' => 'GM-0024', 'name' => 'Break pad Avanza', 'stock' => 2,
                'cost_price' => 100000, 'sell_price' => 120000,
                'vehicles' => [
                    'Toyota|Avanza|Gen 1 (2003-2011)',
                    'Toyota|Avanza|Gen 2 (2011-2021)',
                    'Toyota|Avanza|Gen 3 (2021-Now)',
                ],
            ],
            [
                'sku' => 'GM-0025', 'name' => 'Klip Avanza', 'stock' => 100,
                'cost_price' => 900, 'sell_price' => 1500,
                'vehicles' => [
                    'Toyota|Avanza|Gen 1 (2003-2011)',
                    'Toyota|Avanza|Gen 2 (2011-2021)',
                    'Toyota|Avanza|Gen 3 (2021-Now)',
                ],
            ],
            [
                'sku' => 'GM-0026', 'name' => 'Klip Jazz', 'stock' => 100,
                'cost_price' => 1200, 'sell_price' => 2000,
                'vehicles' => [
                    'Honda|Jazz|GD3 (2001-2007)',
                    'Honda|Jazz|GE8 (2007-2014)',
                    'Honda|Jazz|GK5 (2014-2021)',
                ],
            ],
            [
                'sku' => 'GM-0027', 'name' => 'Klip Innova', 'stock' => 100,
                'cost_price' => 1200, 'sell_price' => 2000,
                'vehicles' => [
                    'Toyota|Innova|Gen 1 (2004-2015)',
                    'Toyota|Innova Reborn|Gen 2 (2015-2022)',
                ],
            ],
            [
                'sku' => 'GM-0028', 'name' => 'Klip merah+hijau', 'stock' => 200,
                'cost_price' => 700, 'sell_price' => 1000,
                'vehicles' => ['UNIVERSAL|SEMUA MOBIL|-'],
            ],
            [
                'sku' => 'GM-0029', 'name' => 'Break pad Innova', 'stock' => 2,
                'cost_price' => 120000, 'sell_price' => 140000,
                'vehicles' => [
                    'Toyota|Innova|Gen 1 (2004-2015)',
                    'Toyota|Innova Reborn|Gen 2 (2015-2022)',
                ],
            ],
            [
                'sku' => 'GM-0030', 'name' => 'Sekering Tancap', 'stock' => 600,
                'cost_price' => 500, 'sell_price' => 1000,
                'vehicles' => ['UNIVERSAL|SEMUA MOBIL|-'],
            ],
            [
                'sku' => 'GM-0031', 'name' => 'Sekering Micro', 'stock' => 500,
                'cost_price' => 600, 'sell_price' => 1000,
                'vehicles' => ['UNIVERSAL|SEMUA MOBIL|-'],
            ],
            [
                'sku' => 'GM-0032', 'name' => 'Sekering Tabung 10A', 'stock' => 100,
                'cost_price' => 700, 'sell_price' => 1000,
                'vehicles' => ['UNIVERSAL|SEMUA MOBIL|-'],
            ],
            [
                'sku' => 'GM-0033', 'name' => 'Karet Gentong shock', 'stock' => 20,
                'cost_price' => 2600, 'sell_price' => 3500,
                'vehicles' => ['UNIVERSAL|SEMUA MOBIL|-'],
            ],
            [
                'sku' => 'GM-0034', 'name' => 'Karet mata shock', 'stock' => 50,
                'cost_price' => 2600, 'sell_price' => 3500,
                'vehicles' => ['UNIVERSAL|SEMUA MOBIL|-'],
            ],
            [
                'sku' => 'GM-0035', 'name' => 'Sekering mini', 'stock' => 400,
                'cost_price' => 500, 'sell_price' => 1000,
                'vehicles' => ['UNIVERSAL|SEMUA MOBIL|-'],
            ],
            [
                'sku' => 'GM-0036', 'name' => 'Fitting lampu Plastik', 'stock' => 25,
                'cost_price' => 5400, 'sell_price' => 7000,
                'vehicles' => ['UNIVERSAL|SEMUA MOBIL|-'],
            ],
            [
                'sku' => 'GM-0037', 'name' => 'Soket Relay K4', 'stock' => 10,
                'cost_price' => 8000, 'sell_price' => 10000,
                'vehicles' => ['UNIVERSAL|SEMUA MOBIL|-'],
            ],
            [
                'sku' => 'GM-0038', 'name' => 'Soket Tancap', 'stock' => 10,
                'cost_price' => 7000, 'sell_price' => 9000,
                'vehicles' => ['UNIVERSAL|SEMUA MOBIL|-'],
            ],
            [
                'sku' => 'GM-0039', 'name' => 'Rotak Futura', 'stock' => 2,
                'cost_price' => 265000, 'sell_price' => 295000,
                'vehicles' => ['UNIVERSAL|SEMUA MOBIL|-'],
            ],
            [
                'sku' => 'GM-0040', 'name' => 'Rotak Zebra', 'stock' => 2,
                'cost_price' => 145000, 'sell_price' => 165000,
                'vehicles' => ['UNIVERSAL|SEMUA MOBIL|-'],
            ],
            [
                'sku' => 'GM-0041', 'name' => 'Klem Aki Besar', 'stock' => 5,
                'cost_price' => 19000, 'sell_price' => 25000,
                'vehicles' => ['UNIVERSAL|SEMUA MOBIL|-'],
            ],
            [
                'sku' => 'GM-0042', 'name' => 'Klem Aki Kecil', 'stock' => 5,
                'cost_price' => 15000, 'sell_price' => 20000,
                'vehicles' => ['UNIVERSAL|SEMUA MOBIL|-'],
            ],
        ];

        foreach ($products as $productData) {
            $vehicleKeys = $productData['vehicles'];
            unset($productData['vehicles']);

            $product = Product::updateOrCreate(
                ['sku' => $productData['sku']],
                array_merge($productData, [
                    'workshop_price' => null,
                    'volume_liter' => null,
                    'image_path' => null,
                ])
            );

            // Sync vehicle relationships
            $vehicleIds = collect($vehicleKeys)
                ->map(fn ($key) => $vehicles[$key]?->id)
                ->filter()
                ->values()
                ->toArray();

            if (!empty($vehicleIds)) {
                $product->vehicles()->sync($vehicleIds);
            }
        }
    }
}
```

- [ ] **Step 2: Update `database/seeders/DatabaseSeeder.php`**

Add `ProductSeeder::class` to the `$this->call([])` array:

```php
$this->call([
    AdminSeeder::class,
    VehicleSeeder::class,
    ProductSeeder::class,
]);
```

- [ ] **Step 3: Run the seeder**

Run: `php artisan db:seed --class=ProductSeeder`
Expected: 42 products created with vehicle relationships

- [ ] **Step 4: Verify data**

Run: `php artisan tinker --execute="echo App\Models\Product::count() . ' products, ' . DB::table('product_vehicle')->count() . ' vehicle links';"`

- [ ] **Step 5: Commit**

```bash
git add database/seeders/ProductSeeder.php database/seeders/DatabaseSeeder.php
git commit -m "feat: add ProductSeeder with 42 sparepart products, pricing, and vehicle relations"
```

---

## Verification Checklist

- [ ] `php artisan db:seed --class=ProductSeeder` — runs without errors
- [ ] 42 products exist in `products` table
- [ ] Vehicle relationships exist in `product_vehicle` pivot table
- [ ] All sell prices > cost prices (positive margin)
- [ ] Typo "Bbrek" is fixed to "Break"
