// A finger-tap indicator: a soft dot glides in, presses, and leaves a ripple.
// Coordinates are in app css px (use inside <Phone>), `at` is the frame of the press.

import React from "react";
import { Easing, interpolate, useCurrentFrame } from "remotion";

export const Tap: React.FC<{ x: number; y: number; at: number; from?: [number, number] }> = ({ x, y, at, from = [60, 120] }) => {
  const f = useCurrentFrame();
  const approach = interpolate(f, [at - 16, at], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });
  const press = interpolate(f, [at - 3, at, at + 5], [1, 0.8, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const fade = interpolate(f, [at - 16, at - 10, at + 16, at + 24], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const ripple = interpolate(f, [at, at + 18], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.quad) });
  const cx = x + from[0] * (1 - approach);
  const cy = y + from[1] * (1 - approach);
  return (
    <>
      {f >= at && (
        <div
          style={{
            position: "absolute",
            left: x - 40 * ripple,
            top: y - 40 * ripple,
            width: 80 * ripple,
            height: 80 * ripple,
            borderRadius: "50%",
            border: "2px solid rgba(255,255,255,0.8)",
            opacity: 1 - ripple,
          }}
        />
      )}
      <div
        style={{
          position: "absolute",
          left: cx - 17,
          top: cy - 17,
          width: 34,
          height: 34,
          borderRadius: "50%",
          background: "rgba(255,255,255,0.35)",
          border: "2px solid rgba(255,255,255,0.85)",
          boxShadow: "0 4px 18px rgba(0,0,0,0.5)",
          transform: `scale(${press})`,
          opacity: fade,
        }}
      />
    </>
  );
};
