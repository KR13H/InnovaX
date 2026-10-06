// 42–52 s: the verified tennis pipeline and the stack, as found in the repository.

import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { Caption, ease, useIn } from "../components/ui";
import { CAPTIONS } from "../config";
import { BODY, C, DISPLAY } from "../theme";

const STAGES = [
  { title: "Video", tech: "OpenCV frames", icon: "video" },
  { title: "Player tracking", tech: "YOLOv8 + ByteTrack", icon: "box" },
  { title: "Pose estimation", tech: "MediaPipe · 33 landmarks", icon: "pose" },
  { title: "Action classification", tech: "Random Forest · scikit-learn", icon: "tree" },
  { title: "Performance insights", tech: "FastAPI → Next.js app", icon: "chart" },
];

const STACK = ["Next.js", "React", "Tailwind CSS", "FastAPI", "PostgreSQL", "YOLOv8", "ByteTrack", "MediaPipe", "scikit-learn", "OpenCV"];

const Icon: React.FC<{ kind: string; color: string }> = ({ kind, color }) => {
  const p = { fill: "none", stroke: color, strokeWidth: 2.4, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  return (
    <svg viewBox="0 0 48 48" width={56} height={56}>
      {kind === "video" && (
        <>
          <rect x="6" y="12" width="26" height="24" rx="4" {...p} />
          <path d="M32 20l10-6v20l-10-6" {...p} />
        </>
      )}
      {kind === "box" && (
        <>
          <rect x="10" y="8" width="28" height="32" rx="3" {...p} strokeDasharray="5 4" />
          <circle cx="24" cy="17" r="4" {...p} />
          <path d="M24 21v9M18 26h12M24 30l-5 7M24 30l5 7" {...p} />
        </>
      )}
      {kind === "pose" && (
        <>
          <circle cx="24" cy="9" r="4" {...p} />
          <path d="M24 13v14M14 18l10 3 10-3M24 27l-7 13M24 27l7 13" {...p} />
          {[14, 34, 17, 31].map((x, i) => (
            <circle key={i} cx={x} cy={i < 2 ? 18 : 40} r="2.2" fill={color} />
          ))}
        </>
      )}
      {kind === "tree" && (
        <>
          <circle cx="24" cy="10" r="4" {...p} />
          <circle cx="12" cy="26" r="4" {...p} />
          <circle cx="36" cy="26" r="4" {...p} />
          <circle cx="8" cy="40" r="3" {...p} />
          <circle cx="18" cy="40" r="3" {...p} />
          <path d="M21 13l-6 10M27 13l6 10M10 30l-1 7M14 30l3 7" {...p} />
        </>
      )}
      {kind === "chart" && (
        <>
          <path d="M8 40h32" {...p} />
          <path d="M10 32l9-9 7 6 12-14" {...p} />
          <circle cx="38" cy="15" r="2.5" fill={color} />
        </>
      )}
    </svg>
  );
};

export const Tech: React.FC = () => {
  const f = useCurrentFrame();
  const NODE_W = 290;
  const GAP = 52;
  const left = (1920 - (STAGES.length * NODE_W + (STAGES.length - 1) * GAP)) / 2;

  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 150, top: 110 }}>
        <Caption kicker="Tennis pipeline" title={CAPTIONS.tech.title} size={76} width={1200} at={2} />
      </div>

      {/* connectors with a travelling pulse */}
      {STAGES.slice(0, -1).map((_, i) => {
        const x1 = left + (i + 1) * NODE_W + i * GAP;
        const grow = interpolate(f, [26 + i * 22, 40 + i * 22], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease });
        const pulse = ((f - 60 - i * 8) % 40) / 40;
        return (
          <div key={i} style={{ position: "absolute", left: x1, top: 482, width: GAP, height: 3 }}>
            <div style={{ width: `${grow * 100}%`, height: 3, background: `linear-gradient(90deg, ${C.primary}, ${C.cyan})`, borderRadius: 3 }} />
            {f > 60 && <div style={{ position: "absolute", left: pulse * GAP - 5, top: -4, width: 11, height: 11, borderRadius: 11, background: "#fff", boxShadow: `0 0 14px ${C.cyan}` }} />}
          </div>
        );
      })}

      {STAGES.map((s, i) => {
        const p = interpolate(f, [16 + i * 22, 36 + i * 22], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease });
        const color = i % 2 ? C.cyan : C.primary;
        return (
          <div
            key={s.title}
            style={{
              position: "absolute",
              left: left + i * (NODE_W + GAP),
              top: 360,
              width: NODE_W,
              height: 250,
              borderRadius: 26,
              background: "rgba(28,32,38,0.9)",
              border: `1px solid ${color}44`,
              boxShadow: `0 0 40px ${color}14`,
              padding: 26,
              opacity: p,
              transform: `translateY(${(1 - p) * 30}px)`,
              display: "flex",
              flexDirection: "column",
              gap: 14,
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Icon kind={s.icon} color={color} />
              <span style={{ fontFamily: DISPLAY, fontSize: 20, color: C.muted }}>0{i + 1}</span>
            </div>
            <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 30, color: C.text, lineHeight: 1.1 }}>{s.title}</div>
            <div style={{ fontFamily: BODY, fontSize: 21, color: color }}>{s.tech}</div>
          </div>
        );
      })}

      {/* stack chips */}
      <div style={{ position: "absolute", left: 80, right: 80, top: 700, display: "flex", flexWrap: "wrap", gap: 12, justifyContent: "center" }}>
        {STACK.map((t, i) => {
          const p = interpolate(f, [140 + i * 4, 156 + i * 4], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease });
          return (
            <div key={t} style={{ fontFamily: DISPLAY, fontSize: 22, color: C.text, padding: "11px 19px", borderRadius: 999, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", opacity: p, transform: `scale(${0.9 + 0.1 * p})` }}>
              {t}
            </div>
          );
        })}
      </div>

      <div style={{ position: "absolute", left: 0, right: 0, top: 880, textAlign: "center", fontFamily: BODY, fontSize: 21, color: C.muted, opacity: useIn(190, 20) }}>
        Player tracking runs in the project&apos;s offline tennis analysis script; the in-app tennis endpoint uses MediaPipe + Random Forest.
      </div>
    </AbsoluteFill>
  );
};
