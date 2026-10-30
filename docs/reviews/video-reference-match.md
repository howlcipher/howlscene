# Cinematic sample and reference clip review

**Review date:** 2026-10-30
**Reference:** user-supplied 44.2-second, 896×512 MP4, inspected locally. It remains outside the repository and is not redistributed.

## What the clip shows

The clip presents an editorial ink-wash journey through full-screen waterside landscapes. The observed frames include a stone bridge and boat, a riverside town and clock tower, a moon-gate garden, a broad historic riverfront, and a misty modern skyline. Text sits in a narrow readable column over the open side of each composition and alternates sides. A small masthead stays at the top; a vertical numbered scene selector stays at the right. The observed handoffs move the landscape composition under a mist veil as the camera travels into the next view; the scene change reads as a camera-led reveal rather than a whole-frame dissolve. Mist, water, reflections, and layered scenery carry most of the visual depth.

The clip does not establish whether scenes autoplay or advance only from user input. Scene handoffs are camera-led: the landscape travels into the next composition beneath a soft mist veil, while the copy settles into the new scene. The sample therefore keeps scenes user-controlled through ordinary scrolling, section links, and previous/next links.

## Implementation

`/examples/ink-wash-story/` is now a five-scene Lorem Ipsum sample using HowlScene's shared semantic `Site` renderer. It includes five original AI-generated ink-wash images, a persistent right-edge numbered selector, alternating copy placement, full-height scenes, and editorial typography. The image files are local optimized WebP assets (about 1.3 MB total), with provenance notes available from the page and source directory.

The scenery stays pinned to the viewport while the story text moves through it. During a handoff, the outgoing painting travels upward and the next painting rises through a feathered bottom-up mask; a restrained mist layer swells at the midpoint. This keeps both landscape layers fully present instead of dissolving their full frames. Camera travel, reveal, and mist all follow actual scroll progress. Scene links and previous/next controls use the same scroll path; the page does not trap the wheel or run an autoplay timer. The manual animation control, `prefers-reduced-motion`, and static HTML content remain available. With motion disabled, the backdrop changes without camera travel or a reveal mask. Artwork is decorative to assistive technology; headings, body copy, scene links, and reading order are semantic HTML.

The implementation uses ordinary document scrolling over a pinned viewport stage rather than a locked carousel. Long text can grow naturally, and keyboard users can follow the same native links. The feathered, scroll-scrubbed reveal makes each scene change visible as a camera movement through mist, while reduced-motion users receive a static scene change.

## Verification

- Browser route test checks all five scenes, the loaded first artwork, working scene navigation, motion disable, and serious/critical axe findings.
- A scroll-specific browser test moves to an intermediate story position and verifies the stage remains viewport-pinned, both landscape layers remain opaque, the incoming image has a feathered reveal mask, and both cameras travel.
- Mobile browser test checks 390×844 layout and no horizontal page overflow.
- Reduced-motion browser test verifies animation controls are disabled and scene links remain usable.
- Production route checks load all five local images, the artwork notes file, and the prerendered content at `/` and `/howlscene/`, with JavaScript enabled and disabled.
- Visual review captures are stored in [`artifacts/video-match/`](artifacts/video-match/).
- See the [desktop opening](artifacts/video-match/desktop.png), [mid-scroll transition](artifacts/video-match/scroll-transition.png), [second scene](artifacts/video-match/scene-2.png), and [mobile layout](artifacts/video-match/mobile.png).

The implementation follows the clip's composition and atmospheric motion. It is not a frame-by-frame copy; the original art is newly generated, and the handoff is an evidence-based approximation from the supplied 44-second clip rather than a frame-by-frame reconstruction.
