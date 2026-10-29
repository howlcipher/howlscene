/** Formats supported by the portable project asset contract. */
export type ImageMime = "image/png" | "image/jpeg" | "image/webp";
export interface ImageVariant {
  width: number;
  height: number;
  mime: ImageMime;
  data: string;
}
export interface ImageAsset {
  id: string;
  mime: ImageMime;
  data: string;
  alt: string;
  width?: number | undefined;
  height?: number | undefined;
  variants?: ImageVariant[] | undefined;
}
const MAX_BYTES = 5 * 1024 * 1024;
const MAX_DIMENSION = 8192;
const MAX_PIXELS = 24_000_000;

/** Decode project images before accepting an imported project or publishing it.
 * Schema validation alone establishes format signatures, not decodability.
 * Assets are processed sequentially to bound peak decoded memory.
 */
export async function validateProjectImages(project: {
  assets: readonly ImageAsset[];
}): Promise<void> {
  if (!project.assets.length) return;
  if (typeof createImageBitmap !== "function")
    throw new Error(
      "Image validation is unavailable in this browser. Try a current browser.",
    );
  for (const asset of project.assets) {
    if ((asset.variants?.length ?? 0) > 2)
      throw new Error("Images can have at most two responsive variants.");
    for (const image of [asset, ...(asset.variants ?? [])]) {
      const bytes = validateEncodedImage(image.data, image.mime);
      let bitmap: ImageBitmap;
      try {
        bitmap = await createImageBitmap(
          new Blob([new Uint8Array(bytes)], { type: image.mime }),
        );
      } catch {
        throw new Error(
          "An image in this project could not be opened. Choose a valid project backup.",
        );
      }
      try {
        validateImageBounds(bitmap.width, bitmap.height);
        if (
          (image.width !== undefined && image.width !== bitmap.width) ||
          (image.height !== undefined && image.height !== bitmap.height)
        )
          throw new Error(
            "Image dimensions do not match the stored dimensions.",
          );
      } finally {
        bitmap.close();
      }
    }
  }
}

/** Validates portable encoded data before any browser decoder allocation. */
export function validateEncodedImage(
  data: string,
  mime: ImageMime,
): Uint8Array {
  const prefix = `data:${mime};base64,`;
  if (data.length > Math.ceil(MAX_BYTES / 3) * 4 + 32)
    throw new Error(
      "The prepared image exceeds 5 MiB. Choose a smaller image.",
    );
  if (!data.startsWith(prefix)) throw new Error("Invalid image data.");
  const payload = data.slice(prefix.length);
  if (payload.length % 4 !== 0 || !/^[A-Za-z0-9+/]*={0,2}$/.test(payload))
    throw new Error("Invalid image data.");
  let bytes: Uint8Array;
  try {
    bytes = Uint8Array.from(atob(payload), (character) =>
      character.charCodeAt(0),
    );
  } catch {
    throw new Error("Invalid image data.");
  }
  inspectImageDimensions(bytes, mime);
  return bytes;
}

/** Checks the upload boundary; decoding remains required to prove image validity. */
export function validateImageBytes(bytes: Uint8Array, mime: string): ImageMime {
  if (bytes.byteLength > MAX_BYTES)
    throw new Error("Choose an image smaller than or equal to 5 MiB.");
  const matches = (signature: readonly number[], offset = 0) =>
    signature.every((byte, index) => bytes[offset + index] === byte);
  const valid =
    (mime === "image/png" && matches([137, 80, 78, 71, 13, 10, 26, 10])) ||
    (mime === "image/jpeg" && matches([255, 216, 255])) ||
    (mime === "image/webp" &&
      matches([82, 73, 70, 70]) &&
      matches([87, 69, 66, 80], 8));
  if (!valid)
    throw new Error(
      "Choose a PNG, JPEG or WebP image whose format matches its file type.",
    );
  return mime as ImageMime;
}

/** Inspect declared dimensions before allocating decoder memory. This verifies
 * container headers, not compressed pixel validity; browser decoding is still required.
 * Sources: W3C PNG IHDR, ITU T.81 Annex B, RFC 9649 sections 2 and 3.
 */
export function inspectImageDimensions(
  bytes: Uint8Array,
  mime: string,
): { width: number; height: number } {
  validateImageBytes(bytes, mime);
  const invalid = () => {
    throw new Error(
      "Image header is corrupt or truncated. Choose a valid image.",
    );
  };
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const requireBytes = (offset: number, count: number) => {
    if (offset < 0 || offset + count > bytes.length) invalid();
  };
  const text = (offset: number, count: number) => {
    requireBytes(offset, count);
    return String.fromCharCode(...bytes.subarray(offset, offset + count));
  };
  const dimensions = (width: number, height: number) => {
    validateImageBounds(width, height);
    return { width, height };
  };
  if (mime === "image/png") {
    requireBytes(0, 33);
    if (view.getUint32(8) !== 13 || text(12, 4) !== "IHDR") invalid();
    return dimensions(view.getUint32(16), view.getUint32(20));
  }
  if (mime === "image/jpeg") {
    let offset = 2;
    // Each iteration advances at least two bytes and never scans entropy data.
    while (offset < bytes.length) {
      if (bytes[offset++] !== 255) invalid();
      while (bytes[offset] === 255) offset++;
      requireBytes(offset, 1);
      const marker = bytes[offset++]!;
      if (marker === 0 || marker === 0xd9 || marker === 0xda) invalid();
      if (marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) continue;
      requireBytes(offset, 2);
      const length = view.getUint16(offset);
      if (length < 2) invalid();
      requireBytes(offset, length);
      const frame =
        marker >= 0xc0 &&
        marker <= 0xcf &&
        ![0xc4, 0xc8, 0xcc].includes(marker);
      if (frame) {
        if (length < 8) invalid();
        const components = bytes[offset + 7]!;
        if (!components || length !== 8 + 3 * components) invalid();
        return dimensions(
          view.getUint16(offset + 5),
          view.getUint16(offset + 3),
        );
      }
      offset += length;
    }
    return invalid();
  }
  requireBytes(0, 20);
  const declaredSize = view.getUint32(4, true) + 8;
  const chunkSize = view.getUint32(16, true);
  if (
    declaredSize !== bytes.length ||
    20 + chunkSize + (chunkSize % 2) > declaredSize
  )
    invalid();
  const tag = text(12, 4);
  if (tag === "VP8X") {
    if (chunkSize !== 10) invalid();
    requireBytes(20, 10);
    const uint24 = (offset: number) =>
      bytes[offset]! + bytes[offset + 1]! * 256 + bytes[offset + 2]! * 65536;
    return dimensions(uint24(24) + 1, uint24(27) + 1);
  }
  if (tag === "VP8L") {
    if (chunkSize < 5) invalid();
    requireBytes(20, 5);
    if (bytes[20] !== 47) invalid();
    const bits = view.getUint32(21, true);
    if (bits >>> 29 !== 0) invalid();
    return dimensions((bits & 0x3fff) + 1, ((bits >>> 14) & 0x3fff) + 1);
  }
  if (tag === "VP8 ") {
    if (chunkSize < 10) invalid();
    requireBytes(20, 10);
    if ((bytes[20]! & 1) !== 0 || text(23, 3) !== "\u009d\u0001\u002a")
      invalid();
    return dimensions(
      view.getUint16(26, true) & 0x3fff,
      view.getUint16(28, true) & 0x3fff,
    );
  }
  return invalid();
}

/** Limits decoded memory and canvas dimensions, independently of compressed file size. */
export function validateImageBounds(width: number, height: number): void {
  if (
    !Number.isSafeInteger(width) ||
    !Number.isSafeInteger(height) ||
    width < 1 ||
    height < 1 ||
    width > MAX_DIMENSION ||
    height > MAX_DIMENSION ||
    width * height > MAX_PIXELS
  ) {
    throw new Error(
      "Image dimensions must be at most 8192 pixels per side and 24 million pixels total.",
    );
  }
}

/** Decodes and reencodes uploads to remove original filenames and embedded metadata. */
export async function normalizeImage(file: File): Promise<ImageAsset> {
  if (file.size > MAX_BYTES)
    throw new Error("Choose an image smaller than or equal to 5 MiB.");
  const bytes = new Uint8Array(await file.arrayBuffer());
  const mime = validateImageBytes(bytes, file.type);
  inspectImageDimensions(bytes, mime);
  if (typeof createImageBitmap !== "function")
    throw new Error(
      "Image upload is unavailable in this browser. Try a current browser.",
    );
  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    throw new Error(
      "This image could not be opened. Choose a valid PNG, JPEG or WebP image.",
    );
  }
  try {
    validateImageBounds(bitmap.width, bitmap.height);
    const encode = (width: number, height: number): ImageVariant => {
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const context = canvas.getContext("2d");
      if (!context)
        throw new Error(
          "This browser could not prepare the image. Try a smaller image.",
        );
      context.drawImage(bitmap, 0, 0, width, height);
      const data = canvas.toDataURL("image/webp", 0.85);
      const mime: ImageMime | null = data.startsWith("data:image/webp;base64,")
        ? "image/webp"
        : data.startsWith("data:image/png;base64,")
          ? "image/png"
          : null;
      if (!mime)
        throw new Error("This browser could not encode the image safely.");
      validateEncodedImage(data, mime);
      return { width, height, mime, data };
    };
    const ratio = Math.min(1, 1600 / Math.max(bitmap.width, bitmap.height));
    const width = Math.max(1, Math.round(bitmap.width * ratio));
    const height = Math.max(1, Math.round(bitmap.height * ratio));
    const base = encode(width, height);
    const variants = [480, 960]
      .filter((size) => size < width)
      .map((size) =>
        encode(size, Math.max(1, Math.round((height * size) / width))),
      );
    return { id: `asset-${crypto.randomUUID()}`, ...base, alt: "", variants };
  } finally {
    bitmap.close();
  }
}
