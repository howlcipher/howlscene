import { useEffect, useState } from "react";
import {
  themes,
  resolveTheme,
  parseSite,
  themeCardStyles,
  themeNavigationStyles,
  themeMobileNavigationLayouts,
  type SiteConfig,
} from "../../../packages/core/src/index";
export interface ProjectActions {
  commit(next: SiteConfig | ((current: SiteConfig) => SiteConfig)): void;
  perform(action: () => SiteConfig): void;
  setError(message: string): void;
}
function TitleInput({
  value,
  onChange,
  onInvalid,
}: {
  value: string;
  onChange: (value: string) => void;
  onInvalid: () => void;
}) {
  const [draft, setDraft] = useState(value);
  useEffect(() => setDraft(value), [value]);
  return (
    <input
      value={draft}
      maxLength={200}
      onChange={(e) => {
        setDraft(e.target.value);
        if (e.target.value.trim()) onChange(e.target.value);
      }}
      onBlur={() => {
        if (!draft.trim()) {
          setDraft(value);
          onInvalid();
        }
      }}
    />
  );
}
export function AppearancePanel({
  site,
  actions,
}: {
  site: SiteConfig;
  actions: ProjectActions;
}) {
  const { commit, perform, setError } = actions;
  const themeWarnings = resolveTheme(
    themes[site.theme]!,
    site.overrides,
  ).warnings;
  return (
    <>
      <label>
        Website title
        <TitleInput
          value={site.title}
          onChange={(title) => commit({ ...site, title })}
          onInvalid={() =>
            setError(
              "Add a website title before leaving this field. The previous title has been kept.",
            )
          }
        />
      </label>
      <label>
        Website description
        <textarea
          rows={2}
          value={site.description}
          maxLength={500}
          onChange={(e) => commit({ ...site, description: e.target.value })}
        />
      </label>
      <details>
        <summary>Search and sharing settings</summary>
        <label>
          Published website address (optional)
          <input
            type="url"
            key={site.canonical}
            defaultValue={site.canonical ?? ""}
            onBlur={(e) => {
              const { canonical: previous, ...rest } = site;
              void previous;
              perform(() =>
                parseSite(
                  e.target.value
                    ? { ...rest, canonical: e.target.value }
                    : rest,
                ),
              );
            }}
          />
        </label>
        <label className="checkbox">
          <input
            type="checkbox"
            checked={site.indexable}
            onChange={(e) => commit({ ...site, indexable: e.target.checked })}
          />
          Allow search indexing
        </label>
      </details>
      <label>
        Visual theme
        <select
          value={site.theme}
          onChange={(e) =>
            commit({ ...site, theme: e.target.value as SiteConfig["theme"] })
          }
        >
          {Object.entries(themes).map(([id, t]) => (
            <option key={id} value={id}>
              {t.name}
            </option>
          ))}
        </select>
      </label>
      {themeWarnings.map((warning) => (
        <p className="notice" key={warning}>
          {warning}
        </p>
      ))}
      {site.experience === "cinematic" && (
        <details open>
          <summary>Cinematic movement</summary>
          <label className="checkbox">
            <input
              type="checkbox"
              checked={site.cameraJourney.enabled}
              onChange={(event) =>
                commit({
                  ...site,
                  cameraJourney: {
                    ...site.cameraJourney,
                    enabled: event.target.checked,
                  },
                })
              }
            />
            Use Camera Journey
          </label>
          {site.cameraJourney.enabled && (
            <>
              <label>
                Camera movement
                <select
                  value={site.cameraJourney.movement}
                  onChange={(event) =>
                    commit({
                      ...site,
                      cameraJourney: {
                        ...site.cameraJourney,
                        movement: event.target
                          .value as SiteConfig["cameraJourney"]["movement"],
                      },
                    })
                  }
                >
                  <option value="diagonal">Diagonal drift</option>
                  <option value="pan">Side-to-side pan</option>
                  <option value="push">Camera push</option>
                </select>
              </label>
              <label>
                Camera intensity
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={site.cameraJourney.intensity}
                  onChange={(event) =>
                    commit({
                      ...site,
                      cameraJourney: {
                        ...site.cameraJourney,
                        intensity: Number(event.target.value),
                      },
                    })
                  }
                />
              </label>
              <label>
                Parallax depth
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={site.cameraJourney.parallaxDepth}
                  onChange={(event) =>
                    commit({
                      ...site,
                      cameraJourney: {
                        ...site.cameraJourney,
                        parallaxDepth: Number(event.target.value),
                      },
                    })
                  }
                />
              </label>
              <label>
                Scroll distance
                <input
                  type="range"
                  min="0.5"
                  max="2"
                  step="0.1"
                  value={site.cameraJourney.distance}
                  onChange={(event) =>
                    commit({
                      ...site,
                      cameraJourney: {
                        ...site.cameraJourney,
                        distance: Number(event.target.value),
                      },
                    })
                  }
                />
              </label>
            </>
          )}
        </details>
      )}
      <div className="two-controls">
        <label>
          Background color
          <input
            type="color"
            value={site.overrides.background ?? themes[site.theme]!.background}
            onChange={(e) =>
              commit({
                ...site,
                overrides: { ...site.overrides, background: e.target.value },
              })
            }
          />
        </label>
        <label>
          Text color
          <input
            type="color"
            value={site.overrides.foreground ?? themes[site.theme]!.foreground}
            onChange={(e) =>
              commit({
                ...site,
                overrides: { ...site.overrides, foreground: e.target.value },
              })
            }
          />
        </label>
      </div>
      <div className="two-controls">
        <label>
          Accent color
          <input
            type="color"
            value={site.overrides.accent ?? themes[site.theme]!.accent}
            onChange={(e) =>
              commit({
                ...site,
                overrides: { ...site.overrides, accent: e.target.value },
              })
            }
          />
        </label>
        <label>
          Font
          <select
            value={site.overrides.font ?? ""}
            onChange={(e) =>
              commit({
                ...site,
                overrides: {
                  ...site.overrides,
                  font: (e.target.value ||
                    undefined) as SiteConfig["overrides"]["font"],
                },
              })
            }
          >
            <option value="">Theme default</option>
            <option value="system">System sans</option>
            <option value="serif">Serif</option>
            <option value="mono">Monospace</option>
          </select>
        </label>
      </div>
      <details>
        <summary>More style choices</summary>
        <label>
          Card appearance
          <select
            value={site.overrides.cardStyle ?? ""}
            onChange={(e) =>
              commit({
                ...site,
                overrides: {
                  ...site.overrides,
                  cardStyle: (e.target.value ||
                    undefined) as SiteConfig["overrides"]["cardStyle"],
                },
              })
            }
          >
            <option value="">Theme default</option>
            {themeCardStyles.map((value) => (
              <option key={value} value={value}>
                {value === "glow"
                  ? "Accent glow"
                  : value[0]!.toUpperCase() + value.slice(1)}
              </option>
            ))}
          </select>
        </label>
        <label>
          Navigation link style
          <select
            value={site.overrides.navigationStyle ?? ""}
            onChange={(e) =>
              commit({
                ...site,
                overrides: {
                  ...site.overrides,
                  navigationStyle: (e.target.value ||
                    undefined) as SiteConfig["overrides"]["navigationStyle"],
                },
              })
            }
          >
            <option value="">Theme default</option>
            {themeNavigationStyles.map((value) => (
              <option key={value} value={value}>
                {value[0]!.toUpperCase() + value.slice(1)}
              </option>
            ))}
          </select>
        </label>
        <label>
          Phone navigation layout
          <select
            value={site.overrides.mobileNavigationLayout ?? ""}
            onChange={(e) =>
              commit({
                ...site,
                overrides: {
                  ...site.overrides,
                  mobileNavigationLayout: (e.target.value ||
                    undefined) as SiteConfig["overrides"]["mobileNavigationLayout"],
                },
              })
            }
          >
            <option value="">Theme default</option>
            {themeMobileNavigationLayouts.map((value) => (
              <option key={value} value={value}>
                {value === "wrap" ? "Wrap links" : "Stack links"}
              </option>
            ))}
          </select>
        </label>
      </details>
      <label>
        Choose animation style
        <select
          value={site.motion}
          onChange={(e) =>
            commit({
              ...site,
              motion: e.target.value as SiteConfig["motion"],
            })
          }
        >
          {["none", "calm", "cinematic", "dynamic"].map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
      </label>
      <label>
        Motion intensity
        <input
          type="range"
          min="0"
          max="1"
          step="0.1"
          value={site.motionSettings.intensity}
          onChange={(e) =>
            commit({
              ...site,
              motionSettings: {
                ...site.motionSettings,
                intensity: Number(e.target.value),
              },
            })
          }
        />
      </label>
      <label>
        Motion speed
        <input
          type="range"
          min="0.5"
          max="2"
          step="0.1"
          value={site.motionSettings.speed}
          onChange={(e) =>
            commit({
              ...site,
              motionSettings: {
                ...site.motionSettings,
                speed: Number(e.target.value),
              },
            })
          }
        />
      </label>
    </>
  );
}
