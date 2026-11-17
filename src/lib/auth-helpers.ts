import { cookies, headers } from "next/headers";
import { getIronSession } from "iron-session";
import {
  buildSessionOptions,
  resolveSecureCookie,
  type SessionData
} from "@/lib/session";

/**
 * Session for server components and route handlers. The cookie `secure` flag
 * follows the protocol the browser used for this request (http -> non-secure;
 * https or `x-forwarded-proto: https` -> secure), unless SESSION_COOKIE_SECURE
 * overrides it. Route handlers that save/destroy the session should pass their
 * `req` so its URL protocol is used when no proxy header is present.
 */
export async function getSession(req?: Request) {
  const cookieStore = await cookies();
  const requestHeaders = req?.headers ?? (await headers());
  return getIronSession<SessionData>(
    cookieStore,
    buildSessionOptions(resolveSecureCookie(requestHeaders, req?.url))
  );
}
