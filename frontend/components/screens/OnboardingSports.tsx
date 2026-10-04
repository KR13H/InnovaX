"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { api } from "@/lib/api";
import { saveDraft } from "@/lib/onboarding";

type Role = "primary" | "secondary" | "active";

const SPORTS = [
  { slug: "tennis", icon: "sports_tennis", name: "Tennis", desc: "Forehand, backhand, and serve tracking" },
  { slug: "cricket", icon: "sports_cricket", name: "Cricket: Fast Bowling", desc: "Run-up rhythm and bowling mechanics" },
  { slug: "basketball", icon: "sports_basketball", name: "Basketball", desc: "Shooting posture and elbow alignment" },
  { slug: "running", icon: "directions_run", name: "Running", desc: "Sprint posture and cadence consistency" },
];

// Card styling per role, taken from the Stitch markup for each state.
const CARD: Record<Role, { card: string; icon: string; badge: string; check: string }> = {
  primary: {
    card: "relative overflow-hidden rounded-xl bg-surface-container p-space-md flex items-center justify-between shadow-[0_0_20px_-4px_rgba(34,197,94,0.3)]",
    icon: "w-10 h-10 rounded-lg bg-surface-container-highest flex items-center justify-center text-primary shrink-0 shadow-[0_0_12px_rgba(34,197,94,0.3)]",
    badge: "font-label-caps text-[10px] uppercase px-2 py-0.5 rounded-full bg-primary/20 text-primary font-bold",
    check: "w-7 h-7 rounded-full bg-primary flex items-center justify-center text-on-primary shrink-0 shadow-[0_0_10px_#22c55e]",
  },
  secondary: {
    card: "relative overflow-hidden rounded-xl bg-surface-container-low p-space-md flex items-center justify-between shadow-[0_0_18px_-6px_rgba(0,240,255,0.25)]",
    icon: "w-10 h-10 rounded-lg bg-surface-container-high flex items-center justify-center text-secondary-container shrink-0",
    badge: "font-label-caps text-[10px] uppercase px-2 py-0.5 rounded-full bg-secondary-container/20 text-secondary-container font-bold",
    check: "w-7 h-7 rounded-full bg-secondary-container flex items-center justify-center text-on-secondary shrink-0 shadow-[0_0_10px_#00eefc]",
  },
  active: {
    card: "relative overflow-hidden rounded-xl bg-surface-container-low p-space-md flex items-center justify-between",
    icon: "w-10 h-10 rounded-lg bg-surface-container-high flex items-center justify-center text-secondary shrink-0",
    badge: "font-label-caps text-[10px] uppercase px-2 py-0.5 rounded-full bg-surface-container-highest text-on-surface-variant font-semibold",
    check: "w-7 h-7 rounded-full bg-secondary-container/30 flex items-center justify-center text-secondary-container shrink-0",
  },
};

const GOALS = [
  "Improve technique & consistency",
  "Match previous personal bests",
  "Injury prevention & joint load",
  "Increase stroke / release speed",
];

// Generated from design/stitch/onboarding_sports_goals/code.html by scripts/stitch-to-jsx.mjs.
export default function OnboardingSports() {
  const router = useRouter();
  // Ordered by priority: first is primary, second is secondary, the rest are active.
  const [selected, setSelected] = useState(["tennis", "cricket", "basketball", "running"]);
  const [goals, setGoals] = useState([GOALS[0], GOALS[1], GOALS[3]]);
  const [sessions, setSessions] = useState(5);
  const [building, setBuilding] = useState(false);

  const roleOf = (slug: string): Role | null => {
    const i = selected.indexOf(slug);
    return i < 0 ? null : i === 0 ? "primary" : i === 1 ? "secondary" : "active";
  };
  const toggleSport = (slug: string) =>
    setSelected((s) => (s.includes(slug) ? (s.length > 1 ? s.filter((x) => x !== slug) : s) : [...s, slug]));
  const toggleGoal = (g: string) => setGoals((s) => (s.includes(g) ? s.filter((x) => x !== g) : [...s, g]));

  async function build() {
    setBuilding(true);
    saveDraft({ sports: selected, goals, sessions_per_week: sessions });
    try {
      // Link chosen sports to the athlete; skipped silently in demo mode (no session).
      const all = await api<{ id: number; slug: string }[]>("/sports");
      await Promise.all(
        selected.map((slug, i) => {
          const sport = all.find((s) => s.slug === slug);
          return sport
            ? api("/athlete/sports", { method: "POST", body: JSON.stringify({ sport_id: sport.id, is_primary: i === 0 }) }).catch(() => {})
            : null;
        }),
      );
    } catch {
      // Backend unreachable: continue the demo flow.
    }
    router.push("/onboarding/analyzing");
  }

  return (
    <div className="bg-surface text-on-surface font-body-md text-body-md flex flex-col min-h-screen selection:bg-primary-container selection:text-on-primary-container">
      <header className="fixed top-0 w-full z-50 pt-safe bg-surface/85 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.35)]">
        <div className="h-16 px-gutter-mobile flex items-center justify-between">
          <div className="flex items-center gap-space-xs">
            <button aria-label="Go back" className="min-w-[44px] min-h-[44px] flex items-center justify-center text-on-surface hover:text-primary transition-colors rounded-full active:bg-surface-container-high" onClick={() => router.back()} type="button">
              <span className="material-symbols-outlined text-[24px]">
                chevron_left
              </span>
            </button>
            <div className="flex items-center gap-space-xs">
              <img alt="Athletic silhouette icon with a subtle glowing cyan/lime duplicate shadow offset mark, symbolizing 'ShadowAthlete' and 'Your only opponent is you'. Brand logo" className="h-6 w-auto object-contain" src="https://lh3.googleusercontent.com/aida/AEtjO1U3su2IAJUfImc-QDFIgi5gzTYlDbkzgOVUovo_BNyYGtYNa9qhX4P-2oyefwHVQLhZ1Ab4ChydkqNbQYJ6oFFxL_5J_Qddc6EFgbqZ0J_0WRGiZMLAdr9Zbyj22BuHGThZeOIqyijB8g8KkiHaFQvfwq9-n-bK31wtBSZzAKwsfXkmsWzUb-vNdXU1acb3RA2HpoEFk8GGPHAJO2_JBzWeKHcIe9Wj_ZNrU6FINegMlz-Os5bYSEFdNK0" />
              <h1 className="font-headline-md text-headline-md text-on-surface truncate max-w-[200px]">
                Onboarding
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-space-xs">
            <img alt="Profile" className="w-8 h-8 rounded-full object-cover p-0.5 bg-surface-container-high" src="https://lh3.googleusercontent.com/aida/AEtjO1VMnOn0JU8o67qYlYqYCfMg1WkAfuvSKYr7KKY53q6BP96YUKVar9XDhOk_G0q9oEEjtyqPTnjPz-jEJrc0WYt38c3cNqYZcfCBRJw4q5MRzBkPerclP4uhy8_16kr0ms5etlkMLS_PsBNC0_ErIoeYXxd2zuxLTVC_llRYg3rM1224q-gsYbE7WRhzle6ndzpYuYW6zR9J2qVASfJ92oWz4LbzfGQXXuIcMd1SHheY-ciDcBNW3LLRji8" />
            <button aria-label="Close view" className="min-w-[44px] min-h-[44px] flex items-center justify-center text-on-surface-variant hover:text-on-surface transition-colors rounded-full active:bg-surface-container-high" onClick={() => router.back()} type="button">
              <span className="material-symbols-outlined text-[20px]">
                close
              </span>
            </button>
          </div>
        </div>
      </header>
      <main className="flex flex-col relative w-full pt-16 bg-surface min-h-screen">
        <div className="flex flex-col w-full text-on-surface pb-safe">
          {/* Progress Header Track */}
          <div className="px-margin-mobile pt-space-sm pb-space-xs flex flex-col gap-space-xs">
            <div className="flex items-center justify-between">
              <span className="font-label-caps text-label-caps text-primary uppercase tracking-wider flex items-center gap-1.5">
                <span className="inline-block w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_#22c55e]"></span>
                {" "}Step 2 of 2: Sports &amp; Goals
              </span>
              <span className="font-label-caps text-label-caps text-secondary font-semibold">
                100% Final Step
              </span>
            </div>
            {/* 100% Progress Bar */}
            <div className="w-full h-1 bg-surface-container-high rounded-full overflow-hidden">
              <div className="h-full bg-primary-container rounded-full w-full shadow-[0_0_12px_#22c55e]"></div>
            </div>
          </div>
          {/* Hero Header Typography */}
          <div className="px-margin-mobile pt-space-md pb-space-sm">
            <h2 className="font-headline-xl-mobile text-headline-xl-mobile text-on-surface">
              Select your sports and goals
            </h2>
            {" "}
            <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
              All four sports feed into your single persistent avatar. Choose your primary focus and weekly commitment.
            </p>
          </div>
          {/* Content Stream */}
          <div className="flex flex-col gap-space-lg px-margin-mobile pt-space-xs">
            {/* Section 1: Sport Selection */}
            <section className="flex flex-col gap-space-sm">
              <div className="flex items-center justify-between">
                <h3 className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider">
                  Disciplines &amp; Biomechanics
                </h3>
                <span className="font-label-badge text-label-badge text-secondary font-medium">
                  {selected.length} of {SPORTS.length} active
                </span>
              </div>
              {/* Sports Cards Grid */}
              <div className="flex flex-col gap-space-xs">
                {SPORTS.map((sport) => {
                  const role = roleOf(sport.slug);
                  const c = CARD[role ?? "active"];
                  return (
                    <div key={sport.slug} role="button" tabIndex={0} aria-pressed={!!role} onClick={() => toggleSport(sport.slug)} onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && toggleSport(sport.slug)} className={`${c.card} cursor-pointer transition-opacity ${role ? "" : "opacity-60"}`}>
                      <div className="flex items-start gap-space-sm min-w-0 pr-2">
                        <div className={c.icon}>
                          <span className="material-symbols-outlined text-[22px]">
                            {sport.icon}
                          </span>
                        </div>
                        <div className="flex flex-col min-w-0">
                          <div className="flex items-center gap-space-xs flex-wrap">
                            <span className="font-headline-md text-[17px] font-semibold text-on-surface truncate">
                              {sport.name}
                            </span>
                            {role ? (
                              <span className={c.badge}>
                                {role}
                              </span>
                            ) : null}
                          </div>
                          <p className="font-body-sm text-[12px] text-on-surface-variant line-clamp-1 mt-0.5">
                            {sport.desc}
                          </p>
                        </div>
                      </div>
                      {role ? (
                        <div className={c.check}>
                          <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                            check
                          </span>
                        </div>
                      ) : (
                        <div className="w-7 h-7 rounded-full bg-surface-container-highest shrink-0"></div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
            {/* Visual Avatar Telemetry Banner */}
            <div className="w-full rounded-xl bg-surface-container p-space-md flex items-center gap-space-md relative overflow-hidden">
              <div className="w-14 h-14 rounded-lg bg-surface-container-lowest overflow-hidden shrink-0 flex items-center justify-center relative">
                <img className="w-full h-full object-cover" data-alt="Cybernetic holographic athletic humanoid wireframe avatar illuminated with glowing lime green kinetic joints and cyan telemetry ghost aura in dark studio sports lab, high fidelity rendering" src="https://lh3.googleusercontent.com/aida-public/AB6AXuD937jgpr5B6DbyIHHMkpLLm9NWjyZ-I_pyDndsCUbv-tCGA25wBjVv1uWvIU3Fbfpys3tgYIdDr7BjIJsJWGWHpg_WQcamGm3ULdV34cVUdDDFMWgjgeolQS3SYbYJpe1caF2Goy3GjLYk_4BwA7QmfsvL5RZSzHoyA_cNaP09UxurY8DxqxE3ji2RPZ90Ckb2xA6tYUNgd45aliZ3_2ROvkvXF1uEeDdSuuok27wON5xFvZ_fDKL_" />
                <div className="absolute inset-0 bg-gradient-to-t from-surface-container-lowest/80 via-transparent to-transparent"></div>
              </div>
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-label-caps text-[10px] text-primary uppercase font-bold tracking-widest">
                    Avatar Synced
                  </span>
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
                </div>
                <span className="font-headline-md text-[14px] text-on-surface font-semibold truncate">
                  Multi-Discipline Kinetic Mesh
                </span>
                <span className="font-body-sm text-[12px] text-on-surface-variant">
                  Kinematic limits computed across all 4 regimes
                </span>
              </div>
            </div>
            {/* Section 2: Primary Training Goals (Interactive Pills) */}
            <section className="flex flex-col gap-space-sm">
              <div className="flex items-center justify-between">
                <h3 className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider">
                  Primary Training Goals
                </h3>
                <span className="font-label-badge text-label-badge text-primary">
                  {goals.length} Selected
                </span>
              </div>
              <div className="flex flex-wrap gap-2" id="goals-container">
                {GOALS.map((g) => {
                  const on = goals.includes(g);
                  return (
                    <button key={g} onClick={() => toggleGoal(g)} aria-pressed={on} className={`goal-pill px-space-md py-2.5 rounded-full ${on ? "bg-surface-container-highest text-primary" : "bg-surface-container-low text-on-surface-variant"} flex items-center gap-2 active:scale-95 transition-transform`} type="button">
                      <span className={`material-symbols-outlined text-[18px] ${on ? "text-primary" : "text-outline"}`} style={{ fontVariationSettings: on ? "'FILL' 1" : "'FILL' 0" }}>
                        {on ? "check_circle" : "radio_button_unchecked"}
                      </span>
                      <span className={`font-body-sm text-[13px] ${on ? "font-semibold text-on-surface" : "font-normal text-on-surface-variant"}`}>
                        {g}
                      </span>
                    </button>
                  );
                })}
              </div>
            </section>
            {/* Section 3: Training Availability */}
            <section className="flex flex-col gap-space-sm mb-space-sm">
              <h3 className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider">
                Training Availability
              </h3>
              <div className="rounded-xl bg-surface-container p-space-md flex flex-col gap-space-md">
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="font-body-md text-on-surface font-semibold">
                      Sessions per week
                    </span>
                    <span className="font-body-sm text-[12px] text-on-surface-variant">
                      Calibrates your shadow recovery curve
                    </span>
                  </div>
                  {/* Stepper */}
                  <div className="flex items-center bg-surface-container-highest rounded-full p-1 gap-1">
                    <button aria-label="Decrease session count" className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-on-surface hover:text-primary active:bg-surface-container-low transition-colors" id="btn-decrement" type="button" onClick={() => setSessions((n) => Math.max(1, n - 1))}>
                      <span className="material-symbols-outlined text-[18px]">
                        remove
                      </span>
                    </button>
                    <span className="font-headline-md text-[16px] text-primary font-bold px-2.5 select-none" id="session-count">
                      {sessions}
                    </span>
                    <button aria-label="Increase session count" className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-on-surface hover:text-primary active:bg-surface-container-low transition-colors" id="btn-increment" type="button" onClick={() => setSessions((n) => Math.min(14, n + 1))}>
                      <span className="material-symbols-outlined text-[18px]">
                        add
                      </span>
                    </button>
                  </div>
                </div>
                {/* Telemetry Estimation Banner */}
                <div className="rounded-lg bg-surface-container-lowest p-space-sm flex items-center justify-between">
                  <div className="flex items-center gap-space-xs text-secondary">
                    <span className="material-symbols-outlined text-[18px] text-secondary">
                      timer
                    </span>
                    <span className="font-body-sm text-[12px] text-on-surface-variant">
                      Estimated weekly tracking
                    </span>
                  </div>
                  <span className="font-label-caps text-label-caps text-secondary font-bold tracking-normal" id="est-hours">
                    ~{(sessions * 0.5).toFixed(1)} hrs active
                  </span>
                </div>
              </div>
            </section>
            {/* Bottom CTA Fixed-feel Container */}
            <div className="pt-space-xs pb-space-lg flex flex-col gap-space-xs">
              <button className="w-full h-14 rounded-full bg-primary text-on-primary font-headline-md text-[17px] font-bold tracking-tight flex items-center justify-center gap-space-xs shadow-[0_0_24px_rgba(34,197,94,0.35)] active:scale-[0.98] transition-all disabled:brightness-125 disabled:cursor-wait" id="build-athlete-btn" type="button" onClick={build} disabled={building}>
                <span>
                  {building ? "Building…" : "Build my athlete"}
                </span>
                <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                  auto_awesome
                </span>
              </button>
              <p className="font-body-sm text-[11px] text-center text-on-surface-variant/70">
                Continuous multi-sport AI models deploy instantaneously to your twin
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
