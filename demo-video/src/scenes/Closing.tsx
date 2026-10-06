// Last scene: logo and tagline over a faint athlete and its shadow.

import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { Figure } from "../components/Figure";
import { Logo, Tagline, ease, useIn } from "../components/ui";
import { followView, poseAt } from "../pose";
import { C } from "../theme";

export const Closing: React.FC = () => {
  const f = useCurrentFrame();
  const logo = useIn(4, 24);
  const tag = useIn(22, 20);
  const clip = 150 + f;
  const view = followView(clip, 300, 1, 14);
  const ghost = interpolate(f, [0, 40], [0, 0.14], { extrapolateRight: "clamp", easing: ease });

  return (
    <AbsoluteFill>
      {/* faint athlete + shadow in the background */}
      <svg viewBox={`${view.x} ${view.y} ${view.w} ${view.h}`} style={{ position: "absolute", right: -60, top: 80, width: 920, height: 920, opacity: ghost }}>
        <Figure pose={poseAt(clip - 7)} color={C.cyan} mode="silhouette" opacity={0.6} glow={5} dx={30} />
        <Figure pose={poseAt(clip)} color={C.primary} mode="silhouette" glow={4} />
      </svg>

      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", gap: 34 }}>
        <Logo size={150} reveal={logo} />
        <div style={{ opacity: tag, transform: `translateY(${(1 - tag) * 12}px)` }}>
          <Tagline size={64} />
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
