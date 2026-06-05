# SML MIS AI — Agent Rules

## Communication
- Communicate with Jead in Thai.
- Address Jead as `ลูกพี่`.
- Keep answers concise and state what was verified from source.

## Source Priority
1. Always read `C:\DEV\smlerp-ai\AGENTS.md` first for SML/SMLERP working rules.
2. Then read `C:\DEV\smlerp-ai\smlerp-for-ai\SKILL.md`.
3. Then use `C:\DEV\smlerp-ai\smlerp-for-ai\INDEX.md` to choose the correct reference file.
4. Treat `C:\DEV\smlerp-ai` as the primary local reference for SMLERP source, schema, report SQL, and dashboard/MIS legacy behavior.

## No-Guess Rule
- Do not guess SMLERP fields, `trans_flag`, SQL, report logic, workflow, or dashboard KPI meaning.
- For any KPI or SQL used in this dashboard, verify against the reference project first.
- If source evidence is not found, say what was checked and what remains unconfirmed.

## Legacy Dashboard References
Use these as reference/benchmark, not as code to blindly copy:
- `C:\DEV\smlerp-ai\smlerp-main\SMLERPDashBoard\`
- `C:\DEV\smlerp-ai\smlerp-main\SMLMIS\`
- `C:\DEV\smlerp-ai\smlerp-main\SMLAccount\menu.json`
- `C:\DEV\smlerp-ai\sml-report-query\`

## Initial Product Direction
- Build a new MIS / AI Agent internal system layer.
- Use SMLERP as source of truth for business data.
- Use legacy dashboard/MIS screens only as reference for available data and behavior.
- The target navigation may include: ภาพรวมกิจการ, สถานะทางการเงิน, Alert สมอง, ออเดอร์จาก LINE, แนะนำระบบ, ค้นหาข้อมูล, ผู้ช่วย AI, เลขาส่วนตัว, คุยกับลูกค้า, KMS, MCP Endpoint, Graph สมอง, Object Storage.

## SQL Safety Rules
- Transaction SQL must filter `last_status = 0` unless intentionally reporting cancelled documents.
- Transaction SQL must specify `trans_flag` when reading document data.
- Join `ic_trans` to `ic_trans_detail` with `(trans_flag, doc_no, doc_date)`.
- Do not mutate SMLERP production data from dashboard code unless explicitly requested.

## Skills & Procedures
- **Adding a new UI Theme:** Follow the steps in `c:\DEV\smlsmartview\smlsmartview\Docs\SKILL_ADD_THEME.md` to ensure global styles, fonts, theme context, and animated backgrounds update correctly.

