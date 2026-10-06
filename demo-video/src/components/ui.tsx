// Shared building blocks: background, scene fades, captions, badges and the logo.

import React from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { PROJECT } from "../config";
import { poseAt } from "../pose";
import { BODY, C, DISPLAY } from "../theme";
import { Figure } from "./Figure";

export const ease = Easing.bezier(0.22, 1, 0.36, 1);

/** 0→1 over [start, start+len] with the house easing. */
export function useIn(start: number, len = 18) {
  const f = useCurrentFrame();
  return interpolate(f, [start, start + len], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease });
}

/** Persistent backdrop: deep surface, two soft brand glows and a faint grid that drifts. */
export const Background: React.FC = () => {
  const f = useCurrentFrame();
  const drift = (f * 0.25) % 64;
  return (
    <AbsoluteFill style={{ background: C.bg }}>
      <AbsoluteFill
        style={{
          backgroundImage: "linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
          backgroundPosition: `${drift}px ${drift}px`,
          maskImage: "radial-gradient(ellipse at center, black 30%, transparent 80%)",
        }}
      />
      <AbsoluteFill style={{ background: `radial-gradient(900px 600px at ${15 + Math.sin(f / 90) * 4}% 10%, rgba(75,226,119,0.10), transparent 70%)` }} />
      <AbsoluteFill style={{ background: `radial-gradient(900px 700px at ${88 + Math.cos(f / 110) * 4}% 95%, rgba(0,238,252,0.08), transparent 70%)` }} />
    </AbsoluteFill>
  );
};

/** Fades a scene in and out at its edges (frames are local to the scene's Sequence). */
export const SceneFade: React.FC<{ children: React.ReactNode; fadeIn?: number; fadeOut?: number }> = ({ children, fadeIn = 12, fadeOut = 12 }) => {
  const f = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const o = Math.min(
    fadeIn ? interpolate(f, [0, fadeIn], [0, 1], { extrapolateRight: "clamp" }) : 1,
    fadeOut ? interpolate(f, [durationInFrames - fadeOut, durationInFrames], [1, 0], { extrapolateLeft: "clamp" }) : 1,
  );
  return <AbsoluteFill style={{ opacity: o }}>{children}</AbsoluteFill>;
};

/** Kinetic caption: a kicker line, then the title rising in word by word, then a subline. */
export const Caption: React.FC<{ title: string; sub?: string; kicker?: string; at?: number; size?: number; align?: "left" | "center"; width?: number }> = ({
  title,
  sub,
  kicker,
  at = 0,
  size = 64,
  align = "left",
  width = 720,
}) => {
  const f = useCurrentFrame();
  const words = title.split(" ");
  const kick = useIn(at, 14);
  const subIn = useIn(at + 6 + words.length * 3, 18);
  return (
    <div style={{ width, textAlign: align, display: "flex", flexDirection: "column", gap: 18, alignItems: align === "center" ? "center" : "flex-start" }}>
      {kicker && (
        <div style={{ fontFamily: DISPLAY, fontSize: 22, letterSpacing: "0.22em", textTransform: "uppercase", color: C.primary, opacity: kick, transform: `translateY(${(1 - kick) * 10}px)` }}>
          {kicker}
        </div>
      )}
      <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: size, lineHeight: 1.05, letterSpacing: "-0.02em", color: C.text }}>
        {words.map((w, i) => {
          const p = interpolate(f, [at + 4 + i * 3, at + 22 + i * 3], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease });
          return (
            <span key={i} style={{ display: "inline-block", overflow: "hidden", verticalAlign: "bottom", marginRight: "0.25em" }}>
              <span style={{ display: "inline-block", transform: `translateY(${(1 - p) * 105}%)`, opacity: p }}>{w}</span>
            </span>
          );
        })}
      </div>
      {sub && <div style={{ fontFamily: BODY, fontSize: size * 0.4, color: C.textDim, opacity: subIn, transform: `translateY(${(1 - subIn) * 12}px)`, lineHeight: 1.4 }}>{sub}</div>}
    </div>
  );
};

export const Badge: React.FC<{ children: React.ReactNode; color?: string; style?: React.CSSProperties }> = ({ children, color = C.primary, style }) => (
  <div
    style={{
      display: "inline-flex",
      alignItems: "center",
      gap: 10,
      padding: "10px 18px",
      borderRadius: 999,
      background: "rgba(16,20,26,0.85)",
      border: `1px solid ${color}55`,
      color,
      fontFamily: DISPLAY,
      fontSize: 20,
      letterSpacing: "0.12em",
      textTransform: "uppercase",
      ...style,
    }}
  >
    <span style={{ width: 9, height: 9, borderRadius: 9, background: color, boxShadow: `0 0 12px ${color}` }} />
    {children}
  </div>
);

/**
 * Logo: an athlete figure with an offset cyan "shadow" duplicate (a vector recreation of the
 * app's mark, which is a remote image), plus the wordmark.
 */
export const Logo: React.FC<{ size?: number; reveal?: number }> = ({ size = 120, reveal = 1 }) => {
  const pose = poseAt(150);
  const b = pose.box!;
  const pad = 0.12;
  const vb = { x: (b[0] - pad * (b[2] - b[0])) * 360, y: (b[1] - pad * (b[3] - b[1])) * 640, w: (b[2] - b[0]) * (1 + 2 * pad) * 360, h: (b[3] - b[1]) * (1 + 2 * pad) * 640 };
  const side = Math.max(vb.w, vb.h);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: size * 0.28 }}>
      <div
        style={{
          width: size,
          height: size,
          borderRadius: size * 0.26,
          background: "linear-gradient(145deg,#1c2026,#0d1015)",
          border: "1px solid rgba(75,226,119,0.25)",
          boxShadow: "0 0 40px rgba(75,226,119,0.18)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transform: `scale(${0.85 + 0.15 * reveal})`,
          opacity: reveal,
        }}
      >
        <svg viewBox={`${vb.x + vb.w / 2 - side / 2} ${vb.y + vb.h / 2 - side / 2} ${side} ${side}`} width={size * 0.8} height={size * 0.8}>
          <Figure pose={pose} color={C.cyan} mode="silhouette" opacity={0.55} dx={side * 0.1} dy={side * 0.02} />
          <Figure pose={pose} color={C.primary} mode="silhouette" />
        </svg>
      </div>
      <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: size * 0.62, letterSpacing: "-0.03em", color: C.text, opacity: reveal, transform: `translateX(${(1 - reveal) * -20}px)` }}>
        Shadow<span style={{ color: C.primary }}>Athlete</span>
      </div>
    </div>
  );
};

export const Tagline: React.FC<{ size?: number; opacity?: number }> = ({ size = 40, opacity = 1 }) => (
  <div style={{ fontFamily: DISPLAY, fontWeight: 500, fontSize: size, color: C.textDim, opacity, letterSpacing: "-0.01em" }}>
    {PROJECT.tagline.replace("you.", "")}
    <span style={{ color: C.cyan }}>you.</span>
  </div>
);
