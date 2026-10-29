import { expect, it } from "vitest";
import { IndexedDbDraftStore } from "../apps/editor/storage";
it("EDT-007 reports unavailable browser storage", async () => {
  const store = new IndexedDbDraftStore(undefined);
  await expect(store.load()).rejects.toThrow("Local saving is unavailable");
  store.close();
});
it("SEC-005 rejects invalid data before accessing storage", async () => {
  const store = new IndexedDbDraftStore(undefined);
  await expect(store.save({ schemaVersion: 99 })).rejects.toThrow(
    "Unsupported project version",
  );
});

import { IDBFactory } from "fake-indexeddb";
import { starterSite } from "../packages/core/src/index";
it("EDT-006 restores committed drafts across adapter instances", async () => {
  const factory = new IDBFactory();
  const store = new IndexedDbDraftStore(factory);
  expect(await store.load()).toBeNull();
  await store.save(starterSite);
  store.close();
  const restored = new IndexedDbDraftStore(factory);
  expect(await restored.load()).toEqual(starterSite);
  restored.close();
});
it("SEC-005 invalid saves preserve the previous valid draft", async () => {
  const store = new IndexedDbDraftStore(new IDBFactory());
  await store.save(starterSite);
  await expect(store.save({ ...starterSite, sections: [] })).rejects.toThrow();
  expect(await store.load()).toEqual(starterSite);
  store.close();
  await expect(store.load()).rejects.toThrow("closed");
});
it("rejects malformed persisted drafts without returning partially valid data", async () => {
  const factory = new IDBFactory();
  const store = new IndexedDbDraftStore(factory);
  await store.save(starterSite);
  const db = await new Promise<IDBDatabase>((resolve, reject) => {
    const request = factory.open("howlscene-drafts", 1);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction("projects", "readwrite");
    tx.objectStore("projects").put({ schemaVersion: 99 }, "draft");
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
  await expect(store.load()).rejects.toThrow("Unsupported project version");
  db.close();
  store.close();
});
