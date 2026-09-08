import {
  ArrowDownRight,
  ArrowUpRight,
  BadgeCheck,
  BarChart3,
  Boxes,
  CircleDollarSign,
  LineChart,
  PackageSearch,
  ReceiptText,
  TrendingUp,
  WalletCards
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusChip } from "@/components/ui/status-chip";
import type {
  DebtorRow,
  ExecutiveDashboardData,
  InventoryRiskRow,
  ProductRow,
  RankingRow,
  StoryLine,
  TrendPoint
} from "@/lib/queries/dashboard";
import { cn } from "@/lib/utils";
import { DashboardFilterBar } from "@/components/dashboard/DashboardFilterBar";

type ExecutiveDashboardProps = {
  data: ExecutiveDashboardData;
};

const severityMap = {
  success: "success",
  warning: "warning",
  danger: "danger",
  info: "info",
  neutral: "neutral"
} as const;

function formatAmount(value: number) {
  return new Intl.NumberFormat("th-TH", {
    notation: "compact",
    maximumFractionDigits: 1
  }).format(value);
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("th-TH", {
    maximumFractionDigits: 0
  }).format(value);
}

function formatMoneyFull(value: number) {
  return new Intl.NumberFormat("th-TH", {
    maximumFractionDigits: 0
  }).format(value);
}

function formatPct(value: number | null) {
  if (value === null || !Number.isFinite(value)) return "ไม่มีข้อมูลเทียบ";
  const sign = value >= 0 ? "+" : "";
  return `${sign}${value.toFixed(1)}%`;
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("th-TH", {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "Asia/Bangkok"
  }).format(new Date(`${date}T00:00:00+07:00`));
}

function formatExclusiveEndDate(date: string) {
  const value = new Date(`${date}T00:00:00+07:00`);
  value.setDate(value.getDate() - 1);
  return new Intl.DateTimeFormat("th-TH", {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "Asia/Bangkok"
  }).format(value);
}

function KpiDeltaChip({
  value,
  label
}: {
  value?: number | null;
  label?: string;
}) {
  if (label) {
    return <span className="rounded-pill bg-surface-muted px-2.5 py-1 text-[11px] font-semibold text-text-tertiary">{label}</span>;
  }
  if (value === null || value === undefined) {
    return (
      <span className="inline-flex items-center gap-1 rounded-pill bg-surface-muted px-2.5 py-1 text-[11px] font-semibold tabular-nums text-text-tertiary">
        {formatPct(null)}
      </span>
    );
  }
  const positive = value >= 0;
  const Icon = positive ? ArrowUpRight : ArrowDownRight;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-pill px-2.5 py-1 text-[11px] font-semibold tabular-nums",
        positive ? "bg-success-soft text-success" : "bg-danger-soft text-danger"
      )}
    >
      <Icon className="h-3 w-3" aria-hidden="true" />
      {formatPct(value)}
    </span>
  );
}

function KpiStrip({ data }: { data: ExecutiveDashboardData }) {
  const marginPointDelta =
    data.gross_margin_pct.current - data.gross_margin_pct.previous;
  const marginPointLabel =
    Number.isFinite(marginPointDelta) && Math.abs(marginPointDelta) <= 100
      ? `${marginPointDelta >= 0 ? "+" : ""}${marginPointDelta.toFixed(1)}pp GP%`
      : "GP% ฐานผิดปกติ";
  const kpis = [
    {
      label: "ยอดขาย",
      value: formatMoneyFull(data.sales.current),
      valueClass: "text-accent text-[32px]",
      sub: `บาท · ${formatNumber(data.bills.current)} บิล`,
      icon: ReceiptText,
      delta: data.sales.delta_pct,
      extra: "เทียบปีก่อน"
    },
    {
      label: "กำไรขั้นต้น",
      value: formatMoneyFull(data.gross_profit.current),
      valueClass: "text-warning",
      sub: `บาท · GP ${data.gross_margin_pct.current.toFixed(1)}%`,
      icon: TrendingUp,
      delta: data.gross_profit.delta_pct,
      extra: marginPointLabel
    },
    {
      label: "เฉลี่ย/บิล",
      value: formatMoneyFull(data.avg_bill.current),
      valueClass: "text-text-primary",
      sub: "บาท/บิล",
      icon: BadgeCheck,
      delta: data.avg_bill.delta_pct
    },
    {
      label: "ลูกหนี้คงค้าง",
      value: formatMoneyFull(data.ar_total),
      valueClass: "text-danger",
      sub: `บาท · DSO ${data.dso_days === null ? "-" : data.dso_days.toFixed(1)} วัน`,
      icon: WalletCards,
      alert: `เกินกำหนด ${formatAmount(data.ar_overdue)}`
    }
  ];

  return (
    <Card className="premium-surface col-span-12 overflow-hidden">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((kpi, index) => {
          const Icon = kpi.icon;
          return (
            <div
              key={kpi.label}
              className={cn(
                "min-w-0 border-border px-5 py-5 transition-colors hover:bg-bg/50 md:px-6",
                index < kpis.length - 1 ? "border-b xl:border-b-0 xl:border-r" : "",
                index === 1 ? "sm:border-b xl:border-b-0" : ""
              )}
            >
              <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.06em] text-text-tertiary">
                <Icon className="h-[13px] w-[13px]" aria-hidden="true" />
                <span>{kpi.label}</span>
              </div>
              <p
                className={cn(
                  "mt-3 truncate font-mono text-[28px] font-medium leading-none tracking-normal tabular-nums",
                  kpi.valueClass
                )}
                title={kpi.value}
              >
                {kpi.value}
              </p>
              <p className="mt-2 text-[11.5px] text-text-tertiary">{kpi.sub}</p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {kpi.alert ? (
                  <span className="rounded-pill bg-danger-soft px-2.5 py-1 text-[11px] font-semibold text-danger">
                    {kpi.alert}
                  </span>
                ) : (
                  <>
                    <KpiDeltaChip value={kpi.delta} />
                    {kpi.extra ? <KpiDeltaChip label={kpi.extra} /> : null}
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

function AreaChartCard({
  trend,
  asOf
}: {
  trend: TrendPoint[];
  asOf: string;
}) {
  const width = 720;
  const height = 260;
  const pad = 24;
  const max = Math.max(...trend.map((point) => point.sales), 1);
  const points = trend.map((point, index) => {
    const x =
      pad + (index * (width - pad * 2)) / Math.max(trend.length - 1, 1);
    const y = height - pad - (point.sales / max) * (height - pad * 2);
    return { x, y, ...point };
  });
  const line = points
    .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`)
    .join(" ");
  const area = `${line} L ${width - pad} ${height - pad} L ${pad} ${height - pad} Z`;

  return (
    <Card className="premium-surface col-span-12 p-6 lg:col-span-8">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 p-0">
        <div>
          <CardTitle>แนวโน้มรายได้ 12 เดือน</CardTitle>
          <p className="mt-2 text-sm text-text-secondary">
            หน่วย: มูลค่าจาก total_amount · ข้อมูลถึง {formatDate(asOf)}
          </p>
        </div>
        <StatusChip variant="info">SOURCE 44</StatusChip>
      </CardHeader>
      <CardContent className="p-0 pt-6">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          role="img"
          aria-label="กราฟแนวโน้มยอดขาย 12 เดือน"
          className="h-[260px] w-full overflow-visible"
        >
          {[0, 1, 2, 3].map((lineIndex) => {
            const y = pad + (lineIndex * (height - pad * 2)) / 3;
            return (
              <line
                key={lineIndex}
                x1={pad}
                x2={width - pad}
                y1={y}
                y2={y}
                stroke="var(--color-chart-grid)"
                strokeWidth="1"
              />
            );
          })}
          <path d={area} fill="var(--color-chart-1)" opacity="0.16" />
          <path
            d={line}
            fill="none"
            stroke="var(--color-chart-1)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {points.map((point, index) => (
            <circle
              key={`${point.period}-${index}`}
              cx={point.x}
              cy={point.y}
              r="4"
              fill="var(--color-surface)"
              stroke="var(--color-chart-1)"
              strokeWidth="2"
            />
          ))}
        </svg>
        <div className="mt-3 grid grid-cols-4 gap-2 text-xs text-text-tertiary md:grid-cols-6">
          {trend.filter((_, index) => index % 2 === 0).map((point) => (
            <span key={point.period} className="tabular-nums">
              {point.period}
            </span>
          ))}
        </div>
        <div className="sr-only">
          <table aria-label="ข้อมูลแนวโน้มยอดขาย 12 เดือน">
            <thead>
              <tr>
                <th>เดือน</th>
                <th>ยอดขาย</th>
                <th>กำไรขั้นต้น</th>
              </tr>
            </thead>
            <tbody>
              {trend.map((point) => (
                <tr key={point.period}>
                  <td>{point.period}</td>
                  <td>{point.sales}</td>
                  <td>{point.gross_profit}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

function DoughnutCard({
  rows,
  asOf
}: {
  rows: RankingRow[];
  asOf: string;
}) {
  const colors = [
    "var(--color-chart-1)",
    "var(--color-chart-2)",
    "var(--color-chart-3)",
    "var(--color-chart-4)",
    "var(--color-chart-5)"
  ];
  let cursor = 0;
  const stops =
    rows.length === 0
      ? "var(--color-surface-muted) 0 100%"
      : rows
          .map((row, index) => {
            const start = cursor;
            const end = cursor + (row.pct ?? 0);
            cursor = end;
            return `${colors[index % colors.length]} ${start}% ${end}%`;
          })
          .join(", ");

  return (
    <Card className="premium-surface col-span-12 p-6 lg:col-span-4">
      <CardHeader className="space-y-0 p-0">
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle>สัดส่วนยอดขายตามสาขา</CardTitle>
            <p className="mt-2 text-sm text-text-secondary">
              หน่วย: % ของยอดขาย · ข้อมูลถึง {formatDate(asOf)}
            </p>
          </div>
          <StatusChip variant="neutral">MIX</StatusChip>
        </div>
      </CardHeader>
      <CardContent className="grid gap-6 p-0 pt-6 md:grid-cols-[180px_minmax(0,1fr)] lg:grid-cols-1 2xl:grid-cols-[180px_minmax(0,1fr)]">
        <div
          className="relative mx-auto h-[180px] w-[180px] rounded-pill"
          style={{ background: `conic-gradient(${stops})` }}
          role="img"
          aria-label="กราฟวงกลมสัดส่วนยอดขายตามสาขา"
        >
          <div className="absolute inset-8 grid place-items-center rounded-pill bg-surface text-center">
            <span className="label-caps text-text-tertiary">Top</span>
            <strong className="mt-1 block text-2xl font-semibold tabular-nums text-text-primary">
              {rows.length}
            </strong>
          </div>
        </div>
        <div className="space-y-3">
          {rows.map((row, index) => (
            <div key={`${row.code}-${index}`} className="flex min-w-0 items-center gap-3">
              <span
                className="h-2.5 w-2.5 rounded-pill"
                style={{ background: colors[index % colors.length] }}
                aria-hidden="true"
              />
              <div className="min-w-0 flex-1">
                <p className="line-clamp-2 text-sm font-medium leading-5 text-text-primary">
                  {row.name}
                </p>
                <p className="text-xs text-text-tertiary">
                  {formatAmount(row.amount)}
                </p>
              </div>
              <span className="shrink-0 text-sm font-medium tabular-nums text-text-secondary">
                {(row.pct ?? 0).toFixed(1)}%
              </span>
            </div>
          ))}
        </div>
        <div className="sr-only">
          <table aria-label="ข้อมูลสัดส่วนยอดขายตามสาขา">
            <thead>
              <tr>
                <th>สาขา</th>
                <th>ยอดขาย</th>
                <th>สัดส่วน</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => (
                <tr key={`${row.code}-${index}`}>
                  <td>{row.name}</td>
                  <td>{row.amount}</td>
                  <td>{row.pct ?? 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

function StoryCard({ story, asOf }: { story: StoryLine[]; asOf: string }) {
  return (
    <Card className="premium-surface col-span-12 p-6 lg:col-span-4">
      <CardHeader className="space-y-0 p-0">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="label-caps text-accent">AI สรุป</p>
            <CardTitle className="mt-3">Profit Story</CardTitle>
          </div>
          <StatusChip variant="info">AI</StatusChip>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 p-0 pt-6">
        {story.map((line) => (
          <div key={line.title} className="rounded-md bg-surface p-4">
            <div className="flex items-center gap-2">
              <StatusChip variant={severityMap[line.severity]}>
                {line.severity}
              </StatusChip>
              <h3 className="text-sm font-semibold text-text-primary">
                {line.title}
              </h3>
            </div>
            <p className="mt-3 text-sm leading-5 text-text-secondary">
              {line.body}
            </p>
          </div>
        ))}
        <p className="text-xs leading-5 text-text-tertiary">
          ข้อมูลถึง {formatDate(asOf)} · สรุปจากเอกสารขาย/ซื้อ/หนี้/สต็อกในฐานที่เลือก
        </p>
      </CardContent>
    </Card>
  );
}

function RankingList({
  title,
  rows,
  icon: Icon
}: {
  title: string;
  rows: RankingRow[];
  icon: typeof BarChart3;
}) {
  const max = Math.max(...rows.map((row) => row.amount), 1);
  return (
    <Card className="col-span-12 p-6 lg:col-span-4">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 p-0">
        <CardTitle>{title}</CardTitle>
        <Icon className="h-5 w-5 text-text-tertiary" aria-hidden="true" />
      </CardHeader>
      <CardContent className="space-y-4 p-0 pt-6">
        {rows.map((row, index) => (
          <div key={`${row.code}-${index}`} className="space-y-2">
            <div className="flex items-center justify-between gap-3">
              <p className="line-clamp-2 text-sm font-medium leading-5 text-text-primary">
                {row.name}
              </p>
              <span className="text-sm tabular-nums text-text-secondary">
                {formatAmount(row.amount)}
              </span>
            </div>
            <div className="h-2 rounded-pill bg-surface-sunken">
              <div
                className="h-2 rounded-pill bg-chart-1"
                style={{ width: `${Math.max(4, (row.amount / max) * 100)}%` }}
              />
            </div>
            <p className="label-caps text-text-tertiary">
              {formatNumber(row.count)} docs
            </p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function ProductTable({
  title,
  rows
}: {
  title: string;
  rows: ProductRow[];
}) {
  return (
    <Card className="col-span-12 p-6 lg:col-span-6">
      <CardHeader className="space-y-0 p-0">
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="p-0 pt-6">
        <div className="premium-panel grid grid-cols-[minmax(0,1fr)_76px_76px_56px] gap-2 rounded-sm px-3 py-3">
          <span className="label-caps text-text-tertiary">สินค้า</span>
          <span className="label-caps text-right text-text-tertiary">ยอดขาย</span>
          <span className="label-caps text-right text-text-tertiary">กำไร</span>
          <span className="label-caps text-right text-text-tertiary">GP</span>
        </div>
        <div className="divide-y divide-border">
          {rows.map((row, index) => (
            <div
              key={`${row.code}-${index}`}
              className="grid min-h-16 grid-cols-[minmax(0,1fr)_76px_76px_56px] items-center gap-2 px-3 py-4"
            >
              <div className="min-w-0">
                <p className="line-clamp-2 text-sm font-medium leading-5 text-text-primary">
                  {row.name}
                </p>
                <p className="label-caps mt-1 truncate text-text-tertiary">
                  {row.code}
                </p>
              </div>
              <span className="text-right text-sm tabular-nums text-text-secondary">
                {formatAmount(row.sales)}
              </span>
              <span className="text-right text-sm tabular-nums text-text-secondary">
                {formatAmount(row.gross_profit)}
              </span>
              <span className="text-right text-sm tabular-nums text-text-secondary">
                {row.gross_margin_pct === null
                  ? "-"
                  : `${row.gross_margin_pct.toFixed(1)}%`}
              </span>
            </div>
          ))}
        </div>
        <div className="sr-only">
          <table aria-label={title}>
            <thead>
              <tr>
                <th>สินค้า</th>
                <th>ยอดขาย</th>
                <th>กำไร</th>
                <th>GP</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => (
                <tr key={`${row.code}-${index}`}>
                  <td>{row.name}</td>
                  <td>{row.sales}</td>
                  <td>{row.gross_profit}</td>
                  <td>{row.gross_margin_pct ?? ""}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

function DebtCard({
  title,
  total,
  highlight,
  rows,
  highlightLabel
}: {
  title: string;
  total: number;
  highlight: number;
  rows: DebtorRow[];
  highlightLabel: string;
}) {
  return (
    <Card className="col-span-12 p-6 lg:col-span-6">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 p-0">
        <div>
          <CardTitle>{title}</CardTitle>
          <p className="mt-3 text-3xl font-semibold tabular-nums text-text-primary">
            {formatAmount(total)}
          </p>
        </div>
        <StatusChip variant={highlight > 0 ? "warning" : "success"}>
          {highlightLabel}
        </StatusChip>
      </CardHeader>
      <CardContent className="space-y-4 p-0 pt-6">
        {rows.map((row, index) => (
          <div key={`${row.code}-${index}`} className="flex items-center justify-between gap-4">
            <div className="min-w-0">
              <p className="line-clamp-2 text-sm font-medium leading-5 text-text-primary">
                {row.name}
              </p>
              <p className="label-caps mt-1 text-text-tertiary">
                {formatNumber(row.count)} docs
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium tabular-nums text-text-primary">
                {formatAmount(row.amount)}
              </p>
              <p className="text-xs tabular-nums text-warning">
                {formatAmount(row.overdue_amount)}
              </p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function InventoryList({
  title,
  rows,
  emptyLabel
}: {
  title: string;
  rows: InventoryRiskRow[];
  emptyLabel: string;
}) {
  return (
    <Card className="col-span-12 p-6 lg:col-span-6">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 p-0">
        <CardTitle>{title}</CardTitle>
        <PackageSearch className="h-5 w-5 text-text-tertiary" aria-hidden="true" />
      </CardHeader>
      <CardContent className="space-y-4 p-0 pt-6">
        {rows.length === 0 ? (
          <p className="premium-panel rounded-md p-4 text-sm text-text-secondary">
            {emptyLabel}
          </p>
        ) : (
          rows.map((row, index) => (
            <div key={`${row.code}-${index}`} className="flex items-center justify-between gap-4">
              <div className="min-w-0">
                <p className="line-clamp-2 text-sm font-medium leading-5 text-text-primary">
                  {row.name}
                </p>
                <p className="label-caps mt-1 text-text-tertiary">{row.code}</p>
              </div>
              <div className="text-right">
                <p
                  className={cn(
                    "text-sm font-medium tabular-nums",
                    row.qty < 0 ? "text-danger" : "text-text-primary"
                  )}
                >
                  {row.qty < 0
                    ? `ขาด ${formatNumber(Math.abs(row.qty))}`
                    : `${formatNumber(row.qty)} ${row.unit}`}
                </p>
                <p className="text-xs tabular-nums text-text-tertiary">
                  ขายเดือนนี้ {formatNumber(row.monthly_qty)}
                </p>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}

export function ExecutiveDashboard({ data }: ExecutiveDashboardProps) {
  const secondaryMetrics = [
    {
      label: "ต้นทุนขาย",
      value: data.cost.current,
      delta: data.cost.delta_pct,
      icon: CircleDollarSign,
      format: "amount"
    },
    {
      label: "จำนวนบิล",
      value: data.bills.current,
      delta: data.bills.delta_pct,
      icon: BadgeCheck,
      format: "count"
    },
    {
      label: "ส่วนลดรวม",
      value: data.discount.current,
      delta: data.discount.delta_pct,
      icon: ReceiptText,
      format: "amount"
    },
    {
      label: "ยอดซื้อ",
      value: data.purchases.current,
      delta: data.purchases.delta_pct,
      icon: Boxes,
      format: "amount"
    }
  ];

  return (
    <div className="space-y-4">
      <section>
        <h1 className="font-display text-2xl font-bold tracking-tight text-text-primary sm:text-3xl">
          ภาพรวมกิจการ
        </h1>
        <p className="mt-1 flex items-center gap-1.5 text-xs text-text-tertiary">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-success" aria-hidden="true" />
          <span>ข้อมูลล่าสุด ณ วันที่ {formatDate(data.period.as_of_date)}</span>
        </p>
      </section>

      <DashboardFilterBar period={data.period} />

      <section className="grid grid-cols-12 gap-4">
        <KpiStrip data={data} />

        <AreaChartCard trend={data.trend} asOf={data.period.end_date} />
        <DoughnutCard rows={data.branch_mix} asOf={data.period.as_of_date} />

        <Card className="premium-surface col-span-12 p-6 lg:col-span-4">
          <CardHeader className="space-y-0 p-0">
            <div className="flex items-center justify-between">
              <CardTitle>ตัวเลขรองที่ต้องดูคู่กัน</CardTitle>
              <span className="text-xs text-text-tertiary">เทียบช่วงเดียวกันปีก่อน</span>
            </div>
          </CardHeader>
          <CardContent className="grid gap-4 p-0 pt-6">
            {secondaryMetrics.map(({ label, value, delta, icon: Icon, format }) => (
              <div key={label} className="premium-panel rounded-lg p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm text-text-secondary">{label}</p>
                  <Icon className="h-4 w-4 text-text-tertiary" aria-hidden="true" />
                </div>
                <div className="mt-3 flex items-end justify-between gap-3">
                  <p className="text-2xl font-semibold tabular-nums text-text-primary">
                    {format === "count" ? formatNumber(value) : formatAmount(value)}
                  </p>
                  <p className="text-sm tabular-nums text-text-tertiary">
                    {formatPct(delta)}
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
        <StoryCard story={data.story} asOf={data.period.as_of_date} />
        <RankingList title="Salesperson Ranking" rows={data.salespersons} icon={BarChart3} />

        <ProductTable title="Top Product by Sales" rows={data.top_products} />
        <ProductTable title="Top Product by Gross Profit" rows={data.top_profit_products} />
        <ProductTable title="Product กำไรต่ำแต่ยอดขายสูง" rows={data.low_margin_products} />
        <RankingList title="Customer Ranking" rows={data.customers} icon={LineChart} />

        <DebtCard
          title="Cash & Debt: ลูกหนี้"
          total={data.ar_total}
          highlight={data.ar_overdue}
          rows={data.debtors}
          highlightLabel="overdue"
        />
        <DebtCard
          title="Cash & Debt: เจ้าหนี้"
          total={data.ap_total}
          highlight={data.ap_due_soon}
          rows={data.suppliers}
          highlightLabel="due soon"
        />

        <Card className="premium-surface col-span-12 p-6 lg:col-span-4">
          <CardHeader className="space-y-0 p-0">
            <CardTitle>Inventory Health</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 p-0 pt-6">
            <div className="premium-panel rounded-lg p-4">
              <p className="label-caps text-text-tertiary">Stock value</p>
              <p className="mt-3 text-3xl font-semibold tabular-nums text-text-primary">
                {formatAmount(data.stock_value)}
              </p>
            </div>
            <div className="premium-panel rounded-lg p-4">
              <p className="label-caps text-text-tertiary">Stock qty</p>
              <p className="mt-3 text-3xl font-semibold tabular-nums text-text-primary">
                {formatNumber(data.stock_qty)}
              </p>
            </div>
            <div className="premium-panel rounded-lg p-4">
              <p className="label-caps text-text-tertiary">Items</p>
              <p className="mt-3 text-3xl font-semibold tabular-nums text-text-primary">
                {formatNumber(data.stock_items)}
              </p>
            </div>
          </CardContent>
        </Card>
        <InventoryList
          title="สินค้าขายดีใกล้หมด"
          rows={data.low_stock}
          emptyLabel="ยังไม่พบสินค้าขายดีที่เข้าเกณฑ์ใกล้หมด"
        />
        <InventoryList
          title="สินค้าไม่เคลื่อนไหว"
          rows={data.slow_stock}
          emptyLabel="ยังไม่พบสินค้าไม่เคลื่อนไหวในช่วงนี้"
        />
      </section>
    </div>
  );
}
