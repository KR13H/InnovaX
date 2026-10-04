"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { Sport } from "@/lib/clip";
import { type Recap, type Session, SPORT_BY_ID, parseSummary, relativeDay } from "@/lib/data";

// The 3-tile metric grid on a Sports Hub card, filled from the athlete's latest session in that sport.
type Tile = { label: string; value: string; note: string };

const TILE = "p-2.5 rounded-lg bg-surface-container-lowest flex flex-col";

function tilesFrom(sport: Sport, recap: Recap | null, session: Session | undefined): Tile[] {
  if (!session) return [0, 1, 2].map(() => ({ label: "No sessions", value: "—", note: "Record one" }));
  if (sport === "tennis") {
    const t = parseSummary<{
      pose_detection_percent?: number;
      pose_frame_percentages?: Record<string, number>;
      mean_joint_angles_degrees?: Record<string, number | null>;
    }>(recap?.analysis);
    const strokes = Object.entries(t?.pose_frame_percentages ?? {}).filter(([k]) => k !== "unknown").sort((a, b) => b[1] - a[1]);
    const ang = t?.mean_joint_angles_degrees ?? {};
    const d = (n: number | null | undefined) => (n == null ? "—" : `${Math.round(n)}°`);
    return [
      { label: "Top Stroke", value: strokes[0] ? strokes[0][0].replace("_", " ") : "—", note: strokes[0] ? `${Math.round(strokes[0][1])}% of frames` : "Not analyzed" },
      { label: "Coverage", value: t?.pose_detection_percent != null ? `${t.pose_detection_percent.toFixed(1)}%` : "—", note: "Pose detected" },
      { label: "Joint Angles", value: `E: ${d(ang.right_elbow)} • K: ${d(ang.right_knee)}`, note: relativeDay(session.created_at) },
    ];
  }
  const metrics = recap?.metrics ?? [];
  if (metrics.length === 0) {
    return [
      { label: "Status", value: session.status, note: relativeDay(session.created_at) },
      { label: "Metrics", value: "—", note: "Not analyzed yet" },
      { label: "Session", value: `#${session.id}`, note: sport },
    ];
  }
  return metrics.slice(0, 3).map((m) => ({
    label: m.metric_name.replace(/_/g, " "),
    value: `${Math.round(m.metric_value * 10) / 10}${m.unit ? ` ${m.unit}` : ""}`,
    note: relativeDay(session.created_at),
  }));
}

export default function LiveMetricTiles({ sport, sessions }: { sport: Sport; sessions: Session[] }) {
  const latest = sessions.filter((s) => SPORT_BY_ID[s.sport_id] === sport).sort((a, b) => b.created_at.localeCompare(a.created_at))[0];
  const [recap, setRecap] = useState<Recap | null>(null);

  useEffect(() => {
    if (!latest) return;
    api<Recap>(`/sessions/${latest.id}/recap`).then(setRecap, () => setRecap(null));
  }, [latest?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="grid grid-cols-3 gap-2">
      {tilesFrom(sport, recap, latest).map((t, i) => (
        <div key={i} className={TILE}>
          <span className="font-label-caps text-label-caps text-on-surface-variant uppercase truncate">{t.label}</span>
          <span className="font-label-badge text-label-badge text-on-surface mt-1 capitalize truncate">{t.value}</span>
          <span className="font-label-caps text-label-caps text-primary mt-0.5 truncate">{t.note}</span>
        </div>
      ))}
    </div>
  );
}
