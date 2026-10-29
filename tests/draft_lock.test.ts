import { expect, it, vi } from "vitest";
import { acquireDraftLock } from "../apps/editor/draft_lock";

function fakeManager() {
  let owned = false;
  return {
    request: async (
      _name: string,
      _options: unknown,
      callback: (lock: object | null) => Promise<void>,
    ) => {
      if (owned) return callback(null);
      owned = true;
      try {
        await callback({ name: "howlscene-primary-draft" });
      } finally {
        owned = false;
      }
    },
  } as unknown as LockManager;
}
it("EDT-006 grants exactly one draft editor until idempotent release", async () => {
  const manager = fakeManager();
  const requested = vi.spyOn(manager, "request");
  const first = await acquireDraftLock(manager);
  expect(requested).toHaveBeenCalledWith(
    "howlscene-primary-draft",
    { mode: "exclusive", ifAvailable: true },
    expect.any(Function),
  );
  expect(first.granted).toBe(true);
  const second = await acquireDraftLock(manager);
  expect(second).toMatchObject({ granted: false, reason: "busy" });
  second.release();
  expect((await acquireDraftLock(manager)).granted).toBe(false);
  first.release();
  first.release();
  await Promise.resolve();
  await Promise.resolve();
  const next = await acquireDraftLock(manager);
  expect(next.granted).toBe(true);
  next.release();
});
it("EDT-007 unsupported locking pauses autosave rather than guessing ownership", async () => {
  const lock = await acquireDraftLock(undefined);
  expect(lock).toMatchObject({ granted: false, reason: "unavailable" });
  lock.release();
  lock.release();
});
it("EDT-007 propagates manager rejection and synchronous failures", async () => {
  const error = new Error("Lock permission refused");
  const rejecting = {
    request: () => Promise.reject(error),
  } as unknown as LockManager;
  await expect(acquireDraftLock(rejecting)).rejects.toThrow(
    "Lock permission refused",
  );
  const throwing = {
    request: () => {
      throw error;
    },
  } as unknown as LockManager;
  await expect(acquireDraftLock(throwing)).rejects.toThrow(
    "Lock permission refused",
  );
});
