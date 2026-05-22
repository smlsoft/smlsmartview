import { StatusChip } from "@/components/ui/status-chip";

type StatusVariant = "success" | "warning" | "danger" | "info" | "neutral";

export type DocumentStatusFields = {
  is_cancel_flag?: boolean;
  last_status: number;
  approve_status?: number;
  doc_success?: number;
  used_status?: number;
  on_hold?: number;
  expire_status?: number;
  not_approve_1?: number;
  user_cancel?: string;
};

function statusValue(value: number | undefined) {
  return value ?? 0;
}

export function DocumentStatusChips({
  doc
}: {
  doc: DocumentStatusFields;
}) {
  const cancelled = doc.last_status === 1;
  const isCancelFlag = doc.is_cancel_flag === true;
  const statusChips: Array<{
    label: string;
    variant: StatusVariant;
  }> = [];

  if (isCancelFlag) {
    statusChips.push({ label: "ใบยกเลิก", variant: "danger" });
  } else if (cancelled) {
    statusChips.push({ label: "ยกเลิก", variant: "danger" });
  } else if (doc.last_status === 2) {
    statusChips.push({ label: "ปิด", variant: "neutral" });
  } else if (statusValue(doc.on_hold) === 1) {
    statusChips.push({ label: "ระงับ", variant: "warning" });
  } else if (statusValue(doc.doc_success) === 1) {
    statusChips.push({ label: "ปิดแล้ว", variant: "success" });
  } else if (statusValue(doc.used_status) === 1) {
    statusChips.push({ label: "ถูกอ้างอิง", variant: "info" });
  } else {
    statusChips.push({ label: "ค้าง", variant: "warning" });
  }

  if (statusValue(doc.not_approve_1) === 1 || statusValue(doc.approve_status) === 2) {
    statusChips.push({ label: "ไม่อนุมัติ", variant: "danger" });
  } else if (!cancelled && !isCancelFlag && statusValue(doc.approve_status) === 1) {
    statusChips.push({ label: "อนุมัติ", variant: "success" });
  }

  if (statusValue(doc.expire_status) === 1) {
    statusChips.push({ label: "หมดอายุ", variant: "warning" });
  }

  return (
    <div className="flex flex-col items-start gap-1.5">
      <div className="flex flex-wrap gap-1.5">
        {statusChips.map((chip) => (
          <StatusChip key={chip.label} variant={chip.variant}>
            {chip.label}
          </StatusChip>
        ))}
      </div>
      {(cancelled || isCancelFlag) && doc.user_cancel ? (
        <p className="text-xs text-text-tertiary">โดย {doc.user_cancel}</p>
      ) : null}
    </div>
  );
}
