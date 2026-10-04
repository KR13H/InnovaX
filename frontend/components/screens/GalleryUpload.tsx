"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { type Sport, getStagedClip, sportFromQuery, stageClip } from "@/lib/clip";
import { submitClip } from "@/lib/upload";

const PILL_ON = "drill-pill px-3 py-1.5 rounded-full bg-primary text-on-primary font-label-badge text-label-badge shadow-[0_0_12px_rgba(75,226,119,0.3)] transition-all";
const PILL_OFF = "drill-pill px-3 py-1.5 rounded-full bg-surface-container-highest text-on-surface-variant font-label-badge text-label-badge hover:bg-surface-bright transition-all";
const DRILLS: Record<Sport, string[]> = {
  tennis: ["Forehand Unit Turn", "Serve Pronation", "Rally Consistency"],
  cricket: ["Run-up Rhythm", "Front-Foot Landing", "Release Point"],
  basketball: ["Jump Shot Arc", "Free Throw Set", "Catch & Shoot"],
  running: ["Sprint Start", "Cadence Drill", "Tempo Stride"],
};

function formatSize(bytes: number) {
  return bytes >= 1e6 ? `${(bytes / 1e6).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1e3))} KB`;
}

// Generated from design/stitch/gallery_video_upload_shadowathlete/code.html by scripts/stitch-to-jsx.mjs.
export default function GalleryUpload() {
  const router = useRouter();
  const fileInput = useRef<HTMLInputElement>(null);
  const previewRef = useRef<HTMLVideoElement>(null);
  const [sport, setSport] = useState<Sport>("tennis");
  const [file, setFile] = useState<{ blob: Blob; name: string; url: string } | null>(null);
  const [meta, setMeta] = useState<{ duration: number; height: number } | null>(null);
  const [title, setTitle] = useState("Morning Baseline Forehand");
  const [drill, setDrill] = useState(0);
  const [status, setStatus] = useState<"idle" | "uploading" | "done">("idle");
  const [note, setNote] = useState<string | null>(null);

  useEffect(() => {
    setSport(sportFromQuery());
    const staged = getStagedClip();
    if (staged) setFile({ blob: staged.blob, name: staged.name, url: staged.url });
  }, []);

  const pick = () => fileInput.current?.click();

  function onFile(f: File | undefined) {
    if (!f) return;
    stageClip(f, sport);
    setFile({ blob: f, name: f.name, url: getStagedClip()!.url });
    setMeta(null);
  }

  async function upload() {
    if (!file) return pick();
    setStatus("uploading");
    const result = await submitClip(file, sport);
    setNote(result.ok ? null : result.reason);
    setStatus("done");
    setTimeout(() => router.push("/onboarding/analyzing"), result.ok ? 900 : 2200);
  }

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
        <div className="flex flex-col w-full text-on-surface">
          <div className="px-margin-mobile pt-space-sm pb-space-lg flex flex-col gap-space-lg max-w-md mx-auto w-full">
            {/* Step Guidance Header */}
            <div className="flex flex-col gap-space-xs">
              <div className="flex items-center gap-space-xs text-secondary-fixed text-label-caps">
                <span className="w-2 h-2 rounded-full bg-secondary-fixed shadow-[0_0_8px_rgba(0,240,255,0.7)] animate-pulse"></span>
                <span>
                  TELEMETRY INGESTION PIPELINE
                </span>
              </div>
              <h2 className="font-headline-xl-mobile text-headline-xl-mobile text-on-surface">
                Upload Video from Gallery
              </h2>
              <p className="font-body-md text-body-md text-on-surface-variant">
                Select a recorded sports clip from your phone to synthesize your kinetic digital twin.
              </p>
            </div>
            {/* Gallery / Drag & Drop Dropzone Box */}
            <div className="relative group cursor-pointer overflow-hidden rounded-xl bg-surface-container-low p-space-md flex flex-col items-center justify-center text-center transition-all duration-300 hover:bg-surface-container" id="dropzoneContainer" onClick={pick} onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); onFile(e.dataTransfer.files[0]); }}>
              <input ref={fileInput} type="file" accept="video/*" className="sr-only" onChange={(e) => onFile(e.target.files?.[0])} />
              <div className="absolute -inset-1 bg-gradient-to-r from-secondary/10 via-primary/10 to-transparent opacity-50 blur-sm pointer-events-none"></div>
              <div className="relative z-10 flex flex-col items-center gap-space-sm w-full py-space-sm">
                <div className="w-14 h-14 rounded-full bg-surface-container-high flex items-center justify-center text-secondary-fixed shadow-[0_0_16px_rgba(0,240,255,0.15)] group-hover:scale-105 transition-transform duration-200">
                  <span className="material-symbols-outlined text-[32px]">
                    video_library
                  </span>
                </div>
                <div className="flex flex-col gap-space-xs">
                  <p className="font-headline-md text-headline-md text-on-surface">
                    Drag &amp; drop session capture
                  </p>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">
                    or import directly from your device media storage
                  </p>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-space-xs pt-space-xs w-full">
                  <button className="flex items-center justify-center gap-space-xs px-space-md py-space-xs rounded-full bg-surface-bright text-on-surface font-label-badge text-label-badge hover:bg-surface-container-highest transition-colors" type="button" onClick={(e) => { e.stopPropagation(); pick(); }}>
                    <span className="material-symbols-outlined text-[18px] text-primary">
                      photo_library
                    </span>
                    <span>
                      Choose from Photo Library
                    </span>
                  </button>
                  <button className="flex items-center justify-center gap-space-xs px-space-md py-space-xs rounded-full bg-surface-container-highest text-on-surface font-label-badge text-label-badge hover:bg-surface-bright transition-colors" type="button" onClick={(e) => { e.stopPropagation(); pick(); }}>
                    <span className="material-symbols-outlined text-[18px] text-secondary">
                      folder_open
                    </span>
                    <span>
                      Browse Files
                    </span>
                  </button>
                </div>
                <div className="inline-flex items-center gap-1.5 px-space-sm py-1 rounded-full bg-surface-container-lowest text-on-surface-variant font-label-caps text-label-caps mt-space-xs">
                  <span className="material-symbols-outlined text-[14px] text-secondary-fixed">
                    info
                  </span>
                  <span>
                    MP4, MOV, HEVC up to 200 MB
                  </span>
                </div>
              </div>
            </div>
            {/* Active Selection Preview & Telemetry Specs Card */}
            <div className="rounded-xl bg-surface-container p-space-md flex flex-col gap-space-md shadow-md">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-[20px]">
                    smart_display
                  </span>
                  <span className="font-label-caps text-label-caps text-on-surface uppercase">
                    Ingested Clip Payload
                  </span>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary font-label-caps text-label-caps flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary animate-ping"></span>
                  {" "}READY FOR SYNC
                </span>
              </div>
              {/* Video Preview Area */}
              <div className="relative w-full h-44 rounded-lg overflow-hidden bg-surface-container-lowest group">
                {file ? (
                  <video ref={previewRef} src={file.url} className="w-full h-full object-cover" playsInline muted loop onLoadedMetadata={(e) => setMeta({ duration: e.currentTarget.duration, height: e.currentTarget.videoHeight })}></video>
                ) : (
                  <img className="w-full h-full object-cover" data-alt="High contrast professional tennis player female executing powerful forehand follow-through on hard indoor court at dusk, with faint cyan holographic biomechanics ghost vector silhouette trailing her swing arc, cinematic F1 telemetry aesthetic, sports tech lighting." src="https://lh3.googleusercontent.com/aida-public/AB6AXuCvgSmdk5IyX1gXVqlZfePuM6oUGpelfzGYM7lULhGdKtNZ8zrEL0wbky-O1tYJUtyiLshbStl-3qX0Q45Okvyz9lZlRwfAI8J-bK0k_43YZ0aW3eOQbUWWKy-9GeA7hTZYZMHn0Fc1H_vFgUmq9SdfES1VlAiW2oqpGjFWX2UvyTSsiv0XdmjhVxnacO47BO2q7yhnzhQ3xpS77fvGcoG9c0PrG8nQtFV0slopRjt3jklAvdPYlKLh" />
                )}
                {" "}
                {/* Scrim */}
                {" "}
                <div className="absolute inset-0 bg-gradient-to-t from-surface-container-lowest/90 via-surface-container-lowest/30 to-transparent"></div>
                {" "}
                {/* Telemetry Scanline Effect Overlay */}
                {" "}
                <div className="absolute inset-0 opacity-20 pointer-events-none bg-[radial-gradient(#00f0ff_1px,transparent_1px)] [background-size:12px_12px]"></div>
                {" "}
                {/* Play Button Micro-CTA */}
                {" "}
                <div className="absolute inset-0 flex items-center justify-center">
                  <button aria-label="Play sample clip" onClick={() => { const v = previewRef.current; if (v) v.paused ? v.play() : v.pause(); }} className="w-12 h-12 rounded-full bg-surface/80 backdrop-blur-md flex items-center justify-center text-primary shadow-[0_0_18px_rgba(75,226,119,0.4)] hover:scale-110 active:scale-95 transition-transform" type="button">
                    <span className="material-symbols-outlined text-[28px] translate-x-0.5">
                      play_arrow
                    </span>
                  </button>
                </div>
                {" "}
                {/* Overlay Timestamp Badge */}
                {" "}
                <div className="absolute bottom-2 left-2 px-2 py-1 rounded bg-surface-container-lowest/80 backdrop-blur-sm font-label-caps text-label-caps text-secondary-fixed">
                  {meta ? `00:${meta.duration.toFixed(1).padStart(4, "0")} // BUFFERED` : "00:14.2 // BUFFERED"}
                </div>
                {" "}
                {/* Resolution Indicator */}
                {" "}
                <div className="absolute top-2 right-2 px-2 py-0.5 rounded bg-surface/80 backdrop-blur-sm text-on-surface font-label-badge text-label-badge">
                  60 FPS PRO
                </div>
              </div>
              {/* File Details Grid */}
              <div className="flex flex-col gap-1.5 pt-1">
                <div className="flex items-baseline justify-between">
                  <span className="font-headline-md text-headline-md text-on-surface truncate">
                    {file?.name ?? "morning_forehand_rally.mov"}
                  </span>
                </div>
                <div className="flex items-center gap-space-xs text-on-surface-variant font-body-sm text-body-sm flex-wrap">
                  <span className="text-on-surface">
                    {meta ? `${meta.duration.toFixed(1)}s duration` : "14.2s duration"}
                  </span>
                  <span>
                    •
                  </span>
                  <span className="text-secondary-fixed">
                    {meta ? `${meta.height}p` : "1080p @ 60 FPS"}
                  </span>
                  <span>
                    •
                  </span>
                  <span>
                    {file ? formatSize(file.blob.size) : "34.2 MB"}
                  </span>
                </div>
              </div>
              {/* Quick Actions (Replace / Trim) */}
              <div className="flex items-center gap-space-xs pt-space-xs">
                <button className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-surface-bright text-on-surface font-label-badge text-label-badge hover:bg-surface-container-highest transition-colors" type="button" onClick={pick}>
                  <span className="material-symbols-outlined text-[16px] text-secondary">
                    change_circle
                  </span>
                  <span>
                    Replace video
                  </span>
                </button>
                <button className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-surface-bright text-on-surface font-label-badge text-label-badge hover:bg-surface-container-highest transition-colors" type="button" onClick={() => previewRef.current?.play()}>
                  <span className="material-symbols-outlined text-[16px] text-primary">
                    content_cut
                  </span>
                  <span>
                    Trim clip
                  </span>
                </button>
              </div>
            </div>
            {/* Session Attributes & Metadata Form */}
            <div className="rounded-xl bg-surface-container p-space-md flex flex-col gap-space-md shadow-md">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary-fixed text-[20px]">
                  tune
                </span>
                <span className="font-label-caps text-label-caps text-on-surface uppercase">
                  Session Telemetry Config
                </span>
              </div>
              {/* Sport Association Select */}
              <div className="flex flex-col gap-1.5">
                <label className="font-label-caps text-label-caps text-on-surface-variant" htmlFor="sportSelect">
                  TARGET DISCIPLINE
                </label>
                <div className="relative">
                  <select className="w-full appearance-none rounded-lg bg-surface-container-lowest px-space-md py-3 text-on-surface font-body-md text-body-md focus:outline-none focus:ring-1 focus:ring-secondary-container transition-all pr-10" id="sportSelect" value={sport} onChange={(e) => { setSport(e.target.value as Sport); setDrill(0); }}>
                    <option value="tennis">
                      Tennis (Full Biomechanical Kinematics)
                    </option>
                    <option value="cricket">
                      Cricket (Bowling / Batting Kinetic Chain)
                    </option>
                    <option value="basketball">
                      Basketball (Jump Shot Arc &amp; Release)
                    </option>
                    <option value="running">
                      Running (Gait &amp; Stride Geometry)
                    </option>
                  </select>
                  {" "}
                  <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant text-[20px]">
                    expand_more
                  </span>
                </div>
              </div>
              {/* Session Title Input */}
              <div className="flex flex-col gap-1.5">
                <label className="font-label-caps text-label-caps text-on-surface-variant" htmlFor="sessionName">
                  SESSION IDENTIFIER
                </label>
                <input className="w-full rounded-lg bg-surface-container-lowest px-space-md py-3 text-on-surface font-body-md text-body-md focus:outline-none focus:ring-1 focus:ring-primary transition-all" id="sessionName" type="text" value={title} onChange={(e) => setTitle(e.target.value)} />
              </div>
              {/* Drill Type Quick Pills */}
              <div className="flex flex-col gap-space-xs">
                <span className="font-label-caps text-label-caps text-on-surface-variant">
                  TARGET DRILL CLUSTER
                </span>
                <div className="flex flex-wrap gap-2" id="drillPillGroup">
                  {DRILLS[sport].map((d, i) => (
                    <button key={d} className={i === drill ? PILL_ON : PILL_OFF} type="button" onClick={() => setDrill(i)}>
                      {d}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            {/* Automated Pre-Flight Quality Check Drawer */}
            <div className="rounded-xl bg-surface-container-low p-space-md flex flex-col gap-space-sm shadow-sm">
              <div className="flex items-center justify-between pb-1">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-[20px]">
                    fact_check
                  </span>
                  <span className="font-label-caps text-label-caps text-on-surface uppercase">
                    Pre-Flight Twin Ingestion Check
                  </span>
                </div>
                <span className="font-label-caps text-label-caps text-primary bg-primary/10 px-2 py-0.5 rounded">
                  3/3 PASSED
                </span>
              </div>
              {/* Check Item 1: Duration */}
              <div className="flex items-start justify-between p-2 rounded-lg bg-surface-container">
                <div className="flex items-start gap-2">
                  <span className="material-symbols-outlined text-primary text-[20px] mt-0.5">
                    check_circle
                  </span>
                  <div className="flex flex-col">
                    <span className="font-body-md text-body-md text-on-surface font-semibold">
                      Duration: 14.2s
                    </span>
                    <span className="font-body-sm text-body-sm text-on-surface-variant">
                      Optimal range is 5s–30s for pose accuracy
                    </span>
                  </div>
                </div>
                <span className="font-label-caps text-label-caps text-primary px-2 py-0.5 rounded bg-surface-bright">
                  OPTIMAL
                </span>
              </div>
              {/* Check Item 2: Frame Rate */}
              <div className="flex items-start justify-between p-2 rounded-lg bg-surface-container">
                <div className="flex items-start gap-2">
                  <span className="material-symbols-outlined text-primary text-[20px] mt-0.5">
                    check_circle
                  </span>
                  <div className="flex flex-col">
                    <span className="font-body-md text-body-md text-on-surface font-semibold">
                      Frame Rate: 60 FPS
                    </span>
                    <span className="font-body-sm text-body-sm text-on-surface-variant">
                      High-speed motion interpolation enabled
                    </span>
                  </div>
                </div>
                <span className="font-label-caps text-label-caps text-secondary-fixed px-2 py-0.5 rounded bg-surface-bright">
                  HIGH-RES
                </span>
              </div>
              {/* Check Item 3: Athlete Visibility */}
              <div className="flex items-start justify-between p-2 rounded-lg bg-surface-container">
                <div className="flex items-start gap-2">
                  <span className="material-symbols-outlined text-primary text-[20px] mt-0.5">
                    check_circle
                  </span>
                  <div className="flex flex-col">
                    <span className="font-body-md text-body-md text-on-surface font-semibold">
                      Athlete Visibility
                    </span>
                    <span className="font-body-sm text-body-sm text-on-surface-variant">
                      Single athlete detected in primary focus
                    </span>
                  </div>
                </div>
                <span className="font-label-caps text-label-caps text-primary px-2 py-0.5 rounded bg-surface-bright">
                  LOCKED
                </span>
              </div>
              {/* Disclosure info box */}
              <div className="flex items-center gap-space-xs p-2 rounded-lg bg-surface-container-highest/60 text-on-surface-variant font-body-sm text-body-sm mt-1">
                <span className="material-symbols-outlined text-[18px] text-secondary">
                  hub
                </span>
                <span className="leading-tight">
                  Full 33-point biomechanical tracking and ghost trajectory calculations will generate upon submission.
                </span>
              </div>
            </div>
            {/* Submission & Alternative Actions */}
            <div className="flex flex-col gap-space-sm pt-space-xs">
              {/* Main Trigger */}
              <button className="w-full flex items-center justify-center gap-2 py-4 px-space-md rounded-full bg-primary text-on-primary font-headline-md text-headline-md tracking-tight hover:brightness-110 active:scale-[0.98] transition-all shadow-[0_0_24px_rgba(75,226,119,0.35)]" id="uploadAnalyzeBtn" type="button" onClick={upload} disabled={status !== "idle"}>
                {status === "uploading" ? (
                  <>
                    <span className="material-symbols-outlined text-[24px] animate-spin">progress_activity</span>
                    <span>Uploading Telemetry Matrix...</span>
                  </>
                ) : status === "done" ? (
                  <>
                    <span className="material-symbols-outlined text-[24px]">check</span>
                    <span>Synthesizing Shadow Twin!</span>
                  </>
                ) : (
                  <>
                    <span>
                      Upload &amp; Analyze Session
                    </span>
                    <span className="material-symbols-outlined text-[24px]">
                      arrow_forward
                    </span>
                  </>
                )}
              </button>
              {note && (
                <p className="text-center font-label-caps text-label-caps text-tertiary uppercase">
                  {note}
                </p>
              )}
              {/* Live Stream Alternative Switch */}
              <button className="w-full flex items-center justify-center gap-2 py-3 px-space-md rounded-full bg-surface-container hover:bg-surface-bright text-secondary-fixed font-label-badge text-label-badge transition-colors" type="button" onClick={() => router.push(`/capture?sport=${sport}`)}>
                <span className="material-symbols-outlined text-[18px]">
                  photo_camera
                </span>
                <span>
                  Switch to live camera capture
                </span>
              </button>
            </div>
            {/* Motivational Footer Token */}
            <div className="py-space-sm flex items-center justify-center gap-2 text-on-surface-variant font-label-caps text-label-caps opacity-60">
              <span className="material-symbols-outlined text-[16px]">
                lock
              </span>
              <span>
                Encrypted Local Pipeline • Your only opponent is you
              </span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
