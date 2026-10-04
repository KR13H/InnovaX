"use client";

// Animated training avatar: a glowing figure that demonstrates a drill.
// Each motion is a loop of keyframe poses (14 joints in a 100×100 box, y down) that are
// eased between and drawn on a canvas, with a prop (racket / ball) where the drill uses one.
// Side-view motions face right; the far-side limbs are drawn dimmer for depth.

import { useEffect, useRef } from "react";

type P = [number, number];
type Pose = {
  head: P; neck: P;
  ls: P; rs: P; le: P; re: P; lw: P; rw: P;
  lh: P; rh: P; lk: P; rk: P; la: P; ra: P;
};
type Prop = "none" | "racket" | "ball" | "basketball" | "medball";
type Motion = { frames: Pose[]; ms: number; prop: Prop; side: boolean };

const J: (keyof Pose)[] = ["head", "neck", "ls", "rs", "le", "re", "lw", "rw", "lh", "rh", "lk", "rk", "la", "ra"];

function pose(p: Partial<Pose>, base: Pose): Pose {
  return { ...base, ...p };
}
function shift(p: Pose, dx: number, dy: number): Pose {
  return Object.fromEntries(J.map((k) => [k, [p[k][0] + dx, p[k][1] + dy]])) as Pose;
}
function mirror(p: Pose): Pose {
  // swap left/right and flip horizontally around x=50
  const f = (q: P): P => [100 - q[0], q[1]];
  return {
    head: f(p.head), neck: f(p.neck),
    ls: f(p.rs), rs: f(p.ls), le: f(p.re), re: f(p.le), lw: f(p.rw), rw: f(p.lw),
    lh: f(p.rh), rh: f(p.lh), lk: f(p.rk), rk: f(p.lk), la: f(p.ra), ra: f(p.la),
  };
}

function swapSides(p: Pose): Pose {
  // swap left/right limbs in place (same facing) — the other half of a stride
  return { ...p, ls: p.rs, rs: p.ls, le: p.re, re: p.le, lw: p.rw, rw: p.lw, lh: p.rh, rh: p.lh, lk: p.rk, rk: p.lk, la: p.ra, ra: p.la };
}

// ---------- base poses ----------
const FRONT: Pose = {
  head: [50, 13], neck: [50, 21], ls: [43, 24], rs: [57, 24], le: [41, 36], re: [59, 36], lw: [40, 47], rw: [60, 47],
  lh: [46, 50], rh: [54, 50], lk: [46, 67], rk: [54, 67], la: [46, 84], ra: [54, 84],
};
const SIDE: Pose = {
  head: [50, 13], neck: [50, 21], ls: [49, 24], rs: [51, 24], le: [48, 36], re: [52, 36], lw: [49, 47], rw: [53, 47],
  lh: [49, 50], rh: [51, 50], lk: [49, 67], rk: [51, 67], la: [49, 84], ra: [51, 84],
};

// ---------- motions ----------
const SQUAT = pose({ head: [50, 27], neck: [50, 34], ls: [43, 37], rs: [57, 37], le: [41, 44], re: [59, 44], lw: [46, 41], rw: [54, 41], lh: [45, 61], rh: [55, 61], lk: [39, 71], rk: [61, 71] }, FRONT);
const JUMP = shift(pose({ le: [40, 14], re: [60, 14], lw: [42, 3], rw: [58, 3], la: [47, 86], ra: [53, 86] }, FRONT), 0, -9);

const LUNGE = pose({ head: [50, 24], neck: [50, 31], ls: [49, 34], rs: [51, 34], le: [48, 46], re: [52, 46], lw: [49, 56], rw: [53, 56], lh: [49, 61], rh: [51, 61], rk: [62, 67], ra: [62, 84], lk: [41, 78], la: [32, 84] }, SIDE);

const KNEE_UP = pose({ rk: [61, 51], ra: [59, 67], lw: [58, 31], le: [54, 36], rw: [42, 45], re: [46, 37] }, SIDE);
const RUN_A = shift(pose({ head: [53, 13], neck: [52, 21], ls: [51, 24], rs: [53, 24], rk: [61, 58], ra: [56, 72], lk: [44, 68], la: [37, 79], le: [44, 34], lw: [41, 42], re: [58, 33], rw: [62, 25] }, SIDE), 0, -2);
const RUN_M = shift(pose({ head: [53, 13], neck: [52, 21], ls: [51, 24], rs: [53, 24], lk: [51, 67], la: [50, 84], rk: [58, 60], ra: [51, 72], le: [48, 35], lw: [51, 43], re: [54, 35], rw: [57, 42] }, SIDE), 0, 1);
const RUN_B = shift(pose({ head: [53, 13], neck: [52, 21], ls: [51, 24], rs: [53, 24], lk: [61, 58], la: [56, 72], rk: [44, 68], ra: [37, 79], re: [44, 34], rw: [41, 42], le: [58, 33], lw: [62, 25] }, SIDE), 0, 1);

const READY = pose({ head: [50, 19], neck: [50, 27], ls: [43, 30], rs: [57, 30], le: [40, 41], re: [60, 41], lw: [46, 47], rw: [54, 47], lh: [45, 54], rh: [55, 54], lk: [40, 69], rk: [60, 69], la: [38, 84], ra: [62, 84] }, FRONT);
const HOP = shift(pose({ la: [44, 84], ra: [56, 84], lk: [44, 68], rk: [56, 68] }, READY), 0, -6);

const BAL = pose({ rk: [58, 52], ra: [57, 67], le: [32, 27], re: [68, 27], lw: [22, 24], rw: [78, 24] }, FRONT);
const BAL_W = pose({ head: [53, 13], neck: [52, 21], ls: [45, 25], rs: [59, 23], rk: [60, 51], ra: [59, 66], le: [34, 31], re: [69, 21], lw: [24, 35], rw: [79, 15] }, FRONT);
const BAL_W2 = pose({ head: [47, 13], neck: [48, 21], ls: [41, 23], rs: [55, 25], rk: [57, 53], ra: [56, 68], le: [31, 21], re: [66, 31], lw: [21, 15], rw: [76, 35] }, FRONT);
const TOES = shift(pose({ le: [40, 34], re: [60, 34], lw: [43, 42], rw: [57, 42] }, FRONT), 0, -8);

// Tennis (side view, right-handed, facing right). Racket hangs off the right wrist.
const T_READY = pose({ head: [50, 18], neck: [50, 26], le: [52, 38], re: [55, 37], lw: [58, 44], rw: [59, 44], lh: [49, 53], rh: [51, 53], lk: [53, 68], rk: [55, 68], la: [47, 84], ra: [54, 84] }, SIDE);
const T_BACK = pose({ head: [49, 18], neck: [49, 26], ls: [53, 28], rs: [45, 28], le: [55, 36], re: [36, 34], lw: [60, 38], rw: [28, 40], lk: [55, 68], rk: [46, 68] }, T_READY);
const T_HIT = pose({ head: [51, 18], neck: [51, 26], ls: [48, 28], rs: [54, 28], le: [44, 37], re: [64, 34], lw: [42, 44], rw: [73, 38], lk: [58, 68], ra: [44, 82] }, T_READY);
const T_FOLLOW = pose({ head: [51, 18], neck: [51, 26], ls: [46, 28], rs: [55, 28], le: [42, 35], re: [52, 18], lw: [40, 42], rw: [43, 14], lk: [58, 68], ra: [44, 82] }, T_READY);
const S_TROPHY = pose({ head: [49, 15], neck: [49, 23], le: [52, 11], lw: [54, 1], re: [40, 22], rw: [42, 12], lk: [53, 67], rk: [47, 67], lh: [48, 51], rh: [50, 51] }, SIDE);
const S_HIT = shift(pose({ head: [52, 13], neck: [51, 21], le: [56, 34], lw: [55, 44], re: [56, 9], rw: [60, -2], la: [51, 82] }, SIDE), 0, -4);
const S_FOLLOW = pose({ head: [56, 20], neck: [54, 27], ls: [53, 30], rs: [56, 30], re: [56, 42], rw: [48, 54], le: [52, 40], lw: [48, 48], rk: [60, 65], ra: [64, 80], lk: [44, 70], la: [38, 84] }, SIDE);

// Cricket bowling (side view, right-arm, facing right). Ball in the right hand.
const B_GATHER = pose({ head: [50, 12], neck: [50, 20], rk: [57, 56], ra: [55, 70], lk: [45, 66], la: [40, 80], le: [52, 32], lw: [55, 25], re: [50, 33], rw: [53, 27] }, SIDE);
const B_BFC = pose({ head: [46, 15], neck: [47, 23], ls: [51, 25], rs: [44, 26], le: [56, 14], lw: [58, 4], re: [38, 36], rw: [33, 44], lh: [48, 51], rh: [46, 51], lk: [58, 56], la: [62, 66], rk: [44, 67], ra: [46, 84] }, SIDE);
const B_FFC = pose({ head: [53, 15], neck: [53, 23], ls: [55, 25], rs: [50, 26], le: [60, 30], lw: [58, 40], re: [42, 18], rw: [38, 8], lh: [52, 51], rh: [50, 51], lk: [60, 67], la: [67, 84], rk: [42, 66], ra: [34, 80] }, SIDE);
const B_RELEASE = pose({ head: [57, 16], neck: [56, 24], ls: [57, 27], rs: [54, 26], le: [56, 38], lw: [52, 47], re: [57, 12], rw: [61, 0], lh: [54, 52], rh: [52, 52], lk: [61, 67], la: [67, 84], rk: [46, 64], ra: [40, 77] }, SIDE);
const B_FOLLOW = pose({ head: [63, 26], neck: [61, 32], ls: [61, 35], rs: [59, 35], le: [58, 46], lw: [55, 54], re: [56, 48], rw: [50, 58], lh: [55, 55], rh: [54, 55], lk: [62, 68], la: [67, 84], rk: [58, 60], ra: [62, 72] }, SIDE);

// Trunk rotation with a medicine ball held in front (front view; rotation = shoulder shift).
const ROT_L = pose({ ls: [40, 25], rs: [53, 23], le: [36, 36], re: [46, 34], lw: [36, 40], rw: [40, 40], head: [48, 13], neck: [48, 21], lk: [44, 67], rk: [56, 67], la: [42, 84], ra: [58, 84] }, FRONT);
const ROT_R = mirror(ROT_L);

// Basketball form shooting (side view, facing right).
const SHOT_SET = pose({ head: [50, 19], neck: [50, 27], le: [55, 33], lw: [55, 22], re: [56, 36], rw: [56, 23], lh: [49, 56], rh: [51, 56], lk: [56, 70], rk: [57, 70] }, SIDE);
const SHOT_UP = shift(pose({ le: [53, 14], lw: [55, 6], re: [56, 12], rw: [59, 2], la: [50, 84], ra: [52, 84] }, SIDE), 0, -5);

// stretch: reach overhead, then side bends
const REACH = pose({ le: [44, 12], re: [56, 12], lw: [47, 2], rw: [53, 2] }, FRONT);
const BEND_L = pose({ head: [42, 15], neck: [45, 22], ls: [39, 27], rs: [52, 23], re: [50, 11], rw: [40, 4], le: [37, 38], lw: [38, 49] }, FRONT);
const BEND_R = mirror(BEND_L);
const IDLE_A = FRONT;
const IDLE_B = pose({ head: [50, 12.5], neck: [50, 20.5], ls: [43, 23.5], rs: [57, 23.5] }, FRONT);

const MOTIONS: Record<string, Motion> = {
  squat_jump: { frames: [FRONT, SQUAT, JUMP, SQUAT], ms: 2400, prop: "none", side: false },
  lunge: { frames: [SIDE, LUNGE], ms: 2000, prop: "none", side: true },
  march: { frames: [SIDE, KNEE_UP, SIDE, mirror(KNEE_UP)], ms: 1800, prop: "none", side: true },
  run: { frames: [RUN_A, RUN_M, RUN_B, swapSides(RUN_M)], ms: 900, prop: "none", side: true },
  split_step: { frames: [READY, HOP, READY], ms: 1200, prop: "racket", side: false },
  lateral: { frames: [shift(READY, -12, 0), shift(HOP, 0, 0), shift(READY, 12, 0), shift(HOP, 0, 0)], ms: 1800, prop: "none", side: false },
  balance: { frames: [FRONT, BAL, BAL_W, BAL_W2, BAL, FRONT, mirror(BAL), mirror(BAL_W), mirror(BAL_W2), mirror(BAL)], ms: 6000, prop: "none", side: false },
  calf_raise: { frames: [FRONT, TOES, TOES, FRONT], ms: 1800, prop: "none", side: false },
  stretch: { frames: [FRONT, REACH, BEND_L, REACH, BEND_R, REACH], ms: 5200, prop: "none", side: false },
  forehand: { frames: [T_READY, T_BACK, T_HIT, T_FOLLOW, T_READY], ms: 2200, prop: "racket", side: true },
  backhand: { frames: [mirror(T_READY), mirror(T_BACK), mirror(T_HIT), mirror(T_FOLLOW), mirror(T_READY)], ms: 2200, prop: "racket", side: true },
  two_side: { frames: [T_READY, T_BACK, T_HIT, T_FOLLOW, T_READY, mirror(T_BACK), mirror(T_HIT), mirror(T_FOLLOW)], ms: 3800, prop: "racket", side: true },
  serve: { frames: [T_READY, S_TROPHY, S_HIT, S_FOLLOW, T_READY], ms: 2600, prop: "racket", side: true },
  bowling: { frames: [B_GATHER, B_BFC, B_FFC, B_RELEASE, B_FOLLOW, SIDE], ms: 2600, prop: "ball", side: true },
  rotation: { frames: [FRONT, ROT_L, FRONT, ROT_R], ms: 2400, prop: "medball", side: false },
  shooting: { frames: [SIDE, SHOT_SET, SHOT_UP, SIDE], ms: 2000, prop: "basketball", side: true },
  idle: { frames: [IDLE_A, IDLE_B], ms: 2400, prop: "none", side: false },
};

/** Picks a motion for a drill from its id and/or name (backend drill ids + basketball drill text). */
export function motionFor(drill: string): keyof typeof MOTIONS {
  const d = drill.toLowerCase();
  if (/(bowl|delivery|stump|corridor|length_zone|length zone|run-?up|runup|pace|release|stride_marker|front_foot|front-foot|front_leg|back_leg)/.test(d)) return "bowling";
  if (/(hip_shoulder|hip-shoulder|rotation|medicine)/.test(d)) return "rotation";
  if (/serve|service/.test(d)) return "serve";
  if (/two_side|two-side|both sides/.test(d)) return "two_side";
  if (/backhand/.test(d)) return "backhand";
  if (/(forehand|stroke)/.test(d)) return "forehand";
  if (/(split|ready)/.test(d)) return "split_step";
  if (/(lateral|recover_to_center|recover to center|shuffle)/.test(d)) return "lateral";
  if (/(shoot|shooting)/.test(d)) return "shooting";
  if (/(squat|jump)/.test(d)) return "squat_jump";
  if (/lunge/.test(d)) return "lunge";
  if (/jog/.test(d)) return "run";
  if (/(stretch|mobility|leg swing)/.test(d)) return "stretch";
  if (/calf/.test(d)) return "calf_raise";
  if (/(balance|single_leg_balance)/.test(d)) return "balance";
  if (/(march|single_leg_march|a_skip|skip)/.test(d)) return "march";
  if (/(run|stride|ankling|posture|jog)/.test(d)) return "run";
  if (/walk/.test(d)) return "march";
  return "idle";
}

const ease = (t: number) => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2);
const lerp = (a: P, b: P, t: number): P => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];

export default function DrillAvatar({ drill, size = 96, className = "" }: { drill: string; size?: number; className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const m = MOTIONS[motionFor(drill)];
    let raf = 0;
    let visible = true;
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
    io.observe(canvas);
    const start = performance.now();

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      if (!visible) return;
      const dpr = devicePixelRatio || 1;
      const w = (canvas.width = canvas.clientWidth * dpr);
      const h = (canvas.height = canvas.clientHeight * dpr);
      const ctx = canvas.getContext("2d")!;
      ctx.clearRect(0, 0, w, h);

      // current pose: eased interpolation between consecutive keyframes
      const n = m.frames.length;
      const t = ((Math.max(0, now - start) % m.ms) / m.ms) * n;
      const i = Math.floor(t);
      const k = ease(t - i);
      const a = m.frames[i % n];
      const b = m.frames[(i + 1) % n];
      const p = Object.fromEntries(J.map((j) => [j, lerp(a[j], b[j], k)])) as Pose;

      const s = Math.min(w, h) / 100;
      const ox = (w - 100 * s) / 2;
      const X = (q: P) => ox + q[0] * s;
      const Y = (q: P) => q[1] * s;

      // ground + shadow
      ctx.fillStyle = "rgba(75,226,119,0.12)";
      ctx.beginPath();
      ctx.ellipse(ox + 50 * s, 87 * s, 20 * s, 3 * s, 0, 0, Math.PI * 2);
      ctx.fill();

      const bone = (q1: P, q2: P, far: boolean) => {
        ctx.strokeStyle = far ? "rgba(75,226,119,0.45)" : "#4be277";
        ctx.lineWidth = (far ? 3 : 4) * s * 0.9;
        ctx.beginPath();
        ctx.moveTo(X(q1), Y(q1));
        ctx.lineTo(X(q2), Y(q2));
        ctx.stroke();
      };
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.shadowColor = "rgba(75,226,119,0.8)";
      ctx.shadowBlur = 8 * s;
      const hip: P = [(p.lh[0] + p.rh[0]) / 2, (p.lh[1] + p.rh[1]) / 2];
      const farL = m.side; // in side view the left limbs are on the far side
      // far limbs first
      bone(p.lh, p.lk, farL); bone(p.lk, p.la, farL);
      bone(p.ls, p.le, farL); bone(p.le, p.lw, farL);
      // torso
      bone(p.neck, hip, false);
      bone(p.ls, p.rs, false);
      bone(p.lh, p.rh, false);
      // near limbs
      bone(p.rh, p.rk, false); bone(p.rk, p.ra, false);
      bone(p.rs, p.re, false); bone(p.re, p.rw, false);
      ctx.shadowBlur = 0;

      // head
      ctx.fillStyle = "#4be277";
      ctx.beginPath();
      ctx.arc(X(p.head), Y(p.head), 5.5 * s, 0, Math.PI * 2);
      ctx.fill();

      // props
      if (m.prop === "racket") {
        const dx = p.rw[0] - p.re[0];
        const dy = p.rw[1] - p.re[1];
        const len = Math.hypot(dx, dy) || 1;
        const ux = dx / len;
        const uy = dy / len;
        const tip: P = [p.rw[0] + ux * 9, p.rw[1] + uy * 9];
        ctx.strokeStyle = "#bccbb9";
        ctx.lineWidth = 1.6 * s;
        ctx.beginPath();
        ctx.moveTo(X(p.rw), Y(p.rw));
        ctx.lineTo(X(tip), Y(tip));
        ctx.stroke();
        ctx.strokeStyle = "#00eefc";
        ctx.lineWidth = 1.4 * s;
        ctx.beginPath();
        ctx.ellipse(X([tip[0] + ux * 5, tip[1] + uy * 5]), Y([tip[0] + ux * 5, tip[1] + uy * 5]), 5 * s, 3.4 * s, Math.atan2(uy, ux), 0, Math.PI * 2);
        ctx.stroke();
      } else if (m.prop === "ball" || m.prop === "basketball" || m.prop === "medball") {
        const between: P = m.prop === "ball" ? p.rw : [(p.lw[0] + p.rw[0]) / 2, (p.lw[1] + p.rw[1]) / 2 - (m.prop === "basketball" ? 3 : 0)];
        ctx.fillStyle = m.prop === "ball" ? "#ffba61" : m.prop === "basketball" ? "#ef9900" : "#00eefc";
        ctx.beginPath();
        ctx.arc(X(between), Y(between), (m.prop === "ball" ? 2.6 : 4.2) * s, 0, Math.PI * 2);
        ctx.fill();
      }

      // joints
      ctx.fillStyle = "#ffffff";
      for (const j of ["lw", "rw", "le", "re", "lk", "rk", "la", "ra", "lh", "rh"] as (keyof Pose)[]) {
        ctx.beginPath();
        ctx.arc(X(p[j]), Y(p[j]), 1.5 * s, 0, Math.PI * 2);
        ctx.fill();
      }
    };
    raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
    };
  }, [drill]);

  return <canvas ref={ref} className={className} style={{ width: size, height: size }} aria-hidden="true" />;
}
