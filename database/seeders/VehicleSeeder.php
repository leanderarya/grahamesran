<?php

namespace Database\Seeders;

use App\Models\Vehicle;
use Illuminate\Database\Seeder;

class VehicleSeeder extends Seeder
{
    public function run(): void
    {
        $data = [
            // --- MOBIL TOYOTA ---
            ['brand' => 'Toyota', 'model' => 'Avanza', 'year_generation' => 'Gen 1 (2003-2011)'],
            ['brand' => 'Toyota', 'model' => 'Avanza', 'year_generation' => 'Gen 2 (2011-2021)'],
            ['brand' => 'Toyota', 'model' => 'Avanza', 'year_generation' => 'Gen 3 (2021-Now)'],
            ['brand' => 'Toyota', 'model' => 'Innova', 'year_generation' => 'Gen 1 (2004-2015)'],
            ['brand' => 'Toyota', 'model' => 'Innova Reborn', 'year_generation' => 'Gen 2 (2015-2022)'],
            ['brand' => 'Toyota', 'model' => 'Innova Zenix', 'year_generation' => 'Gen 3 (2022-Now)'],
            ['brand' => 'Toyota', 'model' => 'Calya', 'year_generation' => 'Gen 1 (2016-Now)'],
            ['brand' => 'Toyota', 'model' => 'Agya', 'year_generation' => 'All Gen'],
            ['brand' => 'Toyota', 'model' => 'Rush', 'year_generation' => 'All Gen'],
            
            // --- MOBIL DAIHATSU ---
            ['brand' => 'Daihatsu', 'model' => 'Xenia', 'year_generation' => 'Gen 1 (2003-2011)'],
            ['brand' => 'Daihatsu', 'model' => 'Xenia', 'year_generation' => 'Gen 2 (2011-2021)'],
            ['brand' => 'Daihatsu', 'model' => 'Xenia', 'year_generation' => 'Gen 3 (2021-Now)'],
            ['brand' => 'Daihatsu', 'model' => 'Sigra', 'year_generation' => 'Gen 1 (2016-Now)'],
            ['brand' => 'Daihatsu', 'model' => 'Ayla', 'year_generation' => 'All Gen'],
            ['brand' => 'Daihatsu', 'model' => 'Terios', 'year_generation' => 'All Gen'],
            ['brand' => 'Daihatsu', 'model' => 'Gran Max', 'year_generation' => 'All Gen'], // Rajanya Sparepart Niaga

            // --- MOBIL HONDA ---
            ['brand' => 'Honda', 'model' => 'Brio', 'year_generation' => 'Gen 1 (2012-2018)'],
            ['brand' => 'Honda', 'model' => 'Brio', 'year_generation' => 'Gen 2 (2018-Now)'],
            ['brand' => 'Honda', 'model' => 'Jazz', 'year_generation' => 'GD3 (2001-2007)'],
            ['brand' => 'Honda', 'model' => 'Jazz', 'year_generation' => 'GE8 (2007-2014)'],
            ['brand' => 'Honda', 'model' => 'Jazz', 'year_generation' => 'GK5 (2014-2021)'],
            ['brand' => 'Honda', 'model' => 'HR-V', 'year_generation' => 'All Gen'],
            ['brand' => 'Honda', 'model' => 'Mobilio', 'year_generation' => 'All Gen'],

            // --- MOTOR HONDA (Paling Laku Sparepartnya) ---
            ['brand' => 'Honda Motor', 'model' => 'Beat', 'year_generation' => 'Karbu (2008-2012)'],
            ['brand' => 'Honda Motor', 'model' => 'Beat', 'year_generation' => 'FI (2012-2016)'],
            ['brand' => 'Honda Motor', 'model' => 'Beat', 'year_generation' => 'eSP (2016-2020)'],
            ['brand' => 'Honda Motor', 'model' => 'Beat', 'year_generation' => 'Deluxe/Gen 4 (2020-Now)'],
            ['brand' => 'Honda Motor', 'model' => 'Vario', 'year_generation' => '110/125/150'],
            ['brand' => 'Honda Motor', 'model' => 'Vario', 'year_generation' => '160 (2022-Now)'],
            ['brand' => 'Honda Motor', 'model' => 'Scoopy', 'year_generation' => 'All Gen'],
            ['brand' => 'Honda Motor', 'model' => 'PCX', 'year_generation' => '150/160'],
            ['brand' => 'Honda Motor', 'model' => 'Supra X', 'year_generation' => '125'],
            ['brand' => 'Honda Motor', 'model' => 'Revo', 'year_generation' => 'FI'],

            // --- MOTOR YAMAHA ---
            ['brand' => 'Yamaha Motor', 'model' => 'NMAX', 'year_generation' => 'Old (2015-2019)'],
            ['brand' => 'Yamaha Motor', 'model' => 'NMAX', 'year_generation' => 'New (2020-Now)'],
            ['brand' => 'Yamaha Motor', 'model' => 'Aerox', 'year_generation' => '155'],
            ['brand' => 'Yamaha Motor', 'model' => 'Mio', 'year_generation' => 'Sporty/Smile'],
            ['brand' => 'Yamaha Motor', 'model' => 'Mio', 'year_generation' => 'M3/Z (125)'],
            ['brand' => 'Yamaha Motor', 'model' => 'Jupiter Z', 'year_generation' => 'Burhan/Salib'],

            // --- UNIVERSAL ---
            ['brand' => 'UNIVERSAL', 'model' => 'SEMUA MOBIL', 'year_generation' => '-'],
            ['brand' => 'UNIVERSAL', 'model' => 'SEMUA MOTOR', 'year_generation' => '-'],
        ];

        foreach ($data as $vehicle) {
            Vehicle::firstOrCreate($vehicle);
        }
    }
}