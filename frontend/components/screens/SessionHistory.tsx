"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const CHIP_ON = ["bg-primary-container", "text-on-primary-container"];
const CHIP_OFF = ["bg-surface-container-high", "text-on-surface-variant"];

import BottomNav from "@/components/BottomNav";


// Generated from design/stitch/mobile_session_history/code.html by scripts/stitch-to-jsx.mjs.
export default function SessionHistory() {
  const router = useRouter();
  const [sport, setSport] = useState("all");
  const [query, setQuery] = useState("");
  const [cardText, setCardText] = useState<string[]>([]);
  const [pressed, setPressed] = useState<number | null>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Search matches against each card's rendered text, like the Stitch prototype.
  useEffect(() => {
    const cards = listRef.current?.querySelectorAll<HTMLElement>(".session-card") ?? [];
    setCardText(Array.from(cards, (c) => c.innerText.toLowerCase()));
  }, []);

  const q = query.trim().toLowerCase();
  const visible = (i: number, cardSport: string) =>
    (sport === "all" || sport === cardSport) && (q === "" || (cardText[i] ?? "").includes(q));
  const chip = (base: string, value: string) => {
    // Swap the Stitch active/inactive colour classes, leaving the rest of the chip styling intact.
    const [from, to] = value === sport ? [CHIP_OFF, CHIP_ON] : [CHIP_ON, CHIP_OFF];
    return from.reduce((cls, c, i) => cls.replace(c, to[i]), base);
  };
  function press(i: number) {
    setPressed(i);
    setTimeout(() => setPressed(null), 180);
  }

  return (
    <div className="bg-surface font-body-md text-on-surface flex flex-col min-h-screen">
      <header className="fixed top-0 w-full z-50 pt-safe bg-surface/80 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.35)]">
        <div className="h-16 px-margin-mobile flex items-center justify-between gap-space-sm">
          <div className="flex items-center gap-space-sm min-w-0">
            <img alt="ShadowAthlete Logo" className="h-8 w-auto object-contain flex-shrink-0" src="https://lh3.googleusercontent.com/aida/AEtjO1UoqXpjPGNJSR-Q39He4Cj6z06lTETlc0DfTrne2HOlkf_XP7hWEwPeVbUU2qoF52S3LnrZgnn2YQMVDGZ_uOWQBvtfRd7djhMctxg8S2S90__M00NtlIV5y9w8s0vb1s7-4WJuDb6k5I9zozmPg0cKl0FaX5rVEmxODpltbDFj7NIVHML92KfvT8QLxkyGhJdM1nTvhpH97NOal3TyNmT5VktOUEHXK_1bawjj68d_F-NVtchiePtGkoE" />
            <div className="flex flex-col min-w-0">
              <span className="font-headline-md text-headline-md font-bold tracking-tight text-on-surface truncate">
                ShadowAthlete
              </span>
              <span className="font-label-caps text-label-caps uppercase text-secondary tracking-widest leading-none truncate">
                AI Telemetry Twin
              </span>
            </div>
          </div>
          <div className="flex items-center gap-space-sm flex-shrink-0">
            <button aria-label="Live telemetry sync" className="flex items-center gap-space-xs px-space-sm py-1 rounded-full bg-surface-container-high/90 shadow-[0_0_12px_rgba(34,197,94,0.2)] min-h-[44px] min-w-[44px] justify-center">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
              <span className="font-label-caps text-label-caps uppercase text-primary tracking-wider hidden sm:inline">
                LIVE
              </span>
              <span className="material-symbols-outlined text-primary text-[18px]">
                sensors
              </span>
            </button>
            <button aria-label="Alex Carter athlete profile" onClick={() => router.push("/profile")} className="relative p-0.5 rounded-full min-w-[44px] min-h-[44px] flex items-center justify-center">
              <img alt="Athlete Avatar" className="w-8 h-8 rounded-full object-cover shadow-[0_0_8px_rgba(0,238,252,0.3)]" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAYlzWa0WhdHMrlXCOeOKrE_gA6mkG7xt-gxYspgU6fUaJkV_Akz3Qz6MylgYcPyVE5OFBPRU96jXhHmhrUEMgtTe5nfrrt5Ip72wHjEBYrLJcFt3L5dJ4GHGcCD6NC26qS_GST3vE73Y1k2PcA1WX9In53HhyZuOM2ZyVBvkQRU2MYC4KbQ7J3e7gzFYeCTbh28FW7TZt25JcL5lEMN9kpQGB5Rl-Bpp84AiV9NN1X0XPv8ZVW6f2y" />
            </button>
          </div>
        </div>
      </header>
      <main className="flex flex-col relative w-full pt-16 pb-20 bg-surface flex-1">
        <div className="flex flex-col w-full">
          {/* Active Live Background Processing Banner */}
          <aside aria-label="Active session processing banner" className="relative mx-margin-mobile mt-space-md mb-space-sm p-space-md rounded-xl bg-surface-container-high shadow-lg overflow-hidden flex items-center justify-between gap-space-sm">
            <div className="absolute -right-6 -bottom-6 w-28 h-28 bg-secondary-container/10 rounded-full blur-2xl pointer-events-none"></div>
            <div className="flex items-center gap-space-sm min-w-0 z-10">
              <div className="relative flex items-center justify-center w-10 h-10 rounded-full bg-surface-container-highest flex-shrink-0">
                <span className="w-3 h-3 rounded-full bg-secondary animate-ping absolute opacity-75"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-secondary relative"></span>
              </div>
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-space-xs">
                  <span className="font-headline-md text-body-sm font-semibold text-on-surface truncate">
                    Session #29
                  </span>
                  <span className="font-label-caps text-label-caps uppercase px-1.5 py-0.5 rounded-full bg-secondary/15 text-secondary">
                    Tennis
                  </span>
                </div>
                <p className="font-body-sm text-body-sm text-on-surface-variant truncate">
                  Analyzing biomechanics &amp; ghost telemetry...
                </p>
              </div>
            </div>
            <button className="z-10 flex-shrink-0 px-space-sm py-1.5 rounded-full bg-secondary/15 text-secondary font-label-caps text-label-caps uppercase tracking-wider active:scale-95 transition-transform" type="button">
              Status
            </button>
          </aside>
          {/* Title & Meta Overview */}
          <section className="px-margin-mobile pt-space-sm pb-space-xs flex items-baseline justify-between">
            <div>
              <h1 className="font-headline-xl-mobile text-headline-xl-mobile text-on-surface tracking-tight">
                Session History
              </h1>
              {" "}
              <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                28 Sessions Logged • 12 Personal Bests
              </p>
            </div>
            <div className="flex items-center gap-1 text-primary">
              <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                insights
              </span>
              <span className="font-headline-md text-body-sm font-bold">
                98.4%
              </span>
            </div>
          </section>
          {/* Search & Quick Date Filter */}
          <section className="px-margin-mobile mt-space-sm">
            <div className="relative flex items-center w-full">
              <span className="material-symbols-outlined absolute left-3.5 text-on-surface-variant text-[20px] pointer-events-none">
                search
              </span>
              <input className="w-full pl-11 pr-10 py-3 rounded-xl bg-surface-container-high text-on-surface placeholder:text-on-surface-variant font-body-md text-body-sm focus:outline-none focus:bg-surface-container-highest transition-colors shadow-sm" id="session-search" placeholder="Search drills, dates, or insights..." type="search" value={query} onChange={(e) => setQuery(e.target.value)} />
              <button aria-label="Filter calendar range" className="absolute right-2.5 p-1.5 text-on-surface-variant hover:text-on-surface active:scale-95 transition-transform flex items-center justify-center">
                <span className="material-symbols-outlined text-[20px]">
                  calendar_month
                </span>
              </button>
            </div>
          </section>
          {/* Sport Filter Chips */}
          <nav aria-label="Filter sessions by sport" className="mt-space-md pl-margin-mobile flex gap-space-xs overflow-x-auto no-scrollbar pb-1">
            <button className={chip("filter-chip active flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-primary-container text-on-primary-container font-label-caps text-label-caps uppercase tracking-wider flex-shrink-0 shadow-sm", "all")} data-sport="all" onClick={() => setSport("all")}>
              <span>
                All Sports
              </span>
              <span className="bg-on-primary-container/20 px-1.5 py-0.2 rounded-full text-[10px]">
                28
              </span>
            </button>
            <button className={chip("filter-chip flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-surface-container-high text-on-surface-variant font-label-caps text-label-caps uppercase tracking-wider flex-shrink-0 active:scale-95 transition-transform", "tennis")} data-sport="tennis" onClick={() => setSport("tennis")}>
              <span>
                Tennis
              </span>
              <span className="bg-surface-container-highest px-1.5 py-0.2 rounded-full text-[10px]">
                14
              </span>
            </button>
            <button className={chip("filter-chip flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-surface-container-high text-on-surface-variant font-label-caps text-label-caps uppercase tracking-wider flex-shrink-0 active:scale-95 transition-transform", "cricket")} data-sport="cricket" onClick={() => setSport("cricket")}>
              <span>
                Cricket
              </span>
              <span className="bg-surface-container-highest px-1.5 py-0.2 rounded-full text-[10px]">
                6
              </span>
            </button>
            <button className={chip("filter-chip flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-surface-container-high text-on-surface-variant font-label-caps text-label-caps uppercase tracking-wider flex-shrink-0 active:scale-95 transition-transform", "basketball")} data-sport="basketball" onClick={() => setSport("basketball")}>
              <span>
                Basketball
              </span>
              <span className="bg-surface-container-highest px-1.5 py-0.2 rounded-full text-[10px]">
                5
              </span>
            </button>
            <button className={chip("filter-chip flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-surface-container-high text-on-surface-variant font-label-caps text-label-caps uppercase tracking-wider flex-shrink-0 mr-margin-mobile active:scale-95 transition-transform", "running")} data-sport="running" onClick={() => setSport("running")}>
              <span>
                Running
              </span>
              <span className="bg-surface-container-highest px-1.5 py-0.2 rounded-full text-[10px]">
                3
              </span>
            </button>
          </nav>
          {/* Sessions Timeline Groups */}
          <div ref={listRef} className="px-margin-mobile mt-space-md flex flex-col gap-space-lg mb-space-xl">
            {/* GROUP: YESTERDAY */}
            <div className={`${visible(0, "tennis") ? "" : "hidden "}session-group flex flex-col gap-space-sm`}>
              <div className="flex items-center justify-between">
                <span className="font-label-caps text-label-caps uppercase text-on-surface-variant tracking-widest">
                  Yesterday • May 14
                </span>
                <span className="font-label-caps text-label-caps uppercase text-primary font-bold">
                  1 Session
                </span>
              </div>
              {/* Tennis Featured Card */}
              <article className={`${visible(0, "tennis") ? "" : "hidden "}${pressed === 0 ? "ring-offset-2 brightness-110 " : ""}session-card group relative flex flex-col rounded-xl bg-surface-container p-space-md shadow-md active:scale-[0.99] transition-all cursor-pointer overflow-hidden`} data-sport="tennis" onClick={() => press(0)}>
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl pointer-events-none"></div>
                {/* Top row: Badge + Time + Score */}
                <div className="flex items-start justify-between gap-space-sm mb-space-sm relative z-10">
                  <div className="flex items-center gap-space-xs flex-wrap">
                    <span className="px-2 py-0.5 rounded-full bg-primary/15 text-primary font-label-caps text-label-caps uppercase tracking-wider">
                      Tennis
                    </span>
                    <span className="font-body-sm text-body-sm text-on-surface-variant">
                      14m 20s
                    </span>
                  </div>
                  <div className="flex flex-col items-end">
                    <div className="flex items-baseline gap-1">
                      <span className="font-metric-large text-headline-md text-on-surface font-bold">
                        814
                      </span>
                      <span className="font-label-caps text-label-caps text-primary font-bold">
                        +6 pts
                      </span>
                    </div>
                    <span className="font-label-caps text-[10px] text-on-surface-variant uppercase tracking-wider">
                      Athlete Score
                    </span>
                  </div>
                </div>
                {/* Title & Visual Frame */}
                <div className="relative z-10 mb-space-sm">
                  <h2 className="font-headline-md text-headline-md text-on-surface tracking-tight group-hover:text-primary transition-colors">
                    Morning Baseline Forehand
                  </h2>
                  {" "}
                  <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                    Court 4 • Heavy Topspin Drills • High Intensity
                  </p>
                </div>
                {/* Media Visual Telemetry Preview */}
                <div className="relative w-full h-36 rounded-lg overflow-hidden bg-surface-container-lowest mb-space-sm flex items-center justify-center">
                  <img className="w-full h-full object-cover opacity-80" data-alt="Dynamic medium shot of an athletic tennis player hitting a powerful open-stance forehand on a hard court, highlighted with cybernetic luminous cyan skeletal motion-tracking lines and lime telemetry vectors illuminating kinetic racket path and arm flexion, dark moody cinematic court lighting with subtle depth of field." src="https://lh3.googleusercontent.com/aida-public/AB6AXuBiJGNDMWZSPFmPiKTHT59BvU8lpm74IjjAWcZKyRncfkGx9l8fn8NSl-IW9GPWtiZPUSwkacLWwUELwFZkrzfZpAj8PBQIBz5f9G_DKdbnVuFDVBCZ5ImxgcGVi_-8IblOu0O4dWNMA3M6CO1zRkJ4N5OBhnYxjeKlQ4n7Z1SUlx4YVvMItT4mXEPtYUe5kiImqmFPSXR6C5yHrVjLVAOavjHZfEb-k2cdPl7EzI-JhktR_nyF2IJJ" />
                  <div className="absolute inset-0 bg-gradient-to-t from-surface-container via-surface-container/20 to-transparent"></div>
                  {/* Confidence Floating Metric */}
                  <div className="absolute bottom-2.5 left-2.5 flex items-center gap-1.5 px-2 py-1 rounded-full bg-surface-container-high/90 backdrop-blur-md shadow-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
                    <span className="font-label-caps text-[10px] uppercase text-on-surface tracking-wider">
                      Pose Conf: 97.2%
                    </span>
                  </div>
                  {/* Status badge */}
                  <div className="absolute top-2.5 right-2.5 flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/20 text-primary backdrop-blur-md font-label-caps text-[10px] uppercase font-bold tracking-wider">
                    <span className="material-symbols-outlined text-[14px]">
                      check_circle
                    </span>
                    <span>
                      Completed
                    </span>
                  </div>
                </div>
                {/* Key Shadow Insight Banner */}
                <div className="relative z-10 p-space-sm rounded-lg bg-surface-container-high flex items-center gap-space-sm">
                  <div className="w-8 h-8 rounded-full bg-secondary/15 flex items-center justify-center flex-shrink-0 text-secondary">
                    <span className="material-symbols-outlined text-[18px]">
                      bolt
                    </span>
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="font-label-caps text-[10px] uppercase text-secondary tracking-widest">
                      Shadow Delta Advantage
                    </span>
                    <p className="font-body-sm text-body-sm text-on-surface truncate">
                      Forehand racket speed{" "}
                      <strong className="text-primary font-semibold">
                        +6 mph
                      </strong>
                      {" "}over shadow benchmark
                    </p>
                  </div>
                  <span className="material-symbols-outlined text-on-surface-variant text-[18px] ml-auto">
                    chevron_right
                  </span>
                </div>
              </article>
            </div>
            {/* GROUP: LAST WEEK */}
            <div className={`${visible(1, "cricket") || visible(2, "tennis") || visible(3, "running") ? "" : "hidden "}session-group flex flex-col gap-space-sm`}>
              <div className="flex items-center justify-between">
                <span className="font-label-caps text-label-caps uppercase text-on-surface-variant tracking-widest">
                  Last Week • May 06 - May 12
                </span>
                <span className="font-label-caps text-label-caps uppercase text-on-surface-variant">
                  3 Sessions
                </span>
              </div>
              {/* Cricket Card */}
              <article className={`${visible(1, "cricket") ? "" : "hidden "}${pressed === 1 ? "ring-offset-2 brightness-110 " : ""}session-card group relative flex flex-col rounded-xl bg-surface-container p-space-md shadow-md active:scale-[0.99] transition-all cursor-pointer`} data-sport="cricket" onClick={() => press(1)}>
                <div className="flex items-start justify-between gap-space-sm mb-space-xs">
                  <div className="flex items-center gap-space-xs flex-wrap">
                    <span className="px-2 py-0.5 rounded-full bg-tertiary/20 text-tertiary font-label-caps text-label-caps uppercase tracking-wider">
                      Cricket
                    </span>
                    <span className="font-body-sm text-body-sm text-on-surface-variant">
                      32m 10s
                    </span>
                    <span className="flex items-center gap-1 font-label-caps text-[10px] text-primary bg-primary/10 px-1.5 py-0.5 rounded-full">
                      <span className="material-symbols-outlined text-[12px]">
                        done_all
                      </span>
                      {" "}Completed
                    </span>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="font-headline-md text-headline-md text-on-surface font-bold">
                      775
                    </span>
                    <span className="font-label-caps text-[10px] text-on-surface-variant uppercase tracking-wider">
                      Score
                    </span>
                  </div>
                </div>
                <h2 className="font-headline-md text-body-lg font-bold text-on-surface group-hover:text-tertiary transition-colors">
                  Fast Bowling Run-up &amp; Release
                </h2>
                <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5 mb-space-sm">
                  Pace nets • Stride rhythm and delivery stride lock
                </p>
                {/* Dynamic Stat Track Bar */}
                <div className="flex flex-col gap-1.5 p-space-sm rounded-lg bg-surface-container-high">
                  <div className="flex items-center justify-between font-label-caps text-[11px]">
                    <span className="text-on-surface-variant uppercase tracking-wider">
                      Arm Extension Consistency
                    </span>
                    <span className="text-secondary font-bold">
                      84% Legal Target
                    </span>
                  </div>
                  {/* Dual comparison bar track */}
                  <div className="w-full h-1.5 rounded-full bg-surface-container-lowest overflow-hidden flex relative">
                    <div className="h-full bg-secondary" style={{ width: "84%" }}></div>
                    <div className="absolute right-[16%] top-0 bottom-0 w-0.5 bg-primary"></div>
                  </div>
                  <span className="text-[11px] text-on-surface-variant font-body-sm">
                    Arm angle matched within 1.8° of optimal digital twin arc.
                  </span>
                </div>
              </article>
              {/* Tennis Backhand Card */}
              <article className={`${visible(2, "tennis") ? "" : "hidden "}${pressed === 2 ? "ring-offset-2 brightness-110 " : ""}session-card group relative flex flex-col rounded-xl bg-surface-container p-space-md shadow-md active:scale-[0.99] transition-all cursor-pointer`} data-sport="tennis" onClick={() => press(2)}>
                <div className="flex items-start justify-between gap-space-sm mb-space-xs">
                  <div className="flex items-center gap-space-xs flex-wrap">
                    <span className="px-2 py-0.5 rounded-full bg-primary/15 text-primary font-label-caps text-label-caps uppercase tracking-wider">
                      Tennis
                    </span>
                    <span className="font-body-sm text-body-sm text-on-surface-variant">
                      18m 05s
                    </span>
                    <span className="flex items-center gap-1 font-label-caps text-[10px] text-primary bg-primary/10 px-1.5 py-0.5 rounded-full">
                      <span className="material-symbols-outlined text-[12px]">
                        done_all
                      </span>
                      {" "}Completed
                    </span>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="font-headline-md text-headline-md text-on-surface font-bold">
                      792
                    </span>
                    <span className="font-label-caps text-[10px] text-on-surface-variant uppercase tracking-wider">
                      Score
                    </span>
                  </div>
                </div>
                <h2 className="font-headline-md text-body-lg font-bold text-on-surface group-hover:text-primary transition-colors">
                  Backhand Crosscourt Drill
                </h2>
                <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5 mb-space-sm">
                  Clay surface • 64 strokes tracked • Depth target
                </p>
                {/* Inline Telemetry Micro-Sparkline */}
                <div className="flex items-center justify-between p-space-sm rounded-lg bg-surface-container-high">
                  <div className="flex items-center gap-space-sm">
                    <span className="material-symbols-outlined text-secondary text-[20px]">
                      sports_tennis
                    </span>
                    <div className="flex flex-col">
                      <span className="font-label-caps text-[10px] uppercase text-on-surface-variant">
                        Deep Ball Placement
                      </span>
                      <span className="font-body-sm text-body-sm text-on-surface font-medium">
                        88% into deep quadrant
                      </span>
                    </div>
                  </div>
                  <svg className="w-16 h-6 text-primary flex-shrink-0" fill="none" viewBox="0 0 64 24">
                    <path d="M2 18 L14 12 L26 15 L38 6 L50 9 L62 3" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
                  </svg>
                </div>
              </article>
              {/* Running 5K Card */}
              <article className={`${visible(3, "running") ? "" : "hidden "}${pressed === 3 ? "ring-offset-2 brightness-110 " : ""}session-card group relative flex flex-col rounded-xl bg-surface-container p-space-md shadow-md active:scale-[0.99] transition-all cursor-pointer`} data-sport="running" onClick={() => press(3)}>
                <div className="flex items-start justify-between gap-space-sm mb-space-xs">
                  <div className="flex items-center gap-space-xs flex-wrap">
                    <span className="px-2 py-0.5 rounded-full bg-secondary/15 text-secondary font-label-caps text-label-caps uppercase tracking-wider">
                      Running
                    </span>
                    <span className="font-body-sm text-body-sm text-on-surface-variant">
                      22m 40s
                    </span>
                    <span className="flex items-center gap-1 font-label-caps text-[10px] text-primary bg-primary/10 px-1.5 py-0.5 rounded-full">
                      <span className="material-symbols-outlined text-[12px]">
                        done_all
                      </span>
                      {" "}Completed
                    </span>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="font-headline-md text-headline-md text-on-surface font-bold">
                      805
                    </span>
                    <span className="font-label-caps text-[10px] text-on-surface-variant uppercase tracking-wider">
                      Score
                    </span>
                  </div>
                </div>
                <h2 className="font-headline-md text-body-lg font-bold text-on-surface group-hover:text-secondary transition-colors">
                  5K Cadence &amp; Foot Strike
                </h2>
                <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5 mb-space-sm">
                  Outdoor track • Midfoot strike focus • Target 174 spm
                </p>
                {/* Metric comparison pills */}
                <div className="grid grid-cols-2 gap-space-xs">
                  <div className="p-space-sm rounded-lg bg-surface-container-high flex flex-col">
                    <span className="font-label-caps text-[10px] uppercase text-on-surface-variant">
                      Avg Cadence
                    </span>
                    <div className="flex items-baseline gap-1 mt-0.5">
                      <span className="font-headline-md text-body-md font-bold text-on-surface">
                        176
                      </span>
                      <span className="text-[11px] text-primary font-bold">
                        spm
                      </span>
                    </div>
                  </div>
                  <div className="p-space-sm rounded-lg bg-surface-container-high flex flex-col">
                    <span className="font-label-caps text-[10px] uppercase text-on-surface-variant">
                      Ground Contact
                    </span>
                    <div className="flex items-baseline gap-1 mt-0.5">
                      <span className="font-headline-md text-body-md font-bold text-on-surface">
                        218
                      </span>
                      <span className="text-[11px] text-secondary font-bold">
                        ms
                      </span>
                    </div>
                  </div>
                </div>
              </article>
            </div>
            {/* Empty State Container (Hidden by default, triggered on empty search) */}
            <div className={`${visible(0, "tennis") || visible(1, "cricket") || visible(2, "tennis") || visible(3, "running") ? "hidden" : "flex"} flex-col items-center justify-center p-space-xl text-center rounded-xl bg-surface-container`} id="no-sessions-fallback">
              <div className="w-14 h-14 rounded-full bg-surface-container-highest flex items-center justify-center text-on-surface-variant mb-space-sm">
                <span className="material-symbols-outlined text-[28px]">
                  search_off
                </span>
              </div>
              {" "}
              <h3 className="font-headline-md text-body-lg font-bold text-on-surface">
                No matching sessions
              </h3>
              {" "}
              <p className="font-body-sm text-body-sm text-on-surface-variant mt-1 max-w-xs">
                Try adjusting your sport filter chips or searching by a different movement drill.
              </p>
              {" "}
              <button className="mt-space-md px-space-md py-2 rounded-full bg-primary text-on-primary font-label-caps text-label-caps uppercase tracking-wider" id="reset-filters" onClick={() => { setQuery(""); setSport("all"); }}>
                Reset Filters
              </button>
            </div>
          </div>
          {/* Micro-interaction Script for Interactive Tabs, Search & Navigation Highlighting */}
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
