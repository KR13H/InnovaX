"use client";

// Sport-specific result layouts for the session results screen (cricket bowling, running gait).

import type { BasketballResult, CricketResult } from "@/lib/analysis";
import type { Metric } from "@/lib/data";
import { CoachNotes, Gauge, Headline, type Note, type Reading, SectionTitle, StatTile } from "./ResultWidgets";

const words = (s?: string | null) => (s ? s.replace(/_/g, " ") : "—");
const ms = (n?: number) => (n == null ? "—" : `${Math.round(n)} ms`);

// ---------- Cricket ----------

const frontKnee = (d: number): Reading =>
  d >= 165 ? { text: "Braced", tone: "text-primary" } : d >= 140 ? { text: "Partly braced", tone: "text-secondary-container" } : { text: "Collapsing", tone: "text-tertiary" };
const bowlingElbow = (d: number): Reading =>
  d >= 165 ? { text: "Straight", tone: "text-primary" } : { text: "Flexed", tone: "text-tertiary" };
const backKnee = (d: number): Reading =>
  d >= 150 ? { text: "Tall", tone: "text-secondary-container" } : { text: "Loaded", tone: "text-primary" };

function cricketNotes(r: CricketResult): Note[] {
  const notes: Note[] = [];
  const bio = r.pose?.biomechanics;
  const fk = bio?.ffc?.front_knee_angle_deg;
  const el = bio?.release?.bowling_elbow_angle_deg;
  const t = r.pose?.timing;
  if (fk != null && fk < 150) {
    notes.push({ icon: "airline_seat_legroom_extra", title: "Brace the front leg", body: `Front knee is ${Math.round(fk)}° at front-foot contact. A firmer front leg (closer to 165–180°) transfers more run-up momentum into pace.` });
  }
  if (el != null && el < 165) {
    notes.push({ icon: "back_hand", title: "Keep the bowling arm straight", body: `Bowling elbow reads ${Math.round(el)}° at release. Aim to keep it near full extension through the delivery.` });
  }
  if (t?.ffc_to_release_ms != null && t.ffc_to_release_ms > 250) {
    notes.push({ icon: "timer", title: "Speed up the delivery stride", body: `${Math.round(t.ffc_to_release_ms)} ms from front-foot contact to release. Faster bowlers typically release within about 200 ms.` });
  }
  if (r.ball?.release?.predicted) {
    notes.push({ icon: "sports_cricket", title: "Ball path is estimated", body: "The ball wasn't clearly visible, so line and length were predicted. Film with the pitch in view for measured values." });
  }
  return notes.slice(0, 3);
}

export function CricketResults({ result }: { result: CricketResult }) {
  const pose = result.pose ?? {};
  const bio = pose.biomechanics ?? {};
  const frames = pose.video?.frames ?? 0;
  const tracked = frames ? ((pose.processing?.frames_with_pose ?? 0) / frames) * 100 : 0;
  const t = pose.timing ?? {};
  const fk = bio.ffc?.front_knee_angle_deg;
  const el = bio.release?.bowling_elbow_angle_deg;
  const bk = bio.bfc?.back_knee_angle_deg;

  if (pose.status && pose.status !== "success") {
    return (
      <section className="rounded-xl bg-surface-container p-space-md flex items-start gap-space-sm">
        <span className="material-symbols-outlined text-tertiary">person_search</span>
        <div className="flex flex-col">
          <span className="font-body-md text-body-md font-semibold text-on-surface">No bowler found</span>
          <span className="font-body-sm text-body-sm text-on-surface-variant">Reason: {words(pose.reason)}. Film the whole run-up and delivery side-on, with the bowler in frame throughout.</span>
        </div>
      </section>
    );
  }

  return (
    <>
      <Headline
        ring={tracked}
        ringLabel="Tracked"
        kicker="Delivery analysis"
        title={result.ball?.length ? words(result.ball.length) : "Delivery tracked"}
        sub={`${words(result.ball?.line)} • ${result.ball?.speed_kmh != null ? `${Math.round(result.ball.speed_kmh)} km/h` : "pace not measured"}`}
      />

      {/* Phase timeline */}
      <section className="rounded-xl bg-surface-container p-space-md flex flex-col gap-space-sm">
        <SectionTitle title="Delivery phases" aside={ms(t.bfc_to_release_ms) + " total"} />
        <div className="flex items-center">
          {[
            { label: "Back foot", frame: pose.phases?.bfc_frame },
            { label: "Front foot", frame: pose.phases?.ffc_frame },
            { label: "Release", frame: pose.phases?.release_frame },
          ].map((p, i, all) => (
            <div key={p.label} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center gap-1">
                <span className={`w-3.5 h-3.5 rounded-full ${i === all.length - 1 ? "bg-primary shadow-[0_0_10px_#4be277]" : "bg-secondary-container"}`}></span>
                <span className="font-label-caps text-label-caps text-on-surface uppercase whitespace-nowrap">{p.label}</span>
                <span className="font-label-caps text-[10px] text-outline">frame {p.frame ?? "—"}</span>
              </div>
              {i < all.length - 1 && (
                <div className="flex-1 flex flex-col items-center -mt-8 mx-1">
                  <span className="font-label-caps text-label-caps text-secondary-container">{ms(i === 0 ? t.bfc_to_ffc_ms : t.ffc_to_release_ms)}</span>
                  <div className="w-full h-0.5 bg-gradient-to-r from-secondary-container to-primary rounded-full mt-1"></div>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Biomechanics */}
      <section className="flex flex-col gap-space-sm">
        <SectionTitle title="Body angles" aside="At each phase" />
        <div className="grid grid-cols-2 gap-gutter-mobile">
          <Gauge label="Front knee • FFC" deg={fk} reading={fk != null ? frontKnee(fk) : null} />
          <Gauge label="Bowling elbow • Release" deg={el} reading={el != null ? bowlingElbow(el) : null} />
          <Gauge label="Back knee • BFC" deg={bk} reading={bk != null ? backKnee(bk) : null} />
          <StatTile label="Torso lean • Release" value={bio.release?.torso_lean_deg != null ? `${Math.round(bio.release.torso_lean_deg)}°` : "—"} sub={bio.release?.torso_lean_deg != null ? (bio.release.torso_lean_deg < 0 ? "Leaning back" : "Leaning forward") : undefined} />
        </div>
      </section>

      {/* Ball */}
      <section className="flex flex-col gap-space-sm">
        <SectionTitle title="Ball" aside={result.ball?.release?.predicted ? "Estimated" : "Tracked"} />
        <div className="grid grid-cols-3 gap-gutter-mobile">
          <StatTile label="Line" value={words(result.ball?.line)} />
          <StatTile label="Length" value={words(result.ball?.length)} />
          <StatTile label="Pace" value={result.ball?.speed_kmh != null ? String(Math.round(result.ball.speed_kmh)) : "—"} unit={result.ball?.speed_kmh != null ? "km/h" : undefined} />
        </div>
      </section>

      <CoachNotes notes={cricketNotes(result)} />
    </>
  );
}

// ---------- Running ----------

function runningNotes(m: Record<string, number>): Note[] {
  const notes: Note[] = [];
  if (m.knee_rom_symmetry != null && m.knee_rom_symmetry < 90) {
    notes.push({ icon: "balance", title: "Even out your stride", body: `Knee movement symmetry is ${Math.round(m.knee_rom_symmetry)}%. Above 90% means both legs are doing similar work; single-leg drills can close the gap.` });
  }
  if (m.hip_rom_symmetry != null && m.hip_rom_symmetry < 90) {
    notes.push({ icon: "accessibility_new", title: "Check hip drive", body: `Hip symmetry is ${Math.round(m.hip_rom_symmetry)}%. One side swings noticeably more than the other.` });
  }
  if (m.torso_lean_mean != null && Math.abs(m.torso_lean_mean) > 12) {
    notes.push({ icon: "straighten", title: "Stand a little taller", body: `Average torso lean is ${Math.round(m.torso_lean_mean)}°. A slight forward lean is good; much more can cost efficiency.` });
  }
  return notes.slice(0, 3);
}

export function RunningResults({ metrics }: { metrics: Metric[] }) {
  const m = Object.fromEntries(metrics.map((x) => [x.metric_name, x.metric_value])) as Record<string, number>;
  const sym = m.knee_rom_symmetry;
  const known = new Set(["left_knee_rom", "right_knee_rom", "left_hip_rom", "right_hip_rom", "knee_rom_symmetry", "hip_rom_symmetry", "torso_lean_mean", "torso_lean_std"]);
  const rest = metrics.filter((x) => !known.has(x.metric_name));

  return (
    <>
      <Headline
        ring={sym ?? 0}
        ringLabel="Symmetry"
        kicker="Gait analysis"
        title={sym == null ? "Stride tracked" : sym >= 90 ? "Balanced stride" : "Uneven stride"}
        sub={`Hip symmetry ${m.hip_rom_symmetry != null ? `${Math.round(m.hip_rom_symmetry)}%` : "—"} • Torso lean ${m.torso_lean_mean != null ? `${Math.round(m.torso_lean_mean)}°` : "—"}`}
      />

      <section className="flex flex-col gap-space-sm">
        <SectionTitle title="Range of motion" aside="Per stride" />
        <div className="grid grid-cols-2 gap-gutter-mobile">
          <Gauge label="Left knee" deg={m.left_knee_rom} max={90} />
          <Gauge label="Right knee" deg={m.right_knee_rom} max={90} />
          <Gauge label="Left hip" deg={m.left_hip_rom} max={90} />
          <Gauge label="Right hip" deg={m.right_hip_rom} max={90} />
        </div>
      </section>

      <section className="flex flex-col gap-space-sm">
        <SectionTitle title="Posture" />
        <div className="grid grid-cols-2 gap-gutter-mobile">
          <StatTile label="Torso lean" value={m.torso_lean_mean != null ? `${Math.round(m.torso_lean_mean)}°` : "—"} sub={m.torso_lean_std != null ? `± ${m.torso_lean_std.toFixed(1)}° variation` : undefined} />
          <StatTile label="Knee symmetry" value={sym != null ? `${Math.round(sym)}%` : "—"} sub={sym != null ? (sym >= 90 ? "Balanced" : "Uneven") : undefined} />
          {rest.map((x) => (
            <StatTile key={x.metric_name} label={words(x.metric_name)} value={String(Math.round(x.metric_value * 10) / 10)} unit={x.unit ?? undefined} />
          ))}
        </div>
      </section>

      <CoachNotes notes={runningNotes(m)} />
    </>
  );
}

// ---------- Basketball ----------

const ACTION_COLOR: Record<string, string> = { Shoot: "#4be277", Dribble: "#00eefc", Sprint: "#ffba61", Move: "#bccbb9", Idle: "#3d4a3d" };
const DRILL_ICON = "fitness_center";

export function BasketballResults({ result }: { result: BasketballResult }) {
  const m = result.metrics ?? {};
  const counts = m.action_counts ?? {};
  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  const actions = Object.entries(counts)
    .map(([action, n]) => [action, total ? (n / total) * 100 : 0] as const)
    .sort((a, b) => b[1] - a[1]);
  const training = result.training ?? {};
  // The pipeline's own feedback and drills, shown as coach notes.
  const notes: Note[] = [
    ...(training.feedback ?? []).map((f) => ({ icon: "insights", title: f, body: "" })),
    ...(training.drills ?? []).map((d) => ({ icon: DRILL_ICON, title: "Drill", body: d })),
  ];

  return (
    <>
      <Headline
        ring={training.technique_score ?? 0}
        ringLabel="Technique"
        kicker={`Session score ${result.session_score ?? "—"}`}
        title={m.dominant_action ? `Mostly ${m.dominant_action.toLowerCase()}` : "No actions detected"}
        sub={`${total} frames classified`}
      />

      {actions.length > 0 && (
        <section className="rounded-xl bg-surface-container p-space-md flex flex-col gap-space-sm">
          <SectionTitle title="Action breakdown" aside="Share of frames" />
          {actions.map(([action, share]) => (
            <div key={action} className="flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <span className="font-body-sm text-body-sm text-on-surface">{action}</span>
                <span className="font-headline-md text-body-md font-bold text-on-surface tabular-nums">{Math.round(share)}%</span>
              </div>
              <div className="h-1.5 rounded-full bg-surface-container-lowest overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${share}%`, background: ACTION_COLOR[action] ?? "#869585" }}></div>
              </div>
            </div>
          ))}
        </section>
      )}

      <section className="flex flex-col gap-space-sm">
        <SectionTitle title="Joint angles" aside="Mean over clip" />
        <div className="grid grid-cols-2 gap-gutter-mobile">
          <Gauge label="Right elbow" deg={m.avg_right_elbow_angle} />
          <Gauge label="Left elbow" deg={m.avg_left_elbow_angle} />
          <Gauge label="Right knee" deg={m.avg_right_knee_angle} />
          <Gauge label="Left knee" deg={m.avg_left_knee_angle} />
        </div>
      </section>

      <CoachNotes notes={notes} />
    </>
  );
}
