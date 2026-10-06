// ─────────────────────────────────────────────────────────────────────────────
// Everything you'd want to edit lives here: captions and scene timing.
// Change a value, save, and Remotion Studio (`npm run studio`) updates live.
// ─────────────────────────────────────────────────────────────────────────────

export const FPS = 30;

export const PROJECT = {
  name: "ShadowAthlete",
  tagline: "Your next opponent is you.",
};

export const CAPTIONS = {
  intro: { title: "Turn your training into insight.", sub: "Tennis · Cricket · Basketball · Running" },
  upload: { title: "Upload a session", sub: "Record or pick a clip from your gallery" },
  model: {
    title: "Track → pose → classify",
    sub: "Frame-by-frame model output on a sample clip",
    badge: "Real model output · footage not shown",
  },
  results: { title: "Results you can act on", sub: "Stroke mix, joint angles and coach notes" },
  json: { title: "Raw stats, as JSON", file: "tennis_yolo_stats.json" },
  progress: [
    { title: "Progress you can see", sub: "Every session charted against your targets" },
    { title: "Then vs now", sub: "Ghost overlay of a past and current session" },
    { title: "Meet the future you", sub: "Projected from your own trend, then tested weekly" },
  ],
  tech: { title: "Under the hood" },
};

/** Scene lengths in seconds. They must add up to the total (45–60 s). */
export const SCENES = {
  hook: 5,
  intro: 7,
  upload: 3,
  model: 9,
  results: 6,
  progress: 12,
  tech: 10,
  closing: 5,
};

export const sec = (s: number) => Math.round(s * FPS);
export const TOTAL_FRAMES = Object.values(SCENES).reduce((a, s) => a + sec(s), 0);
