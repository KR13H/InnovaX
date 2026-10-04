"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ApiError, api, athlete } from "@/lib/api";
import { readDraft, saveDraft } from "@/lib/onboarding";

const UNIT_ON_METRIC = "flex-1 py-space-xs px-space-sm rounded-lg font-label-badge text-label-badge text-surface-container-lowest bg-primary font-bold shadow-md transition-all flex items-center justify-center gap-1.5";
const UNIT_ON_IMPERIAL = "flex-1 py-space-xs px-space-sm rounded-lg font-label-badge text-label-badge text-surface-container-lowest bg-secondary-container font-bold shadow-md transition-all flex items-center justify-center gap-1.5";
const UNIT_OFF = "flex-1 py-space-xs px-space-sm rounded-lg font-label-badge text-label-badge text-on-surface-variant hover:text-on-surface transition-all flex items-center justify-center gap-1.5";

const LEVELS = [
  { value: "beginner", icon: "directions_run", title: "Beginner", sub: "Recreational & baseline fitness" },
  { value: "intermediate", icon: "fitness_center", title: "Intermediate", sub: "Club competitor & regional events" },
  { value: "advanced", icon: "bolt", title: "Advanced / Semi-Pro", sub: "High-load data streams & tactical splits" },
  { value: "elite", icon: "trophy", title: "Elite / Professional", sub: "National team & Olympic standards" },
];

// Generated from design/stitch/onboarding_personal_details/code.html by scripts/stitch-to-jsx.mjs.
export default function OnboardingDetails() {
  const router = useRouter();
  const [unit, setUnit] = useState<"metric" | "imperial">("metric");
  const [name, setName] = useState("Alex Carter");
  const [age, setAge] = useState("24");
  const [weight, setWeight] = useState("78");
  const [height, setHeight] = useState(185);
  const [level, setLevel] = useState("advanced");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const draft = readDraft();
    if (draft.name) setName(draft.name);
  }, []);

  function switchUnit(next: "metric" | "imperial") {
    if (next === unit) return;
    setUnit(next);
    // Same defaults as the Stitch prototype; real values convert on submit.
    setHeight(next === "metric" ? 185 : 73);
    setWeight(next === "metric" ? "78" : "172");
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const height_cm = unit === "metric" ? height : Math.round(height * 2.54);
    const weight_kg = unit === "metric" ? Number(weight) : Math.round(Number(weight) * 0.4536 * 10) / 10;
    const profile = { name: name.trim(), age: Number(age) || undefined, height_cm, weight_kg, experience_level: level };
    saveDraft(profile);
    setSaving(true);
    try {
      await athlete.createProfile(profile);
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        await api("/athlete/profile", { method: "PATCH", body: JSON.stringify(profile) }).catch(() => {});
      } else if (err instanceof ApiError && err.status >= 400 && err.status < 500 && err.status !== 401) {
        // Validation errors stop here; signed-out users and an unreachable server continue in demo mode.
        setSaving(false);
        return setError(err instanceof Error ? err.message : "Could not save profile");
      }
    }
    router.push("/onboarding/sports");
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
        <div className="flex flex-col w-full pb-safe">
          {/* Interactive Progress Header */}
          <div className="px-margin-mobile pt-space-sm pb-space-md">
            <div className="flex items-center justify-between mb-space-xs">
              <span className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider">
                Step 1 of 2
              </span>
              <span className="font-label-caps text-label-caps text-primary flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
                {" "}Twin Calibration
              </span>
            </div>
            {" "}
            {/* Segmented Track Bar */}
            {" "}
            <div className="relative w-full h-1.5 bg-surface-container-high rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-primary to-secondary rounded-full w-1/2 shadow-[0_0_12px_rgba(34,197,94,0.6)]"></div>
            </div>
          </div>
          <div className="px-margin-mobile flex flex-col gap-space-lg">
            {/* Hero / Orientation Header */}
            <section className="flex flex-col gap-space-xs">
              <div className="inline-flex items-center gap-space-xs self-start px-space-sm py-0.5 rounded-full bg-surface-container-high text-secondary">
                <span className="material-symbols-outlined text-[14px]">
                  tune
                </span>
                <span className="font-label-caps text-label-caps uppercase">
                  Telemetry Mesh Baseline
                </span>
              </div>
              <h2 className="font-headline-xl-mobile text-headline-xl-mobile text-on-surface tracking-tight">
                Build your athlete foundation
              </h2>
              <p className="font-body-md text-body-md text-on-surface-variant">
                These biometrics calibrate your digital twin's physical proportions and movement physics.
              </p>
            </section>
            {/* Visual Biometric Calibration Preview Card */}
            <section className="bg-surface-container-low rounded-xl p-space-md shadow-md flex items-center justify-between relative overflow-hidden">
              <div className="absolute -right-6 -bottom-6 w-32 h-32 rounded-full bg-secondary-container/10 blur-2xl pointer-events-none"></div>
              <div className="flex items-center gap-space-md z-10">
                <div className="w-14 h-14 rounded-xl bg-surface-container-highest flex items-center justify-center relative">
                  {/* Wireframe twin graphic */}
                  <svg className="w-8 h-8 text-secondary" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                    <circle cx="12" cy="4" r="2.5" stroke="currentColor"></circle>
                    <path d="M12 6.5V13" stroke="currentColor"></path>
                    <path d="M8 9.5l4 2 4-2" stroke="currentColor"></path>
                    <path d="M9.5 17L12 13l2.5 4" stroke="currentColor"></path>
                    <path d="M8.5 21l1-4m5 4l-1-4" stroke="currentColor"></path>
                  </svg>
                  <span className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full bg-primary shadow-[0_0_8px_#22c55e]"></span>
                </div>
                <div>
                  <div className="font-label-caps text-label-caps text-secondary uppercase tracking-widest">
                    Digital Twin Status
                  </div>
                  {" "}
                  <div className="font-headline-md text-headline-md text-on-surface">
                    Kinematic Sync Ready
                  </div>
                  {" "}
                  <div className="font-body-sm text-body-sm text-on-surface-variant">
                    Proportions adjust real-time
                  </div>
                </div>
              </div>
              <div className="z-10 flex flex-col items-end">
                <span className="font-metric-large text-metric-large text-primary leading-none">
                  1:1
                </span>
                <span className="font-label-caps text-label-caps text-outline uppercase mt-1">
                  Scale Ratio
                </span>
              </div>
            </section>
            {/* Unit Toggle Control */}
            <div className="flex p-1 bg-surface-container-lowest rounded-xl shadow-inner">
              <button className={unit === "metric" ? UNIT_ON_METRIC : UNIT_OFF} id="metricBtn" type="button" onClick={() => switchUnit("metric")}>
                <span className="material-symbols-outlined text-[16px]">
                  straighten
                </span>
                {" "}Metric (cm / kg)
              </button>
              <button className={unit === "imperial" ? UNIT_ON_IMPERIAL : UNIT_OFF} id="imperialBtn" type="button" onClick={() => switchUnit("imperial")}>
                Imperial (ft / lbs)
              </button>
            </div>
            {/* Form Section */}
            <form className="flex flex-col gap-space-md" onSubmit={onSubmit}>
              {/* Full Name Field */}
              <div className="flex flex-col gap-space-xs">
                <label className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider flex items-center justify-between" htmlFor="fullName">
                  <span>
                    Athlete Callout / Full Name
                  </span>
                  <span className="text-secondary text-[10px] lowercase font-body-sm tracking-normal">
                    hud identifier
                  </span>
                </label>
                <div className="relative flex items-center">
                  <span className="material-symbols-outlined absolute left-space-md text-on-surface-variant text-[20px] pointer-events-none">
                    person
                  </span>
                  <input className="w-full bg-surface-container-lowest text-on-surface rounded-xl py-3 pl-11 pr-space-md font-body-md text-body-md focus:outline-none focus:bg-surface-container-high transition-colors" id="fullName" placeholder="Enter athlete name" type="text" required value={name} onChange={(e) => setName(e.target.value)} />
                  <span className="material-symbols-outlined absolute right-space-md text-primary text-[18px]">
                    verified
                  </span>
                </div>
              </div>
              {/* Age & Weight Grid */}
              <div className="grid grid-cols-2 gap-space-sm">
                {/* Age Input */}
                <div className="flex flex-col gap-space-xs">
                  <label className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider" htmlFor="athleteAge">
                    Age (Years)
                  </label>
                  <div className="relative flex items-center">
                    <span className="material-symbols-outlined absolute left-space-md text-on-surface-variant text-[18px] pointer-events-none">
                      event_available
                    </span>
                    <input className="w-full bg-surface-container-lowest text-on-surface rounded-xl py-3 pl-10 pr-space-md font-body-md text-body-md focus:outline-none focus:bg-surface-container-high transition-colors" id="athleteAge" type="number" min={10} max={100} value={age} onChange={(e) => setAge(e.target.value)} />
                  </div>
                </div>
                {/* Weight Input */}
                <div className="flex flex-col gap-space-xs">
                  <label className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider flex justify-between" htmlFor="athleteWeight">
                    <span>
                      Weight
                    </span>
                    <span className="text-secondary font-bold" id="weightUnitText">
                      {unit === "metric" ? "KG" : "LBS"}
                    </span>
                  </label>
                  <div className="relative flex items-center">
                    <span className="material-symbols-outlined absolute left-space-md text-on-surface-variant text-[18px] pointer-events-none">
                      monitor_weight
                    </span>
                    <input className="w-full bg-surface-container-lowest text-on-surface rounded-xl py-3 pl-10 pr-space-md font-body-md text-body-md focus:outline-none focus:bg-surface-container-high transition-colors" id="athleteWeight" type="number" step="0.1" value={weight} onChange={(e) => setWeight(e.target.value)} />
                  </div>
                </div>
              </div>
              {/* Height Telemetry Stepper + Slider */}
              <div className="bg-surface-container-lowest rounded-xl p-space-md flex flex-col gap-space-sm">
                <div className="flex items-center justify-between">
                  <label className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px] text-secondary">
                      height
                    </span>
                    {" "}Stature Calibration
                  </label>
                  <div className="flex items-baseline gap-1">
                    <span className="font-metric-large text-metric-large text-secondary leading-none" id="heightValue">
                      {height}
                    </span>
                    <span className="font-label-caps text-label-caps text-on-surface-variant uppercase" id="heightUnitText">
                      {unit === "metric" ? "CM" : "IN"}
                    </span>
                  </div>
                </div>
                {/* Slider Range with Neon Touch Track */}
                <div className="relative flex items-center my-space-xs">
                  <input className="w-full h-2 bg-surface-container-highest rounded-lg appearance-none cursor-pointer accent-secondary focus:outline-none" id="heightSlider" max={unit === "metric" ? 220 : 86} min={unit === "metric" ? 140 : 55} onChange={(e) => setHeight(Number(e.target.value))} type="range" value={height} />
                </div>
                <div className="flex items-center justify-between text-outline">
                  <span className="font-label-caps text-label-caps">
                    140 CM
                  </span>
                  <span className="font-label-caps text-label-caps text-primary/70">
                    SHADOW MESH AVG (178)
                  </span>
                  <span className="font-label-caps text-label-caps">
                    220 CM
                  </span>
                </div>
              </div>
              {/* Experience Level Matrix */}
              <div className="flex flex-col gap-space-xs pt-space-xs">
                <div className="flex items-center justify-between">
                  <span className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider">
                    Experience Level
                  </span>
                  <span className="font-label-caps text-label-caps text-primary">
                    Biomechanical Scaling
                  </span>
                </div>
                <div aria-label="Experience level selection" className="flex flex-col gap-2" role="radiogroup">
                  {LEVELS.map((l) => {
                    const on = l.value === level;
                    return (
                      <button key={l.value} role="radio" aria-checked={on} onClick={() => setLevel(l.value)} className={on ? "level-pill selected-pill w-full text-left p-space-sm rounded-xl bg-surface-container-high transition-all flex items-center justify-between shadow-[0_0_20px_rgba(34,197,94,0.2)]" : "level-pill w-full text-left p-space-sm rounded-xl bg-surface-container-low hover:bg-surface-container transition-all flex items-center justify-between group"} type="button">
                        <div className="flex items-center gap-space-sm">
                          <div className={on ? "w-8 h-8 rounded-lg bg-primary-container text-on-primary-container flex items-center justify-center shadow-[0_0_10px_#22c55e]" : "w-8 h-8 rounded-lg bg-surface-container-highest flex items-center justify-center text-on-surface-variant group-hover:text-on-surface"}>
                            <span className="material-symbols-outlined text-[18px]">
                              {l.icon}
                            </span>
                          </div>
                          <div className="flex flex-col">
                            <span className={on ? "font-body-md text-body-md text-primary font-bold" : "font-body-md text-body-md text-on-surface font-semibold"}>
                              {l.title}
                            </span>
                            <span className={on ? "font-body-sm text-body-sm text-on-surface" : "font-body-sm text-body-sm text-on-surface-variant"}>
                              {l.sub}
                            </span>
                          </div>
                        </div>
                        <div className={on ? "w-6 h-6 rounded-full bg-primary text-surface-container-lowest flex items-center justify-center shadow-md" : "w-5 h-5 rounded-full bg-surface-container-highest flex items-center justify-center text-transparent"}>
                          <span className={on ? "material-symbols-outlined text-[16px] font-bold" : "material-symbols-outlined text-[14px]"}>
                            check
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
              {/* Security / Encryption Badge */}
              <div className="flex items-start gap-space-sm p-space-sm bg-surface-container-lowest rounded-xl mt-space-xs">
                <span className="material-symbols-outlined text-secondary text-[20px] shrink-0 mt-0.5">
                  lock
                </span>
                <p className="font-body-sm text-body-sm text-on-surface-variant leading-snug">
                  Your biometric data is encrypted and used solely for kinematic scaling. We never share raw telemetry with third parties.
                </p>
              </div>
              {/* Primary Action CTA */}
              <div className="pt-space-sm pb-space-lg flex flex-col gap-space-xs">
                <button className="w-full bg-primary text-on-primary-container font-headline-md text-headline-md py-4 rounded-xl flex items-center justify-center gap-space-xs shadow-[0_0_24px_rgba(34,197,94,0.35)] active:scale-[0.98] transition-all hover:bg-primary-fixed disabled:opacity-80 disabled:cursor-wait" id="continueBtn" type="submit" disabled={saving}>
                  <span>
                    {saving ? "Calibrating…" : "Continue to Sports & Goals"}
                  </span>
                  <span className="material-symbols-outlined text-[24px]">
                    arrow_forward
                  </span>
                </button>
                {error && (
                  <span className="text-center font-label-caps text-label-caps text-error uppercase tracking-wider">
                    {error}
                  </span>
                )}
                <span className="text-center font-label-caps text-label-caps text-outline uppercase tracking-wider">
                  Twin baseline will compile automatically
                </span>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
