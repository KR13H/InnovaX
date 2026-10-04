"use client";

// "Your shadow is learning": shown while a session is analyzed (live mode, ?session=ID&sport=…)
// and at the end of onboarding (no session). Deliberately minimal: what's happening, how long,
// and the result — with the athlete's own pose tracking replayed on a dark canvas.

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import SkeletonReplay from "@/components/SkeletonReplay";
import { analyzeSession } from "@/lib/analysis";
import { getToken } from "@/lib/api";
import { DRILL_LABEL, type Sport, getStagedClip, sportFromQuery } from "@/lib/clip";
import { SPORT_ICON } from "@/lib/data";

type Phase = "running" | "done" | "failed";

function Step({ label, state }: { label: string; state: "done" | "active" | "waiting" | "failed" }) {
  return (
    <div className="flex items-center gap-space-sm py-2">
      {state === "done" ? (
        <span className="material-symbols-outlined text-[20px] text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
      ) : state === "active" ? (
        <span className="material-symbols-outlined text-[20px] text-secondary animate-spin" style={{ animationDuration: "2s" }}>progress_activity</span>
      ) : state === "failed" ? (
        <span className="material-symbols-outlined text-[20px] text-tertiary">error</span>
      ) : (
        <span className="w-5 h-5 rounded-full border-2 border-surface-container-highest"></span>
      )}
      <span className={`font-body-md text-body-md ${state === "waiting" ? "text-outline" : "text-on-surface"}`}>{label}</span>
    </div>
  );
}

export default function ShadowLoading() {
  const router = useRouter();
  const [live, setLive] = useState<{ id: number; sport: Sport } | null>(null);
  const [phase, setPhase] = useState<Phase>("running");
  const [result, setResult] = useState<string | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [clipUrl, setClipUrl] = useState<string | null>(null);

  // Live mode: run the real analyzer for the uploaded session.
  useEffect(() => {
    const id = Number(new URLSearchParams(window.location.search).get("session"));
    if (!id) {
      // Onboarding: nothing to analyze yet, just a short calibration beat.
      const t = setTimeout(() => setPhase("done"), 3500);
      return () => clearTimeout(t);
    }
    const sport = sportFromQuery();
    setLive({ id, sport });
    analyzeSession(sport, id).then(
      (text) => {
        setResult(text);
        setPhase("done");
        setTimeout(() => router.replace(`/sessions/${id}`), 1800);
      },
      (err) => {
        setResult(err instanceof Error ? err.message : "Analysis failed");
        setPhase("failed");
      },
    );
  }, [router]);

  // The clip that feeds the skeleton replay: the one just uploaded, or fetched from the server.
  useEffect(() => {
    if (!live) return;
    const staged = getStagedClip();
    if (staged) return setClipUrl(staged.url);
    let url: string | null = null;
    fetch(`/api/sessions/${live.id}/video`, { headers: { Authorization: `Bearer ${getToken()}` } })
      .then((r) => (r.ok ? r.blob() : null))
      .then((b) => b && setClipUrl((url = URL.createObjectURL(b))))
      .catch(() => {});
    return () => {
      if (url) URL.revokeObjectURL(url);
    };
  }, [live]);

  useEffect(() => {
    if (phase !== "running") return;
    const t = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(t);
  }, [phase]);

  const timer = `${Math.floor(elapsed / 60)}:${String(elapsed % 60).padStart(2, "0")}`;
  const analyzeState = phase === "done" ? "done" : phase === "failed" ? "failed" : "active";

  return (
    <div className="bg-surface text-on-surface font-body-md text-body-md min-h-screen flex flex-col antialiased">
      <header className="fixed top-0 inset-x-0 z-50 bg-surface/85 backdrop-blur-xl pt-safe">
        <div className="h-16 px-space-xs flex items-center justify-between">
          <button aria-label="Back" onClick={() => router.back()} className="w-11 h-11 flex items-center justify-center text-on-surface-variant hover:text-on-surface" type="button">
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <button aria-label="Close" onClick={() => router.push(live ? "/sessions" : "/home")} className="w-11 h-11 flex items-center justify-center text-on-surface-variant hover:text-on-surface" type="button">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
      </header>

      <main className="flex flex-col w-full pt-20 pb-space-xl px-margin-mobile gap-space-lg">
        <div className="flex flex-col gap-1">
          <h1 className="font-headline-xl-mobile text-headline-xl-mobile text-on-surface tracking-tight">
            {phase === "done" ? "Your shadow is ready" : phase === "failed" ? "Analysis stopped" : (
              <>
                Your shadow is <span className="text-secondary">learning</span>
              </>
            )}
          </h1>
          {live && (
            <span className="flex items-center gap-1.5 font-body-sm text-body-sm text-on-surface-variant">
              <span className="material-symbols-outlined text-[16px] text-primary">{SPORT_ICON[live.sport]}</span>
              {DRILL_LABEL[live.sport]} • Session #{live.id}
            </span>
          )}
        </div>

        <SkeletonReplay src={clipUrl} label={live ? "Loading your clip" : "Building your twin"} />

        <section className="rounded-xl bg-surface-container px-space-md py-space-sm flex flex-col">
          {live ? (
            <>
              <Step label="Clip uploaded" state="done" />
              <Step label={phase === "running" ? `Analyzing technique · ${timer}` : "Technique analyzed"} state={analyzeState} />
              <Step label="Results ready" state={phase === "done" ? "done" : phase === "failed" ? "failed" : "waiting"} />
            </>
          ) : (
            <>
              <Step label="Profile saved" state="done" />
              <Step label="Sports linked" state="done" />
              <Step label="Twin calibrated" state={phase === "done" ? "done" : "active"} />
            </>
          )}
        </section>

        {phase === "running" && live && (
          <p className="font-body-sm text-body-sm text-outline text-center">
            You can leave this screen — results will appear in Sessions.
          </p>
        )}

        {result && (
          <p className={`font-body-md text-body-md text-center ${phase === "failed" ? "text-tertiary" : "text-on-surface-variant"}`}>{result}</p>
        )}

        {phase !== "running" && (
          <button
            type="button"
            onClick={() => router.push(live ? (phase === "done" ? `/sessions/${live.id}` : "/sessions") : "/onboarding/reveal")}
            className="w-full h-14 rounded-xl bg-primary text-on-primary font-headline-md text-body-md font-bold flex items-center justify-center gap-2 shadow-[0_0_24px_-4px_rgba(34,197,94,0.45)] active:scale-[0.98] transition-transform"
          >
            {live ? (phase === "done" ? "View results" : "Back to sessions") : "Meet your twin"}
            <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
          </button>
        )}
      </main>
    </div>
  );
}
