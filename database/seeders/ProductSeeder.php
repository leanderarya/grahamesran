<?php

namespace Database\Seeders;

use App\Models\Product;
use App\Models\Vehicle;
use Illuminate\Database\Seeder;

class ProductSeeder extends Seeder
{
    public function run(): void
    {
        $vehicles = Vehicle::all()->keyBy(fn ($v) => $v->brand . '|' . $v->model . '|' . $v->year_generation);

        $products = [
            [
                'sku' => 'A1-0001', 'name' => 'Stabilizer Innova', 'category' => 'Kaki-Kaki', 'stock' => 2,                'cost_price' => 75000, 'sell_price' => 95000,
                'vehicles' => [
                    'Toyota|Innova|Gen 1 (2004-2015)',
                    'Toyota|Innova Reborn|Gen 2 (2015-2022)',
                ],
            ],
            [
                'sku' => 'A1-0002', 'name' => 'Stabilizer Avanza', 'category' => 'Kaki-Kaki', 'stock' => 2,                'cost_price' => 60000, 'sell_price' => 70000,
                'vehicles' => [
                    'Toyota|Avanza|Gen 1 (2003-2011)',
                    'Toyota|Avanza|Gen 2 (2011-2021)',
                    'Toyota|Avanza|Gen 3 (2021-Now)',
                ],
            ],
            [
                'sku' => 'A1-0003', 'name' => 'Stabilizer APV', 'category' => 'Kaki-Kaki', 'stock' => 2,                'cost_price' => 60000, 'sell_price' => 70000,
                'vehicles' => ['UNIVERSAL|SEMUA MOBIL|-'],
            ],
            [
                'sku' => 'A1-0004', 'name' => 'Stabilizer Granmax', 'category' => 'Kaki-Kaki', 'stock' => 2,                'cost_price' => 60000, 'sell_price' => 70000,
                'vehicles' => ['Daihatsu|Gran Max|All Gen'],
            ],
            [
                'sku' => 'A1-0005', 'name' => 'Stabilizer Calya/Sigra', 'category' => 'Kaki-Kaki', 'stock' => 2,                'cost_price' => 85000, 'sell_price' => 105000,
                'vehicles' => [
                    'Toyota|Calya|Gen 1 (2016-Now)',
                    'Daihatsu|Sigra|Gen 1 (2016-Now)',
                ],
            ],
            [
                'sku' => 'A1-0006', 'name' => 'Rack end Sigra', 'category' => 'Kaki-Kaki', 'stock' => 2,                'cost_price' => 95000, 'sell_price' => 110000,
                'vehicles' => ['Daihatsu|Sigra|Gen 1 (2016-Now)'],
            ],
            [
                'sku' => 'A1-0007', 'name' => 'Rack end Avanza', 'category' => 'Kaki-Kaki', 'stock' => 1,                'cost_price' => 90000, 'sell_price' => 105000,
                'vehicles' => [
                    'Toyota|Avanza|Gen 1 (2003-2011)',
                    'Toyota|Avanza|Gen 2 (2011-2021)',
                    'Toyota|Avanza|Gen 3 (2021-Now)',
                ],
            ],
            [
                'sku' => 'A1-0008', 'name' => 'Rack end Jazz', 'category' => 'Kaki-Kaki', 'stock' => 2,                'cost_price' => 95000, 'sell_price' => 110000,
                'vehicles' => [
                    'Honda|Jazz|GD3 (2001-2007)',
                    'Honda|Jazz|GE8 (2007-2014)',
                    'Honda|Jazz|GK5 (2014-2021)',
                ],
            ],
            [
                'sku' => 'A1-0009', 'name' => 'Drag link Futura', 'category' => 'Kaki-Kaki', 'stock' => 2,                'cost_price' => 80000, 'sell_price' => 95000,
                'vehicles' => ['UNIVERSAL|SEMUA MOBIL|-'],
            ],
            [
                'sku' => 'A2-0001', 'name' => 'Kabel 0,8/20m', 'category' => 'Kelistrikan', 'stock' => 5,                'cost_price' => 30000, 'sell_price' => 35000,
                'vehicles' => ['UNIVERSAL|SEMUA MOBIL|-'],
            ],
            [
                'sku' => 'A3-0001', 'name' => 'Swet Rem PS/L300', 'category' => 'Rem', 'stock' => 5,                'cost_price' => 19000, 'sell_price' => 25000,
                'vehicles' => ['UNIVERSAL|SEMUA MOBIL|-'],
            ],
            [
                'sku' => 'A2-0002', 'name' => 'Soket sein T10', 'category' => 'Kelistrikan', 'stock' => 25,                'cost_price' => 3600, 'sell_price' => 5000,
                'vehicles' => ['UNIVERSAL|SEMUA MOBIL|-', 'UNIVERSAL|SEMUA MOTOR|-'],
            ],
            [
                'sku' => 'B3-0001', 'name' => 'Platina Kijang', 'category' => 'Mesin', 'stock' => 10,                'cost_price' => 19000, 'sell_price' => 25000,
                'vehicles' => ['Toyota|Innova|Gen 1 (2004-2015)'],
            ],
            [
                'sku' => 'A2-0003', 'name' => 'Tabung Busi+seal', 'category' => 'Kelistrikan', 'stock' => 12,                'cost_price' => 11000, 'sell_price' => 15000,
                'vehicles' => ['UNIVERSAL|SEMUA MOBIL|-'],
            ],
            [
                'sku' => 'A2-0004', 'name' => 'LED mata 3 (12 volt)', 'category' => 'Kelistrikan', 'stock' => 40,                'cost_price' => 3000, 'sell_price' => 5000,
                'vehicles' => ['UNIVERSAL|SEMUA MOBIL|-', 'UNIVERSAL|SEMUA MOTOR|-'],
            ],
            [
                'sku' => 'B3-0002', 'name' => 'CO Kijang Assy', 'category' => 'Mesin', 'stock' => 1,                'cost_price' => 115000, 'sell_price' => 135000,
                'vehicles' => ['Toyota|Innova|Gen 1 (2004-2015)'],
            ],
            [
                'sku' => 'B3-0003', 'name' => 'CM Kijang Assy', 'category' => 'Mesin', 'stock' => 1,                'cost_price' => 165000, 'sell_price' => 190000,
                'vehicles' => ['Toyota|Innova|Gen 1 (2004-2015)'],
            ],
            [
                'sku' => 'B3-0004', 'name' => 'FO Avanza', 'category' => 'Mesin', 'stock' => 2,                'cost_price' => 28000, 'sell_price' => 35000,
                'vehicles' => [
                    'Toyota|Avanza|Gen 1 (2003-2011)',
                    'Toyota|Avanza|Gen 2 (2011-2021)',
                    'Toyota|Avanza|Gen 3 (2021-Now)',
                ],
            ],
            [
                'sku' => 'B3-0005', 'name' => 'FO Kijang', 'category' => 'Mesin', 'stock' => 5,                'cost_price' => 26000, 'sell_price' => 32000,
                'vehicles' => ['Toyota|Innova|Gen 1 (2004-2015)'],
            ],
            [
                'sku' => 'A2-0005', 'name' => 'Kabel Busi', 'category' => 'Kelistrikan', 'stock' => 6,                'cost_price' => 60000, 'sell_price' => 75000,
                'vehicles' => ['UNIVERSAL|SEMUA MOBIL|-'],
            ],
            [
                'sku' => 'A3-0002', 'name' => 'Break pad Panther', 'category' => 'Rem', 'stock' => 2,                'cost_price' => 120000, 'sell_price' => 140000,
                'vehicles' => ['UNIVERSAL|SEMUA MOBIL|-'],
            ],
            [
                'sku' => 'A3-0003', 'name' => 'Break pad Granmax', 'category' => 'Rem', 'stock' => 2,                'cost_price' => 120000, 'sell_price' => 140000,
                'vehicles' => ['Daihatsu|Gran Max|All Gen'],
            ],
            [
                'sku' => 'A3-0004', 'name' => 'Break pad L300', 'category' => 'Rem', 'stock' => 2,                'cost_price' => 135000, 'sell_price' => 165000,
                'vehicles' => ['UNIVERSAL|SEMUA MOBIL|-'],
            ],
            [
                'sku' => 'A3-0005', 'name' => 'Break pad Avanza', 'category' => 'Rem', 'stock' => 2,                'cost_price' => 100000, 'sell_price' => 120000,
                'vehicles' => [
                    'Toyota|Avanza|Gen 1 (2003-2011)',
                    'Toyota|Avanza|Gen 2 (2011-2021)',
                    'Toyota|Avanza|Gen 3 (2021-Now)',
                ],
            ],
            [
                'sku' => 'A2-0006', 'name' => 'Klip Avanza', 'category' => 'Kelistrikan', 'stock' => 100,                'cost_price' => 900, 'sell_price' => 1500,
                'vehicles' => [
                    'Toyota|Avanza|Gen 1 (2003-2011)',
                    'Toyota|Avanza|Gen 2 (2011-2021)',
                    'Toyota|Avanza|Gen 3 (2021-Now)',
                ],
            ],
            [
                'sku' => 'A2-0007', 'name' => 'Klip Jazz', 'category' => 'Kelistrikan', 'stock' => 100,                'cost_price' => 1200, 'sell_price' => 2000,
                'vehicles' => [
                    'Honda|Jazz|GD3 (2001-2007)',
                    'Honda|Jazz|GE8 (2007-2014)',
                    'Honda|Jazz|GK5 (2014-2021)',
                ],
            ],
            [
                'sku' => 'A2-0008', 'name' => 'Klip Innova', 'category' => 'Kelistrikan', 'stock' => 100,                'cost_price' => 1200, 'sell_price' => 2000,
                'vehicles' => [
                    'Toyota|Innova|Gen 1 (2004-2015)',
                    'Toyota|Innova Reborn|Gen 2 (2015-2022)',
                ],
            ],
            [
                'sku' => 'A2-0009', 'name' => 'Klip merah+hijau', 'category' => 'Kelistrikan', 'stock' => 200,                'cost_price' => 700, 'sell_price' => 1000,
                'vehicles' => ['UNIVERSAL|SEMUA MOBIL|-'],
            ],
            [
                'sku' => 'A3-0006', 'name' => 'Break pad Innova', 'category' => 'Rem', 'stock' => 2,                'cost_price' => 120000, 'sell_price' => 140000,
                'vehicles' => [
                    'Toyota|Innova|Gen 1 (2004-2015)',
                    'Toyota|Innova Reborn|Gen 2 (2015-2022)',
                ],
            ],
            [
                'sku' => 'A2-0010', 'name' => 'Sekering Tancap', 'category' => 'Kelistrikan', 'stock' => 600,                'cost_price' => 500, 'sell_price' => 1000,
                'vehicles' => ['UNIVERSAL|SEMUA MOBIL|-'],
            ],
            [
                'sku' => 'A2-0011', 'name' => 'Sekering Micro', 'category' => 'Kelistrikan', 'stock' => 500,                'cost_price' => 600, 'sell_price' => 1000,
                'vehicles' => ['UNIVERSAL|SEMUA MOBIL|-'],
            ],
            [
                'sku' => 'A2-0012', 'name' => 'Sekering Tabung 10A', 'category' => 'Kelistrikan', 'stock' => 100,                'cost_price' => 700, 'sell_price' => 1000,
                'vehicles' => ['UNIVERSAL|SEMUA MOBIL|-'],
            ],
            [
                'sku' => 'B1-0001', 'name' => 'Karet Gentong shock', 'category' => 'Tools', 'stock' => 20,                'cost_price' => 2600, 'sell_price' => 3500,
                'vehicles' => ['UNIVERSAL|SEMUA MOBIL|-'],
            ],
            [
                'sku' => 'B1-0002', 'name' => 'Karet mata shock', 'category' => 'Tools', 'stock' => 50,                'cost_price' => 2600, 'sell_price' => 3500,
                'vehicles' => ['UNIVERSAL|SEMUA MOBIL|-'],
            ],
            [
                'sku' => 'A2-0013', 'name' => 'Sekering mini', 'category' => 'Kelistrikan', 'stock' => 400,                'cost_price' => 500, 'sell_price' => 1000,
                'vehicles' => ['UNIVERSAL|SEMUA MOBIL|-'],
            ],
            [
                'sku' => 'A2-0014', 'name' => 'Fitting lampu Plastik', 'category' => 'Kelistrikan', 'stock' => 25,                'cost_price' => 5400, 'sell_price' => 7000,
                'vehicles' => ['UNIVERSAL|SEMUA MOBIL|-'],
            ],
            [
                'sku' => 'A2-0015', 'name' => 'Soket Relay K4', 'category' => 'Kelistrikan', 'stock' => 10,                'cost_price' => 8000, 'sell_price' => 10000,
                'vehicles' => ['UNIVERSAL|SEMUA MOBIL|-'],
            ],
            [
                'sku' => 'A2-0016', 'name' => 'Soket Tancap', 'category' => 'Kelistrikan', 'stock' => 10,                'cost_price' => 7000, 'sell_price' => 9000,
                'vehicles' => ['UNIVERSAL|SEMUA MOBIL|-'],
            ],
            [
                'sku' => 'B1-0003', 'name' => 'Rotak Futura', 'category' => 'Tools', 'stock' => 2,                'cost_price' => 265000, 'sell_price' => 320000,
                'vehicles' => ['UNIVERSAL|SEMUA MOBIL|-'],
            ],
            [
                'sku' => 'B1-0004', 'name' => 'Rotak Zebra', 'category' => 'Tools', 'stock' => 2,                'cost_price' => 145000, 'sell_price' => 175000,
                'vehicles' => ['UNIVERSAL|SEMUA MOBIL|-'],
            ],
            [
                'sku' => 'B1-0005', 'name' => 'Klem Aki Besar', 'category' => 'Tools', 'stock' => 5,                'cost_price' => 19000, 'sell_price' => 25000,
                'vehicles' => ['UNIVERSAL|SEMUA MOBIL|-'],
            ],
            [
                'sku' => 'B1-0006', 'name' => 'Klem Aki Kecil', 'category' => 'Tools', 'stock' => 5,                'cost_price' => 15000, 'sell_price' => 20000,
                'vehicles' => ['UNIVERSAL|SEMUA MOBIL|-'],
            ],

            // ===== Sheet 1 - Tanggal 17 Juni 2026 =====
            [
                'sku' => 'A2-0017', 'name' => 'Kabel Busi S89', 'category' => 'Kelistrikan', 'stock' => 2,                'cost_price' => 85000, 'sell_price' => 105000,
                'vehicles' => ['UNIVERSAL|SEMUA MOBIL|-'],
            ],
            [
                'sku' => 'A2-0018', 'name' => 'Kabel Busi L 300', 'category' => 'Kelistrikan', 'stock' => 2,                'cost_price' => 60000, 'sell_price' => 115000,
                'vehicles' => ['UNIVERSAL|SEMUA MOBIL|-'],
            ],
            [
                'sku' => 'A2-0019', 'name' => 'Kabel Busi Innova', 'category' => 'Kelistrikan', 'stock' => 2,                'cost_price' => 60000, 'sell_price' => 115000,
                'vehicles' => ['Toyota|Innova|Gen 1 (2004-2015)', 'Toyota|Innova Reborn|Gen 2 (2015-2022)'],
            ],
            [
                'sku' => 'A2-0020', 'name' => 'Kabel Busi Suzuki (APV)', 'category' => 'Kelistrikan', 'stock' => 2,                'cost_price' => 60000, 'sell_price' => 115000,
                'vehicles' => ['UNIVERSAL|SEMUA MOBIL|-'],
            ],
            [
                'sku' => 'A2-0021', 'name' => 'Kabel Busi T120 SS', 'category' => 'Kelistrikan', 'stock' => 2,                'cost_price' => 60000, 'sell_price' => 115000,
                'vehicles' => ['UNIVERSAL|SEMUA MOBIL|-'],
            ],
            [
                'sku' => 'B2-0001', 'name' => 'Set (4) Spion Avanza', 'category' => 'Body', 'stock' => 2,                'cost_price' => 55000, 'sell_price' => 65000,
                'vehicles' => ['Toyota|Avanza|Gen 1 (2003-2011)', 'Toyota|Avanza|Gen 2 (2011-2021)'],
            ],
            [
                'sku' => 'B2-0002', 'name' => 'Set (8) Handle Luar Avanza Lama', 'category' => 'Body', 'stock' => 2,                'cost_price' => 40000, 'sell_price' => 50000,
                'vehicles' => ['Toyota|Avanza|Gen 1 (2003-2011)'],
            ],
            [
                'sku' => 'A2-0022', 'name' => 'Roll Kabel 2m (30 M)', 'category' => 'Kelistrikan', 'stock' => 1,                'cost_price' => 7000, 'sell_price' => 9000,
                'vehicles' => ['UNIVERSAL|SEMUA MOBIL|-'],
            ],
            [
                'sku' => 'A2-0023', 'name' => 'Kabel Accu Paralel', 'category' => 'Kelistrikan', 'stock' => 2,                'cost_price' => 38000, 'sell_price' => 48000,
                'vehicles' => ['UNIVERSAL|SEMUA MOBIL|-'],
            ],
            [
                'sku' => 'B2-0003', 'name' => 'Kanebo', 'category' => 'Body', 'stock' => 8,                'cost_price' => 12000, 'sell_price' => 15000,
                'vehicles' => ['UNIVERSAL|SEMUA MOBIL|-'],
            ],
            [
                'sku' => 'B2-0004', 'name' => 'Karpet/kepet Merk Sparco K', 'category' => 'Body', 'stock' => 5,                'cost_price' => 28000, 'sell_price' => 48000,
                'vehicles' => ['UNIVERSAL|SEMUA MOBIL|-'],
            ],
            [
                'sku' => 'A2-0024', 'name' => 'Soket Seal Beam', 'category' => 'Kelistrikan', 'stock' => 10,                'cost_price' => 8000, 'sell_price' => 10000,
                'vehicles' => ['UNIVERSAL|SEMUA MOBIL|-'],
            ],
            [
                'sku' => 'A2-0025', 'name' => 'Soket Relay Kuning', 'category' => 'Kelistrikan', 'stock' => 10,                'cost_price' => 8000, 'sell_price' => 12000,
                'vehicles' => ['UNIVERSAL|SEMUA MOBIL|-'],
            ],
            [
                'sku' => 'A2-0026', 'name' => 'Klakson TIAT Denso', 'category' => 'Kelistrikan', 'stock' => 2,                'cost_price' => 105000, 'sell_price' => 130000,
                'vehicles' => ['UNIVERSAL|SEMUA MOBIL|-'],
            ],
            [
                'sku' => 'A2-0027', 'name' => 'Klakson Keong Denso', 'category' => 'Kelistrikan', 'stock' => 2,                'cost_price' => 140000, 'sell_price' => 165000,
                'vehicles' => ['UNIVERSAL|SEMUA MOBIL|-'],
            ],
            [
                'sku' => 'B1-0007', 'name' => 'Karet Rem 30253 R (PS)', 'category' => 'Tools', 'stock' => 30,                'cost_price' => 2500, 'sell_price' => 5000,
                'vehicles' => ['UNIVERSAL|SEMUA MOBIL|-'],
            ],
            [
                'sku' => 'B1-0008', 'name' => 'Karet Rem 40493R (Dutro)', 'category' => 'Tools', 'stock' => 30,                'cost_price' => 2500, 'sell_price' => 5000,
                'vehicles' => ['UNIVERSAL|SEMUA MOBIL|-'],
            ],
            [
                'sku' => 'A1-0010', 'name' => 'Rack End Livina', 'category' => 'Kaki-Kaki', 'stock' => 2,                'cost_price' => 90000, 'sell_price' => 115000,
                'vehicles' => ['UNIVERSAL|SEMUA MOBIL|-'],
            ],
            [
                'sku' => 'A1-0011', 'name' => 'Rack End Kijang 5K', 'category' => 'Kaki-Kaki', 'stock' => 2,                'cost_price' => 90000, 'sell_price' => 115000,
                'vehicles' => ['Toyota|Innova|Gen 1 (2004-2015)'],
            ],
            [
                'sku' => 'A1-0012', 'name' => 'Rack End Panther', 'category' => 'Kaki-Kaki', 'stock' => 2,                'cost_price' => 95000, 'sell_price' => 120000,
                'vehicles' => ['UNIVERSAL|SEMUA MOBIL|-'],
            ],
            [
                'sku' => 'A1-0013', 'name' => 'Rack End Innova', 'category' => 'Kaki-Kaki', 'stock' => 2,                'cost_price' => 95000, 'sell_price' => 130000,
                'vehicles' => ['Toyota|Innova|Gen 1 (2004-2015)', 'Toyota|Innova Reborn|Gen 2 (2015-2022)'],
            ],
            [
                'sku' => 'B1-0009', 'name' => 'Dongkrak Buaya', 'category' => 'Tools', 'stock' => 1,                'cost_price' => 325000, 'sell_price' => 390000,
                'vehicles' => ['UNIVERSAL|SEMUA MOBIL|-'],
            ],
            [
                'sku' => 'B1-0010', 'name' => 'Dongkrak Segitiga', 'category' => 'Tools', 'stock' => 2,                'cost_price' => 185000, 'sell_price' => 225000,
                'vehicles' => ['UNIVERSAL|SEMUA MOBIL|-'],
            ],
            [
                'sku' => 'A2-0028', 'name' => 'Kabel Accu 30 M', 'category' => 'Kelistrikan', 'stock' => 2,                'cost_price' => 26000, 'sell_price' => 45000,
                'vehicles' => ['UNIVERSAL|SEMUA MOBIL|-'],
            ],
            [
                'sku' => 'A2-0029', 'name' => 'Kabel Accu 50 M', 'category' => 'Kelistrikan', 'stock' => 2,                'cost_price' => 30000, 'sell_price' => 38000,
                'vehicles' => ['UNIVERSAL|SEMUA MOBIL|-'],
            ],
            [
                'sku' => 'A2-0030', 'name' => 'Kabel Accu 75 M', 'category' => 'Kelistrikan', 'stock' => 2,                'cost_price' => 42000, 'sell_price' => 50000,
                'vehicles' => ['UNIVERSAL|SEMUA MOBIL|-'],
            ],
            [
                'sku' => 'A2-0031', 'name' => 'Kabel Accu 100 M', 'category' => 'Kelistrikan', 'stock' => 2,                'cost_price' => 58000, 'sell_price' => 68000,
                'vehicles' => ['UNIVERSAL|SEMUA MOBIL|-'],
            ],
            [
                'sku' => 'A2-0032', 'name' => 'Kabel Accu 125 M', 'category' => 'Kelistrikan', 'stock' => 2,                'cost_price' => 68000, 'sell_price' => 85000,
                'vehicles' => ['UNIVERSAL|SEMUA MOBIL|-'],
            ],
            [
                'sku' => 'A2-0033', 'name' => 'Kabel Accu 150 M', 'category' => 'Kelistrikan', 'stock' => 2,                'cost_price' => 78000, 'sell_price' => 95000,
                'vehicles' => ['UNIVERSAL|SEMUA MOBIL|-'],
            ],
            [
                'sku' => 'A2-0034', 'name' => 'Kabel Accu 175 M', 'category' => 'Kelistrikan', 'stock' => 2,                'cost_price' => 88000, 'sell_price' => 110000,
                'vehicles' => ['UNIVERSAL|SEMUA MOBIL|-'],
            ],
            [
                'sku' => 'A2-0035', 'name' => 'Kabel Accu 200 M', 'category' => 'Kelistrikan', 'stock' => 2,                'cost_price' => 100000, 'sell_price' => 125000,
                'vehicles' => ['UNIVERSAL|SEMUA MOBIL|-'],
            ],
            [
                'sku' => 'A2-0036', 'name' => 'Kabel Massa 30', 'category' => 'Kelistrikan', 'stock' => 2,                'cost_price' => 34000, 'sell_price' => 45000,
                'vehicles' => ['UNIVERSAL|SEMUA MOBIL|-'],
            ],

            // ===== Sheet 2 - Tanggal 20 Juni 2026 =====
            [
                'sku' => 'B2-0005', 'name' => 'Wiper Kaca (Bosh) 16', 'category' => 'Body', 'stock' => 10,                'cost_price' => 39000, 'sell_price' => 70000,
                'vehicles' => ['UNIVERSAL|SEMUA MOBIL|-'],
            ],
            [
                'sku' => 'B2-0006', 'name' => 'Wiper Kaca (Bosh) 18', 'category' => 'Body', 'stock' => 10,                'cost_price' => 41000, 'sell_price' => 80000,
                'vehicles' => ['UNIVERSAL|SEMUA MOBIL|-'],
            ],
            [
                'sku' => 'B2-0007', 'name' => 'Wiper Kaca (Bosh) 20', 'category' => 'Body', 'stock' => 10,                'cost_price' => 44000, 'sell_price' => 90000,
                'vehicles' => ['UNIVERSAL|SEMUA MOBIL|-'],
            ],
            [
                'sku' => 'A2-0037', 'name' => 'Bohlam H4 Philip (100/90:12 Volt)', 'category' => 'Kelistrikan', 'stock' => 10,                'cost_price' => 32000, 'sell_price' => 52000,
                'vehicles' => ['UNIVERSAL|SEMUA MOBIL|-'],
            ],
            [
                'sku' => 'A2-0038', 'name' => 'Fitting BesT K1', 'category' => 'Kelistrikan', 'stock' => 25,                'cost_price' => 4200, 'sell_price' => 8000,
                'vehicles' => ['UNIVERSAL|SEMUA MOBIL|-'],
            ],
            [
                'sku' => 'A2-0039', 'name' => 'Fitting BesT K2', 'category' => 'Kelistrikan', 'stock' => 25,                'cost_price' => 4600, 'sell_price' => 10000,
                'vehicles' => ['UNIVERSAL|SEMUA MOBIL|-'],
            ],
            [
                'sku' => 'A2-0040', 'name' => 'Pak Bohlam 24V E/DB (32K)', 'category' => 'Kelistrikan', 'stock' => 4,                'cost_price' => 32000, 'sell_price' => 60000,
                'vehicles' => ['UNIVERSAL|SEMUA MOBIL|-'],
            ],
            [
                'sku' => 'A2-0041', 'name' => 'Pak Bohlam 24V E/DB (36K)', 'category' => 'Kelistrikan', 'stock' => 4,                'cost_price' => 36000, 'sell_price' => 65000,
                'vehicles' => ['UNIVERSAL|SEMUA MOBIL|-'],
            ],
            [
                'sku' => 'A2-0042', 'name' => 'LED Mata 3 (12volt-24volt)', 'category' => 'Kelistrikan', 'stock' => 80,                'cost_price' => 3000, 'sell_price' => 10000,
                'vehicles' => ['UNIVERSAL|SEMUA MOBIL|-'],
            ],
            [
                'sku' => 'A2-0043', 'name' => 'LED Mata 1 (12-24Volt)', 'category' => 'Kelistrikan', 'stock' => 180,                'cost_price' => 2500, 'sell_price' => 8000,
                'vehicles' => ['UNIVERSAL|SEMUA MOBIL|-'],
            ],
            [
                'sku' => 'A3-0007', 'name' => 'Brake Pad Alya/Agya Matic', 'category' => 'Rem', 'stock' => 2,                'cost_price' => 115000, 'sell_price' => 215000,
                'vehicles' => ['Daihatsu|Ayla|All Gen', 'Toyota|Agya|All Gen'],
            ],
            [
                'sku' => 'A3-0008', 'name' => 'Brake Pad Calya/Sigra', 'category' => 'Rem', 'stock' => 2,                'cost_price' => 112000, 'sell_price' => 210000,
                'vehicles' => ['Toyota|Calya|Gen 1 (2016-Now)', 'Daihatsu|Sigra|Gen 1 (2016-Now)'],
            ],
            [
                'sku' => 'A3-0009', 'name' => 'Brake Pad Ertiga', 'category' => 'Rem', 'stock' => 2,                'cost_price' => 112000, 'sell_price' => 210000,
                'vehicles' => ['UNIVERSAL|SEMUA MOBIL|-'],
            ],
            [
                'sku' => 'A3-0010', 'name' => 'Brake Pad Grand Max', 'category' => 'Rem', 'stock' => 2,                'cost_price' => 117000, 'sell_price' => 225000,
                'vehicles' => ['Daihatsu|Gran Max|All Gen'],
            ],
            [
                'sku' => 'A3-0011', 'name' => 'Brake Pad Livina', 'category' => 'Rem', 'stock' => 2,                'cost_price' => 123000, 'sell_price' => 250000,
                'vehicles' => ['UNIVERSAL|SEMUA MOBIL|-'],
            ],
            [
                'sku' => 'A3-0012', 'name' => 'Brake Pad Innova Reborn', 'category' => 'Rem', 'stock' => 2,                'cost_price' => 174000, 'sell_price' => 350000,
                'vehicles' => ['Toyota|Innova Reborn|Gen 2 (2015-2022)'],
            ],
            [
                'sku' => 'A3-0013', 'name' => 'Brake Pad Futura T120SS', 'category' => 'Rem', 'stock' => 5,                'cost_price' => 84000, 'sell_price' => 185000,
                'vehicles' => ['UNIVERSAL|SEMUA MOBIL|-'],
            ],
            [
                'sku' => 'A3-0014', 'name' => 'Brake Shoe Alya/Agya', 'category' => 'Rem', 'stock' => 2,                'cost_price' => 113000, 'sell_price' => 210000,
                'vehicles' => ['Daihatsu|Ayla|All Gen', 'Toyota|Agya|All Gen'],
            ],
            [
                'sku' => 'A3-0015', 'name' => 'Brake Shoe Calya/Sigra', 'category' => 'Rem', 'stock' => 2,                'cost_price' => 138000, 'sell_price' => 240000,
                'vehicles' => ['Toyota|Calya|Gen 1 (2016-Now)', 'Daihatsu|Sigra|Gen 1 (2016-Now)'],
            ],
            [
                'sku' => 'A3-0016', 'name' => 'Brake Shoe Ertiga', 'category' => 'Rem', 'stock' => 2,                'cost_price' => 150000, 'sell_price' => 180000,
                'vehicles' => ['UNIVERSAL|SEMUA MOBIL|-'],
            ],
            [
                'sku' => 'A3-0017', 'name' => 'Brake Shoe Livina', 'category' => 'Rem', 'stock' => 2,                'cost_price' => 168000, 'sell_price' => 270000,
                'vehicles' => ['UNIVERSAL|SEMUA MOBIL|-'],
            ],
            [
                'sku' => 'A3-0018', 'name' => 'Brake Shoe Innova', 'category' => 'Rem', 'stock' => 2,                'cost_price' => 233000, 'sell_price' => 360000,
                'vehicles' => ['Toyota|Innova|Gen 1 (2004-2015)', 'Toyota|Innova Reborn|Gen 2 (2015-2022)'],
            ],
            [
                'sku' => 'A3-0019', 'name' => 'Breke Shoe Kijang Diesel', 'category' => 'Rem', 'stock' => 2,                'cost_price' => 164000, 'sell_price' => 265000,
                'vehicles' => ['Toyota|Innova|Gen 1 (2004-2015)'],
            ],
            [
                'sku' => 'A3-0020', 'name' => 'Breke Shoe Mitsubishi Colt 120 Rear', 'category' => 'Rem', 'stock' => 2,                'cost_price' => 282000, 'sell_price' => 380000,
                'vehicles' => ['UNIVERSAL|SEMUA MOBIL|-'],
            ],
            [
                'sku' => 'B2-0008', 'name' => 'Karpet Sparco Fiber Tebal', 'category' => 'Body', 'stock' => 5,                'cost_price' => 40000, 'sell_price' => 60000,
                'vehicles' => ['UNIVERSAL|SEMUA MOBIL|-'],
            ],
            [
                'sku' => 'A1-0014', 'name' => 'Rack End Avanza', 'category' => 'Kaki-Kaki', 'stock' => 1,                'cost_price' => 90000, 'sell_price' => 180000,
                'vehicles' => ['Toyota|Avanza|Gen 1 (2003-2011)', 'Toyota|Avanza|Gen 2 (2011-2021)', 'Toyota|Avanza|Gen 3 (2021-Now)'],
            ],
            [
                'sku' => 'A1-0015', 'name' => 'Rack End Suzuki APV Power', 'category' => 'Kaki-Kaki', 'stock' => 2,                'cost_price' => 95000, 'sell_price' => 210000,
                'vehicles' => ['UNIVERSAL|SEMUA MOBIL|-'],
            ],

            // ===== Sheet 3 - Tanggal 23 Juni 2026 =====
            [
                'sku' => 'A1-0016', 'name' => 'Set Tierod Avanza SMT', 'category' => 'Kaki-Kaki', 'stock' => 2,                'cost_price' => 192000, 'sell_price' => 350000,
                'vehicles' => ['Toyota|Avanza|Gen 1 (2003-2011)', 'Toyota|Avanza|Gen 2 (2011-2021)'],
            ],
            [
                'sku' => 'A1-0017', 'name' => 'Set Tierod Innova', 'category' => 'Kaki-Kaki', 'stock' => 2,                'cost_price' => 178000, 'sell_price' => 300000,
                'vehicles' => ['Toyota|Innova|Gen 1 (2004-2015)', 'Toyota|Innova Reborn|Gen 2 (2015-2022)'],
            ],
            [
                'sku' => 'A1-0018', 'name' => 'Set Tierod Futura', 'category' => 'Kaki-Kaki', 'stock' => 2,                'cost_price' => 120000, 'sell_price' => 270000,
                'vehicles' => ['UNIVERSAL|SEMUA MOBIL|-'],
            ],
            [
                'sku' => 'A1-0019', 'name' => 'Balljoint Granmax Rush Low', 'category' => 'Kaki-Kaki', 'stock' => 2,                'cost_price' => 136000, 'sell_price' => 170000,
                'vehicles' => ['Daihatsu|Gran Max|All Gen'],
            ],
            [
                'sku' => 'A1-0020', 'name' => 'Balljoint Innova/Fortuner Up', 'category' => 'Kaki-Kaki', 'stock' => 2,                'cost_price' => 128000, 'sell_price' => 160000,
                'vehicles' => ['Toyota|Innova|Gen 1 (2004-2015)', 'Toyota|Innova Reborn|Gen 2 (2015-2022)'],
            ],
            [
                'sku' => 'A1-0021', 'name' => 'Set Tierod Agya', 'category' => 'Kaki-Kaki', 'stock' => 2,                'cost_price' => 264000, 'sell_price' => 364000,
                'vehicles' => ['Toyota|Agya|All Gen'],
            ],
            [
                'sku' => 'A1-0022', 'name' => 'Set Tierod Kijang 5K/7K', 'category' => 'Kaki-Kaki', 'stock' => 2,                'cost_price' => 255000, 'sell_price' => 355000,
                'vehicles' => ['Toyota|Innova|Gen 1 (2004-2015)'],
            ],
            [
                'sku' => 'A1-0023', 'name' => 'Balljoint L300 Up', 'category' => 'Kaki-Kaki', 'stock' => 4,                'cost_price' => 168000, 'sell_price' => 250000,
                'vehicles' => ['UNIVERSAL|SEMUA MOBIL|-'],
            ],
            [
                'sku' => 'A1-0024', 'name' => 'Balljoint Low Kijang 5K/7K', 'category' => 'Kaki-Kaki', 'stock' => 2,                'cost_price' => 216000, 'sell_price' => 280000,
                'vehicles' => ['Toyota|Innova|Gen 1 (2004-2015)'],
            ],
            [
                'sku' => 'A1-0025', 'name' => 'Set Tierod Panther', 'category' => 'Kaki-Kaki', 'stock' => 2,                'cost_price' => 160000, 'sell_price' => 260000,
                'vehicles' => ['UNIVERSAL|SEMUA MOBIL|-'],
            ],
            [
                'sku' => 'A1-0026', 'name' => 'Pic Balljoint Panther RH', 'category' => 'Kaki-Kaki', 'stock' => 2,                'cost_price' => 192000, 'sell_price' => 250000,
                'vehicles' => ['UNIVERSAL|SEMUA MOBIL|-'],
            ],
            [
                'sku' => 'A1-0027', 'name' => 'Pic Balljoint Panther LH', 'category' => 'Kaki-Kaki', 'stock' => 2,                'cost_price' => 192000, 'sell_price' => 250000,
                'vehicles' => ['UNIVERSAL|SEMUA MOBIL|-'],
            ],
            [
                'sku' => 'A1-0028', 'name' => 'Pic Lower Arm FTR', 'category' => 'Kaki-Kaki', 'stock' => 2,                'cost_price' => 180000, 'sell_price' => 290000,
                'vehicles' => ['UNIVERSAL|SEMUA MOBIL|-'],
            ],
            [
                'sku' => 'A1-0029', 'name' => 'Pic Lower Arm Carry', 'category' => 'Kaki-Kaki', 'stock' => 2,                'cost_price' => 150000, 'sell_price' => 225000,
                'vehicles' => ['UNIVERSAL|SEMUA MOBIL|-'],
            ],
            [
                'sku' => 'A1-0030', 'name' => 'Pic Balljoint Low Avanza', 'category' => 'Kaki-Kaki', 'stock' => 2,                'cost_price' => 119000, 'sell_price' => 225000,
                'vehicles' => ['Toyota|Avanza|Gen 1 (2003-2011)', 'Toyota|Avanza|Gen 2 (2011-2021)', 'Toyota|Avanza|Gen 3 (2021-Now)'],
            ],
            [
                'sku' => 'B4-0001', 'name' => 'Pic Filter Solar Innova Diesel', 'category' => 'Filter', 'stock' => 5,                'cost_price' => 51000, 'sell_price' => 70000,
                'vehicles' => ['Toyota|Innova|Gen 1 (2004-2015)'],
            ],
            [
                'sku' => 'B4-0002', 'name' => 'Pic Filter Solar L 300', 'category' => 'Filter', 'stock' => 3,                'cost_price' => 70000, 'sell_price' => 85000,
                'vehicles' => ['UNIVERSAL|SEMUA MOBIL|-'],
            ],
            [
                'sku' => 'B4-0003', 'name' => 'Filter Oli Panther 2,3', 'category' => 'Filter', 'stock' => 2,                'cost_price' => 45000, 'sell_price' => 60000,
                'vehicles' => ['UNIVERSAL|SEMUA MOBIL|-'],
            ],
            [
                'sku' => 'A1-0031', 'name' => 'Balljoint Calya/Sigra', 'category' => 'Kaki-Kaki', 'stock' => 2,                'cost_price' => 112000, 'sell_price' => 170000,
                'vehicles' => ['Toyota|Calya|Gen 1 (2016-Now)', 'Daihatsu|Sigra|Gen 1 (2016-Now)'],
            ],
            [
                'sku' => 'A1-0032', 'name' => 'Balljoint Panther Fuji Low LH', 'category' => 'Kaki-Kaki', 'stock' => 2,                'cost_price' => 178000, 'sell_price' => 250000,
                'vehicles' => ['UNIVERSAL|SEMUA MOBIL|-'],
            ],
            [
                'sku' => 'A1-0033', 'name' => 'Balljoint 5K Up Fuji', 'category' => 'Kaki-Kaki', 'stock' => 2,                'cost_price' => 148000, 'sell_price' => 190000,
                'vehicles' => ['Toyota|Innova|Gen 1 (2004-2015)'],
            ],
            [
                'sku' => 'A1-0034', 'name' => 'Uppershaft L300 Fuji', 'category' => 'Kaki-Kaki', 'stock' => 2,                'cost_price' => 160000, 'sell_price' => 225000,
                'vehicles' => ['UNIVERSAL|SEMUA MOBIL|-'],
            ],
            [
                'sku' => 'A1-0035', 'name' => 'Set Tierod End Calya/Sigra Fuji', 'category' => 'Kaki-Kaki', 'stock' => 2,                'cost_price' => 204000, 'sell_price' => 304000,
                'vehicles' => ['Toyota|Calya|Gen 1 (2016-Now)', 'Daihatsu|Sigra|Gen 1 (2016-Now)'],
            ],
            [
                'sku' => 'A1-0036', 'name' => 'Set Tierod Grandmax Fuji', 'category' => 'Kaki-Kaki', 'stock' => 2,                'cost_price' => 233000, 'sell_price' => 333000,
                'vehicles' => ['Daihatsu|Gran Max|All Gen'],
            ],
            [
                'sku' => 'A1-0037', 'name' => 'Set Tierod L300 Fuji', 'category' => 'Kaki-Kaki', 'stock' => 2,                'cost_price' => 165000, 'sell_price' => 265000,
                'vehicles' => ['UNIVERSAL|SEMUA MOBIL|-'],
            ],
            [
                'sku' => 'A1-0038', 'name' => 'Set Tierod Ertiga Fuji', 'category' => 'Kaki-Kaki', 'stock' => 1,                'cost_price' => 229000, 'sell_price' => 330000,
                'vehicles' => ['UNIVERSAL|SEMUA MOBIL|-'],
            ],
            [
                'sku' => 'B4-0004', 'name' => 'Filter Oli L300/Pajero', 'category' => 'Filter', 'stock' => 5,                'cost_price' => 62000, 'sell_price' => 75000,
                'vehicles' => ['UNIVERSAL|SEMUA MOBIL|-'],
            ],
            [
                'sku' => 'A1-0039', 'name' => 'Dudukan Mesin Avanza LH', 'category' => 'Kaki-Kaki', 'stock' => 2,                'cost_price' => 133000, 'sell_price' => 200000,
                'vehicles' => ['Toyota|Avanza|Gen 1 (2003-2011)', 'Toyota|Avanza|Gen 2 (2011-2021)', 'Toyota|Avanza|Gen 3 (2021-Now)'],
            ],
            [
                'sku' => 'A1-0040', 'name' => 'Dudukan Mesin Avanza RH', 'category' => 'Kaki-Kaki', 'stock' => 2,                'cost_price' => 133000, 'sell_price' => 200000,
                'vehicles' => ['Toyota|Avanza|Gen 1 (2003-2011)', 'Toyota|Avanza|Gen 2 (2011-2021)', 'Toyota|Avanza|Gen 3 (2021-Now)'],
            ],
            [
                'sku' => 'B4-0005', 'name' => 'Filter Solar Panther NKR66', 'category' => 'Filter', 'stock' => 4,                'cost_price' => 54000, 'sell_price' => 75000,
                'vehicles' => ['UNIVERSAL|SEMUA MOBIL|-'],
            ],
            [
                'sku' => 'A1-0041', 'name' => 'Balljoint Granmax Rush Low (2)', 'category' => 'Kaki-Kaki', 'stock' => 2,                'cost_price' => 136000, 'sell_price' => 190000,
                'vehicles' => ['Daihatsu|Gran Max|All Gen'],
            ],
            [
                'sku' => 'B4-0006', 'name' => 'Filter Oli PS', 'category' => 'Filter', 'stock' => 5,                'cost_price' => 74000, 'sell_price' => 90000,
                'vehicles' => ['UNIVERSAL|SEMUA MOBIL|-'],
            ],

            // ===== Sheet 4 - Tanggal 30 Juni 2026 =====
            [
                'sku' => 'A1-0042', 'name' => 'Stering Rack Futura', 'category' => 'Kaki-Kaki', 'stock' => 2,                'cost_price' => 365000, 'sell_price' => 450000,
                'vehicles' => ['UNIVERSAL|SEMUA MOBIL|-'],
            ],
            [
                'sku' => 'A1-0043', 'name' => 'Stabilizer Expander', 'category' => 'Kaki-Kaki', 'stock' => 2,                'cost_price' => 85000, 'sell_price' => 185000,
                'vehicles' => ['UNIVERSAL|SEMUA MOBIL|-'],
            ],
            [
                'sku' => 'A1-0044', 'name' => 'Rack End Agya/Alya', 'category' => 'Kaki-Kaki', 'stock' => 2,                'cost_price' => 95000, 'sell_price' => 160000,
                'vehicles' => ['Toyota|Agya|All Gen', 'Daihatsu|Ayla|All Gen'],
            ],
            [
                'sku' => 'B1-0011', 'name' => 'Baut Roda (Pendek)', 'category' => 'Tools', 'stock' => 25,                'cost_price' => 9000, 'sell_price' => 20000,
                'vehicles' => ['UNIVERSAL|SEMUA MOBIL|-'],
            ],
            [
                'sku' => 'B1-0012', 'name' => 'Baut Roda (Panjang)', 'category' => 'Tools', 'stock' => 25,                'cost_price' => 9000, 'sell_price' => 25000,
                'vehicles' => ['UNIVERSAL|SEMUA MOBIL|-'],
            ],
            [
                'sku' => 'A1-0045', 'name' => 'Rack End New Avanza', 'category' => 'Kaki-Kaki', 'stock' => 2,                'cost_price' => 95000, 'sell_price' => 195000,
                'vehicles' => ['Toyota|Avanza|Gen 3 (2021-Now)'],
            ],
            [
                'sku' => 'B4-0007', 'name' => 'Filter Oli Honda', 'category' => 'Filter', 'stock' => 5,                'cost_price' => 26000, 'sell_price' => 40000,
                'vehicles' => ['UNIVERSAL|SEMUA MOBIL|-'],
            ],
            [
                'sku' => 'A2-0044', 'name' => 'Sekering Mini (Sheet4)', 'category' => 'Kelistrikan', 'stock' => 100,                'cost_price' => 500, 'sell_price' => 1000,
                'vehicles' => ['UNIVERSAL|SEMUA MOBIL|-'],
            ],
            [
                'sku' => 'B2-0009', 'name' => 'Tutup Radiator Small', 'category' => 'Body', 'stock' => 10,                'cost_price' => 18000, 'sell_price' => 30000,
                'vehicles' => ['UNIVERSAL|SEMUA MOBIL|-'],
            ],
            [
                'sku' => 'A1-0046', 'name' => 'Rack End 5K/7K', 'category' => 'Kaki-Kaki', 'stock' => 2,                'cost_price' => 95000, 'sell_price' => 165000,
                'vehicles' => ['Toyota|Innova|Gen 1 (2004-2015)'],
            ],
            [
                'sku' => 'A1-0047', 'name' => 'Lower Arm APV/FTR', 'category' => 'Kaki-Kaki', 'stock' => 2,                'cost_price' => 145000, 'sell_price' => 225000,
                'vehicles' => ['UNIVERSAL|SEMUA MOBIL|-'],
            ],
            [
                'sku' => 'B2-0010', 'name' => 'Tutup Radiator Besar', 'category' => 'Body', 'stock' => 10,                'cost_price' => 21000, 'sell_price' => 45000,
                'vehicles' => ['UNIVERSAL|SEMUA MOBIL|-'],
            ],
            [
                'sku' => 'A2-0045', 'name' => 'Fiting Lampu Xi', 'category' => 'Kelistrikan', 'stock' => 25,                'cost_price' => 5600, 'sell_price' => 8000,
                'vehicles' => ['UNIVERSAL|SEMUA MOBIL|-'],
            ],
            [
                'sku' => 'A1-0048', 'name' => 'Stabilizer Ertiga', 'category' => 'Kaki-Kaki', 'stock' => 2,                'cost_price' => 85000, 'sell_price' => 180000,
                'vehicles' => ['UNIVERSAL|SEMUA MOBIL|-'],
            ],
            [
                'sku' => 'B3-0006', 'name' => 'Oil Silicon', 'category' => 'Mesin', 'stock' => 10,                'cost_price' => 13000, 'sell_price' => 15000,
                'vehicles' => ['UNIVERSAL|SEMUA MOBIL|-'],
            ],
            [
                'sku' => 'A2-0046', 'name' => 'Coil Avanza', 'category' => 'Kelistrikan', 'stock' => 2,                'cost_price' => 205000, 'sell_price' => 250000,
                'vehicles' => ['Toyota|Avanza|Gen 1 (2003-2011)', 'Toyota|Avanza|Gen 2 (2011-2021)', 'Toyota|Avanza|Gen 3 (2021-Now)'],
            ],
            [
                'sku' => 'A1-0049', 'name' => 'Stabilizer Agya', 'category' => 'Kaki-Kaki', 'stock' => 2,                'cost_price' => 90000, 'sell_price' => 160000,
                'vehicles' => ['Toyota|Agya|All Gen'],
            ],
            [
                'sku' => 'B3-0007', 'name' => 'Pompa Solar PS', 'category' => 'Mesin', 'stock' => 5,                'cost_price' => 45000, 'sell_price' => 80000,
                'vehicles' => ['UNIVERSAL|SEMUA MOBIL|-'],
            ],
            [
                'sku' => 'A2-0047', 'name' => 'Relay Kaki 4 Avanza/Innova', 'category' => 'Kelistrikan', 'stock' => 5,                'cost_price' => 33000, 'sell_price' => 45000,
                'vehicles' => ['Toyota|Avanza|Gen 1 (2003-2011)', 'Toyota|Avanza|Gen 2 (2011-2021)', 'Toyota|Innova|Gen 1 (2004-2015)'],
            ],
            [
                'sku' => 'B3-0008', 'name' => 'Tutup Oli L300/PS/T120/PS25', 'category' => 'Mesin', 'stock' => 10,                'cost_price' => 16000, 'sell_price' => 35000,
                'vehicles' => ['UNIVERSAL|SEMUA MOBIL|-'],
            ],
            [
                'sku' => 'B4-0008', 'name' => 'Filter Oli Innova', 'category' => 'Filter', 'stock' => 2,                'cost_price' => 32000, 'sell_price' => 60000,
                'vehicles' => ['Toyota|Innova|Gen 1 (2004-2015)', 'Toyota|Innova Reborn|Gen 2 (2015-2022)'],
            ],
            [
                'sku' => 'A2-0048', 'name' => 'Condensor KF Carry', 'category' => 'Kelistrikan', 'stock' => 10,                'cost_price' => 17000, 'sell_price' => 25000,
                'vehicles' => ['UNIVERSAL|SEMUA MOBIL|-'],
            ],
            [
                'sku' => 'A3-0021', 'name' => 'Brake Pad New Carry', 'category' => 'Rem', 'stock' => 5,                'cost_price' => 115000, 'sell_price' => 195000,
                'vehicles' => ['UNIVERSAL|SEMUA MOBIL|-'],
            ],
            [
                'sku' => 'B2-0011', 'name' => 'Tutup Tanki + Kunci L300/PS', 'category' => 'Body', 'stock' => 4,                'cost_price' => 32000, 'sell_price' => 45000,
                'vehicles' => ['UNIVERSAL|SEMUA MOBIL|-'],
            ],
            [
                'sku' => 'B2-0012', 'name' => 'Set Will Woll PS', 'category' => 'Body', 'stock' => 1,                'cost_price' => 75000, 'sell_price' => 150000,
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

            $vehicleIds = collect($vehicleKeys)
                ->map(fn ($key) => $vehicles[$key]?->id)
                ->filter()
                ->values()
                ->toArray();

            if (! empty($vehicleIds)) {
                $product->vehicles()->sync($vehicleIds);
            }
        }
    }
}
