import { NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/auth-helpers";
import {
  mainDatabaseName,
  normalizeDatabaseName,
  queryProviderDatabase
} from "@/lib/db";
import type { Branch } from "@/lib/session";

const LoginSchema = z.object({
  provider: z.string().min(1),
  username: z.string().min(1),
  password: z.string().min(1)
});

type UserRow = {
  user_code: string;
  user_name: string;
};

type BranchRow = {
  data_code: string;
};

type CompanyProfileRow = {
  company_name_1: string | null;
};

async function getCompanyName(providerCode: string, dbCode: string) {
  try {
    const profiles = await queryProviderDatabase<CompanyProfileRow>(
      providerCode,
      dbCode,
      "SELECT company_name_1 FROM erp_company_profile LIMIT 1"
    );
    return profiles[0]?.company_name_1?.trim() || dbCode.toUpperCase();
  } catch {
    return dbCode.toUpperCase();
  }
}

async function getBranches(providerCode: string, userCode: string) {
  const mainDb = mainDatabaseName(providerCode);
  const userCodeUpper = userCode.toUpperCase();
  const rows = await queryProviderDatabase<BranchRow>(
    providerCode,
    mainDb,
    `
      SELECT data_code
      FROM sml_database_list
      WHERE UPPER(data_code) IN (
        SELECT UPPER(data_code)
        FROM sml_database_list_user_and_group
        WHERE user_or_group_status = 0
          AND UPPER(user_or_group_code) = $1
      )
      OR UPPER(data_code) IN (
        SELECT UPPER(data_code)
        FROM sml_database_list_user_and_group
        WHERE user_or_group_status = 1
          AND UPPER(user_or_group_code) IN (
            SELECT UPPER(group_code)
            FROM sml_user_and_group
            WHERE UPPER(user_code) = $2
          )
      )
      ORDER BY data_name
    `,
    [userCodeUpper, userCodeUpper]
  );

  return Promise.all(
    rows.map(async (row): Promise<Branch> => {
      const dbCode = normalizeDatabaseName(row.data_code);
      return {
        db_code: dbCode,
        db_name: await getCompanyName(providerCode, dbCode)
      };
    })
  );
}

async function verifyUser(input: z.infer<typeof LoginSchema>) {
  const providerCode = input.provider.trim().toLowerCase();
  const userCode = input.username.trim();
  const userCodeUpper = userCode.toUpperCase();

  const users = await queryProviderDatabase<UserRow>(
    providerCode,
    mainDatabaseName(providerCode),
    `
      SELECT user_code, user_name
      FROM sml_user_list
      WHERE UPPER(user_code) = $1
        AND user_password = $2
    `,
    [userCodeUpper, input.password]
  );

  const user = users[0];
  if (!user) {
    return null;
  }

  return {
    provider_code: providerCode,
    user_code: user.user_code || userCode,
    user_name: user.user_name || user.user_code || userCode,
    branches: await getBranches(providerCode, userCode)
  };
}

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = LoginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  let user;
  try {
    user = await verifyUser(parsed.data);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }

  if (!user) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const session = await getSession();
  session.provider_code = user.provider_code;
  session.user_code = user.user_code;
  session.user_name = user.user_name;
  session.branches = user.branches;
  session.db_code = "";
  session.db_name = "";
  session.isLoggedIn = false;
  await session.save();

  return NextResponse.json({
    user_name: user.user_name,
    branches: user.branches
  });
}
