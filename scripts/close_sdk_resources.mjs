/** @param {{close(): Promise<void>} | undefined} browser
 * @param {{close(callback: (error?: Error) => void): unknown}} server
 * @returns {Promise<void>}
 */
export async function closeSdkResources(browser, server) {
  try {
    await browser?.close();
  } finally {
    await new Promise((resolve, reject) =>
      server.close((error) => (error ? reject(error) : resolve())),
    );
  }
}
