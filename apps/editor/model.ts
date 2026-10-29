import {
  parseSite,
  sectionDefinitions,
  type BuiltinSectionType,
  type SiteConfig,
} from "../../packages/core/src/index";

function sectionIndex(site: SiteConfig, id: string): number {
  const index = site.sections.findIndex((section) => section.id === id);
  if (index < 0) throw new Error("The selected section no longer exists.");
  return index;
}
export function addSection(
  site: SiteConfig,
  type: BuiltinSectionType,
  id: string,
): SiteConfig {
  return parseSite({
    ...site,
    sections: [
      ...site.sections,
      {
        id,
        type,
        heading: `New ${type.replace("_", " ")} section`,
        body: "",
        visible: true,
        layout: sectionDefinitions[type].layouts[0],
      },
    ],
  });
}
export function duplicateSection(
  site: SiteConfig,
  id: string,
  newId: string,
): SiteConfig {
  const index = sectionIndex(site, id);
  const sections = [...site.sections];
  sections.splice(index + 1, 0, { ...site.sections[index]!, id: newId });
  return parseSite({ ...site, sections });
}
export function removeSection(site: SiteConfig, id: string): SiteConfig {
  sectionIndex(site, id);
  if (site.sections.length === 1)
    throw new Error("Keep at least one section in your website.");
  return parseSite({
    ...site,
    sections: site.sections.filter((section) => section.id !== id),
  });
}
export function reorderSection(
  site: SiteConfig,
  id: string,
  destination: number,
): SiteConfig {
  const index = sectionIndex(site, id);
  if (
    !Number.isInteger(destination) ||
    destination < 0 ||
    destination >= site.sections.length
  )
    throw new Error("Choose a position within the section list.");
  const sections = [...site.sections];
  const [section] = sections.splice(index, 1);
  sections.splice(destination, 0, section!);
  return parseSite({ ...site, sections });
}
export interface ProjectHistory {
  past: SiteConfig[];
  present: SiteConfig;
  future: SiteConfig[];
}
/** A history entry is one committed editing operation. New edits clear redo. */
export function createHistory(site: SiteConfig): ProjectHistory {
  return { past: [], present: parseSite(site), future: [] };
}
export function commitHistory(
  history: ProjectHistory,
  site: SiteConfig,
): ProjectHistory {
  const present = parseSite(site);
  if (JSON.stringify(present) === JSON.stringify(history.present))
    return history;
  return {
    past: [...history.past, history.present].slice(-50),
    present,
    future: [],
  };
}
export function undoHistory(history: ProjectHistory): ProjectHistory {
  const previous = history.past.at(-1);
  if (!previous) return history;
  return {
    past: history.past.slice(0, -1),
    present: previous,
    future: [history.present, ...history.future],
  };
}
export function redoHistory(history: ProjectHistory): ProjectHistory {
  const next = history.future[0];
  if (!next) return history;
  return {
    past: [...history.past, history.present].slice(-50),
    present: next,
    future: history.future.slice(1),
  };
}

/** Replacing an image releases the previous asset only when no current section or item uses it. History retains its own snapshot. */
export function replaceSectionImage(
  site: SiteConfig,
  sectionId: string,
  asset: SiteConfig["assets"][number],
): SiteConfig {
  const section = site.sections.find((s) => s.id === sectionId);
  if (!section) return site;
  const sections = site.sections.map((s) =>
    s.id === sectionId ? { ...s, image: asset.id } : s,
  );
  const previousStillUsed = sections.some(
    (s) =>
      s.image === section.image ||
      s.entries.some((e) => e.image === section.image),
  );
  const assets = [
    ...site.assets.filter(
      (a) => a.id !== asset.id && (a.id !== section.image || previousStillUsed),
    ),
    asset,
  ];
  return parseSite({ ...site, sections, assets });
}
