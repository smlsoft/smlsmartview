import { NextResponse, type NextRequest } from "next/server";
import { getIronSession } from "iron-session";
import { sessionOptions, type SessionData } from "@/lib/session";

const PUBLIC_PATHS = ["/login"];
const PUBLIC_API_PREFIX = "/api/auth/";
const PUBLIC_API_EXACT = ["/api/health"];

function isPublic(pathname: string) {
  if (PUBLIC_PATHS.includes(pathname)) return true;
  if (pathname.startsWith(PUBLIC_API_PREFIX)) return true;
  if (PUBLIC_API_EXACT.includes(pathname)) return true;
  return false;
}

// A plain host[:port] only: DNS name / IPv4 / bracketed IPv6, optional numeric
// port. No scheme, path, userinfo, spaces, or lists, so a spoofed header can
// never inject anything beyond a hostname into the redirect Location.
const PLAIN_HOST =
  /^(?:[A-Za-z0-9](?:[A-Za-z0-9.-]*[A-Za-z0-9])?|\[[0-9A-Fa-f:.]+\])(?::\d{1,5})?$/;

/**
 * The host the browser actually used: the first `x-forwarded-host` value (set
 * by a reverse proxy), else `Host`. Returns undefined when neither is a plain
 * host[:port], so the caller keeps Next's own URL.
 *
 * Why not just `req.nextUrl`: Next builds it from the server's bind hostname
 * and rewrites 127.x / ::1 to `localhost`, so a server bound to 127.0.0.1
 * (HOSTNAME=127.0.0.1 behind nginx, `next start -H 127.0.0.1`) would redirect
 * browsers to their own `localhost`.
 */
function requestHost(req: NextRequest): string | undefined {
  const forwarded = req.headers.get("x-forwarded-host")?.split(",")[0].trim();
  if (forwarded && PLAIN_HOST.test(forwarded)) return forwarded;
  const host = req.headers.get("host")?.trim();
  if (host && PLAIN_HOST.test(host)) return host;
  return undefined;
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (isPublic(pathname)) {
    return NextResponse.next();
  }

  const res = NextResponse.next();
  // Read-only: the middleware never saves/destroys the session, so the static
  // sessionOptions (and its `secure` value) never produces a Set-Cookie here.
  const session = await getIronSession<SessionData>(req, res, sessionOptions);

  if (!session.isLoggedIn) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    // Only override when Next's own URL is the loopback rewrite (server bound
    // to 127.0.0.1 / ::1). In every other case leave it untouched: Next then
    // turns the Location into a relative one, which works behind any proxy
    // (including ones that rewrite Host to an internal upstream name).
    if (url.hostname === "localhost") {
      const host = requestHost(req);
      if (host) {
        // Clear the port first: a port-less host would otherwise keep Next's port.
        url.port = "";
        url.host = host;
      }
    }
    url.searchParams.set("from", pathname);
    const redirect = NextResponse.redirect(url);
    // The target depends on request headers, so it must never be cached.
    redirect.headers.set("Cache-Control", "no-store");
    return redirect;
  }

  return res;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)"
  ]
};
