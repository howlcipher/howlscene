import { it, expect } from "vitest";
import { parseSite, starterSite } from "../packages/core/src/index";
import { serializeBackup, importBackup } from "../packages/export/src/backup";
it("SEC-004 backup limits count UTF-8 bytes and reject unimportable downloads", () => {
  const sections = Array.from({ length: 100 }, (_, i) => ({
    ...starterSite.sections[0]!,
    id: `section-${i}`,
    body: "界".repeat(30000),
    richText: [
      {
        type: "paragraph",
        spans: Array.from({ length: 4 }, () => ({
          text: "界".repeat(30000),
          bold: false,
          italic: false,
        })),
      },
    ],
  }));
  const site = parseSite({ ...starterSite, sections });
  expect(() => serializeBackup(site)).toThrow(/large|30 MiB/i);
  expect(() => importBackup("界".repeat(11 * 1024 * 1024))).toThrow(
    /large|30 MiB/i,
  );
});
it("EXP-010 AST-004 editable backups round trip supported content and assets", () => {
  const site = parseSite({
    ...starterSite,
    assets: [
      {
        id: "asset-test",
        mime: "image/png",
        data: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII=",
        alt: "A test",
      },
    ],
    sections: [{ ...starterSite.sections[0], image: "asset-test" }],
  });
  expect(importBackup(serializeBackup(site))).toEqual(site);
});
it("SEC-003 SEC-004 EXP-011 rejects oversized malformed missing and unsafe assets atomically", () => {
  expect(() => importBackup("x".repeat(30 * 1024 * 1024 + 1))).toThrow(
    /large/i,
  );
  expect(() => importBackup("{bad")).toThrow();
  expect(() =>
    parseSite({
      ...starterSite,
      assets: [
        {
          id: "../outside",
          mime: "image/png",
          data: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII=",
          alt: "",
        },
      ],
    }),
  ).toThrow();
  expect(() =>
    parseSite({
      ...starterSite,
      sections: [{ ...starterSite.sections[0], image: "asset-missing" }],
    }),
  ).toThrow(/missing/i);
  expect(() =>
    parseSite({
      ...starterSite,
      assets: [
        {
          id: "asset-test",
          mime: "image/png",
          data: "data:image/svg+xml;base64,PHN2Zz4=",
          alt: "",
        },
      ],
    }),
  ).toThrow();
});
