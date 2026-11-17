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
test("null/undefined fall back", () => {
  assert.equal(safeRedirectPath(null), DEFAULT_REDIRECT);
  assert.equal(safeRedirectPath(undefined), DEFAULT_REDIRECT);
});
