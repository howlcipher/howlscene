import { createServer } from "node:http";
import { expect, it, vi } from "vitest";
import { closeSdkResources } from "../scripts/close_sdk_resources.mjs";

it("closes a real listening server even if browser shutdown rejects, preserving the failure", async () => {
  const server = createServer((_request, response) => response.end("test"));
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  const failure = new Error("Browser transport failed during close");
  const browser = {
    close: vi.fn(async () => {
      throw failure;
    }),
  };
  try {
    await expect(closeSdkResources(browser, server)).rejects.toBe(failure);
    expect(browser.close).toHaveBeenCalledOnce();
    expect(server.listening).toBe(false);
  } finally {
    if (server.listening)
      await new Promise<void>((resolve) => server.close(() => resolve()));
  }
});
it("closes the server without a browser after launch failure", async () => {
  const server = createServer();
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  try {
    await closeSdkResources(undefined, server);
    expect(server.listening).toBe(false);
  } finally {
    if (server.listening)
      await new Promise<void>((resolve) => server.close(() => resolve()));
  }
});
