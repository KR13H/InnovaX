"use client";

// Ghost overlay: the current session's skeleton (lime) over a past session's (cyan "shadow"),
// both centred on the hips and scaled by torso length so camera distance doesn't matter.
// The two clips play in sync by progress (the longer one is sped up / slowed to match), and
// the two small players underneath show the source footage.

import { useCallback, useEffect, useRef, useState } from "react";
import { BONES, JOINTS, type NormalizedLandmark, createPoseLandmarker } from "@/lib/pose";

const NOW = "75,226,119";
const PAST = "0,238,252";

type Landmarker = Awaited<ReturnType<typeof createPoseLandmarker>>;

function normalize(lm: NormalizedLandmark[], aspect: number) {
  // Hip midpoint as origin, torso (shoulder-mid → hip-mid) as unit length.
  const P = (i: number) => ({ x: lm[i].x * aspect, y: lm[i].y });
  const hip = { x: (P(23).x + P(24).x) / 2, y: (P(23).y + P(24).y) / 2 };
  const sh = { x: (P(11).x + P(12).x) / 2, y: (P(11).y + P(12).y) / 2 };
  const torso = Math.hypot(sh.x - hip.x, sh.y - hip.y) || 0.2;
  return lm.map((l) => ({ x: (l.x * aspect - hip.x) / torso, y: (l.y - hip.y) / torso, v: l.visibility ?? 1 }));
}

export default function GhostCompare({ nowSrc, pastSrc, nowLabel, pastLabel }: { nowSrc: string; pastSrc: string; nowLabel: string; pastLabel: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const nowRef = useRef<HTMLVideoElement>(null);
  const pastRef = useRef<HTMLVideoElement>(null);
  const models = useRef<{ now: Landmarker | null; past: Landmarker | null }>({ now: null, past: null });
  const poses = useRef<{ now: ReturnType<typeof normalize> | null; past: ReturnType<typeof normalize> | null }>({ now: null, past: null });
  const [ready, setReady] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let cancelled = false;
    Promise.all([createPoseLandmarker(), createPoseLandmarker()]).then(([a, b]) => {
      if (cancelled) return a.close(), b.close();
      models.current = { now: a, past: b };
      setReady(true);
    });
    return () => {
      cancelled = true;
      models.current.now?.close();
      models.current.past?.close();
    };
  }, []);

  // Match durations: the past clip's rate is set so both reach the end together.
  const syncRates = useCallback(() => {
    const n = nowRef.current;
    const p = pastRef.current;
    if (n?.duration && p?.duration) p.playbackRate = Math.min(4, Math.max(0.25, p.duration / n.duration));
  }, []);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = devicePixelRatio || 1;
    const w = (canvas.width = canvas.clientWidth * dpr);
    const h = (canvas.height = canvas.clientHeight * dpr);
    const ctx = canvas.getContext("2d")!;
    ctx.clearRect(0, 0, w, h);
    const unit = h / 5.2; // torso lengths that fit the panel height
    const ox = w / 2;
    const oy = h * 0.52;
    for (const [key, color, solid] of [
      ["past", PAST, false],
      ["now", NOW, true],
    ] as const) {
      const pts = poses.current[key];
      if (!pts) continue;
      const p = (i: number) => [ox + pts[i].x * unit, oy + pts[i].y * unit] as const;
      ctx.lineCap = "round";
      ctx.lineWidth = (solid ? 4 : 3) * dpr;
      ctx.strokeStyle = `rgba(${color},${solid ? 1 : 0.75})`;
      ctx.setLineDash(solid ? [] : [6 * dpr, 5 * dpr]);
      ctx.shadowColor = `rgba(${color},0.8)`;
      ctx.shadowBlur = (solid ? 12 : 6) * dpr;
      for (const [a, b] of BONES) {
        if (pts[a].v < 0.4 || pts[b].v < 0.4) continue;
        ctx.beginPath();
        ctx.moveTo(...p(a));
        ctx.lineTo(...p(b));
        ctx.stroke();
      }
      ctx.setLineDash([]);
      ctx.shadowBlur = 0;
      for (const i of JOINTS) {
        if (pts[i].v < 0.4) continue;
        const [x, y] = p(i);
        ctx.beginPath();
        ctx.fillStyle = solid ? "#ffffff" : `rgba(${color},0.9)`;
        ctx.arc(x, y, (solid ? 4 : 3) * dpr, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }, []);

  const detect = useCallback(
    (ts: number) => {
      for (const key of ["now", "past"] as const) {
        const v = key === "now" ? nowRef.current : pastRef.current;
        const m = models.current[key];
        if (!v || !m || v.readyState < 2) continue;
        try {
          const lm = m.detectForVideo(v, ts).landmarks[0];
          if (lm) poses.current[key] = normalize(lm, v.videoWidth / (v.videoHeight || 1));
        } catch {
          // keep last pose on a dropped frame
        }
      }
      draw();
    },
    [draw],
  );

  useEffect(() => {
    if (!ready) return;
    let raf = 0;
    let last = 0;
    const loop = () => {
      const ts = Math.max(performance.now(), last + 1);
      last = ts;
      if (playing) detect(ts);
      const n = nowRef.current;
      if (n?.duration) setProgress(n.currentTime / n.duration);
      raf = requestAnimationFrame(loop);
    };
    detect(performance.now());
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [ready, playing, detect]);

  function toggle() {
    const n = nowRef.current;
    const p = pastRef.current;
    if (!n || !p) return;
    syncRates();
    if (n.paused) {
      n.play();
      p.play();
      setPlaying(true);
    } else {
      n.pause();
      p.pause();
      setPlaying(false);
    }
  }

  function seek(frac: number) {
    const n = nowRef.current;
    const p = pastRef.current;
    if (!n || !p) return;
    n.currentTime = frac * (n.duration || 0);
    p.currentTime = frac * (p.duration || 0);
    setProgress(frac);
    setTimeout(() => detect(performance.now()), 120);
  }

  return (
    <div className="flex flex-col gap-space-sm">
      <div className="relative w-full h-80 rounded-xl overflow-hidden bg-surface-container-lowest">
        <div className="absolute inset-0 opacity-[0.07] bg-[linear-gradient(#bccbb9_1px,transparent_1px),linear-gradient(90deg,#bccbb9_1px,transparent_1px)] [background-size:28px_28px]"></div>
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full"></canvas>
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
          <span className="flex items-center gap-3 px-2.5 py-1 rounded-full bg-surface-container/80 backdrop-blur-md font-label-caps text-label-caps uppercase">
            <span className="flex items-center gap-1.5 text-on-surface">
              <span className="w-3 h-0.5 rounded-full" style={{ background: `rgb(${NOW})` }}></span>
              Now
            </span>
            <span className="flex items-center gap-1.5 text-on-surface">
              <span className="w-3 border-t-2 border-dashed" style={{ borderColor: `rgb(${PAST})` }}></span>
              Past
            </span>
          </span>
          {!ready && <span className="font-label-caps text-label-caps uppercase text-secondary animate-pulse">Loading tracker…</span>}
        </div>
        {!playing && ready && (
          <button type="button" onClick={toggle} aria-label="Play both" className="absolute inset-0 m-auto w-16 h-16 rounded-full bg-surface-container-high/85 backdrop-blur-md flex items-center justify-center text-primary shadow-[0_0_24px_rgba(75,226,119,0.35)]">
            <span className="material-symbols-outlined text-[36px] ml-0.5" style={{ fontVariationSettings: "'FILL' 1" }}>play_arrow</span>
          </button>
        )}
        <div className="absolute bottom-0 inset-x-0 px-3 pb-2.5 pt-6 bg-gradient-to-t from-black/70 to-transparent flex items-center gap-2.5">
          <button type="button" onClick={toggle} className="text-on-surface" aria-label={playing ? "Pause" : "Play"}>
            <span className="material-symbols-outlined text-[22px]" style={{ fontVariationSettings: "'FILL' 1" }}>{playing ? "pause" : "play_arrow"}</span>
          </button>
          <input type="range" min={0} max={1} step={0.001} value={progress} onChange={(e) => seek(Number(e.target.value))} className="flex-1 h-1 accent-primary" aria-label="Scrub both clips" />
        </div>
      </div>

      {/* Source footage, side by side */}
      <div className="grid grid-cols-2 gap-gutter-mobile">
        {[
          { ref: pastRef, src: pastSrc, label: pastLabel, color: PAST, title: "Past" },
          { ref: nowRef, src: nowSrc, label: nowLabel, color: NOW, title: "Now" },
        ].map((c) => (
          <div key={c.title} className="flex flex-col gap-1">
            <div className="relative aspect-[3/4] rounded-lg overflow-hidden bg-black">
              <video ref={c.ref} src={c.src} muted playsInline loop preload="auto" onLoadedMetadata={syncRates} onLoadedData={() => detect(performance.now())} className="absolute inset-0 w-full h-full object-contain"></video>
              <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded bg-black/60 font-label-caps text-[10px] uppercase" style={{ color: `rgb(${c.color})` }}>
                {c.title}
              </span>
            </div>
            <span className="font-body-sm text-[12px] text-on-surface-variant truncate">{c.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
