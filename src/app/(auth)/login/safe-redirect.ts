/**
 * Post-login redirect target validation (open-redirect guard).
 *
 * `?from=` is attacker-controllable (a direct link to /login bypasses the
 * middleware that normally sets it), so it may only ever be used as a
 * same-site relative path. Anything else falls back to the default.
 */

export const DEFAULT_REDIRECT = "/dashboard";

// Enough layers to catch double/triple-encoded tricks; more than this is
// treated as hostile rather than decoded further.
const MAX_DECODE_PASSES = 4;

/**
 * True when the string holds a character that must never appear in a
 * redirect path: C0 controls (incl. tab/CR/LF, which URL parsers silently
 * strip), space, DEL and C1 controls, NBSP, any other Unicode whitespace,
 * and backslash (browsers treat it as "/").
 */
function hasForbiddenChar(value: string, allowSpace: boolean): boolean {
  for (let i = 0; i < value.length; i++) {
    const code = value.charCodeAt(i);
    if (allowSpace && code === 0x20) continue;
    if (code <= 0x20 || (code >= 0x7f && code <= 0xa0) || code === 0x5c) {
      return true;
    }
  }
  // Any remaining Unicode whitespace (U+2028, U+3000, ...); a plain space is
  // excluded from the check when allowSpace is set.
  return allowSpace ? /[^\S ]/.test(value) : /\s/.test(value);
}

// `decodedLayer` is true for percent-decoded forms: there a plain space is a
// legitimate decoded "%20" inside a path, but every other control/whitespace
// char (e.g. a decoded %09 that URL parsers would strip) is still rejected.
// A space in the RAW value is never accepted (so " /evil" falls back).
function isSafeRelativePath(value: string, decodedLayer: boolean): boolean {
  if (value.length === 0 || hasForbiddenChar(value, decodedLayer)) return false;
  // Exactly one leading "/": "//host" is protocol-relative, and "/\host" is
  // normalised to "//host" by browsers (backslash is rejected above).
  return value[0] === "/" && value[1] !== "/";
}

export function safeRedirectPath(
  raw: string | null | undefined,
  fallback: string = DEFAULT_REDIRECT
): string {
  if (typeof raw !== "string" || raw.length === 0) return fallback;

  // Check the value as given AND every percent-decoded form of it, so an
  // encoded "//" or "\" that a browser/router might later decode is caught.
  let current = raw;
  for (let pass = 0; pass <= MAX_DECODE_PASSES; pass++) {
    if (!isSafeRelativePath(current, pass > 0)) return fallback;
    let decoded: string;
    try {
      decoded = decodeURIComponent(current);
    } catch {
      return fallback; // malformed percent-encoding
    }
    if (decoded === current) {
      // Fully decoded and every layer was safe. Final guard: resolving it
      // against a base must stay on that origin.
      // Dot-segments ("/.//evil.com", "/%2e//evil.com", "/a/..//evil.com")
      // normalise to a "//host" pathname, so return the NORMALISED form and
      // reject any whose pathname starts with "//": the "exactly one leading
      // /" invariant then holds for the value we actually hand back.
      try {
        const base = "http://login-redirect-check.invalid";
        const u = new URL(raw, base);
        if (u.origin !== base) return fallback;
        if (!u.pathname.startsWith("/") || u.pathname.startsWith("//")) {
          return fallback;
        }
        return u.pathname + u.search + u.hash;
      } catch {
        return fallback;
      }
    }
    current = decoded;
  }
  return fallback; // still decoding after MAX_DECODE_PASSES
}
