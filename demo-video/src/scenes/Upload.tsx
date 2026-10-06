// 12–15 s: pick a clip on the real Upload screen (only its drop zone; the card below it is a
// placeholder until a file is chosen), then hand off to analysis.

import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { Phone } from "../components/Phone";
import { Tap } from "../components/Tap";
import { Caption, ease, useIn } from "../components/ui";
import { CAPTIONS } from "../config";
import { BODY, C, DISPLAY } from "../theme";

export const Upload: React.FC = () => {
  const f = useCurrentFrame();
  const enter = useIn(0, 20);
  const steps = [
    { label: "Uploading clip", at: 50 },
    { label: "Analyzing with the tennis pipeline", at: 64 },
  ];
  const lift = interpolate(f, [70, 90], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease });

  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ justifyContent: "center", paddingLeft: 150 }}>
        <Caption kicker="Tennis analysis" title={CAPTIONS.upload.title} sub={CAPTIONS.upload.sub} at={4} size={76} />
      </AbsoluteFill>

      <div style={{ position: "absolute", right: 200, top: 250, opacity: enter * (1 - lift * 0.6), transform: `translateY(${(1 - enter) * 50 - lift * 20}px) scale(${1 - lift * 0.04})` }}>
        <Phone src="screens/upload.png" cropTop={52} viewport={400} bezel={false} width={620}>
          <Tap x={206} y={374} at={38} />
        </Phone>
        <div style={{ marginTop: 28, display: "flex", flexDirection: "column", gap: 12 }}>
          {steps.map((s, i) => {
            const p = interpolate(f, [s.at, s.at + 12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease });
            const done = i === 0 && f > steps[1].at;
            return (
              <div key={s.label} style={{ display: "flex", alignItems: "center", gap: 14, opacity: p, transform: `translateX(${(1 - p) * 20}px)` }}>
                <div style={{ width: 26, height: 26, borderRadius: 26, border: `2px solid ${C.primary}`, background: done ? C.primary : "transparent", display: "flex", alignItems: "center", justifyContent: "center", color: C.bg, fontFamily: DISPLAY, fontSize: 16 }}>
                  {done ? "✓" : ""}
                </div>
                <span style={{ fontFamily: BODY, fontSize: 26, color: C.text }}>{s.label}</span>
              </div>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};
