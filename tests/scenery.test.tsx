import { expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { Scenery } from "../packages/core/src/scenery";

it("original theme scenes are distinct and have bounded depth layers", () => {
  const scenes = ["ink", "cyber", "modern"].map((theme) =>
    renderToStaticMarkup(<Scenery theme={theme} />),
  );
  expect(new Set(scenes).size).toBe(3);
  for (const html of scenes) {
    const depths = [...html.matchAll(/data-depth="([0-9.]+)"/g)].map((match) =>
      Number(match[1]),
    );
    expect(depths.length).toBeGreaterThanOrEqual(3);
    expect(depths.length).toBeLessThanOrEqual(6);
    expect(depths.every((depth) => depth >= 0 && depth <= 1)).toBe(true);
  }
  expect(scenes[0]).toContain("scenery-mist");
  expect(scenes[1]).toContain("scenery-skyline");
  expect(scenes[2]).toContain("scenery-orbit");
});
it("scenery is hidden decorative markup without links, scripts, external references or animation loops", () => {
  for (const theme of ["ink", "cyber", "modern"]) {
    const html = renderToStaticMarkup(<Scenery theme={theme} />);
    expect(html).toContain('aria-hidden="true"');
    expect(html).toContain('focusable="false"');
    expect(html).not.toMatch(
      /<(?:a|button|script|animate|image|foreignObject)\b|\b(?:href|tabindex|role)=|url\(/i,
    );
  }
});
it("unknown themes receive the quiet modern fallback", () => {
  expect(renderToStaticMarkup(<Scenery theme="unregistered-theme" />)).toBe(
    renderToStaticMarkup(<Scenery theme="modern" />),
  );
});
