# Security policy

HowlScene is a feasibility prototype, not a hardened release. Do not rely on it for sensitive or regulated information. No supported production release is currently declared.

## Reporting a vulnerability

Do not post credentials, private project data, or executable exploit material in a public issue. If GitHub private vulnerability reporting is enabled on the published repository, use its Security tab. A dedicated reporting address and response policy have not yet been established. Do not assume an unverified address is monitored.

## Current boundaries

The prototype validates configuration before rendering and export. React renders plain text rather than imported HTML. The ZIP contains fixed output filenames and no executable user configuration. It has no accounts, backend, analytics, uploaded assets, or project import feature.

Draft editing currently remains in browser memory and is lost on reload. The editor downloads a generated website locally; publishing it exposes the included content to visitors. Avoid putting secrets in site text or metadata.

## Required before release

Threat-model and test malicious project imports, unsafe URLs, script payloads, unsafe CSS, file traversal, ZIP bombs, oversized images, quota failure, prototype pollution, unexpected external requests, and dependency vulnerabilities. Add explicit import and resource limits. Reject unrestricted uploaded SVG and executable content. Audit licenses and generated artifacts. Keep the lockfile reviewed and run the full dependency security review before release.

No security audit or WCAG conformance certification is claimed by this prototype.
