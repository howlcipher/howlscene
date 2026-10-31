import { it, expect } from "vitest";
import { parseSite, starterSite } from "../packages/core/src/index";
import {
  replaceSectionImage,
  replaceTransitionCover,
} from "../apps/editor/model";
const image = (id: string) => ({
  id,
  mime: "image/png" as const,
  data: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII=",
  alt: "",
});
it("AST-003 image replacement releases only the previous unused asset and preserves shared images", () => {
  const a = image("asset-first"),
    b = image("asset-second");
  const initial = parseSite({
    ...starterSite,
    assets: [a],
    sections: [{ ...starterSite.sections[0], image: a.id }],
  });
  const replacement = replaceSectionImage(initial, "intro", b);
  expect(replacement.assets.map((a) => a.id)).toEqual([b.id]);
  expect(initial.assets).toEqual([a]);
  const shared = parseSite({
    ...initial,
    sections: [...initial.sections, { ...initial.sections[0], id: "other" }],
  });
  expect(
    replaceSectionImage(shared, "intro", b).assets.map((a) => a.id),
  ).toEqual([a.id, b.id]);
  expect(replaceSectionImage(initial, "missing", b)).toEqual(initial);
});

it("CIN-003 CIN-022 keeps transition artwork while replacing scenery and releases unused covers", () => {
  const scenery = image("asset-scenery");
  const cover = image("asset-cover");
  const nextScenery = image("asset-next-scenery");
  const nextCover = image("asset-next-cover");
  const initial = parseSite({
    ...starterSite,
    experience: "cinematic",
    assets: [scenery, cover],
    sections: [
      {
        ...starterSite.sections[0],
        image: scenery.id,
        transitionCover: cover.id,
      },
    ],
  });

  const sceneryChanged = replaceSectionImage(initial, "intro", nextScenery);
  expect(sceneryChanged.assets.map((asset) => asset.id)).toEqual([
    cover.id,
    nextScenery.id,
  ]);
  const coverChanged = replaceTransitionCover(
    sceneryChanged,
    "intro",
    nextCover,
  );
  expect(coverChanged.assets.map((asset) => asset.id)).toEqual([
    nextScenery.id,
    nextCover.id,
  ]);
});
