# POS Category Navigation — Design Spec

## Problem

The POS cashier interface displays products as a flat, unsorted list with no categorization. When the inventory grows (40+ products), cashiers must scroll extensively or rely solely on text search to find items. There is no way to browse products by type or vehicle compatibility.

## Solution

Add a two-level navigation system to the POS product browser:

1. **Category Grid** — A dashboard of category cards showing product counts. Tap a card to drill into products.
2. **Product Grid** — Products filtered by the selected category, with a back button to return to the category grid.
3. **Vehicle Brand Filter** — A dropdown that filters products by compatible vehicle brand, updating counts in both views.
4. **Search Override** — Text search takes priority and shows flat results across all categories (existing behavior, preserved).

## Architecture

### Data Model

Add a `category` string column to the `products` table. Categories are derived dynamically from `Product::distinct('category')` — no separate categories table needed.

**Category values** (based on existing product data):

| Category | Example Products | Count |
|----------|-----------------|-------|
| Stabilizer | Stabilizer Innova, Avanza, APV | 5 |
| Rack end | Rack end Sigra, Avanza, Jazz | 3 |
| Drag link | Drag link Futura | 1 |
| Break pad | Break pad Panther, Granmax, L300, Avanza, Innova | 5 |
| Klip | Klip Avanza, Jazz, Innova, merah+hijau | 4 |
| Sekering | Sekering Tancap, Micro, Tabung, Mini | 4 |
| Kabel | Kabel 0,8/20m, Kabel Busi | 2 |
| Soket | Soket sein T10, Soket Relay K4, Soket Tancap | 3 |
| Kelistrikan | LED mata 3, Fitting lampu, Tabung Busi | 3 |
| Karet | Karet Gentong shock, Karet mata shock | 2 |
| Komponen Mesin | Platina Kijang, CO/CM Kijang, FO Avanza/Kijang | 5 |
| Aki | Klem Aki Besar/Kecil | 2 |
| Rotak | Rotak Futura, Zebra | 2 |
| Rem | Swet Rem PS/L300 | 1 |

### Backend

**TransactionController@create()** changes:
- Add `categories` to Inertia props: `Product::where('stock', '>', 0)->whereNotNull('category')->distinct()->pluck('category')->sort()->values()`
- Products payload unchanged (already loads all products with vehicles)

**Product model** changes:
- Add `category` to `$fillable`

**New migration:**
```php
Schema::table('products', function (Blueprint $table) {
    $table->string('category')->nullable()->after('name');
});
```

### Frontend (Create.tsx)

#### State

```tsx
const [selectedVehicle, setSelectedVehicle] = useState<string>('all');
const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
const [searchQuery, setSearchQuery] = useState<string>('');
```

#### View Routing

| Condition | View |
|-----------|------|
| `searchQuery` is non-empty | **Search Results** — flat filtered list (existing behavior) |
| `searchQuery` is empty + `selectedCategory` is null | **Category Grid** — category cards |
| `searchQuery` is empty + `selectedCategory` is set | **Product Grid** — products in category |

#### Category Grid View

- **Layout:** Responsive grid — 2 columns on mobile, 3 on tablet, 4 on desktop
- **Each card shows:**
  - Category name (bold)
  - Product count (badge)
  - Tap → `setSelectedCategory(categoryName)`
- **Vehicle dropdown** above grid — filters products, updates counts per category
- **Empty state:** "Tidak ada produk dalam kategori ini" when filter yields 0 results

#### Product Grid View

- **Header:** `[← Kembali]` button + category name + product count
- **Product cards:** Same component as current `ProductCard` (image, SKU, name, stock, price)
- **Vehicle dropdown** above grid — further filters within the category
- **Back button:** `setSelectedCategory(null)` — returns to Category Grid

#### Search Behavior

- Search bar visible in both views
- Typing in search bar → clears `selectedCategory`, shows flat search results
- Clearing search → returns to previous view (Category Grid or Product Grid)
- Search scope: product name, SKU, vehicle model (existing behavior)

#### Vehicle Filter

- Dropdown options: `[Semua Merk]` + unique vehicle brands from product data
- Derived from: `products.flatMap(p => p.vehicles?.map(v => v.brand)).unique().sort()`
- Affects both Category Grid (updates counts) and Product Grid (filters products)
- Reset to `'all'` when navigating back to Category Grid

### UI Layout

```
┌─────────────────────────────────────────────────────┐
│ [Sidebar] │ [Dropdown: Semua Merk ▼]  [🔍 Cari]    │
│           │ ┌──────────┐ ┌──────────┐ ┌──────────┐  │
│           │ │Break pad │ │Stabilizer│ │ Sekering │  │
│           │ │    5     │ │    5     │ │    4     │  │
│           │ └──────────┘ └──────────┘ └──────────┘  │
│           │ ┌──────────┐ ┌──────────┐ ┌──────────┐  │
│           │ │   Klip   │ │ Komponen │ │  Kabel   │  │
│           │ │    4     │ │ Mesin 5  │ │    2     │  │
│           │ └──────────┘ └──────────┘ └──────────┘  │
│ [Cart]    │ ...                                      │
└─────────────────────────────────────────────────────┘

Tap "Break pad" →
┌─────────────────────────────────────────────────────┐
│ [Sidebar] │ [← Kembali] Break pad     [🔍 Cari]     │
│           │ [Dropdown: Semua Merk ▼]                │
│           │ ┌─ Break pad Avanza ──────────────────┐  │
│           │ │ [img] GM-0024           Rp 120.000  │  │
│           │ │       Stok: 2                       │  │
│           │ └────────────────────────────────────┘  │
│           │ ┌─ Break pad Innova ─────────────────┐  │
│           │ │ [img] GM-0029           Rp 140.000  │  │
│           │ │       Stok: 2                       │  │
│           │ └────────────────────────────────────┘  │
│ [Cart]    │ ...                                      │
└─────────────────────────────────────────────────────┘
```

### Mobile Behavior

- Category Grid: 2 columns, full width
- Product Grid: same horizontal card layout as current
- Vehicle dropdown: full width
- Back button: replaces sidebar menu on mobile (sidebar is hidden on mobile anyway)
- Cart: toggled via bottom checkout bar (existing behavior)

## Files Changed

| File | Change |
|------|--------|
| `database/migrations/..._add_category_to_products_table.php` | New migration |
| `database/seeders/ProductSeeder.php` | Add category to product data |
| `app/Models/Product.php` | Add `category` to `$fillable` |
| `app/Http/Controllers/TransactionController.php` | Add `categories` to Inertia props |
| `resources/js/Pages/Transactions/Create.tsx` | Category grid, product grid, vehicle filter, state management |

## Testing

- Verify category grid shows correct counts
- Verify tapping a category shows the right products
- Verify back button returns to category grid
- Verify search overrides category view
- Verify vehicle filter updates counts and products
- Verify customer type toggle (general/workshop) still works in both views
- Verify mobile layout works (2-col grid, back button, cart toggle)
