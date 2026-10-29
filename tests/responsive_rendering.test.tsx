import { it, expect } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { AssetImage } from "../packages/core/src/media";
import { parseSite, starterSite } from "../packages/core/src/index";
function data(width: number, height: number) {
  const bytes = new Uint8Array(33);
  bytes.set([137, 80, 78, 71, 13, 10, 26, 10, 0, 0, 0, 13, 73, 72, 68, 82]);
  const view = new DataView(bytes.buffer);
  view.setUint32(16, width);
  view.setUint32(20, height);
  return "data:image/png;base64," + Buffer.from(bytes).toString("base64");
}
it("AST-005 responsive media emits bounded source candidates and intrinsic dimensions", () => {
  const asset = {
    id: "asset-test",
    mime: "image/png" as const,
    data: data(1600, 800),
    width: 1600,
    height: 800,
    alt: "Landscape",
    variants: [
      {
        mime: "image/png" as const,
        data: data(480, 240),
        width: 480,
        height: 240,
      },
    ],
  };
  const site = parseSite({
    ...starterSite,
    assets: [asset],
    sections: [{ ...starterSite.sections[0], image: asset.id }],
  });
  expect(site.assets[0]?.variants).toHaveLength(1);
  const html = renderToStaticMarkup(
    <AssetImage
      asset={asset}
      source={(id, width) => `./assets/${id}${width ? "-w" + width : ""}.png`}
    />,
  );
  expect(html).toContain("./assets/asset-test-w480.png 480w");
  expect(html).toContain("./assets/asset-test.png 1600w");
  expect(html).toContain('width="1600"');
  expect(html).toContain('height="800"');
  expect(html).toContain('alt="Landscape"');
  expect(() =>
    parseSite({
      ...site,
      assets: [{ ...asset, variants: [asset.variants[0], asset.variants[0]] }],
    }),
  ).toThrow(/unique/i);
});
