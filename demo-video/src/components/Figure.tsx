// Draws one pose from the pipeline output as SVG, in source-pixel coordinates.
// "line" = the analysis look (bones + joints); "silhouette" = a solid glowing body for titles.

import React from "react";
import { BONES, type PoseFrame, SRC } from "../pose";

type Props = {
  pose: PoseFrame;
  color: string;
  mode?: "line" | "silhouette";
  /** Scales stroke widths, e.g. when the viewBox is zoomed in on the player. */
  weight?: number;
  opacity?: number;
  joints?: boolean;
  glow?: number;
  dx?: number;
  dy?: number;
};

export const Figure: React.FC<Props> = ({ pose, color, mode = "line", weight = 1, opacity = 1, joints = true, glow = 0, dx = 0, dy = 0 }) => {
  const lm = pose.lm;
  if (!lm) return null;
  const P = (i: number) => [lm[i][0] * SRC.width + dx, lm[i][1] * SRC.height + dy] as const;
  const vis = (i: number) => lm[i][2] >= 0.35;

  const neck = [(P(11)[0] + P(12)[0]) / 2, (P(11)[1] + P(12)[1]) / 2];
  const hips = [(P(23)[0] + P(24)[0]) / 2, (P(23)[1] + P(24)[1]) / 2];
  // Scale from torso length: shoulder width collapses when the player is side-on.
  const torso = Math.hypot(neck[0] - hips[0], neck[1] - hips[1]);
  const headR = Math.max(4, torso * 0.2);
  const ear = vis(7) && vis(8) ? [(P(7)[0] + P(8)[0]) / 2, (P(7)[1] + P(8)[1]) / 2] : P(0);
  // Head sits above the neck, toward the ears.
  const head = [neck[0] + (ear[0] - neck[0]) * 0.9, neck[1] - Math.max(headR * 1.3, Math.abs(ear[1] - neck[1]) * 0.9)];
  const filterId = `glow-${color.replace("#", "")}-${Math.round(glow * 10)}`;

  if (mode === "silhouette") {
    const limb = torso * 0.2;
    const body = [P(11), P(12), P(24), P(23)].map((p) => p.join(",")).join(" ");
    return (
      <g opacity={opacity} filter={glow ? `url(#${filterId})` : undefined}>
        {glow > 0 && (
          <defs>
            <filter id={filterId} x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation={glow} result="b" />
              <feMerge>
                <feMergeNode in="b" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
        )}
        <polygon points={body} fill={color} stroke={color} strokeWidth={limb * 0.9} strokeLinejoin="round" />
        {BONES.filter(([a, b]) => !(a === 11 && b === 12) && !(a === 23 && b === 24) && !(a === 11 && b === 23) && !(a === 12 && b === 24)).map(([a, b]) => (
          <line key={`${a}-${b}`} x1={P(a)[0]} y1={P(a)[1]} x2={P(b)[0]} y2={P(b)[1]} stroke={color} strokeWidth={limb} strokeLinecap="round" />
        ))}
        <line x1={neck[0]} y1={neck[1]} x2={head[0]} y2={head[1]} stroke={color} strokeWidth={limb * 0.8} strokeLinecap="round" />
        <circle cx={head[0]} cy={head[1]} r={headR} fill={color} />
      </g>
    );
  }

  return (
    <g opacity={opacity} filter={glow ? `url(#${filterId})` : undefined}>
      {glow > 0 && (
        <defs>
          <filter id={filterId} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation={glow} result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
      )}
      {BONES.map(([a, b]) =>
        vis(a) && vis(b) ? (
          <line key={`${a}-${b}`} x1={P(a)[0]} y1={P(a)[1]} x2={P(b)[0]} y2={P(b)[1]} stroke={color} strokeWidth={2.4 * weight} strokeLinecap="round" />
        ) : null,
      )}
      <line x1={neck[0]} y1={neck[1]} x2={head[0]} y2={head[1]} stroke={color} strokeWidth={2 * weight} strokeLinecap="round" opacity={0.8} />
      <circle cx={head[0]} cy={head[1]} r={headR * 0.55} fill="none" stroke={color} strokeWidth={2 * weight} />
      {joints &&
        [11, 12, 13, 14, 15, 16, 23, 24, 25, 26, 27, 28].map((i) =>
          vis(i) ? <circle key={i} cx={P(i)[0]} cy={P(i)[1]} r={3.2 * weight} fill="#fff" stroke={color} strokeWidth={1.4 * weight} /> : null,
        )}
    </g>
  );
};
