// Real tennis-pipeline output (see scripts/export_tennis_output.py), one entry per source frame.
// Coordinates are normalised to the source frame (0..1).

import raw from "./data/tennis-output.json";

export type Landmark = [number, number, number]; // x, y, visibility
export type PoseFrame = {
  box: [number, number, number, number] | null;
  others: [number, number, number, number][];
  lm: Landmark[] | null;
  label: string;
  conf: number | null;
  probs: Record<string, number> | null;
  angles: Record<string, number>;
};

type Output = {
  source: { width: number; height: number; fps: number };
  connections: [number, number][];
  stats: {
    estimated_shot_counts: Record<string, number>;
    estimated_shot_events: { type: string; start_seconds: number; end_seconds: number }[];
    target_track_id: number;
    processed_frames: number;
    tracked_player_frames: number;
    pose_detected_frames: number;
    tracking_coverage_percent: number;
    pose_frame_counts: Record<string, number>;
    mean_joint_angles_degrees: Record<string, number | null>;
  };
  frames: PoseFrame[];
};

export const OUTPUT = raw as unknown as Output;
export const SRC = OUTPUT.source;
export const FRAMES = OUTPUT.frames;

/** Limb segments: the pipeline's own connections plus neck and head for a fuller figure. */
export const BONES: [number, number][] = OUTPUT.connections;

export const frameAt = (i: number) => FRAMES[Math.max(0, Math.min(FRAMES.length - 1, Math.floor(i)))];

/** Last frame at or before i that has landmarks (the pose model misses the odd frame). */
export function poseAt(i: number): PoseFrame {
  for (let k = Math.floor(i); k >= 0; k--) {
    const f = frameAt(k);
    if (f.lm) return f;
  }
  return FRAMES.find((f) => f.lm)!;
}

/** Bounding area the tracked player covers across a frame range, in source pixels. */
export function playerArea(from = 0, to = FRAMES.length - 1, pad = 0.15) {
  let x1 = 1, y1 = 1, x2 = 0, y2 = 0;
  for (let i = from; i <= to; i++) {
    const b = FRAMES[i]?.box;
    if (!b) continue;
    x1 = Math.min(x1, b[0]); y1 = Math.min(y1, b[1]); x2 = Math.max(x2, b[2]); y2 = Math.max(y2, b[3]);
  }
  const w = (x2 - x1) * SRC.width, h = (y2 - y1) * SRC.height;
  return { x: x1 * SRC.width - w * pad, y: y1 * SRC.height - h * pad, w: w * (1 + 2 * pad), h: h * (1 + 2 * pad) };
}

/**
 * A view box (source px) that follows the tracked player smoothly, like a camera:
 * the box centre is averaged over ±`smooth` frames, the size stays fixed.
 */
export function followView(i: number, height = 300, aspect = 9 / 16, smooth = 10) {
  let cx = 0, cy = 0, n = 0;
  for (let k = Math.floor(i) - smooth; k <= Math.floor(i) + smooth; k++) {
    const b = FRAMES[Math.max(0, Math.min(FRAMES.length - 1, k))].box;
    if (!b) continue;
    cx += ((b[0] + b[2]) / 2) * SRC.width;
    cy += ((b[1] + b[3]) / 2) * SRC.height;
    n++;
  }
  cx /= n || 1;
  cy /= n || 1;
  const w = height * aspect;
  return { x: cx - w / 2, y: cy - height / 2, w, h: height };
}
