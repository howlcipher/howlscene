export const visualFontFamilies = {
  ink: "HowlScene Test Serif",
  cyber: "HowlScene Test Mono",
  modern: "HowlScene Test Sans",
} as const;

const fontFiles = {
  ink: ["LiberationSerif-Regular.ttf", "LiberationSerif-Bold.ttf"],
  cyber: ["DejaVuSansMono.ttf", "DejaVuSansMono-Bold.ttf"],
  modern: ["NotoSans-Regular.ttf", "NotoSans-Bold.ttf"],
} as const;

/** Build the same pinned, licensed fonts for preview and static-export captures. */
export function visualFontFaceCss(prefix: string): string {
  return (Object.keys(fontFiles) as (keyof typeof fontFiles)[])
    .flatMap((theme) =>
      fontFiles[theme].map(
        (file, index) =>
          `@font-face{font-family:"${visualFontFamilies[theme]}";src:url("${prefix}/${file}") format("truetype");font-style:normal;font-weight:${index ? 700 : 400};font-display:block;}`,
      ),
    )
    .join("\n");
}
