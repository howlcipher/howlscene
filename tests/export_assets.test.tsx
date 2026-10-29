import { expect, it } from "vitest";
import JSZip from "jszip";
import { parseSite, starterSite } from "../packages/core/src/index";
import { exportWebsite } from "../packages/export/src/index";
const encoded =
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII=";
const image = {
  id: "asset-pixel",
  mime: "image/png",
  data: `data:image/png;base64,${encoded}`,
  alt: "A single pixel",
};
it("AST-005 EXP-005 packages referenced PNG bytes and relative paths for section and entry media", async () => {
  const site = parseSite({
    ...starterSite,
    assets: [image],
    sections: [
      {
        ...starterSite.sections[0],
        image: image.id,
        entries: [{ id: "example", title: "Picture", image: image.id }],
      },
    ],
  });
  const zip = await JSZip.loadAsync(await exportWebsite(site));
  const html = await zip.file("index.html")!.async("string");
  expect(html).toContain('src="./assets/asset-pixel/original.png"');
  expect(html).toContain('alt="A single pixel"');
  expect(html).not.toContain("data:image");
  expect(
    await zip.file("assets/asset-pixel/original.png")!.async("uint8array"),
  ).toEqual(new Uint8Array(Buffer.from(encoded, "base64")));
  expect(
    Object.keys(zip.files).every(
      (path) => !path.includes("..") && !path.startsWith("/"),
    ),
  ).toBe(true);
});
it("EXP-007 motion none omits runtime while cinematic includes local standalone enhancement", async () => {
  const none = await JSZip.loadAsync(
    await exportWebsite({ ...starterSite, motion: "none" }),
  );
  expect(none.file("site.js")).toBeNull();
  expect(await none.file("index.html")!.async("string")).not.toContain(
    "<script",
  );
  const cinematic = await JSZip.loadAsync(
    await exportWebsite({ ...starterSite, motion: "cinematic" }),
  );
  expect(
    (await cinematic.file("site.js")!.async("string")).length,
  ).toBeGreaterThan(0);
  expect(await cinematic.file("index.html")!.async("string")).toContain(
    'src="./site.js"',
  );
  expect(await cinematic.file("site.js")!.async("string")).not.toMatch(
    /apps\/editor|lexical|indexedDB/,
  );
});
it("EXP-008 EXP-009 escapes metadata and user payloads in meaningful exported HTML", async () => {
  const payload = '</title><script>alert("x")</script>';
  const zip = await JSZip.loadAsync(
    await exportWebsite({
      ...starterSite,
      title: payload,
      description: '" onload="alert(1)',
      sections: [
        {
          ...starterSite.sections[0],
          heading: payload,
          body: "<img src=x onerror=alert(1)>",
        },
      ],
    }),
  );
  const html = await zip.file("index.html")!.async("string");
  expect(html).toContain("&lt;/title&gt;&lt;script&gt;");
  expect(html).toContain("&quot; onload=&quot;alert(1)");
  expect(html).not.toContain("<script");
  expect(html).not.toContain("<img src=x");
  expect(html).toContain('<meta property="og:title"');
  expect(html).toContain('<meta name="description"');
});
it("EXP-005 exported theme scenery CSS is self-contained", async () => {
  const zip = await JSZip.loadAsync(await exportWebsite(starterSite));
  const css = await zip.file("site.css")!.async("string");
  expect(css).not.toMatch(/@import/);
  expect(css).toContain(".scenery-layer");
});
it("EXP-009 metadata includes canonical index policy and bundled favicon", async () => {
  const site = parseSite({
    ...starterSite,
    canonical: "https://example.com/portfolio/",
    indexable: false,
  });
  const zip = await JSZip.loadAsync(await exportWebsite(site));
  const html = await zip.file("index.html")!.async("string");
  expect(html).toContain(
    'rel="canonical" href="https://example.com/portfolio/"',
  );
  expect(html).toContain("noindex");
  expect(html).toContain("./favicon.svg");
  expect(zip.file("favicon.svg")).not.toBeNull();
  expect(zip.file("LICENSES.txt")).not.toBeNull();
});
it("AST-005 SEC-006 exports only media referenced by visible content", async () => {
  const site = parseSite({
    ...starterSite,
    assets: [image, { ...image, id: "asset-private" }],
    sections: [
      { ...starterSite.sections[0], image: image.id },
      {
        id: "hidden",
        type: "media",
        heading: "Private draft",
        visible: false,
        image: "asset-private",
      },
    ],
  });
  const zip = await JSZip.loadAsync(await exportWebsite(site));
  expect(zip.file("assets/asset-private/original.png")).toBeNull();
  expect(await zip.file("index.html")!.async("string")).not.toContain(
    "Private draft",
  );
});
