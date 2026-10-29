import type { ImgHTMLAttributes } from "react";
import type { ImageAsset } from "./assets.js";
export interface AssetImageProps extends Omit<
  ImgHTMLAttributes<HTMLImageElement>,
  "src" | "srcSet" | "alt" | "width" | "height"
> {
  asset: ImageAsset;
  source?: (id: string, width?: number) => string;
}
/** Shared image semantics for editor preview, exported HTML and section entries. */
export function AssetImage({
  asset,
  source,
  sizes = "(max-width: 600px) 100vw, 80vw",
  ...props
}: AssetImageProps) {
  const base = source ? source(asset.id) : asset.data;
  const candidates = (asset.variants ?? []).map(
    (v) => `${source ? source(asset.id, v.width) : v.data} ${v.width}w`,
  );
  if (candidates.length && asset.width)
    candidates.push(`${base} ${asset.width}w`);
  return (
    <img
      {...props}
      src={base}
      srcSet={candidates.length ? candidates.join(", ") : undefined}
      sizes={candidates.length ? sizes : undefined}
      width={asset.width}
      height={asset.height}
      alt={asset.alt}
    />
  );
}
