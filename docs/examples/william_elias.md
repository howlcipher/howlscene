# William Elias example: factual source notes

This example is a consumer of the shared HowlScene renderer. It uses one validated configuration and switches only the theme and motion preset. It does not change the original portfolio.

## Sources checked

Read-only GitHub API requests were made on 2026-10-28 to:

- [Repository metadata](https://api.github.com/repos/howlcipher/william_elias), whose homepage field identifies the [original portfolio](https://howlcipher.github.io/william_elias/).
- [Canonical public résumé data](https://github.com/howlcipher/william_elias/blob/main/resume.json).
- [Public README](https://github.com/howlcipher/william_elias/blob/main/README.md), which explicitly identifies independent projects and their provenance.

The summary uses the public personal title, about text, professional work summary, experience and skills fields. It includes the documented Senior Production Support Engineer role at Stellantis Financial Services US and earlier HBK experience. The Go deployment CLI, .NET application, Python/FastAPI tools, credential work and Azure DevOps automation are professional work. HowlPlane, Password Arena and Baseball Optimizer are separately labeled personal projects, developed outside employment with AI coding assistants under the owner's direction and review.

No employer performance metrics, salary details, private profile material, photographs or third-party artwork are included. This example paraphrases a selected subset of public facts and links to the original for current details. It does not replace or synchronize the original. The original repository reports no repository license; its code and artwork have not been copied into HowlScene.

## Verification and limits

`tests/example.test.tsx` validates the example configuration, renders it through all three themes, checks the original link and independent-project distinction, and confirms section content is unchanged by theme selection. These are rendering and data tests, not browser usability or visual regression verification.

The demonstration uses the finite Motion entry enhancer in Ink Wash and Cyberpunk, and disables decorative entry motion in Modern Professional. It does not demonstrate parallax, particles, scene transitions or a complete cinematic animation system. The public example application is React-rendered; meaningful no-JavaScript HTML is provided by the separate static ZIP export workflow, not this application shell.
