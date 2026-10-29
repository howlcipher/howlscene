import { expect, it } from "vitest";
import { safeUrl } from "../packages/core/src/rich_text";
it("SEC-002 email links cannot inject mail headers or encoded control characters", () => {
  for (const value of [
    "mailto:a?bcc=hidden@example.com",
    "mailto:a%0d%0abcc=hidden@example.com",
    "mailto:a%3fbcc=hidden@example.com",
  ])
    expect(safeUrl.safeParse(value).success).toBe(false);
  expect(safeUrl.safeParse("mailto:hello+portfolio@example.com").success).toBe(
    true,
  );
});
