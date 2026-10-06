"use client";

// Full-screen guided workout, as a sequence of modules: warm-up → each exercise → cool-down.
// An exercise is done one set at a time (Set 1 → Next → Set 2 → Next → …), then on to the next
// exercise. Finishing marks the workout complete and shows the XP it earned.

import { useEffect, useState } from "react";
import DrillAvatar from "@/components/DrillAvatar";
import { type Drill, type StatusResult, type Workout, setWorkoutStatus, workoutXp } from "@/lib/training";

type Module =
  | { kind: "block"; label: string; minutes: number; activities: string[] }
  | { kind: "exercise"; drill: Drill; number: number; sets: number };

/** One screen of the player: a module, and for exercises which set. */
type Step = { module: number; set: number };

function modulesFor(w: Workout): Module[] {
  const mods: Module[] = [];
  if (w.warmup) mods.push({ kind: "block", label: "Warm-up", minutes: w.warmup.duration_minutes, activities: w.warmup.activities });
  (w.drills ?? []).forEach((d, k) => mods.push({ kind: "exercise", drill: d, number: k + 1, sets: Math.max(1, d.sets ?? 1) }));
  if (w.cooldown) mods.push({ kind: "block", label: "Cool-down", minutes: w.cooldown.duration_minutes, activities: w.cooldown.activities });
  return mods;
}

function stepsFor(mods: Module[]): Step[] {
  return mods.flatMap((m, module) => Array.from({ length: m.kind === "exercise" ? m.sets : 1 }, (_, set) => ({ module, set })));
}

// Rest between sets: off, 5 s or 10 s. A per-device preference.
const REST_OPTIONS = [0, 5, 10];
const REST_KEY = "sa_rest_secs";

function readRest() {
  try {
    const v = Number(localStorage.getItem(REST_KEY));
    return REST_OPTIONS.includes(v) && localStorage.getItem(REST_KEY) !== null ? v : 10;
  } catch {
    return 10;
  }
}

const mmss = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

function Timer({ minutes, resetKey }: { minutes: number; resetKey: string }) {
  const total = Math.max(1, Math.round(minutes * 60));
  const [left, setLeft] = useState(total);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    setLeft(total);
    setRunning(false);
  }, [resetKey, total]);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setLeft((l) => (l <= 1 ? (setRunning(false), 0) : l - 1)), 1000);
    return () => clearInterval(id);
  }, [running]);

  const frac = 1 - left / total;
  return (
    <div className="flex items-center gap-space-sm">
      <div className="relative w-14 h-14 shrink-0">
        <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
          <circle cx="18" cy="18" r="16" fill="none" stroke="currentColor" strokeWidth="3" className="text-surface-container-highest" />
          <circle cx="18" cy="18" r="16" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="text-primary transition-all duration-1000" strokeDasharray={`${frac * 100.5} 100.5`} />
        </svg>
        <button type="button" onClick={() => setRunning((r) => !r)} aria-label={running ? "Pause timer" : "Start timer"} className="absolute inset-0 flex items-center justify-center text-on-surface">
          <span className="material-symbols-outlined text-[24px]">{left === 0 ? "check" : running ? "pause" : "play_arrow"}</span>
        </button>
      </div>
      <div className="flex flex-col">
        <span className="font-headline-md text-headline-md text-on-surface tabular-nums leading-none">{mmss(left)}</span>
        <span className="font-body-sm text-[12px] text-on-surface-variant">{left === 0 ? "Time's up" : running ? "Running" : "Tap to start"}</span>
      </div>
    </div>
  );
}


export default function WorkoutPlayer({ workout, onClose, onCompleted }: { workout: Workout; onClose: () => void; onCompleted: (r: StatusResult) => void }) {
  const [mods] = useState(() => modulesFor(workout));
  const [steps] = useState(() => stepsFor(mods));
  const [i, setI] = useState(0);
  const [restSecs, setRestSecs] = useState(10);
  const [resting, setResting] = useState<number | null>(null);
  const [result, setResult] = useState<StatusResult | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const step = steps[i];
  const mod = mods[step.module];
  const last = i === steps.length - 1;
  const lastOfModule = steps[i + 1]?.module !== step.module;
  const exercises = mods.filter((m) => m.kind === "exercise").length;

  useEffect(() => setRestSecs(readRest()), []);

  useEffect(() => {
    if (resting == null) return;
    if (resting <= 0) return setResting(null);
    const id = setTimeout(() => setResting((r) => (r == null ? null : r - 1)), 1000);
    return () => clearTimeout(id);
  }, [resting]);

  function cycleRest() {
    const v = REST_OPTIONS[(REST_OPTIONS.indexOf(restSecs) + 1) % REST_OPTIONS.length];
    setRestSecs(v);
    try {
      localStorage.setItem(REST_KEY, String(v));
    } catch {
      // Preference just won't persist.
    }
    if (v === 0) setResting(null);
  }

  // Keep the page behind the player from scrolling.
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  async function finish() {
    setSaving(true);
    setError(null);
    try {
      const r = await setWorkoutStatus(workout.id, "complete");
      setResult(r);
      onCompleted(r);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't save the workout");
    } finally {
      setSaving(false);
    }
  }

  function next() {
    if (last) return finish();
    setI(i + 1);
    // Rest after every set of an exercise (not after warm-up / cool-down).
    if (mod.kind === "exercise" && restSecs > 0) setResting(restSecs);
  }

  function back() {
    setResting(null);
    setI(Math.max(0, i - 1));
  }
  const nextLabel = last ? `Finish · +${workoutXp(workout)} XP` : !lastOfModule ? `Next · Set ${step.set + 2}` : mods[step.module + 1]?.kind === "exercise" ? "Next exercise" : "Next";

  if (result) {
    const xp = result.xp ?? 0;
    const level = result.level ?? 1;
    const inLevel = xp - (level - 1) * 1000;
    return (
      <div className="fixed inset-0 z-[100] bg-surface flex flex-col items-center justify-center px-margin-mobile text-center gap-space-md">
        <div className="relative">
          <div className="absolute inset-0 rounded-full bg-primary/20 blur-2xl"></div>
          <DrillAvatar drill="squat jump" size={150} className="relative" />
        </div>
        <span className="font-label-caps text-label-caps text-primary uppercase tracking-widest">Workout complete</span>
        <h2 className="font-headline-md text-headline-md text-on-surface">{workout.title}</h2>
        <span className="font-metric-large text-[44px] leading-none font-bold text-primary tabular-nums">+{result.xp_awarded ?? 0} XP</span>
        <div className="w-full max-w-xs flex flex-col gap-1.5">
          <div className="flex justify-between font-label-caps text-[11px] uppercase text-on-surface-variant">
            <span>Level {level}</span>
            <span className="tabular-nums">{inLevel} / 1000 XP</span>
          </div>
          <div className="h-2 rounded-full bg-surface-container-highest overflow-hidden">
            <div className="h-full rounded-full bg-primary transition-all duration-700" style={{ width: `${Math.min(100, inLevel / 10)}%` }}></div>
          </div>
        </div>
        <button type="button" onClick={onClose} className="mt-space-sm w-full max-w-xs py-3.5 rounded-xl bg-primary text-on-primary font-headline-md text-body-md font-bold">
          Back to training
        </button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] bg-surface flex flex-col pt-safe">
      {/* module progress: one segment per module, filling set by set */}
      <div className="px-margin-mobile pt-space-md">
        <div className="flex items-center gap-space-sm">
          <button type="button" onClick={onClose} aria-label="Exit workout" className="w-9 h-9 -ml-1 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-container">
            <span className="material-symbols-outlined">close</span>
          </button>
          <div className="flex-1 flex gap-1">
            {mods.map((m, k) => {
              const n = m.kind === "exercise" ? m.sets : 1;
              const fill = k < step.module ? 1 : k === step.module ? step.set / n : 0;
              return (
                <div key={k} className={`h-1.5 flex-1 rounded-full overflow-hidden ${k === step.module ? "bg-primary/25" : "bg-surface-container-highest"}`}>
                  <div className="h-full bg-primary transition-all duration-300" style={{ width: `${fill * 100}%` }}></div>
                </div>
              );
            })}
          </div>
          <button
            type="button"
            onClick={cycleRest}
            aria-label={`Rest between sets: ${restSecs ? `${restSecs} seconds` : "off"}. Tap to change.`}
            className={`flex items-center gap-1 pl-2 pr-2.5 py-1 rounded-full font-label-caps text-[11px] uppercase tabular-nums ${restSecs ? "bg-primary/15 text-primary" : "bg-surface-container-high text-on-surface-variant"}`}
          >
            <span className="material-symbols-outlined text-[16px]">{restSecs ? "timer" : "timer_off"}</span>
            {restSecs ? `Rest ${restSecs}s` : "No rest"}
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-margin-mobile py-space-md flex flex-col gap-space-md">
        <div className="rounded-2xl bg-surface-container flex items-center justify-center py-space-sm">
          <DrillAvatar drill={mod.kind === "exercise" ? `${mod.drill.id} ${mod.drill.name}` : mod.activities.join(" ")} size={190} />
        </div>

        {mod.kind === "block" ? (
          <>
            <div className="flex flex-col gap-1">
              <span className="font-label-caps text-label-caps text-primary uppercase tracking-widest">{mod.label}</span>
              <h2 className="font-headline-md text-headline-md text-on-surface">{mod.minutes} minutes</h2>
            </div>
            <ul className="flex flex-col gap-1.5">
              {mod.activities.map((a) => (
                <li key={a} className="flex items-center gap-2 font-body-md text-body-md text-on-surface">
                  <span className="material-symbols-outlined text-[18px] text-primary">check_small</span>
                  {a}
                </li>
              ))}
            </ul>
            <Timer minutes={mod.minutes} resetKey={String(i)} />
          </>
        ) : (
          <>
            <div className="flex flex-col gap-1">
              <span className="font-label-caps text-label-caps text-primary uppercase tracking-widest">
                Exercise {mod.number} of {exercises}
              </span>
              <h2 className="font-headline-md text-headline-md text-on-surface leading-tight">{mod.drill.name}</h2>
              {mod.drill.description && <p className="font-body-sm text-body-sm text-on-surface-variant leading-snug">{mod.drill.description}</p>}
            </div>

            {/* the exercise's sets as modules: done → current → upcoming */}
            <ol className="flex flex-col gap-2">
              {Array.from({ length: mod.sets }, (_, k) => {
                const done = k < step.set;
                const now = k === step.set;
                return (
                  <li
                    key={k}
                    aria-current={now ? "step" : undefined}
                    className={`rounded-xl flex items-center gap-space-sm px-space-md transition-all ${
                      now ? "py-space-md bg-surface-container-high ring-2 ring-primary" : done ? "py-2.5 bg-surface-container" : "py-2.5 bg-surface-container opacity-60"
                    }`}
                  >
                    <span className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 font-headline-md text-body-sm ${done ? "bg-primary text-on-primary" : now ? "bg-primary/15 text-primary" : "bg-surface-container-highest text-outline"}`}>
                      {done ? <span className="material-symbols-outlined text-[18px]">check</span> : k + 1}
                    </span>
                    <div className="flex-1 flex flex-col">
                      <span className={`font-headline-md ${now ? "text-body-lg text-on-surface" : "text-body-md text-on-surface-variant"}`}>Set {k + 1}</span>
                      {now && <span className="font-body-sm text-[12px] text-on-surface-variant">{mod.drill.reps ? `Do ${mod.drill.reps} reps, then tap Next` : "Complete the set, then tap Next"}</span>}
                    </div>
                    {mod.drill.reps ? (
                      <span className={`font-metric-large tabular-nums ${now ? "text-headline-md text-primary" : "text-body-md text-outline"}`}>
                        {mod.drill.reps}
                        <span className="font-label-caps text-[10px] uppercase ml-0.5">reps</span>
                      </span>
                    ) : null}
                  </li>
                );
              })}
            </ol>
            {mod.drill.duration_minutes ? <Timer minutes={mod.drill.duration_minutes / mod.sets} resetKey={String(i)} /> : null}
          </>
        )}
        {error && <p className="font-body-sm text-body-sm text-tertiary">{error}</p>}
      </div>

      {resting != null && (
        <div className="absolute inset-0 z-10 bg-surface/95 backdrop-blur-sm flex flex-col items-center justify-center gap-space-md px-margin-mobile text-center" role="timer" aria-live="polite">
          <span className="font-label-caps text-label-caps text-secondary-container uppercase tracking-widest">Rest</span>
          <div className="relative w-40 h-40">
            <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
              <circle cx="18" cy="18" r="16" fill="none" stroke="currentColor" strokeWidth="2" className="text-surface-container-highest" />
              <circle cx="18" cy="18" r="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-secondary-container transition-all duration-1000 ease-linear" strokeDasharray={`${(resting / restSecs) * 100.5} 100.5`} />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center font-metric-large text-[56px] leading-none text-on-surface tabular-nums">{resting}</span>
          </div>
          <span className="font-body-md text-body-md text-on-surface-variant">
            Up next: {mod.kind === "exercise" ? `${mod.drill.name} · Set ${step.set + 1}` : mod.label}
          </span>
          <button type="button" onClick={() => setResting(null)} className="px-space-lg py-3 rounded-xl bg-surface-container-high text-on-surface font-headline-md text-body-md flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[20px]">skip_next</span>
            Skip rest
          </button>
        </div>
      )}

      <div className="px-margin-mobile pt-space-sm grid grid-cols-[auto_1fr] gap-2 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
        <button type="button" onClick={back} disabled={i === 0} aria-label="Previous step" className="w-14 py-3.5 rounded-xl bg-surface-container-high text-on-surface flex items-center justify-center disabled:opacity-40">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <button type="button" onClick={next} disabled={saving} className="py-3.5 rounded-xl bg-primary text-on-primary font-headline-md text-body-md font-bold flex items-center justify-center gap-2 disabled:opacity-70">
          {saving ? <span className="material-symbols-outlined text-[20px] animate-spin">progress_activity</span> : null}
          {nextLabel}
          {!last && <span className="material-symbols-outlined text-[20px]">arrow_forward</span>}
        </button>
      </div>
    </div>
  );
}
