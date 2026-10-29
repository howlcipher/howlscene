import type { SiteConfig } from "../../../packages/core/src/index";
import {
  serializeBackup,
  importValidatedBackup,
} from "../../../packages/export/src/backup";
export function saveFile(data: BlobPart, name: string, type: string) {
  const url = URL.createObjectURL(new Blob([data], { type }));
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export function ProjectFiles({
  site,
  onImport,
  onDownload,
  setError,
}: {
  site: SiteConfig;
  onImport: (site: SiteConfig) => void;
  onDownload: () => Promise<void>;
  setError: (message: string) => void;
}) {
  return (
    <>
      <button
        onClick={() => {
          try {
            saveFile(
              serializeBackup(site),
              "howlscene-project.json",
              "application/json",
            );
          } catch (e) {
            setError(e instanceof Error ? e.message : "Backup failed.");
          }
        }}
      >
        Save project backup
      </button>
      <label>
        Open project backup
        <input
          type="file"
          accept=".json,application/json"
          onChange={(e) => {
            const file = e.target.files?.[0];
            e.target.value = "";
            if (!file) return;
            if (file.size > 30 * 1024 * 1024) {
              setError("This backup is too large. Maximum 30 MiB.");
              return;
            }
            void file
              .text()
              .then(async (text) => {
                const imported = await importValidatedBackup(text);
                if (
                  confirm(
                    "Replace this project with the backup? Save your current project first.",
                  )
                ) {
                  onImport(imported);
                }
              })
              .catch(() =>
                setError(
                  "This backup could not be opened. Your current project is unchanged.",
                ),
              );
          }}
        />
      </label>
      <button onClick={() => void onDownload()}>Download my website</button>
    </>
  );
}
