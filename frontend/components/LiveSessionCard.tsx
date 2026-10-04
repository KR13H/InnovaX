"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { describeAnalysis } from "@/lib/analysis";
import { api } from "@/lib/api";
import { type Recap, type Session, SPORT_BY_ID, SPORT_NAME, parseSummary, relativeDay } from "@/lib/data";

// Session card for real sessions, using the Stitch session-history card styling.
const SPORT_BADGE: Record<string, string> = {
  tennis: "bg-primary/20 text-primary",
  cricket: "bg-tertiary/20 text-tertiary",
  basketball: "bg-secondary/20 text-secondary",
  running: "bg-secondary-container/20 text-secondary-container",
};

const STATUS: Record<string, { icon: string; cls: string }> = {
  completed: { icon: "done_all", cls: "text-primary bg-primary/10" },
  analyzed: { icon: "done_all", cls: "text-primary bg-primary/10" },
  processing: { icon: "sync", cls: "text-secondary bg-secondary/10" },
  uploaded: { icon: "cloud_done", cls: "text-secondary bg-secondary/10" },
  failed: { icon: "error", cls: "text-error bg-error/10" },
};

export default function LiveSessionCard({ session }: { session: Session }) {
  const router = useRouter();
  const [recap, setRecap] = useState<Recap | null>(null);
  const sport = SPORT_BY_ID[session.sport_id];
  const status = STATUS[session.status] ?? { icon: "schedule", cls: "text-on-surface-variant bg-surface-container-high" };

  useEffect(() => {
    api<Recap>(`/sessions/${session.id}/recap`).then(setRecap, () => {});
  }, [session.id]);

  const summary = parseSummary<{ pose_detection_percent?: number; pose_frame_percentages?: Record<string, number> }>(recap?.analysis);
  // Tennis keeps its result as JSON in `summary`; cricket/basketball in `analysis_data`; running only stores metrics.
  const data = (summary ?? recap?.analysis?.analysis_data ?? null) as Record<string, unknown> | null;
  const resultText =
    data && sport
      ? describeAnalysis(sport, { results: data, analysis: data, ...data })
      : recap?.analysis?.summary
        ? recap.analysis.summary
        : recap && recap.metrics.length > 0
          ? `${recap.metrics.length} movement metrics recorded`
          : session.video_url
            ? "Video stored • awaiting analysis"
            : "No video uploaded";
  const tracked = summary?.pose_detection_percent;
  const strokes = summary?.pose_frame_percentages;
  const score = recap?.analysis?.performance_score;
  const metric = recap?.metrics[0];

  return (
    <article onClick={() => router.push(`/sessions/${session.id}`)} className="session-card group relative flex flex-col rounded-xl bg-surface-container p-space-md shadow-md active:scale-[0.99] transition-all cursor-pointer" data-sport={sport}>
      <div className="flex items-start justify-between gap-space-sm mb-space-xs">
        <div className="flex items-center gap-space-xs flex-wrap">
          <span className={`px-2 py-0.5 rounded-full ${SPORT_BADGE[sport] ?? "bg-surface-container-high text-on-surface"} font-label-caps text-label-caps uppercase tracking-wider`}>
            {sport ? SPORT_NAME[sport] : "Session"}
          </span>
          <span className="font-body-sm text-body-sm text-on-surface-variant">
            {relativeDay(session.recorded_at ?? session.created_at)}
          </span>
          <span className={`flex items-center gap-1 font-label-caps text-[10px] ${status.cls} px-1.5 py-0.5 rounded-full capitalize`}>
            <span className="material-symbols-outlined text-[12px]">{status.icon}</span> {session.status}
          </span>
        </div>
        {score != null || tracked != null ? (
          <div className="flex flex-col items-end">
            <span className="font-headline-md text-headline-md text-on-surface font-bold">
              {score != null ? Math.round(score) : `${Math.round(tracked!)}%`}
            </span>
            <span className="font-label-caps text-[10px] text-on-surface-variant uppercase tracking-wider">
              {score != null ? "Score" : "Tracked"}
            </span>
          </div>
        ) : (
          <span className="material-symbols-outlined text-on-surface-variant">chevron_right</span>
        )}
      </div>
      <h2 className="font-headline-md text-body-lg font-bold text-on-surface group-hover:text-tertiary transition-colors">
        {sport ? SPORT_NAME[sport] : ""} Session #{session.id}
      </h2>
      <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5 mb-space-sm">
        {resultText}
      </p>
      {strokes ? (
        <div className="flex flex-col gap-1.5 p-space-sm rounded-lg bg-surface-container-high">
          <div className="w-full h-1.5 rounded-full overflow-hidden flex bg-surface-container-lowest">
            <div className="h-full bg-primary" style={{ width: `${strokes.forehand ?? 0}%` }}></div>
            <div className="h-full bg-secondary-container" style={{ width: `${strokes.backhand ?? 0}%` }}></div>
            <div className="h-full bg-tertiary" style={{ width: `${strokes.serve ?? 0}%` }}></div>
            <div className="h-full bg-outline" style={{ width: `${strokes.ready_position ?? 0}%` }}></div>
          </div>
          <div className="flex items-center justify-between font-label-caps text-[10px] uppercase text-on-surface-variant">
            <span><span className="text-primary">FH</span> {Math.round(strokes.forehand ?? 0)}%</span>
            <span><span className="text-secondary-container">BH</span> {Math.round(strokes.backhand ?? 0)}%</span>
            <span><span className="text-tertiary">SV</span> {Math.round(strokes.serve ?? 0)}%</span>
            <span>Ready {Math.round(strokes.ready_position ?? 0)}%</span>
          </div>
        </div>
      ) : metric ? (
        <div className="flex flex-col gap-1.5 p-space-sm rounded-lg bg-surface-container-high">
          <div className="flex items-center justify-between font-label-caps text-[11px]">
            <span className="text-on-surface-variant uppercase tracking-wider">{metric.metric_name.replace(/_/g, " ")}</span>
            <span className="text-secondary font-bold">
              {Math.round(metric.metric_value * 10) / 10} {metric.unit ?? ""}
            </span>
          </div>
          {recap && recap.metrics.length > 1 ? (
            <span className="text-[11px] text-on-surface-variant font-body-sm">+{recap.metrics.length - 1} more metrics</span>
          ) : null}
        </div>
      ) : null}
    </article>
  );
}
