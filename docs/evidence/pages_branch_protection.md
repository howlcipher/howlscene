# Verified `main` branch protection

GitHub REST API configuration was applied and read back on 2026-10-29 after
PR #20 merged.

- Pull requests are required to update `main`.
- The required status check is `verify`, and branches must be up to date.
- The rule applies to administrators.
- Force pushes and branch deletion are disabled.
- Required approving pull-request reviews are set to zero. Deployment still
  requires two distinct approvals through the separately configured protected
  GitHub Actions environments; those environments are not yet configured.

The check name `verify` was confirmed from the successful run on merge commit
`c9c9981`. The live API response and subsequent read-back reported the same
settings. This evidence records repository settings only; it is not evidence of
a Pages deployment.
