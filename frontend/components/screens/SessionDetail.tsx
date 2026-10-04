"use client";

// Session results: the clip with live pose tracking, then the analysis laid out as
// headline → stroke breakdown → joint angles → coaching notes → next actions.
// No Stitch screen exists for this, so it is composed from Kinetic Ghost tokens.

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import BottomNav from "@/components/BottomNav";
import PoseVideo from "@/components/PoseVideo";
import { CoachNotes, Gauge, Headline, type Reading } from "@/components/ResultWidgets";
import { BasketballResults, CricketResults, RunningResults } from "@/components/SportResults";
import type { BasketballResult, CricketResult } from "@/lib/analysis";
import { analyzeSession, describeAnalysis } from "@/lib/analysis";
import { ApiError, api, getToken } from "@/lib/api";
import { type Recap, type Session, SPORT_BY_ID, SPORT_ICON, SPORT_NAME, parseSummary, relativeDay } from "@/lib/data";

type Explanation = { id: number; title: string; explanation: string | null; recommendation: string | null };

type TennisSummary = {
  duration_seconds?: number;
  sampled_frames?: number;
  pose_detection_percent?: number;
  pose_frame_percentages?: Record<string, number>;
  mean_joint_angles_degrees?: Record<string, number | null>;
};

const STROKES = [
  { key: "forehand", label: "Forehand", icon: "sports_tennis", color: "#4be277" },
  { key: "backhand", label: "Backhand", icon: "swap_horiz", color: "#00eefc" },
  { key: "serve", label: "Serve", icon: "north", color: "#ffba61" },
  { key: "ready_position", label: "Ready stance", icon: "accessibility_new", color: "#869585" },
];

// Rough reading of a joint angle for the gauge chip. Guidance, not a diagnosis.
function readJoint(kind: "elbow" | "knee", deg: number): Reading {
  if (kind === "knee") {
    if (deg >= 160) return { text: "Very upright", tone: "text-tertiary" };
    if (deg >= 140) return { text: "Upright", tone: "text-secondary-container" };
    return { text: "Loaded", tone: "text-primary" };
  }
  if (deg >= 160) return { text: "Extended", tone: "text-secondary-container" };
  if (deg >= 100) return { text: "Compact", tone: "text-primary" };
  return { text: "Tight", tone: "text-tertiary" };
}

function coachingNotes(t: TennisSummary): { icon: string; title: string; body: string }[] {
  const notes: { icon: string; title: string; body: string }[] = [];
  const pose = t.pose_detection_percent ?? 0;
  const strokes = t.pose_frame_percentages ?? {};
  const angles = t.mean_joint_angles_degrees ?? {};
  if (pose < 80) {
    notes.push({ icon: "videocam", title: "Improve the camera angle", body: `The athlete was tracked in ${Math.round(pose)}% of frames. Film side-on from waist height with your whole body in shot.` });
  }
  const knee = Math.min(angles.right_knee ?? 180, angles.left_knee ?? 180);
  if (knee >= 140 && knee < 180) {
    notes.push({ icon: "airline_seat_legroom_extra", title: "Load your legs more", body: `Average knee angle is ${Math.round(knee)}°, a fairly upright stance. Aim for around 130° through the unit turn to drive power from the ground.` });
  }
  const top = Object.entries(strokes).filter(([k]) => k !== "unknown").sort((a, b) => b[1] - a[1])[0];
  if (top && top[1] >= 40) {
    const name = STROKES.find((s) => s.key === top[0])?.label.toLowerCase() ?? top[0];
    notes.push({ icon: "insights", title: `Mostly ${name}`, body: `${Math.round(top[1])}% of tracked frames were ${name}. Record other strokes too so your twin learns your full game.` });
  }
  if ((strokes.unknown ?? 0) > 30) {
    notes.push({ icon: "help", title: "Some frames unclassified", body: `${Math.round(strokes.unknown)}% of frames didn't match a stroke. Trim long pauses between shots for cleaner results.` });
  }
  return notes.slice(0, 3);
}

export default function SessionDetail() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const [session, setSession] = useState<Session | null>(null);
  const [recap, setRecap] = useState<Recap | null>(null);
  const [explanations, setExplanations] = useState<Explanation[]>([]);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);

  useEffect(() => {
    if (!getToken()) return setError("Sign in to view your sessions.");
    api<Session>(`/sessions/${id}`).then(setSession, (e) =>
      setError(e instanceof ApiError && e.status === 404 ? "Session not found." : e.message),
    );
    api<Recap>(`/sessions/${id}/recap`).then(setRecap, () => {});
    api<Explanation[]>(`/sessions/${id}/explanation`).then(setExplanations, () => {});
  }, [id]);

  // Still analyzing on the server (e.g. user left the analysis screen): refresh until it's done.
  useEffect(() => {
    if (session?.status !== "processing") return;
    const t = setInterval(async () => {
      const s = await api<Session>(`/sessions/${id}`).catch(() => null);
      if (s && s.status !== "processing") {
        setSession(s);
        setRecap(await api<Recap>(`/sessions/${id}/recap`).catch(() => null));
      }
    }, 5000);
    return () => clearInterval(t);
  }, [session?.status, id]);

  // The video endpoint needs the auth header, so load it as a blob for the <video> element.
  useEffect(() => {
    if (!session?.video_url) return;
    let url: string | null = null;
    fetch(`/api/sessions/${id}/video`, { headers: { Authorization: `Bearer ${getToken()}` } })
      .then((r) => (r.ok ? r.blob() : null))
      .then((b) => {
        if (b) setVideoUrl((url = URL.createObjectURL(b)));
      })
      .catch(() => {});
    return () => {
      if (url) URL.revokeObjectURL(url);
    };
  }, [session?.video_url, id]);

  const sport = session ? SPORT_BY_ID[session.sport_id] : undefined;
  const summary = parseSummary<TennisSummary & Record<string, unknown>>(recap?.analysis);
  const tennis = sport === "tennis" ? summary : null;
  const metrics = recap?.metrics ?? [];
  const analyzed = !!recap?.analysis || metrics.length > 0;
  const strokes = tennis?.pose_frame_percentages ?? {};
  const topStroke = STROKES.map((s) => ({ ...s, pct: strokes[s.key] ?? 0 })).sort((a, b) => b.pct - a.pct)[0];
  const notes = tennis ? coachingNotes(tennis) : [];
  const cricket = sport === "cricket" ? ((recap?.analysis?.analysis_data ?? null) as CricketResult | null) : null;
  const running = sport === "running" && metrics.length > 0;
  const basketball = sport === "basketball" ? ((recap?.analysis?.analysis_data ?? null) as BasketballResult | null) : null;

  async function runAnalysis() {
    if (!sport) return;
    setAnalyzing(true);
    setError(null);
    try {
      await analyzeSession(sport, Number(id));
      setRecap(await api<Recap>(`/sessions/${id}/recap`));
      setSession(await api<Session>(`/sessions/${id}`));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Analysis failed");
    } finally {
      setAnalyzing(false);
    }
  }

  return (
    <div className="bg-surface text-on-surface font-body-md text-body-md min-h-screen flex flex-col antialiased selection:bg-primary selection:text-on-primary">
      <header className="fixed top-0 inset-x-0 z-50 bg-surface-container-lowest/85 backdrop-blur-xl shadow-[0_4px_24px_rgba(0,0,0,0.5)] pt-safe">
        <div className="h-16 px-space-xs flex items-center justify-between">
          <div className="flex items-center gap-space-xs min-w-0">
            <button aria-label="Go back" onClick={() => router.back()} className="min-w-[44px] min-h-[44px] flex items-center justify-center text-on-surface hover:text-primary transition-colors" type="button">
              <span className="material-symbols-outlined text-[24px]">arrow_back</span>
            </button>
            <div className="flex flex-col min-w-0">
              <span className="font-label-caps text-label-caps text-primary uppercase tracking-widest">Session Results</span>
              <h1 className="font-headline-md text-headline-md text-on-surface tracking-tight truncate">
                {sport ? `${SPORT_NAME[sport]} #${id}` : `Session #${id}`}
              </h1>
            </div>
          </div>
          {session && (
            <span className="mr-2 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-container-high font-label-caps text-label-caps uppercase text-on-surface-variant">
              <span className="material-symbols-outlined text-[14px] text-primary">{sport ? SPORT_ICON[sport] : "videocam"}</span>
              {relativeDay(session.recorded_at ?? session.created_at)}
            </span>
          )}
        </div>
      </header>

      <main className="flex flex-col w-full pt-20 pb-28 px-margin-mobile gap-space-md">
        {error && (
          <div className="p-space-sm rounded-xl bg-error-container/25 flex items-start gap-space-sm">
            <span className="material-symbols-outlined text-error text-[20px]">error_outline</span>
            <p className="font-body-sm text-body-sm text-on-surface-variant">{error}</p>
          </div>
        )}

        {!session && !error && (
          <div className="flex flex-col gap-space-md animate-pulse">
            <div className="w-2/3 mx-auto aspect-[9/16] max-h-[55vh] rounded-xl bg-surface-container-low"></div>
            <div className="h-24 rounded-xl bg-surface-container-low"></div>
            <div className="h-40 rounded-xl bg-surface-container-low"></div>
          </div>
        )}

        {session && (
          <>
            {/* Clip with live pose tracking */}
            {videoUrl ? (
              <PoseVideo src={videoUrl} maxHeight="58vh" />
            ) : (
              <div className="w-2/3 mx-auto aspect-[9/16] max-h-[55vh] rounded-xl bg-surface-container-lowest flex flex-col items-center justify-center gap-2 text-on-surface-variant">
                <span className={`material-symbols-outlined text-[36px] ${session.video_url ? "animate-spin" : ""}`}>{session.video_url ? "progress_activity" : "videocam_off"}</span>
                <span className="font-label-caps text-label-caps uppercase">{session.video_url ? "Loading clip…" : "No video uploaded"}</span>
              </div>
            )}

            {/* Headline + sport-specific results */}
            {tennis ? (
              <Headline
                ring={tennis.pose_detection_percent ?? 0}
                ringLabel="Tracked"
                kicker="Dominant stroke"
                title={topStroke.pct > 0 ? topStroke.label : "Not detected"}
                sub={`${Math.round(topStroke.pct)}% of frames • ${tennis.duration_seconds?.toFixed(1) ?? "—"}s clip • ${tennis.sampled_frames ?? 0} frames`}
              />
            ) : cricket ? (
              <CricketResults result={cricket} />
            ) : running ? (
              <RunningResults metrics={metrics} />
            ) : basketball ? (
              <BasketballResults result={basketball} />
            ) : (
              <section className="rounded-xl bg-surface-container p-space-md flex flex-col gap-space-sm">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-secondary text-[20px]">neurology</span>
                  <span className="font-label-caps text-label-caps text-on-surface uppercase tracking-wider font-bold">AI Summary</span>
                </div>
                <p className="font-body-md text-body-md text-on-surface-variant">
                  {analyzed && sport && summary
                    ? describeAnalysis(sport, { results: summary, analysis: summary, ...summary })
                    : analyzed
                      ? "Analysis complete."
                      : session.video_url
                        ? "This session hasn't been analyzed yet."
                        : "Upload a video to analyze this session."}
                </p>
              </section>
            )}

            {session.status === "processing" && (
              <div className="rounded-xl bg-surface-container p-space-md flex items-center gap-space-sm">
                <span className="material-symbols-outlined text-secondary animate-spin">progress_activity</span>
                <span className="font-body-sm text-body-sm text-on-surface-variant">Analyzing this clip… results will appear here automatically.</span>
              </div>
            )}

            {!analyzed && session.video_url && session.status !== "processing" && (
              <button type="button" onClick={runAnalysis} disabled={analyzing} className="w-full py-3.5 rounded-xl bg-primary text-on-primary font-headline-md text-body-md font-bold flex items-center justify-center gap-2 shadow-[0_0_24px_-2px_rgba(34,197,94,0.35)] disabled:opacity-80">
                <span className={`material-symbols-outlined text-[20px] ${analyzing ? "animate-spin" : ""}`}>{analyzing ? "progress_activity" : "play_circle"}</span>
                {analyzing ? "Analyzing…" : "Analyze Session"}
              </button>
            )}

            {/* Stroke breakdown */}
            {tennis?.pose_frame_percentages && (
              <section className="rounded-xl bg-surface-container p-space-md flex flex-col gap-space-sm">
                <div className="flex items-center justify-between">
                  <span className="font-headline-md text-body-lg font-semibold text-on-surface">Stroke breakdown</span>
                  <span className="font-label-caps text-label-caps text-on-surface-variant uppercase">Share of frames</span>
                </div>
                {STROKES.map((s) => {
                  const pct = strokes[s.key] ?? 0;
                  const top = s.key === topStroke.key && pct > 0;
                  return (
                    <div key={s.key} className="flex items-center gap-space-sm">
                      <div className="w-8 h-8 rounded-lg bg-surface-container-high flex items-center justify-center shrink-0" style={{ color: s.color }}>
                        <span className="material-symbols-outlined text-[18px]">{s.icon}</span>
                      </div>
                      <div className="flex-1 flex flex-col gap-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className={`font-body-sm text-body-sm ${top ? "text-on-surface font-semibold" : "text-on-surface-variant"}`}>{s.label}</span>
                          <span className="font-headline-md text-body-md font-bold text-on-surface tabular-nums">{Math.round(pct)}%</span>
                        </div>
                        <div className="h-1.5 rounded-full bg-surface-container-lowest overflow-hidden">
                          <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: s.color, boxShadow: top ? `0 0 8px ${s.color}` : undefined }}></div>
                        </div>
                      </div>
                    </div>
                  );
                })}
                {(strokes.unknown ?? 0) > 0 && (
                  <span className="font-body-sm text-[12px] text-outline">{Math.round(strokes.unknown)}% of frames between strokes or unclassified</span>
                )}
              </section>
            )}

            {/* Joint angles */}
            {tennis?.mean_joint_angles_degrees && (
              <section className="flex flex-col gap-space-sm">
                <div className="flex items-center justify-between px-1">
                  <span className="font-headline-md text-body-lg font-semibold text-on-surface">Joint angles</span>
                  <span className="font-label-caps text-label-caps text-on-surface-variant uppercase">Mean over clip</span>
                </div>
                <div className="grid grid-cols-2 gap-gutter-mobile">
                  <Gauge label="Right elbow" deg={tennis.mean_joint_angles_degrees.right_elbow} reading={tennis.mean_joint_angles_degrees.right_elbow != null ? readJoint("elbow", tennis.mean_joint_angles_degrees.right_elbow!) : null} />
                  <Gauge label="Left elbow" deg={tennis.mean_joint_angles_degrees.left_elbow} reading={tennis.mean_joint_angles_degrees.left_elbow != null ? readJoint("elbow", tennis.mean_joint_angles_degrees.left_elbow!) : null} />
                  <Gauge label="Right knee" deg={tennis.mean_joint_angles_degrees.right_knee} reading={tennis.mean_joint_angles_degrees.right_knee != null ? readJoint("knee", tennis.mean_joint_angles_degrees.right_knee!) : null} />
                  <Gauge label="Left knee" deg={tennis.mean_joint_angles_degrees.left_knee} reading={tennis.mean_joint_angles_degrees.left_knee != null ? readJoint("knee", tennis.mean_joint_angles_degrees.left_knee!) : null} />
                </div>
              </section>
            )}

            {/* Coaching notes */}
            <CoachNotes notes={notes} />

            {/* Other sports: stored metrics */}
            {metrics.length > 0 && !running && (
              <section className="flex flex-col gap-space-sm">
                <span className="font-headline-md text-body-lg font-semibold text-on-surface px-1">Metrics</span>
                <div className="grid grid-cols-2 gap-gutter-mobile">
                  {metrics.map((m) => (
                    <div key={m.metric_name} className="p-space-sm rounded-xl bg-surface-container-low flex flex-col">
                      <span className="font-label-caps text-label-caps text-on-surface-variant uppercase truncate">{m.metric_name.replace(/_/g, " ")}</span>
                      <span className="font-metric-large text-[24px] leading-tight text-on-surface">
                        {Math.round(m.metric_value * 10) / 10}
                        {m.unit ? <span className="font-body-sm text-body-sm text-outline"> {m.unit}</span> : null}
                      </span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {explanations.length > 0 && (
              <section className="rounded-xl bg-surface-container p-space-md flex flex-col gap-2">
                <span className="font-headline-md text-body-lg font-semibold text-on-surface">Why it changed</span>
                {explanations.map((x) => (
                  <div key={x.id} className="p-2.5 rounded-lg bg-surface-container-low">
                    <p className="font-body-sm text-body-sm text-on-surface font-semibold">{x.title}</p>
                    {x.explanation && <p className="font-body-sm text-[12px] text-on-surface-variant mt-0.5">{x.explanation}</p>}
                    {x.recommendation && <p className="font-body-sm text-[12px] text-secondary mt-1">{x.recommendation}</p>}
                  </div>
                ))}
              </section>
            )}

            {recap && recap.xp_earned > 0 && (
              <div className="flex items-center justify-center gap-2 font-label-caps text-label-caps text-primary uppercase">
                <span className="material-symbols-outlined text-[16px]">bolt</span>+{recap.xp_earned} XP earned
              </div>
            )}

            {/* Compare + progress */}
            {analyzed && sport && (
              <div className="grid grid-cols-2 gap-gutter-mobile">
                <Link href={`/compare?now=${id}`} className="py-3 rounded-xl bg-surface-container-high text-on-surface font-headline-md text-body-sm font-semibold flex items-center justify-center gap-1.5">
                  <span className="material-symbols-outlined text-[18px] text-secondary-container">compare</span>
                  Compare
                </Link>
                <Link href={`/progress?sport=${sport}`} className="py-3 rounded-xl bg-surface-container-high text-on-surface font-headline-md text-body-sm font-semibold flex items-center justify-center gap-1.5">
                  <span className="material-symbols-outlined text-[18px] text-secondary-container">monitoring</span>
                  Progress
                </Link>
              </div>
            )}

            {/* Next actions */}
            <div className="grid grid-cols-2 gap-gutter-mobile pt-space-xs">
              <Link href={`/capture/upload?sport=${sport ?? "tennis"}`} className="py-3 rounded-xl bg-primary text-on-primary font-headline-md text-body-sm font-bold flex items-center justify-center gap-1.5 shadow-[0_0_20px_-4px_rgba(34,197,94,0.45)]">
                <span className="material-symbols-outlined text-[18px]">add_circle</span>
                New session
              </Link>
              <Link href="/sessions" className="py-3 rounded-xl bg-surface-container-high text-on-surface font-headline-md text-body-sm font-semibold flex items-center justify-center gap-1.5">
                <span className="material-symbols-outlined text-[18px]">history</span>
                All sessions
              </Link>
            </div>
          </>
        )}
      </main>
      <BottomNav capture={false} />
    </div>
  );
}
