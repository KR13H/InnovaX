// A phone showing a real app screenshot (captured at 390 css px wide, 3x), scrolled to `scroll`.
// Children are positioned in the app's css-pixel space, so taps line up with the screenshot.

import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { C } from "../theme";

export const APP_W = 390;
export const APP_H = 844;

type Props = {
  src: string;
  /** Rendered screen width in video pixels. */
  width?: number;
  /** Css px of the screenshot hidden above the screen's top edge. */
  cropTop?: number;
  scroll?: number;
  /** Visible screen height in app css px (shorter = a card-like crop). */
  viewport?: number;
  nav?: boolean;
  bezel?: boolean;
  style?: React.CSSProperties;
  children?: React.ReactNode;
};

export const Phone: React.FC<Props> = ({ src, width = 400, cropTop = 0, scroll = 0, viewport = APP_H, nav = false, bezel = true, style, children }) => {
  const s = width / APP_W;
  const h = viewport * s;
  const pad = bezel ? 12 : 0;
  return (
    <div
      style={{
        width: width + pad * 2,
        height: h + pad * 2,
        padding: pad,
        borderRadius: bezel ? 58 : 28,
        background: bezel ? "linear-gradient(160deg,#2b3038,#14171c 40%,#0d0f13)" : "transparent",
        boxShadow: "0 40px 120px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.06), 0 0 80px rgba(75,226,119,0.08)",
        ...style,
      }}
    >
      <div style={{ position: "relative", width, height: h, borderRadius: bezel ? 46 : 28, overflow: "hidden", background: C.surface }}>
        <Img src={staticFile(src)} style={{ position: "absolute", left: 0, top: -(cropTop + scroll) * s, width, height: "auto" }} />
        {nav && (
          // nav.png is the bottom 96 css px of a screen; only its last ~64 px are the nav bar.
          <div style={{ position: "absolute", left: 0, bottom: 0, width, height: 64 * s, overflow: "hidden" }}>
            <Img src={staticFile("screens/nav.png")} style={{ position: "absolute", left: 0, bottom: 0, width, height: "auto" }} />
          </div>
        )}
        <AbsoluteFill style={{ transform: `scale(${s})`, transformOrigin: "0 0", width: APP_W, height: viewport }}>
          <div style={{ position: "absolute", left: 0, top: -(cropTop + scroll), width: APP_W }}>{children}</div>
        </AbsoluteFill>
      </div>
    </div>
  );
};
