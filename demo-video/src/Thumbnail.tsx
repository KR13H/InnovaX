// Thumbnail (1920×1080 still): headline + logo on the left, the athlete and its shadow on the
// right, with the real results screen.

import React from "react";
import { AbsoluteFill } from "remotion";
import { Figure } from "./components/Figure";
import { Phone } from "./components/Phone";
import { Background, Logo } from "./components/ui";
import { followView, poseAt } from "./pose";
import { BODY, C, DISPLAY } from "./theme";

const FRAME = 85; // mid-forehand: widest arm reach among classified swing frames

export const Thumbnail: React.FC = () => {
  const view = followView(FRAME, 290, 1, 6);
  return (
    <AbsoluteFill>
      <Background />
      <svg viewBox={`${view.x} ${view.y} ${view.w} ${view.h}`} style={{ position: "absolute", right: 300, top: 60, width: 980, height: 980 }}>
        <Figure pose={poseAt(FRAME - 9)} color={C.cyan} mode="silhouette" opacity={0.42} glow={7} dx={40} />
        <Figure pose={poseAt(FRAME)} color={C.primary} mode="silhouette" glow={6} />
        <Figure pose={poseAt(FRAME)} color="#eafff0" mode="silhouette" opacity={0.22} />
      </svg>

      <div style={{ position: "absolute", right: 90, top: 150, transform: "perspective(1600px) rotateY(-10deg) rotateZ(2deg)" }}>
        <Phone src="screens/session-tennis.png" scroll={560} width={360} />
      </div>

      <AbsoluteFill style={{ justifyContent: "center", paddingLeft: 120, gap: 34 }}>
        <Logo size={96} />
        <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 132, lineHeight: 0.98, letterSpacing: "-0.045em", color: C.text, maxWidth: 900 }}>
          Your next opponent is <span style={{ color: C.cyan, textShadow: `0 0 50px ${C.cyan}66` }}>you.</span>
        </div>
        <div style={{ display: "flex", gap: 14 }}>
          {["Pose tracking", "Action classification", "Progress"].map((t) => (
            <div key={t} style={{ fontFamily: BODY, fontSize: 28, fontWeight: 500, color: C.text, padding: "12px 22px", borderRadius: 999, background: "rgba(75,226,119,0.12)", border: "1px solid rgba(75,226,119,0.35)" }}>
              {t}
            </div>
          ))}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
