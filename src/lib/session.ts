import type { SessionOptions } from "iron-session";

export type Branch = {
  db_code: string;
  db_name: string;
};

export type SessionData = {
  provider_code: string;
  user_code: string;
  user_name: string;
  db_code: string;
  db_name: string;
  isLoggedIn: boolean;
  branches?: Branch[];
};

export const emptySession: SessionData = {
  provider_code: "",
  user_code: "",
  user_name: "",
  db_code: "",
  db_name: "",
  isLoggedIn: false
};

const secret = process.env.SESSION_SECRET;
if ((!secret || secret.length < 32) && process.env.NODE_ENV === "production") {
  throw new Error("SESSION_SECRET must be set and at least 32 chars long");
}

function envBoolean(value: string | undefined) {
  if (!value) return undefined;
  const normalized = value.trim().toLowerCase();
  if (["1", "true", "yes", "on"].includes(normalized)) return true;
  if (["0", "false", "no", "off"].includes(normalized)) return false;
  return undefined;
}

// Optional explicit override (SESSION_COOKIE_SECURE=true|false). When unset or
// unparseable, the `secure` flag is auto-detected per request.
const secureOverride = envBoolean(process.env.SESSION_COOKIE_SECURE);

type HeaderReader = { get(name: string): string | null };

/**
 * Decide the cookie `secure` flag for one request.
 *  1. SESSION_COOKIE_SECURE=true|false wins when set.
 *  2. Otherwise follow the protocol the browser actually used:
 *     `x-forwarded-proto` (first value if comma separated; set by a TLS
 *     terminating reverse proxy), else the request URL's protocol.
 *  3. Anything else (plain http, no hint) gives a non-secure cookie.
 * x-forwarded-proto is client-spoofable, but it only changes the Secure
 * attribute of the requester's own cookie.
 */
export function resolveSecureCookie(
  headers: HeaderReader,
  requestUrl?: string
): boolean {
  if (secureOverride !== undefined) return secureOverride;

  const forwarded = headers
    .get("x-forwarded-proto")
    ?.split(",")[0]
    ?.trim()
    .toLowerCase();
  if (forwarded) return forwarded === "https";

  if (requestUrl) {
    try {
      return new URL(requestUrl).protocol === "https:";
    } catch {
      // unparseable URL: fall through to non-secure
    }
  }
  return false;
}

export function buildSessionOptions(secure: boolean): SessionOptions {
  return {
    password: secret ?? "dev-only-insecure-secret-change-me-please-32+",
    cookieName: "sml_mis_ai_session",
    ttl: 60 * 60 * 8,
    cookieOptions: {
      httpOnly: true,
      secure,
      sameSite: "lax",
      maxAge: 60 * 60 * 8,
      path: "/"
    }
  };
}

/**
 * Static options for code that only READS the session (src/middleware.ts):
 * `secure` is irrelevant when no cookie is written. Anything that saves or
 * destroys the session must go through `getSession()` in
 * src/lib/auth-helpers.ts, which applies the per-request `secure` value.
 */
export const sessionOptions: SessionOptions = buildSessionOptions(
  secureOverride ?? process.env.NODE_ENV === "production"
);
