import Link from "next/link";
import { SalesDocumentDetail } from "@/components/sales/SalesDocumentDetail";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getSession } from "@/lib/auth-helpers";
import { getSalesDocumentDetail } from "@/lib/queries/sales";

export const dynamic = "force-dynamic";

type SalesDocumentPageProps = {
  searchParams?: Promise<{
    menu?: string;
    flag?: string;
    pos_type?: string;
    doc_no?: string;
    doc_date?: string;
    from?: string;
    to?: string;
    q?: string;
  }>;
};

function salesBackHref(params: Awaited<NonNullable<SalesDocumentPageProps["searchParams"]>>) {
  const query = new URLSearchParams();
  if (params.menu) query.set("menu", params.menu);
  if (params.from) query.set("from", params.from);
  if (params.to) query.set("to", params.to);
  if (params.q) query.set("q", params.q);

  const suffix = query.toString();
  return suffix ? `/sales?${suffix}` : "/sales";
}

export default async function SalesDocumentPage({ searchParams }: SalesDocumentPageProps) {
  const session = await getSession();
  const params = (await searchParams) ?? {};
  const backHref = salesBackHref(params);

  try {
    const data = await getSalesDocumentDetail(session.provider_code, session.db_code, {
      menu: params.menu,
      flag: params.flag,
      posType: params.pos_type,
      docNo: params.doc_no,
      docDate: params.doc_date
    });

    if (!data) {
      return (
        <Card className="p-6">
          <CardHeader className="p-0">
            <CardTitle>ไม่พบเอกสารขาย</CardTitle>
          </CardHeader>
          <CardContent className="p-0 pt-4">
            <p className="text-sm leading-5 text-text-secondary">
              ตรวจสอบเลขเอกสาร วันที่เอกสาร และ trans_flag หรือ POS type จากรายการอีกครั้ง
            </p>
            <Button asChild className="mt-6" variant="secondary">
              <Link href={backHref}>กลับรายการ</Link>
            </Button>
          </CardContent>
        </Card>
      );
    }

    return <SalesDocumentDetail data={data} backHref={backHref} />;
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return (
      <Card className="p-6">
        <CardHeader className="p-0">
          <CardTitle>โหลดรายละเอียดเอกสารขายไม่สำเร็จ</CardTitle>
        </CardHeader>
        <CardContent className="p-0 pt-4">
          <p className="text-sm leading-5 text-text-secondary">{message}</p>
          <Button asChild className="mt-6" variant="secondary">
            <Link href={backHref}>กลับรายการ</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }
}
