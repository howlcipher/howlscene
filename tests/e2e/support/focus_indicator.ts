import { expect, type Locator, type Page } from "@playwright/test";

export async function focusIndicatorContrast(page: Page, site: Locator) {
  await site.locator(".skip-link").focus();
  await page.keyboard.press("Tab");
  const navigationLink = site.locator(".site-header nav a").first();
  await expect(navigationLink).toBeFocused();
  return navigationLink.evaluate((element) => {
    const style = getComputedStyle(element);
    const container = element.closest<HTMLElement>(".howlscene");
    if (!container) throw Error("Missing theme container");
    const colors = [
      style.outlineColor,
      getComputedStyle(container).backgroundColor,
    ].map((color) => {
      const channels = color.match(/[\d.]+/g)?.slice(0, 3);
      if (!channels || channels.length !== 3)
        throw Error(`Unsupported computed color: ${color}`);
      return channels.map(Number);
    });
    const luminance = (channels: number[]) => {
      const linear = (value: number) => {
        const channel = value / 255;
        return channel <= 0.04045
          ? channel / 12.92
          : ((channel + 0.055) / 1.055) ** 2.4;
      };
      return (
        0.2126 * linear(channels[0]!) +
        0.7152 * linear(channels[1]!) +
        0.0722 * linear(channels[2]!)
      );
    };
    const [ring, background] = colors.map(luminance);
    return {
      color: style.outlineColor,
      width: style.outlineWidth,
      style: style.outlineStyle,
      contrast:
        (Math.max(ring!, background!) + 0.05) /
        (Math.min(ring!, background!) + 0.05),
    };
  });
}
