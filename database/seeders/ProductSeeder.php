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
                'sku' => 'GM-0001', 'name' => 'Stabilizer Innova', 'category' => 'Stabilizer', 'stock' => 2,
                'cost_price' => 75000, 'sell_price' => 85000,
                'vehicles' => [
                    'Toyota|Innova|Gen 1 (2004-2015)',
                    'Toyota|Innova Reborn|Gen 2 (2015-2022)',
                ],
            ],
            [
                'sku' => 'GM-0002', 'name' => 'Stabilizer Avanza', 'category' => 'Stabilizer', 'stock' => 2,
                'cost_price' => 60000, 'sell_price' => 70000,
                'vehicles' => [
                    'Toyota|Avanza|Gen 1 (2003-2011)',
                    'Toyota|Avanza|Gen 2 (2011-2021)',
                    'Toyota|Avanza|Gen 3 (2021-Now)',
                ],
            ],
            [
                'sku' => 'GM-0003', 'name' => 'Stabilizer APV', 'category' => 'Stabilizer', 'stock' => 2,
                'cost_price' => 60000, 'sell_price' => 70000,
                'vehicles' => ['UNIVERSAL|SEMUA MOBIL|-'],
            ],
            [
                'sku' => 'GM-0004', 'name' => 'Stabilizer Granmax', 'category' => 'Stabilizer', 'stock' => 2,
                'cost_price' => 60000, 'sell_price' => 70000,
                'vehicles' => ['Daihatsu|Gran Max|All Gen'],
            ],
            [
                'sku' => 'GM-0005', 'name' => 'Stabilizer Calya/Sigra', 'category' => 'Stabilizer', 'stock' => 2,
                'cost_price' => 85000, 'sell_price' => 95000,
                'vehicles' => [
                    'Toyota|Calya|Gen 1 (2016-Now)',
                    'Daihatsu|Sigra|Gen 1 (2016-Now)',
                ],
            ],
            [
                'sku' => 'GM-0006', 'name' => 'Rack end Sigra', 'category' => 'Rack end', 'stock' => 2,
                'cost_price' => 95000, 'sell_price' => 110000,
                'vehicles' => ['Daihatsu|Sigra|Gen 1 (2016-Now)'],
            ],
            [
                'sku' => 'GM-0007', 'name' => 'Rack end Avanza', 'category' => 'Rack end', 'stock' => 1,
                'cost_price' => 90000, 'sell_price' => 105000,
                'vehicles' => [
                    'Toyota|Avanza|Gen 1 (2003-2011)',
                    'Toyota|Avanza|Gen 2 (2011-2021)',
                    'Toyota|Avanza|Gen 3 (2021-Now)',
                ],
            ],
            [
                'sku' => 'GM-0008', 'name' => 'Rack end Jazz', 'category' => 'Rack end', 'stock' => 2,
                'cost_price' => 95000, 'sell_price' => 110000,
                'vehicles' => [
                    'Honda|Jazz|GD3 (2001-2007)',
                    'Honda|Jazz|GE8 (2007-2014)',
                    'Honda|Jazz|GK5 (2014-2021)',
                ],
            ],
            [
                'sku' => 'GM-0009', 'name' => 'Drag link Futura', 'category' => 'Drag link', 'stock' => 2,
                'cost_price' => 80000, 'sell_price' => 95000,
                'vehicles' => ['UNIVERSAL|SEMUA MOBIL|-'],
            ],
            [
                'sku' => 'GM-0010', 'name' => 'Kabel 0,8/20m', 'category' => 'Kabel', 'stock' => 5,
                'cost_price' => 30000, 'sell_price' => 35000,
                'vehicles' => ['UNIVERSAL|SEMUA MOBIL|-'],
            ],
            [
                'sku' => 'GM-0011', 'name' => 'Swet Rem PS/L300', 'category' => 'Rem', 'stock' => 5,
                'cost_price' => 19000, 'sell_price' => 25000,
                'vehicles' => ['UNIVERSAL|SEMUA MOBIL|-'],
            ],
            [
                'sku' => 'GM-0012', 'name' => 'Soket sein T10', 'category' => 'Soket', 'stock' => 25,
                'cost_price' => 3600, 'sell_price' => 5000,
                'vehicles' => ['UNIVERSAL|SEMUA MOBIL|-', 'UNIVERSAL|SEMUA MOTOR|-'],
            ],
            [
                'sku' => 'GM-0013', 'name' => 'Platina Kijang', 'category' => 'Komponen Mesin', 'stock' => 10,
                'cost_price' => 19000, 'sell_price' => 25000,
                'vehicles' => ['Toyota|Innova|Gen 1 (2004-2015)'],
            ],
            [
                'sku' => 'GM-0014', 'name' => 'Tabung Busi+seal', 'category' => 'Kelistrikan', 'stock' => 12,
                'cost_price' => 11000, 'sell_price' => 15000,
                'vehicles' => ['UNIVERSAL|SEMUA MOBIL|-'],
            ],
            [
                'sku' => 'GM-0015', 'name' => 'LED mata 3 (12 volt)', 'category' => 'Kelistrikan', 'stock' => 40,
                'cost_price' => 3000, 'sell_price' => 5000,
                'vehicles' => ['UNIVERSAL|SEMUA MOBIL|-', 'UNIVERSAL|SEMUA MOTOR|-'],
            ],
            [
                'sku' => 'GM-0016', 'name' => 'CO Kijang Assy', 'category' => 'Komponen Mesin', 'stock' => 1,
                'cost_price' => 115000, 'sell_price' => 135000,
                'vehicles' => ['Toyota|Innova|Gen 1 (2004-2015)'],
            ],
            [
                'sku' => 'GM-0017', 'name' => 'CM Kijang Assy', 'category' => 'Komponen Mesin', 'stock' => 1,
                'cost_price' => 165000, 'sell_price' => 190000,
                'vehicles' => ['Toyota|Innova|Gen 1 (2004-2015)'],
            ],
            [
                'sku' => 'GM-0018', 'name' => 'FO Avanza', 'category' => 'Komponen Mesin', 'stock' => 2,
                'cost_price' => 28000, 'sell_price' => 35000,
                'vehicles' => [
                    'Toyota|Avanza|Gen 1 (2003-2011)',
                    'Toyota|Avanza|Gen 2 (2011-2021)',
                    'Toyota|Avanza|Gen 3 (2021-Now)',
                ],
            ],
            [
                'sku' => 'GM-0019', 'name' => 'FO Kijang', 'category' => 'Komponen Mesin', 'stock' => 5,
                'cost_price' => 26000, 'sell_price' => 32000,
                'vehicles' => ['Toyota|Innova|Gen 1 (2004-2015)'],
            ],
            [
                'sku' => 'GM-0020', 'name' => 'Kabel Busi', 'category' => 'Kabel', 'stock' => 6,
                'cost_price' => 60000, 'sell_price' => 75000,
                'vehicles' => ['UNIVERSAL|SEMUA MOBIL|-'],
            ],
            [
                'sku' => 'GM-0021', 'name' => 'Break pad Panther', 'category' => 'Break pad', 'stock' => 2,
                'cost_price' => 120000, 'sell_price' => 140000,
                'vehicles' => ['UNIVERSAL|SEMUA MOBIL|-'],
            ],
            [
                'sku' => 'GM-0022', 'name' => 'Break pad Granmax', 'category' => 'Break pad', 'stock' => 2,
                'cost_price' => 120000, 'sell_price' => 140000,
                'vehicles' => ['Daihatsu|Gran Max|All Gen'],
            ],
            [
                'sku' => 'GM-0023', 'name' => 'Break pad L300', 'category' => 'Break pad', 'stock' => 2,
                'cost_price' => 135000, 'sell_price' => 155000,
                'vehicles' => ['UNIVERSAL|SEMUA MOBIL|-'],
            ],
            [
                'sku' => 'GM-0024', 'name' => 'Break pad Avanza', 'category' => 'Break pad', 'stock' => 2,
                'cost_price' => 100000, 'sell_price' => 120000,
                'vehicles' => [
                    'Toyota|Avanza|Gen 1 (2003-2011)',
                    'Toyota|Avanza|Gen 2 (2011-2021)',
                    'Toyota|Avanza|Gen 3 (2021-Now)',
                ],
            ],
            [
                'sku' => 'GM-0025', 'name' => 'Klip Avanza', 'category' => 'Klip', 'stock' => 100,
                'cost_price' => 900, 'sell_price' => 1500,
                'vehicles' => [
                    'Toyota|Avanza|Gen 1 (2003-2011)',
                    'Toyota|Avanza|Gen 2 (2011-2021)',
                    'Toyota|Avanza|Gen 3 (2021-Now)',
                ],
            ],
            [
                'sku' => 'GM-0026', 'name' => 'Klip Jazz', 'category' => 'Klip', 'stock' => 100,
                'cost_price' => 1200, 'sell_price' => 2000,
                'vehicles' => [
                    'Honda|Jazz|GD3 (2001-2007)',
                    'Honda|Jazz|GE8 (2007-2014)',
                    'Honda|Jazz|GK5 (2014-2021)',
                ],
            ],
            [
                'sku' => 'GM-0027', 'name' => 'Klip Innova', 'category' => 'Klip', 'stock' => 100,
                'cost_price' => 1200, 'sell_price' => 2000,
                'vehicles' => [
                    'Toyota|Innova|Gen 1 (2004-2015)',
                    'Toyota|Innova Reborn|Gen 2 (2015-2022)',
                ],
            ],
            [
                'sku' => 'GM-0028', 'name' => 'Klip merah+hijau', 'category' => 'Klip', 'stock' => 200,
                'cost_price' => 700, 'sell_price' => 1000,
                'vehicles' => ['UNIVERSAL|SEMUA MOBIL|-'],
            ],
            [
                'sku' => 'GM-0029', 'name' => 'Break pad Innova', 'category' => 'Break pad', 'stock' => 2,
                'cost_price' => 120000, 'sell_price' => 140000,
                'vehicles' => [
                    'Toyota|Innova|Gen 1 (2004-2015)',
                    'Toyota|Innova Reborn|Gen 2 (2015-2022)',
                ],
            ],
            [
                'sku' => 'GM-0030', 'name' => 'Sekering Tancap', 'category' => 'Sekering', 'stock' => 600,
                'cost_price' => 500, 'sell_price' => 1000,
                'vehicles' => ['UNIVERSAL|SEMUA MOBIL|-'],
            ],
            [
                'sku' => 'GM-0031', 'name' => 'Sekering Micro', 'category' => 'Sekering', 'stock' => 500,
                'cost_price' => 600, 'sell_price' => 1000,
                'vehicles' => ['UNIVERSAL|SEMUA MOBIL|-'],
            ],
            [
                'sku' => 'GM-0032', 'name' => 'Sekering Tabung 10A', 'category' => 'Sekering', 'stock' => 100,
                'cost_price' => 700, 'sell_price' => 1000,
                'vehicles' => ['UNIVERSAL|SEMUA MOBIL|-'],
            ],
            [
                'sku' => 'GM-0033', 'name' => 'Karet Gentong shock', 'category' => 'Karet', 'stock' => 20,
                'cost_price' => 2600, 'sell_price' => 3500,
                'vehicles' => ['UNIVERSAL|SEMUA MOBIL|-'],
            ],
            [
                'sku' => 'GM-0034', 'name' => 'Karet mata shock', 'category' => 'Karet', 'stock' => 50,
                'cost_price' => 2600, 'sell_price' => 3500,
                'vehicles' => ['UNIVERSAL|SEMUA MOBIL|-'],
            ],
            [
                'sku' => 'GM-0035', 'name' => 'Sekering mini', 'category' => 'Sekering', 'stock' => 400,
                'cost_price' => 500, 'sell_price' => 1000,
                'vehicles' => ['UNIVERSAL|SEMUA MOBIL|-'],
            ],
            [
                'sku' => 'GM-0036', 'name' => 'Fitting lampu Plastik', 'category' => 'Kelistrikan', 'stock' => 25,
                'cost_price' => 5400, 'sell_price' => 7000,
                'vehicles' => ['UNIVERSAL|SEMUA MOBIL|-'],
            ],
            [
                'sku' => 'GM-0037', 'name' => 'Soket Relay K4', 'category' => 'Soket', 'stock' => 10,
                'cost_price' => 8000, 'sell_price' => 10000,
                'vehicles' => ['UNIVERSAL|SEMUA MOBIL|-'],
            ],
            [
                'sku' => 'GM-0038', 'name' => 'Soket Tancap', 'category' => 'Soket', 'stock' => 10,
                'cost_price' => 7000, 'sell_price' => 9000,
                'vehicles' => ['UNIVERSAL|SEMUA MOBIL|-'],
            ],
            [
                'sku' => 'GM-0039', 'name' => 'Rotak Futura', 'category' => 'Rotak', 'stock' => 2,
                'cost_price' => 265000, 'sell_price' => 295000,
                'vehicles' => ['UNIVERSAL|SEMUA MOBIL|-'],
            ],
            [
                'sku' => 'GM-0040', 'name' => 'Rotak Zebra', 'category' => 'Rotak', 'stock' => 2,
                'cost_price' => 145000, 'sell_price' => 165000,
                'vehicles' => ['UNIVERSAL|SEMUA MOBIL|-'],
            ],
            [
                'sku' => 'GM-0041', 'name' => 'Klem Aki Besar', 'category' => 'Aki', 'stock' => 5,
                'cost_price' => 19000, 'sell_price' => 25000,
                'vehicles' => ['UNIVERSAL|SEMUA MOBIL|-'],
            ],
            [
                'sku' => 'GM-0042', 'name' => 'Klem Aki Kecil', 'category' => 'Aki', 'stock' => 5,
                'cost_price' => 15000, 'sell_price' => 20000,
                'vehicles' => ['UNIVERSAL|SEMUA MOBIL|-'],
            ],

            // ===== Sheet 1 - Tanggal 17 Juni 2026 =====
            [
                'sku' => 'GM-0043', 'name' => 'Kabel Busi S89', 'category' => 'Kabel', 'stock' => 2,
                'cost_price' => 85000, 'sell_price' => 105000,
                'vehicles' => ['UNIVERSAL|SEMUA MOBIL|-'],
            ],
            [
                'sku' => 'GM-0044', 'name' => 'Kabel Busi L 300', 'category' => 'Kabel', 'stock' => 2,
                'cost_price' => 60000, 'sell_price' => 115000,
                'vehicles' => ['UNIVERSAL|SEMUA MOBIL|-'],
            ],
            [
                'sku' => 'GM-0045', 'name' => 'Kabel Busi Innova', 'category' => 'Kabel', 'stock' => 2,
                'cost_price' => 60000, 'sell_price' => 115000,
                'vehicles' => ['Toyota|Innova|Gen 1 (2004-2015)', 'Toyota|Innova Reborn|Gen 2 (2015-2022)'],
            ],
            [
                'sku' => 'GM-0046', 'name' => 'Kabel Busi Suzuki (APV)', 'category' => 'Kabel', 'stock' => 2,
                'cost_price' => 60000, 'sell_price' => 115000,
                'vehicles' => ['UNIVERSAL|SEMUA MOBIL|-'],
            ],
            [
                'sku' => 'GM-0047', 'name' => 'Kabel Busi T120 SS', 'category' => 'Kabel', 'stock' => 2,
                'cost_price' => 60000, 'sell_price' => 115000,
                'vehicles' => ['UNIVERSAL|SEMUA MOBIL|-'],
            ],
            [
                'sku' => 'GM-0048', 'name' => 'Set (4) Spion Avanza', 'category' => 'Spion', 'stock' => 2,
                'cost_price' => 55000, 'sell_price' => 65000,
                'vehicles' => ['Toyota|Avanza|Gen 1 (2003-2011)', 'Toyota|Avanza|Gen 2 (2011-2021)'],
            ],
            [
                'sku' => 'GM-0049', 'name' => 'Set (8) Handle Luar Avanza Lama', 'category' => 'Handle', 'stock' => 2,
                'cost_price' => 40000, 'sell_price' => 50000,
                'vehicles' => ['Toyota|Avanza|Gen 1 (2003-2011)'],
            ],
            [
                'sku' => 'GM-0050', 'name' => 'Roll Kabel 2m (30 M)', 'category' => 'Kabel', 'stock' => 1,
                'cost_price' => 7000, 'sell_price' => 9000,
                'vehicles' => ['UNIVERSAL|SEMUA MOBIL|-'],
            ],
            [
                'sku' => 'GM-0051', 'name' => 'Kabel Accu Paralel', 'category' => 'Kabel', 'stock' => 2,
                'cost_price' => 38000, 'sell_price' => 48000,
                'vehicles' => ['UNIVERSAL|SEMUA MOBIL|-'],
            ],
            [
                'sku' => 'GM-0052', 'name' => 'Kanebo', 'category' => 'Aksesoris', 'stock' => 8,
                'cost_price' => 12000, 'sell_price' => 15000,
                'vehicles' => ['UNIVERSAL|SEMUA MOBIL|-'],
            ],
            [
                'sku' => 'GM-0053', 'name' => 'Karpet/kepet Merk Sparco K', 'category' => 'Karpet', 'stock' => 5,
                'cost_price' => 28000, 'sell_price' => 48000,
                'vehicles' => ['UNIVERSAL|SEMUA MOBIL|-'],
            ],
            [
                'sku' => 'GM-0054', 'name' => 'Soket Seal Beam', 'category' => 'Soket', 'stock' => 10,
                'cost_price' => 8000, 'sell_price' => 10000,
                'vehicles' => ['UNIVERSAL|SEMUA MOBIL|-'],
            ],
            [
                'sku' => 'GM-0055', 'name' => 'Soket Relay Kuning', 'category' => 'Soket', 'stock' => 10,
                'cost_price' => 8000, 'sell_price' => 12000,
                'vehicles' => ['UNIVERSAL|SEMUA MOBIL|-'],
            ],
            [
                'sku' => 'GM-0056', 'name' => 'Klakson TIAT Denso', 'category' => 'Klakson', 'stock' => 2,
                'cost_price' => 105000, 'sell_price' => 115000,
                'vehicles' => ['UNIVERSAL|SEMUA MOBIL|-'],
            ],
            [
                'sku' => 'GM-0057', 'name' => 'Klakson Keong Denso', 'category' => 'Klakson', 'stock' => 2,
                'cost_price' => 140000, 'sell_price' => 165000,
                'vehicles' => ['UNIVERSAL|SEMUA MOBIL|-'],
            ],
            [
                'sku' => 'GM-0058', 'name' => 'Karet Rem 30253 R (PS)', 'category' => 'Karet', 'stock' => 30,
                'cost_price' => 2500, 'sell_price' => 5000,
                'vehicles' => ['UNIVERSAL|SEMUA MOBIL|-'],
            ],
            [
                'sku' => 'GM-0059', 'name' => 'Karet Rem 40493R (Dutro)', 'category' => 'Karet', 'stock' => 30,
                'cost_price' => 2500, 'sell_price' => 5000,
                'vehicles' => ['UNIVERSAL|SEMUA MOBIL|-'],
            ],
            [
                'sku' => 'GM-0060', 'name' => 'Rack End Livina', 'category' => 'Rack End', 'stock' => 2,
                'cost_price' => 90000, 'sell_price' => 115000,
                'vehicles' => ['UNIVERSAL|SEMUA MOBIL|-'],
            ],
            [
                'sku' => 'GM-0061', 'name' => 'Rack End Kijang 5K', 'category' => 'Rack End', 'stock' => 2,
                'cost_price' => 90000, 'sell_price' => 115000,
                'vehicles' => ['Toyota|Innova|Gen 1 (2004-2015)'],
            ],
            [
                'sku' => 'GM-0062', 'name' => 'Rack End Panther', 'category' => 'Rack End', 'stock' => 2,
                'cost_price' => 95000, 'sell_price' => 120000,
                'vehicles' => ['UNIVERSAL|SEMUA MOBIL|-'],
            ],
            [
                'sku' => 'GM-0063', 'name' => 'Rack End Innova', 'category' => 'Rack End', 'stock' => 2,
                'cost_price' => 95000, 'sell_price' => 130000,
                'vehicles' => ['Toyota|Innova|Gen 1 (2004-2015)', 'Toyota|Innova Reborn|Gen 2 (2015-2022)'],
            ],
            [
                'sku' => 'GM-0064', 'name' => 'Dongkrak Buaya', 'category' => 'Tools', 'stock' => 1,
                'cost_price' => 325000, 'sell_price' => 350000,
                'vehicles' => ['UNIVERSAL|SEMUA MOBIL|-'],
            ],
            [
                'sku' => 'GM-0065', 'name' => 'Dongkrak Segitiga', 'category' => 'Tools', 'stock' => 2,
                'cost_price' => 185000, 'sell_price' => 225000,
                'vehicles' => ['UNIVERSAL|SEMUA MOBIL|-'],
            ],
            [
                'sku' => 'GM-0066', 'name' => 'Kabel Accu 30 M', 'category' => 'Kabel', 'stock' => 2,
                'cost_price' => 26000, 'sell_price' => 45000,
                'vehicles' => ['UNIVERSAL|SEMUA MOBIL|-'],
            ],
            [
                'sku' => 'GM-0067', 'name' => 'Kabel Accu 50 M', 'category' => 'Kabel', 'stock' => 2,
                'cost_price' => 30000, 'sell_price' => 38000,
                'vehicles' => ['UNIVERSAL|SEMUA MOBIL|-'],
            ],
            [
                'sku' => 'GM-0068', 'name' => 'Kabel Accu 75 M', 'category' => 'Kabel', 'stock' => 2,
                'cost_price' => 42000, 'sell_price' => 50000,
                'vehicles' => ['UNIVERSAL|SEMUA MOBIL|-'],
            ],
            [
                'sku' => 'GM-0069', 'name' => 'Kabel Accu 100 M', 'category' => 'Kabel', 'stock' => 2,
                'cost_price' => 58000, 'sell_price' => 68000,
                'vehicles' => ['UNIVERSAL|SEMUA MOBIL|-'],
            ],
            [
                'sku' => 'GM-0070', 'name' => 'Kabel Accu 125 M', 'category' => 'Kabel', 'stock' => 2,
                'cost_price' => 68000, 'sell_price' => 78000,
                'vehicles' => ['UNIVERSAL|SEMUA MOBIL|-'],
            ],
            [
                'sku' => 'GM-0071', 'name' => 'Kabel Accu 150 M', 'category' => 'Kabel', 'stock' => 2,
                'cost_price' => 78000, 'sell_price' => 88000,
                'vehicles' => ['UNIVERSAL|SEMUA MOBIL|-'],
            ],
            [
                'sku' => 'GM-0072', 'name' => 'Kabel Accu 175 M', 'category' => 'Kabel', 'stock' => 2,
                'cost_price' => 88000, 'sell_price' => 98000,
                'vehicles' => ['UNIVERSAL|SEMUA MOBIL|-'],
            ],
            [
                'sku' => 'GM-0073', 'name' => 'Kabel Accu 200 M', 'category' => 'Kabel', 'stock' => 2,
                'cost_price' => 100000, 'sell_price' => 110000,
                'vehicles' => ['UNIVERSAL|SEMUA MOBIL|-'],
            ],
            [
                'sku' => 'GM-0074', 'name' => 'Kabel Massa 30', 'category' => 'Kabel', 'stock' => 2,
                'cost_price' => 34000, 'sell_price' => 45000,
                'vehicles' => ['UNIVERSAL|SEMUA MOBIL|-'],
            ],

            // ===== Sheet 2 - Tanggal 20 Juni 2026 =====
            [
                'sku' => 'GM-0075', 'name' => 'Wiper Kaca (Bosh) 16', 'category' => 'Wiper', 'stock' => 10,
                'cost_price' => 39000, 'sell_price' => 70000,
                'vehicles' => ['UNIVERSAL|SEMUA MOBIL|-'],
            ],
            [
                'sku' => 'GM-0076', 'name' => 'Wiper Kaca (Bosh) 18', 'category' => 'Wiper', 'stock' => 10,
                'cost_price' => 41000, 'sell_price' => 80000,
                'vehicles' => ['UNIVERSAL|SEMUA MOBIL|-'],
            ],
            [
                'sku' => 'GM-0077', 'name' => 'Wiper Kaca (Bosh) 20', 'category' => 'Wiper', 'stock' => 10,
                'cost_price' => 44000, 'sell_price' => 90000,
                'vehicles' => ['UNIVERSAL|SEMUA MOBIL|-'],
            ],
            [
                'sku' => 'GM-0078', 'name' => 'Bohlam H4 Philip (100/90:12 Volt)', 'category' => 'Bohlam', 'stock' => 10,
                'cost_price' => 32000, 'sell_price' => 52000,
                'vehicles' => ['UNIVERSAL|SEMUA MOBIL|-'],
            ],
            [
                'sku' => 'GM-0079', 'name' => 'Fitting BesT K1', 'category' => 'Kelistrikan', 'stock' => 25,
                'cost_price' => 4200, 'sell_price' => 8000,
                'vehicles' => ['UNIVERSAL|SEMUA MOBIL|-'],
            ],
            [
                'sku' => 'GM-0080', 'name' => 'Fitting BesT K2', 'category' => 'Kelistrikan', 'stock' => 25,
                'cost_price' => 4600, 'sell_price' => 10000,
                'vehicles' => ['UNIVERSAL|SEMUA MOBIL|-'],
            ],
            [
                'sku' => 'GM-0081', 'name' => 'Pak Bohlam 24V E/DB (32K)', 'category' => 'Bohlam', 'stock' => 4,
                'cost_price' => 32000, 'sell_price' => 60000,
                'vehicles' => ['UNIVERSAL|SEMUA MOBIL|-'],
            ],
            [
                'sku' => 'GM-0082', 'name' => 'Pak Bohlam 24V E/DB (36K)', 'category' => 'Bohlam', 'stock' => 4,
                'cost_price' => 36000, 'sell_price' => 65000,
                'vehicles' => ['UNIVERSAL|SEMUA MOBIL|-'],
            ],
            [
                'sku' => 'GM-0083', 'name' => 'LED Mata 3 (12volt-24volt)', 'category' => 'Kelistrikan', 'stock' => 80,
                'cost_price' => 3000, 'sell_price' => 10000,
                'vehicles' => ['UNIVERSAL|SEMUA MOBIL|-'],
            ],
            [
                'sku' => 'GM-0084', 'name' => 'LED Mata 1 (12-24Volt)', 'category' => 'Kelistrikan', 'stock' => 180,
                'cost_price' => 2500, 'sell_price' => 8000,
                'vehicles' => ['UNIVERSAL|SEMUA MOBIL|-'],
            ],
            [
                'sku' => 'GM-0085', 'name' => 'Brake Pad Alya/Agya Matic', 'category' => 'Brake Pad', 'stock' => 2,
                'cost_price' => 115000, 'sell_price' => 215000,
                'vehicles' => ['Daihatsu|Ayla|All Gen', 'Toyota|Agya|All Gen'],
            ],
            [
                'sku' => 'GM-0086', 'name' => 'Brake Pad Calya/Sigra', 'category' => 'Brake Pad', 'stock' => 2,
                'cost_price' => 112000, 'sell_price' => 210000,
                'vehicles' => ['Toyota|Calya|Gen 1 (2016-Now)', 'Daihatsu|Sigra|Gen 1 (2016-Now)'],
            ],
            [
                'sku' => 'GM-0087', 'name' => 'Brake Pad Ertiga', 'category' => 'Brake Pad', 'stock' => 2,
                'cost_price' => 112000, 'sell_price' => 210000,
                'vehicles' => ['UNIVERSAL|SEMUA MOBIL|-'],
            ],
            [
                'sku' => 'GM-0088', 'name' => 'Brake Pad Grand Max', 'category' => 'Brake Pad', 'stock' => 2,
                'cost_price' => 117000, 'sell_price' => 225000,
                'vehicles' => ['Daihatsu|Gran Max|All Gen'],
            ],
            [
                'sku' => 'GM-0089', 'name' => 'Brake Pad Livina', 'category' => 'Brake Pad', 'stock' => 2,
                'cost_price' => 123000, 'sell_price' => 250000,
                'vehicles' => ['UNIVERSAL|SEMUA MOBIL|-'],
            ],
            [
                'sku' => 'GM-0090', 'name' => 'Brake Pad Innova Reborn', 'category' => 'Brake Pad', 'stock' => 2,
                'cost_price' => 174000, 'sell_price' => 350000,
                'vehicles' => ['Toyota|Innova Reborn|Gen 2 (2015-2022)'],
            ],
            [
                'sku' => 'GM-0091', 'name' => 'Brake Pad Futura T120SS', 'category' => 'Brake Pad', 'stock' => 5,
                'cost_price' => 84000, 'sell_price' => 185000,
                'vehicles' => ['UNIVERSAL|SEMUA MOBIL|-'],
            ],
            [
                'sku' => 'GM-0092', 'name' => 'Brake Shoe Alya/Agya', 'category' => 'Brake Shoe', 'stock' => 2,
                'cost_price' => 113000, 'sell_price' => 210000,
                'vehicles' => ['Daihatsu|Ayla|All Gen', 'Toyota|Agya|All Gen'],
            ],
            [
                'sku' => 'GM-0093', 'name' => 'Brake Shoe Calya/Sigra', 'category' => 'Brake Shoe', 'stock' => 2,
                'cost_price' => 138000, 'sell_price' => 240000,
                'vehicles' => ['Toyota|Calya|Gen 1 (2016-Now)', 'Daihatsu|Sigra|Gen 1 (2016-Now)'],
            ],
            [
                'sku' => 'GM-0094', 'name' => 'Brake Shoe Ertiga', 'category' => 'Brake Shoe', 'stock' => 2,
                'cost_price' => 150000, 'sell_price' => 150000,
                'vehicles' => ['UNIVERSAL|SEMUA MOBIL|-'],
            ],
            [
                'sku' => 'GM-0095', 'name' => 'Brake Shoe Livina', 'category' => 'Brake Shoe', 'stock' => 2,
                'cost_price' => 168000, 'sell_price' => 270000,
                'vehicles' => ['UNIVERSAL|SEMUA MOBIL|-'],
            ],
            [
                'sku' => 'GM-0096', 'name' => 'Brake Shoe Innova', 'category' => 'Brake Shoe', 'stock' => 2,
                'cost_price' => 233000, 'sell_price' => 360000,
                'vehicles' => ['Toyota|Innova|Gen 1 (2004-2015)', 'Toyota|Innova Reborn|Gen 2 (2015-2022)'],
            ],
            [
                'sku' => 'GM-0097', 'name' => 'Breke Shoe Kijang Diesel', 'category' => 'Brake Shoe', 'stock' => 2,
                'cost_price' => 164000, 'sell_price' => 265000,
                'vehicles' => ['Toyota|Innova|Gen 1 (2004-2015)'],
            ],
            [
                'sku' => 'GM-0098', 'name' => 'Breke Shoe Mitsubishi Colt 120 Rear', 'category' => 'Brake Shoe', 'stock' => 2,
                'cost_price' => 282000, 'sell_price' => 380000,
                'vehicles' => ['UNIVERSAL|SEMUA MOBIL|-'],
            ],
            [
                'sku' => 'GM-0099', 'name' => 'Karpet Sparco Fiber Tebal', 'category' => 'Karpet', 'stock' => 5,
                'cost_price' => 40000, 'sell_price' => 60000,
                'vehicles' => ['UNIVERSAL|SEMUA MOBIL|-'],
            ],
            [
                'sku' => 'GM-0100', 'name' => 'Rack End Avanza', 'category' => 'Rack End', 'stock' => 1,
                'cost_price' => 90000, 'sell_price' => 180000,
                'vehicles' => ['Toyota|Avanza|Gen 1 (2003-2011)', 'Toyota|Avanza|Gen 2 (2011-2021)', 'Toyota|Avanza|Gen 3 (2021-Now)'],
            ],
            [
                'sku' => 'GM-0101', 'name' => 'Rack End Suzuki APV Power', 'category' => 'Rack End', 'stock' => 2,
                'cost_price' => 95000, 'sell_price' => 210000,
                'vehicles' => ['UNIVERSAL|SEMUA MOBIL|-'],
            ],

            // ===== Sheet 3 - Tanggal 23 Juni 2026 =====
            [
                'sku' => 'GM-0102', 'name' => 'Set Tierod Avanza SMT', 'category' => 'Tierod', 'stock' => 2,
                'cost_price' => 192000, 'sell_price' => 350000,
                'vehicles' => ['Toyota|Avanza|Gen 1 (2003-2011)', 'Toyota|Avanza|Gen 2 (2011-2021)'],
            ],
            [
                'sku' => 'GM-0103', 'name' => 'Set Tierod Innova', 'category' => 'Tierod', 'stock' => 2,
                'cost_price' => 178000, 'sell_price' => 300000,
                'vehicles' => ['Toyota|Innova|Gen 1 (2004-2015)', 'Toyota|Innova Reborn|Gen 2 (2015-2022)'],
            ],
            [
                'sku' => 'GM-0104', 'name' => 'Set Tierod Futura', 'category' => 'Tierod', 'stock' => 2,
                'cost_price' => 120000, 'sell_price' => 270000,
                'vehicles' => ['UNIVERSAL|SEMUA MOBIL|-'],
            ],
            [
                'sku' => 'GM-0105', 'name' => 'Balljoint Granmax Rush Low', 'category' => 'Balljoint', 'stock' => 2,
                'cost_price' => 136000, 'sell_price' => 170000,
                'vehicles' => ['Daihatsu|Gran Max|All Gen'],
            ],
            [
                'sku' => 'GM-0106', 'name' => 'Balljoint Innova/Fortuner Up', 'category' => 'Balljoint', 'stock' => 2,
                'cost_price' => 128000, 'sell_price' => 160000,
                'vehicles' => ['Toyota|Innova|Gen 1 (2004-2015)', 'Toyota|Innova Reborn|Gen 2 (2015-2022)'],
            ],
            [
                'sku' => 'GM-0107', 'name' => 'Set Tierod Agya', 'category' => 'Tierod', 'stock' => 2,
                'cost_price' => 264000, 'sell_price' => 364000,
                'vehicles' => ['Toyota|Agya|All Gen'],
            ],
            [
                'sku' => 'GM-0108', 'name' => 'Set Tierod Kijang 5K/7K', 'category' => 'Tierod', 'stock' => 2,
                'cost_price' => 255000, 'sell_price' => 355000,
                'vehicles' => ['Toyota|Innova|Gen 1 (2004-2015)'],
            ],
            [
                'sku' => 'GM-0109', 'name' => 'Balljoint L300 Up', 'category' => 'Balljoint', 'stock' => 4,
                'cost_price' => 168000, 'sell_price' => 250000,
                'vehicles' => ['UNIVERSAL|SEMUA MOBIL|-'],
            ],
            [
                'sku' => 'GM-0110', 'name' => 'Balljoint Low Kijang 5K/7K', 'category' => 'Balljoint', 'stock' => 2,
                'cost_price' => 216000, 'sell_price' => 280000,
                'vehicles' => ['Toyota|Innova|Gen 1 (2004-2015)'],
            ],
            [
                'sku' => 'GM-0111', 'name' => 'Set Tierod Panther', 'category' => 'Tierod', 'stock' => 2,
                'cost_price' => 160000, 'sell_price' => 260000,
                'vehicles' => ['UNIVERSAL|SEMUA MOBIL|-'],
            ],
            [
                'sku' => 'GM-0112', 'name' => 'Pic Balljoint Panther RH', 'category' => 'Balljoint', 'stock' => 2,
                'cost_price' => 192000, 'sell_price' => 250000,
                'vehicles' => ['UNIVERSAL|SEMUA MOBIL|-'],
            ],
            [
                'sku' => 'GM-0113', 'name' => 'Pic Balljoint Panther LH', 'category' => 'Balljoint', 'stock' => 2,
                'cost_price' => 192000, 'sell_price' => 250000,
                'vehicles' => ['UNIVERSAL|SEMUA MOBIL|-'],
            ],
            [
                'sku' => 'GM-0114', 'name' => 'Pic Lower Arm FTR', 'category' => 'Lower Arm', 'stock' => 2,
                'cost_price' => 180000, 'sell_price' => 290000,
                'vehicles' => ['UNIVERSAL|SEMUA MOBIL|-'],
            ],
            [
                'sku' => 'GM-0115', 'name' => 'Pic Lower Arm Carry', 'category' => 'Lower Arm', 'stock' => 2,
                'cost_price' => 150000, 'sell_price' => 225000,
                'vehicles' => ['UNIVERSAL|SEMUA MOBIL|-'],
            ],
            [
                'sku' => 'GM-0116', 'name' => 'Pic Balljoint Low Avanza', 'category' => 'Balljoint', 'stock' => 2,
                'cost_price' => 119000, 'sell_price' => 225000,
                'vehicles' => ['Toyota|Avanza|Gen 1 (2003-2011)', 'Toyota|Avanza|Gen 2 (2011-2021)', 'Toyota|Avanza|Gen 3 (2021-Now)'],
            ],
            [
                'sku' => 'GM-0117', 'name' => 'Pic Filter Solar Innova Diesel', 'category' => 'Filter', 'stock' => 5,
                'cost_price' => 51000, 'sell_price' => 70000,
                'vehicles' => ['Toyota|Innova|Gen 1 (2004-2015)'],
            ],
            [
                'sku' => 'GM-0118', 'name' => 'Pic Filter Solar L 300', 'category' => 'Filter', 'stock' => 3,
                'cost_price' => 70000, 'sell_price' => 80000,
                'vehicles' => ['UNIVERSAL|SEMUA MOBIL|-'],
            ],
            [
                'sku' => 'GM-0119', 'name' => 'Filter Oli Panther 2,3', 'category' => 'Filter', 'stock' => 2,
                'cost_price' => 45000, 'sell_price' => 60000,
                'vehicles' => ['UNIVERSAL|SEMUA MOBIL|-'],
            ],
            [
                'sku' => 'GM-0120', 'name' => 'Balljoint Calya/Sigra', 'category' => 'Balljoint', 'stock' => 2,
                'cost_price' => 112000, 'sell_price' => 170000,
                'vehicles' => ['Toyota|Calya|Gen 1 (2016-Now)', 'Daihatsu|Sigra|Gen 1 (2016-Now)'],
            ],
            [
                'sku' => 'GM-0121', 'name' => 'Balljoint Panther Fuji Low LH', 'category' => 'Balljoint', 'stock' => 2,
                'cost_price' => 178000, 'sell_price' => 250000,
                'vehicles' => ['UNIVERSAL|SEMUA MOBIL|-'],
            ],
            [
                'sku' => 'GM-0122', 'name' => 'Balljoint 5K Up Fuji', 'category' => 'Balljoint', 'stock' => 2,
                'cost_price' => 148000, 'sell_price' => 190000,
                'vehicles' => ['Toyota|Innova|Gen 1 (2004-2015)'],
            ],
            [
                'sku' => 'GM-0123', 'name' => 'Uppershaft L300 Fuji', 'category' => 'Steering', 'stock' => 2,
                'cost_price' => 160000, 'sell_price' => 225000,
                'vehicles' => ['UNIVERSAL|SEMUA MOBIL|-'],
            ],
            [
                'sku' => 'GM-0124', 'name' => 'Set Tierod End Calya/Sigra Fuji', 'category' => 'Tierod', 'stock' => 2,
                'cost_price' => 204000, 'sell_price' => 304000,
                'vehicles' => ['Toyota|Calya|Gen 1 (2016-Now)', 'Daihatsu|Sigra|Gen 1 (2016-Now)'],
            ],
            [
                'sku' => 'GM-0125', 'name' => 'Set Tierod Grandmax Fuji', 'category' => 'Tierod', 'stock' => 2,
                'cost_price' => 233000, 'sell_price' => 333000,
                'vehicles' => ['Daihatsu|Gran Max|All Gen'],
            ],
            [
                'sku' => 'GM-0126', 'name' => 'Set Tierod L300 Fuji', 'category' => 'Tierod', 'stock' => 2,
                'cost_price' => 165000, 'sell_price' => 265000,
                'vehicles' => ['UNIVERSAL|SEMUA MOBIL|-'],
            ],
            [
                'sku' => 'GM-0127', 'name' => 'Set Tierod Ertiga Fuji', 'category' => 'Tierod', 'stock' => 1,
                'cost_price' => 229000, 'sell_price' => 330000,
                'vehicles' => ['UNIVERSAL|SEMUA MOBIL|-'],
            ],
            [
                'sku' => 'GM-0128', 'name' => 'Filter Oli L300/Pajero', 'category' => 'Filter', 'stock' => 5,
                'cost_price' => 62000, 'sell_price' => 75000,
                'vehicles' => ['UNIVERSAL|SEMUA MOBIL|-'],
            ],
            [
                'sku' => 'GM-0129', 'name' => 'Dudukan Mesin Avanza LH', 'category' => 'Dudukan', 'stock' => 2,
                'cost_price' => 133000, 'sell_price' => 200000,
                'vehicles' => ['Toyota|Avanza|Gen 1 (2003-2011)', 'Toyota|Avanza|Gen 2 (2011-2021)', 'Toyota|Avanza|Gen 3 (2021-Now)'],
            ],
            [
                'sku' => 'GM-0130', 'name' => 'Dudukan Mesin Avanza RH', 'category' => 'Dudukan', 'stock' => 2,
                'cost_price' => 133000, 'sell_price' => 200000,
                'vehicles' => ['Toyota|Avanza|Gen 1 (2003-2011)', 'Toyota|Avanza|Gen 2 (2011-2021)', 'Toyota|Avanza|Gen 3 (2021-Now)'],
            ],
            [
                'sku' => 'GM-0131', 'name' => 'Filter Solar Panther NKR66', 'category' => 'Filter', 'stock' => 4,
                'cost_price' => 54000, 'sell_price' => 75000,
                'vehicles' => ['UNIVERSAL|SEMUA MOBIL|-'],
            ],
            [
                'sku' => 'GM-0132', 'name' => 'Balljoint Granmax Rush Low (2)', 'category' => 'Balljoint', 'stock' => 2,
                'cost_price' => 136000, 'sell_price' => 190000,
                'vehicles' => ['Daihatsu|Gran Max|All Gen'],
            ],
            [
                'sku' => 'GM-0133', 'name' => 'Filter Oli PS', 'category' => 'Filter', 'stock' => 5,
                'cost_price' => 74000, 'sell_price' => 85000,
                'vehicles' => ['UNIVERSAL|SEMUA MOBIL|-'],
            ],

            // ===== Sheet 4 - Tanggal 30 Juni 2026 =====
            [
                'sku' => 'GM-0134', 'name' => 'Stering Rack Futura', 'category' => 'Steering', 'stock' => 2,
                'cost_price' => 365000, 'sell_price' => 450000,
                'vehicles' => ['UNIVERSAL|SEMUA MOBIL|-'],
            ],
            [
                'sku' => 'GM-0135', 'name' => 'Stabilizer Expander', 'category' => 'Stabilizer', 'stock' => 2,
                'cost_price' => 85000, 'sell_price' => 185000,
                'vehicles' => ['UNIVERSAL|SEMUA MOBIL|-'],
            ],
            [
                'sku' => 'GM-0136', 'name' => 'Rack End Agya/Alya', 'category' => 'Rack End', 'stock' => 2,
                'cost_price' => 95000, 'sell_price' => 160000,
                'vehicles' => ['Toyota|Agya|All Gen', 'Daihatsu|Ayla|All Gen'],
            ],
            [
                'sku' => 'GM-0137', 'name' => 'Baut Roda (Pendek)', 'category' => 'Baut', 'stock' => 25,
                'cost_price' => 9000, 'sell_price' => 20000,
                'vehicles' => ['UNIVERSAL|SEMUA MOBIL|-'],
            ],
            [
                'sku' => 'GM-0138', 'name' => 'Baut Roda (Panjang)', 'category' => 'Baut', 'stock' => 25,
                'cost_price' => 9000, 'sell_price' => 25000,
                'vehicles' => ['UNIVERSAL|SEMUA MOBIL|-'],
            ],
            [
                'sku' => 'GM-0139', 'name' => 'Rack End New Avanza', 'category' => 'Rack End', 'stock' => 2,
                'cost_price' => 95000, 'sell_price' => 195000,
                'vehicles' => ['Toyota|Avanza|Gen 3 (2021-Now)'],
            ],
            [
                'sku' => 'GM-0140', 'name' => 'Filter Oli Honda', 'category' => 'Filter', 'stock' => 5,
                'cost_price' => 26000, 'sell_price' => 40000,
                'vehicles' => ['UNIVERSAL|SEMUA MOBIL|-'],
            ],
            [
                'sku' => 'GM-0141', 'name' => 'Sekering Mini (Sheet4)', 'category' => 'Sekering', 'stock' => 100,
                'cost_price' => 500, 'sell_price' => 1000,
                'vehicles' => ['UNIVERSAL|SEMUA MOBIL|-'],
            ],
            [
                'sku' => 'GM-0142', 'name' => 'Tutup Radiator Small', 'category' => 'Radiator', 'stock' => 10,
                'cost_price' => 18000, 'sell_price' => 30000,
                'vehicles' => ['UNIVERSAL|SEMUA MOBIL|-'],
            ],
            [
                'sku' => 'GM-0143', 'name' => 'Rack End 5K/7K', 'category' => 'Rack End', 'stock' => 2,
                'cost_price' => 95000, 'sell_price' => 165000,
                'vehicles' => ['Toyota|Innova|Gen 1 (2004-2015)'],
            ],
            [
                'sku' => 'GM-0144', 'name' => 'Lower Arm APV/FTR', 'category' => 'Lower Arm', 'stock' => 2,
                'cost_price' => 145000, 'sell_price' => 225000,
                'vehicles' => ['UNIVERSAL|SEMUA MOBIL|-'],
            ],
            [
                'sku' => 'GM-0145', 'name' => 'Tutup Radiator Besar', 'category' => 'Radiator', 'stock' => 10,
                'cost_price' => 21000, 'sell_price' => 45000,
                'vehicles' => ['UNIVERSAL|SEMUA MOBIL|-'],
            ],
            [
                'sku' => 'GM-0146', 'name' => 'Fiting Lampu Xi', 'category' => 'Kelistrikan', 'stock' => 25,
                'cost_price' => 5600, 'sell_price' => 8000,
                'vehicles' => ['UNIVERSAL|SEMUA MOBIL|-'],
            ],
            [
                'sku' => 'GM-0147', 'name' => 'Stabilizer Ertiga', 'category' => 'Stabilizer', 'stock' => 2,
                'cost_price' => 85000, 'sell_price' => 180000,
                'vehicles' => ['UNIVERSAL|SEMUA MOBIL|-'],
            ],
            [
                'sku' => 'GM-0148', 'name' => 'Oil Silicon', 'category' => 'Oli', 'stock' => 10,
                'cost_price' => 13000, 'sell_price' => 15000,
                'vehicles' => ['UNIVERSAL|SEMUA MOBIL|-'],
            ],
            [
                'sku' => 'GM-0149', 'name' => 'Coil Avanza', 'category' => 'Kelistrikan', 'stock' => 2,
                'cost_price' => 205000, 'sell_price' => 250000,
                'vehicles' => ['Toyota|Avanza|Gen 1 (2003-2011)', 'Toyota|Avanza|Gen 2 (2011-2021)', 'Toyota|Avanza|Gen 3 (2021-Now)'],
            ],
            [
                'sku' => 'GM-0150', 'name' => 'Stabilizer Agya', 'category' => 'Stabilizer', 'stock' => 2,
                'cost_price' => 90000, 'sell_price' => 160000,
                'vehicles' => ['Toyota|Agya|All Gen'],
            ],
            [
                'sku' => 'GM-0151', 'name' => 'Pompa Solar PS', 'category' => 'Pompa', 'stock' => 5,
                'cost_price' => 45000, 'sell_price' => 80000,
                'vehicles' => ['UNIVERSAL|SEMUA MOBIL|-'],
            ],
            [
                'sku' => 'GM-0152', 'name' => 'Relay Kaki 4 Avanza/Innova', 'category' => 'Kelistrikan', 'stock' => 5,
                'cost_price' => 33000, 'sell_price' => 45000,
                'vehicles' => ['Toyota|Avanza|Gen 1 (2003-2011)', 'Toyota|Avanza|Gen 2 (2011-2021)', 'Toyota|Innova|Gen 1 (2004-2015)'],
            ],
            [
                'sku' => 'GM-0153', 'name' => 'Tutup Oli L300/PS/T120/PS25', 'category' => 'Tutup Oli', 'stock' => 10,
                'cost_price' => 16000, 'sell_price' => 35000,
                'vehicles' => ['UNIVERSAL|SEMUA MOBIL|-'],
            ],
            [
                'sku' => 'GM-0154', 'name' => 'Filter Oli Innova', 'category' => 'Filter', 'stock' => 2,
                'cost_price' => 32000, 'sell_price' => 60000,
                'vehicles' => ['Toyota|Innova|Gen 1 (2004-2015)', 'Toyota|Innova Reborn|Gen 2 (2015-2022)'],
            ],
            [
                'sku' => 'GM-0155', 'name' => 'Condensor KF Carry', 'category' => 'Kelistrikan', 'stock' => 10,
                'cost_price' => 17000, 'sell_price' => 25000,
                'vehicles' => ['UNIVERSAL|SEMUA MOBIL|-'],
            ],
            [
                'sku' => 'GM-0156', 'name' => 'Brake Pad New Carry', 'category' => 'Brake Pad', 'stock' => 5,
                'cost_price' => 115000, 'sell_price' => 195000,
                'vehicles' => ['UNIVERSAL|SEMUA MOBIL|-'],
            ],
            [
                'sku' => 'GM-0157', 'name' => 'Tutup Tanki + Kunci L300/PS', 'category' => 'Tutup Tanki', 'stock' => 4,
                'cost_price' => 32000, 'sell_price' => 45000,
                'vehicles' => ['UNIVERSAL|SEMUA MOBIL|-'],
            ],
            [
                'sku' => 'GM-0158', 'name' => 'Set Will Woll PS', 'category' => 'Wiper', 'stock' => 1,
                'cost_price' => 75000, 'sell_price' => 150000,
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
