import type { ReactNode } from "react";

function Layer({
  depth,
  className,
  children,
}: {
  depth: number;
  className: string;
  children: ReactNode;
}) {
  return (
    <svg
      className={`scenery-layer scene-layer ${className}`}
      data-depth={depth}
      viewBox="0 0 1440 900"
      preserveAspectRatio="xMidYMax slice"
      focusable="false"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

function Ink() {
  return (
    <>
      <Layer depth={0.08} className="scenery-ink-sky">
        <circle cx="1130" cy="180" r="83" />
        <path d="M1040 184q93-6 178 3M1054 203q70-8 144 1" />
      </Layer>
      <Layer depth={0.2} className="scenery-mountains">
        <path d="M-60 580 40 452 90 476 208 281 259 338 301 322 447 557 513 496 610 634 717 533 840 664 953 472 1005 511 1131 267 1190 352 1247 326 1480 590V900H-60Z" />
        <path
          className="scenery-mountain-veins"
          d="m208 281-29 179-61 62m183-200 33 133 65 94m732-282-42 195-65 73m223-209-12 137 53 70"
        />
      </Layer>
      <Layer depth={0.35} className="scenery-mist">
        <path d="M-40 530c218-80 339 108 562 63s314-37 485-9 307-92 473-68v122c-213-26-350 100-565 64S631 642 403 697 90 651-40 684Z" />
        <path d="M-40 700c250-93 390 14 602-25s373 66 550-14 262-16 368-30v88c-188 12-234 85-450 77S646 740 431 793 119 742-40 813Z" />
      </Layer>
      <Layer depth={0.62} className="scenery-ink-ridges">
        <path d="M-50 760Q95 606 205 677t206 118q154-124 296-35t243-2q185-153 322-108t218 164V930H-50Z" />
        <path
          className="scenery-ink-edge"
          d="M-40 851q227-105 421-4t396-12q216-67 388-20t315 31v84H-40Z"
        />
      </Layer>
    </>
  );
}
function Cyber() {
  return (
    <>
      <Layer depth={0.08} className="scenery-cyber-horizon">
        <circle cx="1116" cy="264" r="132" />
        <path d="M983 259h266m-260 24h254m-243 24h226m-211 24h192m-166 24h139" />
      </Layer>
      <Layer depth={0.22} className="scenery-skyline scenery-city-distant">
        <path d="M0 653V468h51v-91h24v91h43v-42h49v151h41V354h67v-51h13v51h52v190h58V438h53v-68h45v287h395V435h58v-76h34v76h46V302h66v-63h14v63h54v217h39V383h67v-57h30v57h40v269h56V444h64v-35h57v244Z" />
      </Layer>
      <Layer depth={0.46} className="scenery-skyline scenery-city-near">
        <path d="M-20 900V581h54V459h102v356h44V539h69v-59h57v420Zm1000 0V583h72v-47h67v231h42V428h115v-83h17v83h56v200h44V521h67v379Z" />
        <path
          className="scenery-city-neon"
          d="M51 475h69v183M196 556h36v167M997 600h42v104m140-260h80v177m13-176v242m82-150h40v182"
        />
        <path
          className="scenery-city-windows"
          d="M59 504h15m10 0h15m-40 22h15m10 0h15m-40 22h15m10 0h15m110 31h13m-13 22h13m-13 22h13m958-157h18m12 0h18m-48 25h18m12 0h18m-48 25h18m12 0h18"
        />
      </Layer>
      <Layer depth={0.7} className="scenery-cyber-grid">
        <path d="M0 899 680 640m-440 259 455-259m-215 259 230-259m10 259V640m240 259L735 640m465 259L750 640m690 259L765 640M0 899h1440M118 853h1204M239 807h962M361 761h719M482 715h477M603 669h234" />
      </Layer>
    </>
  );
}
function Modern() {
  return (
    <>
      <Layer depth={0.08} className="scenery-modern-paper">
        <path d="M865-100c-67 234 352 255 303 462S985 641 1101 939h441V-100Z" />
      </Layer>
      <Layer depth={0.2} className="scenery-orbit">
        <circle cx="1329" cy="248" r="291" />
        <circle cx="1329" cy="248" r="221" />
        <path d="M1130 630h246M1253 507v246" />
      </Layer>
      <Layer depth={0.38} className="scenery-modern-ribbon">
        <path d="M-117 816C122 521 271 639 438 791S730 1043 915 931v181H-117Z" />
        <path d="M-30 855C156 668 287 769 399 861" />
      </Layer>
    </>
  );
}

/** Original, static decorative artwork. Content and interaction stay outside it. */
export function Scenery({ theme }: { theme: string }) {
  const known = theme === "ink" || theme === "cyber" ? theme : "modern";
  return (
    <div className="scenery" data-theme={known} aria-hidden="true">
      {known === "ink" ? <Ink /> : known === "cyber" ? <Cyber /> : <Modern />}
      <div className="scenery-veil" />
    </div>
  );
}
