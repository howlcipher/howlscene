# Deploy the HowlScene application with GitHub Pages

This guide is for a repository administrator. HowlScene is not currently
published by this workflow. Configure the safeguards below before enabling a
deployment. The workflow does not activate Pages or set repository protection
for you.

## Required repository setup

1. In **Settings → Pages**, choose **GitHub Actions** as the build and
   deployment source.
2. In **Settings → Environments**, create `github-pages-approval-one` and
   `github-pages-approval-two`. Set exactly one different required reviewer on
   each environment. Enable **Prevent self-review** and restrict both
   environments to `main`.
3. Create the `github-pages` deployment environment and restrict it to `main`.
4. Verify that `main` protection requires pull requests and the successful,
   up-to-date `verify` quality check, applies to administrators, and prohibits
   force pushes and deletion. This repository rule is configured. It does not
   require a human pull-request approval; the two environment approvals below
   are the separate deployment gate.
5. Only after the preceding controls are in place, add repository variable
   `HOWLSCENE_PAGES_ENABLED` with value `true`.

The two distinct independent review steps are release safeguards. Do not replace
them with a secret or a workflow input; the repository variable only enables the
workflow to request both protected environment reviews.

## Build and publish

Every relevant pull request runs the Pages preparation workflow. It builds the
production output, checks the production site at `/` and `/howlscene/` with
JavaScript enabled and disabled, then stores the result as a Pages artifact.
Pull requests never publish.

After a reviewed change has merged to `main` and the required repository setup
is complete:

1. Open **Actions → Prepare GitHub Pages → Run workflow**.
2. Select `main` and set **Publish the verified main-branch artifact** to true.
3. Wait for the artifact build and production browser test to pass.
4. Two different required reviewers approve their respective environments.
5. Confirm the deployment job reports the published URL, then test the routes
   listed below in a browser.

The workflow skips deployment if the dispatch input is false, the selected ref
is not `main`, or the `HOWLSCENE_PAGES_ENABLED` variable is not exactly `true`.
Both approvals remain required even when all workflow conditions match.

## Verify the published site

Use the deployment URL printed by the successful GitHub Actions job. Verify:

- `/howlscene/` loads the landing page.
- `/howlscene/editor/` loads the editor.
- `/howlscene/examples/william-elias/` loads the example.
- Images and links load without broken requests.
- The site remains understandable when JavaScript is disabled and motion is
  reduced.
- Browser developer tools show no missing assets or runtime errors.

The current browser test covers the root and `/howlscene/` project mount on a
local static server. Only a successful public deployment can establish that the
GitHub Pages configuration and public routes work end to end.

GitHub Pages serves static files. It does not run HowlScene's editor backend,
provide cloud drafts, or support arbitrary server-side features. For site owners
publishing an exported website, follow the separate [website publishing
guide](../users/publishing.md).
