// 15–24 s: frame-by-frame output of the tennis pipeline on a sample clip — YOLOv8 + ByteTrack
// boxes, MediaPipe landmarks, Random Forest class probabilities, joint angles and the action
// timeline. Everything drawn here is read from src/data/tennis-output.json; the footage itself
// is not shown.

import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Figure } from "../components/Figure";
import { Badge, Caption, useIn } from "../components/ui";
import { CAPTIONS } from "../config";
import { FRAMES, OUTPUT, SRC, followView, frameAt, poseAt } from "../pose";
import { ACTION_COLOR, ACTION_LABEL, BODY, C, DISPLAY } from "../theme";

const CLIP_START = 12;
const CLASSES = ["forehand", "backhand", "ready_position", "serve"];
const ANGLES: [string, string, number][] = [
  ["right_elbow", "Right elbow", 14],
  ["left_elbow", "Left elbow", 13],
  ["right_knee", "Right knee", 26],
  ["left_knee", "Left knee", 25],
];

const Panel: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
  <div style={{ background: "rgba(28,32,38,0.86)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 24, padding: 26, ...style }}>{children}</div>
);

const Label: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div style={{ fontFamily: DISPLAY, fontSize: 17, letterSpacing: "0.16em", textTransform: "uppercase", color: C.muted, marginBottom: 14 }}>{children}</div>
);

export const Model: React.FC = () => {
  const f = useCurrentFrame();
  const clip = Math.min(FRAMES.length - 1, CLIP_START + f);
  const fr = frameAt(clip);
  const pose = poseAt(clip);
  const view = followView(clip, 380, 520 / 700, 8);
  const enter = useIn(0, 22);
  const right = useIn(10, 22);
  const time = (clip / SRC.fps).toFixed(1);

  // Stage pills light up in pipeline order.
  const stages = [
    { name: "YOLOv8 + ByteTrack", on: f > 6 },
    { name: "MediaPipe Pose", on: f > 18 },
    { name: "Random Forest", on: f > 30 },
  ];

  return (
    <AbsoluteFill>
      {/* Tracking canvas: zoomed, following the tracked player */}
      <div style={{ position: "absolute", left: 120, top: 92, width: 520, height: 700, opacity: enter, transform: `translateY(${(1 - enter) * 30}px)` }}>
        <div style={{ position: "relative", width: 520, height: 700, borderRadius: 28, overflow: "hidden", background: "radial-gradient(circle at 50% 40%, #141a22, #0b0e13)", border: "1px solid rgba(255,255,255,0.07)" }}>
          <svg viewBox={`${view.x} ${view.y} ${view.w} ${view.h}`} preserveAspectRatio="xMidYMid slice" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
            <defs>
              <pattern id="g" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M20 0H0V20" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="0.6" />
              </pattern>
            </defs>
            <rect x={0} y={0} width={SRC.width} height={SRC.height} fill="url(#g)" />
            {fr.others.map((b, i) => (
              <rect key={i} x={b[0] * SRC.width} y={b[1] * SRC.height} width={(b[2] - b[0]) * SRC.width} height={(b[3] - b[1]) * SRC.height} fill="none" stroke="rgba(223,226,235,0.35)" strokeDasharray="4 4" strokeWidth={1} rx={3} />
            ))}
            {fr.box && (
              <g>
                <rect x={fr.box[0] * SRC.width} y={fr.box[1] * SRC.height} width={(fr.box[2] - fr.box[0]) * SRC.width} height={(fr.box[3] - fr.box[1]) * SRC.height} fill="none" stroke={C.cyan} strokeWidth={1.6} rx={4} />
                <rect x={fr.box[0] * SRC.width} y={fr.box[1] * SRC.height - 15} width={82} height={14} rx={3} fill={C.cyan} />
                <text x={fr.box[0] * SRC.width + 5} y={fr.box[1] * SRC.height - 4.5} fontSize={9.5} fontFamily={DISPLAY} fontWeight={700} fill={C.bg}>
                  ID {OUTPUT.stats.target_track_id} · person
                </text>
              </g>
            )}
            <Figure pose={pose} color={C.primary} weight={0.9} glow={1.5} />
            {/* live angle callouts at two joints */}
            {pose.lm &&
              ANGLES.slice(0, 1)
                .concat([ANGLES[3]])
                .map(([key, , idx]) => {
                  const v = pose.angles[key];
                  if (v == null) return null;
                  const x = pose.lm![idx][0] * SRC.width;
                  const y = pose.lm![idx][1] * SRC.height;
                  return (
                    <g key={key}>
                      <rect x={x + 6} y={y - 9} width={30} height={13} rx={3} fill="rgba(10,14,20,0.85)" />
                      <text x={x + 9} y={y + 0.8} fontSize={9} fontFamily={DISPLAY} fill={C.text}>
                        {Math.round(v)}°
                      </text>
                    </g>
                  );
                })}
          </svg>
          <div style={{ position: "absolute", left: 18, top: 18, display: "flex", flexDirection: "column", gap: 8 }}>
            {stages.map((s) => (
              <div key={s.name} style={{ fontFamily: DISPLAY, fontSize: 15, letterSpacing: "0.1em", textTransform: "uppercase", padding: "6px 12px", borderRadius: 999, background: "rgba(10,14,20,0.8)", color: s.on ? C.primary : C.muted, border: `1px solid ${s.on ? C.primary + "66" : "transparent"}` }}>
                {s.on ? "● " : "○ "}
                {s.name}
              </div>
            ))}
          </div>
          <div style={{ position: "absolute", right: 18, bottom: 16, fontFamily: DISPLAY, fontSize: 16, color: C.textDim, background: "rgba(10,14,20,0.8)", padding: "6px 12px", borderRadius: 10 }}>
            frame {clip + 1}/{FRAMES.length} · {time}s
          </div>
        </div>
      </div>

      {/* Right column: caption + live readouts */}
      <div style={{ position: "absolute", left: 720, top: 92, width: 1080, opacity: right, transform: `translateX(${(1 - right) * 30}px)` }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
          <Caption title={CAPTIONS.model.title} sub={CAPTIONS.model.sub} size={58} width={1000} at={2} />
          <Badge color={C.amber} style={{ alignSelf: "flex-start", whiteSpace: "nowrap" }}>
            {CAPTIONS.model.badge}
          </Badge>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 22, marginTop: 28 }}>
          <Panel>
            <Label>Action · Random Forest</Label>
            <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 52, color: ACTION_COLOR[fr.label] ?? C.text, lineHeight: 1 }}>{ACTION_LABEL[fr.label] ?? fr.label}</div>
            <div style={{ fontFamily: BODY, fontSize: 18, color: C.muted, margin: "8px 0 18px" }}>{fr.label === "unknown" ? "Below the 60% confidence threshold" : `Confidence ${Math.round((fr.conf ?? 0) * 100)}%`}</div>
            {CLASSES.map((c) => {
              const p = fr.probs?.[c] ?? 0;
              return (
                <div key={c} style={{ display: "grid", gridTemplateColumns: "150px 1fr 54px", alignItems: "center", gap: 12, marginBottom: 9 }}>
                  <span style={{ fontFamily: BODY, fontSize: 18, color: C.textDim }}>{ACTION_LABEL[c]}</span>
                  <div style={{ height: 10, borderRadius: 10, background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
                    <div style={{ width: `${p * 100}%`, height: "100%", borderRadius: 10, background: ACTION_COLOR[c] }} />
                  </div>
                  <span style={{ fontFamily: DISPLAY, fontSize: 18, color: C.text, textAlign: "right" }}>{Math.round(p * 100)}%</span>
                </div>
              );
            })}
          </Panel>
          <Panel>
            <Label>Joint angles · MediaPipe</Label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              {ANGLES.map(([key, label]) => {
                const v = pose.angles[key];
                return (
                  <div key={key} style={{ background: "rgba(255,255,255,0.03)", borderRadius: 16, padding: "14px 16px" }}>
                    <div style={{ fontFamily: BODY, fontSize: 17, color: C.muted }}>{label}</div>
                    <div style={{ fontFamily: DISPLAY, fontSize: 42, fontWeight: 600, color: C.text }}>{v == null ? "—" : `${Math.round(v)}°`}</div>
                    <div style={{ height: 4, borderRadius: 4, background: "rgba(255,255,255,0.06)", marginTop: 6 }}>
                      <div style={{ width: `${((v ?? 0) / 180) * 100}%`, height: 4, borderRadius: 4, background: C.cyan }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </Panel>
        </div>
      </div>

      {/* Action timeline across the whole clip, revealed up to the playhead */}
      <Timeline clip={clip} enter={useIn(20, 20)} />
    </AbsoluteFill>
  );
};

const Timeline: React.FC<{ clip: number; enter: number }> = ({ clip, enter }) => {
  const W = 1680;
  const n = FRAMES.length;
  const segs: { label: string; from: number; to: number }[] = [];
  FRAMES.forEach((fr, i) => {
    const last = segs[segs.length - 1];
    if (last && last.label === fr.label) last.to = i;
    else segs.push({ label: fr.label, from: i, to: i });
  });
  return (
    <div style={{ position: "absolute", left: 120, top: 836, width: W, opacity: enter }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14 }}>
        <div style={{ fontFamily: DISPLAY, fontSize: 17, letterSpacing: "0.16em", textTransform: "uppercase", color: C.muted }}>Action timeline · per frame</div>
        <div style={{ display: "flex", gap: 22 }}>
          {["forehand", "backhand", "ready_position", "unknown"].map((l) => (
            <span key={l} style={{ display: "flex", alignItems: "center", gap: 8, fontFamily: BODY, fontSize: 17, color: C.textDim }}>
              <span style={{ width: 14, height: 14, borderRadius: 4, background: ACTION_COLOR[l] }} />
              {ACTION_LABEL[l]}
            </span>
          ))}
        </div>
      </div>
      <div style={{ position: "relative", height: 40, borderRadius: 12, background: "rgba(255,255,255,0.04)", overflow: "hidden" }}>
        {segs.map((s) => {
          const shown = Math.min(s.to, clip) - s.from + 1;
          if (shown <= 0) return null;
          return <div key={s.from} style={{ position: "absolute", left: (s.from / n) * W, width: Math.max(1, (shown / n) * W - 2), top: 0, bottom: 0, background: ACTION_COLOR[s.label], borderRadius: 3 }} />;
        })}
        <div style={{ position: "absolute", left: (clip / n) * W, top: -4, bottom: -4, width: 3, background: "#fff", boxShadow: "0 0 12px #fff" }} />
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8, fontFamily: DISPLAY, fontSize: 15, color: C.muted }}>
        {Array.from({ length: 11 }, (_, s) => (
          <span key={s}>{s}s</span>
        ))}
      </div>
    </div>
  );
};

