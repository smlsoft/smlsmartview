import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth-helpers";

export async function POST(req: Request) {
  const session = await getSession(req);
  session.destroy();
  return NextResponse.json({ ok: true });
}
