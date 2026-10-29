export const sectionDefinitions = {
  hero: { label: "Hero", layouts: ["centered", "split", "wide"] },
  about: { label: "About", layouts: ["wide", "split", "centered"] },
  rich_text: { label: "Rich text", layouts: ["wide", "centered"] },
  projects: { label: "Projects", layouts: ["cards", "wide", "split"] },
  experience: { label: "Experience / timeline", layouts: ["timeline", "wide"] },
  skills: { label: "Skills", layouts: ["cards", "wide"] },
  media: { label: "Image / media", layouts: ["wide", "split", "centered"] },
  gallery: { label: "Gallery", layouts: ["cards", "wide"] },
  contact: { label: "Contact", layouts: ["centered", "wide"] },
  cta: { label: "Call to action", layouts: ["centered", "split"] },
} as const;

export const layoutIds = [
  "centered",
  "wide",
  "split",
  "cards",
  "timeline",
] as const;

/** Safe layout adjustments shared by project validation and editor controls. */
export const sectionSpacings = ["compact", "comfortable", "spacious"] as const;
export const sectionAlignments = ["start", "center", "end"] as const;
export const sectionContentWidths = ["narrow", "normal", "wide"] as const;
export const sectionImagePositions = ["top", "center", "bottom"] as const;
/** Object keys retain the registry's supported type union. */
export const sectionTypes = Object.keys(sectionDefinitions) as Array<
  keyof typeof sectionDefinitions
>;
