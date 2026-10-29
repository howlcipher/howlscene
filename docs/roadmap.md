# Roadmap

HowlScene is a development preview. Required v1 work takes priority over new
features; unfinished acceptance requirements are tracked in
[the current journal](../PROGRESS.md) and [acceptance](experiment/acceptance.md).

## Before v1

1. Keep hosted CI reproducible as acceptance grows. The image-rich exported
   visual fixtures, with explicitly pinned fonts, passed hosted run
   `40956127243`; future baseline changes still require a reviewed hosted pass.
2. Extend the validated custom-section registration contract to cover any
   remaining layout and editor integration needs. The first developer API now
   supports trusted custom renderers using portable v1 fields, and creators can
   override the shared card/navigation presentation choices. Arbitrary payload
   schemas, custom editor forms, and a plugin system remain outside scope.
3. Review transition, long-content and image-rich exported baselines on target
   platforms, then expand the fixtures if those reviews identify gaps.
4. Review the complete editor with nontechnical users and assistive technology;
   correct findings before making accessibility or release-readiness claims.
5. Measure representative production loading and motion on mobile/older hardware.
6. Finish security, provenance and release review; prepare and verify optional
   GitHub Pages deployment without changing the original portfolio.

## After v1

1. Add Retro Terminal and Fantasy / Anime-inspired themes using original or
   explicitly redistributable art and the same section/theme contracts.
2. Expand portable rich text with a versioned migration contract, including
   nested lists only when editing and export preserve them reliably.
3. Explore multipage configuration and navigation as a versioned extension;
   single-page v1 exports do not claim multipage SEO or CMS support.
4. Consider optional advanced scenes behind a tested lifecycle boundary. Keep
   3D dependencies out of the standard renderer unless a concrete use requires
   them.

Accounts, cloud synchronization, arbitrary free-position canvases, commerce,
real-time collaboration and a plugin marketplace remain outside v1. They are
not promised delivery milestones. A future proposal needs its own usability,
security and maintenance justification.
