import { cn } from "@/lib/utils";

type StatusChipProps = {
  children: React.ReactNode;
  variant?: "success" | "warning" | "danger" | "info" | "neutral";
  className?: string;
};

const variants = {
  success: "bg-success-soft text-success",
  warning: "bg-warning-soft text-warning",
  danger: "bg-danger-soft text-danger",
  info: "bg-info-soft text-info",
  neutral: "bg-surface-muted text-text-secondary"
};

export function StatusChip({
  children,
  variant = "neutral",
  className
}: StatusChipProps) {
  return (
    <span
      className={cn(
        "label-caps inline-flex h-[22px] items-center gap-1 rounded-pill px-2",
        variants[variant],
        className
      )}
    >
      <span className="h-1.5 w-1.5 rounded-pill bg-current" aria-hidden="true" />
      {children}
    </span>
  );
}
