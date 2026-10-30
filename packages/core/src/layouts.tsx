import type { ComponentType, ReactNode } from "react";
import {
  layoutIds,
  sectionDefinitions,
  type BuiltinSectionType,
} from "./registry.js";
import type { SectionConfig, SiteConfig } from "./config.js";

export type LayoutSectionType = BuiltinSectionType | "custom";

/** Content slots keep the core responsible for portable semantic content. */
export interface LayoutRendererProps {
  section: SectionConfig;
  intro: ReactNode;
  image: ReactNode;
  body: ReactNode;
  entries: ReactNode;
  cta: ReactNode;
}

export interface LayoutDefinition {
  id: string;
  sectionTypes: readonly LayoutSectionType[];
  renderer: ComponentType<LayoutRendererProps>;
  /** Trusted developer CSS, scoped by the consumer to the registered layout. */
  styles?: string;
}

export type LayoutRegistry = Readonly<Record<string, LayoutDefinition>>;
export type CustomLayoutDefinition = LayoutDefinition;

function StandardLayout({
  section,
  intro,
  image,
  body,
  entries,
  cta,
}: LayoutRendererProps) {
  return (
    <div className="scene-content">
      {section.imageTreatment === "background" && image}
      <div className="scene-copy" data-readable-surface="solid">
        {intro}
        {section.imageTreatment !== "background" && image}
        {body}
      </div>
      {entries}
      {cta}
    </div>
  );
}

const builtins: Record<string, LayoutDefinition> = Object.fromEntries(
  layoutIds.map((id) => [
    id,
    Object.freeze({
      id,
      // The v1 schema historically accepts every built-in layout on every
      // section. The editor still offers only the preferred combinations.
      sectionTypes: Object.freeze([
        ...(Object.keys(sectionDefinitions) as BuiltinSectionType[]),
        "custom" as const,
      ]),
      renderer: StandardLayout,
    }),
  ]),
);

function isComponent(
  value: unknown,
): value is ComponentType<LayoutRendererProps> {
  if (typeof value === "function") return true;
  if (typeof value !== "object" || value === null) return false;
  const marker = Reflect.get(value, "$$typeof");
  return ["react.memo", "react.forward_ref", "react.lazy"].some(
    (type) => marker === Symbol.for(type),
  );
}

/** Creates an isolated registry of trusted layout renderers. */
export function createLayoutRegistry(
  additions: readonly CustomLayoutDefinition[] = [],
): LayoutRegistry {
  const result: Record<string, LayoutDefinition> = { ...builtins };
  const ids = new Set<string>();
  for (const definition of additions) {
    if (!/^[a-z][a-z0-9-]{0,63}$/.test(definition.id))
      throw Error("Layout IDs must be lowercase safe identifiers.");
    if (Object.hasOwn(builtins, definition.id))
      throw Error(
        `Custom layout ID '${definition.id}' cannot replace a built-in layout.`,
      );
    if (ids.has(definition.id))
      throw Error(`Duplicate custom layout ID '${definition.id}'.`);
    if (
      !Array.isArray(definition.sectionTypes) ||
      !definition.sectionTypes.length
    )
      throw Error(
        "A custom layout needs at least one compatible section type.",
      );
    if (
      definition.sectionTypes.some(
        (type) => type !== "custom" && !Object.hasOwn(sectionDefinitions, type),
      )
    )
      throw Error("A custom layout references an unsupported section type.");
    if (
      new Set(definition.sectionTypes).size !== definition.sectionTypes.length
    )
      throw Error("Custom layout section types must be unique.");
    if (!isComponent(definition.renderer))
      throw Error("A custom layout needs a trusted renderer component.");
    if (
      definition.styles !== undefined &&
      (typeof definition.styles !== "string" ||
        definition.styles.length > 50_000 ||
        /<\/style|@import\b|url\s*\(/i.test(definition.styles))
    )
      throw Error(
        "Layout styles must be self-contained CSS under 50,000 characters without imports or URLs.",
      );

    ids.add(definition.id);
    result[definition.id] = Object.freeze({
      id: definition.id,
      sectionTypes: Object.freeze([...definition.sectionTypes]),
      renderer: definition.renderer,
      ...(definition.styles === undefined ? {} : { styles: definition.styles }),
    });
  }
  return Object.freeze(result);
}

export const defaultLayoutRegistry = createLayoutRegistry();

export function collectLayoutStyles(
  site: Pick<SiteConfig, "sections">,
  layoutRegistry: LayoutRegistry = defaultLayoutRegistry,
): string[] {
  return [
    ...new Set(
      site.sections
        .filter((section) => section.visible)
        .map((section) => layoutRegistry[section.layout]?.styles)
        .filter((style): style is string => style !== undefined),
    ),
  ];
}
