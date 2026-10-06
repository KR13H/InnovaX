// 0–5 s: "Your next opponent is you." A glowing athlete (real pose output) moves with its shadow
// (the same athlete a few frames earlier), then the logo resolves.

import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { Figure } from "../components/Figure";
import { Logo, ease, useIn } from "../components/ui";
import { followView, poseAt } from "../pose";
import { BODY, C, DISPLAY } from "../theme";

const CLIP_START = 70; // a forehand → backhand stretch of the sample clip
const SHADOW_LAG = 7;

export const Hook: React.FC = () => {
  const f = useCurrentFrame();
  const clip = CLIP_START + f;
  const view = followView(clip, 300, 1, 14);

  const figureIn = useIn(0, 24);
  const figureOut = interpolate(f, [86, 108], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease });
  const shadowSep = interpolate(f, [8, 50], [0, 34], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease });

  const lines = [
    { text: "Your next", at: 10 },
    { text: "opponent", at: 20 },
    { text: "is you.", at: 32 },
  ];
  const textOut = interpolate(f, [84, 104], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease });
  const logo = useIn(100, 22);
  const tag = useIn(114, 20);

  return (
    <AbsoluteFill>
      {/* Athlete + shadow */}
      <AbsoluteFill style={{ opacity: figureIn * figureOut, transform: `scale(${1 + (1 - figureOut) * 0.08})` }}>
        <svg viewBox={`${view.x} ${view.y} ${view.w} ${view.h}`} style={{ position: "absolute", right: 140, top: 60, width: 960, height: 960 }}>
          <Figure pose={poseAt(clip - SHADOW_LAG)} color={C.cyan} mode="silhouette" opacity={0.35} glow={6} dx={shadowSep} />
          <Figure pose={poseAt(clip)} color={C.primary} mode="silhouette" glow={5} />
          <Figure pose={poseAt(clip)} color="#eafff0" mode="silhouette" opacity={0.25} />
        </svg>
      </AbsoluteFill>

      {/* Headline */}
      <AbsoluteFill style={{ justifyContent: "center", paddingLeft: 150, opacity: textOut }}>
        {lines.map((l) => {
          const p = interpolate(f, [l.at, l.at + 20], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease });
          const isYou = l.text === "is you.";
          return (
            <div key={l.text} style={{ overflow: "hidden", lineHeight: 1.02 }}>
              <div
                style={{
                  fontFamily: DISPLAY,
                  fontWeight: 700,
                  fontSize: 132,
                  letterSpacing: "-0.04em",
                  color: C.text,
                  transform: `translateY(${(1 - p) * 100}%)`,
                }}
              >
                {isYou ? (
                  <>
                    is <span style={{ color: C.cyan, textShadow: `0 0 40px ${C.cyan}66` }}>you.</span>
                  </>
                ) : (
                  l.text
                )}
              </div>
            </div>
          );
        })}
      </AbsoluteFill>

      {/* Logo */}
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", gap: 28, flexDirection: "column" }}>
        <Logo size={150} reveal={logo} />
        <div style={{ opacity: tag, transform: `translateY(${(1 - tag) * 10}px)` }}>
          <div style={{ fontFamily: BODY, fontSize: 30, color: C.textDim, letterSpacing: "0.02em" }}>Sports performance analysis from a phone video</div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
