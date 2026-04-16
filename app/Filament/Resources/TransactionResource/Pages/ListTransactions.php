<?php

namespace App\Filament\Resources\TransactionResource\Pages;

use App\Filament\Resources\TransactionResource;
use App\Models\ImportHistory;
use App\Services\MonthlyReportService;
use App\Services\MonthlySalesReportImporter;
use Carbon\Carbon;
use Filament\Actions;
use Filament\Forms\Components\FileUpload;
use Filament\Forms\Components\TextInput;
use Filament\Notifications\Notification;
use Filament\Resources\Pages\ListRecords;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Storage;
use Livewire\Features\SupportFileUploads\TemporaryUploadedFile;
use RuntimeException;
use Throwable;

class ListTransactions extends ListRecords
{
    protected static string $resource = TransactionResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\Action::make('importMonthlyExcel')
                ->label('Import Excel Bulanan')
                ->icon('heroicon-o-arrow-up-tray')
                ->color('success')
                ->form([
                    TextInput::make('report_month')
                        ->label('Bulan laporan')
                        ->type('month')
                        ->required(),
                    FileUpload::make('file')
                        ->label('File laporan bulanan')
                        ->acceptedFileTypes([
                            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                            'application/vnd.ms-excel',
                        ])
                        ->directory('imports/sales-reports')
                        ->disk('local')
                        ->preserveFilenames()
                        ->required(),
                ])
                ->action(function (
                    array $data,
                    MonthlySalesReportImporter $importer,
                    MonthlyReportService $monthlyReportService
                ): void {
                    $targetMonth = Carbon::createFromFormat('Y-m', $data['report_month'])->startOfMonth();
                    $monthlyReportService->assertMonthIsOpen($targetMonth);

                    $path = $this->resolveImportFilePath($data['file']);
                    $history = ImportHistory::query()->create([
                        'monthly_report_id' => $monthlyReportService->syncMonth($targetMonth)->id,
                        'user_id' => auth()->id(),
                        'import_month' => $targetMonth,
                        'original_file_name' => $this->resolveOriginalFileName($data['file']),
                        'stored_file_path' => $this->resolveStoredFilePath($data['file']),
                        'status' => 'processing',
                    ]);

                    try {
                        $summary = $importer->import($path, auth()->user(), $targetMonth);
                        $monthlyReport = $monthlyReportService->syncMonth($targetMonth);

                        $history->update([
                            'monthly_report_id' => $monthlyReport->id,
                            'status' => 'success',
                            'imported_days' => $summary['imported_days'],
                            'skipped_days' => $summary['skipped_days'],
                            'created_transactions' => $summary['created_transactions'],
                            'updated_transactions' => $summary['updated_transactions'],
                            'created_products' => $summary['created_products'],
                            'imported_items' => $summary['imported_items'],
                            'matched_days' => $summary['matched_days'],
                            'out_of_month_days' => $summary['out_of_month_days'],
                            'first_transaction_date' => $summary['first_transaction_date'],
                            'last_transaction_date' => $summary['last_transaction_date'],
                            'detected_months' => $summary['detected_months'],
                            'validation_status' => $summary['validation_status'],
                            'validation_notes' => $summary['validation_notes'],
                            'error_message' => null,
                        ]);

                        Notification::make()
                            ->title('Import laporan selesai')
                            ->body(
                                "Hari diimpor: {$summary['imported_days']}, ".
                                "hari kosong: {$summary['skipped_days']}, ".
                                "transaksi baru: {$summary['created_transactions']}, ".
                                "transaksi diperbarui: {$summary['updated_transactions']}, ".
                                "produk baru: {$summary['created_products']}, ".
                                "item tersimpan: {$summary['imported_items']}, ".
                                "stok diperbarui: {$summary['updated_stock_products']}. ".
                                $summary['validation_notes']
                            )
                            ->success()
                            ->send();
                    } catch (Throwable $throwable) {
                        $history->update([
                            'status' => 'failed',
                            'error_message' => $throwable->getMessage(),
                        ]);

                        Notification::make()
                            ->title('Import laporan gagal')
                            ->body($throwable->getMessage())
                            ->danger()
                            ->send();
                    }
                }),
        ];
    }

    private function resolveImportFilePath(mixed $state): string
    {
        $file = Arr::first(Arr::wrap($state));

        if ($file instanceof TemporaryUploadedFile) {
            $path = $file->getRealPath();

            if ($path && is_file($path)) {
                return $path;
            }
        }

        if (! is_string($file) || $file === '') {
            throw new RuntimeException('File import tidak valid.');
        }

        $candidates = [
            $file,
            storage_path('app/'.$file),
            storage_path('app/private/'.$file),
            Storage::disk('local')->path(ltrim($file, '/')),
        ];

        foreach ($candidates as $candidate) {
            if (is_string($candidate) && is_file($candidate)) {
                return $candidate;
            }
        }

        throw new RuntimeException("File import tidak ditemukan: {$file}");
    }

    private function resolveOriginalFileName(mixed $state): string
    {
        $file = Arr::first(Arr::wrap($state));

        if ($file instanceof TemporaryUploadedFile) {
            return $file->getClientOriginalName();
        }

        return is_string($file) && $file !== '' ? basename($file) : 'laporan-import.xlsx';
    }

    private function resolveStoredFilePath(mixed $state): ?string
    {
        $file = Arr::first(Arr::wrap($state));

        return is_string($file) && $file !== '' ? $file : null;
    }
}
