// 24–30 s: the in-app results screen (real capture; the clip's footage is hidden, leaving the
// app's live pose overlay) next to the pipeline's JSON stats and its estimated swing events.

import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { Phone } from "../components/Phone";
import { Caption, ease, useIn } from "../components/ui";
import { CAPTIONS } from "../config";
import { OUTPUT } from "../pose";
import { ACTION_COLOR, ACTION_LABEL, BODY, C, DISPLAY } from "../theme";

const s = OUTPUT.stats;
const JSON_LINES: [string, string, string?][] = [
  ["{", ""],
  ['  "tracking_coverage_percent"', `${s.tracking_coverage_percent},`, C.cyan],
  ['  "pose_detected_frames"', `${s.pose_detected_frames},`],
  ['  "estimated_shot_counts"', `{ "backhand": ${s.estimated_shot_counts.backhand}, "forehand": ${s.estimated_shot_counts.forehand}, "serve": ${s.estimated_shot_counts.serve} },`, C.primary],
  ['  "pose_frame_counts"', `{ "backhand": ${s.pose_frame_counts.backhand}, "ready_position": ${s.pose_frame_counts.ready_position}, … },`],
  ['  "mean_joint_angles_degrees"', `{ "left_elbow": ${s.mean_joint_angles_degrees.left_elbow}, "right_knee": ${s.mean_joint_angles_degrees.right_knee}, … }`, C.amber],
  ["}", ""],
];

export const Results: React.FC = () => {
  const f = useCurrentFrame();
  const enter = useIn(0, 22);
  const scroll = interpolate(f, [10, 70, 110, 160], [0, 560, 560, 930], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease });
  const total = OUTPUT.frames.length / 30;

  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 170, top: 70, opacity: enter, transform: `translateY(${(1 - enter) * 50}px) perspective(1600px) rotateY(6deg)` }}>
        <Phone src="screens/session-tennis.png" scroll={scroll} width={410} />
      </div>

      <div style={{ position: "absolute", left: 760, top: 110, width: 1020 }}>
        <Caption kicker="In the app" title={CAPTIONS.results.title} sub={CAPTIONS.results.sub} size={64} width={980} at={4} />

        {/* JSON stats */}
        <div style={{ marginTop: 40, background: "#0d1117", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 22, overflow: "hidden", opacity: useIn(24, 18) }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "14px 22px", borderBottom: "1px solid rgba(255,255,255,0.06)", fontFamily: DISPLAY, fontSize: 18, color: C.muted }}>
            <span style={{ width: 12, height: 12, borderRadius: 12, background: "#ff5f57" }} />
            <span style={{ width: 12, height: 12, borderRadius: 12, background: "#febc2e" }} />
            <span style={{ width: 12, height: 12, borderRadius: 12, background: "#28c840" }} />
            <span style={{ marginLeft: 12 }}>{CAPTIONS.json.file}</span>
          </div>
          <div style={{ padding: "18px 24px", fontFamily: "Menlo, monospace", fontSize: 21, lineHeight: 1.65 }}>
            {JSON_LINES.map(([k, v, color], i) => {
              const p = interpolate(f, [30 + i * 7, 40 + i * 7], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
              return (
                <div key={i} style={{ opacity: p, whiteSpace: "pre" }}>
                  <span style={{ color: C.textDim }}>{k}</span>
                  {v && <span style={{ color: C.muted }}>: </span>}
                  <span style={{ color: color ?? C.text }}>{v}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Estimated swing events on the clip timeline */}
        <div style={{ marginTop: 26, opacity: useIn(90, 18) }}>
          <div style={{ fontFamily: DISPLAY, fontSize: 17, letterSpacing: "0.16em", textTransform: "uppercase", color: C.muted, marginBottom: 12 }}>
            Estimated swings · {s.estimated_shot_events.length} events
          </div>
          <div style={{ position: "relative", height: 44, borderRadius: 12, background: "rgba(255,255,255,0.04)" }}>
            {s.estimated_shot_events.map((e, i) => {
              const p = interpolate(f, [96 + i * 6, 110 + i * 6], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease });
              return (
                <div
                  key={i}
                  style={{
                    position: "absolute",
                    left: `${(e.start_seconds / total) * 100}%`,
                    width: `${((e.end_seconds - e.start_seconds) / total) * 100}%`,
                    top: 6,
                    bottom: 6,
                    borderRadius: 8,
                    background: ACTION_COLOR[e.type],
                    transform: `scaleX(${p})`,
                    transformOrigin: "left",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontFamily: BODY,
                    fontSize: 15,
                    fontWeight: 600,
                    color: C.bg,
                  }}
                >
                  {ACTION_LABEL[e.type]}
                </div>
              );
            })}
          </div>
          <div style={{ fontFamily: BODY, fontSize: 17, color: C.muted, marginTop: 10 }}>Grouped from per-frame labels: swing estimates, not ball contacts.</div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
