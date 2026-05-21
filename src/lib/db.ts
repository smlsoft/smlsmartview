import { existsSync, readFileSync } from "fs";
import { tmpdir } from "os";
import { join } from "path";
import { Pool, type QueryResultRow } from "pg";

declare global {
  // eslint-disable-next-line no-var
  var __smlMisPoolsByDatabase: Map<string, Pool> | undefined;
}

function normalizeProviderCode(providerCode: string) {
  const normalized = providerCode.trim().toUpperCase();
  if (!normalized) {
    throw new Error("Provider code is required");
  }
  return normalized;
}

export function normalizeDatabaseName(databaseName: string) {
  const normalized = databaseName.trim().toLowerCase();
  if (!normalized) {
    throw new Error("Database name is required");
  }
  return normalized;
}

export function mainDatabaseName(providerCode: string) {
  return `smlerpmain${providerCode.trim().toLowerCase()}`;
}

function readXmlTag(xml: string, tagName: string) {
  const match = xml.match(new RegExp(`<${tagName}>\\s*([^<]*?)\\s*</${tagName}>`, "i"));
  return match?.[1]?.trim() ?? "";
}

function legacyConfigCandidates(providerCode: string) {
  const fileName = `SMLConfig${normalizeProviderCode(providerCode)}.xml`;
  return [
    process.env.SML_CONFIG_DIR ? join(process.env.SML_CONFIG_DIR, fileName) : "",
    tmpdir() ? join(tmpdir(), fileName) : "",
    join(
      "C:\\Program Files\\Apache Software Foundation\\Tomcat 8.5\\temp",
      fileName
    )
  ].filter(Boolean);
}

function databaseUrlFromBaseUrl(baseUrl: string, databaseName: string) {
  const url = new URL(baseUrl);
  url.pathname = `/${databaseName}`;
  return url.toString();
}

function databaseUrlFromLegacyConfig(providerCode: string, databaseName: string) {
  const configPath = legacyConfigCandidates(providerCode).find((path) =>
    existsSync(path)
  );
  if (!configPath) {
    throw new Error(
      `DATABASE_URL is not set and SMLConfig${normalizeProviderCode(providerCode)}.xml was not found`
    );
  }

  const xml = readFileSync(configPath, "utf8");
  const server = readXmlTag(xml, "server");
  const port = readXmlTag(xml, "port") || "5432";
  const user = readXmlTag(xml, "user");
  const password = readXmlTag(xml, "password");
  if (!server || !user) {
    throw new Error(`${configPath} is missing database server or user`);
  }

  return `postgresql://${encodeURIComponent(user)}:${encodeURIComponent(password)}@${server}:${port}/${databaseName}`;
}

function providerDatabaseUrl(providerCode: string, databaseName: string) {
  const normalizedProvider = normalizeProviderCode(providerCode);
  const normalizedDatabase = normalizeDatabaseName(databaseName);
  const baseUrl = process.env.DATABASE_URL?.trim();
  if (baseUrl) {
    return databaseUrlFromBaseUrl(baseUrl, normalizedDatabase);
  }
  return databaseUrlFromLegacyConfig(normalizedProvider, normalizedDatabase);
}

function createPool(connectionString: string) {
  return new Pool({ connectionString, max: 10 });
}

const databasePools = global.__smlMisPoolsByDatabase ?? new Map<string, Pool>();
if (process.env.NODE_ENV !== "production") {
  global.__smlMisPoolsByDatabase = databasePools;
}

function poolForProviderDatabase(providerCode: string, databaseName: string) {
  const normalizedProvider = normalizeProviderCode(providerCode);
  const normalizedDatabase = normalizeDatabaseName(databaseName);
  const key = `${normalizedProvider}:${normalizedDatabase}`;
  const existing = databasePools.get(key);
  if (existing) {
    return existing;
  }

  const nextPool = createPool(
    providerDatabaseUrl(normalizedProvider, normalizedDatabase)
  );
  databasePools.set(key, nextPool);
  return nextPool;
}

export async function queryProviderDatabase<
  T extends QueryResultRow = QueryResultRow
>(
  providerCode: string,
  databaseName: string,
  sql: string,
  params: ReadonlyArray<unknown> = []
) {
  const result = await poolForProviderDatabase(providerCode, databaseName).query<T>(
    sql,
    params as unknown[]
  );
  return result.rows;
}
