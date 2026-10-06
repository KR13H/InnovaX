"use client";

// Progress tracker: the metrics behind the athlete's goals for a sport, across their analyzed
// sessions, plus a projection of where they're heading ("future you", see lib/progress.ts) and
// a weekly shadow test that seals a one-week prediction and checks it (lib/shadowTest.ts).

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import BottomNav from "@/components/BottomNav";
import ProgressChart from "@/components/ProgressChart";
import SessionsTabs from "@/components/SessionsTabs";
import { getToken } from "@/lib/api";
import { type Sport, sportFromQuery } from "@/lib/clip";
import { SPORT_ICON, SPORT_NAME } from "@/lib/data";
import { readDraft } from "@/lib/onboarding";
import { SPORT_GOALS, goalMetrics, goalsFor, saveGoals } from "@/lib/goals";
import { type MetricDef, type SessionPoint, SPORT_METRICS, fmtValue, improvement, loadSportHistory, project } from "@/lib/progress";
import { type ShadowTest, calibrationFrom, loadTests, resolveTest, sessionAfter, startTest } from "@/lib/shadowTest";
import { useCurrentUser } from "@/lib/useAthlete";

const SPORTS: Sport[] = ["tennis", "cricket", "basketball", "running"];
const HORIZON_WEEKS = 8;

const shortDate = (iso: string) => new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric" });

function Trend({ delta }: { delta: number | null }) {
  if (delta == null) return null;
  const up = delta > 0.5;
  const down = delta < -0.5;
  return (
    <span className={`inline-flex items-center gap-0.5 font-label-caps text-label-caps uppercase ${up ? "text-primary" : down ? "text-tertiary" : "text-on-surface-variant"}`}>
      <span className="material-symbols-outlined text-[14px]">{up ? "trending_up" : down ? "trending_down" : "trending_flat"}</span>
      {up ? "Better" : down ? "Worse" : "Steady"}
    </span>
  );
}

function GoalChips({ sport, selected, onChange }: { sport: Sport; selected: string[]; onChange: (ids: string[]) => void }) {
  return (
    <section className="flex flex-col gap-2">
      <div className="flex items-center justify-between px-1">
        <span className="font-label-caps text-label-caps uppercase text-on-surface-variant">Your {SPORT_NAME[sport].toLowerCase()} goals</span>
        <span className="font-body-sm text-[11px] text-outline">Tap to change</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {SPORT_GOALS[sport].map((g) => {
          const on = selected.includes(g.id);
          return (
            <button
              key={g.id}
              type="button"
              aria-pressed={on}
              onClick={() => onChange(on ? (selected.length > 1 ? selected.filter((x) => x !== g.id) : selected) : [...selected, g.id])}
              className={`flex items-center gap-1.5 pl-2.5 pr-3 py-2 rounded-full transition-colors active:scale-95 ${on ? "bg-primary/15 text-primary" : "bg-surface-container text-on-surface-variant"}`}
            >
              <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: on ? "'FILL' 1" : "'FILL' 0" }}>
                {g.icon}
              </span>
              <span className={`font-body-sm text-[13px] ${on ? "font-semibold" : ""}`}>{g.title}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}

const DAY = 86_400_000;
const fmtPlain = (v: number, unit: string) => `${Math.round(v)}${unit}`;

function ShadowTestCard({
  sport,
  test,
  canStart,
  busy,
  error,
  onStart,
}: {
  sport: Sport;
  test: ShadowTest | null | undefined;
  canStart: boolean;
  busy: boolean;
  error: string | null;
  onStart: () => void;
}) {
  if (test === undefined) return null; // still loading

  const header = (kicker: string, title: string, icon: string, tone = "text-secondary-container") => (
    <div className="flex items-start justify-between gap-2">
      <div className="flex flex-col">
        <span className={`font-label-caps text-label-caps uppercase tracking-widest ${tone}`}>{kicker}</span>
        <span className="font-headline-md text-body-lg text-on-surface leading-tight">{title}</span>
      </div>
      <span className={`material-symbols-outlined text-[28px] ${tone}`}>{icon}</span>
    </div>
  );

  const startButton = (label: string) => (
    <button type="button" onClick={onStart} disabled={busy || !canStart} className="py-3 rounded-xl bg-secondary-container text-on-secondary-container font-headline-md text-body-md font-bold flex items-center justify-center gap-1.5 disabled:opacity-60">
      <span className={`material-symbols-outlined text-[20px] ${busy ? "animate-spin" : ""}`}>{busy ? "progress_activity" : "lock"}</span>
      {label}
    </button>
  );

  const card = "rounded-xl bg-surface-container p-space-md flex flex-col gap-space-sm shadow-[0_0_24px_-8px_rgba(14,165,198,0.35)]";

  // No test yet: explain it.
  if (!test) {
    return (
      <section className={card}>
        {header("Weekly shadow test", "Can you beat your prediction?", "sports_score")}
        <p className="font-body-sm text-body-sm text-on-surface-variant leading-snug">
          We&apos;ll seal where your shadow predicts you&apos;ll be in a week and hide it. Train, record your next session, and see if you met or beat it. Your projections adjust to the result.
        </p>
        {canStart ? startButton("Seal this week's prediction") : <p className="font-body-sm text-[12px] text-outline">Record two sessions that measure your goals to unlock it.</p>}
        {error && <p className="font-body-sm text-body-sm text-tertiary">{error}</p>}
      </section>
    );
  }

  // Sealed: show what's being tested, not the numbers.
  if (test.status === "open") {
    const due = Date.parse(test.due_at.endsWith("Z") || /[+-]\d\d:\d\d$/.test(test.due_at) ? test.due_at : `${test.due_at}Z`);
    const days = Math.ceil((due - Date.now()) / DAY);
    return (
      <section className={card}>
        {header("Shadow test · sealed", days > 0 ? `${days} day${days === 1 ? "" : "s"} to beat your shadow` : "Week's up: reveal your result", "lock")}
        <div className="flex flex-col gap-1.5">
          {test.metrics.map((m) => (
            <div key={m.key} className="flex items-center justify-between rounded-lg bg-surface-container-low px-space-sm py-2">
              <span className="font-body-sm text-body-sm text-on-surface">{m.label}</span>
              <span className="flex items-center gap-1 font-label-caps text-[11px] uppercase text-outline">
                <span className="material-symbols-outlined text-[16px]">lock</span>
                Hidden
              </span>
            </div>
          ))}
        </div>
        <p className="font-body-sm text-[12px] text-on-surface-variant">Your next analyzed {SPORT_NAME[sport].toLowerCase()} session reveals the result.</p>
        <Link href={`/capture/upload?sport=${sport}`} className="py-3 rounded-xl bg-secondary-container text-on-secondary-container font-headline-md text-body-md font-bold flex items-center justify-center gap-1.5">
          <span className="material-symbols-outlined text-[20px]">videocam</span>
          Record a session
        </Link>
      </section>
    );
  }

  // Resolved: the reveal.
  const r = test.result!;
  return (
    <section className={card}>
      {header(
        `Shadow test · ${r.beaten}/${r.total} beaten`,
        r.passed ? "You beat your shadow!" : "Your shadow won this week",
        r.passed ? "emoji_events" : "sports_score",
        r.passed ? "text-primary" : "text-secondary-container",
      )}
      <div className="flex flex-col gap-1.5">
        {Object.entries(r.metrics).map(([key, m]) => (
          <div key={key} className="flex items-center gap-space-sm rounded-lg bg-surface-container-low px-space-sm py-2">
            <span className={`material-symbols-outlined text-[20px] ${m.beaten ? "text-primary" : "text-tertiary"}`} style={{ fontVariationSettings: "'FILL' 1" }}>
              {m.beaten ? "check_circle" : "cancel"}
            </span>
            <span className="flex-1 font-body-sm text-body-sm text-on-surface">{m.label}</span>
            <span className="flex flex-col items-end">
              <span className="font-headline-md text-body-md text-on-surface tabular-nums">{fmtPlain(m.actual, m.unit)}</span>
              <span className="font-body-sm text-[11px] text-outline tabular-nums">predicted {fmtPlain(m.predicted, m.unit)}</span>
            </span>
          </div>
        ))}
      </div>
      <p className="font-body-sm text-[12px] text-on-surface-variant leading-snug">
        {r.passed ? "You met or beat the prediction on most goals" : "You fell short of the prediction on most goals"}, so your projections have been
        {r.passed ? " kept on pace or raised" : " recalibrated to your real rate of progress"}. +{r.xp_awarded} XP
      </p>
      {startButton("Seal next week's prediction")}
      {error && <p className="font-body-sm text-body-sm text-tertiary">{error}</p>}
    </section>
  );
}

export default function Progress() {
  const router = useRouter();
  const [sport, setSport] = useState<Sport>("tennis");
  const [history, setHistory] = useState<SessionPoint[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [tests, setTests] = useState<ShadowTest[] | null>(null);
  const [testBusy, setTestBusy] = useState(false);
  const [testError, setTestError] = useState<string | null>(null);
  const resolving = useRef<number | null>(null);
  const user = useCurrentUser();
  const profile = user.status === "signed-in" ? user.profile : null;
  const [goalIds, setGoalIds] = useState<string[]>([]);
  const perWeek = Math.max(1, readDraft().sessions_per_week ?? 3);
  const horizon = HORIZON_WEEKS * perWeek;

  useEffect(() => setSport(sportFromQuery()), []);

  useEffect(() => {
    if (!getToken()) return setError("Sign in to track your progress.");
    setHistory(null);
    setTests(null);
    setTestError(null);
    // Ignore responses for a sport the user has already switched away from.
    let current = true;
    loadSportHistory(sport).then(
      (h) => current && setHistory(h),
      (e) => current && setError(e instanceof Error ? e.message : "Couldn't load sessions"),
    );
    loadTests(sport).then(
      (t) => current && setTests(t),
      () => current && setTests([]),
    );
    return () => {
      current = false;
    };
  }, [sport]);

  useEffect(() => setGoalIds(goalsFor(profile, sport)), [profile, sport]);

  function changeGoals(ids: string[]) {
    setGoalIds(ids);
    saveGoals(profile, sport, ids).catch(() => {});
  }

  const latestTest = tests ? (tests[0] ?? null) : undefined;
  const calibration = useMemo(() => calibrationFrom(tests), [tests]);
  const goalDefs: MetricDef[] = useMemo(() => {
    const keys = goalMetrics(sport, goalIds);
    return keys.map((k) => SPORT_METRICS[sport].find((d) => d.key === k)).filter((d): d is MetricDef => !!d);
  }, [sport, goalIds]);

  // Reveal: once a session lands after the test started, compare it with the sealed prediction.
  const resolve = useCallback(async (test: ShadowTest, hist: SessionPoint[]) => {
    const point = sessionAfter(test, hist);
    if (!point || resolving.current === test.id) return;
    resolving.current = test.id;
    try {
      const done = await resolveTest(test, point);
      setTests((ts) => ts?.map((t) => (t.id === done.id ? done : t)) ?? null);
    } catch (e) {
      setTestError(e instanceof Error ? e.message : "Couldn't check your test");
    }
  }, []);

  useEffect(() => {
    if (latestTest?.status === "open" && history) resolve(latestTest, history);
  }, [latestTest, history, resolve]);

  async function beginTest() {
    if (!history) return;
    setTestBusy(true);
    setTestError(null);
    try {
      const t = await startTest(sport, goalDefs, history, perWeek, calibration);
      setTests((ts) => [t, ...(ts ?? [])]);
    } catch (e) {
      setTestError(e instanceof Error ? e.message : "Couldn't start the test");
    } finally {
      setTestBusy(false);
    }
  }

  const metrics = useMemo(() => {
    if (!history) return [];
    return goalDefs.map((def) => {
      const pts = history.filter((h) => h.values[def.key] != null);
      const values = pts.map((h) => h.values[def.key] as number);
      const proj = project(def, values, horizon, calibration[def.key] ?? 1);
      return {
        def,
        pts,
        values,
        proj,
        first: values[0] ?? null,
        latest: values[values.length - 1] ?? null,
        future: proj?.points[proj.points.length - 1] ?? null,
      };
    });
  }, [history, goalDefs, horizon, calibration]);
  const canStartTest = metrics.some((m) => m.values.length >= 2);

  const analyzed = history?.length ?? 0;
  const latestId = history?.[history.length - 1]?.session.id;
  const firstId = history?.[0]?.session.id;

  function choose(s: Sport) {
    setSport(s);
    router.replace(`/progress?sport=${s}`);
  }

  return (
    <div className="bg-surface text-on-surface font-body-md text-body-md min-h-screen flex flex-col antialiased">
      <header className="fixed top-0 inset-x-0 z-50 bg-surface/85 backdrop-blur-xl pt-safe">
        <div className="h-16 px-margin-mobile flex items-center">
          <h1 className="font-headline-md text-headline-md text-on-surface">Your progress</h1>
        </div>
      </header>

      <main className="flex flex-col w-full pt-20 pb-28 px-margin-mobile gap-space-md">
        <SessionsTabs active="progress" />

        {/* Sport filter — one row above the charts */}
        <div className="grid grid-cols-4 gap-2">
          {SPORTS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => choose(s)}
              aria-pressed={s === sport}
              className={`flex flex-col items-center gap-1 py-2 rounded-xl transition-colors ${s === sport ? "bg-surface-container-highest text-primary" : "bg-surface-container text-on-surface-variant"}`}
            >
              <span className="material-symbols-outlined text-[22px]">{SPORT_ICON[s]}</span>
              <span className="font-label-caps text-[10px] uppercase">{SPORT_NAME[s]}</span>
            </button>
          ))}
        </div>

        {profile && <GoalChips sport={sport} selected={goalIds} onChange={changeGoals} />}

        {error && <p className="font-body-sm text-body-sm text-tertiary">{error}</p>}

        {!history && !error && (
          <div className="flex flex-col gap-space-md animate-pulse">
            <div className="h-40 rounded-xl bg-surface-container"></div>
            <div className="h-56 rounded-xl bg-surface-container"></div>
          </div>
        )}

        {history && analyzed === 0 && (
          <section className="rounded-xl bg-surface-container p-space-lg flex flex-col items-center text-center gap-space-sm">
            <span className="material-symbols-outlined text-[36px] text-outline">{SPORT_ICON[sport]}</span>
            <span className="font-headline-md text-body-lg text-on-surface">No analyzed {SPORT_NAME[sport].toLowerCase()} sessions yet</span>
            <span className="font-body-sm text-body-sm text-on-surface-variant">Record two or more sessions to see your trend and where you&apos;re heading.</span>
            <Link href={`/capture/upload?sport=${sport}`} className="mt-1 px-space-md py-2.5 rounded-xl bg-primary text-on-primary font-headline-md text-body-sm font-bold">
              Record a session
            </Link>
          </section>
        )}

        {history && analyzed > 0 && (
          <>
            <ShadowTestCard sport={sport} test={latestTest} canStart={canStartTest} busy={testBusy} error={testError} onStart={beginTest} />

            {/* Future you */}
            <section className="rounded-xl bg-surface-container p-space-md flex flex-col gap-space-sm shadow-[0_0_24px_-8px_rgba(14,165,198,0.35)]">
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="font-label-caps text-label-caps text-secondary-container uppercase tracking-widest">Future you</span>
                  <span className="font-headline-md text-body-lg text-on-surface">
                    In {HORIZON_WEEKS} weeks at {perWeek} sessions/week
                  </span>
                </div>
                <span className="material-symbols-outlined text-secondary-container text-[28px]">auto_graph</span>
              </div>
              {analyzed < 2 ? (
                <p className="font-body-sm text-body-sm text-on-surface-variant">Record one more {SPORT_NAME[sport].toLowerCase()} session to unlock your projection.</p>
              ) : (
                <div className="flex flex-col divide-y divide-surface-container-highest">
                  {metrics.map(({ def, latest, future, proj }) => (
                    <div key={def.key} className="flex items-center justify-between py-2 gap-2">
                      <span className="font-body-sm text-body-sm text-on-surface-variant">{def.short}</span>
                      <span className="flex items-center gap-1.5 font-headline-md text-body-md text-on-surface tabular-nums">
                        {fmtValue(def, latest)}
                        <span className="material-symbols-outlined text-[16px] text-outline">arrow_forward</span>
                        <span className={proj?.trend === "improving" ? "text-secondary-container" : ""}>{fmtValue(def, future?.value)}</span>
                      </span>
                    </div>
                  ))}
                </div>
              )}
              <p className="font-body-sm text-[11px] text-outline leading-snug">
                Projected from your own session-to-session trend. Gains slow as you near each target, and a flat or declining
                trend is held steady rather than extrapolated. Ranges show the likely spread.
              </p>
            </section>

            {analyzed >= 2 && latestId && firstId && latestId !== firstId && (
              <Link href={`/compare?now=${latestId}&past=${firstId}`} className="flex items-center justify-between rounded-xl bg-surface-container-high px-space-md py-3">
                <span className="flex items-center gap-space-sm">
                  <span className="material-symbols-outlined text-secondary-container">compare</span>
                  <span className="flex flex-col">
                    <span className="font-body-md text-body-md text-on-surface">Compare first and latest</span>
                    <span className="font-body-sm text-[12px] text-on-surface-variant">See your movement side by side</span>
                  </span>
                </span>
                <span className="material-symbols-outlined text-on-surface-variant">chevron_right</span>
              </Link>
            )}

            {/* One chart per metric (small multiples, one axis each) */}
            {metrics.map(({ def, pts, values, proj, first, latest }) => (
              <section key={def.key} className="rounded-xl bg-surface-container p-space-md flex flex-col gap-space-sm">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex flex-col min-w-0">
                    <span className="font-headline-md text-body-md font-semibold text-on-surface">{def.label}</span>
                    <span className="font-body-sm text-[12px] text-on-surface-variant">{def.hint}</span>
                  </div>
                  <div className="flex flex-col items-end shrink-0">
                    <span className="font-metric-large text-[24px] leading-none text-on-surface">{fmtValue(def, latest)}</span>
                    {values.length >= 2 && first != null && latest != null && <Trend delta={improvement(def, first, latest)} />}
                  </div>
                </div>
                {values.length === 0 ? (
                  <p className="font-body-sm text-body-sm text-outline py-space-md text-center">Not measured in your sessions yet.</p>
                ) : (
                  <ProgressChart
                    def={def}
                    history={pts.map((p, i) => ({ value: values[i], label: shortDate(p.session.created_at) }))}
                    projection={proj}
                    sessionsPerWeek={perWeek}
                  />
                )}
                <div className="flex items-center gap-space-md font-label-caps text-[10px] uppercase text-on-surface-variant">
                  <span className="flex items-center gap-1.5">
                    <span className="w-4 h-0.5 rounded-full" style={{ background: "#1fae55" }}></span>
                    Your sessions ({values.length})
                  </span>
                  {proj && (
                    <span className="flex items-center gap-1.5">
                      <span className="w-4 border-t-2 border-dashed" style={{ borderColor: "#0ea5c6" }}></span>
                      Projected
                    </span>
                  )}
                </div>
              </section>
            ))}
          </>
        )}
      </main>
      <BottomNav />
    </div>
  );
}
