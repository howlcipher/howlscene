/** Closes both owned resources; a browser shutdown failure still rejects. */
export function closeSdkResources(
  browser: { close(): Promise<void> } | undefined,
  server: { close(callback: (error?: Error) => void): unknown },
): Promise<void>;
