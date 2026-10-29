import { expect, it } from "vitest";
import JSZip from "jszip";
import { starterSite } from "../packages/core/src/index";
import { exportWebsite } from "../packages/export/src/index";
function data(width: number, height: number) {
  const bytes = new Uint8Array(33);
  bytes.set([137, 80, 78, 71, 13, 10, 26, 10, 0, 0, 0, 13, 73, 72, 68, 82]);
  const view = new DataView(bytes.buffer);
  view.setUint32(16, width);
  view.setUint32(20, height);
  return {
    bytes,
    data: `data:image/png;base64,${Buffer.from(bytes).toString("base64")}`,
  };
}
it("AST-005 EXP-005 asset IDs resembling responsive suffixes retain distinct bytes and rendered paths", async () => {
  const original = data(1280, 640),
    responsive = data(640, 320),
    other = data(2, 1);
  const zip = await JSZip.loadAsync(
    await exportWebsite({
      ...starterSite,
      assets: [
        {
          id: "asset-photo",
          mime: "image/png",
          data: original.data,
          width: 1280,
          height: 640,
          alt: "First",
          variants: [
            {
              width: 640,
              height: 320,
              mime: "image/png",
              data: responsive.data,
            },
          ],
        },
        {
          id: "asset-photo-w640",
          mime: "image/png",
          data: other.data,
          width: 2,
          height: 1,
          alt: "Second",
        },
      ],
      sections: [
        {
          ...starterSite.sections[0],
          image: "asset-photo",
          entries: [
            {
              id: "second",
              title: "Separate image",
              image: "asset-photo-w640",
            },
          ],
        },
      ],
    }),
  );
  const html = await zip.file("index.html")!.async("string");
  const paths = [
    "assets/asset-photo/original.png",
    "assets/asset-photo/w640.png",
    "assets/asset-photo-w640/original.png",
  ];
  for (const [index, bytes] of [
    original.bytes,
    responsive.bytes,
    other.bytes,
  ].entries())
    expect(await zip.file(paths[index]!)?.async("uint8array")).toEqual(bytes);
  expect(html).toContain("./assets/asset-photo/original.png");
  expect(html).toContain("./assets/asset-photo/w640.png 640w");
  expect(html).toContain("./assets/asset-photo-w640/original.png");
});
