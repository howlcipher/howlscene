import { afterEach, expect, it, vi } from "vitest";
import { normalizeImage } from "../packages/core/src/assets";

function png(width = 1, height = 1) {
  const bytes = new Uint8Array(33);
  bytes.set([137, 80, 78, 71, 13, 10, 26, 10, 0, 0, 0, 13, 73, 72, 68, 82]);
  const view = new DataView(bytes.buffer);
  view.setUint32(16, width);
  view.setUint32(20, height);
  bytes.set([8, 6, 0, 0, 0], 24);
  return bytes;
}
function file(bytes = png(), type = "image/png", size = bytes.length) {
  const arrayBuffer = vi.fn(async () => bytes.buffer);
  return {
    value: {
      name: "../../private-location.svg",
      size,
      type,
      arrayBuffer,
    } as unknown as File,
    arrayBuffer,
  };
}
function browser({
  width = 1,
  height = 1,
  encoded = `data:image/png;base64,${Buffer.from(png()).toString("base64")}`,
  context = true,
} = {}) {
  const close = vi.fn();
  const bitmap = { width, height, close };
  const decode = vi.fn(async () => bitmap);
  const drawImage = vi.fn();
  const toDataURL = vi.fn(() => encoded);
  const canvas = {
    width: 0,
    height: 0,
    getContext: vi.fn(() => (context ? { drawImage } : null)),
    toDataURL,
  };
  vi.stubGlobal("createImageBitmap", decode);
  vi.stubGlobal("document", { createElement: vi.fn(() => canvas) });
  vi.stubGlobal("crypto", {
    randomUUID: () => "12345678-1234-1234-1234-123456789abc",
  });
  return { close, decode, drawImage, toDataURL, canvas, bitmap };
}
afterEach(() => vi.unstubAllGlobals());
it("rejects oversized uploads before reading their bytes", async () => {
  const input = file(png(), "image/png", 5 * 1024 * 1024 + 1);
  const { decode } = browser();
  await expect(normalizeImage(input.value)).rejects.toThrow(/5 MiB/);
  expect(input.arrayBuffer).not.toHaveBeenCalled();
  expect(decode).not.toHaveBeenCalled();
});
it("rejects unsafe formats and signature mismatches without decoding", async () => {
  const { decode } = browser();
  for (const input of [
    file(new TextEncoder().encode('<svg onload="alert(1)"/>'), "image/svg+xml"),
    file(new Uint8Array([77, 90]), "image/png"),
    file(png(), "image/jpeg"),
  ])
    await expect(normalizeImage(input.value)).rejects.toThrow(
      /format|PNG|JPEG|WebP/,
    );
  expect(decode).not.toHaveBeenCalled();
});
it("reports absent browser decoding support and failed decoding", async () => {
  vi.stubGlobal("createImageBitmap", undefined);
  await expect(normalizeImage(file().value)).rejects.toThrow(
    /unavailable.*browser/i,
  );
  const decode = vi.fn().mockRejectedValue(new Error("decoder internals"));
  vi.stubGlobal("createImageBitmap", decode);
  await expect(normalizeImage(file().value)).rejects.toThrow(
    /could not be opened/i,
  );
});
it("closes decoded bitmaps when dimensions or canvas allocation fail", async () => {
  const excessive = browser({ width: 8193 });
  await expect(normalizeImage(file().value)).rejects.toThrow(/dimensions/);
  expect(excessive.close).toHaveBeenCalledOnce();
  const absent = browser({ context: false });
  await expect(normalizeImage(file().value)).rejects.toThrow(
    /prepare the image/,
  );
  expect(absent.close).toHaveBeenCalledOnce();
  expect(absent.toDataURL).not.toHaveBeenCalled();
});
it("normalizes successful uploads from pixels with safe identity and blank alt text", async () => {
  const state = browser();
  const input = file();
  const result = await normalizeImage(input.value);
  expect(result).toEqual({
    id: "asset-12345678-1234-1234-1234-123456789abc",
    mime: "image/png",
    data: `data:image/png;base64,${Buffer.from(png()).toString("base64")}`,
    width: 1,
    height: 1,
    variants: [],
    alt: "",
  });
  expect(result.id).toMatch(/^asset-[a-zA-Z0-9-]+$/);
  expect(JSON.stringify(result)).not.toContain("private-location");
  expect(state.canvas.width).toBe(1);
  expect(state.canvas.height).toBe(1);
  expect(state.drawImage).toHaveBeenCalledWith(state.bitmap, 0, 0, 1, 1);
  expect(state.toDataURL).toHaveBeenCalledWith("image/webp", 0.85);
  expect(state.close).toHaveBeenCalledOnce();
});
it("accepts the browser PNG fallback for a valid WebP upload", async () => {
  const bytes = new Uint8Array(30);
  bytes.set([
    82, 73, 70, 70, 22, 0, 0, 0, 87, 69, 66, 80, 86, 80, 56, 88, 10, 0, 0, 0,
  ]);
  const state = browser({
    encoded: `data:image/png;base64,${Buffer.from(png()).toString("base64")}`,
  });
  expect((await normalizeImage(file(bytes, "image/webp").value)).mime).toBe(
    "image/png",
  );
  expect(state.toDataURL).toHaveBeenCalledWith("image/webp", 0.85);
  expect(state.close).toHaveBeenCalledOnce();
});
it("closes resources and rejects oversized or unsupported canvas encoder output", async () => {
  const tooLarge = browser({
    encoded: `data:image/png;base64,${"A".repeat(Math.ceil((5 * 1024 * 1024) / 3) * 4 + 100)}`,
  });
  await expect(normalizeImage(file().value)).rejects.toThrow(/exceeds 5 MiB/);
  expect(tooLarge.close).toHaveBeenCalledOnce();
  const unsupported = browser({ encoded: "data:text/html;base64,EVIL" });
  await expect(normalizeImage(file().value)).rejects.toThrow(/encode.*safely/);
  expect(unsupported.close).toHaveBeenCalledOnce();
});
it("checks header bounds before the decoder can allocate an image bomb", async () => {
  const state = browser();
  await expect(normalizeImage(file(png(100000, 100000)).value)).rejects.toThrow(
    /dimensions/,
  );
  expect(state.decode).not.toHaveBeenCalled();
  expect(state.close).not.toHaveBeenCalled();
});
