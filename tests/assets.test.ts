import { afterEach, describe, expect, it, vi } from "vitest";
import {
  validateImageBytes,
  validateImageBounds,
  validateProjectImages,
} from "../packages/core/src/assets";

const png = new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]);
const jpeg = new Uint8Array([255, 216, 255, 224]);
const webp = new Uint8Array([82, 73, 70, 70, 4, 0, 0, 0, 87, 69, 66, 80]);
const asset = {
  id: "asset-test",
  mime: "image/png" as const,
  data: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII=",
  alt: "",
};
afterEach(() => vi.unstubAllGlobals());
it("AST-002 imported images must decode and fit bounds; bitmaps close on rejection", async () => {
  const close = vi.fn();
  vi.stubGlobal(
    "createImageBitmap",
    vi.fn().mockResolvedValue({ width: 8193, height: 1, close }),
  );
  await expect(validateProjectImages({ assets: [asset] })).rejects.toThrow(
    /dimensions/,
  );
  expect(close).toHaveBeenCalledOnce();
  vi.stubGlobal(
    "createImageBitmap",
    vi.fn().mockRejectedValue(new Error("decode")),
  );
  await expect(validateProjectImages({ assets: [asset] })).rejects.toThrow(
    /image|opened|decode/i,
  );
});
it("AST-004 imported image validation closes valid bitmaps and permits imageless projects without a decoder", async () => {
  vi.stubGlobal("createImageBitmap", undefined);
  await expect(validateProjectImages({ assets: [] })).resolves.toBeUndefined();
  await expect(validateProjectImages({ assets: [asset] })).rejects.toThrow(
    /browser|unavailable/i,
  );
  const close = vi.fn();
  const decode = vi.fn().mockResolvedValue({ width: 1, height: 1, close });
  vi.stubGlobal("createImageBitmap", decode);
  await validateProjectImages({ assets: [asset] });
  expect(decode).toHaveBeenCalledOnce();
  expect(close).toHaveBeenCalledOnce();
});

describe("AST-001 and AST-002 image validation", () => {
  it("recognizes only matching PNG, JPEG and WebP signatures", () => {
    expect(validateImageBytes(png, "image/png")).toBe("image/png");
    expect(validateImageBytes(jpeg, "image/jpeg")).toBe("image/jpeg");
    expect(validateImageBytes(webp, "image/webp")).toBe("image/webp");
  });
  it("rejects SVG, executables, empty data, and mismatched types", () => {
    for (const [bytes, mime] of [
      [png, "image/jpeg"],
      [jpeg, "image/png"],
      [new TextEncoder().encode("<svg/>"), "image/svg+xml"],
      [new Uint8Array([77, 90]), "image/png"],
      [new Uint8Array(), "image/png"],
    ] as const) {
      expect(() => validateImageBytes(bytes, mime)).toThrow();
    }
  });
  it("enforces a 5 MiB file boundary", () => {
    const bytes = new Uint8Array(5 * 1024 * 1024);
    bytes.set(png);
    expect(validateImageBytes(bytes, "image/png")).toBe("image/png");
    expect(() =>
      validateImageBytes(new Uint8Array(5 * 1024 * 1024 + 1), "image/png"),
    ).toThrow(/5 MiB/);
  });
  it("rejects a truncated signature", () => {
    expect(() => validateImageBytes(png.slice(0, 7), "image/png")).toThrow(
      /format/,
    );
    expect(() => validateImageBytes(webp.slice(0, 11), "image/webp")).toThrow(
      /format/,
    );
  });
  it("accepts supported dimensions and exact pixel boundary", () => {
    expect(() => validateImageBounds(8192, 1)).not.toThrow();
    expect(() => validateImageBounds(6000, 4000)).not.toThrow();
  });
  it("rejects excessive, invalid, fractional or nonfinite decoded dimensions", () => {
    for (const [width, height] of [
      [8193, 1],
      [1, 8193],
      [6000, 4001],
      [0, 100],
      [-1, 100],
      [1.5, 100],
      [Infinity, 100],
      [100, NaN],
    ]) {
      expect(() => validateImageBounds(width!, height!)).toThrow(/dimensions/);
    }
  });
});
