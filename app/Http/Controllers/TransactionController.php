<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\Transaction;
use App\Models\TransactionItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

class TransactionController extends Controller
{
    public function create()
    {
        return Inertia::render('Transactions/Create', [
            'products' => Product::with('vehicles')
                ->where('stock', '>', 0)
                // Security: Jangan kirim cost_price (HPP) ke frontend!
                ->select('id', 'sku', 'name', 'stock', 'sell_price', 'workshop_price')
                ->get()
        ]);
    }

    public function store(Request $request)
    {
        // 1. Validasi Request
        $validated = $request->validate([
            'cart'              => 'required|array|min:1',
            'cart.*.id'         => 'required|exists:products,id',
            'cart.*.qty'        => 'required|integer|min:1',
            'payment_method'    => 'required|string',
            'amount_paid'       => 'required|numeric',
            'change_amount'     => 'required|numeric',
            'customer_type'     => 'required|in:general,workshop',
        ]);

        try {
            // 2. Eksekusi Database Transaction
            DB::transaction(function () use ($validated) {
                
                // A. Buat Header Transaksi
                $transaction = Transaction::create([
                    'user_id'        => auth()->id(),
                    'invoice_number' => $this->generateInvoiceNumber(),
                    'payment_method' => $validated['payment_method'],
                    'customer_type'  => $validated['customer_type'],
                    'amount_paid'    => $validated['amount_paid'],
                    'change_amount'  => $validated['change_amount'],
                    'total_amount'   => 0, // Placeholder
                    'total_profit'   => 0, // Placeholder
                ]);

                $grandTotal = 0;
                $totalProfit = 0;

                // B. Loop Cart Items
                foreach ($validated['cart'] as $item) {
                    // Lock row produk untuk mencegah race condition stok
                    $product = Product::lockForUpdate()->find($item['id']);

                    // Validasi Stok (Backend Safety Net)
                    if ($product->stock < $item['qty']) {
                        throw ValidationException::withMessages([
                            'cart' => "Stok barang '{$product->name}' tidak mencukupi. Sisa: {$product->stock}"
                        ]);
                    }

                    // Tentukan Harga Jual (General vs Workshop)
                    $finalPrice = $this->determinePrice(
                        $product, 
                        $validated['customer_type']
                    );

                    // Hitung Subtotal & Profit
                    $subtotal = $finalPrice * $item['qty'];
                    $profit   = ($finalPrice - $product->cost_price) * $item['qty'];

                    // Simpan Detail Item
                    TransactionItem::create([
                        'transaction_id' => $transaction->id,
                        'product_id'     => $product->id,
                        'quantity'       => $item['qty'],
                        'price_at_time'  => $finalPrice,
                        'cost_at_time'   => $product->cost_price,
                    ]);

                    // Kurangi Stok
                    $product->decrement('stock', $item['qty']);

                    // Akumulasi Total
                    $grandTotal += $subtotal;
                    $totalProfit += $profit;
                }

                // C. Update Header dengan Total Akhir
                $transaction->update([
                    'total_amount' => $grandTotal,
                    'total_profit' => $totalProfit
                ]);
            });

            return redirect()->back()->with('success', 'Transaksi Berhasil Disimpan!');

        } catch (ValidationException $e) {
            // Lempar error validasi kembali ke frontend (akan muncul di props.errors)
            throw $e;
        } catch (\Exception $e) {
            // Tangkap error tak terduga
            return redirect()->back()->withErrors(['error' => 'Terjadi kesalahan sistem: ' . $e->getMessage()]);
        }
    }

    /**
     * Logic Harga: Pilih harga bengkel atau umum.
     */
    private function determinePrice(Product $product, string $customerType): float
    {
        if ($customerType === 'workshop' && $product->workshop_price > 0) {
            return $product->workshop_price;
        }
        return $product->sell_price;
    }

    /**
     * Generator Invoice Unik.
     * Format: INV-YYYYMMDD-TIMESTAMP (Lebih aman dari duplikasi)
     */
    private function generateInvoiceNumber(): string
    {
        return 'INV-' . date('Ymd') . '-' . time();
    }
}