# Kasir Android — Capacitor Build Readiness

**Date:** 2026-07-01
**Status:** Draft
**Stack:** Laravel 12 + React 19 + Inertia.js → Capacitor Android

## Goal

Wrap existing kasir (POS) web application into a native Android app using Capacitor. The app must support Bluetooth thermal printing, offline transaction queue, and token-based authentication.

## Current State

| Feature | Status | Notes |
|---------|--------|-------|
| PIN Login | OK | 4-digit PIN for kasir role |
| Product browsing | OK | Categories, search, stock display |
| Cart management | OK | Auto-save drafts |
| Checkout | OK | Cash, QRIS, Bank Transfer |
| Print receipt | Browser only | `window.print()` — does not work on Android |
| Auth mechanism | Cookie/session | Needs token-based for Capacitor |
| API layer | None | All routes return Inertia responses |
| Offline support | None | No service worker, no local cache |

## Architecture

### Approach: Capacitor WebView + API Layer

The existing React frontend runs inside a Capacitor WebView. A new JSON API layer is added alongside the existing Inertia routes. The Android app calls the API for data; Inertia handles page routing within the WebView. The web version continues using Inertia as-is — no changes to existing web behavior.

```
┌─────────────────────────────────────┐
│  Capacitor Android App              │
│  ┌───────────────────────────────┐  │
│  │  React + Inertia (WebView)   │  │
│  │  - Uses API routes (JSON)    │  │
│  │  - Token auth (Sanctum)      │  │
│  │  - Local draft queue         │  │
│  └───────────────────────────────┘  │
│  ┌───────────────────────────────┐  │
│  │  Native Plugins              │  │
│  │  - Bluetooth Printer (ESC/POS)│  │
│  │  - Network detection         │  │
│  │  - Secure storage            │  │
│  └───────────────────────────────┘  │
└─────────────────────────────────────┘
         │
         ▼  HTTPS + Bearer Token
┌─────────────────────────────────────┐
│  Laravel Backend                    │
│  - Existing web routes (Inertia)    │
│  - New API routes (JSON)            │
│  - Sanctum token auth               │
└─────────────────────────────────────┘
```

## Implementation Plan

### Phase 1: API Layer + Sanctum Auth

**1.1 Install Laravel Sanctum**

Add `laravel/sanctum` for token-based authentication. Kasir logs in with PIN and receives a bearer token stored in Capacitor's Secure Preferences.

**1.2 Create API Routes**

New routes in `routes/api.php`:

```
POST   /api/login          — PIN login, returns token
POST   /api/logout         — Revoke token
GET    /api/products       — Product list with stock
GET    /api/categories     — Category list
GET    /api/session        — Current cashier session
POST   /api/session/open   — Open cashier session
POST   /api/session/close  — Close cashier session
POST   /api/transactions        — Create transaction
GET    /api/transactions/{id}   — Transaction detail
POST   /api/draft           — Save draft
PUT    /api/draft/auto-save — Auto-save draft
DELETE /api/draft/{id}      — Delete draft
GET    /api/recap           — Transaction history
```

**1.3 Auth Flow**

```
Kasir enters PIN
    → POST /api/login { pin: "1234" }
    → Response { token: "abc123...", user: {...} }
    → Store token in Secure Preferences
    → All subsequent requests: Authorization: Bearer abc123...
```

### Phase 2: Capacitor Setup

**2.1 Initialize Capacitor**

```bash
npm install @capacitor/core @capacitor/cli
npx cap init "Graha Motor Kasir" com.grahamotor.kasir --web-dir=public/build
npx cap add android
```

**2.2 Configure Capacitor**

`capacitor.config.ts`:
- `server.url`: Point to production Laravel URL (or local dev URL)
- `server.cleartext`: true for development
- `android.allowMixedContent`: true for development

**2.3 Build & Sync**

```bash
npm run build
npx cap sync android
npx cap open android
```

### Phase 3: Bluetooth Thermal Printer

**3.1 Plugin Selection**

Use `@nicepay/capacitor-bluetooth-printer` — it has active maintenance, ESC/POS support, and works with common Indonesian thermal printers (Epox, Star Micronics, Xprinter).

**3.2 Printer Integration**

Replace `window.print()` in `print-receipt.tsx` with native print flow:

```
User taps "Cetak Struk"
    → Scan for paired Bluetooth printers
    → Connect to printer
    → Generate ESC/POS commands from receipt data
    → Send to printer
    → Show success/error toast
```

**3.3 ESC/POS Format**

Convert receipt HTML to ESC/POS byte array:
- Center alignment for header
- Bold for store name
- Dashed line separator
- Item rows with name, qty, price
- Total with bold
- Payment info

### Phase 4: Offline Queue

**4.1 Network Detection**

Use `@capacitor/network` to detect online/offline status.

**4.2 Transaction Queue**

When offline:
1. Transaction data saved to localStorage/IndexedDB
2. Queue entry: `{ id, cart, payment_method, timestamp, status: 'pending' }`
3. User sees "Tersimpan offline — akan dikirim saat online"

When online:
1. Background sync checks queue
2. Submit pending transactions one by one
3. Update status to 'sent' or 'failed'
4. Show notification on success/failure

**4.3 Draft Persistence**

Auto-save drafts to localStorage instead of (or in addition to) server. Sync to server when online.

### Phase 5: Android Optimization

**5.1 Splash Screen**

Configure Capacitor splash screen with Graha Motor branding.

**5.2 Status Bar**

Set status bar color to match app theme.

**5.3 Back Button**

Handle Android hardware back button — navigate back within app, don't exit.

**5.4 App Lifecycle**

Handle `pause`/`resume` events:
- Pause: Save current state
- Resume: Check network, sync queue, refresh session

## API Client Strategy

The existing pages use Inertia's `router.post()`, `router.put()`, etc. For Capacitor:

1. **Detection**: Check if running inside Capacitor (`Capacitor.isNativePlatform()`)
2. **API Client**: Create a thin wrapper around `fetch` that adds Sanctum token header
3. **Page adaptation**: Each page checks platform — if Capacitor, use API client; if web, use Inertia router
4. **Shared logic**: Business logic (cart, draft, validation) stays in React hooks, only the transport layer differs

This avoids rewriting the entire frontend. Pages get a small `if/else` for data fetching.

## Files to Create/Modify

| File | Action | Purpose |
|------|--------|---------|
| `routes/api.php` | Create | API routes |
| `app/Http/Controllers/Api/` | Create | API controllers |
| `config/sanctum.php` | Create | Sanctum config |
| `capacitor.config.ts` | Create | Capacitor config |
| `resources/js/api/client.ts` | Create | API client with token auth |
| `resources/js/hooks/useNetwork.ts` | Create | Network detection hook |
| `resources/js/hooks/useOfflineQueue.ts` | Create | Transaction queue |
| `resources/js/lib/printer.ts` | Create | ESC/POS printer helper |
| `resources/js/Components/pos/print-receipt.tsx` | Modify | Use native print |
| `resources/js/Pages/Auth/PinLogin.tsx` | Modify | Use API for login |
| `resources/js/Pages/Transactions/Create.tsx` | Modify | Use API, offline queue |
| `resources/js/Pages/Transactions/Checkout.tsx` | Modify | Use API |
| `resources/js/Pages/Transactions/Recap.tsx` | Modify | Use API |
| `resources/js/Pages/Transactions/Show.tsx` | Modify | Use API |

## Success Criteria

- [ ] Kasir can login with PIN on Android app
- [ ] Products load and display correctly
- [ ] Cart and checkout flow works end-to-end
- [ ] Receipt prints via Bluetooth thermal printer
- [ ] Transactions queue when offline and submit when online
- [ ] App handles network interruption gracefully
- [ ] Android back button navigates correctly

## Risks

| Risk | Mitigation |
|------|------------|
| Inertia + Capacitor compatibility | Test early; fallback to full API if needed |
| Bluetooth printer fragmentation | Test with common models (Epox, Star) |
| Offline data loss | Persist to IndexedDB, sync with retry |
| Sanctum token expiry | Set long expiry for kasir tokens, handle refresh |
