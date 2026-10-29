import { expect, it } from "vitest";
import { parseSite, safeUrl, starterSite } from "../packages/core/src/index";
import { importBackup } from "../packages/export/src/backup";

const data =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII=";
const asset = { id: "asset-pixel", mime: "image/png", data, alt: "Pixel" };

it("SEC-003 AST-002 rejects mismatched signatures, malformed base64 and uncontrolled asset IDs", () => {
  for (const patch of [
    { mime: "image/jpeg" },
    { data: "data:image/png;base64,%%%bad" },
    { data: "data:image/png;base64,TVqQAA==" },
    { data: data.replace("base64,", "base64,\n") },
    { id: "asset-../escape" },
    { id: "../../escape" },
    { mime: "image/svg+xml" },
  ]) {
    expect(() =>
      parseSite({ ...starterSite, assets: [{ ...asset, ...patch }] }),
    ).toThrow();
  }
});
it("AST-004 rejects duplicated asset IDs and missing entry-image references atomically", () => {
  const before = JSON.stringify(starterSite);
  expect(() => parseSite({ ...starterSite, assets: [asset, asset] })).toThrow(
    /unique/,
  );
  expect(() =>
    parseSite({
      ...starterSite,
      sections: [
        {
          ...starterSite.sections[0],
          entries: [{ id: "entry", title: "Image", image: "asset-missing" }],
        },
      ],
    }),
  ).toThrow(/missing/);
  expect(() =>
    parseSite({
      ...starterSite,
      sections: [{ ...starterSite.sections[0], image: "asset-missing" }],
    }),
  ).toThrow(/missing/);
  expect(JSON.stringify(starterSite)).toBe(before);
});
it("SEC-002 rejects unicode and control-obfuscated executable schemes without rejecting safe links", () => {
  for (const url of [
    "java\u200bscript:alert(1)",
    "ｊａｖａｓｃｒｉｐｔ:alert(1)",
    "javascript\u2028:alert(1)",
    "\u0000https://example.com",
    "https://user:password@example.com",
    "https://example.com\n",
    "data:image/svg+xml,<svg/>",
  ])
    expect(safeUrl.safeParse(url).success).toBe(false);
  expect(safeUrl.parse("https://example.com/?q=%3Cscript%3E")).toBe(
    "https://example.com/?q=%3Cscript%3E",
  );
});
it("THM-004 SEC-001 rejects CSS declarations and unsupported font values", () => {
  for (const overrides of [
    { accent: "red; background:url(javascript:x)" },
    { accent: "#123456;position:fixed" },
    { accent: "url(https://example.com/x)" },
    { font: "serif;display:none" },
    { font: "unknown" },
    { background: "red" },
  ])
    expect(() => parseSite({ ...starterSite, overrides })).toThrow();
});
it("SEC-005 rejects nested prototype payloads without changing the current project", () => {
  const original = JSON.stringify(starterSite);
  const malicious = JSON.stringify({
    format: "howlscene-project",
    version: 1,
    site: starterSite,
  }).replace(
    '"title":"My website"',
    '"__proto__":{"polluted":true},"title":"My website"',
  );
  expect(() => importBackup(malicious)).toThrow();
  expect(JSON.stringify(starterSite)).toBe(original);
  expect(Object.prototype).not.toHaveProperty("polluted");
});
it("SEC-005 rejects unexpected prototype fields on the backup envelope", () => {
  const malicious = JSON.stringify({
    format: "howlscene-project",
    version: 1,
    site: starterSite,
  }).replace("{", '{"__proto__":{"polluted":true},');
  expect(() => importBackup(malicious)).toThrow();
});
it("SEC-004 rejects combined asset resource exhaustion below individual image limits", () => {
  const data =
    "data:image/png;base64," +
    btoa(atob(asset.data.split(",")[1]!) + "\0".repeat(4200000));
  const assets = Array.from({ length: 5 }, (_, i) => ({
    id: `asset-${i}`,
    mime: "image/png",
    data,
    alt: "",
  }));
  expect(() => parseSite({ ...starterSite, assets })).toThrow(/28 MB/);
});
