# Motion and scenery

Content starts visible in semantic HTML. `enhanceSite(root)` adds optional finite
entry effects through Motion and returns an idempotent disposal function. Call
that function before replacing the root or changing themes.

`resolveMotion(preset, intensity, speed, reduced)` validates intensity from 0 to 1
and speed from 0.5 to 2. It returns deterministic distance, duration, and scale.
`resolvePrimitive(name, preset, intensity, speed, reduced)` returns finite
keyframes and a duration. The supported recipe names are `fade`, `slide`, `scale`,
`reveal`, `crossfade`, `parallax`, `layer_drift`, `pan_zoom`, and `ambient`.

Reveal uses opacity and translation. Ambient is a small, finite entry movement.
The standard experience slides content once on first entry and crossfades
decorative scenery on entry and exit. In the cinematic experience, a section's
validated `transition` selects a finite fade, camera push, camera pan, mist
blur/reveal, or layered-parallax entry recipe. The `none` option skips scene
entry motion. Intersection changes update each scene state; leaving the viewport
cancels its owned effects. Reentry can play the selected cinematic entry again.
Replaced effects cannot complete a stale transition. No recipe runs an
infinite loop or controls ordinary navigation. Applications may apply other
recipes using their own ownership and cleanup.

The root accepts `data-experience`, `data-motion`, `data-motion-intensity`, and
`data-motion-speed`. The shared renderer derives these attributes from the
validated site config; cinematic sections expose their transition ID as
`data-transition`. The editor exposes intensity and speed sliders and a
transition selector for cinematic sites. Speed changes finite entry duration;
scroll depth tracks position and does not run on a timer.
Missing or invalid settings default safely. Each `.scenery-layer[data-depth]`
inside a `.scene` receives a bounded scroll-driven vertical offset. Depth is
clamped to -1 through 1; invalid depth becomes zero. Set a baseline transform on
an inner artwork wrapper if necessary, since the enhancement owns the layer's
inline transform. Decorative scenery should use `aria-hidden="true"`.

Scroll and resize listeners are passive. Repeated events schedule at most one
animation frame; geometry reads precede style writes. Offscreen scenery resets
its offset. There is no continuous animation loop, scroll capture, fixed section
height requirement, or keyboard/touch interception.

Reduced motion, preset `none`, intensity zero, or the saved manual disable choice
prevents decorative effects. Changing the preference cancels entry animations,
scheduled frames, and scenery transforms. Disposal also disconnects the observer
and removes media, button, scroll, and resize listeners. Essential content and
anchor links remain available without enhancement or JavaScript.
