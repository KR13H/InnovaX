// Brand tokens from the app (design/stitch/kinetic_ghost/DESIGN.md, frontend/tailwind.config.ts).

import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { loadFont as loadGrotesk } from "@remotion/google-fonts/SpaceGrotesk";

export const C = {
  bg: "#0a0e14",
  surface: "#10141a",
  container: "#1c2026",
  containerHigh: "#262a31",
  outline: "#3d4a3d",
  text: "#dfe2eb",
  textDim: "#bccbb9",
  muted: "#869585",
  primary: "#4be277",
  primaryDeep: "#22c55e",
  cyan: "#00eefc",
  amber: "#ffba61",
  violet: "#b69cff",
};

/** Colour per action class (the classifier's four labels + unknown). */
export const ACTION_COLOR: Record<string, string> = {
  forehand: C.primary,
  backhand: C.cyan,
  ready_position: C.amber,
  serve: C.violet,
  unknown: "#4a5260",
  not_tracked: "#2a2f37",
};

export const ACTION_LABEL: Record<string, string> = {
  forehand: "Forehand",
  backhand: "Backhand",
  ready_position: "Ready position",
  serve: "Serve",
  unknown: "Unknown",
  not_tracked: "Not tracked",
};

export const DISPLAY = loadGrotesk("normal", { weights: ["500", "600", "700"], subsets: ["latin"] }).fontFamily;
export const BODY = loadInter("normal", { weights: ["400", "500", "600"], subsets: ["latin"] }).fontFamily;
