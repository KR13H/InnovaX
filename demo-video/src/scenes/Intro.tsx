// 5–12 s: the real app. Home dashboard → Train → guided workout, with a tap on "Start session".

import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { Phone } from "../components/Phone";
import { Tap } from "../components/Tap";
import { Caption, ease, useIn } from "../components/ui";
import { CAPTIONS } from "../config";
import { BODY, C } from "../theme";

const HOME_CROP = 44; // the home header's logo is a remote image that didn't load in capture

export const Intro: React.FC = () => {
  const f = useCurrentFrame();
  const enter = useIn(0, 26);
  const homeScroll = interpolate(f, [16, 96], [0, 220], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease });
  const toTrain = interpolate(f, [96, 104], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const toWorkout = interpolate(f, [166, 174], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const tilt = interpolate(f, [0, 210], [-9, -3]);

  const screens = [
    { key: "home", o: 1 - toTrain, el: <Phone src="screens/home.png" cropTop={HOME_CROP} scroll={homeScroll} nav width={410} /> },
    {
      key: "train",
      o: toTrain * (1 - toWorkout),
      el: (
        <Phone src="screens/train.png" width={410}>
          <Tap x={161} y={475} at={150} />
        </Phone>
      ),
    },
    { key: "workout", o: toWorkout, el: <Phone src="screens/workout-set.png" width={410} /> },
  ];

  const labels = ["Home dashboard", "Training plan", "Guided workout"];
  const active = toWorkout > 0.5 ? 2 : toTrain > 0.5 ? 1 : 0;

  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ justifyContent: "center", paddingLeft: 150 }}>
        <Caption kicker="Meet ShadowAthlete" title={CAPTIONS.intro.title} sub={CAPTIONS.intro.sub} at={8} size={76} width={760} />
        <div style={{ display: "flex", gap: 12, marginTop: 44 }}>
          {labels.map((l, i) => (
            <div
              key={l}
              style={{
                fontFamily: BODY,
                fontSize: 20,
                padding: "8px 16px",
                borderRadius: 999,
                color: i === active ? C.bg : C.textDim,
                background: i === active ? C.primary : "rgba(255,255,255,0.05)",
                transition: "none",
                opacity: useInStatic(f, 40 + i * 6),
              }}
            >
              {l}
            </div>
          ))}
        </div>
      </AbsoluteFill>

      <div
        style={{
          position: "absolute",
          right: 230,
          top: 70,
          perspective: 1600,
          opacity: enter,
          transform: `translateY(${(1 - enter) * 80}px)`,
        }}
      >
        <div style={{ position: "relative", width: 434, height: 912, transform: `rotateY(${tilt}deg) rotateX(2deg)`, transformStyle: "preserve-3d" }}>
          {screens.map((s) => (
            <div key={s.key} style={{ position: "absolute", inset: 0, opacity: s.o }}>
              {s.el}
            </div>
          ))}
        </div>
      </div>
    </AbsoluteFill>
  );
};

function useInStatic(f: number, start: number) {
  return interpolate(f, [start, start + 14], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
}
