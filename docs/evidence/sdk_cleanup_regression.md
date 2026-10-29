# SDK resource cleanup regression

Independent read-only review found that a rejected `browser.close()` skipped
HTTP server shutdown in the SDK integration harness. The implementation agent
ran the focused test before fixing it: one failed and one passed. The failing
assertion expected `server.listening` to be false after browser-close rejection,
but received true. That RED result was observed in the agent's tool output;
**no raw filesystem log was preserved**, so this record is a reported observation,
not a substitute transcript. It has not been recreated as historical evidence.

The corrected helper uses nested `try/finally`, retaining the browser rejection
while always attempting HTTP shutdown. Tests use a real local listening server
and cover both a rejected browser shutdown and an absent browser after launch
failure. The integrated verification log records the current GREEN result.
