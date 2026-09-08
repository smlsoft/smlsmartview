import { Card } from "@/components/ui/card";

function LoadingBlock({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-md bg-surface-muted ${className}`}
      aria-hidden="true"
    />
  );
}

export function DashboardLoading() {
  return (
    <div className="space-y-4">
      <section>
        <h1 className="font-display text-2xl font-bold tracking-tight text-text-primary sm:text-3xl">
          ภาพรวมกิจการ
        </h1>
        <p className="mt-1 flex items-center gap-1.5 text-xs text-text-tertiary">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-success animate-pulse" aria-hidden="true" />
          <span>กำลังอ่านข้อมูลจากฐาน SMLERP...</span>
        </p>
      </section>

      <section className="grid grid-cols-12 gap-4" aria-busy="true">
        <Card className="premium-surface col-span-12 overflow-hidden">
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">
            {[0, 1, 2, 3].map((item) => (
              <div key={item} className="border-border px-5 py-5 md:px-6">
                <LoadingBlock className="h-3 w-24" />
                <LoadingBlock className="mt-4 h-8 w-36" />
                <LoadingBlock className="mt-3 h-3 w-28" />
                <LoadingBlock className="mt-4 h-6 w-20 rounded-pill" />
              </div>
            ))}
          </div>
        </Card>

        <Card className="premium-surface col-span-12 p-6 lg:col-span-8">
          <LoadingBlock className="h-5 w-48" />
          <LoadingBlock className="mt-3 h-3 w-64 max-w-full" />
          <LoadingBlock className="mt-8 h-[260px] w-full" />
        </Card>

        <Card className="premium-surface col-span-12 p-6 lg:col-span-4">
          <LoadingBlock className="h-5 w-44" />
          <div className="mt-8 flex justify-center">
            <LoadingBlock className="h-[180px] w-[180px] rounded-pill" />
          </div>
          <div className="mt-6 space-y-3">
            {[0, 1, 2].map((item) => (
              <LoadingBlock key={item} className="h-4 w-full" />
            ))}
          </div>
        </Card>

        {[0, 1, 2, 3, 4, 5].map((item) => (
          <Card key={item} className="col-span-12 p-6 lg:col-span-4">
            <LoadingBlock className="h-5 w-40" />
            <div className="mt-6 space-y-4">
              <LoadingBlock className="h-12 w-full" />
              <LoadingBlock className="h-12 w-full" />
              <LoadingBlock className="h-12 w-4/5" />
            </div>
          </Card>
        ))}
      </section>
    </div>
  );
}
