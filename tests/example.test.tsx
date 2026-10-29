import { describe, it, expect } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { Site, parseSite } from "../packages/core/src/index";
import {
  williamSite,
  originalPortfolioUrl,
} from "../examples/william_elias/site";
describe("William Elias public example", () => {
  it("THM-001 renders identical professional content through every bundled theme", () => {
    const snapshots = [];
    for (const theme of ["ink", "cyber", "modern"] as const) {
      const site = parseSite({ ...williamSite, theme });
      const html = renderToStaticMarkup(createElement(Site, { site }));
      expect(html).toContain("William Elias");
      expect(html).toContain(originalPortfolioUrl);
      expect(html).toContain("Independent projects");
      expect(html).toContain("not employer production systems");
      snapshots.push(site.sections);
    }
    expect(snapshots[0]).toEqual(snapshots[1]);
    expect(snapshots[1]).toEqual(snapshots[2]);
  });
  it("links only public professional references with validated portable text", () => {
    expect(originalPortfolioUrl).toBe(
      "https://howlcipher.github.io/william_elias/",
    );
    expect(parseSite(williamSite)).toEqual(williamSite);
    expect(williamSite.assets).toHaveLength(0);
  });
});
