# 💰 Debt Management System API

Backend REST API untuk mengelola **utang pelanggan, siklus tagihan (invoice), dan pembayaran**.  
Dirancang untuk kebutuhan **admin panel / internal tools** dengan fokus pada:

- keamanan
- konsistensi data
- performa query
- kemudahan integrasi frontend

Project ini sudah memakai praktik yang umum dipakai di production environment.

---

## ✨ Core Features

### 🔐 Authentication & Security

- Login menggunakan JWT
- Token disimpan di **httpOnly cookie**
- Middleware proteksi endpoint
- Role based access (contoh: SUPERADMIN)
- Logout → token di-blacklist di Redis
- Force logout ketika password berubah

---

### 👤 Admin Management

- CRUD admin
- Pagination & search
- Validasi Zod
- Cegah duplikasi username/email
- Admin tidak bisa hapus dirinya sendiri

---

### 🧑 Customer / User Management

- CRUD user
- Pagination & search
- Endpoint khusus untuk dropdown/select
- Tidak bisa hapus user jika masih punya utang aktif

---

### 📄 Debt / Invoice System

- 1 user hanya boleh punya **1 cycle aktif**
- Tambah item utang → total otomatis bertambah
- Detail item per invoice
- Daftar invoice yang belum lunas
- Endpoint publik untuk cek status pembayaran

---

### 💳 Payment System

- Pelunasan hanya bisa jika jumlah = total tagihan
- Setelah bayar → cycle otomatis close
- Semua proses memakai **database transaction**
- Bisa hapus invoice + semua relasinya

---

### 📊 Dashboard & Analytics

Disediakan endpoint siap pakai untuk UI:

- total user
- total utang aktif
- total pembayaran
- pending debt
- overdue
- recent payments
- top debtor

Heavy aggregation dibuat paralel supaya cepat.

---

## 🧠 Business Flow

```text
Admin login
   ↓
Buat / pilih user
   ↓
Tambah utang → masuk ke debt items
   ↓
Total cycle bertambah
   ↓
User melakukan pembayaran
   ↓
Jika nominal sesuai → cycle lunas
   ↓
Masuk ke riwayat payment & dashboard
```

---

## 🏗️ Tech Stack

- Node.js
- Express
- TypeScript
- Prisma ORM
- PostgreSQL / MySQL (tergantung config)
- Redis
- JWT
- Zod Validation
- Swagger / OpenAPI

---

## 📁 Gambaran Struktur Folder

```
src/
 ├── controllers/
 ├── routes/
 ├── middlewares/
 ├── services/
 ├── validations/
 ├── utils/
 ├── prisma/
```

Struktur ini memisahkan logic supaya scalable & gampang dirawat.

---

## 🔑 Authentication Flow

1. Admin login
2. Server mengirim JWT
3. Token disimpan sebagai **httpOnly cookie**
4. Setiap request protected akan diverifikasi middleware
5. Logout → token masuk blacklist Redis

---

## 🚀 Cara Menjalankan Project

### 1. Install dependency

```bash
npm install
```

### 2. Setup environment

Buat file `.env`

```
DATABASE_URL=
JWT_SECRET=
REDIS_URL=
NODE_ENV=development
```

### 3. Prisma migrate

```bash
npx prisma migrate dev
```

### 4. Jalankan server

```bash
npm run dev
```

---

## 📌 API Groups

### Auth

- `POST /api/auth/login`
- `GET /api/auth/me`
- `POST /api/auth/logout`

### Admin (SUPERADMIN)

- `GET /api/admin`
- `POST /api/admin`
- `PUT /api/admin/:id`
- `DELETE /api/admin/:id`

### User

- `GET /api/user`
- `POST /api/user`
- `PUT /api/user/:id`
- `DELETE /api/user/:id`
- `GET /api/user/search`

### Debt

- `GET /api/debt`
- `POST /api/debt`
- `GET /api/debt/:cycleId/items`
- `GET /api/debt/open`
- `GET /api/debt/public`

### Payment

- `GET /api/payment`
- `POST /api/payment`
- `DELETE /api/payment/:cycleId`

### Dashboard

- `GET /api/dashboard/stats`
- `GET /api/dashboard/recent-payments`
- `GET /api/dashboard/top-debtors`
- `GET /api/dashboard/overview`

---

## 🛡️ Engineering Decisions

- **Cookie httpOnly** → aman dari XSS
- **Blacklist Redis** → token revoke real time
- **Transaction Prisma** → hindari data korup
- **Single active cycle** → simplify accounting
- **Parallel aggregation** → dashboard cepat
- **Zod** → validasi konsisten & type safe

---

## 🎯 Cocok Untuk

Sistem ini bisa jadi pondasi untuk:

- aplikasi kasir dengan fitur utang
- koperasi simpan pinjam
- fintech micro lending
- sistem invoice internal
- B2B payment tracking

---

## 🔮 Future Improvements

- refresh token
- audit log
- export PDF invoice
- reminder / notifikasi
- multi branch
- payment cicilan
- role permission lebih granular
- unit test & integration test
- Docker deployment
