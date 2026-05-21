import { NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/auth-helpers";
import { normalizeDatabaseName } from "@/lib/db";

const SelectDbSchema = z.object({
  db_code: z.string().min(1),
  db_name: z.string().min(1)
});

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = SelectDbSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const session = await getSession();
  if (!session.user_code) {
    return NextResponse.json(
      { error: "Login step 1 has not completed" },
      { status: 401 }
    );
  }

  const dbCode = normalizeDatabaseName(parsed.data.db_code);
  const allowed = session.branches?.some((branch) => branch.db_code === dbCode);
  if (!allowed) {
    return NextResponse.json(
      { error: "Selected branch is not assigned to this user" },
      { status: 403 }
    );
  }

  session.db_code = dbCode;
  session.db_name = parsed.data.db_name;
  session.isLoggedIn = true;
  await session.save();

  return NextResponse.json({ ok: true });
}
