import {
  parseSite,
  themes,
  type ThemeRegistry,
  type SiteConfig,
  type SectionRendererRegistry,
  defaultLayoutRegistry,
  type LayoutRegistry,
} from "../../core/src/index.js";
import { validateProjectImages } from "../../core/src/assets.js";
const MAX_BACKUP = 30 * 1024 * 1024;
function checkBackupSize(text: string): void {
  if (
    text.length > MAX_BACKUP ||
    new TextEncoder().encode(text).byteLength > MAX_BACKUP
  )
    throw Error("This backup is too large. The maximum is 30 MiB.");
}
export function serializeBackup(
  input: unknown,
  themeRegistry: ThemeRegistry = themes,
  sectionRegistry?: SectionRendererRegistry,
  layoutRegistry: LayoutRegistry = defaultLayoutRegistry,
): string {
  const text = JSON.stringify({
    format: "howlscene-project",
    version: 1,
    site: parseSite(input, themeRegistry, sectionRegistry, layoutRegistry),
  });
  checkBackupSize(text);
  return text;
}
/** Parse and validate fully before allowing replacement of any current project. */
export function importBackup(
  text: string,
  themeRegistry: ThemeRegistry = themes,
  sectionRegistry?: SectionRendererRegistry,
  layoutRegistry: LayoutRegistry = defaultLayoutRegistry,
): SiteConfig {
  checkBackupSize(text);
  const value: unknown = JSON.parse(text);
  if (
    typeof value !== "object" ||
    value === null ||
    Object.keys(value).some(
      (key) => !["format", "version", "site"].includes(key),
    ) ||
    !("format" in value) ||
    value.format !== "howlscene-project" ||
    !("version" in value) ||
    value.version !== 1 ||
    !("site" in value)
  )
    throw Error("Choose a HowlScene editable project backup.");
  return parseSite(value.site, themeRegistry, sectionRegistry, layoutRegistry);
}
/** Browser import boundary: validate all decoded images before replacing a draft. */
export async function importValidatedBackup(
  text: string,
  themeRegistry: ThemeRegistry = themes,
  sectionRegistry?: SectionRendererRegistry,
  layoutRegistry: LayoutRegistry = defaultLayoutRegistry,
): Promise<SiteConfig> {
  const site = importBackup(
    text,
    themeRegistry,
    sectionRegistry,
    layoutRegistry,
  );
  await validateProjectImages(site);
  return site;
}
