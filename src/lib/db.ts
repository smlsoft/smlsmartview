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

function requiredEnv(name: string) {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`${name} is required`);
  }
  return value;
}

function dbPort() {
  const value = process.env.DB_PORT?.trim() || "5432";
  const port = Number(value);
  if (!Number.isInteger(port) || port <= 0 || port > 65535) {
    throw new Error("DB_PORT must be a valid TCP port");
  }
  return port;
}

function effectiveDatabaseName(databaseName: string) {
  const requestedDatabase = databaseName.trim() || process.env.DB_NAME || "";
  return normalizeDatabaseName(requestedDatabase);
}

function providerDatabaseConfig(providerCode: string, databaseName: string) {
  normalizeProviderCode(providerCode);
  return {
    host: requiredEnv("DB_HOST"),
    port: dbPort(),
    user: requiredEnv("DB_USER"),
    password: process.env.DB_PASSWORD ?? "",
    database: effectiveDatabaseName(databaseName),
    max: 10
  };
}

function createPool(providerCode: string, databaseName: string) {
  return new Pool(providerDatabaseConfig(providerCode, databaseName));
}

const databasePools = global.__smlMisPoolsByDatabase ?? new Map<string, Pool>();
if (process.env.NODE_ENV !== "production") {
  global.__smlMisPoolsByDatabase = databasePools;
}

function poolForProviderDatabase(providerCode: string, databaseName: string) {
  const normalizedProvider = normalizeProviderCode(providerCode);
  const normalizedDatabase = effectiveDatabaseName(databaseName);
  const key = `${normalizedProvider}:${normalizedDatabase}`;
  const existing = databasePools.get(key);
  if (existing) {
    return existing;
  }

  const nextPool = createPool(normalizedProvider, normalizedDatabase);
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
