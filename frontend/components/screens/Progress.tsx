"use client";

// Progress tracker: each key metric across the athlete's analyzed sessions, plus a
// projection of where they're heading ("future you"). See lib/progress.ts for the model.

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import BottomNav from "@/components/BottomNav";
import ProgressChart from "@/components/ProgressChart";
import SessionsTabs from "@/components/SessionsTabs";
import { getToken } from "@/lib/api";
import { type Sport, sportFromQuery } from "@/lib/clip";
import { SPORT_ICON, SPORT_NAME } from "@/lib/data";
import { readDraft } from "@/lib/onboarding";
import { type SessionPoint, SPORT_METRICS, fmtValue, improvement, loadSportHistory, project } from "@/lib/progress";

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

export default function Progress() {
  const router = useRouter();
  const [sport, setSport] = useState<Sport>("tennis");
  const [history, setHistory] = useState<SessionPoint[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const perWeek = Math.max(1, readDraft().sessions_per_week ?? 3);
  const horizon = HORIZON_WEEKS * perWeek;

  useEffect(() => setSport(sportFromQuery()), []);

  useEffect(() => {
    if (!getToken()) return setError("Sign in to track your progress.");
    setHistory(null);
    loadSportHistory(sport).then(setHistory, (e) => setError(e instanceof Error ? e.message : "Couldn't load sessions"));
  }, [sport]);

  const metrics = useMemo(() => {
    if (!history) return [];
    return SPORT_METRICS[sport].map((def) => {
      const pts = history.filter((h) => h.values[def.key] != null);
      const values = pts.map((h) => h.values[def.key] as number);
      const proj = project(def, values, horizon);
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
  }, [history, sport, horizon]);

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
