import { parseSite, type SiteConfig } from "../../packages/core/src/index";
export interface DraftStore {
  load(): Promise<SiteConfig | null>;
  save(site: unknown): Promise<void>;
  close(): void;
}
/** One atomic project record. Call close when the editor is disposed. */
export class IndexedDbDraftStore implements DraftStore {
  private database: Promise<IDBDatabase> | undefined;
  private closed = false;
  constructor(
    private readonly factory: IDBFactory | undefined = globalThis.indexedDB,
    private readonly name = "howlscene-drafts",
  ) {}
  private open(): Promise<IDBDatabase> {
    if (this.closed)
      return Promise.reject(new Error("Local saving has been closed."));
    if (!this.factory)
      return Promise.reject(
        new Error(
          "Local saving is unavailable in this browser. Download a project backup.",
        ),
      );
    if (!this.database) {
      const factory = this.factory;
      this.database = new Promise<IDBDatabase>((resolve, reject) => {
        const request = factory.open(this.name, 1);
        request.onupgradeneeded = () =>
          request.result.createObjectStore("projects");
        request.onerror = () =>
          reject(request.error ?? new Error("Could not open local storage."));
        request.onblocked = () =>
          reject(
            new Error("Close other HowlScene tabs to update local storage."),
          );
        request.onsuccess = () => {
          const db = request.result;
          if (this.closed) {
            db.close();
            reject(new Error("Local saving has been closed."));
            return;
          }
          db.onversionchange = () => db.close();
          resolve(db);
        };
      }).catch((error) => {
        this.database = undefined;
        throw error;
      });
    }
    return this.database;
  }
  async load(): Promise<SiteConfig | null> {
    const db = await this.open();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction("projects", "readonly");
      const request = transaction.objectStore("projects").get("draft");
      transaction.oncomplete = () => {
        try {
          resolve(
            request.result === undefined ? null : parseSite(request.result),
          );
        } catch (error) {
          reject(error);
        }
      };
      transaction.onabort = () =>
        reject(
          transaction.error ?? new Error("Could not restore the local draft."),
        );
      transaction.onerror = () =>
        reject(
          transaction.error ?? new Error("Could not restore the local draft."),
        );
    });
  }
  async save(input: unknown): Promise<void> {
    const site = parseSite(input);
    const db = await this.open();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction("projects", "readwrite");
      transaction.objectStore("projects").put(site, "draft");
      transaction.oncomplete = () => resolve();
      transaction.onabort = () =>
        reject(
          transaction.error ??
            new Error(
              "Your draft could not be saved. Download a project backup.",
            ),
        );
      transaction.onerror = () =>
        reject(
          transaction.error ??
            new Error(
              "Your draft could not be saved. Download a project backup.",
            ),
        );
    });
  }
  close(): void {
    this.closed = true;
    void this.database?.then(
      (db) => db.close(),
      () => undefined,
    );
  }
}
