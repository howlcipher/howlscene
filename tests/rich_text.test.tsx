import { expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import {
  RichText,
  richTextSchema,
  safeUrl,
} from "../packages/core/src/rich_text";
it("TXT-001 TXT-004 portable formatting survives JSON round trip", () => {
  const doc = richTextSchema.parse([
    { type: "heading", level: 2, spans: [{ text: "Hello", bold: true }] },
    {
      type: "paragraph",
      spans: [{ text: "world", italic: true, href: "https://example.com" }],
    },
    { type: "list", ordered: true, items: [[{ text: "First" }]] },
  ]);
  expect(richTextSchema.parse(JSON.parse(JSON.stringify(doc)))).toEqual(doc);
  const html = renderToStaticMarkup(<RichText value={doc} />);
  expect(html).toContain("<strong>Hello</strong>");
  expect(html).toContain("<em>world</em>");
  expect(html).toContain("<ol>");
});
it("TXT-002 SEC-002 rejects dangerous URL schemes and obfuscation", () => {
  for (const value of [
    "javascript:alert(1)",
    "data:text/html,x",
    "//evil.test",
    "https://u:p@example.com",
    "java\nscript:alert(1)",
    " https://example.com",
    "http://example.com",
  ])
    expect(safeUrl.safeParse(value).success).toBe(false);
  for (const value of [
    "https://example.com/path?q=a#b",
    "mailto:hello@example.com",
    "#intro",
  ])
    expect(safeUrl.safeParse(value).success).toBe(true);
});
it("TXT-003 imported markup remains inert text and excessive documents fail", () => {
  const value = richTextSchema.parse([
    { type: "paragraph", spans: [{ text: "<img src=x onerror=alert(1)>" }] },
  ]);
  expect(renderToStaticMarkup(<RichText value={value} />)).not.toContain(
    "<img",
  );
  expect(() =>
    richTextSchema.parse(
      Array.from({ length: 501 }, () => ({ type: "paragraph", spans: [] })),
    ),
  ).toThrow();
});
