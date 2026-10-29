import { it, expect, vi, afterEach } from "vitest";
const { enhance } = vi.hoisted(() => ({ enhance: vi.fn() }));
vi.mock("../packages/core/src/enhance.js", () => ({ enhanceSite: enhance }));
afterEach(() => {
  vi.unstubAllGlobals();
  vi.clearAllMocks();
  vi.resetModules();
});
it("MOT-005 published runtime mounts every site and disposes owned effects when leaving", async () => {
  const roots = [{ id: "first" }, { id: "second" }];
  const disposers = [vi.fn(), vi.fn()];
  enhance
    .mockImplementationOnce(() => disposers[0])
    .mockImplementationOnce(() => disposers[1]);
  let leave: EventListener | undefined;
  const listen = vi.fn((event: string, handler: EventListener) => {
    if (event === "pagehide") leave = handler;
  });
  vi.stubGlobal("document", { querySelectorAll: vi.fn(() => roots) });
  vi.stubGlobal("window", { addEventListener: listen });
  await import("../packages/core/src/runtime");
  expect(enhance.mock.calls.map((call) => call[0])).toEqual(roots);
  expect(listen).toHaveBeenCalledWith("pagehide", expect.any(Function), {
    once: true,
  });
  leave?.(new Event("pagehide"));
  for (const dispose of disposers) expect(dispose).toHaveBeenCalledOnce();
});
