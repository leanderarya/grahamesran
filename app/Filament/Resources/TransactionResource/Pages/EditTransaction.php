<?php

namespace App\Filament\Resources\TransactionResource\Pages;

use App\Filament\Resources\TransactionResource;
use App\Models\Transaction;
use App\Services\MonthlyReportService;
use Filament\Actions;
use Filament\Notifications\Notification;
use Filament\Resources\Pages\EditRecord;

class EditTransaction extends EditRecord
{
    protected static string $resource = TransactionResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\DeleteAction::make()
                ->visible(fn (): bool => ! $this->record->isInFinalizedMonth())
                ->before(function (MonthlyReportService $monthlyReportService): void {
                    $monthlyReportService->assertMonthIsOpen($this->record->reportMonth());
                }),
        ];
    }

    protected function getFormActions(): array
    {
        if ($this->record->isInFinalizedMonth()) {
            return [
                $this->getCancelFormAction(),
            ];
        }

        return parent::getFormActions();
    }

    protected function beforeSave(): void
    {
        $service = app(MonthlyReportService::class);

        $service->assertMonthIsOpen($this->record->reportMonth());

        if (filled($this->data['created_at'] ?? null)) {
            $service->assertMonthIsOpen($this->data['created_at']);
        }
    }

    protected function afterSave(): void
    {
        $this->recalculateTotals($this->record);
        app(MonthlyReportService::class)->syncMonth($this->record->reportMonth());

        Notification::make()
            ->title('Transaksi berhasil diperbarui')
            ->success()
            ->send();
    }

    private function recalculateTotals(Transaction $transaction): void
    {
        $transaction->load('items');

        $totalAmount = $transaction->items->sum(fn ($item) => $item->quantity * $item->price_at_time);
        $totalProfit = $transaction->items->sum(fn ($item) => $item->quantity * ($item->price_at_time - $item->cost_at_time));
        $amountPaid = max((float) ($transaction->amount_paid ?? 0), (float) $totalAmount);

        $transaction->updateQuietly([
            'total_amount' => $totalAmount,
            'total_profit' => $totalProfit,
            'amount_paid' => $amountPaid,
            'change_amount' => max($amountPaid - $totalAmount, 0),
        ]);
    }
}
