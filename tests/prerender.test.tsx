import { describe, it, expect } from "vitest";
import {
  renderLanding,
  renderExample,
  renderStory,
  injectRoot,
} from "../scripts/prerender.tsx";
describe("production prerendering", () => {
  it("renders meaningful landing links without loading browser entry points", () => {
    const html = renderLanding();
    expect(html).toContain("Your story.");
    expect(html).toContain('href="./editor/"');
    expect(html).toContain('href="./examples/william-elias/"');
    expect(html).toContain('href="./examples/ink-wash-story/"');
    expect(html).toContain("<main>");
  });
  it("renders the shared William example in Ink with working public links and an inactive theme selector", () => {
    const html = renderExample();
    expect(html).toContain("William Elias");
    expect(html).toContain('data-theme="ink"');
    expect(html).toContain("https://howlcipher.github.io/william_elias/");
    expect(html).toContain("not employer production systems");
    expect(html).toMatch(/<select[^>]*disabled=""/);
    expect(html).toContain("<noscript>");
  });
  it("prerenders all scenes and accessible navigation for the cinematic sample", () => {
    const html = renderStory();
    expect(html).toContain("Lorem ipsum dolor sit amet");
    expect(html).toContain('id="scene-5"');
    expect(html).toContain('aria-label="Story scenes"');
    expect(html).toContain("stone-bridge");
    expect(html).toContain("Artwork notes");
  });
  it("replaces exactly the application root while preserving production CSS and script links", () => {
    const shell =
      '<html><head><link rel="stylesheet" href="./assets/site.css"></head><body><div id="root"></div><script src="./assets/app.js"></script></body></html>';
    const html = injectRoot(shell, renderLanding());
    expect(html).toContain("Your story.");
    expect(html).toContain('href="./assets/site.css"');
    expect(html).toContain('src="./assets/app.js"');
    expect(() => injectRoot("<html></html>", "content")).toThrow("exactly one");
    expect(() =>
      injectRoot('<div id="root"></div><div id="root"></div>', "content"),
    ).toThrow("exactly one");
  });
});
