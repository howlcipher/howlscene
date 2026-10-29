import { afterEach, expect, it, vi } from "vitest";
import { IDBFactory, IDBObjectStore } from "fake-indexeddb";
import { IndexedDbDraftStore } from "../apps/editor/storage";
import { starterSite } from "../packages/core/src/index";

afterEach(() => vi.restoreAllMocks());

it("EDT-007 SEC-005 quota failure rejects saving and preserves the last committed draft", async () => {
  const factory = new IDBFactory();
  const store = new IndexedDbDraftStore(factory);
  await store.save(starterSite);
  const put = vi
    .spyOn(IDBObjectStore.prototype, "put")
    .mockImplementationOnce(() => {
      throw new DOMException(
        "Storage capacity exhausted",
        "QuotaExceededError",
      );
    });
  await expect(
    store.save({ ...starterSite, title: "Unsaved replacement" }),
  ).rejects.toMatchObject({ name: "QuotaExceededError" });
  put.mockRestore();
  expect(await store.load()).toEqual(starterSite);
  await store.save({ ...starterSite, title: "Recovered after freeing space" });
  expect((await store.load())?.title).toBe("Recovered after freeing space");
  store.close();
});

it("EDT-007 SEC-005 transaction abort rejects saving rather than announcing a persisted replacement", async () => {
  const factory = new IDBFactory();
  const store = new IndexedDbDraftStore(factory);
  await store.save(starterSite);
  const original = IDBObjectStore.prototype.put;
  const put = vi
    .spyOn(IDBObjectStore.prototype, "put")
    .mockImplementationOnce(function (
      this: IDBObjectStore,
      ...args: Parameters<typeof original>
    ) {
      const request = original.apply(this, args);
      this.transaction.abort();
      return request;
    });
  await expect(
    store.save({ ...starterSite, title: "Aborted replacement" }),
  ).rejects.toThrow();
  put.mockRestore();
  expect(await store.load()).toEqual(starterSite);
  store.close();
});

it("EDT-006 closing during initial open rejects work and releases the database connection", async () => {
  const factory = new IDBFactory();
  const store = new IndexedDbDraftStore(factory);
  const loading = store.load();
  store.close();
  await expect(loading).rejects.toThrow(/closed/i);
  await new Promise<void>((resolve, reject) => {
    const request = factory.deleteDatabase("howlscene-drafts");
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
    request.onblocked = () =>
      reject(new Error("Closed adapter leaked a database connection"));
  });
});
