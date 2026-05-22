import Link from "next/link";
import { ArDocumentDetail } from "@/components/ar/ArDocumentDetail";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getSession } from "@/lib/auth-helpers";
import { getArDocumentDetail } from "@/lib/queries/ar";

export const dynamic = "force-dynamic";

type ArDocumentPageProps = {
  searchParams?: Promise<{
    menu?: string;
    flag?: string;
    doc_no?: string;
    doc_date?: string;
    from?: string;
    to?: string;
    q?: string;
  }>;
};

function ArBackHref(params: Awaited<NonNullable<ArDocumentPageProps["searchParams"]>>) {
  const query = new URLSearchParams();
  if (params.menu) query.set("menu", params.menu);
  if (params.from) query.set("from", params.from);
  if (params.to) query.set("to", params.to);
  if (params.q) query.set("q", params.q);

  const suffix = query.toString();
  return suffix ? `/ar?${suffix}` : "/ar";
}

export default async function ArDocumentPage({ searchParams }: ArDocumentPageProps) {
  const session = await getSession();
  const params = (await searchParams) ?? {};
  const backHref = ArBackHref(params);

  try {
    const data = await getArDocumentDetail(session.provider_code, session.db_code, {
      menu: params.menu,
      flag: params.flag,
      docNo: params.doc_no,
      docDate: params.doc_date
    });

    if (!data) {
      return (
        <Card className="p-6">
          <CardHeader className="p-0">
            <CardTitle>ไม่พบเอกสารลูกหนี้</CardTitle>
          </CardHeader>
          <CardContent className="p-0 pt-4">
            <p className="text-sm leading-5 text-text-secondary">
              ตรวจสอบเลขเอกสาร วันที่เอกสาร และ trans_flag จากรายการอีกครั้ง
            </p>
            <Button asChild className="mt-6" variant="secondary">
              <Link href={backHref}>กลับรายการ</Link>
            </Button>
          </CardContent>
        </Card>
      );
    }

    return <ArDocumentDetail data={data} backHref={backHref} />;
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return (
      <Card className="p-6">
        <CardHeader className="p-0">
          <CardTitle>โหลดรายละเอียดเอกสารลูกหนี้ไม่สำเร็จ</CardTitle>
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
