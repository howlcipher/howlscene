import { EntryControls } from "./EntryControls";
import {
  sectionDefinitions,
  parseSite,
  sectionSpacings,
  sectionAlignments,
  sectionContentWidths,
  cinematicTransitions,
  type BuiltinSectionType,
  type SiteConfig,
  type SectionConfig,
} from "../../../packages/core/src/index";
import {
  addSection,
  duplicateSection,
  removeSection,
  reorderSection,
} from "../model";
import { RichEditor } from "../RichEditor";
import type { ProjectActions } from "./AppearancePanel";
export function SectionPanel({
  site,
  section,
  actions,
  selection,
  onImage,
}: {
  site: SiteConfig;
  section: SectionConfig;
  actions: ProjectActions;
  selection: {
    newType: BuiltinSectionType;
    setNewType: (type: BuiltinSectionType) => void;
    setSelected: (id: string) => void;
  };
  onImage: (file: File, sectionId: string) => void;
}) {
  const { commit, perform, setError } = actions;
  const { newType, setNewType, setSelected } = selection;
  const position = site.sections.findIndex((s) => s.id === section.id);
  const definition =
    section.type === "custom" ? undefined : sectionDefinitions[section.type];
  function update(patch: Partial<SectionConfig>) {
    commit({
      ...site,
      sections: site.sections.map((s) =>
        s.id === section.id ? { ...s, ...patch } : s,
      ),
    });
  }
  const rich = section.richText.length
    ? section.richText
    : [
        {
          type: "paragraph" as const,
          spans: [{ text: section.body, bold: false, italic: false }],
        },
      ];
  return (
    <>
      <h2>Website sections</h2>
      <ol className="section-list">
        {site.sections.map((s) => (
          <li key={s.id}>
            <button
              aria-pressed={s.id === section.id}
              onClick={() => setSelected(s.id)}
            >
              {s.heading || "Untitled section"}
              {s.visible ? "" : " (hidden)"}
            </button>
          </li>
        ))}
      </ol>
      <label>
        New section type
        <select
          value={newType}
          onChange={(e) => setNewType(e.target.value as BuiltinSectionType)}
        >
          {Object.entries(sectionDefinitions).map(([id, definition]) => (
            <option key={id} value={id}>
              {definition.label}
            </option>
          ))}
        </select>
      </label>
      <button
        onClick={() => {
          const id = `section-${crypto.randomUUID()}`;
          perform(() => addSection(site, newType, id));
          setSelected(id);
        }}
      >
        Add a section
      </button>
      <fieldset>
        <legend>
          Editing:{" "}
          {definition?.label ?? `Custom section (${section.customType})`}
        </legend>
        <label>
          Edit heading
          <input
            value={section.heading}
            maxLength={300}
            onChange={(e) => update({ heading: e.target.value })}
          />
        </label>
        <div>
          <RichEditor
            key={section.id}
            value={rich}
            onChange={(doc) => update({ richText: doc })}
            onError={setError}
          />
        </div>
        <details>
          <summary>
            Plain text alternative (removes formatting when edited)
          </summary>
          <label>
            Edit introduction
            <textarea
              maxLength={30000}
              rows={6}
              value={
                section.richText.length
                  ? section.richText
                      .map((b) =>
                        b.type === "list"
                          ? b.items
                              .map((item) => item.map((s) => s.text).join(""))
                              .join("\n")
                          : b.spans.map((s) => s.text).join(""),
                      )
                      .join("\n")
                  : section.body
              }
              onChange={(e) => update({ body: e.target.value, richText: [] })}
            />
          </label>
        </details>
        <EntryControls
          site={site}
          section={section}
          update={update}
          perform={perform}
        />
        <label>
          Section link
          <input
            type="url"
            key={`${section.id}-${section.link}`}
            defaultValue={section.link ?? ""}
            onBlur={(e) => {
              const { link: previous, ...rest } = section;
              void previous;
              perform(() =>
                parseSite({
                  ...site,
                  sections: site.sections.map((s) =>
                    s.id === section.id
                      ? e.target.value
                        ? { ...rest, link: e.target.value }
                        : rest
                      : s,
                  ),
                }),
              );
            }}
          />
        </label>
        {section.link && (
          <label>
            Link button text
            <input
              maxLength={100}
              value={section.linkLabel}
              onChange={(e) => update({ linkLabel: e.target.value })}
            />
          </label>
        )}
        <label>
          Layout
          <select
            value={section.layout}
            onChange={(e) =>
              update({ layout: e.target.value as SectionConfig["layout"] })
            }
          >
            {(definition?.layouts ?? [section.layout]).map((layout) => (
              <option key={layout}>{layout}</option>
            ))}
          </select>
        </label>
        {site.experience === "cinematic" && (
          <label>
            Transition style
            <select
              value={section.transition}
              onChange={(e) =>
                update({
                  transition: e.target.value as SectionConfig["transition"],
                })
              }
            >
              {cinematicTransitions.map((transition) => (
                <option key={transition} value={transition}>
                  {transition === "none"
                    ? "None"
                    : transition
                        .split("-")
                        .map((word) => word[0]!.toUpperCase() + word.slice(1))
                        .join(" ")}
                </option>
              ))}
            </select>
          </label>
        )}
        <label>
          Section spacing
          <select
            value={section.spacing}
            onChange={(e) =>
              update({ spacing: e.target.value as SectionConfig["spacing"] })
            }
          >
            {sectionSpacings.map((value) => (
              <option key={value} value={value}>
                {value[0]!.toUpperCase() + value.slice(1)}
              </option>
            ))}
          </select>
        </label>
        <label>
          Content alignment
          <select
            value={section.alignment}
            onChange={(e) =>
              update({
                alignment: e.target.value as SectionConfig["alignment"],
              })
            }
          >
            {sectionAlignments.map((value) => (
              <option key={value} value={value}>
                {value === "start"
                  ? "Left edge"
                  : value === "end"
                    ? "Right edge"
                    : "Center"}
              </option>
            ))}
          </select>
        </label>
        <label>
          Content width
          <select
            value={section.contentWidth}
            onChange={(e) =>
              update({
                contentWidth: e.target.value as SectionConfig["contentWidth"],
              })
            }
          >
            {sectionContentWidths.map((value) => (
              <option key={value} value={value}>
                {value[0]!.toUpperCase() + value.slice(1)}
              </option>
            ))}
          </select>
        </label>
        <label className="checkbox">
          <input
            type="checkbox"
            checked={section.inNavigation}
            onChange={(e) => update({ inNavigation: e.target.checked })}
          />
          Include in navigation
        </label>
        {section.inNavigation && (
          <label>
            Navigation label
            <input
              maxLength={100}
              value={section.navigationLabel ?? ""}
              onChange={(e) =>
                update({ navigationLabel: e.target.value || undefined })
              }
            />
          </label>
        )}
        <label>
          Image treatment
          <select
            value={section.imageTreatment}
            onChange={(e) =>
              update({
                imageTreatment: e.target
                  .value as SectionConfig["imageTreatment"],
              })
            }
          >
            <option value="inline">Within content</option>
            <option value="background">Background scenery</option>
          </select>
        </label>
        {section.image && (
          <label>
            Image position
            <select
              value={section.imagePosition}
              onChange={(e) =>
                update({
                  imagePosition: e.target
                    .value as SectionConfig["imagePosition"],
                })
              }
            >
              <option value="top">Top</option>
              <option value="center">Center</option>
              <option value="bottom">Bottom</option>
            </select>
          </label>
        )}
        <label className="checkbox">
          <input
            type="checkbox"
            checked={section.visible}
            onChange={(e) => update({ visible: e.target.checked })}
          />
          Show this section
        </label>
        <label>
          {site.experience === "cinematic"
            ? "Change scenery"
            : "Change section image"}
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              onImage(file, section.id);
              e.target.value = "";
            }}
          />
        </label>
        {section.image && (
          <>
            <label>
              Image description (alt text)
              <input
                value={
                  site.assets.find((a) => a.id === section.image)?.alt ?? ""
                }
                onChange={(e) =>
                  commit({
                    ...site,
                    assets: site.assets.map((a) =>
                      a.id === section.image
                        ? { ...a, alt: e.target.value }
                        : a,
                    ),
                  })
                }
              />
            </label>
            <button onClick={() => update({ image: undefined })}>
              Remove image
            </button>
          </>
        )}
        <div className="button-row">
          <button
            disabled={position === 0}
            onClick={() =>
              perform(() => reorderSection(site, section.id, position - 1))
            }
          >
            Move section up
          </button>
          <button
            disabled={position === site.sections.length - 1}
            onClick={() =>
              perform(() => reorderSection(site, section.id, position + 1))
            }
          >
            Move section down
          </button>
          <button
            onClick={() =>
              perform(() =>
                duplicateSection(
                  site,
                  section.id,
                  `section-${crypto.randomUUID()}`,
                ),
              )
            }
          >
            Duplicate section
          </button>
          <button
            disabled={site.sections.length === 1}
            onClick={() => {
              if (
                confirm("Delete this section? You can restore it with Undo.")
              ) {
                perform(() => removeSection(site, section.id));
                selection.setSelected(
                  site.sections.find((s) => s.id !== section.id)!.id,
                );
                requestAnimationFrame(() =>
                  document
                    .querySelector<HTMLButtonElement>(
                      ".section-list [aria-pressed=true]",
                    )
                    ?.focus(),
                );
              }
            }}
          >
            Delete section
          </button>
        </div>
      </fieldset>
    </>
  );
}
