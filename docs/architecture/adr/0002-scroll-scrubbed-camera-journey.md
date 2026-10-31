# ADR 0002: Scroll-scrubbed Camera Journey

- Status: Proposed
- Date: 2026-10-31

## Context

The shared renderer supports finite scene-entry animations. The reference-inspired story also needs camera and copy states to be a deterministic function of native scroll position, reversible without timers, and exportable through the same renderer.

## Decision

Keep `SectionConfig.transition` as the finite entry animation contract. Add an opt-in, validated site-level `cameraJourney` setting. Resolve normalized progress into a pure visual frame, then let a shared DOM controller apply that frame to at most two scene images, their configured theme depth layers, and the current/incoming semantic copy. The controller listens to native scroll/resize/visibility events, coalesces updates into one pending animation frame, and disposes its listeners and temporary stage. Reduced motion and the existing manual motion toggle stop the controller.

## Alternatives considered

| Option                                         | Benefit                                                                                         | Cost                                                                                                       |
| ---------------------------------------------- | ----------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| CSS scroll timelines                           | Compact declarative implementation; browser can schedule animations                             | Harder to test exact stage boundaries and inconsistent support/behavior across target browsers             |
| Shared JS progress resolver and DOM controller | Deterministic, reversible, testable state; works with current static export and browser support | Requires careful geometry reads, lifecycle cleanup, and style ownership                                    |
| Canvas or 3D renderer                          | More freedom for continuous scenery                                                             | Duplicates the shared renderer, raises bundle/GPU cost, and is unnecessary for configured still-art layers |

The shared JS controller is selected because exact scroll-state behavior, portability, and testability are central requirements. It must not run an idle frame loop or replace finite entry animations.

## Consequences

- Existing projects default to `cameraJourney.enabled = false`; their finite transition behavior is unchanged.
- Camera settings are declarative and bounded; no arbitrary keyframes, scripts, or CSS are accepted.
- Scene artwork is composed from the same rendered scene image and cover elements; no example-specific IDs are interpreted by the core.
- The controller keeps only active outgoing/incoming images and bounded theme depth layers in its temporary stage.
- Performance, exported ZIP, mobile, reduced-motion, and accessibility behavior remain required remote verification gates.
