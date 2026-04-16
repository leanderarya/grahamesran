<?php

namespace Tests\Feature;

use App\Models\Product;
use App\Models\Transaction;
use App\Models\User;
use App\Services\MonthlySalesReportImporter;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use Tests\TestCase;

class MonthlySalesReportImporterTest extends TestCase
{
    use RefreshDatabase;

    public function test_it_imports_one_daily_sheet_into_a_single_transaction(): void
    {
        $user = User::factory()->create([
            'role' => 'admin',
        ]);

        $filePath = storage_path('app/private/testing/monthly-sales-import.xlsx');

        if (! is_dir(dirname($filePath))) {
            mkdir(dirname($filePath), 0777, true);
        }

        $spreadsheet = new Spreadsheet;
        $sheet = $spreadsheet->getActiveSheet();
        $sheet->setTitle('1');

        $sheet->setCellValue('B5', 46023);
        $sheet->setCellValue('B10', 'Enduro 4T 20W-50');
        $sheet->setCellValue('C10', 0.8);
        $sheet->setCellValue('H10', 2);
        $sheet->setCellValue('I10', 1);
        $sheet->setCellValue('J10', 4);
        $sheet->setCellValue('L10', 35000);
        $sheet->setCellValue('M10', 36000);
        $sheet->setCellValue('N10', 50000);
        $sheet->setCellValue('O10', 52000);
        $sheet->setCellValue('B11', 'TOTAL');

        $writer = new Xlsx($spreadsheet);
        $writer->save($filePath);
        $spreadsheet->disconnectWorksheets();
        unset($spreadsheet);

        $summary = app(MonthlySalesReportImporter::class)->import($filePath, $user);

        $this->assertSame(1, $summary['imported_days']);
        $this->assertSame(0, $summary['skipped_days']);
        $this->assertSame(1, $summary['created_transactions']);
        $this->assertSame(1, $summary['created_products']);
        $this->assertSame(2, $summary['imported_items']);
        $this->assertSame(1, $summary['updated_stock_products']);

        $transaction = Transaction::where('invoice_number', 'IMP-20260101')->first();

        $this->assertNotNull($transaction);
        $this->assertEquals(152000, (float) $transaction->total_amount);
        $this->assertEquals(46000, (float) $transaction->total_profit);
        $this->assertEquals('import_excel', $transaction->payment_method);
        $this->assertCount(2, $transaction->items);

        $product = Product::where('name', 'Enduro 4T 20W-50')
            ->where('volume_liter', 0.8)
            ->first();

        $this->assertNotNull($product);
        $this->assertSame(4, $product->stock);
    }

    public function test_it_reads_sheet_dates_from_formula_cells_for_preview(): void
    {
        $filePath = storage_path('app/private/testing/monthly-sales-preview-formula.xlsx');

        if (! is_dir(dirname($filePath))) {
            mkdir(dirname($filePath), 0777, true);
        }

        $spreadsheet = new Spreadsheet;

        $sheet1 = $spreadsheet->getActiveSheet();
        $sheet1->setTitle('1');
        $sheet1->setCellValue('B5', 46023);
        $sheet1->setCellValue('B10', 'Produk A');
        $sheet1->setCellValue('C10', 0.8);
        $sheet1->setCellValue('H10', 1);
        $sheet1->setCellValue('L10', 10000);
        $sheet1->setCellValue('N10', 15000);
        $sheet1->setCellValue('B11', 'TOTAL');

        $sheet2 = $spreadsheet->createSheet();
        $sheet2->setTitle('2');
        $sheet2->setCellValue('B5', '=\'1\'!B5+1');
        $sheet2->setCellValue('B10', 'Produk B');
        $sheet2->setCellValue('C10', 1);
        $sheet2->setCellValue('H10', 2);
        $sheet2->setCellValue('L10', 12000);
        $sheet2->setCellValue('N10', 18000);
        $sheet2->setCellValue('B11', 'TOTAL');

        $writer = new Xlsx($spreadsheet);
        $writer->save($filePath);
        $spreadsheet->disconnectWorksheets();
        unset($spreadsheet);

        $preview = app(MonthlySalesReportImporter::class)->preview($filePath);

        $this->assertSame(2, $preview['imported_days']);
        $this->assertSame(0, $preview['skipped_days']);
        $this->assertCount(2, $preview['days']);
        $this->assertSame('IMP-20260102', $preview['days'][1]['invoice_number']);
    }

    public function test_it_ignores_total_sheet_when_importing(): void
    {
        $user = User::factory()->create([
            'role' => 'admin',
        ]);

        $filePath = storage_path('app/private/testing/monthly-sales-ignore-total.xlsx');

        if (! is_dir(dirname($filePath))) {
            mkdir(dirname($filePath), 0777, true);
        }

        $spreadsheet = new Spreadsheet;

        $sheet1 = $spreadsheet->getActiveSheet();
        $sheet1->setTitle('1');
        $sheet1->setCellValue('B5', 46023);
        $sheet1->setCellValue('B10', 'Produk A');
        $sheet1->setCellValue('C10', 1);
        $sheet1->setCellValue('H10', 1);
        $sheet1->setCellValue('L10', 10000);
        $sheet1->setCellValue('N10', 15000);
        $sheet1->setCellValue('B11', 'TOTAL');

        $totalSheet = $spreadsheet->createSheet();
        $totalSheet->setTitle('TOTAL');
        $totalSheet->setCellValue('B5', 46054);
        $totalSheet->setCellValue('B10', 'Produk Rekap');
        $totalSheet->setCellValue('C10', 1);
        $totalSheet->setCellValue('H10', 99);
        $totalSheet->setCellValue('L10', 10000);
        $totalSheet->setCellValue('N10', 15000);
        $totalSheet->setCellValue('B11', 'TOTAL');

        $writer = new Xlsx($spreadsheet);
        $writer->save($filePath);
        $spreadsheet->disconnectWorksheets();
        unset($spreadsheet);

        $summary = app(MonthlySalesReportImporter::class)->import($filePath, $user);

        $this->assertSame(1, $summary['imported_days']);
        $this->assertSame(1, Transaction::count());
        $this->assertDatabaseMissing('products', [
            'name' => 'Produk Rekap',
        ]);
    }

    public function test_it_marks_sheet_dates_outside_selected_month_in_validation_summary(): void
    {
        $user = User::factory()->create([
            'role' => 'admin',
        ]);

        $filePath = storage_path('app/private/testing/monthly-sales-wrong-month.xlsx');

        if (! is_dir(dirname($filePath))) {
            mkdir(dirname($filePath), 0777, true);
        }

        $spreadsheet = new Spreadsheet;
        $sheet = $spreadsheet->getActiveSheet();
        $sheet->setTitle('1');
        $sheet->setCellValue('B5', 46054);
        $sheet->setCellValue('B10', 'Produk Salah Bulan');
        $sheet->setCellValue('C10', 1);
        $sheet->setCellValue('H10', 1);
        $sheet->setCellValue('J10', 1);
        $sheet->setCellValue('L10', 10000);
        $sheet->setCellValue('N10', 15000);
        $sheet->setCellValue('B11', 'TOTAL');

        $writer = new Xlsx($spreadsheet);
        $writer->save($filePath);
        $spreadsheet->disconnectWorksheets();
        unset($spreadsheet);

        $summary = app(MonthlySalesReportImporter::class)->import($filePath, $user, '2026-01');

        $this->assertSame(1, $summary['imported_days']);
        $this->assertSame(1, $summary['updated_stock_products']);
        $this->assertSame(0, $summary['matched_days']);
        $this->assertSame(1, $summary['out_of_month_days']);
        $this->assertSame('outside', $summary['validation_status']);
        $this->assertStringContainsString('di luar Januari 2026', $summary['validation_notes']);
        $this->assertDatabaseHas('transactions', [
            'invoice_number' => 'IMP-20260201',
        ]);
        $this->assertDatabaseHas('products', [
            'name' => 'Produk Salah Bulan',
            'stock' => 1,
        ]);
    }

    public function test_it_uses_latest_daily_sheet_stock_as_month_end_stock(): void
    {
        $user = User::factory()->create([
            'role' => 'admin',
        ]);

        $filePath = storage_path('app/private/testing/monthly-sales-stock-snapshot.xlsx');

        if (! is_dir(dirname($filePath))) {
            mkdir(dirname($filePath), 0777, true);
        }

        $spreadsheet = new Spreadsheet;

        $day1 = $spreadsheet->getActiveSheet();
        $day1->setTitle('1');
        $day1->setCellValue('B5', 46023);
        $day1->setCellValue('B10', 'Produk Snapshot');
        $day1->setCellValue('C10', 1);
        $day1->setCellValue('H10', 1);
        $day1->setCellValue('J10', 5);
        $day1->setCellValue('L10', 10000);
        $day1->setCellValue('N10', 15000);
        $day1->setCellValue('B11', 'TOTAL');

        $day2 = $spreadsheet->createSheet();
        $day2->setTitle('2');
        $day2->setCellValue('B5', 46024);
        $day2->setCellValue('B10', 'Produk Snapshot');
        $day2->setCellValue('C10', 1);
        $day2->setCellValue('H10', 1);
        $day2->setCellValue('J10', 3);
        $day2->setCellValue('L10', 10000);
        $day2->setCellValue('N10', 15000);
        $day2->setCellValue('B11', 'TOTAL');

        $writer = new Xlsx($spreadsheet);
        $writer->save($filePath);
        $spreadsheet->disconnectWorksheets();
        unset($spreadsheet);

        $summary = app(MonthlySalesReportImporter::class)->import($filePath, $user, '2026-01');

        $product = Product::where('name', 'Produk Snapshot')
            ->where('volume_liter', 1)
            ->first();

        $this->assertNotNull($product);
        $this->assertSame(3, $product->stock);
        $this->assertSame(1, $summary['updated_stock_products']);
    }

    public function test_it_separates_products_with_same_name_but_different_volume(): void
    {
        $user = User::factory()->create([
            'role' => 'admin',
        ]);

        $filePath = storage_path('app/private/testing/monthly-sales-volume-separation.xlsx');

        if (! is_dir(dirname($filePath))) {
            mkdir(dirname($filePath), 0777, true);
        }

        $spreadsheet = new Spreadsheet;
        $sheet = $spreadsheet->getActiveSheet();
        $sheet->setTitle('1');
        $sheet->setCellValue('B5', 46023);

        $sheet->setCellValue('B10', 'Produk Sama');
        $sheet->setCellValue('C10', 0.8);
        $sheet->setCellValue('H10', 1);
        $sheet->setCellValue('J10', 4);
        $sheet->setCellValue('L10', 10000);
        $sheet->setCellValue('N10', 15000);

        $sheet->setCellValue('B11', 'Produk Sama');
        $sheet->setCellValue('C11', 1);
        $sheet->setCellValue('H11', 2);
        $sheet->setCellValue('J11', 7);
        $sheet->setCellValue('L11', 12000);
        $sheet->setCellValue('N11', 18000);

        $sheet->setCellValue('B12', 'TOTAL');

        $writer = new Xlsx($spreadsheet);
        $writer->save($filePath);
        $spreadsheet->disconnectWorksheets();
        unset($spreadsheet);

        $summary = app(MonthlySalesReportImporter::class)->import($filePath, $user, '2026-01');

        $productA = Product::where('name', 'Produk Sama')->where('volume_liter', 0.8)->first();
        $productB = Product::where('name', 'Produk Sama')->where('volume_liter', 1)->first();

        $this->assertSame(2, $summary['created_products']);
        $this->assertSame(2, $summary['updated_stock_products']);
        $this->assertNotNull($productA);
        $this->assertNotNull($productB);
        $this->assertNotSame($productA->id, $productB->id);
        $this->assertSame(4, $productA->stock);
        $this->assertSame(7, $productB->stock);

        $transaction = Transaction::where('invoice_number', 'IMP-20260101')->first();

        $this->assertNotNull($transaction);
        $this->assertCount(2, $transaction->items);
        $this->assertNotSame($transaction->items[0]->product_id, $transaction->items[1]->product_id);
    }

    public function test_it_updates_stock_for_rows_without_sales_on_the_last_sheet(): void
    {
        $user = User::factory()->create([
            'role' => 'admin',
        ]);

        $filePath = storage_path('app/private/testing/monthly-sales-no-sale-stock.xlsx');

        if (! is_dir(dirname($filePath))) {
            mkdir(dirname($filePath), 0777, true);
        }

        $spreadsheet = new Spreadsheet;

        $day1 = $spreadsheet->getActiveSheet();
        $day1->setTitle('1');
        $day1->setCellValue('B5', 46023);
        $day1->setCellValue('B10', 'Produk Tanpa Sales');
        $day1->setCellValue('C10', 1);
        $day1->setCellValue('H10', 1);
        $day1->setCellValue('J10', 4);
        $day1->setCellValue('L10', 10000);
        $day1->setCellValue('N10', 15000);
        $day1->setCellValue('B11', 'TOTAL');

        $day2 = $spreadsheet->createSheet();
        $day2->setTitle('2');
        $day2->setCellValue('B5', 46024);
        $day2->setCellValue('B10', 'Produk Tanpa Sales');
        $day2->setCellValue('C10', 1);
        $day2->setCellValue('J10', 9);
        $day2->setCellValue('L10', 10000);
        $day2->setCellValue('N10', 15000);
        $day2->setCellValue('B11', 'TOTAL');

        $writer = new Xlsx($spreadsheet);
        $writer->save($filePath);
        $spreadsheet->disconnectWorksheets();
        unset($spreadsheet);

        $summary = app(MonthlySalesReportImporter::class)->import($filePath, $user, '2026-01');

        $product = Product::where('name', 'Produk Tanpa Sales')
            ->where('volume_liter', 1)
            ->first();

        $this->assertNotNull($product);
        $this->assertSame(9, $product->stock);
        $this->assertSame(1, $summary['updated_stock_products']);
    }
}
