"use client";

// Compare a session with an earlier one of the same sport: ghost-overlay replay of both
// skeletons, the two clips side by side, and what changed in each key metric.

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import BottomNav from "@/components/BottomNav";
import GhostCompare from "@/components/GhostCompare";
import { api, getToken } from "@/lib/api";
import { type Recap, type Session, SPORT_BY_ID, SPORT_ICON, SPORT_NAME } from "@/lib/data";
import { SPORT_METRICS, fmtValue, improvement } from "@/lib/progress";

const shortDate = (iso: string) => new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric" });

async function videoUrl(id: number) {
  const r = await fetch(`/api/sessions/${id}/video`, { headers: { Authorization: `Bearer ${getToken()}` } });
  return r.ok ? URL.createObjectURL(await r.blob()) : null;
}

export default function Compare() {
  const router = useRouter();
  const [ids, setIds] = useState<{ now: number; past: number | null } | null>(null);
  const [sessions, setSessions] = useState<Session[] | null>(null);
  const [recaps, setRecaps] = useState<Record<number, Recap | null>>({});
  const [clips, setClips] = useState<Record<number, string | null>>({});
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    const now = Number(q.get("now"));
    if (!now) return setError("Pick a session to compare from its results page.");
    setIds({ now, past: Number(q.get("past")) || null });
    if (!getToken()) return setError("Sign in to compare sessions.");
    api<Session[]>("/sessions").then(setSessions, (e) => setError(e.message));
  }, []);

  const current = sessions?.find((s) => s.id === ids?.now);
  const sport = current ? SPORT_BY_ID[current.sport_id] : undefined;
  // Earlier sessions of the same sport that have a video, newest first.
  const candidates = useMemo(
    () =>
      (sessions ?? [])
        .filter((s) => current && s.sport_id === current.sport_id && s.id !== current.id && s.video_url?.startsWith("uploads/") && s.created_at <= current.created_at)
        .sort((a, b) => b.created_at.localeCompare(a.created_at)),
    [sessions, current],
  );
  const pastId = ids?.past ?? candidates[0]?.id ?? null;
  const past = sessions?.find((s) => s.id === pastId);

  // Load recaps + clips for the pair being compared.
  useEffect(() => {
    for (const id of [ids?.now, pastId]) {
      if (!id || id in recaps) continue;
      setRecaps((r) => ({ ...r, [id]: null }));
      api<Recap>(`/sessions/${id}/recap`).then((rc) => setRecaps((r) => ({ ...r, [id]: rc })), () => {});
      videoUrl(id).then((u) => setClips((c) => ({ ...c, [id]: u })));
    }
  }, [ids?.now, pastId]); // eslint-disable-line react-hooks/exhaustive-deps

  function pick(id: number) {
    setIds((v) => (v ? { ...v, past: id } : v));
    router.replace(`/compare?now=${ids?.now}&past=${id}`);
  }

  const nowRecap = ids ? recaps[ids.now] : null;
  const pastRecap = pastId ? recaps[pastId] : null;
  const rows = sport && nowRecap && pastRecap
    ? SPORT_METRICS[sport].map((d) => {
        const a = d.read(pastRecap);
        const b = d.read(nowRecap);
        return { d, a, b, delta: a != null && b != null ? improvement(d, a, b) : null };
      })
    : [];

  return (
    <div className="bg-surface text-on-surface font-body-md text-body-md min-h-screen flex flex-col antialiased">
      <header className="fixed top-0 inset-x-0 z-50 bg-surface/85 backdrop-blur-xl pt-safe">
        <div className="h-16 px-space-xs flex items-center gap-space-xs">
          <button aria-label="Back" onClick={() => router.back()} className="w-11 h-11 flex items-center justify-center text-on-surface" type="button">
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <div className="flex flex-col">
            <span className="font-label-caps text-label-caps text-primary uppercase tracking-widest">Compare</span>
            <h1 className="font-headline-md text-headline-md text-on-surface leading-tight">{sport ? `${SPORT_NAME[sport]}: then vs now` : "Then vs now"}</h1>
          </div>
        </div>
      </header>

      <main className="flex flex-col w-full pt-20 pb-28 px-margin-mobile gap-space-md">
        {error && <p className="font-body-sm text-body-sm text-tertiary">{error}</p>}

        {current && !past && sessions && (
          <section className="rounded-xl bg-surface-container p-space-lg flex flex-col items-center text-center gap-space-sm">
            <span className="material-symbols-outlined text-[36px] text-outline">{sport ? SPORT_ICON[sport] : "compare"}</span>
            <span className="font-headline-md text-body-lg text-on-surface">No earlier session to compare</span>
            <span className="font-body-sm text-body-sm text-on-surface-variant">Record another {sport ? SPORT_NAME[sport].toLowerCase() : ""} session and come back to see how you&apos;ve changed.</span>
          </section>
        )}

        {current && past && (
          <>
            {/* Which past session */}
            <label className="flex flex-col gap-1">
              <span className="font-label-caps text-label-caps uppercase text-on-surface-variant">Compare with</span>
              <select value={past.id} onChange={(e) => pick(Number(e.target.value))} className="w-full appearance-none rounded-xl bg-surface-container px-space-md py-3 text-on-surface font-body-md text-body-md focus:outline-none focus:ring-1 focus:ring-secondary-container">
                {candidates.map((s) => (
                  <option key={s.id} value={s.id}>
                    Session #{s.id} · {shortDate(s.created_at)}
                  </option>
                ))}
              </select>
            </label>

            {clips[current.id] && clips[past.id] ? (
              <GhostCompare
                key={`${current.id}-${past.id}`}
                nowSrc={clips[current.id]!}
                pastSrc={clips[past.id]!}
                nowLabel={`#${current.id} · ${shortDate(current.created_at)}`}
                pastLabel={`#${past.id} · ${shortDate(past.created_at)}`}
              />
            ) : (
              <div className="h-80 rounded-xl bg-surface-container-lowest flex items-center justify-center gap-2 text-on-surface-variant">
                <span className="material-symbols-outlined animate-spin">progress_activity</span>
                <span className="font-label-caps text-label-caps uppercase">Loading clips…</span>
              </div>
            )}

            {/* What changed */}
            <section className="rounded-xl bg-surface-container p-space-md flex flex-col">
              <div className="flex items-center justify-between pb-2">
                <span className="font-headline-md text-body-lg font-semibold text-on-surface">What changed</span>
                <span className="font-label-caps text-label-caps uppercase text-on-surface-variant">Past → Now</span>
              </div>
              {rows.length === 0 && <p className="font-body-sm text-body-sm text-on-surface-variant py-2">Loading results…</p>}
              {rows.map(({ d, a, b, delta }) => {
                const better = delta != null && delta > 0.5;
                const worse = delta != null && delta < -0.5;
                return (
                  <div key={d.key} className="flex items-center justify-between gap-2 py-2.5 border-t border-surface-container-highest first:border-t-0">
                    <span className="font-body-sm text-body-sm text-on-surface min-w-0">{d.label}</span>
                    <span className="flex items-center gap-2 shrink-0">
                      <span className="font-headline-md text-body-sm text-on-surface-variant tabular-nums">{fmtValue(d, a)}</span>
                      <span className="material-symbols-outlined text-[14px] text-outline">arrow_forward</span>
                      <span className="font-headline-md text-body-md text-on-surface tabular-nums">{fmtValue(d, b)}</span>
                      {delta != null && (
                        <span className={`inline-flex items-center gap-0.5 font-label-caps text-[10px] uppercase w-16 justify-end ${better ? "text-primary" : worse ? "text-tertiary" : "text-on-surface-variant"}`}>
                          <span className="material-symbols-outlined text-[14px]">{better ? "trending_up" : worse ? "trending_down" : "trending_flat"}</span>
                          {better ? "Better" : worse ? "Worse" : "Same"}
                        </span>
                      )}
                    </span>
                  </div>
                );
              })}
            </section>

            {sport && (
              <Link href={`/progress?sport=${sport}`} className="flex items-center justify-between rounded-xl bg-surface-container-high px-space-md py-3">
                <span className="flex items-center gap-space-sm">
                  <span className="material-symbols-outlined text-secondary-container">monitoring</span>
                  <span className="font-body-md text-body-md text-on-surface">See your full progress</span>
                </span>
                <span className="material-symbols-outlined text-on-surface-variant">chevron_right</span>
              </Link>
            )}
          </>
        )}
      </main>
      <BottomNav capture={false} />
    </div>
  );
}
