# POS Category Navigation — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add category-based navigation to the POS cashier interface so cashiers can browse products by category instead of scrolling through a flat list.

**Architecture:** Add `category` column to products table, pass categories to frontend via Inertia, implement Category Grid → Product Grid drill-down navigation in Create.tsx.

**Tech Stack:** Laravel 12, React 19, Inertia.js, TypeScript, Tailwind CSS

---

### Task 1: Add category column to products table

**Files:**
- Create: `database/migrations/2026_06_16_000003_add_category_to_products_table.php`
- Modify: `app/Models/Product.php:11-20`

- [ ] **Step 1: Create the migration**

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('products', function (Blueprint $table): void {
            $table->string('category')->nullable()->after('name');
        });
    }

    public function down(): void
    {
        Schema::table('products', function (Blueprint $table): void {
            $table->dropColumn('category');
        });
    }
};
```

- [ ] **Step 2: Add `category` to Product model `$fillable`**

In `app/Models/Product.php`, find:
```php
protected $fillable = [
    'sku',
    'name',
    'image_path',
```

Replace with:
```php
protected $fillable = [
    'sku',
    'name',
    'category',
    'image_path',
```

- [ ] **Step 3: Commit**

```bash
git add database/migrations/2026_06_16_000003_add_category_to_products_table.php app/Models/Product.php
git commit -m "feat: add category column to products table"
```

---

### Task 2: Update ProductSeeder with categories

**Files:**
- Modify: `database/seeders/ProductSeeder.php`

- [ ] **Step 1: Add `category` to each product in the seeder array**

For every product entry in the `$products` array, add a `'category'` key. The mapping is:

| SKU Range | Category |
|-----------|----------|
| GM-0001 to GM-0005 | `Stabilizer` |
| GM-0006 to GM-0008 | `Rack end` |
| GM-0009 | `Drag link` |
| GM-0010 | `Kabel` |
| GM-0011 | `Rem` |
| GM-0012, GM-0037, GM-0038 | `Soket` |
| GM-0013 | `Komponen Mesin` |
| GM-0014, GM-0015, GM-0036 | `Kelistrikan` |
| GM-0016, GM-0017, GM-0018, GM-0019 | `Komponen Mesin` |
| GM-0020 | `Kabel` |
| GM-0021 to GM-0024, GM-0029 | `Break pad` |
| GM-0025 to GM-0028 | `Klip` |
| GM-0030 to GM-0032, GM-0035 | `Sekering` |
| GM-0033, GM-0034 | `Karet` |
| GM-0039, GM-0040 | `Rotak` |
| GM-0041, GM-0042 | `Aki` |

Example of one entry after change:
```php
[
    'sku' => 'GM-0001', 'name' => 'Stabilizer Innova', 'category' => 'Stabilizer', 'stock' => 2,
    'cost_price' => 75000, 'sell_price' => 85000,
    'vehicles' => [
        'Toyota|Innova|Gen 1 (2004-2015)',
        'Toyota|Innova Reborn|Gen 2 (2015-2022)',
    ],
],
```

- [ ] **Step 2: Run the seeder to update existing products**

Run: `php artisan db:seed --class=ProductSeeder`

- [ ] **Step 3: Commit**

```bash
git add database/seeders/ProductSeeder.php
git commit -m "feat: add categories to ProductSeeder"
```

---

### Task 3: Pass categories to frontend

**Files:**
- Modify: `app/Http/Controllers/TransactionController.php:17-29`

- [ ] **Step 1: Add categories query to the create() method**

Find:
```php
return Inertia::render('Transactions/Create', [
    'products' => Product::with('vehicles')
        ->where('stock', '>', 0)
        ->select('id', 'sku', 'name', 'image_path', 'volume_liter', 'stock', 'sell_price', 'workshop_price')
        ->get(),
    'cashierSession' => $openSession ? $this->buildSessionPayload($openSession) : null,
]);
```

Replace with:
```php
$categories = Product::where('stock', '>', 0)
    ->whereNotNull('category')
    ->distinct()
    ->pluck('category')
    ->sort()
    ->values();

return Inertia::render('Transactions/Create', [
    'products' => Product::with('vehicles')
        ->where('stock', '>', 0)
        ->select('id', 'sku', 'name', 'category', 'image_path', 'volume_liter', 'stock', 'sell_price', 'workshop_price')
        ->get(),
    'categories' => $categories,
    'cashierSession' => $openSession ? $this->buildSessionPayload($openSession) : null,
]);
```

Note: added `category` to the `select()` list and added `categories` prop.

- [ ] **Step 2: Commit**

```bash
git add app/Http/Controllers/TransactionController.php
git commit -m "feat: pass categories list to POS frontend"
```

---

### Task 4: Add category navigation to Create.tsx

**Files:**
- Modify: `resources/js/Pages/Transactions/Create.tsx`

This is the main frontend task. It involves:

1. Add `category` to the Product interface
2. Add `categories` prop
3. Add `selectedVehicle` and `selectedCategory` state
4. Add vehicle brand dropdown
5. Implement Category Grid view
6. Implement Product Grid view (filtered by category)
7. Implement search override behavior
8. Add back button navigation

- [ ] **Step 1: Read the current Create.tsx file completely**

Read `resources/js/Pages/Transactions/Create.tsx` to understand the full current structure.

- [ ] **Step 2: Update the Product interface to include category**

Find the Product interface (around line 24-35) and add `category`:

```typescript
interface Product {
    id: number;
    sku: string;
    name: string;
    category: string | null;
    image_path: string | null;
    image_url: string | null;
    volume_liter: number | null;
    stock: number;
    sell_price: number;
    workshop_price: number | null;
    display_name: string;
    vehicles?: Vehicle[];
}
```

- [ ] **Step 3: Add categories to the props destructuring**

Find where `usePage().props` is destructured and add `categories`:

```typescript
const { products, categories, cashierSession } = usePage<{
    products: Product[];
    categories: string[];
    cashierSession: CashierSession | null;
}>().props;
```

- [ ] **Step 4: Add new state variables**

Add after the existing state declarations:

```typescript
const [selectedVehicle, setSelectedVehicle] = useState<string>('all');
const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
```

- [ ] **Step 5: Derive unique vehicle brands**

Add this computed value:

```typescript
const vehicleBrands = useMemo(() => {
    const brands = new Set<string>();
    products.forEach((p) =>
        p.vehicles?.forEach((v) => {
            if (v.brand !== 'UNIVERSAL') brands.add(v.brand);
        }),
    );
    return ['all', ...Array.from(brands).sort()];
}, [products]);
```

- [ ] **Step 6: Implement vehicle-filtered products**

```typescript
const vehicleFilteredProducts = useMemo(() => {
    if (selectedVehicle === 'all') return products;
    return products.filter((p) =>
        p.vehicles?.some((v) => v.brand === selectedVehicle),
    );
}, [products, selectedVehicle]);
```

- [ ] **Step 7: Implement category groups (for the Category Grid)**

```typescript
const categoryGroups = useMemo(() => {
    const groups: Record<string, Product[]> = {};
    vehicleFilteredProducts.forEach((p) => {
        const cat = p.category || 'Lainnya';
        if (!groups[cat]) groups[cat] = [];
        groups[cat].push(p);
    });
    return Object.entries(groups)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([name, items]) => ({ name, count: items.length }));
}, [vehicleFilteredProducts]);
```

- [ ] **Step 8: Implement category-filtered products (for the Product Grid)**

```typescript
const categoryProducts = useMemo(() => {
    if (!selectedCategory) return [];
    return vehicleFilteredProducts.filter((p) => (p.category || 'Lainnya') === selectedCategory);
}, [vehicleFilteredProducts, selectedCategory]);
```

- [ ] **Step 9: Update the search logic to handle category/vehicle context**

Replace the existing `filteredProducts` useMemo with:

```typescript
const filteredProducts = useMemo(() => {
    const query = deferredSearch.trim().toLowerCase();
    if (!query) return null; // null means "show category view"

    const base = vehicleFilteredProducts.filter(
        (product) =>
            product.name.toLowerCase().includes(query) ||
            (product.sku || '').toLowerCase().includes(query) ||
            (product.vehicles?.some((vehicle) =>
                (vehicle.model || '').toLowerCase().includes(query),
            ) ?? false),
    );
    return base.slice(0, 40);
}, [deferredSearch, vehicleFilteredProducts]);
```

- [ ] **Step 10: Add CategoryGrid component**

Add this component before the main TabletPOS component:

```typescript
function CategoryGrid({
    groups,
    onSelect,
}: {
    groups: { name: string; count: number }[];
    onSelect: (category: string) => void;
}) {
    const categoryIcons: Record<string, string> = {
        Stabilizer: '🔗',
        'Rack end': '🔧',
        'Drag link': '🔩',
        'Break pad': '🛑',
        Klip: '📎',
        Sekering: '⚡',
        Kabel: '🔌',
        Soket: '🔋',
        Kelistrikan: '💡',
        Karet: '⬛',
        'Komponen Mesin': '⚙️',
        Aki: '🔋',
        Rotak: '🔄',
        Rem: '🛞',
        Lainnya: '📦',
    };

    return (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4">
            {groups.map((group) => (
                <button
                    key={group.name}
                    onClick={() => onSelect(group.name)}
                    className="flex flex-col items-center gap-2 rounded-xl border border-neutral-200 bg-white p-4 text-center transition-all hover:border-blue-300 hover:shadow-md dark:border-neutral-700 dark:bg-neutral-800 dark:hover:border-blue-500"
                >
                    <span className="text-3xl">{categoryIcons[group.name] || '📦'}</span>
                    <span className="text-sm font-semibold text-neutral-800 dark:text-neutral-100">
                        {group.name}
                    </span>
                    <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                        {group.count} item
                    </span>
                </button>
            ))}
        </div>
    );
}
```

- [ ] **Step 11: Add VehicleFilter dropdown component**

```typescript
function VehicleFilter({
    brands,
    selected,
    onChange,
}: {
    brands: string[];
    selected: string;
    onChange: (brand: string) => void;
}) {
    return (
        <select
            value={selected}
            onChange={(e) => onChange(e.target.value)}
            className="rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm dark:border-neutral-600 dark:bg-neutral-800"
        >
            {brands.map((brand) => (
                <option key={brand} value={brand}>
                    {brand === 'all' ? 'Semua Merk' : brand}
                </option>
            ))}
        </select>
    );
}
```

- [ ] **Step 12: Update the main product display area**

Find the product grid section (around line 998 where the grid div is). Replace the entire product display section with conditional rendering:

```tsx
{/* Search or Category View */}
{filteredProducts ? (
    /* Search Results - flat list */
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-3">
        {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
        ))}
        {filteredProducts.length === 0 && (
            <p className="col-span-full py-8 text-center text-sm text-neutral-400">
                Barang tidak ditemukan.
            </p>
        )}
    </div>
) : selectedCategory ? (
    /* Product Grid - products in selected category */
    <div>
        <div className="mb-3 flex items-center gap-2">
            <button
                onClick={() => setSelectedCategory(null)}
                className="flex items-center gap-1 rounded-lg px-2 py-1 text-sm text-neutral-600 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-700"
            >
                ← Kembali
            </button>
            <h3 className="text-base font-bold text-neutral-800 dark:text-neutral-100">
                {selectedCategory}
            </h3>
            <span className="text-xs text-neutral-400">
                {categoryProducts.length} item
            </span>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-3">
            {categoryProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
            ))}
        </div>
    </div>
) : (
    /* Category Grid */
    <div>
        <h3 className="mb-3 text-base font-bold text-neutral-800 dark:text-neutral-100">
            Pilih Kategori
        </h3>
        <CategoryGrid
            groups={categoryGroups}
            onSelect={setSelectedCategory}
        />
    </div>
)}
```

- [ ] **Step 13: Add VehicleFilter to the toolbar area**

Find the search bar area and add the VehicleFilter dropdown next to it:

```tsx
<div className="flex items-center gap-2">
    <VehicleFilter
        brands={vehicleBrands}
        selected={selectedVehicle}
        onChange={(brand) => {
            setSelectedVehicle(brand);
            setSelectedCategory(null);
        }}
    />
    <input
        type="text"
        placeholder="Cari barang, SKU, atau model motor..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="flex-1 rounded-lg border px-3 py-2 text-sm"
    />
</div>
```

- [ ] **Step 14: Reset category when search is active**

Add this effect to clear category when user types:

```typescript
useEffect(() => {
    if (deferredSearch.trim()) {
        setSelectedCategory(null);
    }
}, [deferredSearch]);
```

- [ ] **Step 15: Commit**

```bash
git add resources/js/Pages/Transactions/Create.tsx
git commit -m "feat: add category grid navigation with vehicle filter to POS"
```

---

### Task 5: Verify and test

- [ ] **Step 1: Run TypeScript check**

Run: `npm run types`
Expected: No new errors

- [ ] **Step 2: Build frontend**

Run: `npm run build`
Expected: Build succeeds

- [ ] **Step 3: Commit build artifacts**

```bash
git add public/build/
git commit -m "build: compile frontend with category navigation"
```

---

## Verification Checklist

- [ ] Category grid shows correct product counts per category
- [ ] Tapping a category shows products in that category
- [ ] Back button returns to category grid
- [ ] Vehicle dropdown filters products and updates category counts
- [ ] Search overrides category view and shows flat results
- [ ] Clearing search returns to category grid
- [ ] Customer type toggle (general/workshop) still works in product grid
- [ ] Mobile layout: 2-column category grid, proper back button
- [ ] Adding to cart works from both search results and category product grid
