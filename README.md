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

> `SESSION_SECRET` ต้องยาวอย่างน้อย 32 ตัวอักษร (ระบบจะ throw error ตอนรัน production ถ้าสั้นกว่านั้น)
> ให้สร้างค่าจริงด้วยคำสั่ง `openssl rand -hex 32` แล้ว copy ผลลัพธ์ทั้ง 64 ตัวอักษรไปใส่แทน — บน Windows รันผ่าน Git Bash หรือ WSL (PowerShell ปกติไม่มี openssl)

```env
# Session secret (32+ chars) — สร้างค่าด้วย: openssl rand -hex 32
SESSION_SECRET=<paste ผลลัพธ์จาก openssl rand -hex 32 ที่นี่>
# Optional (ปกติไม่ต้องตั้ง): ระบบเลือก Secure cookie ให้เองตามโปรโตคอล http/https ที่ผู้ใช้เปิด
# SESSION_COOKIE_SECURE=true

# Default DB (optional — user เลือกได้ตอน login)
DB_HOST=localhost
DB_PORT=5432
DB_NAME=smlerp
DB_USER=postgres
DB_PASSWORD=

# Login page defaults (ERP provider code + preferred database code — get real values from the team)
LOGIN_DEFAULT_PROVIDER_CODE=<รหัสผู้ให้บริการ ตอนเข้าหน้าโปรแกรม SML>
LOGIN_PREFERRED_DB_CODE=<รหัส db ตัวจริงของ production>
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

> `SESSION_SECRET` ต้องยาวอย่างน้อย 32 ตัวอักษร (ระบบจะ throw error ตอนรัน production ถ้าสั้นกว่านั้น)
> ให้สร้างค่าจริงด้วยคำสั่ง `openssl rand -hex 32` แล้ว copy ผลลัพธ์ทั้ง 64 ตัวอักษรไปใส่แทน — บน Windows รันผ่าน Git Bash หรือ WSL (PowerShell ปกติไม่มี openssl)

```env
# Session secret (32+ chars) — สร้างค่าด้วย: openssl rand -hex 32
SESSION_SECRET=<paste ผลลัพธ์จาก openssl rand -hex 32 ที่นี่>
# Optional (ปกติไม่ต้องตั้ง): ระบบเลือก Secure cookie ให้เองตามโปรโตคอล http/https ที่ผู้ใช้เปิด
# SESSION_COOKIE_SECURE=true

# Login page defaults (ERP provider code + preferred database code — get real values from the team)
LOGIN_DEFAULT_PROVIDER_CODE=<รหัสผู้ให้บริการ ตอนเข้าหน้าโปรแกรม SML>
LOGIN_PREFERRED_DB_CODE=<รหัส db ตัวจริงของ production>
```

> DB จะ connect ผ่าน network ไปยัง SMLERP server โดยตรง (ไม่ได้รัน PostgreSQL ใน container)
> `SESSION_COOKIE_SECURE` ไม่ต้องตั้ง: ระบบตรวจโปรโตคอลที่ผู้ใช้เปิดเอง (HTTP เช่น `http://192.168.x.x:3618` ได้ cookie ปกติ; HTTPS หรือผ่าน reverse proxy ที่ส่ง `x-forwarded-proto: https` ได้ Secure cookie) — ตั้ง `true`/`false` เฉพาะเมื่อต้องการบังคับ
> **Reverse proxy:** ถ้ารันหลัง reverse proxy (nginx, Caddy ฯลฯ) แอปใช้ header `x-forwarded-proto` (เลือก Secure cookie และ http/https ของ redirect) และ `x-forwarded-host` (host ที่ใช้ใน redirect ไปหน้า login; ถ้าไม่มีจะใช้ `Host`) — ให้ proxy ส่งสอง header นี้ และเขียนทับค่าที่ client ส่งมาเอง; ค่า host ที่ไม่ใช่ `host[:port]` ธรรมดาจะถูกเมินและใช้ค่าจาก Next แทน

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
