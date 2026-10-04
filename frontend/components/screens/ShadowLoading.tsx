"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

// Ghost-alignment steps, as defined by the Stitch prototype's script.
const STEPS = {
  1: { transform: "translate(18px, -12px)", opacity: "0.65", badge: "STEP 1 • MISMATCH", badgeClass: "font-label-caps text-[10px] px-1.5 py-0.2 bg-error-container/40 text-error rounded", label: "Step 1: Ghost Stance Lags (Joint Delta High)", delta: "ELBOW DELTA: -140ms SEVERE LAG" },
  2: { transform: "translate(6px, -4px)", opacity: "0.85", badge: "STEP 2 • ALIGNING", badgeClass: "font-label-caps text-[10px] px-1.5 py-0.2 bg-secondary-container/20 text-secondary rounded", label: "Step 2: Dynamic Motion Mesh Alignment", delta: "ELBOW DELTA: -22ms CONVERGING" },
  3: { transform: "translate(0px, 0px)", opacity: "1.0", badge: "STEP 3 • SYNCHRONIZED", badgeClass: "font-label-caps text-[10px] px-1.5 py-0.2 bg-primary/20 text-primary rounded", label: "Step 3: Perfect Biomechanical Lock (0ms)", delta: "NODES SYNCHRONIZED (100%)" },
} as const;
type Step = keyof typeof STEPS;
const DOT_ON = "w-2.5 h-2.5 rounded-full transition-all bg-secondary shadow-[0_0_8px_#00eefc]";
const DOT_OFF = "w-2.5 h-2.5 rounded-full transition-all bg-outline-variant hover:bg-secondary";

// Generated from design/stitch/cinematic_loading_your_shadow_is_learning/code.html by scripts/stitch-to-jsx.mjs.
export default function ShadowLoading() {
  const router = useRouter();
  const [step, setStep] = useState<Step | null>(null); // null = initial Stitch state before any step is applied
  const [staticMode, setStaticMode] = useState(false);
  const [ready, setReady] = useState(false);
  const s = step ? STEPS[step] : null;

  // Simulated pipeline: the ghost locks on and the ready card appears after a few seconds.
  useEffect(() => {
    const t1 = setTimeout(() => setStep((cur) => cur ?? 2), 1200);
    const t2 = setTimeout(() => {
      setStep(3);
      setReady(true);
    }, 4500);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  function toggleReady() {
    setReady((r) => !r);
    setStep(ready ? 2 : 3);
  }

  return (
    <div className="bg-surface text-on-surface font-body-md text-body-md flex flex-col min-h-screen antialiased">
      <header className="fixed top-0 inset-x-0 z-50 bg-surface-container-lowest/80 backdrop-blur-xl shadow-[0_4px_24px_rgba(0,0,0,0.5)] pt-safe">
        <div className="h-16 px-space-sm flex items-center justify-between">
          <div className="flex items-center gap-space-xs">
            <button className="w-11 h-11 flex items-center justify-center text-on-surface-variant hover:text-on-surface rounded-full transition-colors" onClick={() => router.back()}>
              <span className="material-symbols-outlined text-[20px]">
                arrow_back
              </span>
            </button>
            <img alt="Athletic silhouette icon with a subtle glowing cyan/lime duplicate shadow offset mark, symbolizing 'ShadowAthlete' and 'Your only opponent is you'. Brand logo" className="h-7 w-auto object-contain" src="https://lh3.googleusercontent.com/aida/AEtjO1U3su2IAJUfImc-QDFIgi5gzTYlDbkzgOVUovo_BNyYGtYNa9qhX4P-2oyefwHVQLhZ1Ab4ChydkqNbQYJ6oFFxL_5J_Qddc6EFgbqZ0J_0WRGiZMLAdr9Zbyj22BuHGThZeOIqyijB8g8KkiHaFQvfwq9-n-bK31wtBSZzAKwsfXkmsWzUb-vNdXU1acb3RA2HpoEFk8GGPHAJO2_JBzWeKHcIe9Wj_ZNrU6FINegMlz-Os5bYSEFdNK0" />
            <h1 className="font-headline-md text-body-md tracking-tight uppercase text-on-surface truncate">
              Live Session
            </h1>
          </div>
          <div className="flex items-center gap-space-xs">
            <img alt="Profile" className="w-7 h-7 rounded-full object-cover ring-1 ring-secondary-container/40" src="https://lh3.googleusercontent.com/aida/AEtjO1VMnOn0JU8o67qYlYqYCfMg1WkAfuvSKYr7KKY53q6BP96YUKVar9XDhOk_G0q9oEEjtyqPTnjPz-jEJrc0WYt38c3cNqYZcfCBRJw4q5MRzBkPerclP4uhy8_16kr0ms5etlkMLS_PsBNC0_ErIoeYXxd2zuxLTVC_llRYg3rM1224q-gsYbE7WRhzle6ndzpYuYW6zR9J2qVASfJ92oWz4LbzfGQXXuIcMd1SHheY-ciDcBNW3LLRji8" />
            <button className="w-11 h-11 flex items-center justify-center text-on-surface-variant hover:text-error transition-colors" onClick={() => router.push("/home")}>
              <span className="material-symbols-outlined text-[20px]">
                close
              </span>
            </button>
          </div>
        </div>
      </header>
      <main className="flex flex-col relative w-full pt-16 pb-safe bg-surface min-h-screen">
        <div className="flex flex-col w-full px-margin-mobile pb-space-xl gap-space-lg select-none">
          {/* Top Telemetry Stream & Status */}
          <div className="flex flex-col gap-space-xs mt-space-sm">
            <div className="flex items-center justify-between">
              <div className="inline-flex items-center gap-space-xs bg-surface-container-high px-space-sm py-1 rounded-full">
                <span className="w-2 h-2 rounded-full bg-secondary shadow-[0_0_8px_#00eefc] animate-pulse"></span>
                <span className="font-label-caps text-label-caps tracking-wider text-secondary uppercase">
                  Twin Ingest Active
                </span>
              </div>
              <span className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-widest">
                Pipeline v4.8
              </span>
            </div>
            <div className="flex flex-col mt-space-xs">
              <h2 className="font-headline-xl-mobile text-headline-xl-mobile text-on-surface font-headline-xl tracking-tight">
                YOUR SHADOW IS{" "}
                <span className="text-secondary drop-shadow-[0_0_12px_rgba(0,238,252,0.4)]">
                  LEARNING
                </span>
              </h2>
              <p className="font-body-md text-body-md text-on-surface-variant">
                Turning your movement into your digital biomechanical twin.
              </p>
            </div>
            {/* Sport & Clip Data Capsule */}
            <div className="bg-surface-container-low px-space-sm py-2 rounded-xl flex items-center justify-between mt-space-xs">
              <div className="flex items-center gap-space-xs min-w-0">
                <span className="material-symbols-outlined text-[18px] text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>
                  sports_tennis
                </span>
                <span className="font-label-badge text-label-badge text-on-surface truncate">
                  TENNIS: FOREHAND DRIVE
                </span>
              </div>
              <div className="flex items-center gap-1.5 shrink-0 bg-surface-container px-2 py-0.5 rounded-md">
                <span className="font-label-caps text-label-caps text-on-surface-variant">
                  CLIP #04
                </span>
                <span className="w-1 h-1 rounded-full bg-outline-variant"></span>
                <span className="font-label-caps text-label-caps text-secondary font-bold">
                  14.2s
                </span>
              </div>
            </div>
          </div>
          {/* CENTERPIECE VISUAL EXPERIENCE: Synthetic Kinematics HUD Canvas */}
          <div className="flex flex-col bg-surface-container-lowest rounded-xl overflow-hidden shadow-xl">
            {/* Visual Sub-Header & Controls */}
            <div className="flex items-center justify-between px-space-sm py-2 bg-surface-container-low/70 backdrop-blur-md">
              <div className="flex items-center gap-2">
                <span className="font-label-caps text-label-caps text-on-surface-variant tracking-wider uppercase">
                  MOVEMENT VISUALIZATION
                </span>
                <span className={s?.badgeClass ?? "font-label-caps text-[10px] px-1.5 py-0.2 bg-secondary-container/20 text-secondary rounded"} id="sync-badge">
                  {s?.badge ?? "STEP 2 • ALIGNING"}
                </span>
              </div>
              {/* Reduced Motion Accessibility Switcher */}
              <button className="flex items-center gap-1 bg-surface-container px-2 py-1 rounded text-on-surface-variant hover:text-on-surface transition-colors" id="toggle-motion-btn" onClick={() => setStaticMode((v) => !v)}>
                <span className="material-symbols-outlined text-[14px]">
                  motion_sensor_idle
                </span>
                <span className="font-label-caps text-[10px] tracking-normal uppercase" id="motion-mode-text">
                  {staticMode ? "Motion View" : "Static Mode"}
                </span>
              </button>
            </div>
            {/* Dynamic Stage Area */}
            <div className="relative w-full h-72 overflow-hidden flex items-center justify-center bg-surface-dim">
              {/* Background Telemetry Grids */}
              <svg className="absolute inset-0 w-full h-full opacity-15 pointer-events-none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <pattern height="24" id="hud-grid" patternUnits="userSpaceOnUse" width="24">
                    <path d="M 24 0 L 0 0 0 24" fill="none" stroke="#3d4a3d" strokeWidth="0.5"></path>
                  </pattern>
                </defs>
                <rect fill="url(#hud-grid)" height="100%" width="100%"></rect>
              </svg>
              {/* Dynamic Visual Canvas Overlay (Motion Simulated vs Static Pose) */}
              <div className={`relative w-full h-full flex items-center justify-center ${staticMode ? "hidden" : ""}`} id="kinetic-stage">
                {/* Physical Athlete Base Layer with Kinetic Points (Lime) */}
                <div className="absolute inset-0 flex items-center justify-center transition-all duration-700" id="athlete-layer">
                  <svg className="w-full h-full p-4" fill="none" viewBox="0 0 320 220" xmlns="http://www.w3.org/2000/svg">
                    {/* Athlete Stance Silhouette Trails (Kinetic Lime) */}
                    <path className="opacity-80" d="M 90 170 Q 130 110 160 85 T 235 60" stroke="#4be277" strokeDasharray="4 2" strokeLinecap="round" strokeWidth="2.5"></path>
                    <path className="opacity-40" d="M 120 180 L 140 140 L 160 85 L 185 105 L 235 60" stroke="#4be277" strokeWidth="2"></path>
                    {/* Athlete Active Joint Nodes (Relentless Lime Nodes) */}
                    {/* Racket Point */}
                    <circle className="shadow-[0_0_12px_#4be277]" cx="235" cy="60" fill="#4be277" r="5"></circle>
                    {/* Wrist */}
                    <circle cx="205" cy="80" fill="#4be277" r="3.5"></circle>
                    {/* Elbow */}
                    <circle cx="185" cy="105" fill="#4be277" id="node-elbow-athlete" r="4.5"></circle>
                    {/* Shoulder / Core */}
                    <circle cx="160" cy="85" fill="#4be277" r="5"></circle>
                    {/* Hip */}
                    <circle cx="140" cy="140" fill="#4be277" r="4.5"></circle>
                    {/* Knee */}
                    <circle cx="120" cy="165" fill="#4be277" id="node-knee-athlete" r="4"></circle>
                    {/* Foot Pivot */}
                    <circle cx="95" cy="190" fill="#4be277" r="4"></circle>
                    <text className="font-label-caps" fill="#4be277" fontSize="9" letterSpacing="0.1em" x="25" y="32">
                      ATHLETE KINETICS [135 MPH]
                    </text>
                  </svg>
                </div>
                {/* Ghost Shadow Twin Skeletal Layer (Ethereal Cyan Overlay) */}
                <div className="absolute inset-0 flex items-center justify-center transition-all duration-1000 ease-out transform translate-x-3 -translate-y-2 opacity-85" id="twin-layer" style={s ? { transform: s.transform, opacity: s.opacity } : undefined}>
                  <svg className="w-full h-full p-4" fill="none" viewBox="0 0 320 220" xmlns="http://www.w3.org/2000/svg">
                    {/* Ghost Skeletal Wireframe Mesh (Cyan) */}
                    <path className="opacity-90" d="M 100 178 Q 138 122 165 92 T 248 52" id="twin-path" stroke="#00eefc" strokeLinecap="round" strokeWidth="2"></path>
                    <path className="opacity-60" d="M 126 186 L 145 146 L 165 92 L 194 116 L 248 52" stroke="#00eefc" strokeDasharray="3 3" strokeWidth="1.5"></path>
                    {/* Twin Joint Indicators */}
                    <circle className="animate-ping" cx="248" cy="52" fill="none" id="twin-racket" r="6" stroke="#00eefc" strokeWidth="1.5" style={{ animationDuration: "2.5s" }}></circle>
                    <circle cx="212" cy="74" fill="#00eefc" r="3"></circle>
                    <circle cx="194" cy="116" fill="#00eefc" id="node-elbow-twin" r="4"></circle>
                    <circle cx="165" cy="92" fill="#00eefc" r="4"></circle>
                    <circle cx="145" cy="146" fill="#00eefc" r="4"></circle>
                    <circle cx="126" cy="172" fill="#00eefc" id="node-knee-twin" r="3.5"></circle>
                    <circle cx="100" cy="194" fill="#00eefc" r="3.5"></circle>
                    <text className="font-label-caps" fill="#00eefc" fontSize="9" letterSpacing="0.1em" x="200" y="205">
                      SHADOW SYNTHESIS 91%
                    </text>
                  </svg>
                </div>
                {/* Real-Time Sync Delta Tag Overlay */}
                <div className="absolute bottom-3 left-3 bg-surface-container-high/90 px-2 py-1 rounded backdrop-blur-md flex items-center gap-1.5 transition-opacity" id="delta-callout">
                  <span className="w-1.5 h-1.5 rounded-full bg-tertiary"></span>
                  <span className="font-label-caps text-[10px] text-on-surface" id="delta-text">
                    {s?.delta ?? "ELBOW DELTA: -42ms LAG"}
                  </span>
                </div>
              </div>
              {/* Static Reduced Motion Fallback Panel (Hidden by default) */}
              <div className={`${staticMode ? "" : "hidden"} absolute inset-0 bg-surface-container-low p-4 flex flex-col justify-between`} id="static-stage">
                <div className="flex items-center justify-between">
                  <span className="font-label-caps text-label-caps text-secondary uppercase">
                    Static Kinematic Diagnostic
                  </span>
                  <span className="font-label-badge text-[11px] bg-surface px-2 py-0.5 rounded text-on-surface-variant">
                    High-Contrast Mode
                  </span>
                </div>
                <div className="flex items-center justify-around gap-2 my-auto">
                  <div className="flex flex-col items-center p-2 rounded-xl bg-surface-container w-1/2">
                    <span className="font-label-caps text-[10px] text-primary mb-1">
                      PHYSICAL STRIKE
                    </span>
                    <span className="font-metric-large text-metric-large text-on-surface">
                      135
                      <span className="text-body-sm text-on-surface-variant font-normal">
                        mph
                      </span>
                    </span>
                    <span className="font-body-sm text-body-sm text-outline">
                      Hip Rot: 48°
                    </span>
                  </div>
                  <div className="flex flex-col items-center p-2 rounded-xl bg-surface-container w-1/2">
                    <span className="font-label-caps text-[10px] text-secondary mb-1">
                      SHADOW BENCHMARK
                    </span>
                    <span className="font-metric-large text-metric-large text-secondary">
                      138
                      <span className="text-body-sm text-on-surface-variant font-normal">
                        mph
                      </span>
                    </span>
                    <span className="font-body-sm text-body-sm text-outline">
                      Target Rot: 52°
                    </span>
                  </div>
                </div>
                <div className="font-body-sm text-body-sm text-on-surface-variant text-center">
                  Joint vectors mapped. No active motion rendering.
                </div>
              </div>
            </div>
            {/* Progressive Alignment Flow Indicator / Step Navigator Micro-Interaction */}
            <div className="px-space-sm py-2.5 bg-surface-container-low flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <button className={step ? (step === 1 ? DOT_ON : DOT_OFF) : "w-2.5 h-2.5 rounded-full bg-outline-variant hover:bg-secondary transition-colors"} id="step1-btn" title="Step 1: Mismatch" onClick={() => setStep(1)}></button>
                <button className={step ? (step === 2 ? DOT_ON : DOT_OFF) : "w-2.5 h-2.5 rounded-full bg-secondary shadow-[0_0_6px_#00eefc] transition-colors"} id="step2-btn" title="Step 2: Aligning" onClick={() => setStep(2)}></button>
                <button className={step ? (step === 3 ? DOT_ON : DOT_OFF) : "w-2.5 h-2.5 rounded-full bg-outline-variant hover:bg-primary transition-colors"} id="step3-btn" title="Step 3: Synchronized" onClick={() => setStep(3)}></button>
                <span className="ml-1 font-label-caps text-[10px] text-on-surface-variant" id="step-label">
                  {s?.label ?? "Step 2: Dynamic Motion Mesh Alignment"}
                </span>
              </div>
              <button className="font-label-caps text-[10px] uppercase text-primary hover:underline" id="preview-ready-toggle" onClick={toggleReady}>
                {ready ? "Hide Ready ✕" : "Simulate Ready ➔"}
              </button>
            </div>
          </div>
          {/* COMPLETION STATE CARD (Preview toggleable or unlocks when synchronized) */}
          <div className={`${ready ? "flex" : "hidden"} flex-col bg-surface-container-high rounded-xl p-space-md shadow-[0_0_24px_-2px_rgba(75,226,119,0.3)] animate-fadeIn`} id="ready-card">
            <div className="flex items-center gap-space-sm mb-space-xs">
              <div className="w-8 h-8 rounded-full bg-primary-container flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-on-primary text-[20px]">
                  check_circle
                </span>
              </div>
              <div className="flex flex-col">
                <span className="font-label-caps text-label-caps text-primary tracking-widest uppercase font-bold">
                  CALIBRATION COMPLETE
                </span>
                <h3 className="font-headline-md text-headline-md text-on-surface">
                  YOUR SHADOW IS READY
                </h3>
              </div>
            </div>
            {" "}
            <p className="font-body-md text-body-md text-on-surface-variant mb-space-md">
              Twin neural weights matched. Biomechanical sync achieved at 98.4% fidelity.
            </p>
            {" "}
            <button className="w-full h-12 bg-primary-container hover:bg-primary text-on-primary-container font-headline-md text-body-md font-bold rounded-lg flex items-center justify-center gap-2 shadow-[0_0_16px_rgba(75,226,119,0.4)] transition-all" onClick={() => router.push("/onboarding/reveal")}>
              <span>
                View Results
              </span>
              <span className="material-symbols-outlined text-[18px]">
                arrow_forward
              </span>
            </button>
          </div>
          {/* PROCESSING STATUS AREA: Real Decoupled Backend Pipeline */}
          <div className="flex flex-col bg-surface-container rounded-xl p-space-md gap-space-sm">
            <div className="flex items-center justify-between pb-1">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary text-[18px]">
                  neurology
                </span>
                <span className="font-label-caps text-label-caps text-on-surface tracking-wider uppercase font-bold">
                  Biomechanical Ingestion Pipeline
                </span>
              </div>
              <span className="font-label-caps text-label-caps text-secondary-fixed-dim">
                Telemetry Feed
              </span>
            </div>
            {/* Pipeline Stages (Rigid Real Progress) */}
            <div className="flex flex-col gap-2.5 mt-1">
              {/* Stage 1 */}
              <div className="flex items-center justify-between bg-surface-container-low px-space-sm py-2 rounded-lg">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="material-symbols-outlined text-[18px] text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>
                    check_circle
                  </span>
                  <span className="font-body-sm text-body-sm text-on-surface truncate">
                    1. Uploading Session Clip
                  </span>
                </div>
                <span className="font-label-badge text-label-badge text-primary shrink-0">
                  Completed
                </span>
              </div>
              {/* Stage 2 */}
              <div className="flex items-center justify-between bg-surface-container-low px-space-sm py-2 rounded-lg">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="material-symbols-outlined text-[18px] text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>
                    check_circle
                  </span>
                  <span className="font-body-sm text-body-sm text-on-surface truncate">
                    2. 24-Node Movement Skeletization
                  </span>
                </div>
                <span className="font-label-badge text-label-badge text-primary shrink-0">
                  Completed
                </span>
              </div>
              {/* Stage 3 (Active) */}
              <div className="flex flex-col bg-surface-container-high px-space-sm py-2.5 rounded-lg gap-1.5 shadow-[inset_0_0_12px_rgba(0,238,252,0.06)]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="material-symbols-outlined text-[18px] text-secondary animate-spin" style={{ animationDuration: "3s" }}>
                      sync
                    </span>
                    <span className="font-body-sm text-body-sm text-on-surface font-semibold truncate">
                      3. Analyzing Kinetic Technique
                    </span>
                  </div>
                  <span className="font-label-badge text-label-badge text-secondary shrink-0">
                    In Progress
                  </span>
                </div>
                <p className="font-label-caps text-[10px] text-on-surface-variant pl-6">
                  Synthesizing angular velocity &amp; shoulder-to-wrist kinematic vector chain...
                </p>
              </div>
              {/* Stage 4 */}
              <div className="flex items-center justify-between bg-surface-container-low/50 px-space-sm py-2 rounded-lg opacity-60">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="material-symbols-outlined text-[18px] text-outline">
                    hourglass_empty
                  </span>
                  <span className="font-body-sm text-body-sm text-on-surface truncate">
                    4. Calibrating Shadow Comparison Mesh
                  </span>
                </div>
                <span className="font-label-badge text-label-badge text-outline shrink-0">
                  Queued
                </span>
              </div>
            </div>
            {/* Transparent Calibration Note */}
            <div className="flex items-start gap-2 bg-surface-container-lowest/80 p-2.5 rounded-lg mt-1">
              <span className="material-symbols-outlined text-outline text-[16px] shrink-0 mt-0.5">
                info
              </span>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                Deep ML biomechanics analysis takes 1–2 minutes. Your shadow will keep calibrating in the background.
              </p>
            </div>
          </div>
          {/* EXCEPTION & RETRY STATE CARD (System resilience scenario) */}
          <div className="flex flex-col bg-surface-container-lowest rounded-xl p-space-md gap-space-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-tertiary">
                <span className="material-symbols-outlined text-[18px]">
                  warning
                </span>
                <span className="font-label-caps text-label-caps uppercase tracking-wider font-bold">
                  Occlusion Monitor
                </span>
              </div>
              <span className="font-label-caps text-[10px] bg-tertiary/10 text-tertiary px-1.5 py-0.5 rounded">
                Handled Safe
              </span>
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
              Camera Occlusion Detected: Kinetic joint tracking reduced between{" "}
              <span className="text-on-surface font-semibold">
                00:04 – 00:07
              </span>
              {" "}due to racket shadow overlap.
            </p>
            <div className="flex items-center gap-2 mt-2">
              <button className="flex-1 py-2 px-3 bg-surface-container-high hover:bg-surface-bright text-on-surface rounded text-center font-label-badge text-label-badge transition-colors">
                Re-interpolate Frame
              </button>
              <button className="py-2 px-3 bg-surface-container hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface rounded font-label-badge text-label-badge transition-colors">
                Upload Alt
              </button>
            </div>
          </div>
          {/* NON-BLOCKING ACTION & BACKGROUND SYNC ESCAPE HATCH */}
          <div className="flex flex-col items-center gap-space-xs pt-space-xs">
            <button className="w-full h-12 bg-surface-container-high hover:bg-surface-bright text-on-surface rounded-xl flex items-center justify-center gap-2 transition-colors" onClick={() => router.push("/home")}>
              <span className="font-headline-md text-body-md font-semibold">
                Continue to Dashboard
              </span>
              <span className="material-symbols-outlined text-[18px] text-on-surface-variant">
                arrow_forward
              </span>
            </button>
            <div className="flex items-center gap-1.5 text-on-surface-variant">
              <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse"></span>
              <span className="font-label-caps text-[10px] uppercase tracking-wider">
                Background analysis continues safely
              </span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
