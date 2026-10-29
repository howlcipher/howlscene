# Privacy model

## Local processing

HowlScene is designed to run editing, image processing, project storage, backup creation, and website export in the browser. Browser-local storage is not cloud backup. Clearing browser data or losing access to the browser profile can remove locally stored projects. Download an editable project backup when that feature is available.

No analytics, tracking service, account system, or remote build service is required by the architecture. Do not infer this design statement to mean that every browser flow has received a complete network audit. Network behavior remains a release verification gate.

## Publication and external requests

The editor and its assets must first be downloaded from the hosting provider. That provider may maintain request logs according to its own policy. Clicking an external link contacts its destination. A published website exposes its included text and images to visitors; do not include credentials, private records, or information you do not have permission to publish.

Image uploads are intended to be decoded and reencoded locally to strip original image metadata. This is a practical minimization measure, not a guarantee that all identifying information is removed: visible text, faces, landmarks, and other content can still identify people or locations.

## Dependency and provenance boundaries

Development dependency installation contacts the npm registry. CI dependency auditing may send dependency metadata to the configured npm registry. These are developer workflows, not browser project uploads. The license audit reads the local lockfile and installed package manifests without uploading project content.

No automatic publishing integration or cloud synchronization is provided. Any future service that transmits project content requires clear user-facing disclosure and an explicit authorization model.

## Verification still required

Before release, inspect editor and exported-site network traffic, confirm local asset packaging, test storage and quota failures, check backups for accidental private fields, and verify that generated output contains no secrets or editor-only credentials. This document does not assert completed privacy or legal compliance review.
