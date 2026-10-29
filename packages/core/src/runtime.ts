import { enhanceSite } from "./enhance.js";
const disposers = Array.from(
  document.querySelectorAll<HTMLElement>(".howlscene"),
  enhanceSite,
);
window.addEventListener(
  "pagehide",
  () => {
    for (const dispose of disposers) dispose();
  },
  { once: true },
);
