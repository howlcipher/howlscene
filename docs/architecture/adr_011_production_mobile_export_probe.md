# ADR 011: Measure production exports under a constrained mobile profile

## Status

Accepted for repeatable lab regression evidence. Physical mobile and older
computer testing remains open.

## Context

The existing browser timing probe measures the editor on a loopback development
server. It does not characterize the static website ZIP a creator publishes.
The exported runtime, responsive media selection, loading behavior, motion and
content with motion disabled need a production-path measurement before further
performance tuning.

## Options considered

| Option                                                          | Benefits                                                                                              | Costs                                                                                                               |
| --------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| Human tests on physical devices only                            | Real hardware, browser and network behavior                                                           | Hard to reproduce, automate and retain as a regression signal                                                       |
| Add Lighthouse CI and lab audits                                | Broad performance diagnostics and familiar metrics                                                    | Adds tooling/configuration and can measure a generated fixture differently from the existing static-export journeys |
| Reuse Playwright with Chromium CDP emulation against a real ZIP | Exercises the browser-created artifact, records deterministic browser APIs and requires no dependency | Emulation does not reproduce hardware, radio, thermal, GPU or field-user conditions                                 |

## Decision

Add `PERF-LAB-001` as a Chromium Playwright scenario. It creates an image-rich
site through the editor, downloads the ZIP, and serves those exact files beneath
a nested path. A fresh mobile-sized browser context uses 4x CPU throttling and
150 ms network latency with bounded download/upload throughput. The test records
navigation timing, Largest Contentful Paint, layout shifts, long tasks, sampled
animation-frame intervals, image resource size, export runtime size, and anchor
navigation. It checks that a responsive image loads, content remains available
when animation is disabled, and the exported runtime remains within the existing
250 KiB gzip target.

The machine-readable observation is attached by CI and a local sample is
checked into `docs/evidence/production_mobile_performance.json`. Environment,
fixture and limitations accompany the numbers. Treat these values as a repeatable
lab regression sample, not field Core Web Vitals, a 60 FPS promise, or evidence
that the website meets every performance target.

## Follow-up

Review the production observation alongside a real older phone or laptop and
human inspection before claiming representative mobile performance. Do not tune
animation or image behavior solely to improve this single synthetic fixture.
