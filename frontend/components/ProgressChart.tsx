"use client";

// One metric over time: actual sessions (solid) then the projected "future you" (dashed + band).
// Colors validated with the dataviz palette checker on the dark card surface (#1c2026):
// actual #1fae55, projection #0ea5c6. The projection also differs by dash + band + label.

import { useMemo, useState } from "react";
import { type MetricDef, type Projection, fmtValue } from "@/lib/progress";

const ACTUAL = "#1fae55";
const PROJECTED = "#0ea5c6";
const W = 340;
const H = 176;
const PAD = { l: 36, r: 12, t: 14, b: 26 };

type Pt = { x: number; value: number; lo?: number; hi?: number; label: string; projected: boolean };

export default function ProgressChart({
  def,
  history,
  projection,
  sessionsPerWeek,
}: {
  def: MetricDef;
  history: { value: number; label: string }[];
  projection: Projection | null;
  sessionsPerWeek: number;
}) {
  const [hover, setHover] = useState<number | null>(null);

  const pts: Pt[] = useMemo(() => {
    const past = history.map((h, i) => ({ x: i, value: h.value, label: h.label, projected: false }));
    const future = (projection?.points ?? []).map((p) => ({
      x: history.length - 1 + p.k,
      value: p.value,
      lo: p.lo,
      hi: p.hi,
      label: `In ${Math.max(1, Math.round(p.k / sessionsPerWeek))} wk`,
      projected: true,
    }));
    return [...past, ...future];
  }, [history, projection, sessionsPerWeek]);

  const xMax = Math.max(1, pts[pts.length - 1]?.x ?? 1);
  const vals = pts.flatMap((p) => [p.value, p.lo ?? p.value, p.hi ?? p.value]).concat(def.target);
  let yMin = Math.min(...vals);
  let yMax = Math.max(...vals);
  const pad = Math.max((yMax - yMin) * 0.15, def.noise);
  yMin = Math.max(def.bounds[0], yMin - pad);
  yMax = Math.min(def.bounds[1], yMax + pad);

  // Piecewise x: past sessions get ~55% of the width, the projection the rest, so a long
  // projection doesn't squeeze the history into a corner.
  const now = history.length - 1;
  const plotW = W - PAD.l - PAD.r;
  const split = xMax > now ? 0.55 : 1;
  const sx = (x: number) =>
    PAD.l + (x <= now ? (now ? x / now : 0) * split : split + ((x - now) / (xMax - now)) * (1 - split)) * plotW;
  const toX = (frac: number) => (frac <= split ? (frac / split) * now : now + ((frac - split) / (1 - split)) * (xMax - now));
  const sy = (v: number) => PAD.t + (1 - (v - yMin) / (yMax - yMin || 1)) * (H - PAD.t - PAD.b);
  const past = pts.filter((p) => !p.projected);
  const future = pts.filter((p) => p.projected);
  const line = (arr: Pt[]) => arr.map((p, i) => `${i ? "L" : "M"}${sx(p.x).toFixed(1)},${sy(p.value).toFixed(1)}`).join(" ");
  const band = future.length
    ? `M${sx(now)},${sy(history[now].value)} ` +
      future.map((p) => `L${sx(p.x)},${sy(p.hi!)}`).join(" ") +
      " " +
      [...future].reverse().map((p) => `L${sx(p.x)},${sy(p.lo!)}`).join(" ") +
      " Z"
    : "";
  const ticks = [yMin, (yMin + yMax) / 2, yMax];
  const hp = hover != null ? pts[hover] : null;

  function onMove(e: React.PointerEvent<SVGRectElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = toX((e.clientX - rect.left) / rect.width);
    let best = 0;
    pts.forEach((p, i) => {
      if (Math.abs(p.x - x) < Math.abs(pts[best].x - x)) best = i;
    });
    setHover(best);
  }

  return (
    <div className="relative">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto select-none" role="img" aria-label={`${def.label} over sessions with projection`}>
        {/* recessive grid + y labels */}
        {ticks.map((t, i) => (
          <g key={i}>
            <line x1={PAD.l} x2={W - PAD.r} y1={sy(t)} y2={sy(t)} stroke="#31353c" strokeWidth="1" />
            <text x={PAD.l - 6} y={sy(t) + 3} textAnchor="end" fontSize="9" fill="#869585" fontFamily="Inter">
              {Math.round(t)}
            </text>
          </g>
        ))}
        {/* target */}
        {def.target >= yMin && def.target <= yMax && (
          <g>
            <line x1={PAD.l} x2={W - PAD.r} y1={sy(def.target)} y2={sy(def.target)} stroke="#bccbb9" strokeOpacity="0.45" strokeDasharray="2 4" strokeWidth="1" />
            <text x={PAD.l + 4} y={sy(def.target) - 4} textAnchor="start" fontSize="9" fill="#bccbb9" fontFamily="Inter">
              Target {fmtValue(def, def.target)}
            </text>
          </g>
        )}
        {/* now divider */}
        {future.length > 0 && (
          <g>
            <line x1={sx(now)} x2={sx(now)} y1={PAD.t} y2={H - PAD.b} stroke="#3d4a3d" strokeDasharray="3 3" />
            <text x={sx(now)} y={H - 8} textAnchor="middle" fontSize="9" fill="#dfe2eb" fontFamily="Inter">
              Now
            </text>
          </g>
        )}
        {/* projection band + line */}
        {band && <path d={band} fill={PROJECTED} fillOpacity="0.14" />}
        {future.length > 0 && <path d={`M${sx(now)},${sy(history[now].value)} ${line(future).replace(/^M/, "L")}`} fill="none" stroke={PROJECTED} strokeWidth="2" strokeDasharray="5 4" strokeLinecap="round" />}
        {/* actual line + markers */}
        <path d={line(past)} fill="none" stroke={ACTUAL} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        {past.map((p, i) => (
          <circle key={i} cx={sx(p.x)} cy={sy(p.value)} r="4" fill={ACTUAL} stroke="#1c2026" strokeWidth="2" />
        ))}
        {future.length > 0 && (
          <g>
            <circle cx={sx(future[future.length - 1].x)} cy={sy(future[future.length - 1].value)} r="4" fill={PROJECTED} stroke="#1c2026" strokeWidth="2" />
            <text x={sx(future[future.length - 1].x) - 6} y={sy(future[future.length - 1].value) - 8} textAnchor="end" fontSize="9" fill="#dfe2eb" fontFamily="Inter">
              Projected
            </text>
          </g>
        )}
        {/* x labels */}
        <text x={sx(0)} y={H - 8} textAnchor="start" fontSize="9" fill="#869585" fontFamily="Inter">
          {history[0]?.label}
        </text>
        {future.length > 0 && (
          <text x={W - PAD.r} y={H - 8} textAnchor="end" fontSize="9" fill="#869585" fontFamily="Inter">
            {future[future.length - 1].label}
          </text>
        )}
        {/* crosshair */}
        {hp && (
          <g>
            <line x1={sx(hp.x)} x2={sx(hp.x)} y1={PAD.t} y2={H - PAD.b} stroke="#dfe2eb" strokeOpacity="0.35" />
            <circle cx={sx(hp.x)} cy={sy(hp.value)} r="5" fill={hp.projected ? PROJECTED : ACTUAL} stroke="#1c2026" strokeWidth="2" />
          </g>
        )}
        <rect x={PAD.l} y={0} width={W - PAD.l - PAD.r} height={H} fill="transparent" onPointerMove={onMove} onPointerDown={onMove} onPointerLeave={() => setHover(null)} />
      </svg>
      {hp && (
        <div
          className="pointer-events-none absolute top-0 -translate-x-1/2 px-2 py-1 rounded-md bg-surface-container-highest shadow-lg whitespace-nowrap"
          style={{ left: `${(sx(hp.x) / W) * 100}%` }}
        >
          <span className="font-label-caps text-[10px] uppercase text-on-surface-variant">{hp.projected ? `Projected · ${hp.label}` : hp.label}</span>
          <div className="font-headline-md text-body-sm text-on-surface">
            {fmtValue(def, hp.value)}
            {hp.projected && hp.lo != null && <span className="text-on-surface-variant"> ({Math.round(hp.lo)}–{Math.round(hp.hi!)})</span>}
          </div>
        </div>
      )}
    </div>
  );
}
