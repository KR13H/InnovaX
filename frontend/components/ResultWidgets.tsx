"use client";

// Building blocks for the session results screen (Kinetic Ghost tokens).

export type Reading = { text: string; tone: string };
export type Note = { icon: string; title: string; body: string };

export function Ring({ value, label }: { value: number; label: string }) {
  const r = 30;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative w-[76px] h-[76px] shrink-0">
      <svg viewBox="0 0 76 76" className="w-full h-full -rotate-90">
        <circle cx="38" cy="38" r={r} fill="none" stroke="#262a31" strokeWidth="7" />
        <circle cx="38" cy="38" r={r} fill="none" stroke="#4be277" strokeWidth="7" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - Math.max(0, Math.min(100, value)) / 100)} style={{ filter: "drop-shadow(0 0 6px rgba(75,226,119,0.5))" }} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-headline-md text-[18px] leading-none font-bold text-on-surface">{Math.round(value)}%</span>
        <span className="font-label-caps text-[9px] text-on-surface-variant uppercase mt-0.5">{label}</span>
      </div>
    </div>
  );
}

/** Semicircle gauge for an angle (0°–max). */
export function Gauge({ label, deg, max = 180, reading, unit = "°" }: { label: string; deg: number | null | undefined; max?: number; reading?: Reading | null; unit?: string }) {
  const value = deg == null ? null : Math.max(0, Math.min(max, deg));
  const len = Math.PI * 34;
  return (
    <div className="p-space-sm rounded-xl bg-surface-container-low flex flex-col items-center">
      <span className="self-start font-label-caps text-label-caps text-on-surface-variant uppercase truncate max-w-full">{label}</span>
      <svg viewBox="0 0 84 48" className="w-full max-w-[120px] mt-1">
        <path d="M 8 44 A 34 34 0 0 1 76 44" fill="none" stroke="#262a31" strokeWidth="6" strokeLinecap="round" />
        {value != null && (
          <path d="M 8 44 A 34 34 0 0 1 76 44" fill="none" stroke="#00eefc" strokeWidth="6" strokeLinecap="round" strokeDasharray={len} strokeDashoffset={len * (1 - value / max)} />
        )}
      </svg>
      <span className="font-metric-large text-[26px] leading-none text-on-surface -mt-3">{deg != null ? `${Math.round(deg)}${unit}` : "—"}</span>
      {reading && <span className={`font-label-caps text-label-caps uppercase mt-1 ${reading.tone}`}>{reading.text}</span>}
    </div>
  );
}

export function SectionTitle({ title, aside }: { title: string; aside?: string }) {
  return (
    <div className="flex items-center justify-between px-1">
      <span className="font-headline-md text-body-lg font-semibold text-on-surface">{title}</span>
      {aside && <span className="font-label-caps text-label-caps text-on-surface-variant uppercase">{aside}</span>}
    </div>
  );
}

export function Headline({ ring, ringLabel, kicker, title, sub }: { ring: number; ringLabel: string; kicker: string; title: string; sub: string }) {
  return (
    <section className="rounded-xl bg-surface-container p-space-md flex items-center gap-space-md shadow-[0_0_24px_-6px_rgba(34,197,94,0.25)]">
      <Ring value={ring} label={ringLabel} />
      <div className="flex flex-col min-w-0">
        <span className="font-label-caps text-label-caps text-primary uppercase tracking-widest">{kicker}</span>
        <span className="font-headline-xl-mobile text-[26px] leading-tight text-on-surface capitalize">{title}</span>
        <span className="font-body-sm text-body-sm text-on-surface-variant">{sub}</span>
      </div>
    </section>
  );
}

export function CoachNotes({ notes }: { notes: Note[] }) {
  if (notes.length === 0) return null;
  return (
    <section className="rounded-xl bg-surface-container p-space-md flex flex-col gap-space-sm">
      <div className="flex items-center gap-2">
        <span className="material-symbols-outlined text-secondary text-[20px]">neurology</span>
        <span className="font-headline-md text-body-lg font-semibold text-on-surface">Coach notes</span>
      </div>
      {notes.map((n, i) => (
        <div key={`${n.title}-${i}`} className="flex items-start gap-space-sm p-space-sm rounded-lg bg-surface-container-low">
          <span className="material-symbols-outlined text-primary text-[20px] mt-0.5">{n.icon}</span>
          <div className="flex flex-col">
            <span className="font-body-sm text-body-sm font-semibold text-on-surface">{n.title}</span>
            {n.body && <span className="font-body-sm text-[13px] text-on-surface-variant leading-snug">{n.body}</span>}
          </div>
        </div>
      ))}
      <span className="font-body-sm text-[11px] text-outline">Guidance from your movement data — not medical advice.</span>
    </section>
  );
}

export function StatTile({ label, value, unit, sub }: { label: string; value: string; unit?: string; sub?: string }) {
  return (
    <div className="p-space-sm rounded-xl bg-surface-container-low flex flex-col min-w-0">
      <span className="font-label-caps text-label-caps text-on-surface-variant uppercase truncate">{label}</span>
      <span className={`font-metric-large ${value.length > 6 ? "text-[16px] leading-snug mt-1" : "text-[24px] leading-tight truncate"} text-on-surface capitalize`}>
        {value}
        {unit ? <span className="font-body-sm text-body-sm text-outline normal-case"> {unit}</span> : null}
      </span>
      {sub && <span className="font-label-caps text-label-caps text-secondary uppercase truncate">{sub}</span>}
    </div>
  );
}
