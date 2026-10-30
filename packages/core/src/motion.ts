import { z } from "zod";
import type { animate } from "motion/mini";
import { cinematicTransitions } from "./registry.js";
export const motionPresets = {
  none: { duration: 0, distance: 0, scale: 1 },
  calm: { duration: 0.6, distance: 12, scale: 1 },
  cinematic: { duration: 1.2, distance: 32, scale: 1.025 },
  dynamic: { duration: 0.45, distance: 52, scale: 1.05 },
} as const;
export function resolveMotion(
  preset: keyof typeof motionPresets,
  intensity = 1,
  speed = 1,
  reduced = false,
) {
  z.number().min(0).max(1).parse(intensity);
  z.number().min(0.5).max(2).parse(speed);
  const base =
    motionPresets[
      z.enum(["none", "calm", "cinematic", "dynamic"]).parse(preset)
    ];
  return reduced || intensity === 0
    ? { duration: 0, distance: 0, scale: 1 }
    : {
        duration: base.duration / speed,
        distance: base.distance * intensity,
        scale: 1 + (base.scale - 1) * intensity,
      };
}
export type CinematicTransition = (typeof cinematicTransitions)[number];
export type SceneTransitionKeyframes = Parameters<typeof animate>[1];
/** Finite, declarative scene entrances shared by editor preview and exports. */
export function resolveSceneTransition(
  transition: CinematicTransition,
  preset: keyof typeof motionPresets,
  intensity = 1,
  speed = 1,
  reduced = false,
): { duration: number; keyframes: SceneTransitionKeyframes } {
  z.enum(cinematicTransitions).parse(transition);
  const motion = resolveMotion(preset, intensity, speed, reduced);
  if (transition === "none" || motion.duration === 0)
    return { duration: 0, keyframes: { opacity: [1, 1] } };
  const distance = motion.distance;
  const keyframes: Record<CinematicTransition, SceneTransitionKeyframes> = {
    none: { opacity: [1, 1] },
    fade: { opacity: [0, 1] },
    "camera-push": {
      opacity: [0.45, 1],
      transform: [`scale(${1 + motion.scale * 0.04})`, "scale(1)"],
    },
    "camera-pan": {
      opacity: [0.55, 1],
      transform: [`translate3d(${distance}px, 0, 0)`, "translate3d(0, 0, 0)"],
    },
    "mist-reveal": {
      opacity: [0.2, 1],
      filter: [`blur(${12 * intensity}px)`, "blur(0px)"],
    },
    "layered-parallax": {
      opacity: [0.55, 1],
      transform: [`translate3d(0, ${distance}px, 0) scale(0.98)`, "none"],
    },
  };
  return {
    duration: motion.duration,
    keyframes: keyframes[transition],
  };
}
export const motionPrimitives = [
  "fade",
  "slide",
  "scale",
  "reveal",
  "crossfade",
  "parallax",
  "layer_drift",
  "pan_zoom",
  "ambient",
] as const;
export type MotionPrimitive = (typeof motionPrimitives)[number];
/** Finite scene-entry recipes. Crossfade is an opacity recipe, not a scene router. */
export function resolvePrimitive(
  primitive: MotionPrimitive,
  preset: keyof typeof motionPresets,
  intensity = 1,
  speed = 1,
  reduced = false,
) {
  z.enum(motionPrimitives).parse(primitive);
  const motion = resolveMotion(preset, intensity, speed, reduced);
  const distance = motion.distance;
  const transforms: Record<MotionPrimitive, [string, string]> = {
    fade: ["none", "none"],
    crossfade: ["none", "none"],
    slide: [`translateY(${distance}px)`, "translateY(0px)"],
    scale: [`scale(${motion.scale})`, "scale(1)"],
    reveal: [`translateY(${distance * 0.5}px)`, "translateY(0px)"],
    parallax: [`translateY(${distance * 0.35}px)`, "translateY(0px)"],
    layer_drift: [`translateX(${distance * 0.2}px)`, "translateX(0px)"],
    pan_zoom: [
      `translateX(${distance * 0.1}px) scale(${motion.scale})`,
      "translateX(0px) scale(1)",
    ],
    ambient: [`translateY(${distance * 0.1}px)`, "translateY(0px)"],
  };
  return {
    duration: motion.duration,
    keyframes: {
      opacity: [motion.duration ? 0.75 : 1, 1],
      transform: transforms[primitive],
    },
  };
}
/** Invalid DOM attributes fall back independently rather than disabling the site. */
export function readMotionSettings(data: {
  motionIntensity?: string;
  motionSpeed?: string;
  themeMotionIntensity?: string;
  themeMotionSpeed?: string;
}) {
  const read = (value: string | undefined, min: number, max: number) => {
    if (value === undefined || value.trim() === "") return 1;
    const number = Number(value);
    return Number.isFinite(number) && number >= min && number <= max
      ? number
      : 1;
  };
  const intensity =
    read(data.motionIntensity, 0, 1) * read(data.themeMotionIntensity, 0, 1);
  const speed =
    read(data.motionSpeed, 0.5, 2) * read(data.themeMotionSpeed, 0.5, 2);
  return {
    intensity,
    speed: Math.max(0.5, Math.min(2, speed)),
  };
}

/** Site-wide motion-none is authoritative; section settings otherwise inherit or override it. */
export function resolveSceneMotion(
  site: keyof typeof motionPresets,
  section: string | undefined,
): keyof typeof motionPresets {
  if (site === "none") return "none";
  return section === "calm" ||
    section === "cinematic" ||
    section === "dynamic" ||
    section === "none"
    ? section
    : site;
}

/** Invalid theme attributes fail closed so they cannot enable scenery parallax. */
export function readThemeParallax(setting: string | undefined): boolean {
  return setting === undefined ? true : setting === "true";
}
