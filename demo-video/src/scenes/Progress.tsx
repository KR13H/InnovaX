// 30–42 s: implemented progress features, all real captures — charts per goal, the "then vs
// now" ghost overlay from Compare, and the "future you" projection + weekly shadow test.

import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { Phone } from "../components/Phone";
import { Caption, ease, useIn } from "../components/ui";
import { CAPTIONS } from "../config";
import { C } from "../theme";

const BEATS = [0, 120, 240];

export const Progress: React.FC = () => {
  const f = useCurrentFrame();
  const enter = useIn(0, 24);
  // Phone: charts first, then back up to the weekly test + "future you".
  const scroll = interpolate(f, [8, 100, 236, 280], [300, 1020, 1020, 150], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease });
  const compareIn = interpolate(f, [118, 142], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease });
  const compareOut = interpolate(f, [236, 256], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease });
  const beat = f >= BEATS[2] ? 2 : f >= BEATS[1] ? 1 : 0;

  return (
    <AbsoluteFill>
      {/* Captions, one per beat */}
      {CAPTIONS.progress.map((c, i) => {
        const o =
          interpolate(f, [BEATS[i], BEATS[i] + 12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) *
          (i < 2 ? interpolate(f, [BEATS[i + 1] - 10, BEATS[i + 1]], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) : 1);
        return (
          <AbsoluteFill key={c.title} style={{ justifyContent: "center", paddingLeft: 150, opacity: o }}>
            <Caption kicker={`Progress · ${i + 1}/3`} title={c.title} sub={c.sub} at={BEATS[i]} size={70} width={640} />
          </AbsoluteFill>
        );
      })}

      {/* Progress screen */}
      <div style={{ position: "absolute", left: 860, top: 70, opacity: enter, transform: `translateY(${(1 - enter) * 60}px) translateX(${-compareIn * (1 - compareOut) * 70}px)` }}>
        <Phone src="screens/progress-tennis.png" scroll={scroll} width={410}>
          {beat === 2 && (
            // highlight the weekly shadow test card
            <div
              style={{
                position: "absolute",
                left: 10,
                top: 404,
                width: 370,
                height: 206,
                borderRadius: 18,
                border: `2px solid ${C.cyan}`,
                boxShadow: `0 0 30px ${C.cyan}66`,
                opacity: interpolate(f, [282, 296], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
              }}
            />
          )}
        </Phone>
      </div>

      {/* Compare: the ghost overlay card */}
      <div
        style={{
          position: "absolute",
          left: 1320,
          top: 200,
          opacity: compareIn * compareOut,
          transform: `translateY(${(1 - compareIn) * 40}px) scale(${0.96 + compareIn * 0.04})`,
        }}
      >
        <Phone src="screens/compare.png" viewport={490} bezel={false} width={460} />
      </div>
    </AbsoluteFill>
  );
};
