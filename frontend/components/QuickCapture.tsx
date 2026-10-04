"use client";

// Floating "new session" button + bottom sheet: pick a sport, then record or upload.
// Two taps from any tab to get a clip into the review → analysis flow.

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { type Sport, stageClip } from "@/lib/clip";
import { SPORT_ICON, SPORT_NAME } from "@/lib/data";
import { readDraft } from "@/lib/onboarding";

const SPORTS: Sport[] = ["tennis", "cricket", "basketball", "running"];

export default function QuickCapture() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [sport, setSport] = useState<Sport>("tennis");
  const fileInput = useRef<HTMLInputElement>(null);
  const cameraInput = useRef<HTMLInputElement>(null);

  // Default to the primary sport picked during onboarding.
  useEffect(() => {
    const primary = readDraft().sports?.[0];
    if (primary && SPORTS.includes(primary as Sport)) setSport(primary as Sport);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    stageClip(file, sport);
    setOpen(false);
    router.push(`/capture/review?sport=${sport}`);
  }

  return (
    <>
      <button
        type="button"
        aria-label="New session"
        onClick={() => setOpen(true)}
        className="fixed right-4 z-50 w-14 h-14 rounded-full bg-primary text-on-primary flex items-center justify-center shadow-[0_0_28px_-2px_rgba(34,197,94,0.6)] active:scale-95 transition-transform"
        style={{ bottom: "calc(5rem + env(safe-area-inset-bottom, 0px))" }}
      >
        <span className="material-symbols-outlined text-[28px]">videocam</span>
      </button>

      {open && (
        <div className="fixed inset-0 z-[60] flex flex-col justify-end" role="dialog" aria-modal="true" aria-label="Start a session">
          <button type="button" aria-label="Close" className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setOpen(false)}></button>
          <div className="relative rounded-t-2xl bg-surface-container-low px-margin-mobile pt-3 pb-safe shadow-[0_-12px_40px_rgba(0,0,0,0.6)]">
            <div className="mx-auto w-10 h-1 rounded-full bg-surface-container-highest mb-space-md"></div>
            <span className="font-label-caps text-label-caps text-primary uppercase tracking-widest">New session</span>
            <h2 className="font-headline-md text-headline-md text-on-surface mb-space-md">What are you training?</h2>

            <div className="grid grid-cols-4 gap-2 mb-space-md">
              {SPORTS.map((s) => {
                const on = s === sport;
                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSport(s)}
                    aria-pressed={on}
                    className={`flex flex-col items-center gap-1 py-2.5 rounded-xl transition-colors ${on ? "bg-surface-container-highest text-primary shadow-[0_0_14px_rgba(75,226,119,0.2)]" : "bg-surface-container text-on-surface-variant"}`}
                  >
                    <span className="material-symbols-outlined text-[24px]">{SPORT_ICON[s]}</span>
                    <span className="font-label-caps text-[10px] uppercase">{SPORT_NAME[s]}</span>
                  </button>
                );
              })}
            </div>

            <div className="grid grid-cols-2 gap-2 mb-space-md">
              <button
                type="button"
                onClick={() => {
                  // In-page camera needs HTTPS; otherwise open the phone's camera app directly.
                  if (!window.isSecureContext || !navigator.mediaDevices?.getUserMedia) return cameraInput.current?.click();
                  setOpen(false);
                  router.push(`/capture?sport=${sport}`);
                }}
                className="flex flex-col items-start gap-2 p-space-md rounded-xl bg-primary text-on-primary active:scale-[0.98] transition-transform"
              >
                <span className="material-symbols-outlined text-[26px]">videocam</span>
                <span className="font-headline-md text-body-md font-bold">Record</span>
                <span className="font-body-sm text-[12px] opacity-80 text-left">Use your camera with the framing guide</span>
              </button>
              <button
                type="button"
                onClick={() => fileInput.current?.click()}
                className="flex flex-col items-start gap-2 p-space-md rounded-xl bg-surface-container-high text-on-surface active:scale-[0.98] transition-transform"
              >
                <span className="material-symbols-outlined text-[26px] text-secondary">video_library</span>
                <span className="font-headline-md text-body-md font-bold">Upload</span>
                <span className="font-body-sm text-[12px] text-on-surface-variant text-left">Pick a clip from your gallery</span>
              </button>
            </div>
            <p className="font-body-sm text-[12px] text-outline text-center pb-space-md">Film side-on with your whole body in frame for the best tracking.</p>
            <input ref={fileInput} type="file" accept="video/*" className="hidden" onChange={onFile} />
            <input ref={cameraInput} type="file" accept="video/*" capture="environment" className="hidden" onChange={onFile} />
          </div>
        </div>
      )}
    </>
  );
}
