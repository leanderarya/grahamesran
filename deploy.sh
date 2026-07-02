#!/bin/bash
# ═══════════════════════════════════════════════════════════
# Graha Motor POS — Hostinger Deployment Script
# ═══════════════════════════════════════════════════════════
#
# Usage:
#   1. Upload project to Hostinger via SSH/Git
#   2. Run this script: bash deploy.sh
#
# Assumptions:
#   - Project root: domains/cahayaarkana.site/public_html/grahamotor
#   - PHP 8.2+ available
#   - MySQL database already created in hPanel
#   - .env file already configured with DB credentials
# ═══════════════════════════════════════════════════════════

set -e

PROJECT_ROOT="$(cd "$(dirname "$0")" && pwd)"
echo "🚀 Deploying Graha Motor POS..."
echo "📁 Project root: $PROJECT_ROOT"
echo ""

# --- Step 1: Install dependencies ---
echo "📦 Step 1: Installing PHP dependencies..."
cd "$PROJECT_ROOT"
composer install --no-dev --optimize-autoloader --no-interaction

# --- Step 2: Generate app key (if not set) ---
if ! grep -q "APP_KEY=base64:" .env 2>/dev/null; then
    echo "🔑 Step 2: Generating app key..."
    php artisan key:generate --force
else
    echo "🔑 Step 2: App key already set, skipping."
fi

# --- Step 3: Run migrations ---
echo "🗄️  Step 3: Running migrations..."
php artisan migrate --force

# --- Step 4: Seed oil products (first deploy only) ---
read -p "Seed oil products? (y/N): " seed_oils
if [ "$seed_oils" = "y" ] || [ "$seed_oils" = "Y" ]; then
    echo "🫙 Seeding oil products..."
    php artisan db:seed --class=OilSeeder --force
fi

# --- Step 5: Storage link ---
echo "🔗 Step 5: Creating storage symlink..."
php artisan storage:link

# --- Step 6: Cache config/routes/views ---
echo "⚡ Step 6: Caching for production..."
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan event:cache

# --- Step 7: Install & build frontend ---
echo "🎨 Step 7: Building frontend assets..."
npm ci --production=false
npm run build

# --- Step 8: Set permissions ---
echo "🔒 Step 8: Setting file permissions..."
chmod -R 755 storage bootstrap/cache
chmod -R 775 storage/logs storage/framework

echo ""
echo "✅ Deployment complete!"
echo ""
echo "📋 Post-deployment checklist:"
echo "   1. Verify .env has correct DB credentials"
echo "   2. Visit https://grahamotor.cahayaarkana.site"
echo "   3. Login as admin to verify Filament panel works"
echo "   4. Test PIN login for kasir"
echo ""
echo "🔑 Default admin: check AdminSeeder for credentials"
