---
name: 'SML MIS — CafeBlend Executive'
version: '2.9'
owner: 'SML MIS AI'
audience: 'AI agents + frontend devs'
last-updated: '2026-05-20'
spec-locked: false   # set true หลัง v2.0 ผ่านรีวิว — ห้ามแก้ token/scale โดยไม่มี RFC
modes: [light, dark]
font-stacks:
  ui:      ['Work Sans', 'Noto Sans Thai', 'system-ui', 'sans-serif']
  display: ['DM Serif Display', 'Georgia', 'serif']
  numeric: ['IBM Plex Mono', 'system-ui', 'sans-serif']            # ใช้ tabular-nums เสมอ
  mono:    ['IBM Plex Mono', 'ui-monospace', 'SFMono-Regular', 'monospace']
tokens:
  light:
    # ── Surfaces ──
    bg:               '#FDF6EC'
    surface:          '#FFFFFF'
    surface-elevated: '#FFFFFF'
    surface-muted:    '#FAF0E1'
    surface-sunken:   '#F0E6D6'
    # ── Borders ──
    border:           '#EDE0D0'
    border-strong:    '#D9C6B2'
    # ── Text ──
    text-primary:     '#3E2723'
    text-secondary:   '#6D4C41'
    text-tertiary:    '#8D7B6E'
    text-on-accent:   '#FFFFFF'
    # ── Accent ──
    accent:           '#8B5E3C'
    accent-soft:      '#EFE0D0'
    accent-strong:    '#6B4226'
    # ── Semantic ──
    success:          '#059669'
    success-soft:     '#DCFCE7'
    warning:          '#D97706'
    warning-soft:     '#FEF3C7'
    danger:           '#EF4444'
    danger-soft:      '#FEE2E2'
    info:             '#5B6CFF'
    info-soft:        '#EDE9FE'
    # ── Chart palette (fixed order) ──
    chart-1:          '#8B5E3C'
    chart-2:          '#C4956A'
    chart-3:          '#E8C49A'
    chart-4:          '#059669'
    chart-5:          '#D4C5B0'
    chart-grid:       '#E8DDD0'
    chart-axis:       '#A08070'
    # ── Shadows ──
    shadow-micro:     '0 4px 24px rgba(139,94,60,0.10), 0 1px 4px rgba(139,94,60,0.06)'
    shadow-lift:      '0 8px 32px rgba(139,94,60,0.14), 0 2px 8px rgba(139,94,60,0.08)'
    shadow-focus:     '0 0 0 3px rgba(139,94,60,0.20)'
  dark:
    bg:               '#211611'
    surface:          '#2A1C16'
    surface-elevated: '#33231B'
    surface-muted:    '#3A2A22'
    surface-sunken:   '#1A110D'
    border:           '#4A382D'
    border-strong:    '#6E5240'
    text-primary:     '#FDF6EC'
    text-secondary:   '#DECBB8'
    text-tertiary:    '#A99280'
    text-on-accent:   '#211611'
    accent:           '#C4956A'
    accent-soft:      '#4A3428'
    accent-strong:    '#E8C49A'
    success:          '#57D5A2'
    success-soft:     '#113628'
    warning:          '#F0C56B'
    warning-soft:     '#3A2B13'
    danger:           '#FF8A8A'
    danger-soft:      '#3D1B1B'
    info:             '#A8A8FF'
    info-soft:        '#252448'
    chart-1:          '#E8C49A'
    chart-2:          '#C4956A'
    chart-3:          '#F0D7AD'
    chart-4:          '#57D5A2'
    chart-5:          '#8E7463'
    chart-grid:       '#3F2E25'
    chart-axis:       '#A99280'
    shadow-micro:     '0 1px 2px rgba(0,0,0,0.35), 0 4px 16px rgba(0,0,0,0.35)'
    shadow-lift:      '0 8px 28px rgba(0,0,0,0.45), 0 2px 6px rgba(0,0,0,0.30)'
    shadow-focus:     '0 0 0 3px rgba(196,149,106,0.35)'
typography:
  display:    { size: 36px, line: 44px, weight: 600, tracking: -0.02em }
  headline:   { size: 24px, line: 32px, weight: 600, tracking: -0.01em }
  title:      { size: 18px, line: 24px, weight: 600 }
  body:       { size: 14px, line: 20px, weight: 400 }
  body-sm:    { size: 13px, line: 18px, weight: 400 }
  label-caps: { size: 11px, line: 14px, weight: 600, tracking: 0.08em, transform: uppercase }
  kpi-xl:     { size: 40px, line: 44px, weight: 600, tracking: -0.02em, features: ['tnum','lnum','cv11'] }
  kpi-md:     { size: 28px, line: 32px, weight: 600, tracking: -0.01em, features: ['tnum','lnum'] }
  mono-sm:    { size: 12px, line: 16px, weight: 500 }
radius:
  xs: 6px
  sm: 10px
  md: 14px
  lg: 20px
  xl: 28px
  pill: 9999px
spacing:
  unit: 4px
  xs: 4px
  sm: 8px
  md: 12px
  lg: 16px
  xl: 24px
  2xl: 32px
  3xl: 48px
  gutter: 24px
  card-padding: 24px
  card-padding-hero: 32px
  container-padding: 32px
elevation:
  level-0: none                              # background, sidebar
  level-1: shadow-micro                      # card resting (default Bento)
  level-2: shadow-lift                       # card hover, popover, dropdown
  level-3: shadow-lift + border-strong       # modal, command palette, AI panel
motion:
  ease-standard:   'cubic-bezier(0.2, 0.0, 0.0, 1.0)'
  ease-emphasized: 'cubic-bezier(0.2, 0.0, 0.0, 1.2)'
  dur-fast: 120ms
  dur-base: 200ms
  dur-slow: 320ms
breakpoints:
  sm:            640px
  md:            768px
  lg:            1024px
  xl:            1280px
  2xl:           1536px
  max-content:   1680px
  sidebar-width: 224px
  topbar-height: 60px
grid:
  columns-desktop: 12
  columns-tablet:  8
  columns-mobile:  4
  allowed-spans:   [3, 4, 6, 8, 12]          # forbidden: 5, 7, 9, 10, 11
z-index:
  base:     0
  raised:   10
  dropdown: 100
  sticky:   200
  overlay:  300
  modal:    400
  toast:    500
  tooltip:  600
icons:
  set:         'lucide-react'                 # ใช้ icon stroke line ให้ premium/clean และตรงกับ implementation
  size-sm:     16px
  size-md:     20px                          # default inline กับ body
  size-lg:     24px
  style:       'outline, rounded stroke'      # stroke 1.75-2px, ไม่ใช้ filled icon เป็น default
  hover-style: 'same icon + surface/color change'
css-variable-map:
  prefix: '--color-'                         # color tokens — เช่น --color-accent
  # shadow-* → --shadow-{key}    เช่น --shadow-micro
  # radius-* → --radius-{key}    เช่น --radius-lg
  # dur-*    → --dur-{key}       เช่น --dur-base
  # ease-*   → --ease-{key}      เช่น --ease-standard
  light-selector: ':root'
  dark-selector:  'html.dark'                # Tailwind dark mode convention
density:
  default: 'comfortable'                     # MIS / Executive
  alt:     'compact'                         # operator screens (separate scope)
---

# SML MIS — CafeBlend Executive

> AI agent ที่จะ implement หน้านี้ **ต้องอ่าน frontmatter ด้านบนก่อนเขียนโค้ดทุกครั้ง** และ
> **ห้ามใช้ค่าสี/ขนาด/รัศมีที่ไม่ได้ประกาศไว้ใน tokens** ดู [§10 AI Guardrails](#10-ai-guardrails) ก่อนเริ่มงาน

## 0. Screen Implementation Contract

ทุกหน้าจอใหม่ใน SML MIS ต้องเริ่มจาก contract นี้ก่อนออกแบบ:

1. ใช้ theme `CafeBlend Executive`: warm cream background, white floating surfaces, brown accent, subtle shadows
2. ใช้ fixed app shell: topbar 60px อยู่บนสุด, content row ด้านล่าง, scroll เฉพาะ `main`
3. ใช้ sidebar IA เดียวกันทุกหน้า: ระบบหลัก / รอลูกค้าจ้างทำ / AI ในอนาคต
4. ชื่อผู้ใช้, avatar, db, logout อยู่ที่ topbar เท่านั้น
5. Sidebar ซ่อนได้เป็น icon rail กว้าง 64px สูง 80% ของ content row
6. Scrollbar เป็น quiet scrollbar: โปร่งใสตอน idle, บาง ๆ ตอน hover/focus/กำลังเลื่อน
7. หน้า dashboard หรือ report ใช้ Bento grid และ Premium Surface เฉพาะ card สำคัญ
8. ทุกหน้าต้อง browser audit: no horizontal scroll, `window.scrollY = 0`, topbar ไม่หาย, text ไม่ตก

---

## 1. Persona Analysis — ทำไมผู้บริหารต้องการดีไซน์ที่ต่างจากพนักงานทั่วไป

ระบบ ERP ดั้งเดิมถูกออกแบบเพื่อ **"คนคีย์" (Operator / Data Entry)** เป็นหลัก — หน้าจอจึงแน่นด้วย form,
table, dropdown, hotkey เหมาะกับการนั่งทำ 8 ชั่วโมง/วัน แต่ **ขัดกับวิธีที่ผู้บริหารใช้ข้อมูล** ซึ่งเน้น
"ดู → เข้าใจ → ตัดสินใจ" ภายในเวลาไม่กี่วินาที

### 1.1 ตารางเทียบ 10 มิติ

| มิติ | Operator (เน้นคีย์) | Executive (เน้นดู) ← **scope หลัก** |
|---|---|---|
| **เวลาดูแต่ละหน้า** | 5–60 นาที | **5–20 วินาที** |
| **อุปกรณ์หลัก** | Desktop + คีย์บอร์ดเต็ม | **iPad / Phone / TV wall ในห้องประชุม** |
| **ความถี่** | ทุกวัน, ทำซ้ำ | ตอนเช้า / ตอนประชุม / ตอนมีปัญหา |
| **เป้าหมาย** | "ทำธุรกรรมให้สำเร็จ" | **"ตัดสินใจให้ทัน"** |
| **ความอดทนต่อ UI ซับซ้อน** | สูง (เรียนรู้ได้) | **ต่ำมาก** (ไม่มีเวลาเรียน UI) |
| **โหมดอ่าน** | Sequential, อ่านครบทุก field | **Scanning / F-pattern** |
| **ข้อมูลที่ต้องการ** | Raw records | **Aggregate + Δ% + Trend + Context** |
| **Action หลัก** | Create / Edit / Approve | **Drill-down / Ask AI / Share / Export** |
| **ความกลัวสูงสุด** | คีย์ผิด → แก้ยาก | **ตัดสินใจช้า / โดนข้อมูลหลอก** |
| **Density mode** | `compact` (row 36px) | **`comfortable` (row 48px)** ← default ของเอกสารนี้ |

### 1.2 ข้อสรุปต่อการออกแบบ (เชื่อมตรงกับแต่ละแถว)

1. **Typography ใหญ่กว่าปกติ 1 ระดับ** ← (เวลาดู 5–20 วินาที + อ่านจากระยะ TV) — `kpi-xl` ต้อง 40px อ่านได้จาก 1.5 ม.
2. **Whitespace มากกว่าปกติ 1.5×** ← (อุปกรณ์ tablet/wall + scanning) — card padding 24–32px ไม่ใช่ 16px
3. **ใช้สีน้อย, สีเข้มเฉพาะที่ "ต้องสนใจ"** ← (ความอดทนต่ำ + กลัวข้อมูลหลอก) — danger/warning เป็น signal ไม่ใช่ decoration
4. **One screen = one story** ← (โหมดอ่าน scanning) — ไม่มี tab ซ้อน tab, ไม่มี modal ซ้อน modal
5. **Data > Chrome** ← (เป้าหมายตัดสินใจให้ทัน) — ลด UI element ที่ไม่ใช่ข้อมูล (border บาง, ไม่มี gradient ฉูดฉาด)
6. **Trust signals เด่น** ← (กลัวข้อมูลหลอก) — "as of 10:42 น." / "based on 1,284 docs" / source link ต้องเห็น
7. **Action ขั้นต่ำ** ← (action หลักไม่ใช่ create/edit) — ปุ่ม `Drill down` / `Ask AI` / `Share` / `Export` เท่านั้น
8. **Motion ละมุน, ไม่เกิน 200ms** ← (ความอดทนต่ำ) — fade/slide ละมุน, ไม่ bounce, ไม่ parallax

> **Scope ของเอกสารฉบับนี้**: ครอบคลุมเฉพาะ MIS / Executive Dashboard ที่ใช้ `density="comfortable"`
> สำหรับหน้าจอ Operator (คีย์ใบสั่งซื้อ ฯลฯ) จะมี density `compact` overlay — ดู [§12 Density System](#12-density-system)

---

## 2. The Fusion Style — Apple × IBM × Microsoft × CafeBlend → "CafeBlend Executive"

| สำนัก | สิ่งที่ยืมมา | สิ่งที่ทิ้ง |
|---|---|---|
| **Apple HIG** (Numbers, Wallet, App Store) | Clarity · Deference · Depth — whitespace มหาศาล, rounded corners 20–28px, motion ที่ "ไม่รู้สึก" | ความ playful, สี neon, skeuomorphism, dock animation |
| **IBM Carbon** (Watson Studio, Cloud Pak) | Data-first hierarchy · Plex font flavor (Mono สำหรับ label) · grid 12-col แม่นยำ · accessibility AA+ · neutral palette | ความ corporate-stiff, สีฟ้า IBM แท้ที่จัดเกินไป, รูปสี่เหลี่ยมคม |
| **Microsoft Fluent 2** (Loop, Designer, Teams) | Depth ผ่าน Mica/Acrylic · soft shadow layering · semantic motion · accent system | ความ Windows-y, Segoe, สี teal, hover ripple |
| **CafeBlend** (`Docs/*`) | Warm cream canvas · coffee accent · soft card elevation · tactile inset controls | cafe content/photography, cozy copy, decorative excess |

**ตกผลึกเป็น "CafeBlend Executive"** —
- **เงียบ** เหมือน Apple
- **จัดข้อมูล** แบบ IBM
- **ลึก** แบบ Microsoft
- **อบอุ่นพรีเมียม** แบบ CafeBlend แต่ยังเป็น MIS สำหรับผู้บริหาร

### 2.1 หลักการบังคับใช้ 3 ข้อ (mandatory principles)

1. **Quiet by default, loud on demand** — UI เป็น cream/white เกือบทั้งหน้า จนกว่ามี signal จริงจึงค่อยใช้ accent/danger
2. **Numbers are the heroes** — ตัวเลข metric ต้องใหญ่กว่า label ที่กำกับมัน ≥ 2.5× เสมอ
3. **Surfaces over lines** — แยกชั้นด้วย surface elevation + shadow ไม่ใช่เส้น border หนา

### 2.2 Anti-references (อย่าให้หน้านี้ดูเหมือน)

- **ERP legacy UI** (SAP GUI, classic Dynamics) — operator-first, dense form, สี clash
- **Bootstrap admin templates** — gradient ฉูดฉาด, card shadow แรง, สี chart 8 สีรุ้ง
- **Material Design 2 dashboard** — surface สีฟ้า/เขียวเข้ม, ripple effect, FAB
- **Power BI default** — colorful = "data viz" trap

---

## 3. Layout — Bento Grid Blueprint

```
┌─ Topbar (60px) ──────────────────────────────────────────────────────────┐
├─ Sidebar (224px / rail 64px) ─┬─ Main Canvas (max 1680px) ───────────────┤
│  • นำทาง          │                                                       │
│  • Toggle theme   │  ┌─ Page Header (display) ─────────────────────────┐│
│  • Density        │  │  "ภาพรวมกิจการ"                                  ││
│                   │  │  as of 20 พ.ค. 2026 · 10:42 น.   [Filter][AI]   ││
│                   │  └─────────────────────────────────────────────────┘│
│                   │  ┌─ Hero KPI Strip (col-12) ───────────────────────┐│
│                   │  │  ฿42.5M  │  ฿12.8M  │  ฿8.2M  │  3.4M           ││
│                   │  └─────────────────────────────────────────────────┘│
│                   │  ┌─ col-8 Area Chart ─────┐ ┌─ col-4 Doughnut ───┐│
│                   │  │ แนวโน้มรายได้ 12 เดือน  │ │ สัดส่วนรายได้/สาขา  │ │
│                   │  └─────────────────────────┘ └─────────────────────┘│
│                   │  ┌─ col-4 ┐┌─ col-4 ┐┌─ col-4 ────────────────────┐│
│                   │  │ Top SKU││Aging   ││ AI Insight (auto-summary)   ││
│                   │  └────────┘└────────┘└─────────────────────────────┘│
│                   │  ┌─ col-12 Activity Table ─────────────────────────┐│
│                   │  └─────────────────────────────────────────────────┘│
└───────────────────┴──────────────────────────────────────────────────────┘
```

### 3.1 กฎ Bento

- **Desktop (≥ lg, 1024px+)**: 12 คอลัมน์, gutter 24px — อนุญาต span `3, 4, 6, 8, 12`
- **Tablet (md, 768–1023px)**: 8 คอลัมน์, gutter 16px — อนุญาต span `4, 8`
- **Mobile (< md, < 768px)**: stack เดี่ยว, gutter 12px, card padding 16px
- **ห้าม span 5 / 7 / 9 / 10 / 11** — แตกอัตราส่วน Bento
- **Card สูงเท่ากันในแถวเดียวกัน** ใช้ CSS Grid `align-items: stretch` (อย่าใช้ flex height: 100%)
- **Page header** ใช้ `display` typography + as-of timestamp ทุกหน้า
- **Hero strip** เป็น KPI card 4 ใบเรียงแถวเดียวเท่านั้น — ห้ามใส่ chart

### 3.2 Mobile collapse behavior

| Desktop span | → Tablet | → Mobile |
|---|---|---|
| `col-12` | `col-8` (full) | stack |
| `col-8` | `col-8` (full) | stack |
| `col-6` + `col-6` | `col-4` + `col-4` | stack |
| `col-4` × 3 | `col-4` × 2 + drop หรือ wrap | stack |
| `col-3` × 4 (Hero KPI) | `col-4` × 2 (2 แถว) | stack 4 ใบ |

### 3.3 Shell Scroll Containment

Executive pages ต้องมี navigation anchor คงที่ระหว่าง scroll:

- **App shell**: `position: fixed; inset: 0; overflow: hidden` เพื่อห้าม `window/document` scroll
- **Topbar**: อยู่ใน fixed shell, height 60px, shrink-0, ห้ามเป็นส่วนหนึ่งของ scroll container
- **Sidebar**: อยู่ใน content row เดียวกับ main, height 100% ตอน expanded และ 80% ตอน collapsed rail
- **Main**: เป็น scroll container เดียวของ dashboard (`overflow-y: auto; min-height: 0; flex: 1`)
- เมื่อ scroll บน topbar/sidebar ต้องไม่ทำให้ `window.scrollY` เปลี่ยน ค่า scroll ต้องเกิดใน `main` เท่านั้น
- Scrollbar ใน `main` และ expanded sidebar ต้องเป็น quiet scrollbar: ซ่อนสี thumb เป็นค่าเริ่มต้น, แสดงบาง ๆ เฉพาะตอน hover/focus/กำลัง scroll, สีต้องใช้ `accent` alpha ต่ำ ห้ามเข้ม/ดำ/เทา default ของ browser
- ถ้าต้องกัน horizontal overflow ให้แก้ที่ component ที่ล้น ไม่ใช่ซ่อนด้วย wrapper ที่ทำให้ scroll ownership คลุมเครือ

เหตุผล: ผู้บริหารเลื่อนอ่านหน้า dashboard ยาว ๆ แล้วยังต้องรู้ว่าอยู่ฐาน/หน้าไหน และกลับเมนูหลักได้ทันที

### 3.4 Card containment rules

ทุก card ต้องรับผิดชอบไม่ให้ content ภายในดันกรอบหรือสร้าง page horizontal scroll:

- Layout ภายใน card ที่ใช้ `grid/flex` ต้องใส่ `minmax(0, 1fr)` หรือ `min-w-0` ให้ column/child ที่ถือข้อความยาว
- Column ตัวเลข, badge, percent, icon ต้อง `shrink-0` และจัดชิดขวาด้วย `tabular-nums`
- ห้ามตัดสิน responsive layout จาก viewport width อย่างเดียวเมื่อ card เป็น `col-3/col-4`; ต้องคิดจาก **actual card width**
- Doughnut/legend, chart/legend, table/action list ใน card แคบต้อง stack ก่อน แล้วค่อยวางข้างกันเฉพาะเมื่อพื้นที่จริงพอ
- ชื่อสินค้า/ลูกค้า/เอกสารที่ยาวควรใช้ `line-clamp-2` เป็น default สำหรับ executive list; ใช้ `truncate` หนึ่งบรรทัดเฉพาะ metadata/code

---

## 4. Color System

### 4.1 Semantic over visual

ใช้ token ตามความหมาย — `--color-danger` ไม่ใช่ `--color-red` — เพื่อ swap theme ได้โดยไม่ต้องแก้ component

### 4.2 Light/Dark pairing (สรุป role-by-role)

| Role | Light | Dark | ใช้ตอนไหน |
|---|---|---|---|
| `bg` | `#FDF6EC` | `#211611` | พื้นหลังนอกสุดของ canvas |
| `surface` | `#FFFFFF` | `#2A1C16` | card/nav/topbar resting |
| `surface-elevated` | `#FFFFFF` + shadow | `#33231B` | card hover, popover, dropdown |
| `surface-muted` | `#FAF0E1` | `#3A2A22` | sub-panel, table header, icon button |
| `surface-sunken` | `#F0E6D6` | `#1A110D` | inset input/progress track |
| `border` | `#EDE0D0` | `#4A382D` | divider 1px default |
| `border-strong` | `#D9C6B2` | `#6E5240` | active/selected/L3 modal |

### 4.3 Chart palette — fixed order

ใช้ตามลำดับนี้เสมอ **ห้ามสลับเพื่อความสวยเฉพาะหน้า** (สีพังความหมาย):

| Index | Color | ความหมาย semantic |
|---|---|---|
| `chart-1` | coffee brown | series หลัก, trend ปัจจุบัน, doughnut segment ใหญ่สุด |
| `chart-2` | tan | secondary series, avatar/accent support |
| `chart-3` | warm gold | attention, aging, secondary highlight |
| `chart-4` | green | growth, stable, target met |
| `chart-5` | warm neutral | other/mixed segment |

### 4.4 Contrast guarantees (WCAG verified)

| Pairing | Light ratio | Dark ratio | Standard |
|---|---|---|---|
| `text-primary` on `surface` | 13.8 : 1 | 15.3 : 1 | AAA |
| `text-secondary` on `surface` | 7.6 : 1 | 10.5 : 1 | AAA |
| `text-tertiary` on `surface` | 4.0 : 1 | 5.6 : 1 | AA large in light / AA in dark |
| `text-on-accent` on `accent` | 5.6 : 1 | 6.6 : 1 | AA |
| `chart-*` fill on `chart-grid` | ≥ 3.0 : 1 | ≥ 3.0 : 1 | UI components |

### 4.5 Prohibitions (per role)

- ❌ ห้ามใช้ `chart-*` เป็นสี text หรือ background ของส่วนที่ไม่ใช่ data viz
- ❌ ห้ามใช้ `accent` กับข้อความ body ที่ไม่ใช่ link/CTA
- ❌ ห้ามใช้ `danger` กับ chart series ปกติ (สงวนไว้สำหรับ alert/missed-target เท่านั้น)
- ❌ ห้ามใช้ pure black `#000` หรือ pure white `#FFF` กับ text — ใช้ token เท่านั้น

---

## 5. Typography

### 5.1 Font rationale

- **Work Sans** — modern, friendly, อ่านง่ายใน dashboard และเข้ากับ warm surface
- **DM Serif Display** — ใช้เฉพาะ page title / login hero / greeting headline เพื่อให้ดู premium
- **Noto Sans Thai fallback** — รองรับภาษาไทยยาว ๆ โดยไม่ทำให้ layout เพี้ยน
- **IBM Plex Mono** — ใช้กับ `label-caps`, KPI value, metadata/code ให้ตัวเลขนิ่ง

```css
font-family: 'Work Sans', 'Noto Sans Thai', system-ui, sans-serif;
font-feature-settings: 'cv11', 'ss01', 'ss03';
```

### 5.2 Scale & use-case

| Token | Size / Line | Use |
|---|---|---|
| `display` | 34–36 / 42–44, 400, **DM Serif Display** | Page title / hero headline only |
| `headline` | 24 / 32, 600 | Section title |
| `title` | 18 / 24, 600 | Card title |
| `body` | 14 / 20, 400 | เนื้อหาทั่วไป |
| `body-sm` | 13 / 18, 400 | Caption, helper, "vs. เดือนก่อน" |
| `label-caps` | 11 / 14, 600, uppercase, tracking 0.08em, **Plex Mono** | Chart axis, KPI label |
| `kpi-xl` | 28–32 / 32, 500, **IBM Plex Mono**, tnum+lnum | KPI strip value |
| `kpi-md` | 24–28 / 32, 600, tnum+lnum | Secondary KPI value |
| `mono-sm` | 12 / 16, 500, **Plex Mono** | inline code, doc number, source ref |

### 5.3 กฎสำคัญ

1. **ตัวเลข metric ทุกที่** ต้อง `font-variant-numeric: tabular-nums`
2. **Allowed weights** = `[400, 500, 600]` — ห้าม 300 (อ่านยาก) / 700+ (loud เกิน)
3. **Thai + EN ผสมในประโยคเดียว** ใช้ Work Sans + Noto Sans Thai fallback เดียวกัน
4. **ห้ามเพิ่ม scale ใหม่** ที่ไม่อยู่ในตาราง — ถ้าจำเป็นต้องเพิ่ม → RFC
5. **`label-caps` ต้องเป็น Plex Mono เสมอ** — ฟีล metadata, แยกตัวจาก body text

---

## 6. Component Catalog

ทุก component spec ใช้ ASCII wireframe + token references (ไม่ใส่ hex hard-code)

### 6.1 KPI Card (Hero & Standard)

```
┌────────────────────────────────────┐
│  รายได้รวม              [ → ]     │  ← label-caps + drill icon
│                                    │
│  ฿42.5M  +8.4% ↑                  │  ← kpi-xl + success color
│  vs. เดือนก่อน                    │  ← body-sm + text-tertiary
│  ▁▂▃▅▆▇▆▅▆▇                       │  ← sparkline 32px, chart-1
└────────────────────────────────────┘
```

| Property | Standard | Hero |
|---|---|---|
| Padding | `card-padding` (24px) | `card-padding-hero` (32px) |
| Radius | `lg` (20px) | `xl` (28px) |
| Shadow rest | `level-1` (shadow-micro) | `level-1` |
| Shadow hover | `level-2` (shadow-lift) + translateY(-2px) | same |
| Value typography | `kpi-md` | `kpi-xl` |
| Delta color | `success` (↑) / `danger` (↓) | same |
| Sparkline | 32px height, stroke 1.5px, `chart-1`, no fill | 40px, fill alpha 0.2 |
| Drill icon | `arrow_outward` 16px, color `text-tertiary` → `accent` on hover | same |

#### 6.1.1 Executive KPI Strip

หน้า dashboard/report ระดับผู้บริหารต้องใช้ KPI strip เป็น card เดียว 4 ช่อง แทนการวาง KPI card แยกกัน:

```
┌──────────────────────────────────────────────────────────────────┐
│  ยอดขาย          │ กำไรขั้นต้น      │ เฉลี่ย/บิล      │ ลูกหนี้คงค้าง │
│  3,585,463       │ 1,272,016        │ 16,677          │ 0              │
│  บาท · 215 บิล   │ บาท · GP 35.5%   │ บาท/บิล         │ DSO 0.0 วัน    │
│  -87.1%          │ -99.8%           │ -39.8%          │ เกินกำหนด 0    │
└──────────────────────────────────────────────────────────────────┘
```

- Strip เป็น `col-12`, bg `premium-surface`, radius `lg`, shadow `micro`
- desktop ≥ xl: 4 columns, divider 1px `border`
- tablet: 2×2, mobile: stack
- แต่ละช่องต้องมี icon 13–15px, label, value, context, chip
- value ใช้ `IBM Plex Mono`, `tabular-nums`, ขนาด 28–32px เพื่อไม่ดันช่อง
- หาก delta/GP basis ผิดปกติ ให้แสดงข้อความอ่านง่าย เช่น `GP% ฐานผิดปกติ` แทนตัวเลข pp ที่ใหญ่เกินจริง

### 6.2 Area Chart

```
┌─────────────────────────────────────────────────┐
│  TITLE                       UNIT · AS-OF       │
│                                                 │
│  ▲                                              │
│  │       ╱╲      ╱─╲                            │
│  │      ╱  ╲   ╱    ╲                           │
│  │ ╱╲  ╱    ╲ ╱                                 │
│  │╱  ╲╱      ╲                                  │
│  └───────────────────────────────►              │
│   ม.ค. ก.พ. มี.ค. เม.ย. พ.ค.                    │
└─────────────────────────────────────────────────┘
```

- **SVG only** (ไม่ใช้ canvas เพื่อให้ inspect/copy ค่าได้)
- gradient fill: `chart-1` alpha 0.25 → 0 (vertical)
- stroke 2px `chart-1`, line-cap round
- grid horizontal 4 เส้น สี `chart-grid`
- axis label `label-caps`, color `chart-axis`
- hover: vertical guideline (1px dashed `border-strong`) + tooltip card (`surface-elevated`, shadow `level-2`, radius `sm`)
- ❌ ห้าม 3D, shadow ใต้เส้น, dot marker ทุกจุด (เฉพาะ hover เท่านั้น)

### 6.3 Doughnut Chart

```
        ┌─────────┐
        │    ◯    │
        │   ◯ ◯   │   center: total + label-caps
        │  ◯ × ◯  │   inner-radius ≥ 60%
        │   ◯ ◯   │   gap 2px (สี bg)
        │    ◯    │
        └─────────┘
        ● สาขาเหนือ  42%
        ● สาขากลาง  28%
        ● สาขาใต้   18%
        ● อื่น ๆ      12%
```

- inner-radius **≥ 60%** ของ outer (ให้ดู airy)
- gap ระหว่าง segment 2px (สี = `bg` หรือ `surface` ตามพื้น)
- center text: total `kpi-md` + label `label-caps`
- legend อยู่ล่างหรือขวา: dot 8px + label `body-sm`
- ใช้ `chart-1..5` ตามลำดับขนาด segment (ใหญ่ → เล็ก)

### 6.4 Bar Chart

```
  ▆                                
  ▆    ▆      ▆         
  ▆    ▆      ▆    ▆
  ▆    ▆      ▆    ▆    ▆
  ▆    ▆      ▆    ▆    ▆
  Q1   Q2     Q3   Q4   Q5
```

- corner radius บนสุด `xs` (6px), ล่างเหลี่ยม
- bar width 24–48px (auto fit)
- ไม่มี border, ใช้ fill `chart-*` ตามความหมาย
- value label ด้านบน bar (`label-caps`, color `text-secondary`)

### 6.5 Buttons

| Variant | Bg | Text | Border | Radius |
|---|---|---|---|---|
| **Primary** | `accent` | `text-on-accent` | none | `sm` (10px) |
| **Secondary** | `surface` | `text-primary` | 1px `border` | `sm` |
| **Ghost** | transparent | `text-secondary` | none | `sm` |
| **Danger** | `danger` | white | none | `sm` |

| State | Behavior |
|---|---|
| hover | bg → `accent-strong` (primary) / `surface-muted` (sec/ghost) |
| active | translateY(1px), shadow ลด 1 ระดับ |
| disabled | opacity 0.4, cursor not-allowed |
| focus | `shadow-focus` (3px ring, accent alpha 0.25) |

- height: **36px** (default) · **32px** (compact) · **44px** (hero CTA)
- padding-x: 16px (default), 12px (compact), 24px (hero)
- icon-only: square 36×36, radius `sm`

### 6.6 Sidebar Nav Item

```
┌──────────────────────────┐
│ [⬚]  ภาพรวมกิจการ        │   ← icon 20px + body
└──────────────────────────┘
```

- height 36–40px, padding-x 10–12px, radius `md`
- icon 15–17px ใช้ `lucide-react` rounded/outlined style
- label `body-sm` 13px
- **active**: bg `accent`, text `text-on-accent`, icon currentColor — **ไม่มี left bar**
- **hover**: bg `surface-muted`
- **disabled**: opacity 0.4

#### 6.6.1 Sidebar Information Architecture

Sidebar ต้องแบ่งกลุ่มด้วยเส้นคั่นแบบ floating sidebar ใน `Docs/dashboard.html` ห้ามเรียงเมนูทุกประเภทติดกันเป็น list เดียว:

1. **ระบบหลัก**: Dashboard, ระบบสินค้า, ระบบซื้อ, ระบบขาย, ระบบเจ้าหนี้, ระบบลูกหนี้, ระบบเงินสด/ธนาคาร, ระบบบัญชี
2. **รอลูกค้าจ้างทำ**: dashboard/report ที่ยังเป็น placeholder หรือรอ scope งานเพิ่ม
3. **AI ในอนาคต**: Alert สมอง, แนะนำระบบ, ค้นหาข้อมูล, ผู้ช่วย AI, เลขาส่วนตัว, KMS, MCP Endpoint, Graph สมอง, Object Storage

กลุ่ม 2 และ 3 ใช้ disabled item พร้อม badge สั้น (`รอ`, `AI`) จนกว่าจะมี route/function จริง ห้ามให้ผู้ใช้คิดว่าคลิกแล้วใช้งานได้แล้ว

#### 6.6.2 Collapsed Icon Rail

Sidebar ต้องซ่อนได้เพื่อเพิ่มพื้นที่อ่าน dashboard:

- expanded width: ประมาณ 224px
- collapsed width: ประมาณ 64px
- collapsed height: ประมาณ 80% ของ content row และ `self-center` เพื่อเหลือ breathing space บน/ล่างราว 10% หลังหัก topbar แล้ว
- collapsed แสดงเฉพาะ icon, ไม่แสดง label/badge บนหน้า แต่ต้องมี `aria-label` และ `title`
- collapsed rail มีปุ่มลูกศรเปิดกลับ และปุ่มเลื่อนขึ้น/ลงสำหรับรายการที่ยาว
- ห้าม animate รายการทุกแถวแยกกัน ให้ transition เฉพาะ width/height/padding ของ container
- expanded ใช้ native scroll ได้ แต่ collapsed ใช้ scrollbar ซ่อนและควบคุมด้วยลูกศร

#### 6.6.3 Identity Placement

ชื่อผู้ใช้และ avatar ต้องอยู่ที่ **Topbar เท่านั้น** เพราะเป็น global session context คู่กับฐานข้อมูล/เวลา/ปุ่ม logout:

- Topbar แสดง greeting, user name, avatar, db name/db code, logout
- Sidebar เป็น navigation-only ห้ามแสดงชื่อผู้ใช้ซ้ำ
- Collapsed rail ห้ามมี avatar user ซ้ำ เพราะทำให้สับสนว่าเป็นเมนูหรือ profile
- ถ้าต้องมี profile menu ในอนาคต ให้เปิดจาก avatar บน Topbar

### 6.7 Topbar

```
┌─ Topbar 60px ──────────────────────────────────────────────────┐
│ [Logo] SML MIS AI | สวัสดี, User · date/db      [ช่วง] [☀][↻][🔔][S][ออก] │
└────────────────────────────────────────────────────────────────┘
```

- height 60px, bg `surface`, radius `lg`, shadow `micro`, no full-width border-bottom
- topbar อยู่ใน fixed shell และไม่ scroll ไปกับเนื้อหา
- left: logo mark + `SML MIS AI`
- center: greeting ด้วย `DM Serif Display`, user name accent, date/time/db code เป็น body-sm
- right: period segmented control, theme toggle, refresh, notification, avatar, logout
- icon buttons bg `surface-muted`, hover `surface-sunken`, icon color `text-tertiary → accent`
- ห้ามแสดงชื่อ user ซ้ำใน sidebar; topbar เป็น global session context เดียว

### 6.8 Data Table

```
┌────────────┬─────────┬──────────┬────────┐
│ DOC NO     │ DATE    │ AMOUNT   │ STATUS │  ← header surface-muted + label-caps
├────────────┼─────────┼──────────┼────────┤
│ IV-2026-1  │ 20 พ.ค. │  ฿12,500 │ ●      │  ← row hover surface-muted
│ IV-2026-2  │ 20 พ.ค. │   ฿8,200 │ ●      │
└────────────┴─────────┴──────────┴────────┘
```

- header bg `surface-muted`, text `label-caps`, height 40px
- row height 48px (comfortable) / 36px (compact)
- divider 1px `border` between rows
- ตัวเลข **ชิดขวา** + `tabular-nums`
- status dot 8px + color semantic (success/warning/danger)
- selected row: bg `accent-soft`, no border change

### 6.9 AI Insight Card (signature component)

```
┌────────────────────────────────────┐
│ ✦ AI สรุป                  [ × ]  │  ← chip + dismiss
│                                    │
│  ยอดขายภาคเหนือเดือนนี้ลดลง 12%    │  ← title
│  เทียบเดือนก่อน สาเหตุหลักมา        │
│  จาก SKU "ข้าวหอม 5kg" ที่ขาด...   │  ← body-sm
│                                    │
│  [ ดูรายละเอียด ]                  │  ← secondary button
│  ── ข้อมูล ณ 10:42 น. · 1,284 docs │  ← body-sm tertiary
└────────────────────────────────────┘
```

- bg `accent-soft` (signature) — เป็นจุดเดียวที่ใช้ accent-soft เป็น card bg
- icon `Sparkles` จาก `lucide-react`, color `accent`
- chip "AI สรุป" มุมขวาบน — bg `surface`, text `accent`, radius `pill`, `label-caps`
- title `title`, body `body-sm`, color `text-primary`/`text-secondary`
- **ต้องมี disclaimer ระยะเวลาข้อมูล + จำนวน source** ทุกใบ

### 6.10 Badge / Status Chip

| Variant | Bg | Text | Border |
|---|---|---|---|
| Success | `success-soft` | `success` | none |
| Warning | `warning-soft` | `warning` | none |
| Danger | `danger-soft` | `danger` | none |
| Info | `info-soft` | `info` | none |
| Neutral | `surface-muted` | `text-secondary` | none |

- height 22px, padding-x 8px, radius `pill`
- typography `label-caps`
- optional dot 6px ซ้ายสุด

### 6.11 Empty State

```
┌────────────────────────────────────┐
│                                    │
│              ⬚                    │  ← icon 40px text-tertiary
│                                    │
│       ไม่มีข้อมูลในช่วงนี้           │  ← title
│   ลองเปลี่ยนช่วงเวลาหรือตัวกรอง     │  ← body-sm text-secondary
│                                    │
│         [ ล้างตัวกรอง ]            │  ← secondary button
│                                    │
└────────────────────────────────────┘
```

- centered, padding `3xl` (48px)
- icon 40px จาก `lucide-react`, color `text-tertiary`
- title `title`, body `body-sm`, CTA secondary button

### 6.12 Skeleton Loader

- shape เดียวกับ component ที่กำลังโหลด (radius/dimension เท่ากัน)
- bg animated gradient: `surface-muted` → `surface-sunken` → `surface-muted`
- animation `shimmer 1.5s linear infinite`
- ❌ ไม่ animate ใน `prefers-reduced-motion` (เหลือ static `surface-muted`)

### 6.13 Error State

```
┌────────────────────────────────────┐
│ ⚠ โหลดข้อมูลไม่สำเร็จ              │
│   network timeout · ลองอีกครั้ง    │
│   [ ลองใหม่ ]   [ รายงานปัญหา ]    │
└────────────────────────────────────┘
```

- bg `danger-soft`, border 1px `danger`, radius `md`
- icon `AlertTriangle` จาก `lucide-react`, color `danger`
- title `title`, body `body-sm`, message `mono-sm` สำหรับ error code/technical

### 6.14 Loading Overlay

- bg `surface` at opacity 0.8 (light) / 0.85 (dark)
- centered spinner — circle 32px stroke 2px `accent`, rotate 0.8s linear infinite
- **show หลัง 300ms delay** เพื่อไม่ flash สำหรับ load เร็ว ๆ
- z-index `overlay` (300)

### 6.15 Premium Surface Card / Insight Surface

ใช้เมื่ออยากให้ card ดูพรีเมียมแบบ editorial analytics โดย **เอาความรู้สึกจาก reference มา ไม่เอา palette ของ reference มา**

```
┌────────────────────────────────────┐
│  TITLE                     [ ↗ ]   │
│                                    │
│  42.5M                             │
│  soft highlight / gentle chart     │
│                                    │
└────────────────────────────────────┘
```

**Intent**

- ทำให้บาง card มีมิติแบบ premium, calm, airy
- ใช้กับ card ที่ต้องนำสายตา เช่น KPI hero, AI Insight, Action recommendation, chart highlight
- สีหลักยังเป็นธีม SML MIS: `surface`, `surface-muted`, `accent-soft`, `info-soft`, semantic soft tokens

**Allowed treatment**

- background base ต้องเป็น `surface` หรือ `surface-muted`
- gradient ต้องใช้ token เท่านั้น เช่น `surface → accent-soft`, `surface → info-soft`, `surface → warning-soft`
- gradient opacity ต้องเบา: light mode ไม่ควรเกิน 0.35 ของ soft token, dark mode ไม่ควรเกิน 0.22
- ใช้ได้เฉพาะ **highlight card / insight card / chart fill / empty premium panel** ไม่ใช่ทุก card
- ใน 1 viewport ห้ามมี premium surface เกิน 30% ของจำนวน card ที่มองเห็น เพื่อรักษา quiet dashboard
- border/shadow ยังใช้ `level-1`/`level-2` เท่านั้น ห้ามเพิ่ม glow หรือ shadow สีจัด

**Must not**

- ห้ามเปลี่ยนทั้งหน้าให้เป็น beige/cream/yellow หรือโทน reference
- ห้ามใช้ gradient ฉูดฉาด, radial blob, orb, bokeh, glassmorphism หนัก
- ห้ามใช้ `chart-*` เป็นพื้นหลัง card ยกเว้นเป็น chart mark/fill จริง
- ห้ามลด contrast ของ text; ต้องอ่านผ่าน WCAG เหมือน surface ปกติ

ชื่อ style สำหรับ implement: **CafeBlend Executive + Premium Surface**

---

## 7. Elevation & Depth

| Level | Shadow | Border | Use |
|---|---|---|---|
| **L0** | none | none | background, sidebar |
| **L1** | `shadow-micro` | none | card resting (default Bento) |
| **L2** | `shadow-lift` | none | card hover, popover, dropdown, tooltip |
| **L3** | `shadow-lift` | 1px `border-strong` | modal, command palette, AI side panel |

- **Hover lift**: card L1 → L2 + translateY(-2px), duration `dur-base` (200ms), ease `ease-standard`
- **Dark mode**: shadow ใช้ alpha สูงกว่า light **≥ 2×** (token ตั้งไว้แล้ว) — เพื่อให้ depth ยังอ่านออก
- ❌ ห้ามใช้ shadow level > L3

---

## 8. Motion

| Animation | Property | Duration | Easing |
|---|---|---|---|
| Hover card | shadow L1→L2 + translateY(-2px) | `dur-base` (200ms) | `ease-standard` |
| Tooltip enter | opacity 0→1 + translateY(4px→0) | `dur-fast` (120ms) | `ease-standard` |
| Theme crossfade | bg + color | `dur-base` | `ease-standard` |
| Modal enter | opacity 0→1 + scale(0.96→1) | `dur-slow` (320ms) | `ease-emphasized` |
| Dropdown enter | opacity 0→1 + translateY(-4px→0) | `dur-fast` | `ease-standard` |
| Chart draw | path stroke-dashoffset | `dur-slow` | `ease-standard` |

### 8.1 Reduced motion strategy

ใน `@media (prefers-reduced-motion: reduce)`:
- ตัด translate/scale ทั้งหมด — เหลือเฉพาะ `opacity` crossfade
- chart draw → instant
- skeleton shimmer → static muted bg
- **ห้ามตัด focus ring transition** (a11y)

### 8.2 Do-not-animate list

- ❌ Page transitions — executive ต้องการเห็นเร็ว
- ❌ Number ticker count-up เกิน 200ms — irritating
- ❌ Sidebar expand/collapse ที่ animate ทุก nav item
- ❌ Bounce / spring overshoot ในทุกกรณี (ยกเว้น `ease-emphasized` ใน modal)

**Max duration cap = 320ms (dur-slow)** สำหรับ executive UI

---

## 9. Accessibility

- ✅ Keyboard navigation ทุก action — Tab/Shift+Tab, Arrow ใน listbox/menu, Enter/Space activate
- ✅ Focus visible เสมอ — `shadow-focus` (3px ring) — **ห้ามตัด outline โดยไม่ใส่ ring แทน**
- ✅ aria-label ทุก icon-only button (เช่น theme toggle, drill icon)
- ✅ Chart มี table fallback สำหรับ screen reader (`<table aria-label>` hidden ใต้ chart)
- ✅ Hidden accessibility fallback เช่น `sr-only table` ต้องอยู่ใน wrapper 1px/absolute ที่ไม่สร้าง intrinsic width และไม่ทำให้หน้าเกิด horizontal scroll
- ✅ Contrast ผ่าน WCAG AA ขั้นต่ำ, AAA สำหรับ `text-primary`
- ✅ **Color-not-alone**: ↑/↓ icon มาคู่กับสีเสมอ, status ใช้ dot + label, ไม่ใช้สีเดี่ยวสื่อ
- ✅ Touch target ขั้นต่ำ **44×44px** บน mobile (button hero, nav)
- ✅ `lang="th"` ที่ `<html>` + `lang="en"` ที่ inline EN

---

## 10. AI Guardrails

> **อ่านส่วนนี้ก่อนเขียนโค้ดทุกครั้ง** ถ้าผิดแม้แต่ข้อเดียว = ออกนอก design system

### 10.1 Must

1. ✅ ใช้เฉพาะค่าจาก `tokens.light` / `tokens.dark` — ห้ามใส่ hex อื่นในไฟล์ component
2. ✅ ทุก surface ต้องประกาศ `bg-{token}` + `text-{token}` คู่กัน ไม่ทิ้งให้ inherit
3. ✅ ใช้ `tabular-nums` กับทุก metric ตัวเลข
4. ✅ Bento span ต้องเป็น `[3, 4, 6, 8, 12]` เท่านั้น
5. ✅ ใส่ `aria-label`, `role` ครบสำหรับ icon-only / interactive element
6. ✅ ทุก card ต้องมี `header > title + (optional menu)` แล้วค่อย body
7. ✅ Light/Dark toggle ใช้ class `dark` บน `<html>` (Tailwind convention)
8. ✅ chart ใช้ `chart-1..5` ตามลำดับความสำคัญ semantic เสมอ
9. ✅ ทุก KPI ต้องมี **label / value / Δ% / context** (ขาดข้อใดข้อหนึ่ง = incomplete)
10. ✅ ทุก chart ต้องมี **title / unit / as-of timestamp / source**
11. ✅ Executive shell ต้องใช้ fixed AppShell + scroll containment ตาม §3.3
12. ✅ Card internal layout ต้องผ่าน containment rules ใน §3.4
13. ✅ Screen-reader fallback ต้องไม่สร้าง intrinsic width หรือ page overflow
14. ✅ ตรวจ visual QA อย่างน้อย top/mid/bottom viewport ก่อนส่งงาน
15. ✅ ถ้าใช้ความสวยแบบ reference ให้ใช้ §6.15 Premium Surface: อารมณ์พรีเมียมได้ แต่ palette ต้องเป็นของ SML MIS
16. ✅ จอใหม่ต้องใช้ AppShell/Topbar/Sidebar/MainScrollArea pattern เดียวกับ dashboard เว้นแต่ user ขอเป็นหน้าพิเศษ
17. ✅ Scrollbar ต้อง quiet: idle โปร่งใส, ตอน hover/focus/scroll แสดงบาง ๆ เท่านั้น

### 10.2 Must Not

1. ❌ ห้ามใช้สี hex hard-code ใน template (ยกเว้น svg gradient id ที่ reference token)
2. ❌ ห้ามใช้ font-weight 300 / 700 / 800 / 900
3. ❌ ห้ามใช้ border-radius นอก scale (`xs/sm/md/lg/xl/pill`)
4. ❌ ห้ามใช้ gradient เป็นสีพื้นหลัง card ยกเว้น component ที่ประกาศเป็น `Premium Surface` ตาม §6.15 หรือ chart fill เท่านั้น
5. ❌ ห้ามใช้ shadow level > L3
6. ❌ ห้ามใช้สี `chart-*` เป็น text/background ของส่วนที่ไม่ใช่ data viz
7. ❌ ห้ามใส่ emoji ใน UI (executive context)
8. ❌ ห้าม animate ตัวเลข/UI เกิน 320ms (`dur-slow`)
9. ❌ ห้ามมี Bento span `5 / 7 / 9 / 10 / 11`
10. ❌ ห้ามนำ framework UI สำเร็จรูป (MUI, Antd, Bootstrap) เข้ามาแทน token — โทนจะหลุดทันที
11. ❌ ห้ามแก้ page overflow ด้วย wrapper ใหญ่แบบ `overflow-x-hidden` ถ้ายังไม่ได้หา component ที่ล้นจริง
12. ❌ ห้ามวาง legend/label/percent ข้าง chart ใน `col-3/col-4` ถ้ายังไม่ได้ verify ว่าไม่ล้น card
13. ❌ ห้ามใช้ `truncate` กับข้อมูลหลักที่ผู้บริหารต้องรู้ เช่น ชื่อสินค้า/ลูกค้า/สาขา โดยไม่มีทางอ่านต่อ
14. ❌ ห้ามนำโทนสีจาก reference ภายนอกมาแทน token palette ของระบบ เช่น beige/yellow ทั้งหน้า, neon, หรือ warm theme เต็มจอ
15. ❌ ห้ามให้ `window/document` เป็น scroll container ของหน้า app หลัก
16. ❌ ห้ามปล่อย scrollbar default เข้ม ๆ โผล่ตลอดบน main/sidebar

### 10.3 Self-check checklist (วางก่อน commit)

- [ ] ไม่มี hex hard-code นอก DESIGN.md
- [ ] เปิด/ปิด dark mode แล้วยัง contrast ผ่าน WCAG
- [ ] resize ลง mobile แล้วไม่มี horizontal scroll
- [ ] desktop/tablet/mobile ไม่มี page horizontal scroll (`documentElement.scrollWidth === clientWidth`)
- [ ] `window.scrollY === 0` หลัง scroll บน topbar/sidebar; scroll ต้องเกิดใน `main`
- [ ] scroll ไป top/mid/bottom แล้ว topbar/sidebar/rail ยังอยู่ที่เดิมและไม่บังข้อมูล
- [ ] scrollbar ของ main/sidebar idle เป็น transparent และแสดงบาง ๆ ตอน scroll/hover
- [ ] sidebar มี 3 กลุ่มตาม §6.6.1 และซ่อนได้เป็น icon rail ตาม §6.6.2
- [ ] ชื่อ user/avatar อยู่ topbar เท่านั้น ไม่ซ้ำใน sidebar
- [ ] ทุก card ไม่มี content ล้นกรอบ โดยเฉพาะ legend, percent, badge, table, long product/customer names
- [ ] `sr-only` table/fallback ไม่สร้าง intrinsic width หรือ overflow
- [ ] ตัวเลขทุกที่ใช้ `tabular-nums`
- [ ] ทุก KPI มี label / value / Δ% / context
- [ ] ทุก chart มี title / unit / as-of timestamp / source
- [ ] ถ้าใช้ Premium Surface ต้องยังใช้ token palette, ไม่เกิน 30% ของ card ใน viewport, และ text contrast ผ่าน
- [ ] กดที่ card ได้ → drill down
- [ ] เปิดด้วย keyboard ได้ทั้งหน้า
- [ ] AI Insight card มี chip "AI สรุป" + disclaimer
- [ ] แนบ screenshot review อย่างน้อย top/mid/bottom ของหน้า และ mobile 1 viewport

### 10.4 เวลาต้องเพิ่ม component ใหม่

1. หา component ใกล้เคียงใน §6 ก่อน — reuse ถ้าทำได้
2. ถ้าต้องสร้างใหม่จริง → เขียน spec ใน `DESIGN.md` ก่อน implement
3. รักษา 3 หลัก: **Quiet by default · Numbers are heroes · Surfaces over lines**

### 10.5 เวลาเจอ requirement ขัดกับ design

หยุดทันที, ถามลูกพี่ก่อน อย่าเงียบแล้วเดา ตัวอย่าง:

- ขอ component ใช้ red/green เข้มทั้งบล็อก → confirm ก่อน
- ขอ table ที่ต้อง dense มาก (operator-style) → ต้องใช้ `density="compact"` แยกชุด
- ขอกราฟ 3D / radial / chord → ไม่อยู่ใน scope, ต้องคุย
- ขอใช้ font อื่น / สี brand ลูกค้าเฉพาะ → ต้องผ่าน RFC

---

## 11. CSS Variable Map

Token key ใน YAML frontmatter → CSS custom property → Tailwind class

### 11.1 Naming convention

| Token group | YAML key | CSS variable | Tailwind class |
|---|---|---|---|
| Color | `tokens.light.accent` | `--color-accent` | `bg-accent`, `text-accent`, `border-accent` |
| Color | `tokens.light.surface-muted` | `--color-surface-muted` | `bg-surface-muted` |
| Shadow | (top-level) `shadow-micro` | `--shadow-micro` | `shadow-micro` (custom) |
| Radius | `radius.lg` | `--radius-lg` | `rounded-lg` |
| Duration | `motion.dur-base` | `--dur-base` | inline `style="transition-duration:var(--dur-base)"` |
| Easing | `motion.ease-standard` | `--ease-standard` | inline |

### 11.2 Selector convention

```css
:root {                       /* light mode (default) */
  --color-accent: #8B5E3C;
  --color-surface: #FFFFFF;
  /* … */
  --radius-lg: 20px;
  --shadow-micro: 0 4px 24px rgba(139,94,60,0.10), 0 1px 4px rgba(139,94,60,0.06);
  --dur-base: 200ms;
  --ease-standard: cubic-bezier(0.2, 0.0, 0.0, 1.0);
}

html.dark {                   /* dark mode — Tailwind class strategy */
  --color-accent: #C4956A;
  --color-surface: #2A1C16;
  /* … */
}
```

### 11.3 Tailwind theme mapping (snippet)

```ts
// tailwind.config.ts
export default {
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        accent:           'var(--color-accent)',
        'accent-soft':    'var(--color-accent-soft)',
        surface:          'var(--color-surface)',
        'surface-muted':  'var(--color-surface-muted)',
        // … (loop ทุก token จาก frontmatter)
      },
      borderRadius: {
        xs: 'var(--radius-xs)',
        sm: 'var(--radius-sm)',
        md: 'var(--radius-md)',
        lg: 'var(--radius-lg)',
        xl: 'var(--radius-xl)',
      },
      boxShadow: {
        micro: 'var(--shadow-micro)',
        lift:  'var(--shadow-lift)',
        focus: 'var(--shadow-focus)',
      },
      fontFamily: {
        sans: ['Work Sans', 'Noto Sans Thai', 'system-ui', 'sans-serif'],
        display: ['DM Serif Display', 'Georgia', 'serif'],
        mono: ['IBM Plex Mono', 'ui-monospace', 'monospace'],
      },
    },
  },
};
```

---

## 12. Density System

| Property | `comfortable` (Executive — default) | `compact` (Operator — overlay) |
|---|---|---|
| Base font size | 14px | 13px |
| Card padding | 24px (`card-padding`) | 16px |
| Hero card padding | 32px (`card-padding-hero`) | 24px |
| Row height (table) | 48px | 36px |
| Button height | 36px | 32px |
| Icon size default | 20px (`size-md`) | 16px (`size-sm`) |
| Sidebar nav height | 40px | 32px |
| Gutter | 24px | 16px |

**Switch via:** `<html data-density="compact">` — ทุก component อ่านค่าผ่าน CSS variable ที่ override ใต้ selector นี้

> **Scope ของ DESIGN.md ฉบับนี้** = `comfortable` เท่านั้น
> `compact` จะมีไฟล์ overlay แยก (ยังไม่อยู่ใน v2.0)

---

## 13. Component States (สรุปสั้น)

### 13.1 Skeleton Loader
- shape เดียวกับ component ที่กำลังโหลด
- bg gradient `surface-muted` → `surface-sunken` → `surface-muted`
- shimmer 1.5s linear infinite (static ใน reduced-motion)

### 13.2 Empty State
- centered, icon 40px `text-tertiary` + title + body-sm + CTA secondary
- padding `3xl`

### 13.3 Error State
- bg `danger-soft`, border 1px `danger`, icon `error_outline`
- message `body-sm`, technical detail `mono-sm`

### 13.4 Loading Overlay
- `surface` opacity 0.8, spinner 32px `accent`
- show หลัง 300ms delay
- z-index `overlay`

### 13.5 Disabled
- opacity 0.4, cursor not-allowed, pointer-events none
- ❌ ห้าม grey-out ด้วย hex hard-code

---

## 14. File Conventions

- Tokens ถูก consume ผ่าน **CSS variable** (`var(--color-accent)`) — ไม่ใช่ hex hard-code
- ตั้ง CSS variable ที่ `:root` (light) และ `html.dark` (dark) — class strategy
- Tailwind config อ่าน token จาก frontmatter ผ่าน build script (`scripts/extract-tokens.ts`)
- Storybook/component preview เปิด toggle ทั้ง 2 mode เสมอ
- Screenshot สำหรับ design review **ต้องส่งคู่ light + dark**
- Component file ต้องตั้งชื่อตาม catalog §6 (เช่น `KPICard.tsx`, `AIInsightCard.tsx`)
- Shared layout components ต้อง reuse:
  - `src/components/layout/Topbar.tsx`
  - `src/components/layout/Sidebar.tsx`
  - `src/components/layout/MainScrollArea.tsx`
  - `src/app/(main)/layout.tsx`
- ห้ามสร้าง topbar/sidebar ใหม่เฉพาะหน้า เว้นแต่จอนั้นเป็น auth/public page

---

## 15. Changelog + RFC Process

### Changelog

| Version | Date | Change | Reason |
|---|---|---|---|
| 1.0 | 2026-05-20 | Initial design system | Project kickoff |
| **2.0** | **2026-05-20** | เติม `z-index`, `icons`, `css-variable-map`, `allowed-spans`, §11 CSS Variable Map, §12 Density System, §13 Component States, §15 Changelog/RFC + ปรับ §1 Persona เป็นตาราง 10 มิติ + §2 เพิ่ม anti-references | จัดให้ครบตามมาตรฐาน `/design-system-doc` skill |
| **2.1** | **2026-05-20** | เติม §3.3 Shell stickiness, §3.4 Card containment, rule สำหรับ `sr-only` fallback, และ visual QA checklist | กันปัญหา sidebar/topbar ไหล, card content ล้น, hidden table ทำ horizontal overflow, และข้อมูลหลักถูก truncate มากเกินไป |
| **2.2** | **2026-05-20** | เติม §6.15 Premium Surface Card / Insight Surface และ guardrail สำหรับ reference-inspired styling | ให้ dashboard สวยพรีเมียมแบบ reference ได้โดยยังใช้ธีม SML MIS ไม่หลุดเป็น palette ภายนอก |
| **2.3** | **2026-05-20** | ปรับ token/theme เป็น CafeBlend Executive ตามไฟล์ `Docs` และหน้าจอจริง | ให้ login/dashboard ใช้ warm executive surface, DM Serif Display, Work Sans และ KPI strip แบบตัวอย่าง |
| **2.4** | **2026-05-20** | เติม §6.6.1 Sidebar Information Architecture | กัน session ใหม่เอาเมนูระบบหลัก, dashboard placeholder และ AI future มาเรียงปนกัน |
| **2.5** | **2026-05-20** | เติม §6.6.2 Collapsed Icon Rail | ให้ซ่อน sidebar เหลือแท่ง icon rail กลางจอได้ โดยยังเข้าถึงเมนูด้วย tooltip/aria และมีปุ่มลูกศรเลื่อน |
| **2.6** | **2026-05-20** | ปรับ §3.3 เป็น Shell Scroll Containment | กัน scroll บน topbar/sidebar ไปเลื่อน `window` จน topbar/rail หาย ต้องให้ scroll เกิดเฉพาะใน `main` |
| **2.7** | **2026-05-20** | เติม §6.6.3 Identity Placement | กันชื่อ user/avatar ซ้ำทั้ง topbar และ sidebar โดยให้ topbar เป็น global session context และ sidebar เป็น navigation-only |
| **2.8** | **2026-05-20** | เติม quiet scrollbar rule ใน §3.3 | ให้ scrollbar ของ main/sidebar ไม่แสดงเข้มตลอดเวลา แต่แสดงบาง ๆ เฉพาะตอน hover/focus/กำลัง scroll เพื่อคงความ premium |
| **2.9** | **2026-05-20** | Sync DESIGN.md ให้ตรงกับ dashboard จริงและเพิ่ม Screen Implementation Contract | ให้จอถัดไป reuse theme, shell, sidebar, topbar identity, KPI strip, quiet scrollbar และ QA checklist เดียวกัน |

### RFC Process (เมื่อ `spec-locked: true`)

ขั้นตอนแก้ token หรือ scale ที่ถูก lock:

1. เปิด PR ตั้งหัวข้อ `RFC: [change description]`
2. แนบ **screenshot before/after** ทั้ง light + dark
3. ยืนยัน WCAG contrast ยังผ่าน (AA ขั้นต่ำ, AAA สำหรับ text-primary)
4. รอ approval จาก `owner` (SML MIS AI) ก่อน merge
5. Update §15 changelog table + bump `version`

---

## 16. References

### Inspiration (ดึงมา)
- **Apple** — App Store, Wallet, Numbers — whitespace, depth, motion ที่ "ไม่รู้สึก"
- **IBM Carbon** — Watson Studio, Cloud Pak — Plex font, grid discipline, neutral palette
- **Microsoft Fluent 2** — Loop, Designer, Teams admin — Mica/Acrylic depth, semantic motion
- **Linear, Vercel, Stripe Dashboard** — modern SaaS executive feel, KPI density, sparkline pattern

### Anti-references (อย่าให้เหมือน)
- **SAP GUI / classic Dynamics** — operator-first dense form
- **Bootstrap admin templates** — gradient ฉูดฉาด, colorful chart
- **Material Design 2 dashboards** — ripple, FAB, deep brand surface
- **Power BI default theme** — colorful = data viz trap
