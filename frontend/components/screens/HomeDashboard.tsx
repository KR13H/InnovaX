"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { type Dashboard, type Session, SPORT_BY_ID, SPORT_ICON, SPORT_NAME, attributeScore, fmt, relativeDay, useApi } from "@/lib/data";
import { useAthleteName } from "@/lib/useAthlete";

import BottomNav from "@/components/BottomNav";

import Link from "next/link";

// Generated from design/stitch/athlete_home_dashboard/code.html by scripts/stitch-to-jsx.mjs.
const TOG_ON = "px-2.5 py-1 rounded-full font-label-badge text-label-badge bg-primary-container text-on-primary-container shadow-sm transition-all duration-200";
const TOG_OFF = "px-2.5 py-1 rounded-full font-label-badge text-label-badge text-on-surface-variant hover:text-on-surface transition-all duration-200";

export default function HomeDashboard() {
  const router = useRouter();
  const name = useAthleteName();
  const [demo, setDemo] = useState(true);
  const { data: dash } = useApi<Dashboard>("/athlete/dashboard");
  const { data: sessions } = useApi<Session[]>("/sessions");
  const live = !!dash;
  const level = dash?.athlete.level ?? 27;
  // Backend levelling: level = xp // 1000 + 1, so each level spans 1,000 XP.
  const xpInLevel = dash ? dash.athlete.xp - (level - 1) * 1000 : 2450;
  const xpSpan = dash ? 1000 : 3000;
  const sessionCount = (sport: number) => sessions?.filter((s) => s.sport_id === sport).length ?? 0;
  const attr = (name: string, demoValue: number) => (live ? attributeScore(dash?.attributes, name) : demoValue);
  const recent = [...(sessions ?? [])].sort((a, b) => b.created_at.localeCompare(a.created_at)).slice(0, 3);

  // A signed-in athlete with no attributes or sessions sees the "uncalibrated" twin state.
  useEffect(() => {
    if (dash && sessions) setDemo(dash.attributes.length > 0 || sessions.length > 0);
  }, [dash, sessions]);
  const [spinning, setSpinning] = useState(false);

  function spin() {
    setSpinning(true);
    setTimeout(() => setSpinning(false), 400);
  }

  return (
    <div className="bg-surface text-on-surface font-body-md text-body-md flex flex-col min-h-screen antialiased selection:bg-primary-container selection:text-on-primary-container">
      <header className="fixed top-0 inset-x-0 z-50 bg-surface-container-lowest/80 backdrop-blur-xl shadow-[0_4px_24px_rgba(0,0,0,0.5)] pt-safe">
        <div className="h-16 px-margin-mobile flex items-center justify-between gap-space-sm">
          <div className="flex items-center gap-space-sm min-w-0">
            <img alt="Athletic silhouette icon with a subtle glowing cyan/lime duplicate shadow offset mark, symbolizing 'ShadowAthlete' and 'Your only opponent is you'. Brand logo" className="h-8 w-auto object-contain shrink-0" src="https://lh3.googleusercontent.com/aida/AEtjO1U3su2IAJUfImc-QDFIgi5gzTYlDbkzgOVUovo_BNyYGtYNa9qhX4P-2oyefwHVQLhZ1Ab4ChydkqNbQYJ6oFFxL_5J_Qddc6EFgbqZ0J_0WRGiZMLAdr9Zbyj22BuHGThZeOIqyijB8g8KkiHaFQvfwq9-n-bK31wtBSZzAKwsfXkmsWzUb-vNdXU1acb3RA2HpoEFk8GGPHAJO2_JBzWeKHcIe9Wj_ZNrU6FINegMlz-Os5bYSEFdNK0" />
            <div className="flex flex-col truncate">
              <span className="font-headline-md text-body-md text-on-surface tracking-tight uppercase truncate">
                ShadowAthlete
              </span>
              <span className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-widest truncate">
                Home
              </span>
            </div>
          </div>
          <div className="flex items-center gap-space-xs shrink-0">
            <Link className="min-w-[44px] min-h-[44px] flex items-center justify-center" data-path="profile" href="/profile">
              <img alt="Profile" className="w-8 h-8 rounded-full object-cover ring-1 ring-secondary-container/40 hover:ring-secondary-container transition-all" src="https://lh3.googleusercontent.com/aida/AEtjO1VMnOn0JU8o67qYlYqYCfMg1WkAfuvSKYr7KKY53q6BP96YUKVar9XDhOk_G0q9oEEjtyqPTnjPz-jEJrc0WYt38c3cNqYZcfCBRJw4q5MRzBkPerclP4uhy8_16kr0ms5etlkMLS_PsBNC0_ErIoeYXxd2zuxLTVC_llRYg3rM1224q-gsYbE7WRhzle6ndzpYuYW6zR9J2qVASfJ92oWz4LbzfGQXXuIcMd1SHheY-ciDcBNW3LLRji8" />
            </Link>
          </div>
        </div>
      </header>
      <main className="flex flex-col relative w-full pt-16 pb-24 bg-surface min-h-screen">
        <div className="flex flex-col w-full px-margin-mobile pb-space-lg gap-space-lg">
          {/* ATHLETE STATUS HUD OVERVIEW */}
          <section className="flex flex-col gap-space-sm pt-space-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-space-sm">
                <div className="relative">
                  <div className="w-12 h-12 rounded-full bg-surface-container-high flex items-center justify-center overflow-hidden shadow-md">
                    <img className="w-full h-full object-cover" data-alt="Close up athletic portrait of Alex Carter, focused semi-pro athlete in high performance dark apparel under neon stadium rim lights, volumetric cybernetic glows, cinematic photorealism" src="https://lh3.googleusercontent.com/aida-public/AB6AXuC5OOyKEvp_GEilnMAENxMl1MOtWUJ47e10HZD3mCfLwkYsuSMXmkVzZpuiOG1Z1IScmmjWsmo_VXjWBIBoUHu9XGsIDbCbAkT6ejxzbxtxvWUfQWil-mQStdHPx30A9H5h-6Nz4LJR_1gAkwpBzkxoBKxabxm2fE9-ixw6wtPzPhYru5XavIf3Cgu8cxW9R-nIUuN284Jf_7CJDBS4HNlnTG-bY6sqwQcyy1B1GjE_9-5eNQ602vjR" />
                  </div>
                  {" "}
                  <span className="absolute -bottom-1 -right-1 bg-primary-container text-on-primary-container text-[10px] font-headline-md px-1.5 py-0.5 rounded-full shadow-sm">
                    {level}
                  </span>
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-space-xs">
                    <span className="font-headline-md text-headline-md text-on-surface tracking-tight">
                      {name}
                    </span>
                    <span className="material-symbols-outlined text-secondary-container text-base" title="AI Calibrated">
                      verified
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-label-caps text-label-caps text-on-surface-variant uppercase">
                      {live ? (dash?.athlete.experience_level ?? "Athlete") : "Top 4% Semi-Pro"}
                    </span>
                    <span className="w-1 h-1 rounded-full bg-outline-variant"></span>
                    <span className="font-label-badge text-label-badge text-primary-container">
                      {live ? `${sessions?.length ?? 0} sessions` : "+14 pts this wk"}
                    </span>
                  </div>
                </div>
              </div>
              <div className={`${live && dash?.athlete.athlete_score == null ? "hidden" : "flex"} flex-col items-end bg-surface-container-low px-3 py-1.5 rounded-xl shadow-sm`}>
                <span className="font-label-caps text-label-caps text-on-surface-variant uppercase">
                  Athlete Score
                </span>
                <div className="flex items-baseline gap-1">
                  <span className="font-metric-large text-metric-large text-on-surface">
                    {live ? fmt(dash?.athlete.athlete_score) : 782}
                  </span>
                  <span className="font-label-caps text-label-caps text-primary">
                    /1000
                  </span>
                </div>
              </div>
            </div>
          </section>
          {/* CENTERPIECE: DIGITAL ATHLETE AVATAR CARD WITH STATE SWITCHER */}
          <section className="flex flex-col bg-surface-container-low rounded-xl overflow-hidden shadow-xl">
            {/* POPULATED STATE CONTAINER */}
            <div className={demo ? "flex flex-col" : "hidden flex-col"} id="avatar-populated-view">
              {/* 3D Ghost Canvas Simulation */}
              <div className="relative w-full h-80 bg-surface-container-lowest overflow-hidden flex items-center justify-center">
                {/* Background Neon Telemetry Field */}
                <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_rgba(0,238,252,0.3)_0%,_transparent_70%)] pointer-events-none"></div>
                <div className="absolute inset-0 bg-cover bg-center mix-blend-screen opacity-90" data-alt="Full body holographic wireframe sports avatar swinging a tennis racket with luminous cyan biometric stroboscopic motion paths and neon trail vectors against a jet black sports laboratory background, hyper-detailed kinetic depth" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDkTgUuZaAWPSNrKDX6-Dq5MVCj9Ma70MwwvhiOljkdRzk3GR6uTsbX7IGHqyU17u90K8mUNs5VoP90gwkhl-H9nBJIa7HiKM-mmBhTbH7yfmnbWw3p_bG8h30aePf6QyqWeOLs0TvlP47AQm6JHKSdFPFvyCqfoR8z_ZDV7ZP8g33P02c965AneNU1G9_2E2i3baGbhPzkOR6QO1xX4Wyi6p3uLJlkmWOuBfdaK3YolqCGRWD2F24K')" }}></div>
              </div>
              {/* XP Level Progress & Calibrated Sports Footnote */}
              <div className="p-space-md flex flex-col gap-space-sm bg-surface-container-low">
                <div className="flex items-center justify-between">
                  <div className="flex items-baseline gap-1.5">
                    <span className="font-label-caps text-label-caps text-on-surface-variant uppercase">
                      XP Progression
                    </span>
                    <span className="font-label-badge text-label-badge text-on-surface font-semibold">
                      {xpInLevel.toLocaleString()} / {xpSpan.toLocaleString()} XP
                    </span>
                  </div>
                  <span className="font-label-caps text-label-caps text-secondary-container uppercase">
                    {(xpSpan - xpInLevel).toLocaleString()} XP to Lvl {level + 1}
                  </span>
                </div>
                {/* Dynamic XP Dual Track */}
                <div className="w-full h-2 rounded-full bg-surface-container-highest overflow-hidden relative">
                  <div className="absolute inset-y-0 left-0 bg-primary-container rounded-full" style={{ width: `${Math.round((xpInLevel / xpSpan) * 100)}%` }}></div>
                </div>
                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center gap-2">
                    <span className="font-label-caps text-label-caps text-on-surface-variant uppercase">
                      Calibrated:
                    </span>
                    <div className="flex items-center gap-1.5 text-on-surface">
                      <span className="material-symbols-outlined text-sm text-primary" title="Tennis">
                        sports_tennis
                      </span>
                      <span className="material-symbols-outlined text-sm text-primary" title="Cricket">
                        sports_cricket
                      </span>
                      <span className="material-symbols-outlined text-sm text-primary" title="Basketball">
                        sports_basketball
                      </span>
                      <span className="material-symbols-outlined text-sm text-primary" title="Running">
                        directions_run
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* EMPTY STATE CONTAINER (Hidden by default, activated via button) */}
            <div className={`${demo ? "hidden" : "flex"} flex-col p-space-lg text-center items-center gap-space-md bg-surface-container-low`} id="avatar-empty-view">
              <div className="w-20 h-20 rounded-full bg-surface-container-highest flex items-center justify-center text-on-surface-variant relative shadow-inner">
                <span className="material-symbols-outlined text-4xl text-secondary-container/60 animate-pulse">
                  view_in_ar
                </span>
                <span className="absolute top-0 right-0 w-3 h-3 rounded-full bg-tertiary-container"></span>
              </div>
              {" "}
              <div className="flex flex-col gap-1 max-w-xs">
                <span className="font-headline-md text-headline-md text-on-surface">
                  Digital Twin Uncalibrated
                </span>
                <span className="font-body-sm text-body-sm text-on-surface-variant">
                  Record your first session to calibrate your digital twin's posture, skeletal reach, and kinetic baseline.
                </span>
              </div>
              {" "}
              <button className="px-5 py-2.5 rounded-xl bg-secondary-container text-on-secondary-fixed font-headline-md text-body-sm uppercase tracking-wider flex items-center gap-2 shadow-lg hover:shadow-[0_0_20px_rgba(0,238,252,0.4)] transition-all" type="button" onClick={() => router.push("/capture")}>
                <span className="material-symbols-outlined text-lg">
                  videocam
                </span>
                {" "}Record 30s Biometric Clip
              </button>
            </div>
          </section>
          {/* PRIMARY CALL TO ACTION: START SESSION TRIGGER */}
          <section className="flex flex-col">
            <button className="w-full py-4 px-space-md rounded-xl bg-primary-container text-on-primary-container font-headline-md text-headline-md flex items-center justify-between uppercase tracking-tight shadow-[0_0_28px_-4px_rgba(34,197,94,0.45)] hover:shadow-[0_0_36px_-2px_rgba(34,197,94,0.65)] hover:scale-[1.01] active:scale-[0.99] transition-all" type="button" onClick={() => router.push("/capture")}>
              <div className="flex items-center gap-2.5">
                <span className="material-symbols-outlined text-2xl font-bold">
                  add_circle
                </span>
                <span>
                  Start Session
                </span>
              </div>
            </button>
          </section>
          {/* "SHADOW YOU" KINETIC CHALLENGE SECTION */}
          {!live && (
          <section className="flex flex-col gap-space-sm bg-surface-container-low p-space-md rounded-xl shadow-lg relative overflow-hidden">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary-container text-lg">
                  auto_awesome
                </span>
                <span className="font-label-caps text-label-caps text-secondary-container uppercase tracking-widest">
                  Challenge Your Shadow
                </span>
              </div>
              <span className="font-label-badge text-label-badge text-on-surface-variant bg-surface-container-high px-2 py-0.5 rounded-full">
                30-Day Peak Delta
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="font-headline-md text-headline-md text-on-surface">
                Morning Baseline Forehand
              </span>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                <strong className="text-primary font-medium">
                  +6 mph
                </strong>
                {" "}racket velocity needed to overtake your 30-day shadow clone. Your twin’s impact reaction time is locked at{" "}
                <strong className="text-secondary-container font-medium">
                  182ms
                </strong>
                .
              </p>
            </div>
            {/* Comparative Visual Track */}
            <div className="flex flex-col gap-2 pt-2">
              {/* Metric: Racket Speed */}
              <div className="flex flex-col gap-1">
                <div className="flex justify-between font-label-caps text-label-caps text-on-surface-variant">
                  <span className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary-container"></span>
                    {" "}Current You: 76 mph
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-secondary-container"></span>
                    {" "}Shadow Twin: 82 mph
                  </span>
                </div>
                <div className="w-full h-3 bg-surface-container-highest rounded-full overflow-hidden relative flex">
                  {/* Athlete Bar */}
                  <div className="h-full bg-primary-container rounded-l-full shadow-[0_0_12px_rgba(34,197,94,0.6)]" style={{ width: "76%" }}></div>
                  {/* Gap/Deficit Indicator */}
                  <div className="h-full bg-secondary-container/40 rounded-r-full" style={{ width: "6%" }}></div>
                </div>
              </div>
              {/* Metric: Reaction Time */}
              <div className="flex flex-col gap-1 pt-1">
                <div className="flex justify-between font-label-caps text-label-caps text-on-surface-variant">
                  <span className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary-container"></span>
                    {" "}Your Split: 198ms
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-secondary-container"></span>
                    {" "}Shadow Twin: 182ms (-16ms)
                  </span>
                </div>
                <div className="w-full h-3 bg-surface-container-highest rounded-full overflow-hidden relative flex">
                  <div className="h-full bg-primary-container rounded-l-full" style={{ width: "82%" }}></div>
                  <div className="h-full bg-secondary-container/50 rounded-r-full" style={{ width: "8%" }}></div>
                </div>
              </div>
            </div>
            <button className="mt-2 w-full py-3 px-space-md rounded-xl bg-surface-container-high hover:bg-surface-container-highest text-secondary-container font-headline-md text-body-sm flex items-center justify-center gap-2 uppercase tracking-wider transition-colors shadow-sm" type="button" onClick={() => router.push("/capture")}>
              <span>
                Compete Against Shadow
              </span>
              <span className="material-symbols-outlined text-base">
                arrow_forward
              </span>
            </button>
          </section>
          )}
          {/* UNIVERSAL ATTRIBUTES QUICK GRID */}
          {(!live || (dash?.attributes.length ?? 0) > 0) && (
          <section className="flex flex-col gap-space-sm">
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <span className="font-headline-md text-headline-md text-on-surface">
                  Universal Kinetic Attributes
                </span>
                <span className="font-label-caps text-label-caps text-secondary-container uppercase">
                  One avatar unified across all sports
                </span>
              </div>
              <span className="material-symbols-outlined text-on-surface-variant text-lg" title="Unified Biomechanics Matrix">
                hub
              </span>
            </div>
            <div className="grid grid-cols-2 gap-gutter-mobile">
              {/* Reaction */}
              <div className="flex flex-col p-3 rounded-xl bg-surface-container-low shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="font-label-caps text-label-caps text-on-surface-variant uppercase">
                    Reaction
                  </span>
                  <span className="material-symbols-outlined text-secondary-container text-base">
                    bolt
                  </span>
                </div>
                <div className="flex items-baseline gap-1 my-1">
                  <span className="font-metric-large text-metric-large text-on-surface">
                    {fmt(attr("reaction", 93))}
                  </span>
                  <span className="font-label-caps text-label-caps text-on-surface-variant">
                    /100
                  </span>
                </div>
                <div className="w-full h-1.5 bg-surface-container-highest rounded-full overflow-hidden">
                  <div className="h-full bg-primary-container rounded-full" style={{ width: `${attr("reaction", 93) ?? 0}%` }}></div>
                </div>
                <span className="font-label-badge text-[11px] text-primary-container mt-1.5 flex items-center gap-1">
                  <span className="material-symbols-outlined text-[12px]">
                    trending_up
                  </span>
                  {" "}Semi-Pro Elite
                </span>
              </div>
              {/* Technique */}
              <div className="flex flex-col p-3 rounded-xl bg-surface-container-low shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="font-label-caps text-label-caps text-on-surface-variant uppercase">
                    Technique
                  </span>
                  <span className="material-symbols-outlined text-secondary-container text-base">
                    precision_manufacturing
                  </span>
                </div>
                <div className="flex items-baseline gap-1 my-1">
                  <span className="font-metric-large text-metric-large text-on-surface">
                    {fmt(attr("technique", 86))}
                  </span>
                  <span className="font-label-caps text-label-caps text-on-surface-variant">
                    /100
                  </span>
                </div>
                <div className="w-full h-1.5 bg-surface-container-highest rounded-full overflow-hidden">
                  <div className="h-full bg-primary-container rounded-full" style={{ width: `${attr("technique", 86) ?? 0}%` }}></div>
                </div>
                <span className="font-label-badge text-[11px] text-secondary-container mt-1.5 flex items-center gap-1">
                  <span className="material-symbols-outlined text-[12px]">
                    check_circle
                  </span>
                  {" "}Form Synchronized
                </span>
              </div>
              {/* Speed */}
              <div className="flex flex-col p-3 rounded-xl bg-surface-container-low shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="font-label-caps text-label-caps text-on-surface-variant uppercase">
                    Speed
                  </span>
                  <span className="material-symbols-outlined text-secondary-container text-base">
                    speed
                  </span>
                </div>
                <div className="flex items-baseline gap-1 my-1">
                  <span className="font-metric-large text-metric-large text-on-surface">
                    {fmt(attr("speed", 82))}
                  </span>
                  <span className="font-label-caps text-label-caps text-on-surface-variant">
                    /100
                  </span>
                </div>
                <div className="w-full h-1.5 bg-surface-container-highest rounded-full overflow-hidden">
                  <div className="h-full bg-primary-container rounded-full" style={{ width: `${attr("speed", 82) ?? 0}%` }}></div>
                </div>
                <span className="font-label-badge text-[11px] text-tertiary mt-1.5 flex items-center gap-1">
                  <span className="material-symbols-outlined text-[12px]">
                    arrow_upward
                  </span>
                  {" "}+2.1 mph vs Twin
                </span>
              </div>
              {/* Endurance */}
              <div className="flex flex-col p-3 rounded-xl bg-surface-container-low shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="font-label-caps text-label-caps text-on-surface-variant uppercase">
                    Endurance
                  </span>
                  <span className="material-symbols-outlined text-secondary-container text-base">
                    cardiology
                  </span>
                </div>
                <div className="flex items-baseline gap-1 my-1">
                  <span className="font-metric-large text-metric-large text-on-surface">
                    {fmt(attr("endurance", 88))}
                  </span>
                  <span className="font-label-caps text-label-caps text-on-surface-variant">
                    /100
                  </span>
                </div>
                <div className="w-full h-1.5 bg-surface-container-highest rounded-full overflow-hidden">
                  <div className="h-full bg-primary-container rounded-full" style={{ width: `${attr("endurance", 88) ?? 0}%` }}></div>
                </div>
                <span className="font-label-badge text-[11px] text-primary mt-1.5 flex items-center gap-1">
                  <span className="material-symbols-outlined text-[12px]">
                    trending_up
                  </span>
                  {" "}Steady Target
                </span>
              </div>
            </div>
          </section>
          )}
          {/* MULTI-SPORT SHORTCUTS (2x2 Grid) */}
          <section className="flex flex-col gap-space-sm">
            <div className="flex items-center justify-between">
              <span className="font-headline-md text-headline-md text-on-surface">
                Multi-Sport Disciplines
              </span>
              <span className="font-label-caps text-label-caps text-on-surface-variant uppercase">
                4 Linked Modes
              </span>
            </div>
            <div className="grid grid-cols-2 gap-gutter-mobile">
              {/* Tennis Card (Primary) */}
              <div onClick={() => router.push("/sports/tennis")} className="cursor-pointer flex flex-col p-space-sm rounded-xl bg-surface-container-low shadow-sm relative overflow-hidden group">
                <div className="flex items-center justify-between mb-2">
                  <div className="w-8 h-8 rounded-lg bg-surface-container-high flex items-center justify-center text-primary-container">
                    <span className="material-symbols-outlined text-xl">
                      sports_tennis
                    </span>
                  </div>
                  <span className="font-label-badge text-label-badge text-primary-container bg-primary-container/10 px-2 py-0.5 rounded-full">
                    Primary
                  </span>
                </div>
                <span className="font-headline-md text-body-md text-on-surface font-semibold truncate">
                  Tennis
                </span>
                <span className="font-body-sm text-body-sm text-on-surface-variant">
                  {live ? `${sessionCount(1)} ${sessionCount(1) === 1 ? "session" : "sessions"} logged` : "14 sessions logged"}
                </span>
                <div className="flex items-center justify-between mt-3 pt-2 bg-surface-container-lowest/50 rounded-lg p-1.5">
                  <span className="font-label-caps text-[10px] text-secondary uppercase">
                    {live ? "" : "Score 814"}
                  </span>
                  <button className="w-6 h-6 rounded-md bg-primary-container text-on-primary-container flex items-center justify-center hover:scale-105 active:scale-95 transition-transform" title="Quick Capture Tennis" type="button" onClick={(e) => { e.stopPropagation(); router.push("/capture?sport=tennis"); }}>
                    <span className="material-symbols-outlined text-sm">
                      videocam
                    </span>
                  </button>
                </div>
              </div>
              {/* Cricket Card */}
              <div onClick={() => router.push("/sports")} className="cursor-pointer flex flex-col p-space-sm rounded-xl bg-surface-container-low shadow-sm relative overflow-hidden group">
                <div className="flex items-center justify-between mb-2">
                  <div className="w-8 h-8 rounded-lg bg-surface-container-high flex items-center justify-center text-secondary-container">
                    <span className="material-symbols-outlined text-xl">
                      sports_cricket
                    </span>
                  </div>
                  <span className="font-label-caps text-label-caps text-on-surface-variant uppercase">
                    {live ? (sessionCount(2) > 0 ? "Calibrated" : "New") : "Calibrated"}
                  </span>
                </div>
                <span className="font-headline-md text-body-md text-on-surface font-semibold truncate">
                  Fast Bowling
                </span>
                <span className="font-body-sm text-body-sm text-on-surface-variant">
                  {live ? `${sessionCount(2)} ${sessionCount(2) === 1 ? "session" : "sessions"} logged` : "6 sessions logged"}
                </span>
                <div className="flex items-center justify-between mt-3 pt-2 bg-surface-container-lowest/50 rounded-lg p-1.5">
                  <span className="font-label-caps text-[10px] text-on-surface-variant uppercase">
                    {live ? "" : "Score 775"}
                  </span>
                  <button className="w-6 h-6 rounded-md bg-surface-container-highest text-on-surface flex items-center justify-center hover:bg-secondary-container hover:text-on-secondary-fixed transition-colors" title="Quick Capture Bowling" type="button" onClick={(e) => { e.stopPropagation(); router.push("/capture?sport=cricket"); }}>
                    <span className="material-symbols-outlined text-sm">
                      videocam
                    </span>
                  </button>
                </div>
              </div>
              {/* Basketball Card */}
              <div onClick={() => router.push("/sports")} className="cursor-pointer flex flex-col p-space-sm rounded-xl bg-surface-container-low shadow-sm relative overflow-hidden group">
                <div className="flex items-center justify-between mb-2">
                  <div className="w-8 h-8 rounded-lg bg-surface-container-high flex items-center justify-center text-secondary-container">
                    <span className="material-symbols-outlined text-xl">
                      sports_basketball
                    </span>
                  </div>
                  <span className="font-label-caps text-label-caps text-on-surface-variant uppercase">
                    {live ? (sessionCount(3) > 0 ? "Calibrated" : "New") : "Calibrated"}
                  </span>
                </div>
                <span className="font-headline-md text-body-md text-on-surface font-semibold truncate">
                  Basketball
                </span>
                <span className="font-body-sm text-body-sm text-on-surface-variant">
                  {live ? `${sessionCount(3)} ${sessionCount(3) === 1 ? "session" : "sessions"} logged` : "4 sessions logged"}
                </span>
                <div className="flex items-center justify-between mt-3 pt-2 bg-surface-container-lowest/50 rounded-lg p-1.5">
                  <span className="font-label-caps text-[10px] text-on-surface-variant uppercase">
                    {live ? "" : "Score 740"}
                  </span>
                  <button className="w-6 h-6 rounded-md bg-surface-container-highest text-on-surface flex items-center justify-center hover:bg-secondary-container hover:text-on-secondary-fixed transition-colors" title="Quick Capture Basketball" type="button" onClick={(e) => { e.stopPropagation(); router.push("/capture?sport=basketball"); }}>
                    <span className="material-symbols-outlined text-sm">
                      videocam
                    </span>
                  </button>
                </div>
              </div>
              {/* Running Card */}
              <div onClick={() => router.push("/sports")} className="cursor-pointer flex flex-col p-space-sm rounded-xl bg-surface-container-low shadow-sm relative overflow-hidden group">
                <div className="flex items-center justify-between mb-2">
                  <div className="w-8 h-8 rounded-lg bg-surface-container-high flex items-center justify-center text-secondary-container">
                    <span className="material-symbols-outlined text-xl">
                      directions_run
                    </span>
                  </div>
                  <span className="font-label-caps text-label-caps text-on-surface-variant uppercase">
                    {live ? (sessionCount(4) > 0 ? "Calibrated" : "New") : "Calibrated"}
                  </span>
                </div>
                <span className="font-headline-md text-body-md text-on-surface font-semibold truncate">
                  Sprint Mechanics
                </span>
                <span className="font-body-sm text-body-sm text-on-surface-variant">
                  {live ? `${sessionCount(4)} ${sessionCount(4) === 1 ? "session" : "sessions"} logged` : "8 sessions logged"}
                </span>
                <div className="flex items-center justify-between mt-3 pt-2 bg-surface-container-lowest/50 rounded-lg p-1.5">
                  <span className="font-label-caps text-[10px] text-on-surface-variant uppercase">
                    {live ? "" : "Score 798"}
                  </span>
                  <button className="w-6 h-6 rounded-md bg-surface-container-highest text-on-surface flex items-center justify-center hover:bg-secondary-container hover:text-on-secondary-fixed transition-colors" title="Quick Capture Running" type="button" onClick={(e) => { e.stopPropagation(); router.push("/capture?sport=running"); }}>
                    <span className="material-symbols-outlined text-sm">
                      videocam
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </section>
          {/* RECENT RECORDED SESSIONS */}
          <section className="flex flex-col gap-space-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="font-headline-md text-headline-md text-on-surface">
                  Recent Sessions
                </span>
                {!live && (
                  <span className="font-label-badge text-label-badge bg-surface-container-highest text-on-surface-variant px-1.5 py-0.5 rounded-full">
                    Demo Data
                  </span>
                )}
              </div>
              <Link className="font-label-caps text-label-caps text-primary hover:underline uppercase" href="/sessions">
                View All
              </Link>
            </div>
            <div className="flex flex-col gap-space-xs">
              {live ? (
                <>
              {recent.length === 0 ? (
                <div onClick={() => router.push("/capture")} className="cursor-pointer flex items-center justify-between p-3 rounded-xl bg-surface-container-low hover:bg-surface-container transition-colors shadow-sm">
                  <span className="font-body-sm text-body-sm text-on-surface-variant">
                    No sessions yet — record your first clip to calibrate your twin.
                  </span>
                  <span className="material-symbols-outlined text-primary-container">videocam</span>
                </div>
              ) : (
                recent.map((s) => {
                  const sport = SPORT_BY_ID[s.sport_id];
                  return (
                    <div key={s.id} onClick={() => router.push(`/sessions/${s.id}`)} className="cursor-pointer flex items-center justify-between p-3 rounded-xl bg-surface-container-low hover:bg-surface-container transition-colors shadow-sm">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-surface-container-high flex items-center justify-center text-primary-container shrink-0">
                          <span className="material-symbols-outlined text-xl">
                            {sport ? SPORT_ICON[sport] : "videocam"}
                          </span>
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="font-headline-md text-body-md text-on-surface truncate">
                            {sport ? `${SPORT_NAME[sport]} Session` : "Session"} #{s.id}
                          </span>
                          <div className="flex items-center gap-2 font-body-sm text-on-surface-variant">
                            <span>
                              {relativeDay(s.recorded_at ?? s.created_at)}
                            </span>
                            <span className="w-1 h-1 rounded-full bg-outline"></span>
                            <span className="text-secondary-container capitalize">
                              {s.status}
                            </span>
                          </div>
                        </div>
                      </div>
                      <span className="material-symbols-outlined text-on-surface-variant shrink-0 pl-2">
                        chevron_right
                      </span>
                    </div>
                  );
                })
              )}
                </>
              ) : (
                <>
              {/* Session Item 1 */}
              <div onClick={() => router.push("/sessions")} className="cursor-pointer flex items-center justify-between p-3 rounded-xl bg-surface-container-low hover:bg-surface-container transition-colors shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-surface-container-high flex items-center justify-center text-primary-container shrink-0">
                    <span className="material-symbols-outlined text-xl">
                      sports_tennis
                    </span>
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="font-headline-md text-body-md text-on-surface truncate">
                      Morning Baseline Forehand
                    </span>
                    <div className="flex items-center gap-2 font-body-sm text-on-surface-variant">
                      <span>
                        Yesterday • 42 mins
                      </span>
                      <span className="w-1 h-1 rounded-full bg-outline"></span>
                      <span className="text-secondary-container">
                        12 Comparative Reps
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end shrink-0 pl-2">
                  <span className="font-headline-md text-headline-md text-primary-container">
                    814
                  </span>
                  <span className="font-label-caps text-[10px] text-on-surface-variant uppercase">
                    +18 pts vs Twin
                  </span>
                </div>
              </div>
              {/* Session Item 2 */}
              <div onClick={() => router.push("/sessions")} className="cursor-pointer flex items-center justify-between p-3 rounded-xl bg-surface-container-low hover:bg-surface-container transition-colors shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-surface-container-high flex items-center justify-center text-secondary-container shrink-0">
                    <span className="material-symbols-outlined text-xl">
                      sports_cricket
                    </span>
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="font-headline-md text-body-md text-on-surface truncate">
                      Fast Bowling Run-up Drill
                    </span>
                    <div className="flex items-center gap-2 font-body-sm text-on-surface-variant">
                      <span>
                        3 days ago • 28 mins
                      </span>
                      <span className="w-1 h-1 rounded-full bg-outline"></span>
                      <span className="text-secondary-container">
                        Arm Slot Sync
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end shrink-0 pl-2">
                  <span className="font-headline-md text-headline-md text-on-surface">
                    775
                  </span>
                  <span className="font-label-caps text-[10px] text-tertiary uppercase">
                    -4 pts vs Twin
                  </span>
                </div>
              </div>
                </>
              )}
            </div>
          </section>
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
