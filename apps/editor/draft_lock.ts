export interface DraftLock {
  granted: boolean;
  reason?: "busy" | "unavailable";
  release(): void;
}

/** One writer per origin. Hold ownership for the entire editor/storage lifecycle.
 * The request promise deliberately remains pending until release; awaiting that
 * promise here would prevent the owning editor from ever opening.
 */
export async function acquireDraftLock(
  manager: LockManager | undefined = globalThis.navigator?.locks,
): Promise<DraftLock> {
  if (!manager) return { granted: false, reason: "unavailable", release() {} };
  return new Promise<DraftLock>((resolve, reject) => {
    try {
      void manager
        .request(
          "howlscene-primary-draft",
          { mode: "exclusive", ifAvailable: true },
          async (lock) => {
            if (!lock) {
              resolve({ granted: false, reason: "busy", release() {} });
              return;
            }
            await new Promise<void>((release) => {
              let released = false;
              resolve({
                granted: true,
                release() {
                  if (released) return;
                  released = true;
                  release();
                },
              });
            });
          },
        )
        .catch(reject);
    } catch (error) {
      reject(error);
    }
  });
}
