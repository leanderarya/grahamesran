# 🔧 Graha Mesran POS (Point of Sales)

![Graha Mesran Banner](public/GrahaMesran-light.png)

[![Laravel](https://img.shields.io/badge/Laravel-11-FF2D20?style=for-the-badge&logo=laravel&logoColor=white)](https://laravel.com)
[![Filament](https://img.shields.io/badge/Filament-v3-F28D1A?style=for-the-badge&logo=filament&logoColor=white)](https://filamentphp.com)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com)

## 📖 About The Project

**Graha Mesran POS** is a comprehensive, modern Point of Sale system specifically engineered for automotive shops specializing in spare parts and Pertamina lubricants.

Unlike generic POS systems, this application focuses on **Inventory Health** and **Financial Intelligence**. It solves the common chaos in auto-shops: lost inventory ("tuyul"), confusing cash flow between assets vs. expenses, and untracked profit margins.

Built with a **Hybrid Architecture**:
* **Backend & Admin Panel:** Laravel Filament (for robust reporting & management).
* **Frontend Cashier:** React.js via Inertia (for a snappy, SPA-like cashier experience).

---

## 🔥 Key Features

### 💰 Financial Intelligence (Admin Panel)
* **Real-time Dashboard:** Instantly view Net Profit, Gross Revenue, and Warehouse Asset Value.
* **Auto-Expense Logic:** Purchasing assets (e.g., shelving) automatically adjusts cash flow without double-entry.
* **Profit Tracking:** Calculates margin per transaction based on dynamic Capital Price (HPP).
* **Excel Export:** Full audit-ready reports for monthly closing.

### 📦 Inventory Control
* **Stock Opname (Audit):** Specialized module to record physical vs. system stock discrepancies (Loss/Damage/Correction).
* **Asset Management:** Track store equipment value separate from merchandise.
* **Product Logic:** Handle fast-moving consumer goods (Oils) and slow-moving spare parts.

### 🛒 Modern Cashier Experience (POS)
* **Fast Checkout:** React-based interface optimized for speed.
* **PWA Ready:** Installable on Android/iOS tablets as a native-like app.
* **Dual Mode Branding:** Interface adapts to Light/Dark mode environments automatically.
* **Thermal Printing:** Optimized receipt layout for standard 58mm/80mm printers.

---

## 📸 Screenshots

| Admin Dashboard | Stock Opname |
|:---:|:---:|
| ![Admin Dashboard](docs/images/dashboard-admin.png) | ![Stock Opname](docs/images/stock-opname.png) |

| Cashier Interface | Payment Option |
|:---:|:---:|
| ![Cashier POS](docs/images/pos-cashier.png) | ![Mobile View](docs/images/bayar.png) |

*(Note: Images are for demonstration purposes)*

---

## 🛠️ Tech Stack

* **Framework:** Laravel 11
* **Admin Panel:** FilamentPHP v3
* **Frontend:** React.js (Inertia.js)
* **Styling:** Tailwind CSS
* **Database:** MySQL
* **Deployment:** Hostinger (Shared Hosting Compatible)

---

## 🚀 Installation (Local Development)

1.  **Clone the repository**
    ```bash
    git clone [https://github.com/username/grahamesran.git](https://github.com/username/grahamesran.git)
    cd graha-mesran-pos
    ```

2.  **Install Dependencies**
    ```bash
    composer install
    npm install
    ```

3.  **Environment Setup**
    ```bash
    cp .env.example .env
    php artisan key:generate
    ```
    *Configure your database credentials in `.env` file.*

4.  **Database Migration & Seeding**
    ```bash
    php artisan migrate --seed
    ```
    *This will create a Super Admin account.*

5.  **Build Assets & Run**
    ```bash
    npm run build
    php artisan serve
    ```

6.  **Access the App**
    * Admin Panel: `http://127.0.0.1:8000/admin`
    * Cashier POS: `http://127.0.0.1:8000/`

---

## 🔮 Future Roadmap

* [ ] **V1.1:** Barcode Scanner Integration & Hold Transaction.
* [ ] **V1.2:** Supplier Database & Average Costing (HPP).
* [ ] **V1.3:** Customer Loyalty & Service History (Vehicle Records).

---

## 📝 License

This project is open-sourced software licensed under the [MIT license](https://opensource.org/licenses/MIT).

---

<p align="center">
  Built with ❤️ by Arya Ajisadda Haryanto for Graha Mesran
</p>

