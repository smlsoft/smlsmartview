# SML MIS AI — Next Generation Dashboard

ระบบ MIS / AI Agent Layer สำหรับ SML ที่ใช้ SMLERP เป็น Source of Truth โดยสร้างขึ้นมาใหม่ทั้งหมดบน Next.js 15 + React 19

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| UI | React 19 + Tailwind CSS + Radix UI |
| Language | TypeScript 5 |
| Database | PostgreSQL (via `pg`) |
| Session | iron-session |
| Validation | Zod |
| Package Manager | pnpm |

---

## Getting Started

### Prerequisites
- Node.js 20+
- pnpm
- PostgreSQL (SMLERP database)

### Install

```bash
pnpm install
```

### Environment

สร้างไฟล์ `.env.local` ที่ root:

```env
# Session secret (32+ chars)
SESSION_SECRET=your-secret-key-here
SESSION_COOKIE_SECURE=false

# Default DB (optional — user เลือกได้ตอน login)
DB_HOST=localhost
DB_PORT=5432
DB_NAME=smlerp
DB_USER=postgres
DB_PASSWORD=
```

### Run Dev

```bash
pnpm dev
# → http://localhost:3000
```

### Build

```bash
pnpm build
pnpm start
```

---

## Docker Deployment

### Production server แบบดึง image จาก GHCR

ใช้วิธีนี้บน server ที่ไม่ต้องการเก็บ source code หรือ build เอง

```bash
# ครั้งแรกครั้งเดียว ถ้า package เป็น private
docker login ghcr.io

# ต้องมีไฟล์ docker-compose.deploy.yml และ .env อยู่บน server
docker compose -f docker-compose.deploy.yml pull
docker compose -f docker-compose.deploy.yml up -d
```

แอปจะขึ้นที่ `http://your-server-ip:3618`

เวลาอัปเดต version ใหม่:

```bash
docker compose -f docker-compose.deploy.yml pull
docker compose -f docker-compose.deploy.yml up -d --force-recreate
```

ดู log / สถานะ:

```bash
docker compose -f docker-compose.deploy.yml logs -f app
docker compose -f docker-compose.deploy.yml ps
```

---

## Docker Build จาก source

### Prerequisites
- Docker + Docker Compose

### 1. สร้างไฟล์ `.env.production`

```env
SESSION_SECRET=your-secret-key-min-32-chars-here
SESSION_COOKIE_SECURE=false
```

> DB จะ connect ผ่าน network ไปยัง SMLERP server โดยตรง (ไม่ได้รัน PostgreSQL ใน container)
> ถ้าเปิดผ่าน HTTPS ให้ตั้ง `SESSION_COOKIE_SECURE=true`; ถ้าเปิดผ่าน HTTP ใน LAN เช่น `http://192.168.x.x:3618` ให้ใช้ `false`

### 2. Build image

```bash
docker compose build
```

### 3. Run

```bash
docker compose up -d
```

แอปจะขึ้นที่ `http://your-server-ip:3618`

### คำสั่งที่ใช้บ่อย

```bash
# ดู log
docker compose logs -f app

# หยุด
docker compose down

# ดูสถานะ health
docker compose ps
```

### Build แบบ manual (ไม่ใช้ compose)

```bash
# Build
docker build -t sml-mis-ai:latest .

# Run
docker run -d \
  --name sml-mis-ai \
  -p 3618:3000 \
  --env-file .env.production \
  --restart unless-stopped \
  sml-mis-ai:latest
```

---

## Project Structure

```
src/
├── app/
│   ├── (auth)/login/         # หน้า Login + เลือก Database
│   ├── (main)/
│   │   ├── dashboard/        # Executive Dashboard
│   │   └── inventory/        # สต็อกสินค้า
│   └── api/
│       ├── auth/             # login / logout / select-db
│       └── health/           # health check endpoint
├── components/
│   ├── dashboard/            # ExecutiveDashboard component
│   ├── inventory/            # InventoryDashboard component
│   ├── layout/               # Sidebar, Topbar, MainScrollArea
│   └── ui/                   # Shared UI (button, card, input, ...)
└── lib/
    ├── db.ts                 # PostgreSQL connection pool
    ├── session.ts            # iron-session config
    ├── auth-helpers.ts       # auth utilities
    ├── theme-context.tsx     # Theme provider
    └── queries/
        ├── dashboard.ts      # SQL queries — Executive KPIs
        └── inventory.ts      # SQL queries — Inventory
```

---

## Navigation (Target)

| เมนู | สถานะ |
|---|---|
| ภาพรวมกิจการ (Executive Dashboard) | WIP |
| สถานะทางการเงิน | Planned |
| Alert สมอง | Planned |
| ออเดอร์จาก LINE | Planned |
| ค้นหาข้อมูล | Planned |
| ผู้ช่วย AI | Planned |
| เลขาส่วนตัว | Planned |
| คุยกับลูกค้า | Planned |
| KMS | Planned |
| MCP Endpoint | Planned |

---

## Pull จาก GitHub Container Registry (ghcr.io)

Image ถูก build และ push อัตโนมัติทุกครั้งที่ push ขึ้น `main`

```bash
# Pull image ล่าสุด
docker pull ghcr.io/smlsoft/smlsmartview:latest

# Run โดยตรง (ไม่ใช้ compose)
docker run -d \
  --name sml-mis-ai \
  -p 3618:3000 \
  --env-file .env.production \
  --restart unless-stopped \
  ghcr.io/smlsoft/smlsmartview:latest
```

หรือใช้ `docker-compose.deploy.yml` สำหรับ server:

```bash
docker compose -f docker-compose.deploy.yml pull
docker compose -f docker-compose.deploy.yml up -d
```

---

## SQL Safety Rules

- Filter `last_status = 0` ทุกครั้งเมื่อ query transaction (ยกเว้นต้องการเอกสารยกเลิก)
- ระบุ `trans_flag` ทุกครั้งที่อ่าน `ic_trans`
- Join `ic_trans → ic_trans_detail` ด้วย `(trans_flag, doc_no, doc_date)`
- **ห้าม** mutate ข้อมูล SMLERP production จาก dashboard code

---
