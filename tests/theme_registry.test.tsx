import { expect, it } from "vitest";
import {
  createThemeRegistry,
  themes,
  parseSite,
  starterSite,
  Site,
} from "../packages/core/src/index";
import { renderToStaticMarkup } from "react-dom/server";
it("SDK-004 THM-004 registers validated themes without changing defaults", () => {
  const registry = createThemeRegistry({
    forest: { ...themes.ink!, name: "Forest", background: "#e8efdf" },
  });
  const site = parseSite({ ...starterSite, theme: "forest" }, registry);
  expect(
    renderToStaticMarkup(<Site site={site} themeRegistry={registry} />),
  ).toContain("#e8efdf");
  expect(themes).not.toHaveProperty("forest");
  expect(() =>
    createThemeRegistry({
      bad: { ...themes.ink!, background: "url(javascript:alert(1))" },
    }),
  ).toThrow();
  expect(() => parseSite({ ...starterSite, theme: "missing" })).toThrow(
    /theme/i,
  );
});
