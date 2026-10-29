import { afterEach, expect, it, vi } from "vitest";
import {
  normalizeImage,
  validateEncodedImage,
  validateProjectImages,
} from "../packages/core/src/assets";
function png(width: number, height: number) {
  const bytes = new Uint8Array(33);
  bytes.set([137, 80, 78, 71, 13, 10, 26, 10, 0, 0, 0, 13, 73, 72, 68, 82]);
  new DataView(bytes.buffer).setUint32(16, width);
  new DataView(bytes.buffer).setUint32(20, height);
  return bytes;
}
function data(width: number, height: number) {
  return `data:image/png;base64,${Buffer.from(png(width, height)).toString("base64")}`;
}
function environment(width: number, height: number) {
  const close = vi.fn();
  const draw = vi.fn();
  vi.stubGlobal(
    "createImageBitmap",
    vi.fn(async () => ({ width, height, close })),
  );
  const sizes: number[][] = [];
  vi.stubGlobal("document", {
    createElement: () => {
      const canvas = {
        width: 0,
        height: 0,
        getContext: () => ({ drawImage: draw }),
        toDataURL: vi.fn((mime: string, quality: number) => {
          expect(mime).toBe("image/webp");
          expect(quality).toBe(0.85);
          sizes.push([canvas.width, canvas.height]);
          return data(canvas.width, canvas.height);
        }),
      };
      return canvas;
    },
  });
  vi.stubGlobal("crypto", { randomUUID: () => "test-id" });
  return { close, draw, sizes };
}
afterEach(() => vi.unstubAllGlobals());
it("downsamples the base to 1600 longest side and generates bounded 480/960 widths", async () => {
  const state = environment(4000, 2000);
  const bytes = png(4000, 2000);
  const image = await normalizeImage({
    size: bytes.length,
    type: "image/png",
    arrayBuffer: async () => bytes.buffer,
  } as File);
  expect([image.width, image.height]).toEqual([1600, 800]);
  expect(image.variants?.map((v) => [v.width, v.height])).toEqual([
    [480, 240],
    [960, 480],
  ]);
  expect(state.sizes).toEqual([
    [1600, 800],
    [480, 240],
    [960, 480],
  ]);
  expect(state.close).toHaveBeenCalledOnce();
});
it("preserves portrait aspect ratios and never upscales or makes redundant variants", async () => {
  const state = environment(500, 2000);
  const bytes = png(500, 2000);
  const image = await normalizeImage({
    size: bytes.length,
    type: "image/png",
    arrayBuffer: async () => bytes.buffer,
  } as File);
  expect([image.width, image.height]).toEqual([400, 1600]);
  expect(image.variants).toEqual([]);
  expect(state.sizes).toEqual([[400, 1600]]);
  const small = environment(800, 400);
  const next = await normalizeImage({
    size: bytes.length,
    type: "image/png",
    arrayBuffer: async () => bytes.buffer,
  } as File);
  expect([next.width, next.height]).toEqual([800, 400]);
  expect(next.variants?.map((v) => v.width)).toEqual([480]);
  expect(small.close).toHaveBeenCalledOnce();
});
it("validates encoded image prefixes, base64, dimensions and size before decoding", () => {
  expect(validateEncodedImage(data(1, 1), "image/png")).toEqual(png(1, 1));
  for (const value of [
    "data:image/jpeg;base64,AAAA",
    "data:image/png;base64,%%%%",
    data(9000, 1),
    data(1, 1) + "\n",
  ])
    expect(() => validateEncodedImage(value, "image/png")).toThrow();
});
it("validates each variant sequentially and rejects decoded dimension metadata mismatches", async () => {
  const close = vi.fn();
  const decode = vi
    .fn()
    .mockResolvedValueOnce({ width: 2, height: 2, close })
    .mockResolvedValueOnce({ width: 1, height: 1, close });
  vi.stubGlobal("createImageBitmap", decode);
  await validateProjectImages({
    assets: [
      {
        id: "asset-one",
        mime: "image/png",
        data: data(2, 2),
        alt: "",
        width: 2,
        height: 2,
        variants: [
          { width: 1, height: 1, mime: "image/png", data: data(1, 1) },
        ],
      },
    ],
  });
  expect(decode).toHaveBeenCalledTimes(2);
  expect(close).toHaveBeenCalledTimes(2);
  decode.mockResolvedValue({ width: 1, height: 1, close });
  await expect(
    validateProjectImages({
      assets: [
        {
          id: "asset-one",
          mime: "image/png",
          data: data(1, 1),
          alt: "",
          width: 3,
          height: 1,
        },
      ],
    }),
  ).rejects.toThrow(/dimensions.*match|match.*dimensions/i);
  expect(close).toHaveBeenCalledTimes(3);
});
it("validates a supported 5 MiB encoded image without recursive regex exhaustion", () => {
  const bytes = new Uint8Array(5 * 1024 * 1024);
  bytes.set(png(1, 1));
  expect(
    validateEncodedImage(
      `data:image/png;base64,${Buffer.from(bytes).toString("base64")}`,
      "image/png",
    ).length,
  ).toBe(bytes.length);
});
