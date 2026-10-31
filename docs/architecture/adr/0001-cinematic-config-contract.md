# ADR 0001: Represent cinematic behavior in the shared site configuration

- Status: accepted
- Date: 2026-10-30

## Context

HowlScene already serializes site content and renders that content through a
shared engine used by the editor, static export, and SDK. The Ink Wash example
currently stores its scene art mapping and scroll-driven effects in example
code. This prevents the ordinary editor and static exporter from expressing
the same behavior.

## Decision

Add an optional, defaulted `experience` mode to the existing version 1 site
configuration and a bounded transition preset to each section. The shared
renderer will express the selected mode and preset through validated DOM data
attributes and reusable CSS/motion behavior. Keep content, artwork references,
theme, and layout in the existing project model. Use the current section
operations, image controls, history, backup, and ZIP exporter.

## Consequences

- Existing projects normalize to the standard experience and remain readable.
- Cinematic settings travel through the same history, autosave, backup, and
  export paths as the rest of the site configuration.
- The finite preset set avoids accepting executable scripts, arbitrary CSS,
  or untrusted animation descriptions.
- This does not by itself migrate the specialized demo's art files or
  scroll-scrubbed transition into a reusable engine component; that migration
  must be implemented and verified as a separate increment.
- Optional scene transition-cover artwork uses an asset ID in the same section
  model. The editor, shared renderer, and static exporter consume that field;
  the cover remains decorative and motion-gated.
- A richer scene model is deferred unless actual editor requirements cannot be
  represented with the existing sections and assets.
