"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { type Sport, type StagedClip, getStagedClip, sportFromQuery } from "@/lib/clip";
import { submitClip } from "@/lib/upload";
import PoseVideo from "@/components/PoseVideo";

const SPORT_TAG: Record<Sport, string> = {
  tennis: "TENNIS • FOREHAND DRILL",
  cricket: "CRICKET • FAST BOWLING",
  basketball: "BASKETBALL • JUMP SHOT",
  running: "RUNNING • SPRINT DRILL",
};
const SPORT_ORDER: Sport[] = ["tennis", "cricket", "basketball", "running"];
const DEMO_DURATION = 14.2; // length of the Stitch sample clip

const stamp = (sec: number) => `00:${sec.toFixed(1).padStart(4, "0")}`;

// Generated from design/stitch/mobile_video_review_submission/code.html by scripts/stitch-to-jsx.mjs.
export default function VideoReview() {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const titleRef = useRef<HTMLInputElement>(null);
  const [clip, setClip] = useState<StagedClip | null>(null);
  const [sport, setSport] = useState<Sport>("tennis");
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [progress, setProgress] = useState<number | null>(null); // null = Stitch's initial 1/3 position
  const [duration, setDuration] = useState(DEMO_DURATION);
  const [status, setStatus] = useState<"idle" | "uploading" | "done">("idle");
  const [note, setNote] = useState<string | null>(null);

  const [clipMeta, setClipMeta] = useState<{ duration: number; width: number; height: number } | null>(null);

  useEffect(() => {
    const staged = getStagedClip();
    setClip(staged);
    setSport(staged?.sport ?? sportFromQuery());
    if (!staged) return;
    // Read the real clip's length and resolution for the stats row.
    const probe = document.createElement("video");
    probe.preload = "metadata";
    probe.onloadedmetadata = () => setClipMeta({ duration: probe.duration, width: probe.videoWidth, height: probe.videoHeight });
    probe.src = staged.url;
  }, []);

  function togglePlay() {
    const v = videoRef.current;
    if (v) v.paused ? v.play() : v.pause();
    else setPlaying((p) => !p);
  }

  function seek(e: React.MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
    setProgress(pct);
    if (videoRef.current) videoRef.current.currentTime = (pct / 100) * duration;
  }

  async function submit() {
    setStatus("uploading");
    const result = clip ? await submitClip(clip, sport) : { ok: false as const, reason: "Demo clip — record or upload a video to save it" };
    setNote(result.ok ? null : result.reason);
    setStatus("done");
    // With a stored session the analysis screen runs the real analyzer; otherwise it plays the demo.
    const next = result.ok ? `/onboarding/analyzing?session=${result.sessionId}&sport=${sport}` : "/onboarding/analyzing";
    setTimeout(() => router.push(next), result.ok ? 900 : 2200);
  }

  const shownPct = progress ?? 33.3;

  return (
    <div className="bg-surface font-body-md text-on-surface flex flex-col min-h-screen">
      <header className="fixed top-0 w-full z-50 pt-safe bg-surface/85 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.35)]">
        <div className="h-16 px-margin-mobile flex items-center justify-between gap-space-sm">
          <div className="flex items-center gap-space-xs min-w-0">
            <button aria-label="Navigate back" className="w-11 h-11 flex items-center justify-center text-on-surface hover:text-primary transition-colors min-h-[44px] min-w-[44px] -ml-2" onClick={() => router.back()}>
              <span className="material-symbols-outlined text-[24px]">
                arrow_back_ios_new
              </span>
            </button>
            <div className="flex flex-col min-w-0">
              <span className="font-headline-md text-headline-md font-bold tracking-tight text-on-surface truncate">
                Video Review
              </span>
              <span className="font-label-caps text-label-caps uppercase text-secondary tracking-widest truncate">
                ShadowAthlete Flow
              </span>
            </div>
          </div>
          <div className="flex items-center gap-space-xs flex-shrink-0">
            <button aria-label="Digital Twin Status" className="flex items-center gap-space-xs px-space-sm py-1.5 rounded-full bg-surface-container-high/90 shadow-[0_0_12px_rgba(0,238,252,0.25)] min-h-[44px] min-w-[44px] justify-center hover:bg-surface-container-highest transition-colors">
              <span className="w-2 h-2 rounded-full bg-secondary-fixed-dim animate-pulse"></span>
              <span className="font-label-caps text-label-caps uppercase text-secondary-fixed-dim tracking-wider hidden sm:inline">
                TWIN
              </span>
              <span className="material-symbols-outlined text-secondary-fixed-dim text-[18px]">
                neurology
              </span>
            </button>
            <button aria-label="More options" className="w-11 h-11 flex items-center justify-center text-on-surface-variant hover:text-on-surface transition-colors min-h-[44px] min-w-[44px]">
              <span className="material-symbols-outlined text-[22px]">
                more_vert
              </span>
            </button>
          </div>
        </div>
      </header>
      <main className="flex flex-col relative w-full pt-16 pb-safe bg-surface flex-1">
        <div className="flex flex-col w-full px-margin-mobile pb-space-xl gap-space-md">
          {/* Real clip: play it with live pose tracking. Otherwise the Stitch demo preview. */}
          {clip ? (
            <PoseVideo src={clip.url} maxHeight="56vh" autoPlay />
          ) : (
            <>
          {/* Interactive Video Telemetry Preview Frame */}
          <section className="relative w-full rounded-xl overflow-hidden bg-surface-container-lowest shadow-xl flex flex-col group select-none">
            {/* Video Canvas Container */}
            <div className="relative w-full aspect-[4/5] bg-surface-container-low overflow-hidden flex items-center justify-center" id="videoContainer">
              {/* Video Poster Placeholder */}
              <img className="absolute inset-0 w-full h-full object-cover opacity-90 transition-transform duration-500 ease-out" data-alt="Athletic tennis player completing dynamic forehand baseline swing on modern hardcourt, captured in dramatic low-key cinematic lighting with subtle cyan motion lines tracing racket trajectory, professional sports biomechanics recording" id="previewPoster" src="https://lh3.googleusercontent.com/aida-public/AB6AXuC9OOI6puYekRPE7UkyqgzJN7WMZZAICrBP4y4KrOqfuZmxBfBB-W5RWYbtmKMHqTqv2fI9DRv5LtexqJrsgdoWzcq8Rm22RxT1mB5PbNcTc2rsWKIFO-uhVglLwzb8ldE0ZIpxGTPTlyMIhrTZw2OQnZRlGDyx00cwqJyoTK6Y0phvwV7TeUilMDn582zt7wzI06miHzA1E4rRC_Qe3y7r2XMChuyfVh5k0X407puytpb1_ZB5yzY1" />
              {/* Digital Twin Skeletal Ghost Track Overlay */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-80" fill="none" viewBox="0 0 320 400">
                {/* Racket path trajectory ghosting */}
                <path className="opacity-60" d="M 60 280 C 90 320, 190 260, 240 140 C 260 90, 280 80, 290 85" stroke="#00eefc" strokeDasharray="4 4" strokeWidth="2"></path>
                {/* Biomechanical Tracking Nodes */}
                <circle cx="160" cy="110" fill="#4be277" r="4"></circle>
                <circle cx="140" cy="150" fill="#00eefc" r="3.5"></circle>
                <circle cx="195" cy="145" fill="#00eefc" r="3.5"></circle>
                <circle cx="215" cy="185" fill="#4be277" r="3.5"></circle>
                <circle cx="240" cy="140" fill="#4be277" r="4.5"></circle>
                <line stroke="#00eefc" strokeOpacity="0.4" strokeWidth="1.5" x1="160" x2="140" y1="110" y2="150"></line>
                <line stroke="#00eefc" strokeOpacity="0.4" strokeWidth="1.5" x1="160" x2="195" y1="110" y2="145"></line>
                <line stroke="#4be277" strokeOpacity="0.6" strokeWidth="1.5" x1="195" x2="215" y1="145" y2="185"></line>
                <line stroke="#4be277" strokeOpacity="0.8" strokeWidth="2" x1="215" x2="240" y1="185" y2="140"></line>
              </svg>
              {/* Center Play/Pause Kinetic Ripple Trigger */}
              <button aria-label="Play/Pause clip" className={`${playing ? "opacity-50 " : ""}relative z-10 w-16 h-16 rounded-full bg-surface-container-high/80 backdrop-blur-md flex items-center justify-center text-primary active:scale-95 transition-all duration-200 shadow-[0_0_24px_rgba(34,197,94,0.3)]`} id="playBtn" onClick={togglePlay}>
                <span className="material-symbols-outlined text-[34px] ml-0.5" id="playIcon" style={{ fontVariationSettings: "'FILL' 1" }}>
                  {playing ? "pause" : "play_arrow"}
                </span>
              </button>
              {/* Live Ghost Sync Indicator Chip */}
              <div className="absolute top-space-sm left-space-sm z-10 flex items-center gap-space-xs px-2.5 py-1 rounded-full bg-surface-container-lowest/80 backdrop-blur-md shadow-md">
                <span className="w-1.5 h-1.5 rounded-full bg-secondary-fixed-dim animate-pulse"></span>
                <span className="font-label-caps text-label-caps text-secondary uppercase tracking-wider">
                  TRACKING READY
                </span>
              </div>
              {/* Quick Fullscreen & Audio Actions */}
              <div className="absolute top-space-sm right-space-sm z-10 flex items-center gap-space-xs">
                <button aria-label="Toggle mute" className="w-11 h-11 rounded-full bg-surface-container-lowest/75 backdrop-blur-md flex items-center justify-center text-on-surface hover:text-primary transition-colors" id="muteBtn" onClick={() => setMuted((m) => !m)}>
                  <span className="material-symbols-outlined text-[20px]" id="muteIcon">
                    {muted ? "volume_off" : "volume_up"}
                  </span>
                </button>
                <button aria-label="View Fullscreen" className="w-11 h-11 rounded-full bg-surface-container-lowest/75 backdrop-blur-md flex items-center justify-center text-on-surface hover:text-primary transition-colors" id="expandBtn" onClick={() => (videoRef.current ?? document.getElementById("videoContainer"))?.requestFullscreen?.()}>
                  <span className="material-symbols-outlined text-[20px]">
                    fullscreen
                  </span>
                </button>
              </div>
              {/* Scrubber Overlay Bar */}
              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-surface-container-lowest via-surface-container-lowest/70 to-transparent p-space-sm flex flex-col gap-1.5 pt-6 z-10">
                {/* Interactive Scrubber Rail */}
                <div className="relative w-full h-2 bg-surface-container-highest rounded-full cursor-pointer flex items-center" id="scrubBar" onClick={seek}>
                  {/* Buffered ghost preview */}
                  <div className="absolute left-0 h-full rounded-full bg-secondary/30 w-3/4"></div>
                  {/* Current Position Progress */}
                  <div className="relative h-full rounded-full bg-primary-container shadow-[0_0_8px_rgba(34,197,94,0.6)] w-1/3 flex items-center justify-end" id="scrubProgress" style={progress === null ? undefined : { width: `${shownPct}%` }}>
                    <span className="w-3.5 h-3.5 bg-primary-fixed rounded-full shadow-[0_0_10px_rgba(107,255,143,0.9)] transform translate-x-1.5"></span>
                  </div>
                </div>
                {/* Telemetry Time Stamps */}
                <div className="flex items-center justify-between text-on-surface-variant font-label-caps text-label-caps tracking-widest pt-0.5">
                  <span className="text-primary font-bold" id="timeCurrent">
                    {progress === null ? "00:04.7" : stamp((shownPct / 100) * duration)}
                  </span>
                  <span className="text-on-surface-variant/70">
                    {stamp(duration)}
                  </span>
                </div>
              </div>
            </div>
          </section>
            </>
          )}
          {/* Session Details Card */}
          <section className="w-full bg-surface-container rounded-xl p-space-md shadow-md flex flex-col gap-space-md">
            {/* Sport Tag & Category Switcher */}
            <div className="flex items-center justify-between gap-space-sm">
              <div className="flex items-center gap-space-xs">
                <span className="px-2.5 py-1 rounded-full bg-surface-container-highest text-secondary font-label-caps text-label-caps tracking-wider flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
                  {" "}{SPORT_TAG[sport]}
                </span>
              </div>
              <button type="button" onClick={() => setSport((s) => SPORT_ORDER[(SPORT_ORDER.indexOf(s) + 1) % SPORT_ORDER.length])} className="flex items-center gap-1 text-on-surface-variant hover:text-primary transition-colors text-body-sm font-body-sm py-1 px-2 rounded-lg hover:bg-surface-container-high">
                <span>
                  Change
                </span>
                <span className="material-symbols-outlined text-[16px]">
                  expand_more
                </span>
              </button>
            </div>
            {/* Editable Session Title Input Box */}
            <div className="flex flex-col gap-1">
              <label className="font-label-caps text-label-caps uppercase text-on-surface-variant tracking-wider" htmlFor="sessionTitle">
                Session Title
              </label>
              <div className="relative flex items-center w-full">
                <input className="w-full bg-surface-container-low text-on-surface font-headline-md text-headline-md font-semibold px-space-sm py-2 rounded-lg outline-none focus:bg-surface-container-lowest transition-colors pr-10" id="sessionTitle" ref={titleRef} type="text" defaultValue="Morning Baseline Forehand Drive" />
                <button aria-label="Edit title" type="button" onClick={() => titleRef.current?.select()} className="absolute right-2 text-on-surface-variant hover:text-primary transition-colors w-8 h-8 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[18px]">
                    edit
                  </span>
                </button>
              </div>
            </div>
            {/* Technical Specs Telemetry Pill Stream */}
            <div className="grid grid-cols-3 gap-space-xs bg-surface-container-low p-2 rounded-lg">
              <div className="flex flex-col items-center justify-center p-1 text-center">
                <span className="font-label-caps text-label-caps uppercase text-on-surface-variant">
                  DURATION
                </span>
                <span className="font-headline-md text-headline-md text-on-surface font-bold">
                  {clipMeta ? `${clipMeta.duration.toFixed(1)}s` : "14.2s"}
                </span>
              </div>
              <div className="flex flex-col items-center justify-center p-1 text-center bg-surface-container-high/40 rounded">
                <span className="font-label-caps text-label-caps uppercase text-on-surface-variant">
                  RESOLUTION
                </span>
                <span className="font-headline-md text-headline-md text-secondary font-bold">
                  {clipMeta ? `${Math.min(clipMeta.width, clipMeta.height)}p` : "1080p"}
                  <span className="font-body-sm text-body-sm font-normal text-on-surface-variant">
                    {clipMeta ? (clipMeta.height > clipMeta.width ? "/9:16" : "/16:9") : "/60"}
                  </span>
                </span>
              </div>
              <div className="flex flex-col items-center justify-center p-1 text-center">
                <span className="font-label-caps text-label-caps uppercase text-on-surface-variant">
                  CLIP SIZE
                </span>
                <span className="font-headline-md text-headline-md text-on-surface font-bold">
                  {clip ? `${(clip.blob.size / 1e6).toFixed(1)} MB` : "34 MB"}
                </span>
              </div>
            </div>
            {/* Athlete Quality & Framing Diagnostic Matrix */}
            <div className="flex flex-col gap-space-xs pt-1">
              <div className="flex items-center justify-between pb-1">
                <span className="font-label-caps text-label-caps uppercase tracking-wider text-on-surface-variant">
                  Kinematic Quality Check
                </span>
                <span className="font-label-badge text-label-badge text-primary-fixed-dim bg-primary-container/20 px-2 py-0.5 rounded-full flex items-center gap-1 font-semibold">
                  <span className="material-symbols-outlined text-[14px]">
                    verified
                  </span>
                  {" "}Optimal
                </span>
              </div>
              <div className="flex flex-col gap-1.5">
                {/* Checklist 1 */}
                <div className="flex items-center justify-between px-space-sm py-2 rounded-lg bg-surface-container-low text-body-sm font-body-sm">
                  <div className="flex items-center gap-space-xs">
                    <span className="material-symbols-outlined text-primary text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                      check_circle
                    </span>
                    <span className="text-on-surface">
                      Full kinetic chain in frame
                    </span>
                  </div>
                  <span className="font-label-caps text-label-caps text-on-surface-variant">
                    100% VISIBLE
                  </span>
                </div>
                {/* Checklist 2 */}
                <div className="flex items-center justify-between px-space-sm py-2 rounded-lg bg-surface-container-low text-body-sm font-body-sm">
                  <div className="flex items-center gap-space-xs">
                    <span className="material-symbols-outlined text-primary text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                      check_circle
                    </span>
                    <span className="text-on-surface">
                      High court contrast &amp; court lighting
                    </span>
                  </div>
                  <span className="font-label-caps text-label-caps text-on-surface-variant">
                    EV 8.4 BALANCED
                  </span>
                </div>
                {/* Checklist 3 */}
                <div className="flex items-center justify-between px-space-sm py-2 rounded-lg bg-surface-container-low text-body-sm font-body-sm">
                  <div className="flex items-center gap-space-xs">
                    <span className="material-symbols-outlined text-primary text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                      check_circle
                    </span>
                    <span className="text-on-surface">
                      Stable camera trajectory
                    </span>
                  </div>
                  <span className="font-label-caps text-label-caps text-on-surface-variant">
                    NO JITTER
                  </span>
                </div>
              </div>
            </div>
          </section>
          {/* Framing Notice Card */}
          <aside className="flex items-start gap-space-sm p-space-md rounded-xl bg-surface-container-high shadow-sm">
            <div className="p-2 rounded-lg bg-secondary-container/10 text-secondary-fixed-dim flex-shrink-0">
              <span className="material-symbols-outlined text-[24px]">
                model_training
              </span>
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="font-headline-md text-body-md font-semibold text-on-surface">
                AI Twin Synchronization
              </span>
              <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
                Your video will be sent to the AI engine for movement tracking and digital twin comparison. Analysis takes 1–2 minutes in the background.
              </p>
            </div>
          </aside>
          {note && (
            <p className="w-full text-center font-label-caps text-label-caps text-tertiary uppercase">
              {note}
            </p>
          )}
          {/* Bottom Interactive Primary & Secondary CTA Controls */}
          <div className="w-full flex items-center gap-space-sm pt-space-xs">
            {/* Secondary Retake Action */}
            <button className="flex-1 min-h-[52px] px-space-md rounded-xl bg-surface-container-highest hover:bg-surface-bright active:scale-95 text-on-surface font-headline-md text-body-md font-semibold flex items-center justify-center gap-2 transition-all" onClick={() => router.push(clip?.name.includes("capture") ? `/capture?sport=${sport}` : `/capture/upload?sport=${sport}`)} type="button">
              <span className="material-symbols-outlined text-[20px]">
                replay
              </span>
              <span>
                Retake Clip
              </span>
            </button>
            {/* Primary Electric Lime Submission Trigger */}
            <button className="flex-[1.5] min-h-[52px] px-space-md rounded-xl bg-primary-container hover:bg-primary-fixed active:scale-95 text-on-primary font-headline-md text-body-md font-bold tracking-tight flex items-center justify-center gap-2 shadow-[0_0_24px_-2px_rgba(34,197,94,0.45)] transition-all" id="submitActionBtn" type="button" onClick={submit} disabled={status !== "idle"}>
              {status === "uploading" ? (
                <>
                  <span className="w-5 h-5 rounded-full border-2 border-on-primary border-t-transparent animate-spin"></span>
                  <span>Uploading Telemetry...</span>
                </>
              ) : status === "done" ? (
                <>
                  <span className="material-symbols-outlined text-[22px]">check</span>
                  <span>{note ? "Queued for Analysis" : "Synced to AI Engine"}</span>
                </>
              ) : (
                <>
                  <span>
                    Submit for Analysis
                  </span>
                  <span className="material-symbols-outlined text-[22px]">
                    arrow_forward
                  </span>
                </>
              )}
            </button>
          </div>
        </div>
        {/* Interactive Ergonomics Micro-Behavior Script */}
      </main>
    </div>
  );
}
