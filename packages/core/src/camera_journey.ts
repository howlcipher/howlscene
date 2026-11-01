import { z } from "zod";

/** Declarative limits for scroll-scrubbed camera travel. */
export const cameraJourneySettingsSchema = z.strictObject({
  enabled: z.boolean().default(false),
  movement: z.enum(["diagonal", "pan", "push"]).default("diagonal"),
  intensity: z.number().min(0).max(1).default(0.8),
  parallaxDepth: z.number().min(0).max(1).default(0.35),
  distance: z.number().min(0.5).max(2).default(1),
});

export type CameraJourneySettings = z.infer<typeof cameraJourneySettingsSchema>;
export type CameraJourneyStage =
  | "established"
  | "text-departure"
  | "camera-travel"
  | "covered-handoff"
  | "landscape-reveal"
  | "text-arrival"
  | "settled";

export interface CameraJourneyFrame {
  stage: CameraJourneyStage;
  cameraTranslateX: number;
  cameraTranslateY: number;
  cameraScale: number;
  coverOpacity: number;
  outgoingLandscapeOpacity: number;
  incomingLandscapeOpacity: number;
  outgoingCopyOpacity: number;
  outgoingCopyTranslateY: number;
  incomingCopyOpacity: number;
  incomingCopyTranslateY: number;
}

const clamp = (value: number, min = 0, max = 1) =>
  Math.max(min, Math.min(max, value));
const smooth = (value: number) => {
  const progress = clamp(value);
  return progress * progress * (3 - 2 * progress);
};

/** Maps scroll geometry to bounded progress; malformed geometry resolves safely. */
export function resolveScrollProgress(
  position: number,
  start: number,
  end: number,
): number {
  if (
    !Number.isFinite(position) ||
    !Number.isFinite(start) ||
    !Number.isFinite(end) ||
    end <= start
  )
    return 0;
  return clamp((position - start) / (end - start));
}

/**
 * Resolves a reversible camera handoff from one normalized scene interval.
 * The landscape exchange occurs at the mist maximum; copy clears and returns
 * before and after that exchange, independent of elapsed wall-clock time.
 */
export function resolveCameraJourneyFrame(
  rawProgress: number,
  settings: CameraJourneySettings,
  reducedMotion = false,
): CameraJourneyFrame {
  const progress = Number.isFinite(rawProgress) ? clamp(rawProgress) : 0;
  const incoming = progress >= 0.5;
  if (reducedMotion || !settings.enabled) {
    return {
      stage: progress === 0 ? "established" : "settled",
      cameraTranslateX: 0,
      cameraTranslateY: 0,
      cameraScale: 1,
      coverOpacity: 0,
      outgoingLandscapeOpacity: incoming ? 0 : 1,
      incomingLandscapeOpacity: incoming ? 1 : 0,
      outgoingCopyOpacity: incoming ? 0 : 1,
      outgoingCopyTranslateY: 0,
      incomingCopyOpacity: incoming ? 1 : 0,
      incomingCopyTranslateY: 0,
    };
  }

  const travel = smooth((progress - 0.12) / 0.66);
  const arrival = smooth((progress - 0.78) / 0.2);
  const departure = 1 - smooth(progress / 0.2);
  const coverOpacity =
    progress < 0.32
      ? 0
      : progress < 0.5
        ? smooth((progress - 0.32) / 0.18)
        : progress < 0.82
          ? 1 - smooth((progress - 0.5) / 0.32)
          : 0;
  const amount = settings.intensity * settings.distance;
  const cameraScale = 1 + 0.1 * settings.intensity * travel;
  let cameraTranslateX = 0;
  let cameraTranslateY = 0;
  if (settings.movement === "diagonal") {
    cameraTranslateX = -92 * amount * travel;
    cameraTranslateY = -44 * amount * travel;
  } else if (settings.movement === "pan") {
    cameraTranslateX = 92 * amount * travel;
  } else {
    cameraTranslateY = -48 * amount * travel;
  }

  const stage: CameraJourneyStage =
    progress === 0
      ? "established"
      : progress < 0.2
        ? "text-departure"
        : progress < 0.42
          ? "camera-travel"
          : progress <= 0.5
            ? "covered-handoff"
            : progress < 0.78
              ? "landscape-reveal"
              : progress < 0.98
                ? "text-arrival"
                : "settled";

  return {
    stage,
    cameraTranslateX,
    cameraTranslateY,
    cameraScale,
    coverOpacity,
    outgoingLandscapeOpacity: incoming ? 0 : 1,
    incomingLandscapeOpacity: incoming ? 1 : 0,
    outgoingCopyOpacity: departure,
    outgoingCopyTranslateY: -28 * smooth(progress / 0.2),
    incomingCopyOpacity: arrival,
    incomingCopyTranslateY: 24 * (1 - arrival),
  };
}
