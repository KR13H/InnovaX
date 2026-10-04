"use client";

// Pose-only replay: runs MediaPipe on a hidden copy of the clip and draws just the tracked
// skeleton (with a short motion trail) on a dark canvas. Without a clip it shows an idle
// "breathing" skeleton so the panel never looks empty.

import { useEffect, useRef, useState } from "react";
import { BONES, JOINTS, type NormalizedLandmark, getPoseLandmarker } from "@/lib/pose";

const LIME = "75,226,119";
const CYAN = "0,238,252";
const TRAIL = 6; // past frames kept for the ghost trail

// A neutral standing pose in normalized coordinates (BlazePose indices), used before
// tracking starts and when there's no clip.
const IDLE: Record<number, [number, number]> = {
  0: [0.5, 0.18], 11: [0.42, 0.3], 12: [0.58, 0.3], 13: [0.38, 0.43], 14: [0.62, 0.43],
  15: [0.36, 0.55], 16: [0.64, 0.55], 19: [0.355, 0.58], 20: [0.645, 0.58],
  23: [0.45, 0.56], 24: [0.55, 0.56], 25: [0.44, 0.72], 26: [0.56, 0.72],
  27: [0.43, 0.88], 28: [0.57, 0.88], 31: [0.41, 0.9], 32: [0.59, 0.9],
};

function idlePose(t: number): NormalizedLandmark[] {
  const lm: NormalizedLandmark[] = Array.from({ length: 33 }, () => ({ x: 0.5, y: 0.5, z: 0, visibility: 0 }));
  const sway = Math.sin(t / 900) * 0.008;
  const breathe = Math.sin(t / 600) * 0.004;
  for (const [i, [x, y]] of Object.entries(IDLE)) {
    const upper = y < 0.56;
    lm[Number(i)] = { x: x + (upper ? sway : 0), y: y + (upper ? breathe : 0), z: 0, visibility: 1 };
  }
  return lm;
}

export default function SkeletonReplay({ src, label }: { src?: string | null; label?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const trail = useRef<NormalizedLandmark[][]>([]);
  const [tracking, setTracking] = useState(false);

  useEffect(() => {
    let raf = 0;
    let cancelled = false;
    let lastTs = 0;
    let landmarker: Awaited<ReturnType<typeof getPoseLandmarker>> | null = null;
    // Smoothed camera (centre + scale) that follows the athlete so they fill the panel.
    const cam = { cx: 0.5, cy: 0.5, scale: 1, ready: false };
    if (src) getPoseLandmarker().then((l) => (landmarker = l), () => {});

    const draw = (poses: NormalizedLandmark[][], aspect: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const dpr = devicePixelRatio || 1;
      const w = (canvas.width = canvas.clientWidth * dpr);
      const h = (canvas.height = canvas.clientHeight * dpr);
      const ctx = canvas.getContext("2d")!;
      ctx.clearRect(0, 0, w, h);

      // Frame the athlete: fit the pose bounding box to ~78% of the panel height,
      // easing toward it each frame so the "camera" glides instead of jumping.
      // Frame the whole trail (not just the newest pose) so the motion stays in view.
      const pts = poses.flat().filter((l) => (l.visibility ?? 1) > 0.4);
      if (pts.length > 4) {
        const xs = pts.map((l) => l.x * aspect);
        const ys = pts.map((l) => l.y);
        const bw = Math.max(...xs) - Math.min(...xs);
        const bh = Math.max(...ys) - Math.min(...ys);
        const target = {
          cx: (Math.max(...xs) + Math.min(...xs)) / 2,
          cy: (Math.max(...ys) + Math.min(...ys)) / 2,
          scale: Math.min((0.78 * h) / Math.max(bh, 0.05), (0.85 * w) / Math.max(bw, 0.05)),
        };
        const k = cam.ready ? 0.3 : 1;
        cam.cx += (target.cx - cam.cx) * k;
        cam.cy += (target.cy - cam.cy) * k;
        cam.scale += (target.scale - cam.scale) * k;
        cam.ready = true;
      }
      const toCanvas = (l: NormalizedLandmark) => [w / 2 + (l.x * aspect - cam.cx) * cam.scale, h / 2 + (l.y - cam.cy) * cam.scale] as const;

      poses.forEach((lm, idx) => {
        const newest = idx === poses.length - 1;
        const alpha = newest ? 1 : 0.08 + (idx / poses.length) * 0.25;
        const color = newest ? LIME : CYAN;
        const p = (i: number) => toCanvas(lm[i]);
        const vis = (i: number) => (lm[i].visibility ?? 1) > 0.4;
        ctx.lineCap = "round";
        ctx.lineWidth = (newest ? 4 : 2) * dpr;
        ctx.strokeStyle = `rgba(${color},${alpha})`;
        ctx.shadowColor = `rgba(${color},${newest ? 0.9 : 0})`;
        ctx.shadowBlur = newest ? 14 * dpr : 0;
        for (const [a, b] of BONES) {
          if (!vis(a) || !vis(b)) continue;
          ctx.beginPath();
          ctx.moveTo(...p(a));
          ctx.lineTo(...p(b));
          ctx.stroke();
        }
        if (newest) {
          ctx.shadowBlur = 0;
          for (const i of JOINTS) {
            if (!vis(i)) continue;
            const [x, y] = p(i);
            ctx.beginPath();
            ctx.fillStyle = "#ffffff";
            ctx.arc(x, y, (i === 0 ? 6 : 4) * dpr, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      });
    };

    const loop = () => {
      if (cancelled) return;
      const v = videoRef.current;
      if (src && v && landmarker && v.readyState >= 2 && !v.paused) {
        const ts = Math.max(performance.now(), lastTs + 1);
        lastTs = ts;
        try {
          const lm = landmarker.detectForVideo(v, ts).landmarks[0];
          if (lm) {
            trail.current = [...trail.current.slice(-(TRAIL - 1)), lm];
            setTracking(true);
          }
        } catch {
          // A dropped frame just keeps the previous skeleton on screen.
        }
        const aspect = v.videoWidth / (v.videoHeight || 1) || 9 / 16;
        draw(trail.current.length ? trail.current : [idlePose(performance.now())], aspect);
      } else {
        draw([idlePose(performance.now())], 9 / 16);
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
    };
  }, [src]);

  return (
    <div className="relative w-full h-72 rounded-xl overflow-hidden bg-surface-container-lowest">
      {/* faint grid */}
      <div className="absolute inset-0 opacity-[0.07] bg-[linear-gradient(#bccbb9_1px,transparent_1px),linear-gradient(90deg,#bccbb9_1px,transparent_1px)] [background-size:28px_28px]"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(75,226,119,0.08),transparent_65%)]"></div>
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full"></canvas>
      {/* The clip only feeds the tracker; it is never shown. Kept rendered (not display:none)
          so mobile browsers keep decoding frames. */}
      {src && (
        <video ref={videoRef} src={src} muted playsInline autoPlay loop className="absolute w-px h-px opacity-0 pointer-events-none" aria-hidden="true"></video>
      )}
      <span className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-container/80 backdrop-blur-md">
        <span className={`w-1.5 h-1.5 rounded-full ${tracking ? "bg-primary animate-pulse" : "bg-secondary animate-pulse"}`}></span>
        <span className="font-label-caps text-label-caps uppercase text-on-surface">{tracking ? "Tracking your movement" : label ?? "Preparing"}</span>
      </span>
    </div>
  );
}
