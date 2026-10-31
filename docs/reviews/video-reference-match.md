# Cinematic sample and reference clip review

**Review date:** 2026-10-30
**Reference:** user-supplied 44.2-second, 896×512 MP4, inspected locally. It remains outside the repository and is not redistributed.

## What the clip shows

The clip presents an editorial ink-wash journey through full-screen waterside landscapes. The observed frames include a stone bridge and boat, a riverside town and clock tower, a moon-gate garden, a broad historic riverfront, and a misty modern skyline. Text sits in a narrow readable column over the open side of each composition and alternates sides. A small masthead stays at the top; a vertical numbered scene selector stays at the right. The observed handoffs move the landscape composition under a mist veil as the camera travels into the next view; the scene change reads as a camera-led reveal rather than a whole-frame dissolve. Mist, water, reflections, and layered scenery carry most of the visual depth.

The clip does not establish whether scenes autoplay or advance only from user input. Scene handoffs have a clear order: the outgoing copy disappears first, the camera pushes and drifts through an extended landscape passage, mist swells while the next view emerges, and the new copy arrives after the image settles. The sample therefore keeps scenes user-controlled through ordinary scrolling, section links, and previous/next links.

## Historical implementation and current baseline

The original example branch implemented a sample-specific pinned stage, scroll-derived progress, camera transforms, copy departure and arrival, and a distinct mist-covered handoff. The migration to the shared renderer removed that controller and retained finite scene-entry mist effects. The initial version of this report described the earlier behavior as if it remained current; that was inaccurate.

At baseline commit `95cc4b9`, source inspection confirmed that `StoryExample.tsx` called the shared renderer and finite `enhanceSite` lifecycle only. It had no scroll-scrubbed camera controller. Per-section `mist-reveal` was a timed entry effect, not equivalent to the camera journey.

## Restoration in progress

PR [#37](https://github.com/howlcipher/howlscene/pull/37) introduces an opt-in site-level Camera Journey contract while preserving `SectionConfig.transition` as the finite entry-animation contract. The shared resolver maps normalized progress to camera, copy, landscape, and cover states. The renderer controller uses native scroll, a pinned stage, and only current/incoming landscape layers. The Ink Wash example selects the shared mode; its artwork mapping remains example content. The implementation is not yet remotely verified, so this is not a fidelity or release claim.

## Verification evidence

- Historical screenshot references remain available in [`artifacts/video-match/`](artifacts/video-match/), including the [desktop opening](artifacts/video-match/desktop.png), [camera push](artifacts/video-match/scroll-transition.png), [covered handoff](artifacts/video-match/scroll-transition-cover.png), [incoming reveal](artifacts/video-match/scroll-transition-emerge.png), [second scene](artifacts/video-match/scene-2.png), and [mobile layout](artifacts/video-match/mobile.png). They document the prior implementation and are not evidence for the current branch.
- Test-only commit `7feef8c` has valid behavioral RED evidence in [GitHub Actions run 41166873671](https://github.com/howlcipher/howlscene/actions/runs/41166873671): hosted unit tests fail because strict config rejects `cameraJourney` and old projects do not receive its disabled default. Current implementation has not yet run remotely.
- The landscapes are separate still images, so spatial continuity cannot match generated video imagery frame for frame. The intended approximation is a reversible camera transform and separate cover scene, to be evaluated from new hosted browser artifacts.
