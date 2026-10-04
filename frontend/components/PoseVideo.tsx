"use client";

// Video player with live pose tracking: MediaPipe runs on each frame in the browser and the
// skeleton (lime, the "physical athlete" colour) is drawn on a canvas over the clip.

import { useCallback, useEffect, useRef, useState } from "react";
import { BONES, JOINTS, type NormalizedLandmark, getPoseLandmarker, jointAngle } from "@/lib/pose";

type Status = "loading" | "tracking" | "no-athlete" | "off" | "error";

const LIME = "#4be277";
const CYAN = "#00eefc";

const fmtTime = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

export default function PoseVideo({
  src,
  className = "",
  maxHeight = "62vh",
  autoPlay = false,
}: {
  src: string;
  className?: string;
  maxHeight?: string;
  autoPlay?: boolean;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef<number>(0);
  const lastTs = useRef(0);
  const [aspect, setAspect] = useState(9 / 16);
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [tracking, setTracking] = useState(true);
  const [status, setStatus] = useState<Status>("loading");
  const [angles, setAngles] = useState<{ elbow: number; knee: number } | null>(null);
  const trackingRef = useRef(tracking);
  trackingRef.current = tracking;

  const draw = useCallback((lm: NormalizedLandmark[] | undefined) => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video) return;
    const w = (canvas.width = canvas.clientWidth * devicePixelRatio);
    const h = (canvas.height = canvas.clientHeight * devicePixelRatio);
    const ctx = canvas.getContext("2d")!;
    ctx.clearRect(0, 0, w, h);
    if (!lm || !trackingRef.current) return;
    const p = (i: number) => [lm[i].x * w, lm[i].y * h] as const;
    const visible = (i: number) => (lm[i].visibility ?? 1) > 0.4;

    ctx.lineCap = "round";
    ctx.shadowColor = LIME;
    ctx.shadowBlur = 10 * devicePixelRatio;
    ctx.strokeStyle = LIME;
    ctx.lineWidth = 3 * devicePixelRatio;
    for (const [a, b] of BONES) {
      if (!visible(a) || !visible(b)) continue;
      ctx.beginPath();
      ctx.moveTo(...p(a));
      ctx.lineTo(...p(b));
      ctx.stroke();
    }
    ctx.shadowBlur = 0;
    for (const i of JOINTS) {
      if (!visible(i)) continue;
      const [x, y] = p(i);
      ctx.beginPath();
      ctx.fillStyle = i === 14 || i === 26 ? CYAN : "#ffffff";
      ctx.arc(x, y, (i === 0 ? 5 : 4) * devicePixelRatio, 0, Math.PI * 2);
      ctx.fill();
    }

    // Live joint angles for the hitting arm and drive leg (right side), labelled on the body.
    const ratio = video.videoWidth / (video.videoHeight || 1);
    const elbow = jointAngle(lm[12], lm[14], lm[16], ratio);
    const knee = jointAngle(lm[24], lm[26], lm[28], ratio);
    setAngles({ elbow, knee });
    ctx.font = `700 ${11 * devicePixelRatio}px "Space Grotesk", sans-serif`;
    for (const [i, val] of [
      [14, elbow],
      [26, knee],
    ] as const) {
      if (!visible(i)) continue;
      const [x, y] = p(i);
      const text = `${Math.round(val)}°`;
      const tw = ctx.measureText(text).width;
      const pad = 4 * devicePixelRatio;
      ctx.fillStyle = "rgba(10,14,20,0.85)";
      ctx.fillRect(x + 8 * devicePixelRatio, y - 9 * devicePixelRatio, tw + pad * 2, 18 * devicePixelRatio);
      ctx.fillStyle = CYAN;
      ctx.fillText(text, x + 8 * devicePixelRatio + pad, y + 4 * devicePixelRatio);
    }
  }, []);

  const detectOnce = useCallback(async () => {
    const video = videoRef.current;
    if (!video || video.readyState < 2 || !trackingRef.current) return draw(undefined);
    try {
      const landmarker = await getPoseLandmarker();
      // VIDEO mode needs strictly increasing timestamps.
      const ts = Math.max(performance.now(), lastTs.current + 1);
      lastTs.current = ts;
      const result = landmarker.detectForVideo(video, ts);
      const lm = result.landmarks[0];
      setStatus(lm ? "tracking" : "no-athlete");
      draw(lm);
    } catch {
      setStatus("error");
    }
  }, [draw]);

  // Per-frame loop while playing.
  useEffect(() => {
    if (!playing) return;
    let cancelled = false;
    const loop = async () => {
      if (cancelled) return;
      await detectOnce();
      frameRef.current = requestAnimationFrame(loop);
    };
    loop();
    return () => {
      cancelled = true;
      cancelAnimationFrame(frameRef.current);
    };
  }, [playing, detectOnce]);

  // Warm the model up front so tracking starts as soon as the clip plays.
  useEffect(() => {
    getPoseLandmarker().then(
      () => setStatus((s) => (s === "loading" ? "tracking" : s)),
      () => setStatus("error"),
    );
  }, []);

  useEffect(() => {
    if (!tracking) {
      setStatus("off");
      draw(undefined);
    } else {
      setStatus("tracking");
      detectOnce();
    }
  }, [tracking, draw, detectOnce]);

  function toggle() {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) v.play();
    else v.pause();
  }

  const chip =
    status === "loading"
      ? { dot: "bg-secondary animate-pulse", text: "Loading tracker…", cls: "text-secondary" }
      : status === "no-athlete"
        ? { dot: "bg-tertiary", text: "No athlete in frame", cls: "text-tertiary" }
        : status === "off"
          ? { dot: "bg-outline", text: "Tracking off", cls: "text-on-surface-variant" }
          : status === "error"
            ? { dot: "bg-error", text: "Tracker unavailable", cls: "text-error" }
            : { dot: "bg-primary animate-pulse", text: "Pose tracking • 33 nodes", cls: "text-primary" };

  return (
    <div className={`relative mx-auto rounded-xl overflow-hidden bg-black shadow-xl select-none ${className}`} style={{ aspectRatio: aspect, width: `min(100%, calc(${maxHeight} * ${aspect}))` }}>
      <video
        ref={videoRef}
        src={src}
        playsInline
        muted
        loop
        autoPlay={autoPlay}
        crossOrigin="anonymous"
        className="absolute inset-0 w-full h-full object-contain"
        onLoadedMetadata={(e) => {
          const v = e.currentTarget;
          if (v.videoWidth && v.videoHeight) setAspect(v.videoWidth / v.videoHeight);
          setDuration(v.duration || 0);
          // Show (and track) a real first frame instead of a black poster; seeking fires onSeeked.
          v.currentTime = Math.min(0.1, (v.duration || 1) / 2);
        }}
        onLoadedData={detectOnce}
        onSeeked={detectOnce}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onTimeUpdate={(e) => setTime(e.currentTarget.currentTime)}
        onClick={toggle}
      ></video>
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none"></canvas>

      {/* Status + tracking toggle */}
      <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between gap-2 pointer-events-none">
        <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-container-lowest/80 backdrop-blur-md">
          <span className={`w-1.5 h-1.5 rounded-full ${chip.dot}`}></span>
          <span className={`font-label-caps text-label-caps uppercase ${chip.cls}`}>{chip.text}</span>
        </span>
        <button
          type="button"
          onClick={() => setTracking((t) => !t)}
          className="pointer-events-auto w-9 h-9 rounded-full bg-surface-container-lowest/80 backdrop-blur-md flex items-center justify-center text-on-surface"
          aria-label={tracking ? "Hide pose tracking" : "Show pose tracking"}
        >
          <span className={`material-symbols-outlined text-[18px] ${tracking ? "text-primary" : ""}`}>accessibility_new</span>
        </button>
      </div>

      {/* Live angles */}
      {tracking && angles && status === "tracking" && (
        <div className="absolute left-2.5 top-12 flex flex-col gap-1 pointer-events-none">
          <span className="px-2 py-0.5 rounded-md bg-surface-container-lowest/80 backdrop-blur-md font-label-caps text-label-caps text-on-surface">
            ELBOW <span className="text-secondary-container">{Math.round(angles.elbow)}°</span>
          </span>
          <span className="px-2 py-0.5 rounded-md bg-surface-container-lowest/80 backdrop-blur-md font-label-caps text-label-caps text-on-surface">
            KNEE <span className="text-secondary-container">{Math.round(angles.knee)}°</span>
          </span>
        </div>
      )}

      {/* Big play button when paused */}
      {!playing && (
        <button type="button" onClick={toggle} aria-label="Play" className="absolute inset-0 m-auto w-16 h-16 rounded-full bg-surface-container-high/80 backdrop-blur-md flex items-center justify-center text-primary shadow-[0_0_24px_rgba(75,226,119,0.35)]">
          <span className="material-symbols-outlined text-[36px] ml-0.5" style={{ fontVariationSettings: "'FILL' 1" }}>play_arrow</span>
        </button>
      )}

      {/* Scrubber */}
      <div className="absolute bottom-0 inset-x-0 px-3 pb-2.5 pt-6 bg-gradient-to-t from-black/80 to-transparent flex items-center gap-2.5">
        <button type="button" onClick={toggle} className="text-on-surface" aria-label={playing ? "Pause" : "Play"}>
          <span className="material-symbols-outlined text-[22px]" style={{ fontVariationSettings: "'FILL' 1" }}>{playing ? "pause" : "play_arrow"}</span>
        </button>
        <input
          type="range"
          min={0}
          max={duration || 0}
          step={0.01}
          value={time}
          onChange={(e) => {
            const v = videoRef.current;
            if (v) v.currentTime = Number(e.target.value);
          }}
          className="flex-1 h-1 accent-primary cursor-pointer"
          aria-label="Seek"
        />
        <span className="font-label-caps text-label-caps text-on-surface tabular-nums">
          {fmtTime(time)} / {fmtTime(duration)}
        </span>
      </div>
    </div>
  );
}
