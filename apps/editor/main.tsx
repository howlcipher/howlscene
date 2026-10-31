import { acquireDraftLock, type DraftLock } from "./draft_lock";
import { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  Site,
  starterSite,
  cinematicStarterSite,
  parseSite,
  type SiteConfig,
  type BuiltinSectionType,
  normalizeImage,
} from "../../packages/core/src/index";
import {
  createHistory,
  commitHistory,
  undoHistory,
  redoHistory,
  replaceSectionImage,
  replaceTransitionCover,
} from "./model";
import { IndexedDbDraftStore } from "./storage";
import { enhanceSite } from "../../packages/core/src/enhance";
import { AppearancePanel } from "./components/AppearancePanel";
import { SectionPanel } from "./components/SectionPanel";
import { ProjectFiles, saveFile } from "./components/ProjectFiles";
import { publishingOptions } from "../../packages/export/src/publishing";
import "../../packages/core/src/site.css";
import "./editor.css";

const onboardingSteps = [
  {
    title: "Pick a starting point",
    description:
      "Choose a portfolio or Cinematic Story template, then choose Ink Wash, Cyberpunk, or Modern Professional.",
  },
  {
    title: "Make the words yours",
    description:
      "Change the website title and introduction. Use the text buttons to add headings, bold or italic words, links, and lists.",
  },
  {
    title: "Add pictures and sections",
    description:
      "Upload a picture and describe it. Add a Projects section, then move sections to arrange your story.",
  },
  {
    title: "Try a phone preview",
    description:
      "Preview on a phone, tablet, or desktop. Try an animation style; your device's reduced-motion setting is respected.",
  },
  {
    title: "Save and publish",
    description:
      "Your draft is saved in this browser, not in the cloud. Download an editable project backup to keep another copy. Download the separate website ZIP to publish, then open its PUBLISH.txt for steps.",
  },
] as const;

function Editor() {
  const [history, setHistory] = useState(() => createHistory(starterSite));
  const site = history.present;
  const [selected, setSelected] = useState("intro");
  const [status, setStatus] = useState("Opening your local draft…");
  const [error, setError] = useState("");
  const [ready, setReady] = useState(false);
  const [canSave, setCanSave] = useState(false);
  const [store] = useState(() => new IndexedDbDraftStore());
  const [newType, setNewType] = useState<BuiltinSectionType>("projects");
  const [width, setWidth] = useState("100%");
  const [help, setHelp] = useState(false);
  const [helpStep, setHelpStep] = useState(0);
  const dirty = useRef(false);
  const saveSequence = useRef(0);
  const uploadRequests = useRef(new Map<string, symbol>());
  const previewRef = useRef<HTMLDivElement>(null);
  const sceneSignature = site.sections
    .map(
      (s) =>
        s.id +
        ":" +
        s.visible +
        ":" +
        s.animation +
        ":" +
        s.transition +
        ":" +
        s.image +
        ":" +
        s.transitionCover,
    )
    .join(",");
  useEffect(() => {
    const root = previewRef.current?.querySelector<HTMLElement>(".howlscene");
    if (root) return enhanceSite(root);
  }, [
    site.theme,
    site.experience,
    site.motion,
    site.motionSettings.intensity,
    site.motionSettings.speed,
    site.cameraJourney.enabled,
    site.cameraJourney.movement,
    site.cameraJourney.intensity,
    site.cameraJourney.distance,
    sceneSignature,
    ready,
  ]);
  const section =
    site.sections.find((s) => s.id === selected) ?? site.sections[0]!;
  useEffect(() => {
    let active = true;
    let lock: DraftLock | undefined;
    void (async () => {
      try {
        lock = await acquireDraftLock();
        if (!active) {
          lock.release();
          return;
        }
        const draft = await store.load();
        if (!active) return;
        if (draft) setHistory(createHistory(draft));
        else setHelp(true);
        setReady(true);
        setCanSave(lock.granted);
        if (!lock.granted)
          setStatus(
            lock.reason === "busy"
              ? "Another HowlScene tab is editing this draft. Automatic saving is paused here. Save a project backup before closing; reopen after closing the other editor."
              : "This browser cannot protect local saving between tabs. Automatic saving is paused. Download a project backup before closing.",
          );
      } catch {
        if (active) {
          setReady(true);
          setStatus(
            "Local draft could not be restored. Automatic saving is paused to protect it. Save a backup before leaving.",
          );
        }
      }
    })();
    return () => {
      active = false;
      store.close();
      lock?.release();
    };
  }, [store]);
  useEffect(() => {
    if (!ready || !canSave) return;
    dirty.current = true;
    setStatus("Saving changes…");
    const sequence = ++saveSequence.current;
    const timer = setTimeout(() => {
      void store.save(site).then(
        () => {
          if (sequence === saveSequence.current) {
            dirty.current = false;
            setStatus(
              "Saved on this browser. Download a backup to keep another copy.",
            );
          }
        },
        () => {
          if (sequence === saveSequence.current)
            setStatus(
              "Local saving failed. Your edits are still here. Download a project backup now.",
            );
        },
      );
    }, 350);
    return () => clearTimeout(timer);
  }, [site, store, ready, canSave]);
  useEffect(() => {
    const warn = (event: BeforeUnloadEvent) => {
      if (dirty.current) {
        event.preventDefault();
        event.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, []);
  function commit(next: SiteConfig | ((current: SiteConfig) => SiteConfig)) {
    setHistory((previous) => {
      try {
        const valid = parseSite(
          typeof next === "function" ? next(previous.present) : next,
        );
        const updated = commitHistory(previous, valid);
        if (updated !== previous) {
          dirty.current = true;
          ++saveSequence.current;
        }
        return updated;
      } catch (e) {
        queueMicrotask(() =>
          setError(
            e instanceof Error && e.name !== "ZodError"
              ? e.message
              : "This change could not be saved. Check text length, links, and image limits. Your previous content is preserved.",
          ),
        );
        return previous;
      }
    });
  }
  function perform(action: () => SiteConfig) {
    try {
      commit(action());
    } catch (e) {
      setError(e instanceof Error ? e.message : "The change failed.");
    }
  }
  async function download() {
    try {
      const { exportWebsite } = await import("../../packages/export/src/index");
      saveFile(
        new Uint8Array(await exportWebsite(site)),
        "my-website.zip",
        "application/zip",
      );
    } catch {
      setError(
        "We could not export this website. Check the project content, shorten oversized text, and try again.",
      );
    }
  }
  function uploadImage(
    file: File,
    sectionId: string,
    target: "image" | "transitionCover" = "image",
  ) {
    const requestKey = `${sectionId}:${target}`;
    const request = Symbol();
    uploadRequests.current.set(requestKey, request);
    void normalizeImage(file)
      .then((asset) => {
        if (uploadRequests.current.get(requestKey) !== request) return;
        uploadRequests.current.delete(requestKey);
        commit((current) =>
          target === "transitionCover"
            ? replaceTransitionCover(current, sectionId, asset)
            : replaceSectionImage(current, sectionId, asset),
        );
      })
      .catch((e) =>
        setError(e instanceof Error ? e.message : "Could not open this image."),
      );
  }
  function importProject(imported: SiteConfig) {
    uploadRequests.current.clear();
    commit(imported);
  }
  const actions = { commit, perform, setError };
  function openGettingStarted() {
    setHelpStep(0);
    setHelp(true);
  }
  function closeGettingStarted() {
    setHelpStep(0);
    setHelp(false);
  }
  if (!ready)
    return (
      <main className="loading">
        <h1>Opening HowlScene</h1>
        <p role="status">{status}</p>
      </main>
    );
  return (
    <div className="editor-shell">
      <aside className="controls" aria-label="Website editor">
        <p className="brand">
          HOWLSCENE <span>Development preview</span>
        </p>
        <h1>Make a little scene.</h1>
        <p>Choose a mood. Tell your story. Take your website with you.</p>
        <button
          onClick={() => (help ? closeGettingStarted() : openGettingStarted())}
          aria-expanded={help}
        >
          Getting started
        </button>
        {help && (
          <section className="notice" aria-label="Getting started guide">
            <div aria-live="polite" aria-atomic="true">
              <p>
                Optional guide · Step {helpStep + 1} of {onboardingSteps.length}
              </p>
              <h2>{onboardingSteps[helpStep]!.title}</h2>
              <p>{onboardingSteps[helpStep]!.description}</p>
              {helpStep === onboardingSteps.length - 1 && (
                <details className="publishing-help">
                  <summary>Show step-by-step publishing options</summary>
                  {publishingOptions.map((option) => (
                    <section key={option.name}>
                      <h3>{option.name}</h3>
                      <p>{option.summary}</p>
                      <ol>
                        {option.steps.map((step) => (
                          <li key={step}>{step}</li>
                        ))}
                      </ol>
                      {"note" in option && <p>{option.note}</p>}
                      <a
                        href={option.guideUrl}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {option.guideLabel}
                      </a>
                    </section>
                  ))}
                </details>
              )}
            </div>
            <div className="button-row">
              <button
                type="button"
                aria-label="Previous step"
                disabled={helpStep === 0}
                onClick={() => setHelpStep((step) => Math.max(0, step - 1))}
              >
                Back
              </button>
              <button type="button" onClick={closeGettingStarted}>
                Skip guide
              </button>
              {helpStep < onboardingSteps.length - 1 ? (
                <button
                  type="button"
                  aria-label="Next step"
                  onClick={() =>
                    setHelpStep((step) =>
                      Math.min(onboardingSteps.length - 1, step + 1),
                    )
                  }
                >
                  Next
                </button>
              ) : (
                <button type="button" onClick={closeGettingStarted}>
                  Finish guide
                </button>
              )}
            </div>
          </section>
        )}
        <label>
          Start from a template
          <select
            defaultValue=""
            onChange={(e) => {
              if (!e.target.value) return;
              if (
                confirm(
                  "Replace this project with a starter template? Save a backup first.",
                )
              ) {
                const content =
                  e.target.value === "cinematic"
                    ? cinematicStarterSite
                    : e.target.value === "story"
                      ? {
                          ...starterSite,
                          title: "My story",
                          sections: [
                            {
                              ...starterSite.sections[0]!,
                              heading: "Every story starts somewhere",
                              type: "rich_text" as const,
                            },
                          ],
                        }
                      : starterSite;
                uploadRequests.current.clear();
                commit(content);
                setSelected(content.sections[0]!.id);
              }
              e.target.value = "";
            }}
          >
            <option value="">Choose a starter</option>
            <option value="portfolio">Personal portfolio</option>
            <option value="story">Story / article</option>
            <option value="cinematic">Cinematic Story</option>
          </select>
        </label>
        <AppearancePanel site={site} actions={actions} />
        <div className="button-row">
          <button
            disabled={!history.past.length}
            onClick={() => {
              dirty.current = true;
              ++saveSequence.current;
              uploadRequests.current.clear();
              setHistory(undoHistory);
            }}
          >
            Undo
          </button>
          <button
            disabled={!history.future.length}
            onClick={() => {
              dirty.current = true;
              ++saveSequence.current;
              uploadRequests.current.clear();
              setHistory(redoHistory);
            }}
          >
            Redo
          </button>
        </div>
        <SectionPanel
          site={site}
          section={section}
          actions={actions}
          selection={{ newType, setNewType, setSelected }}
          onImage={uploadImage}
        />
        <label>
          Preview size
          <select value={width} onChange={(e) => setWidth(e.target.value)}>
            <option value="100%">Desktop</option>
            <option value="768px">Tablet</option>
            <option value="375px">Phone</option>
          </select>
        </label>
        <ProjectFiles
          site={site}
          onImport={importProject}
          onDownload={download}
          setError={setError}
        />
        <p role="status">{status}</p>
        {error && (
          <p role="alert" className="notice">
            {error}
          </p>
        )}
        <p className="notice">
          Local drafts stay in this browser. Clearing browser data removes them.
          A project backup is editable; a website ZIP is ready to publish.
        </p>
      </aside>
      <div className="preview-workspace">
        <div
          ref={previewRef}
          className="preview"
          style={{ width, maxWidth: "100%" }}
          role="region"
          aria-label="Live website preview"
        >
          <Site site={site} />
        </div>
      </div>
    </div>
  );
}
createRoot(document.getElementById("root")!).render(<Editor />);
