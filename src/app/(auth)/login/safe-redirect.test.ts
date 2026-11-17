// Run: node --test "src/app/(auth)/login/safe-redirect.test.ts"
// (Node >= 22.18 strips TypeScript types natively; no extra tooling.)
import test from "node:test";
import assert from "node:assert/strict";

const { safeRedirectPath, DEFAULT_REDIRECT } = (await import(
  new URL("./safe-redirect.ts", import.meta.url).href
)) as typeof import("./safe-redirect");

const LEGIT = [
  "/dashboard",
  "/sales/document",
  "/inventory/items/ABC",
  "/sales?x=1",
  "/sales?x=1&y=a%20b",
  "/inventory/items/A%20B",
  "/a/b#frag",
  "/",
];

const MALICIOUS = [
  "https://evil.com",
  "http://evil.com/x",
  "//evil.com",
  "///evil.com",
  "/\\evil.com",
  "\\\\evil.com",
  "/\\/evil.com",
  "/\\t/evil.com", // literal backslash + t, as in the brief
  "javascript:alert(1)",
  "/%2F%2Fevil.com",
  "%2F%2Fevil.com",
  "/%5Cevil.com",
  "/%252F%252Fevil.com",
  "/%25252F%25252Fevil.com",
  " /evil",
  "/\t/evil.com",
  "/\n/evil.com",
  "/\r/evil.com",
  "/%09/evil.com",
  "/%0a/evil.com",
  "/ /evil.com",
  "/%E3%80%80/evil.com", // decoded ideographic space
  "/%00/evil.com",
  "/\u0000/evil.com",
  "/%E0%A4%A", // malformed encoding
  // Review F1: dot-segments that normalise to a "//host" pathname.
  "/.//evil.com",
  "/..//evil.com",
  "/a/..//evil.com",
  "/%2e//evil.com",
  "/a/%2e%2e/%2e%2e//evil.com",
  "/%2E%2E//evil.com",
  "/././/evil.com",
  "evil.com",
  "data:text/html,x",
  "",
];

for (const v of LEGIT) {
  test(`legit passes through: ${JSON.stringify(v)}`, () => {
    assert.equal(safeRedirectPath(v), v);
  });
}
for (const v of MALICIOUS) {
  test(`malicious falls back: ${JSON.stringify(v)}`, () => {
    assert.equal(safeRedirectPath(v), DEFAULT_REDIRECT);
  });
}
// Accepted values are returned in normalised same-origin form, and the
// returned pathname never starts with "//".
const NORMALISED: Array<[string, string]> = [
  ["/a/./b", "/a/b"],
  ["/a/../b", "/b"],
  ["/a/%2e%2e/b", "/b"],
  ["/a/b/../c?x=1#h", "/a/c?x=1#h"],
  ["/..", "/"],
];
for (const [input, expected] of NORMALISED) {
  test(`normalised: ${JSON.stringify(input)} -> ${expected}`, () => {
    assert.equal(safeRedirectPath(input), expected);
  });
}
test("every returned value is single-slash, same-origin and normalised", () => {
  const base = "http://x.invalid";
  for (const v of [...LEGIT, ...MALICIOUS, ...NORMALISED.map(([i]) => i)]) {
    const out = safeRedirectPath(v);
    assert.ok(out.startsWith("/") && !out.startsWith("//"), out);
    const u = new URL(out, base);
    assert.equal(u.origin, base);
    assert.equal(u.pathname + u.search + u.hash, out, "already normalised");
  }
});
test("null/undefined fall back", () => {
  assert.equal(safeRedirectPath(null), DEFAULT_REDIRECT);
  assert.equal(safeRedirectPath(undefined), DEFAULT_REDIRECT);
});
