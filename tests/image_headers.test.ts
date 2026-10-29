import { afterEach, expect, it, vi } from "vitest";
import {
  inspectImageDimensions,
  normalizeImage,
  validateProjectImages,
} from "../packages/core/src/assets";
const png = (width = 1, height = 1) => {
  const bytes = new Uint8Array(33);
  bytes.set([137, 80, 78, 71, 13, 10, 26, 10, 0, 0, 0, 13, 73, 72, 68, 82]);
  const view = new DataView(bytes.buffer);
  view.setUint32(16, width);
  view.setUint32(20, height);
  bytes.set([8, 6, 0, 0, 0], 24);
  return bytes;
};
const jpeg = (marker = 0xc0) =>
  new Uint8Array([
    255,
    216,
    255,
    224,
    0,
    4,
    0,
    0,
    255,
    marker,
    0,
    11,
    8,
    0,
    20,
    0,
    30,
    1,
    1,
    17,
    0,
  ]);
const webp = (tag: string, payload: number[]) => {
  const bytes = new Uint8Array(20 + payload.length + (payload.length % 2));
  bytes.set([82, 73, 70, 70]);
  new DataView(bytes.buffer).setUint32(4, bytes.length - 8, true);
  bytes.set([87, 69, 66, 80], 8);
  bytes.set(new TextEncoder().encode(tag), 12);
  new DataView(bytes.buffer).setUint32(16, payload.length, true);
  bytes.set(payload, 20);
  return bytes;
};
afterEach(() => vi.unstubAllGlobals());
it("inspects PNG IHDR before decompression and rejects enormous or truncated headers", () => {
  expect(inspectImageDimensions(png(60, 40), "image/png")).toEqual({
    width: 60,
    height: 40,
  });
  for (const bytes of [
    png(8193, 1),
    png(6000, 4001),
    png(0, 2),
    png().slice(0, 32),
    new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]),
  ])
    expect(() => inspectImageDimensions(bytes, "image/png")).toThrow();
  const broken = png();
  broken[15] = 0;
  expect(() => inspectImageDimensions(broken, "image/png")).toThrow(/header/i);
});
it("reads baseline and progressive JPEG after bounded application segments", () => {
  for (const marker of [0xc0, 0xc2])
    expect(inspectImageDimensions(jpeg(marker), "image/jpeg")).toEqual({
      width: 30,
      height: 20,
    });
  const invalid = jpeg();
  invalid[5] = 1;
  expect(() => inspectImageDimensions(invalid, "image/jpeg")).toThrow(
    /header/i,
  );
  expect(() =>
    inspectImageDimensions(jpeg().slice(0, 19), "image/jpeg"),
  ).toThrow(/header/i);
  expect(() =>
    inspectImageDimensions(
      new Uint8Array([255, 216, 255, 218, 0, 2]),
      "image/jpeg",
    ),
  ).toThrow(/header/i);
});
it("inspects all three WebP dimension encodings and rejects corrupt chunk lengths", () => {
  expect(
    inspectImageDimensions(
      webp("VP8 ", [0, 0, 0, 157, 1, 42, 30, 0, 20, 0]),
      "image/webp",
    ),
  ).toEqual({ width: 30, height: 20 });
  expect(
    inspectImageDimensions(webp("VP8L", [47, 29, 192, 4, 0]), "image/webp"),
  ).toEqual({ width: 30, height: 20 });
  expect(
    inspectImageDimensions(
      webp("VP8X", [0, 0, 0, 0, 29, 0, 0, 19, 0, 0]),
      "image/webp",
    ),
  ).toEqual({ width: 30, height: 20 });
  const broken = webp("VP8X", [0, 0, 0, 0, 29, 0, 0, 19, 0, 0]);
  broken[16] = 200;
  expect(() => inspectImageDimensions(broken, "image/webp")).toThrow(/header/i);
  expect(() =>
    inspectImageDimensions(webp("VP8L", [47, 0, 0, 0, 224]), "image/webp"),
  ).toThrow(/header/i);
});
it("rejects image bombs before invoking browser decode on upload and project validation", async () => {
  const decode = vi.fn();
  vi.stubGlobal("createImageBitmap", decode);
  const bytes = png(100000, 100000);
  const file = {
    size: bytes.length,
    type: "image/png",
    arrayBuffer: async () => bytes.buffer,
  } as File;
  await expect(normalizeImage(file)).rejects.toThrow(/dimensions/);
  await expect(
    validateProjectImages({
      assets: [
        {
          id: "asset-bomb",
          mime: "image/png",
          data: `data:image/png;base64,${Buffer.from(bytes).toString("base64")}`,
          alt: "",
        },
      ],
    }),
  ).rejects.toThrow(/dimensions/);
  expect(decode).not.toHaveBeenCalled();
});
