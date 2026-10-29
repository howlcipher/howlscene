import { useRef } from "react";
import {
  parseSite,
  type SiteConfig,
  type SectionConfig,
} from "../../../packages/core/src/index";
export function EntryControls({
  site,
  section,
  update,
  perform,
}: {
  site: SiteConfig;
  section: SectionConfig;
  update: (patch: Partial<SectionConfig>) => void;
  perform: (action: () => SiteConfig) => void;
}) {
  const addButton = useRef<HTMLButtonElement>(null);
  return (
    <>
      {" "}
      {["projects", "experience", "skills", "gallery"].includes(
        section.type,
      ) && (
        <div className="entry-controls">
          <h3>Items in this section</h3>
          {section.entries.map((entry, i) => (
            <fieldset key={entry.id}>
              <legend>Item {i + 1}</legend>
              <label>
                Item title
                <input
                  maxLength={300}
                  value={entry.title}
                  onChange={(e) =>
                    update({
                      entries: section.entries.map((item) =>
                        item.id === entry.id
                          ? { ...item, title: e.target.value }
                          : item,
                      ),
                    })
                  }
                />
              </label>
              <label>
                Item description
                <textarea
                  maxLength={30000}
                  value={entry.body}
                  onChange={(e) =>
                    update({
                      entries: section.entries.map((item) =>
                        item.id === entry.id
                          ? { ...item, body: e.target.value }
                          : item,
                      ),
                    })
                  }
                />
              </label>
              <label>
                Item link (https:// or mailto:)
                <input
                  type="url"
                  key={entry.url}
                  defaultValue={entry.url ?? ""}
                  onBlur={(e) =>
                    perform(() =>
                      parseSite({
                        ...site,
                        sections: site.sections.map((s) =>
                          s.id === section.id
                            ? {
                                ...s,
                                entries: s.entries.map((item) => {
                                  if (item.id !== entry.id) return item;
                                  const { url: previous, ...rest } = item;
                                  void previous;
                                  return e.target.value
                                    ? { ...rest, url: e.target.value }
                                    : rest;
                                }),
                              }
                            : s,
                        ),
                      }),
                    )
                  }
                />
              </label>
              <label>
                Item image
                <select
                  value={entry.image ?? ""}
                  onChange={(e) =>
                    update({
                      entries: section.entries.map((item) =>
                        item.id === entry.id
                          ? { ...item, image: e.target.value || undefined }
                          : item,
                      ),
                    })
                  }
                >
                  <option value="">No image</option>
                  {site.assets.map((a) => (
                    <option value={a.id} key={a.id}>
                      {a.alt || "Uploaded image"}
                    </option>
                  ))}
                </select>
              </label>
              <button
                onClick={() => {
                  if (
                    !confirm("Remove this item? You can restore it with Undo.")
                  )
                    return;
                  update({
                    entries: section.entries.filter(
                      (item) => item.id !== entry.id,
                    ),
                  });
                  requestAnimationFrame(() => addButton.current?.focus());
                }}
              >
                Remove item {i + 1}
              </button>
            </fieldset>
          ))}
          <button
            ref={addButton}
            disabled={section.entries.length >= 100}
            onClick={() =>
              update({
                entries: [
                  ...section.entries,
                  {
                    id: `item-${crypto.randomUUID()}`,
                    title: "New item",
                    body: "",
                  },
                ],
              })
            }
          >
            Add item
          </button>
        </div>
      )}
    </>
  );
}
