# POS Two-Page Flow — Design Spec

## Problem

The current POS combines product browsing, cart management, and payment processing in a single page. This creates a cramped tablet experience where product discovery is limited and the cashier's focus is split.

## Solution

Split the POS into two dedicated pages:

1. **Transaction Workspace** (`/pos`) — Product browsing + cart management
2. **Checkout & Payment** (`/pos/checkout`) — Review order + process payment

Cart state is persisted to the database as a draft transaction, allowing seamless navigation between pages.

## Decisions

- **Cart persistence:** Backend draft transaction (status column on `transactions` table)
- **Draft storage:** Add `status` column to existing `transactions` table (not a separate table)
- **Discount/notes:** Deferred to a later phase
- **Payment methods:** Cash, QRIS, Transfer only (debit/credit card deferred)

---

## Database Changes

Add `status` column to `transactions` table:

| Column | Type | Default | Values |
|--------|------|---------|--------|
| `status` | string | `paid` | `draft`, `paid`, `cancelled` |

Migration:
```php
$table->string('status')->default('paid')->after('customer_type');
```

Update `Transaction` model:
- Add `status` to `$fillable`
- Add scope: `scopePaid()`, `scopeDraft()`
- Add helper: `isDraft()`, `isPaid()`

---

## Backend Changes

### TransactionController — New Methods

| Method | Route | Purpose |
|--------|-------|---------|
| `create()` | `GET /pos` | Workspace (modified — no payment UI) |
| `checkout()` | `GET /pos/checkout?draft={id}` | Checkout page (NEW) |
| `saveDraft()` | `POST /pos/draft` | Save/update draft transaction (NEW) |
| `store()` | `POST /pos` | Complete payment (modified — finalize draft) |
| `destroyDraft()` | `DELETE /pos/draft/{id}` | Cancel draft (NEW) |

### saveDraft() Flow

1. Validate: `cart` array with `cart.*.id`, `cart.*.qty`
2. If `draft_id` provided → update existing draft (delete old items, create new ones)
3. If no `draft_id` → create new Transaction with `status = 'draft'`
4. Return redirect to `/pos/checkout?draft={id}`

### checkout() Flow

1. Load draft transaction by ID (must be `status = 'draft'`)
2. Load transaction items with product relations
3. Pass to Inertia render: `Transactions/Checkout`

### store() Flow (modified)

1. Accept `draft_id` in request
2. Load draft transaction, verify `status = 'draft'`
3. Re-validate stock (existing logic)
4. Update `status = 'paid'`, set payment details
5. Update session counters
6. Return redirect to `/pos` with success

### destroyDraft() Flow

1. Load draft transaction
2. Delete transaction + items
3. Return redirect to `/pos`

---

## Frontend Changes

### Page 1: Transaction Workspace (`/pos`)

**File:** `resources/js/Pages/Transactions/Create.tsx`

**Remove:**
- Payment method buttons
- Cash received input
- Quick amount buttons
- Change display
- "Selesaikan Transaksi" button
- Receipt print area
- Payment-related state (`paymentMethod`, `cashReceived`, `change`)

**Add:**
- Cart summary sticky at bottom of cart panel: `5 Items | 12 Qty | Rp 1.250.000`
- "Lanjut ke Pembayaran" button (dominant CTA)
- Draft indicator if active draft exists

**Layout (2-column, no payment panel):**
```
┌──────────┬────────────────────────────────┬──────────────┐
│ Sidebar  │ Product Grid + Category Grid   │ Cart Panel   │
│          │                                │              │
│          │ [Search] [Filter Merk]         │ Cart items   │
│          │ Category Cards                 │ Qty controls │
│          │ Product Grid                   │              │
│          │                                │ [5 Items]    │
│          │                                │ [Rp 1.2jt]   │
│          │                                │ [Bayar ▶]    │
└──────────┴────────────────────────────────┴──────────────┘
```

**"Lanjut ke Pembayaran" behavior:**
1. POST cart to `/pos/draft` via `router.post()`
2. Backend saves draft, returns redirect to `/pos/checkout?draft={id}`
3. Frontend follows redirect automatically

### Page 2: Checkout & Payment (`/pos/checkout`)

**File:** `resources/js/Pages/Transactions/Checkout.tsx` (NEW)

**Layout:** Full-width, no sidebar. Two-column: order summary (left) + payment (right).

```
┌─────────────────────────────────────────────────────┐
│ [← Kembali ke Transaksi]           Draft #INV-xxx   │
├─────────────────────────────────────────────────────┤
│  ┌─────────────────────┐  ┌───────────────────────┐ │
│  │ Order Summary       │  │ Payment               │ │
│  │ Item list           │  │ Method cards          │ │
│  │ Subtotal/Total      │  │ Cash input / QRIS /   │ │
│  │                     │  │ Transfer info         │ │
│  │                     │  │ [Bayar Sekarang]      │ │
│  └─────────────────────┘  └───────────────────────┘ │
└─────────────────────────────────────────────────────┘
```

**Order Summary:**
- List items: name, qty, unit price, subtotal
- Collapsible if > 5 items
- Subtotal, Total

**Payment Methods:**
- 3 large cards: Tunai, QRIS, Transfer
- Tap to select, highlight active

**Cash Payment UI:**
- Amount due (read-only)
- Amount received input
- Quick buttons: Rp 50rb, Rp 100rb, Rp 200rb, Rp 500rb
- Change display

**QRIS/Transfer:**
- Placeholder UI (no payment gateway integration)
- Manual confirmation button

**"Bayar Sekarang" button:**
- POST to `/pos` with `draft_id`, `payment_method`, `amount_paid`, `change_amount`, `customer_type`
- On success → redirect to `/pos` with success + trigger receipt print

**"Kembali ke Transaksi" button:**
- Link back to `/pos`
- Draft stays in DB, cart in workspace is restored from draft

### Cart Restoration

When workspace loads (`/pos`), check if there's an active draft for the current user:
- If yes → load draft items into cart state
- If no → start with empty cart

---

## Component Structure

```
resources/js/Pages/Transactions/
├── Create.tsx          (Workspace — modified)
├── Checkout.tsx        (Checkout — NEW)
└── Recap.tsx           (Recap — unchanged)

resources/js/components/pos/
├── checkout-panel.tsx  → refactor to workspace-cart.tsx (remove payment, add summary)
├── order-summary.tsx   (NEW — checkout order list)
├── payment-methods.tsx (NEW — payment method cards)
├── cash-payment.tsx    (NEW — cash input + quick buttons)
└── ... (existing components)
```

---

## Transaction States

| State | Description | Transition |
|-------|-------------|------------|
| `draft` | Cart saved, not yet paid | → `paid` (on checkout), → `cancelled` (on cancel) |
| `paid` | Transaction completed | Terminal state |
| `cancelled` | Transaction voided | Terminal state |

---

## Files Changed

| File | Change |
|------|--------|
| `database/migrations/..._add_status_to_transactions_table.php` | New migration |
| `app/Models/Transaction.php` | Add `status` to fillable, scopes |
| `app/Http/Controllers/TransactionController.php` | Add saveDraft, checkout, destroyDraft; modify create, store |
| `routes/web.php` | Add new routes |
| `resources/js/Pages/Transactions/Create.tsx` | Remove payment UI, add cart summary, add draft save |
| `resources/js/Pages/Transactions/Checkout.tsx` | New checkout page |
| `resources/js/components/pos/checkout-panel.tsx` | Refactor to workspace-cart (no payment) |
| `resources/js/components/pos/order-summary.tsx` | New component |
| `resources/js/components/pos/payment-methods.tsx` | New component |
| `resources/js/components/pos/cash-payment.tsx` | New component |
