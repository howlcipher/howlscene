import { type ReactElement } from "react";
import { z } from "zod";
import {
  builtinArtworkDescriptors,
  registryIdSchema,
} from "./artwork_contract.js";
/** Trusted developer artwork; imported project data never supplies render functions. */
export interface ArtworkDefinition {
  readonly render: () => ReactElement | null;
  readonly className?: string;
}
export type ArtworkRegistry = Readonly<Record<string, ArtworkDefinition>>;
function InkSky(): ReactElement {
  return (
    <>
      <circle cx="1130" cy="180" r="83" />
      <path d="M1040 184q93-6 178 3M1054 203q70-8 144 1" />
    </>
  );
}
function InkMountains(): ReactElement {
  return (
    <>
      <path d="M-60 580 40 452 90 476 208 281 259 338 301 322 447 557 513 496 610 634 717 533 840 664 953 472 1005 511 1131 267 1190 352 1247 326 1480 590V900H-60Z" />
      <path
        className="scenery-mountain-veins"
        d="m208 281-29 179-61 62m183-200 33 133 65 94m732-282-42 195-65 73m223-209-12 137 53 70"
      />
    </>
  );
}
function InkMist(): ReactElement {
  return (
    <>
      <path d="M-40 530c218-80 339 108 562 63s314-37 485-9 307-92 473-68v122c-213-26-350 100-565 64S631 642 403 697 90 651-40 684Z" />
      <path d="M-40 700c250-93 390 14 602-25s373 66 550-14 262-16 368-30v88c-188 12-234 85-450 77S646 740 431 793 119 742-40 813Z" />
    </>
  );
}
function InkRidges(): ReactElement {
  return (
    <>
      <path d="M-50 760Q95 606 205 677t206 118q154-124 296-35t243-2q185-153 322-108t218 164V930H-50Z" />
      <path
        className="scenery-ink-edge"
        d="M-40 851q227-105 421-4t396-12q216-67 388-20t315 31v84H-40Z"
      />
    </>
  );
}
function CyberHorizon(): ReactElement {
  return (
    <>
      <circle cx="1116" cy="264" r="132" />
      <path d="M983 259h266m-260 24h254m-243 24h226m-211 24h192m-166 24h139" />
    </>
  );
}
function CyberCityDistant(): ReactElement {
  return (
    <>
      <path d="M0 653V468h51v-91h24v91h43v-42h49v151h41V354h67v-51h13v51h52v190h58V438h53v-68h45v287h395V435h58v-76h34v76h46V302h66v-63h14v63h54v217h39V383h67v-57h30v57h40v269h56V444h64v-35h57v244Z" />
    </>
  );
}
function CyberCityNear(): ReactElement {
  return (
    <>
      <path d="M-20 900V581h54V459h102v356h44V539h69v-59h57v420Zm1000 0V583h72v-47h67v231h42V428h115v-83h17v83h56v200h44V521h67v379Z" />
      <path
        className="scenery-city-neon"
        d="M51 475h69v183M196 556h36v167M997 600h42v104m140-260h80v177m13-176v242m82-150h40v182"
      />
      <path
        className="scenery-city-windows"
        d="M59 504h15m10 0h15m-40 22h15m10 0h15m-40 22h15m10 0h15m110 31h13m-13 22h13m-13 22h13m958-157h18m12 0h18m-48 25h18m12 0h18m-48 25h18m12 0h18"
      />
    </>
  );
}
function CyberGrid(): ReactElement {
  return (
    <>
      <path d="M0 899 680 640m-440 259 455-259m-215 259 230-259m10 259V640m240 259L735 640m465 259L750 640m690 259L765 640M0 899h1440M118 853h1204M239 807h962M361 761h719M482 715h477M603 669h234" />
    </>
  );
}
function ModernPaper(): ReactElement {
  return (
    <>
      <path d="M865-100c-67 234 352 255 303 462S985 641 1101 939h441V-100Z" />
    </>
  );
}
function ModernOrbit(): ReactElement {
  return (
    <>
      <circle cx="1329" cy="248" r="291" />
      <circle cx="1329" cy="248" r="221" />
      <path d="M1130 630h246M1253 507v246" />
    </>
  );
}
function ModernRibbon(): ReactElement {
  return (
    <>
      <path d="M-117 816C122 521 271 639 438 791S730 1043 915 931v181H-117Z" />
      <path d="M-30 855C156 668 287 769 399 861" />
    </>
  );
}
const builtinArtwork: Record<
  keyof typeof builtinArtworkDescriptors,
  ArtworkDefinition
> = {
  "ink-sky": {
    render: InkSky,
    className: builtinArtworkDescriptors["ink-sky"].className,
  },
  "ink-mountains": {
    render: InkMountains,
    className: builtinArtworkDescriptors["ink-mountains"].className,
  },
  "ink-mist": {
    render: InkMist,
    className: builtinArtworkDescriptors["ink-mist"].className,
  },
  "ink-ridges": {
    render: InkRidges,
    className: builtinArtworkDescriptors["ink-ridges"].className,
  },
  "cyber-horizon": {
    render: CyberHorizon,
    className: builtinArtworkDescriptors["cyber-horizon"].className,
  },
  "cyber-city-distant": {
    render: CyberCityDistant,
    className: builtinArtworkDescriptors["cyber-city-distant"].className,
  },
  "cyber-city-near": {
    render: CyberCityNear,
    className: builtinArtworkDescriptors["cyber-city-near"].className,
  },
  "cyber-grid": {
    render: CyberGrid,
    className: builtinArtworkDescriptors["cyber-grid"].className,
  },
  "modern-paper": {
    render: ModernPaper,
    className: builtinArtworkDescriptors["modern-paper"].className,
  },
  "modern-orbit": {
    render: ModernOrbit,
    className: builtinArtworkDescriptors["modern-orbit"].className,
  },
  "modern-ribbon": {
    render: ModernRibbon,
    className: builtinArtworkDescriptors["modern-ribbon"].className,
  },
};
const definitionSchema = z.strictObject({
  render: z.custom<() => ReactElement | null>(
    (value) =>
      typeof value === "function" &&
      value.constructor.name !== "AsyncFunction" &&
      value.constructor.name !== "GeneratorFunction" &&
      value.constructor.name !== "AsyncGeneratorFunction",
    "Artwork must be a trusted synchronous render function.",
  ),
  className: z
    .string()
    .max(300)
    .regex(
      /^[a-zA-Z_][a-zA-Z0-9_-]*(?: [a-zA-Z_][a-zA-Z0-9_-]*)*$/,
      "Use a space-separated list of safe class names.",
    )
    .optional(),
});
/** Creates an isolated immutable registry. Registered functions are trusted code,
 * not portable configuration, and must return a React element or null synchronously.
 */
export function createArtworkRegistry(
  additions: Record<string, ArtworkDefinition> = {},
): ArtworkRegistry {
  const registry: Record<string, ArtworkDefinition> = {};
  for (const [id, definition] of Object.entries({
    ...builtinArtwork,
    ...additions,
  })) {
    registryIdSchema.parse(id);
    const { render, className } = definitionSchema.parse(definition);
    registry[id] = Object.freeze(
      className === undefined ? { render } : { render, className },
    );
  }
  return Object.freeze(registry);
}
export const defaultArtworkRegistry = createArtworkRegistry();
