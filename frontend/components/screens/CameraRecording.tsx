"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { DRILL_LABEL, type Sport, sportFromQuery, stageClip } from "@/lib/clip";

const DELAY_ON = "timer-btn font-label-caps text-label-caps px-2.5 py-1 rounded-lg bg-primary text-on-primary font-bold transition-colors";
const DELAY_OFF = "timer-btn font-label-caps text-label-caps px-2.5 py-1 rounded-lg text-on-surface-variant hover:text-on-surface transition-colors";
const LENSES = ["0.5x", "1x", "2x"];
const MAX_TENTHS = 300; // 30 s cap

function formatTenths(t: number) {
  const secs = t / 10;
  return `${String(Math.floor(secs / 60)).padStart(2, "0")}:${String(Math.floor(secs % 60)).padStart(2, "0")}.${t % 10}`;
}

// Generated from design/stitch/camera_recording_shadowathlete/code.html by scripts/stitch-to-jsx.mjs.
export default function CameraRecording() {
  const router = useRouter();
  const [sport, setSport] = useState<Sport>("tennis");
  const [delay, setDelay] = useState<number | null>(null); // null = Stitch's initial look (3s highlighted)
  const [lens, setLens] = useState(1);
  const [torch, setTorch] = useState(false);
  const [facing, setFacing] = useState<"environment" | "user">("environment");
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [phase, setPhase] = useState<"idle" | "countdown" | "recording">("idle");
  const [countdown, setCountdown] = useState(0);
  const [tenths, setTenths] = useState(0);
  const [queued, setQueued] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const nativeInput = useRef<HTMLInputElement>(null);
  // Browsers only allow in-page camera access on HTTPS (or localhost). Over plain HTTP on a phone
  // we hand off to the phone's own camera app via <input capture> instead.
  const [nativeOnly, setNativeOnly] = useState(false);
  const recorder = useRef<MediaRecorder | null>(null);
  const chunks = useRef<Blob[]>([]);
  const effectiveDelay = delay ?? 3;

  useEffect(() => {
    setSport(sportFromQuery());
    setNativeOnly(!window.isSecureContext || !navigator.mediaDevices?.getUserMedia);
  }, []);

  // Live camera preview when available; without it the Stitch still image stays as the backdrop.
  useEffect(() => {
    let active: MediaStream | null = null;
    let cancelled = false;
    navigator.mediaDevices
      ?.getUserMedia({ video: { facingMode: facing, width: { ideal: 1920 }, height: { ideal: 1080 } }, audio: true })
      .then((s) => {
        if (cancelled) return s.getTracks().forEach((t) => t.stop());
        active = s;
        setStream(s);
      })
      .catch(() => setStream(null));
    return () => {
      cancelled = true;
      active?.getTracks().forEach((t) => t.stop());
    };
  }, [facing]);

  useEffect(() => {
    if (videoRef.current && stream) videoRef.current.srcObject = stream;
  }, [stream]);

  // Countdown before recording starts.
  useEffect(() => {
    if (phase !== "countdown") return;
    if (countdown <= 0) return startRecording();
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, countdown]);

  // Elapsed timer while recording; stops itself at the 30 s cap.
  useEffect(() => {
    if (phase !== "recording") return;
    if (tenths >= MAX_TENTHS) return stopRecording();
    const t = setTimeout(() => setTenths((n) => n + 1), 100);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, tenths]);

  function startRecording() {
    setTenths(0);
    setPhase("recording");
    if (!stream || typeof MediaRecorder === "undefined") return;
    chunks.current = [];
    const rec = new MediaRecorder(stream);
    rec.ondataavailable = (ev) => ev.data.size && chunks.current.push(ev.data);
    rec.onstop = () => {
      const blob = new Blob(chunks.current, { type: rec.mimeType || "video/webm" });
      stageClip(blob, sport, `${sport}-capture.${(rec.mimeType || "").includes("mp4") ? "mp4" : "webm"}`);
      router.push(`/capture/review?sport=${sport}`);
    };
    rec.start();
    recorder.current = rec;
  }

  function stopRecording() {
    setPhase("idle");
    if (recorder.current && recorder.current.state !== "inactive") {
      recorder.current.stop(); // onstop navigates to review
    } else {
      router.push(`/capture/review?sport=${sport}`); // no camera: continue with the demo clip
    }
    setTenths(0);
  }

  function toggleRecording() {
    if (nativeOnly) return nativeInput.current?.click();
    if (phase === "idle") {
      setCountdown(effectiveDelay);
      setPhase(effectiveDelay > 0 ? "countdown" : "recording");
      if (effectiveDelay === 0) startRecording();
    } else if (phase === "countdown") {
      setPhase("idle");
    } else {
      stopRecording();
    }
  }

  function toggleTorch() {
    const next = !torch;
    setTorch(next);
    const track = stream?.getVideoTracks()[0];
    // Torch is a non-standard constraint (Chrome on Android); ignore where unsupported.
    track?.applyConstraints({ advanced: [{ torch: next } as MediaTrackConstraintSet] }).catch(() => {});
  }

  function onNativeCapture(ev: React.ChangeEvent<HTMLInputElement>) {
    const file = ev.target.files?.[0];
    if (!file) return;
    stageClip(file, sport, file.name || `${sport}-capture.mp4`);
    router.push(`/capture/review?sport=${sport}`);
  }

  function onGalleryPick(ev: React.ChangeEvent<HTMLInputElement>) {
    const file = ev.target.files?.[0];
    if (!file) return;
    setQueued(true);
    stageClip(file, sport);
    router.push(`/capture/review?sport=${sport}`);
  }

  const live = phase === "recording";
  const timerText = nativeOnly ? "TAP ●" : queued ? "QUEUED" : phase === "countdown" ? `T-${countdown}` : formatTenths(tenths);

  return (
    <div className="bg-surface text-on-surface font-body-md text-body-md min-h-screen flex flex-col antialiased selection:bg-primary selection:text-on-primary">
      <header className="fixed top-0 inset-x-0 z-50 bg-surface/85 backdrop-blur-xl shadow-[0_1px_12px_rgba(0,0,0,0.5)] pt-safe">
        <div className="h-16 px-space-xs flex items-center justify-between">
          <div className="flex items-center gap-space-xs">
            <button aria-label="Go back" className="min-w-[44px] min-h-[44px] w-11 h-11 flex items-center justify-center text-on-surface hover:text-primary transition-colors" onClick={() => router.back()}>
              <span className="material-symbols-outlined text-[24px]">
                arrow_back
              </span>
            </button>
            <div className="flex items-center gap-space-xs">
              <img alt="Athletic silhouette icon with a subtle glowing cyan/lime duplicate shadow offset mark, symbolizing 'ShadowAthlete' and 'Your only opponent is you'. Brand logo" className="h-8 w-auto object-contain" src="https://lh3.googleusercontent.com/aida/AEtjO1U3su2IAJUfImc-QDFIgi5gzTYlDbkzgOVUovo_BNyYGtYNa9qhX4P-2oyefwHVQLhZ1Ab4ChydkqNbQYJ6oFFxL_5J_Qddc6EFgbqZ0J_0WRGiZMLAdr9Zbyj22BuHGThZeOIqyijB8g8KkiHaFQvfwq9-n-bK31wtBSZzAKwsfXkmsWzUb-vNdXU1acb3RA2HpoEFk8GGPHAJO2_JBzWeKHcIe9Wj_ZNrU6FINegMlz-Os5bYSEFdNK0" />
              <h1 className="font-headline-md text-headline-md font-semibold text-on-surface tracking-tight truncate max-w-[190px]">
                Live Capture
              </h1>
            </div>
          </div>
          <div className="flex items-center pr-space-sm">
            <img alt="Profile" className="w-8 h-8 rounded-full object-cover" src="https://lh3.googleusercontent.com/aida/AEtjO1VMnOn0JU8o67qYlYqYCfMg1WkAfuvSKYr7KKY53q6BP96YUKVar9XDhOk_G0q9oEEjtyqPTnjPz-jEJrc0WYt38c3cNqYZcfCBRJw4q5MRzBkPerclP4uhy8_16kr0ms5etlkMLS_PsBNC0_ErIoeYXxd2zuxLTVC_llRYg3rM1224q-gsYbE7WRhzle6ndzpYuYW6zR9J2qVASfJ92oWz4LbzfGQXXuIcMd1SHheY-ciDcBNW3LLRji8" />
          </div>
        </div>
      </header>
      <main className="flex-1 flex flex-col relative w-full pt-16 pb-safe bg-surface">
        <div className="flex flex-col w-full relative select-none">
          {/* CAMERA VIEWPORT STAGE */}
          <div className="relative w-full aspect-[9/16] max-h-[720px] bg-surface-container-lowest overflow-hidden flex flex-col justify-between p-space-sm shadow-2xl">
            {/* Camera Sensor Background Simulation */}
            <div className="absolute inset-0 bg-gradient-to-b from-surface-container-lowest/80 via-transparent to-surface-container-lowest/90 z-0 pointer-events-none"></div>
            <div className={`absolute inset-0 bg-cover bg-center opacity-40 scale-105 pointer-events-none mix-blend-luminosity ${stream ? "hidden" : ""} ${facing === "user" ? "-scale-x-100" : ""}`} data-alt="Dark dramatic indoor hardcourt tennis training facility illuminated with soft focused cinematic floor spotlights. In the background a net and court baseline are visible under high-contrast moody lighting with electric lime reflections on the acrylic court floor. Modern cybernetic sports training telemetry atmosphere with pitch dark periphery." style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDJ3DY34spe0F6MDOPtgX4Y2ADCUmGQB1uwWCK7B1YQq9riBi_XiyDnxWi1e51hpaRolMV7SPDPStkKs4_Vo5ia6aq41ll00a95N2Ys-COZ-t7KPBBRM4Bc3YBc8feM-Dn3jTjpjRpghsByEbjz58wdmqvb-7v1a3JlRIZEShQJ147TRe4Sqm4qZk0avSUNTMLMIr_tk2qd1InVv7CFHHSu4Q2Hphyrm6GqeG4d-OlnZWS5CQZvH6aa')" }}></div>
            {stream ? (
              <video ref={videoRef} autoPlay muted playsInline className={`absolute inset-0 w-full h-full object-cover opacity-70 pointer-events-none ${facing === "user" ? "-scale-x-100" : ""}`} style={{ transform: `scale(${[1, 1, 1.6][lens]})` }}></video>
            ) : null}
            {/* Telemetry Scanning Grid Overlay */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none z-10 opacity-30" fill="none" preserveAspectRatio="none" viewBox="0 0 360 640">
              <defs>
                <pattern height="40" id="cam-grid" patternUnits="userSpaceOnUse" width="40">
                  <path className="text-outline-variant" d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeDasharray="2 4" strokeWidth="0.5"></path>
                </pattern>
              </defs>
              <rect fill="url(#cam-grid)" height="100%" width="100%"></rect>
              {/* Court Horizon & Baseline Reference Vectors */}
              <line className="text-secondary" opacity="0.4" stroke="currentColor" strokeDasharray="4 4" strokeWidth="1" x1="20" x2="340" y1="410" y2="410"></line>
              <line className="text-outline" opacity="0.3" stroke="currentColor" strokeDasharray="2 6" strokeWidth="0.5" x1="180" x2="180" y1="20" y2="620"></line>
              {/* Alignment Reticle Crosshairs */}
              <circle className="text-secondary-fixed" cx="180" cy="300" fill="currentColor" opacity="0.8" r="4"></circle>
              <circle className="text-secondary-fixed" cx="180" cy="300" opacity="0.4" r="14" stroke="currentColor" strokeWidth="0.75"></circle>
            </svg>
            {/* KINETIC SHADOW ATHLETE FRAMING SILHOUETTE (Cyan Ghost Mesh) */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10 p-space-md">
              <svg className="w-full h-full max-h-[520px] text-secondary-fixed" fill="none" viewBox="0 0 300 520" xmlns="http://www.w3.org/2000/svg">
                {/* Digital Twin Biomechanical Wireframe Silhouette */}
                <g className="opacity-75" stroke="currentColor" strokeDasharray="4 3" strokeWidth="1.5">
                  {/* Head / Neural tracking node */}
                  <circle className="text-secondary" cx="150" cy="72" r="24" stroke="currentColor" strokeDasharray="none" strokeWidth="1.75"></circle>
                  <circle className="text-primary animate-pulse" cx="150" cy="72" fill="currentColor" r="3"></circle>
                  {/* Spine & Torso Kinetic Core */}
                  <line stroke="currentColor" strokeWidth="1.5" x1="150" x2="150" y1="96" y2="230"></line>
                  <line stroke="currentColor" strokeWidth="1.5" x1="110" x2="190" y1="130" y2="130"></line>
                  {/* Torso Polygon Matrix */}
                  <polygon fill="currentColor" fillOpacity="0.04" points="110,130 190,130 175,230 125,230" stroke="currentColor" strokeDasharray="3 3" strokeWidth="1"></polygon>
                  {/* Right Forehand Kinetic Extension Arm */}
                  <line stroke="currentColor" strokeWidth="1.5" x1="190" x2="228" y1="130" y2="185"></line>
                  <line stroke="currentColor" strokeWidth="1.5" x1="228" x2="248" y1="185" y2="245"></line>
                  {/* Racket Impact Target Envelope */}
                  <ellipse className="text-primary" cx="260" cy="275" rx="22" ry="32" stroke="currentColor" strokeDasharray="2 3" strokeWidth="1.2" transform="rotate(-25 260 275)"></ellipse>
                  <circle className="text-primary" cx="260" cy="275" fill="currentColor" r="4"></circle>
                  {/* Left Balance Arm */}
                  <line stroke="currentColor" strokeWidth="1.5" x1="110" x2="78" y1="130" y2="180"></line>
                  <line stroke="currentColor" strokeWidth="1.5" x1="78" x2="68" y1="180" y2="225"></line>
                  {/* Hips and Lower Extremity Ground Load */}
                  <line stroke="currentColor" strokeWidth="1.5" x1="125" x2="175" y1="230" y2="230"></line>
                  {/* Left Leg & Stance Base */}
                  <line stroke="currentColor" strokeWidth="1.5" x1="130" x2="114" y1="230" y2="340"></line>
                  <line stroke="currentColor" strokeWidth="1.5" x1="114" x2="98" y1="340" y2="460"></line>
                  <line stroke="currentColor" strokeDasharray="none" strokeWidth="2" x1="98" x2="130" y1="460" y2="465"></line>
                  {/* Right Drive Leg */}
                  <line stroke="currentColor" strokeWidth="1.5" x1="170" x2="198" y1="230" y2="335"></line>
                  <line stroke="currentColor" strokeWidth="1.5" x1="198" x2="216" y1="335" y2="455"></line>
                  <line stroke="currentColor" strokeDasharray="none" strokeWidth="2" x1="216" x2="248" y1="455" y2="458"></line>
                </g>
                {/* Skeletal Biomechanical Joints (Luminous Nodes) */}
                <g className="text-secondary" fill="currentColor">
                  <circle cx="110" cy="130" r="3.5"></circle>
                  <circle cx="190" cy="130" r="3.5"></circle>
                  <circle cx="228" cy="185" r="3"></circle>
                  <circle cx="248" cy="245" r="3.5"></circle>
                  <circle cx="78" cy="180" r="3"></circle>
                  <circle cx="68" cy="225" r="3"></circle>
                  <circle cx="130" cy="230" r="3.5"></circle>
                  <circle cx="170" cy="230" r="3.5"></circle>
                  <circle cx="114" cy="340" r="3"></circle>
                  <circle cx="198" cy="335" r="3"></circle>
                  <circle className="text-primary" cx="98" cy="460" fill="currentColor" r="4"></circle>
                  <circle className="text-primary" cx="216" cy="455" fill="currentColor" r="4"></circle>
                </g>
                {/* Corner Viewfinder Calibrators */}
                <path className="text-on-surface-variant opacity-50" d="M 28 40 L 48 40 M 28 40 L 28 60" stroke="currentColor" strokeWidth="2"></path>
                <path className="text-on-surface-variant opacity-50" d="M 272 40 L 252 40 M 272 40 L 272 60" stroke="currentColor" strokeWidth="2"></path>
                <path className="text-on-surface-variant opacity-50" d="M 28 480 L 48 480 M 28 480 L 28 460" stroke="currentColor" strokeWidth="2"></path>
                <path className="text-on-surface-variant opacity-50" d="M 272 480 L 252 480 M 272 480 L 272 460" stroke="currentColor" strokeWidth="2"></path>
              </svg>
            </div>
            {/* HUD LAYER: TOP TELEMETRY CONTROLS */}
            <div className="relative z-20 flex flex-col gap-space-xs pt-space-xs">
              {/* Top Action Bar */}
              <div className="flex items-center justify-between gap-space-xs">
                {/* Close / Cancel Return */}
                <button aria-label="Cancel session" className="min-w-[40px] min-h-[40px] h-10 w-10 rounded-full bg-surface-container/85 backdrop-blur-md flex items-center justify-center text-on-surface hover:text-primary transition-colors" onClick={() => router.back()}>
                  <span className="material-symbols-outlined text-[20px]">
                    close
                  </span>
                </button>
                {/* Active Sport Drill Pill */}
                <div className="flex items-center gap-space-xs px-space-md py-1 bg-surface-container-high/90 backdrop-blur-xl rounded-full shadow-lg">
                  <span className="w-2 h-2 rounded-full bg-primary animate-ping"></span>
                  <span className="font-label-caps text-label-caps tracking-wider text-on-surface uppercase">
                    {DRILL_LABEL[sport]}
                  </span>
                  <span className="font-label-caps text-label-caps text-secondary-fixed opacity-70">
                    #04
                  </span>
                </div>
                {/* Utility Switchers (Flash & Lens Cluster) */}
                <div className="flex items-center gap-1.5">
                  <button aria-label="Toggle court illumination assistance" className={`min-w-[40px] min-h-[40px] h-10 w-10 rounded-full bg-surface-container/85 backdrop-blur-md flex items-center justify-center text-on-surface hover:text-tertiary transition-colors ${torch ? "text-tertiary" : ""}`} id="torchBtn" onClick={toggleTorch}>
                    <span className="material-symbols-outlined text-[20px]" id="torchIcon">
                      {torch ? "flash_on" : "flash_off"}
                    </span>
                  </button>
                  <button aria-label="Toggle lens focal length" className="min-w-[40px] min-h-[40px] h-10 px-2.5 rounded-full bg-surface-container/85 backdrop-blur-md flex items-center justify-center gap-0.5 text-on-surface hover:text-primary transition-colors" id="lensToggle" onClick={() => setLens((i) => (i + 1) % LENSES.length)}>
                    <span className="font-label-caps text-label-caps text-secondary font-bold" id="lensVal">
                      {LENSES[lens]}
                    </span>
                  </button>
                </div>
              </div>
              {/* Telemetry Sub-bar: Audio & Dynamic Ghost Sync Status */}
              <div className="flex items-center justify-between px-space-xs mt-1">
                {/* Audio Input Meter Indicator */}
                <div className="flex items-center gap-1.5 bg-surface-container-lowest/80 backdrop-blur-md px-2.5 py-1 rounded-full">
                  <span className="material-symbols-outlined text-primary text-[14px]">
                    mic
                  </span>
                  <div className="flex items-center gap-0.5 h-2">
                    <span className="w-0.5 h-1.5 bg-primary rounded-full"></span>
                    <span className="w-0.5 h-2.5 bg-primary rounded-full"></span>
                    <span className="w-0.5 h-3 bg-primary rounded-full"></span>
                    <span className="w-0.5 h-1.5 bg-outline rounded-full"></span>
                  </div>
                  <span className="font-label-caps text-[10px] text-on-surface-variant uppercase tracking-wider">
                    KINETIC AUDIO
                  </span>
                </div>
                {/* 60FPS Neural Feed Marker */}
                <div className="flex items-center gap-1.5 bg-surface-container-lowest/80 backdrop-blur-md px-2.5 py-1 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-secondary-fixed"></span>
                  <span className="font-label-caps text-[10px] text-secondary uppercase tracking-wider">
                    1080P • 60 FPS
                  </span>
                </div>
              </div>
              {/* Waist Height Physical Positioning Banner */}
              <div className="mt-2 mx-auto w-full max-w-xs bg-surface-container-low/90 backdrop-blur-md px-space-sm py-1.5 rounded-xl flex items-center gap-space-xs shadow-md">
                <span className="material-symbols-outlined text-secondary-fixed text-[18px] shrink-0">
                  straighten
                </span>
                <p className="font-body-sm text-[12px] leading-tight text-on-surface truncate">
                  Position camera at{" "}
                  <strong className="text-secondary font-semibold">
                    waist height
                  </strong>
                  {" "}(8–10 ft back)
                </p>
              </div>
            </div>
            {/* HUD LAYER: LIVE KINETIC POSE QUALITY CHECKLIST */}
            <div className="relative z-20 flex flex-col gap-1.5 pb-space-xs max-w-[280px]">
              {/* Pose Parameter 1 */}
              <div className="flex items-center gap-2 bg-surface-container-lowest/80 backdrop-blur-md px-space-sm py-1 rounded-lg">
                <div className="w-4 h-4 rounded-full bg-primary/20 flex items-center justify-center text-primary shrink-0">
                  <span className="material-symbols-outlined text-[13px] font-bold">
                    check
                  </span>
                </div>
                <span className="font-body-sm text-[12px] text-on-surface font-medium">
                  Full body in frame
                </span>
                <span className="font-label-caps text-[10px] text-primary ml-auto tracking-wider">
                  LOCKED
                </span>
              </div>
              {/* Pose Parameter 2 */}
              <div className="flex items-center gap-2 bg-surface-container-lowest/80 backdrop-blur-md px-space-sm py-1 rounded-lg">
                <div className="w-4 h-4 rounded-full bg-primary/20 flex items-center justify-center text-primary shrink-0">
                  <span className="material-symbols-outlined text-[13px] font-bold">
                    check
                  </span>
                </div>
                <span className="font-body-sm text-[12px] text-on-surface font-medium">
                  Court lighting optimal
                </span>
                <span className="font-label-caps text-[10px] text-primary ml-auto tracking-wider">
                  340 LUX
                </span>
              </div>
              {/* Pose Parameter 3 */}
              <div className="flex items-center gap-2 bg-surface-container-lowest/80 backdrop-blur-md px-space-sm py-1 rounded-lg">
                <div className="w-4 h-4 rounded-full bg-primary/20 flex items-center justify-center text-primary shrink-0">
                  <span className="material-symbols-outlined text-[13px] font-bold">
                    check
                  </span>
                </div>
                <span className="font-body-sm text-[12px] text-on-surface font-medium">
                  Camera steady (gyro stable)
                </span>
                <span className="font-label-caps text-[10px] text-primary ml-auto tracking-wider">
                  0.02°
                </span>
              </div>
            </div>
          </div>
          {/* LOWER CONTROL CONSOLE & RECORDING ENGINE */}
          <div className="flex flex-col w-full bg-surface px-space-md pt-space-sm pb-space-lg gap-space-md">
            {/* Delay Countdown Selector & Time Horizon */}
            <div className="flex items-center justify-between pt-1">
              {/* Countdown Presets */}
              <div className="flex items-center gap-1.5 p-1 bg-surface-container-low rounded-xl">
                <button className={delay === null ? "timer-btn font-label-caps text-label-caps px-2.5 py-1 rounded-lg bg-surface-container text-on-surface transition-colors" : delay === 0 ? DELAY_ON : DELAY_OFF} id="delay0" onClick={() => setDelay(0)}>
                  OFF
                </button>
                <button className={effectiveDelay === 3 ? DELAY_ON : DELAY_OFF} id="delay3" onClick={() => setDelay(3)}>
                  3s
                </button>
                <button className={effectiveDelay === 5 ? DELAY_ON : DELAY_OFF} id="delay5" onClick={() => setDelay(5)}>
                  5s
                </button>
                <button className={effectiveDelay === 10 ? DELAY_ON : DELAY_OFF} id="delay10" onClick={() => setDelay(10)}>
                  10s
                </button>
              </div>
              {/* Elapsed & Cap Telemetry */}
              <div className="flex items-baseline gap-1 bg-surface-container-lowest px-space-sm py-1 rounded-xl">
                <span className={`font-metric-large text-[22px] leading-none text-primary font-bold font-mono tracking-tight ${queued ? "text-secondary-fixed" : ""}`} id="recordTimer">
                  {timerText}
                </span>
                <span className="font-body-sm text-[11px] text-on-surface-variant">
                  / 30.0s
                </span>
              </div>
            </div>
            {/* MAIN SHUTTER TRIGGER & QUICK ACTIONS HUB */}
            <div className="flex items-center justify-around py-1">
              {/* Quick Camera Flipper (Front / Back) */}
              <button aria-label="Switch between selfie and rear camera" className="flex flex-col items-center justify-center gap-1 min-w-[56px] min-h-[56px] text-on-surface hover:text-primary transition-colors" onClick={() => setFacing((f) => (f === "user" ? "environment" : "user"))}>
                <div className="w-12 h-12 rounded-full bg-surface-container-high flex items-center justify-center shadow-md active:scale-95 transition-transform">
                  <span className="material-symbols-outlined text-[22px]">
                    flip_camera_ios
                  </span>
                </div>
                <span className="font-label-caps text-[10px] text-on-surface-variant uppercase tracking-wider">
                  FLIP
                </span>
              </button>
              {/* Tactical Shutter Button */}
              <div className="relative flex items-center justify-center">
                {/* Ambient kinetic pulse ring when live */}
                <div className={`absolute w-24 h-24 rounded-full bg-primary/20 transition-opacity ${live ? "animate-ping opacity-80" : "opacity-0"}`} id="pulseHalo"></div>
                <button aria-label="Start recording kinetic forehand drill" className="relative group min-w-[80px] min-h-[80px] w-20 h-20 rounded-full p-1.5 flex items-center justify-center transition-transform active:scale-95 shadow-xl bg-surface-container-lowest" id="shutterBtn" onClick={toggleRecording}>
                  {/* Outer dynamic track */}
                  <div className="absolute inset-1 rounded-full bg-gradient-to-tr from-primary to-secondary-fixed p-1" id="shutterRing">
                    <div className="w-full h-full rounded-full bg-surface-container-lowest flex items-center justify-center">
                      {/* Tactile Core Trigger */}
                      <div className={live ? "flex items-center justify-center shadow-[0_0_20px_rgba(75,226,119,0.6)] group-hover:bg-primary-fixed transition-all duration-300 rounded-lg bg-error w-10 h-10" : "w-14 h-14 rounded-full bg-primary flex items-center justify-center shadow-[0_0_20px_rgba(75,226,119,0.6)] group-hover:bg-primary-fixed transition-all duration-300"} id="shutterCore">
                        <span className={live ? "material-symbols-outlined text-on-error text-[24px]" : "material-symbols-outlined text-on-primary text-[28px]"} id="shutterIcon">
                          {live ? "stop" : "videocam"}
                        </span>
                      </div>
                    </div>
                  </div>
                </button>
              </div>
              {/* Quick Gallery Ingestion Trigger */}
              <label className="flex flex-col items-center justify-center gap-1 min-w-[56px] min-h-[56px] cursor-pointer text-on-surface hover:text-secondary-fixed transition-colors" htmlFor="galleryUpload">
                <input accept="video/*" className="sr-only" id="galleryUpload" onChange={onGalleryPick} type="file" />
                <input ref={nativeInput} accept="video/*" capture="environment" className="sr-only" onChange={onNativeCapture} type="file" />
                <div className="w-12 h-12 rounded-full bg-surface-container-high flex items-center justify-center shadow-md active:scale-95 transition-transform">
                  <span className="material-symbols-outlined text-[22px] text-secondary">
                    video_file
                  </span>
                </div>
                <span className="font-label-caps text-[10px] text-on-surface-variant uppercase tracking-wider">
                  UPLOAD
                </span>
              </label>
            </div>
            {/* PIPELINE STATUS & TELEMETRY READY BANNER */}
            <div className="flex flex-col gap-1.5 px-space-xs text-center">
              <div className="flex items-center justify-center gap-1.5 py-1 px-space-sm rounded-lg bg-surface-container-low">
                <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                {nativeOnly ? (
                  <p className="font-body-sm text-[12px] text-on-surface leading-tight">
                    Tap <strong className="text-primary font-medium">record</strong> to open your phone&apos;s camera — the clip comes back here for review
                  </p>
                ) : (
                  <p className="font-body-sm text-[12px] text-on-surface leading-tight">
                    Camera ready at{" "}
                    <strong className="text-primary font-medium">
                      1080p 60fps
                    </strong>
                    {" "}• Neural tracking active upon submission
                  </p>
                )}
              </div>
              <p className="font-body-sm text-[11px] text-on-surface-variant tracking-wide">
                AI digital twin analysis and biomechanical ghost overlay render immediately after clip capture.
              </p>
            </div>
          </div>
          {/* Client-side Interactive Simulation Logic */}
        </div>
      </main>
    </div>
  );
}
