# Cinematic sample and reference clip review

**Review date:** 2026-10-30
**Reference:** user-supplied 44.2-second, 896×512 MP4, inspected locally. It remains outside the repository and is not redistributed.

## What the clip shows

The clip presents an editorial ink-wash journey through full-screen waterside landscapes. The observed frames include a stone bridge and boat, a riverside town and clock tower, a moon-gate garden, a broad historic riverfront, and a misty modern skyline. Text sits in a narrow readable column over the open side of each composition and alternates sides. A small masthead stays at the top; a vertical numbered scene selector stays at the right. The observed handoffs move the landscape composition under a mist veil as the camera travels into the next view; the scene change reads as a camera-led reveal rather than a whole-frame dissolve. Mist, water, reflections, and layered scenery carry most of the visual depth.

The clip does not establish whether scenes autoplay or advance only from user input. Scene handoffs have a clear order: the outgoing copy disappears first, the camera pushes and drifts through an extended landscape passage, mist swells while the next view emerges, and the new copy arrives after the image settles. The sample therefore keeps scenes user-controlled through ordinary scrolling, section links, and previous/next links.

## Implementation

`/examples/ink-wash-story/` is now a five-scene Lorem Ipsum sample using HowlScene's shared semantic `Site` renderer. It includes five original AI-generated ink-wash landscapes and an original mist-valley transition cover, a persistent right-edge numbered selector, alternating copy placement, full-height scenes, and editorial typography. The image files are local optimized WebP assets, with provenance notes available from the page and source directory.

The scenery stays pinned to the viewport while the story text moves through it. A handoff now follows the clip's sequence: outgoing copy clears early, the current painting makes a pronounced diagonal camera push, and a distinct painted fog-valley image fully covers the view while the scene changes underneath. The cover then moves away to reveal the incoming landscape; its copy appears only after the scenery settles. The paintings do not crossfade into each other. These stages follow actual scroll progress without an opacity lag. Scene links and previous/next controls use the same scroll path; the page does not trap the wheel or run an autoplay timer. The manual animation control, `prefers-reduced-motion`, and static HTML content remain available. With motion disabled, the backdrop and copy change discretely without camera travel or the cover image. Artwork is decorative to assistive technology; headings, body copy, scene links, and reading order are semantic HTML.

The implementation uses ordinary document scrolling over a pinned viewport stage rather than a locked carousel. Long text can grow naturally, and keyboard users can follow the same native links. The scroll-scrubbed, multi-stage camera passage gives each new scene a pause to emerge before the copy returns, while reduced-motion users receive a static scene change.

## Verification

- Browser route test checks all five scenes, the loaded first artwork, working scene navigation, motion disable, and serious/critical axe findings.
- A scroll-specific browser test verifies the pinned stage, camera travel, a copy-free mist interval, incoming landscape resolution before the next copy appears, and the settled scene afterward.
- Mobile browser test checks 390×844 layout and no horizontal page overflow.
- Reduced-motion browser test verifies animation controls are disabled, scene links remain usable, and only the final scene's copy remains visible while scrolling through an extended final section.
- Production route checks load all five local images, the artwork notes file, and the prerendered content at `/` and `/howlscene/`, with JavaScript enabled and disabled.
- Visual review captures are stored in [`artifacts/video-match/`](artifacts/video-match/).
- See the [desktop opening](artifacts/video-match/desktop.png), [camera push with outgoing copy cleared](artifacts/video-match/scroll-transition.png), [full-image transition cover](artifacts/video-match/scroll-transition-cover.png), [incoming view emerging through mist](artifacts/video-match/scroll-transition-emerge.png), [second scene](artifacts/video-match/scene-2.png), and [mobile layout](artifacts/video-match/mobile.png).

The implementation follows the clip's scene-change choreography and atmosphere. The underlying landscapes are separate still images, so their spatial continuity cannot match the clip's generated moving scenery frame for frame; the implementation approximates that travel with scroll-scrubbed camera transforms and a separate painted cover scene. The current cover transition is specific to this sample; the visual editor does not yet expose a control for choosing a cover image or transition style.
