"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useToast } from "@/lib/useToast";
import { type Dashboard, type Session, attributeScore, fmt, relativeDay, useApi } from "@/lib/data";

// Radar axes clockwise from the top, matching the Stitch labels.
const AXES = ["speed", "power", "endurance", "agility", "coordination", "balance", "mobility", "reaction", "technique", "recovery"];
const RADAR_R = 110; // radius of the 100% ring in the 320×320 viewBox

function radarXY(i: number, value: number) {
  const angle = (-90 + i * 36) * (Math.PI / 180);
  const r = (Math.max(0, Math.min(100, value)) / 100) * RADAR_R;
  return [Math.round(160 + r * Math.cos(angle)), Math.round(160 + r * Math.sin(angle))] as const;
}

type Mode = "current" | "peak" | "target";
const MODE_OFF = "avatar-mode-btn flex flex-col items-center justify-center py-2 px-1 rounded-lg text-on-surface-variant hover:text-on-surface transition-all";
const MODES: Record<Mode, { on: string; points: string; toast: string }> = {
  current: {
    on: "avatar-mode-btn relative flex flex-col items-center justify-center py-2 px-1 rounded-lg bg-surface-container-high text-primary shadow-[0_0_12px_rgba(75,226,119,0.25)] transition-all",
    points: "160,70 212,85 254,130 252,187 219,240 160,247 105,238 64,188 64,133 105,85",
    toast: "Baseline Mode: Live biomechanical sensors active",
  },
  peak: {
    on: "avatar-mode-btn relative flex flex-col items-center justify-center py-2 px-1 rounded-lg bg-surface-container-high text-secondary shadow-[0_0_12px_rgba(0,238,252,0.25)] transition-all",
    points: "160,63 218,80 258,127 256,189 221,243 160,251 100,242 61,190 60,130 100,81",
    toast: "Peak Mode: High-water records across all 4 sports",
  },
  target: {
    on: "avatar-mode-btn relative flex flex-col items-center justify-center py-2 px-1 rounded-lg bg-surface-container-high text-tertiary shadow-[0_0_12px_rgba(255,186,97,0.25)] transition-all",
    points: "160,56 223,75 264,124 262,193 224,248 160,257 95,248 56,193 56,126 95,76",
    toast: "Target Mode: 90-day kinetic goals active",
  },
};

import BottomNav from "@/components/BottomNav";


// Generated from design/stitch/my_avatar_shadowathlete/code.html by scripts/stitch-to-jsx.mjs.
export default function MyAvatar() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("current");
  const [toast, toastVisible, showToast] = useToast("Avatar calibration telemetry active");
  const { data: dash } = useApi<Dashboard>("/athlete/dashboard");
  const live = !!dash;
  const field = mode === "current" ? "current_score" : mode === "peak" ? "peak_score" : "target_score";
  const values = AXES.map((a) => attributeScore(dash?.attributes, a, field) ?? 0);
  const livePoints = values.map((v, i) => radarXY(i, v).join(",")).join(" ");
  const current = AXES.map((a) => attributeScore(dash?.attributes, a));
  const known = current.filter((v): v is number => v != null);
  const aggregate = known.length ? known.reduce((s, v) => s + v, 0) / known.length : null;
  const axisLabel = (i: number, demo: number) => (live ? fmt(current[i]) : demo);
  const { data: sessions } = useApi<Session[]>("/sessions");
  const sessCount = (sportId: number, demo: number) => (live ? (sessions ?? []).filter((s) => s.sport_id === sportId).length : demo);
  const lastSession = [...(sessions ?? [])].sort((a, b) => b.created_at.localeCompare(a.created_at))[0];
  // Highlight cards: live current vs target for an attribute, or the Stitch demo numbers.
  const hl = (name: string, demoCur: number, demoTarget: number) => {
    const cur = live ? attributeScore(dash?.attributes, name) : demoCur;
    const target = live ? attributeScore(dash?.attributes, name, "target_score") : demoTarget;
    const delta = cur != null && target != null ? Math.round(cur - target) : null;
    return { cur, target, delta, curW: `${cur ?? 0}%`, targetW: `${target ?? 0}%` };
  };
  const reaction = hl("reaction", 93, 88);
  const technique = hl("technique", 86, 92);
  const speed = hl("speed", 82, 86);
  const deltaText = (d: number | null, demo: string) => (live ? (d == null ? "No target set" : `${d >= 0 ? "+" : ""}${d} pts vs target`) : demo);

  function switchMode(next: Mode) {
    setMode(next);
    showToast(MODES[next].toast);
  }

  return (
    <div className="bg-surface text-on-surface font-body-md text-body-md min-h-screen flex flex-col antialiased selection:bg-primary selection:text-on-primary">
      <header className="fixed top-0 inset-x-0 z-50 bg-surface/80 backdrop-blur-xl shadow-[0_1px_12px_rgba(0,0,0,0.45)] pt-safe">
        <div className="h-16 px-margin-mobile flex items-center justify-between">
          <div className="flex items-center gap-space-sm">
            <img alt="Athletic silhouette icon with a subtle glowing cyan/lime duplicate shadow offset mark, symbolizing 'ShadowAthlete' and 'Your only opponent is you'. Brand logo" className="h-8 w-auto object-contain" src="https://lh3.googleusercontent.com/aida/AEtjO1U3su2IAJUfImc-QDFIgi5gzTYlDbkzgOVUovo_BNyYGtYNa9qhX4P-2oyefwHVQLhZ1Ab4ChydkqNbQYJ6oFFxL_5J_Qddc6EFgbqZ0J_0WRGiZMLAdr9Zbyj22BuHGThZeOIqyijB8g8KkiHaFQvfwq9-n-bK31wtBSZzAKwsfXkmsWzUb-vNdXU1acb3RA2HpoEFk8GGPHAJO2_JBzWeKHcIe9Wj_ZNrU6FINegMlz-Os5bYSEFdNK0" />
            <div className="flex flex-col">
              <span className="font-label-caps text-label-caps tracking-widest text-primary uppercase leading-none">
                ShadowAthlete
              </span>
              <span className="font-headline-md text-headline-md font-semibold text-on-surface tracking-tight leading-tight truncate max-w-[170px]">
                My Avatar
              </span>
            </div>
          </div>
          <div className="flex items-center gap-space-sm">
            <div className="h-2 w-2 rounded-full bg-secondary shadow-[0_0_8px_#00eefc] animate-pulse" title="Twin Synced"></div>
            <button aria-label="Athlete Profile" className="w-11 h-11 flex items-center justify-center p-0.5 rounded-full hover:opacity-90 transition-opacity" onClick={() => router.push("/profile")}>
              <img alt="Profile" className="w-8 h-8 rounded-full object-cover" src="https://lh3.googleusercontent.com/aida/AEtjO1VMnOn0JU8o67qYlYqYCfMg1WkAfuvSKYr7KKY53q6BP96YUKVar9XDhOk_G0q9oEEjtyqPTnjPz-jEJrc0WYt38c3cNqYZcfCBRJw4q5MRzBkPerclP4uhy8_16kr0ms5etlkMLS_PsBNC0_ErIoeYXxd2zuxLTVC_llRYg3rM1224q-gsYbE7WRhzle6ndzpYuYW6zR9J2qVASfJ92oWz4LbzfGQXXuIcMd1SHheY-ciDcBNW3LLRji8" />
            </button>
          </div>
        </div>
      </header>
      <main className="flex-1 flex flex-col relative w-full pt-16 pb-24 bg-surface">
        <div className="flex flex-col w-full pb-10 space-y-space-md">
          {/* Top Telemetry Banner */}
          <div className="px-margin-mobile flex flex-col space-y-space-xs">
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              Single kinetic avatar synchronized across Tennis, Cricket, Basketball &amp; Running.
            </p>
          </div>
          {/* Segmented Mode Control Pill */}
          <div className="px-margin-mobile">
            <div className="grid grid-cols-3 gap-1 p-1 bg-surface-container-lowest rounded-xl shadow-inner">
              <button className={mode === "current" ? MODES.current.on : MODE_OFF} id="mode-current" onClick={() => switchMode("current")}>
                <span className="font-label-caps text-label-caps uppercase tracking-wider font-bold">
                  Current You
                </span>
                <span className="text-[10px] text-on-surface-variant opacity-80 leading-tight">
                  Live Baseline
                </span>
              </button>
              <button className={mode === "peak" ? MODES.peak.on : MODE_OFF} id="mode-peak" onClick={() => switchMode("peak")}>
                <span className="font-label-caps text-label-caps uppercase tracking-wider font-bold">
                  Peak You
                </span>
                <span className="text-[10px] text-on-surface-variant opacity-80 leading-tight">
                  Personal Best
                </span>
              </button>
              <button className={mode === "target" ? MODES.target.on : MODE_OFF} id="mode-target" onClick={() => switchMode("target")}>
                <span className="font-label-caps text-label-caps uppercase tracking-wider font-bold">
                  Target You
                </span>
                <span className="text-[10px] text-on-surface-variant opacity-80 leading-tight">
                  90d Projection
                </span>
              </button>
            </div>
            {" "}
            <div className={`${mode === "target" ? "" : "hidden "}mt-1.5 px-1 flex items-center gap-1 text-[11px] text-tertiary`} id="target-disclaimer">
              <span className="material-symbols-outlined text-[13px]">
                info
              </span>
              <span>
                Goals, not guaranteed predictions. Based on biometric pacing.
              </span>
            </div>
          </div>
          {/* Centerpiece Twin Visualizer Canvas Card */}
          <div className="px-margin-mobile">
            <div className="relative w-full rounded-2xl bg-surface-container-low overflow-hidden shadow-2xl p-4">
              {/* Ambient kinetic glow blobs */}
              {" "}
              <div className="absolute -top-12 -left-12 w-48 h-48 rounded-full bg-primary/10 blur-3xl pointer-events-none"></div>
              {" "}
              <div className="absolute -bottom-16 -right-16 w-56 h-56 rounded-full bg-secondary-container/15 blur-3xl pointer-events-none"></div>
              {" "}
              {/* Header Telemetry Row */}
              {" "}
              <div className="relative z-10 flex items-center justify-between pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-surface-container-highest flex items-center justify-center text-primary shadow-[0_0_8px_rgba(75,226,119,0.3)]">
                    <span className="material-symbols-outlined text-[20px]">
                      fingerprint
                    </span>
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-headline-md text-[18px] leading-tight font-bold text-on-surface">
                        Twin Lv. {dash?.athlete.level ?? 27}
                      </span>
                    </div>
                    {" "}
                    <p className="font-body-sm text-[11px] text-on-surface-variant leading-none">
                      {live ? (lastSession ? `Calibrated ${relativeDay(lastSession.created_at).toLowerCase()}` : "Not calibrated yet") : "Calibrated 2h ago"}
                    </p>
                  </div>
                </div>
              </div>
              {" "}
              {/* Avatar Graphic Centerpiece Display */}
              {" "}
              <div className="relative w-full h-72 rounded-xl overflow-hidden bg-surface-container-lowest flex items-center justify-center">
                {/* Visual Backdrop Image depicting Biomechanical Skeletal & Kinetic Mesh */}
                <img className="absolute inset-0 w-full h-full object-cover object-center opacity-85 mix-blend-screen" data-alt="Futuristic athletic 3D wireframe digital twin skeleton showing kinetic motion tracking. High-contrast cybernetic sports science aesthetic with luminous neon green nodes and glowing cyan translucent bones in dynamic athletic readiness stance on a pure black telemetry grid." src="https://lh3.googleusercontent.com/aida-public/AB6AXuCDM8ujHrdGLjzcGWo_W6ED9NUmq36NIbDElHnFfLMubktLR1xiNMDR0mUERgpPXUFPbMv5ZZdNea6LtNuPP6iyFCi6DlFQj6zIFfpIxKoYydaPqomRDOCjlmnBqnwi4-bZ714iXhQtwWRsC3nkmpIo7d14qnZLf4kl0EbmSYv0WCTTFlA68Nq5JvU_9zULieossCdDqGWXnpkifeqEsjlM0b8dTtiiGPU7GIJp3UzbMSrWPGtz3Bg8" />
              </div>
              {" "}
            </div>
          </div>
          {/* Biomechanics Radar Chart Module */}
          <div className="px-margin-mobile">
            <div className="p-4 rounded-2xl bg-surface-container shadow-lg flex flex-col space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-label-caps text-label-caps uppercase text-primary tracking-widest">
                    Cross-Sport Profile
                  </span>
                  {" "}
                  <h2 className="font-headline-md text-[18px] text-on-surface font-bold leading-tight">
                    Athlete attributes
                  </h2>
                </div>
                <div className="flex flex-col items-end text-right">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 font-label-caps text-[10px] uppercase text-primary">
                      <span className="w-2 h-0.5 bg-primary"></span>
                      {" "}Current
                    </span>
                    <span className="inline-flex items-center gap-1 font-label-caps text-[10px] uppercase text-secondary">
                      <span className="w-2 h-0.5 bg-secondary-container"></span>
                      {" "}Benchmark
                    </span>
                  </div>
                </div>
              </div>
              {/* Radar Web Graphic: 10 Universals */}
              {/* Center: 150, 150. Radius: 100 */}
              {/* Angles (36 deg each):
           0 (Speed): (150, 50)
           36 (Power): (209, 69)
           72 (Endurance): (245, 119)
           108 (Agility): (245, 181)
           144 (Coordination): (209, 231)
           180 (Balance): (150, 250)
           216 (Mobility): (91, 231)
           252 (Reaction): (55, 181)
           288 (Technique): (55, 119)
           324 (Recovery): (91, 69) */}
              <div className="relative w-full aspect-square max-w-[320px] mx-auto flex items-center justify-center py-2">
                <svg className="w-full h-full overflow-visible" viewBox="0 0 320 320">
                  <defs>
                    <radialGradient cx="50%" cy="50%" id="radarRadial" r="50%">
                      <stop offset="0%" stopColor="#4be277" stopOpacity="0.25"></stop>
                      <stop offset="70%" stopColor="#4be277" stopOpacity="0.08"></stop>
                      <stop offset="100%" stopColor="#10141a" stopOpacity="0"></stop>
                    </radialGradient>
                    <linearGradient id="twinStroke" x1="0%" x2="100%" y1="0%" y2="100%">
                      <stop offset="0%" stopColor="#00eefc"></stop>
                      <stop offset="100%" stopColor="#4be277"></stop>
                    </linearGradient>
                  </defs>
                  {/* Concentric Web Rings (20%, 40%, 60%, 80%, 100%) */}
                  <circle cx="160" cy="160" fill="none" r="22" stroke="#262a31" strokeWidth="1"></circle>
                  <circle cx="160" cy="160" fill="none" r="44" stroke="#262a31" strokeWidth="1"></circle>
                  <circle cx="160" cy="160" fill="none" r="66" stroke="#31353c" strokeDasharray="3,3" strokeWidth="1"></circle>
                  <circle cx="160" cy="160" fill="none" r="88" stroke="#31353c" strokeWidth="1"></circle>
                  <circle cx="160" cy="160" fill="none" r="110" stroke="#3d4a3d" strokeWidth="1"></circle>
                  {/* Radial Spokes */}
                  <g stroke="#262a31" strokeWidth="1">
                    <line x1="160" x2="160" y1="160" y2="50"></line>
                    <line x1="160" x2="225" y1="160" y2="71"></line>
                    <line x1="160" x2="265" y1="160" y2="126"></line>
                    <line x1="160" x2="265" y1="160" y2="194"></line>
                    <line x1="160" x2="225" y1="160" y2="249"></line>
                    <line x1="160" x2="160" y1="160" y2="270"></line>
                    <line x1="160" x2="95" y1="160" y2="249"></line>
                    <line x1="160" x2="55" y1="160" y2="194"></line>
                    <line x1="160" x2="55" y1="160" y2="126"></line>
                    <line x1="160" x2="95" y1="160" y2="71"></line>
                  </g>
                  {/* Shadow Twin / Target Polygon (Cyan Outline) */}
                  {/* Scaled values approx: Speed 90, Power 85, Endurance 92, Agility 90, Coord 95, Balance 85, Mob 90, React 96, Tech 92, Rec 88 */}
                  <polygon fill="#00eefc" fillOpacity="0.08" points="160,61 221,79 261,129 259,191 222,245 160,254 98,245 59,191 59,129 98,79" stroke="#00eefc" strokeDasharray="4,2" strokeWidth="1.5"></polygon>
                  {/* Current Athlete Polygon (Lime Fill & Accent Nodes) */}
                  {/* Attributes: Speed(82), Power(76), Endurance(88), Agility(85), Coordination(91), Balance(79), Mobility(84), Reaction(93), Technique(86), Recovery(80) */}
                  <polygon fill="url(#radarRadial)" id="athlete-polygon" points={live ? livePoints : MODES[mode].points} stroke="#4be277" strokeWidth="2.5"></polygon>
                  {/* Data Node Markers */}
                  {live ? (
                    values.map((v, i) => {
                      const [cx, cy] = radarXY(i, v);
                      return <circle key={AXES[i]} cx={cx} cy={cy} fill="#4be277" r="3.5"></circle>;
                    })
                  ) : (
                    <>
                  <circle cx="160" cy="70" fill="#4be277" r="3.5"></circle>
                  <circle cx="212" cy="85" fill="#4be277" r="3.5"></circle>
                  <circle cx="254" cy="130" fill="#4be277" r="3.5"></circle>
                  <circle cx="252" cy="187" fill="#4be277" r="3.5"></circle>
                  <circle cx="219" cy="240" fill="#4be277" r="3.5"></circle>
                  <circle cx="160" cy="247" fill="#4be277" r="3.5"></circle>
                  <circle cx="105" cy="238" fill="#4be277" r="3.5"></circle>
                  <circle cx="64" cy="188" fill="#4be277" r="3.5"></circle>
                  <circle cx="64" cy="133" fill="#4be277" r="3.5"></circle>
                  <circle cx="105" cy="85" fill="#4be277" r="3.5"></circle>
                    </>
                  )}
                  {/* Category Labels around perimeter */}
                  <text fill="#dfe2eb" fontFamily="Space Grotesk" fontSize="10" fontWeight="700" textAnchor="middle" x="160" y="42">
                    SPD {axisLabel(0, 82)}
                  </text>
                  <text fill="#dfe2eb" fontFamily="Space Grotesk" fontSize="10" fontWeight="600" textAnchor="start" x="238" y="65">
                    PWR {axisLabel(1, 76)}
                  </text>
                  <text fill="#dfe2eb" fontFamily="Space Grotesk" fontSize="10" fontWeight="600" textAnchor="start" x="275" y="128">
                    END {axisLabel(2, 88)}
                  </text>
                  <text fill="#dfe2eb" fontFamily="Space Grotesk" fontSize="10" fontWeight="600" textAnchor="start" x="275" y="198">
                    AGL {axisLabel(3, 85)}
                  </text>
                  <text fill="#dfe2eb" fontFamily="Space Grotesk" fontSize="10" fontWeight="600" textAnchor="start" x="238" y="260">
                    CRD {axisLabel(4, 91)}
                  </text>
                  <text fill="#dfe2eb" fontFamily="Space Grotesk" fontSize="10" fontWeight="600" textAnchor="middle" x="160" y="286">
                    BAL {axisLabel(5, 79)}
                  </text>
                  <text fill="#dfe2eb" fontFamily="Space Grotesk" fontSize="10" fontWeight="600" textAnchor="end" x="82" y="260">
                    MOB {axisLabel(6, 84)}
                  </text>
                  <text fill="#4be277" fontFamily="Space Grotesk" fontSize="10" fontWeight="700" textAnchor="end" x="45" y="198">
                    RCT {axisLabel(7, 93)}
                  </text>
                  <text fill="#dfe2eb" fontFamily="Space Grotesk" fontSize="10" fontWeight="600" textAnchor="end" x="45" y="128">
                    TEC {axisLabel(8, 86)}
                  </text>
                  <text fill="#dfe2eb" fontFamily="Space Grotesk" fontSize="10" fontWeight="600" textAnchor="end" x="82" y="65">
                    REC {axisLabel(9, 80)}
                  </text>
                </svg>
              </div>
              {/* Quick summary badge below radar */}
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-surface-container-high">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-[18px]">
                    verified
                  </span>
                  <span className="font-body-sm text-[12px] text-on-surface">
                    Kinetic Aggregate Score
                  </span>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="font-metric-large text-[22px] leading-none font-bold text-on-surface">
                    {live ? fmt(aggregate, 1) : "84.4"}
                  </span>
                  <span className="font-mono text-[11px] text-primary">
                    / 100
                  </span>
                </div>
              </div>
            </div>
          </div>
          {/* Contributing Sports Breakdown Section */}
          <div className="px-margin-mobile flex flex-col space-y-space-xs">
            <div className="flex items-center justify-between">
              <span className="font-label-caps text-label-caps uppercase text-on-surface-variant tracking-wider">
                Multi-Sport Feeds
              </span>
              <span className="font-mono text-[11px] text-secondary">
                32 Total Sessions Mapped
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              {/* Tennis Card */}
              <div className="p-3 rounded-xl bg-surface-container-low flex flex-col justify-between space-y-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-primary text-[18px]">
                      sports_tennis
                    </span>
                    <span className="font-headline-md text-[14px] text-on-surface font-bold">
                      Tennis
                    </span>
                  </div>
                  <span className="font-mono text-[10px] text-primary bg-primary/10 px-1.5 py-0.5 rounded">
                    {sessCount(1, 14)} sess
                  </span>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] text-on-surface-variant font-mono">
                    <span>
                      Tech • Agil • React
                    </span>
                    <span className="text-primary font-bold">
                      +44% feed
                    </span>
                  </div>
                  {" "}
                  <div className="w-full h-1.5 rounded-full bg-surface-container-highest overflow-hidden">
                    <div className="h-full bg-primary rounded-full" style={{ width: "44%" }}></div>
                  </div>
                </div>
              </div>
              {/* Cricket Card */}
              <div className="p-3 rounded-xl bg-surface-container-low flex flex-col justify-between space-y-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-secondary text-[18px]">
                      sports_cricket
                    </span>
                    <span className="font-headline-md text-[14px] text-on-surface font-bold">
                      Cricket
                    </span>
                  </div>
                  <span className="font-mono text-[10px] text-secondary bg-secondary/10 px-1.5 py-0.5 rounded">
                    {sessCount(2, 6)} sess
                  </span>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] text-on-surface-variant font-mono">
                    <span>
                      Speed • Pwr • Bal
                    </span>
                    <span className="text-secondary font-bold">
                      +20% feed
                    </span>
                  </div>
                  {" "}
                  <div className="w-full h-1.5 rounded-full bg-surface-container-highest overflow-hidden">
                    <div className="h-full bg-secondary-container rounded-full" style={{ width: "20%" }}></div>
                  </div>
                </div>
              </div>
              {/* Basketball Card */}
              <div className="p-3 rounded-xl bg-surface-container-low flex flex-col justify-between space-y-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-tertiary text-[18px]">
                      sports_basketball
                    </span>
                    <span className="font-headline-md text-[14px] text-on-surface font-bold">
                      Basketball
                    </span>
                  </div>
                  <span className="font-mono text-[10px] text-tertiary bg-tertiary/10 px-1.5 py-0.5 rounded">
                    {sessCount(3, 4)} sess
                  </span>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] text-on-surface-variant font-mono">
                    <span>
                      Coord • Vert
                    </span>
                    <span className="text-tertiary font-bold">
                      +12% feed
                    </span>
                  </div>
                  {" "}
                  <div className="w-full h-1.5 rounded-full bg-surface-container-highest overflow-hidden">
                    <div className="h-full bg-tertiary rounded-full" style={{ width: "12%" }}></div>
                  </div>
                </div>
              </div>
              {/* Running Card */}
              <div className="p-3 rounded-xl bg-surface-container-low flex flex-col justify-between space-y-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-primary text-[18px]">
                      directions_run
                    </span>
                    <span className="font-headline-md text-[14px] text-on-surface font-bold">
                      Running
                    </span>
                  </div>
                  <span className="font-mono text-[10px] text-primary bg-primary/10 px-1.5 py-0.5 rounded">
                    {sessCount(4, 8)} sess
                  </span>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] text-on-surface-variant font-mono">
                    <span>
                      Endur • Cadence
                    </span>
                    <span className="text-primary font-bold">
                      +24% feed
                    </span>
                  </div>
                  {" "}
                  <div className="w-full h-1.5 rounded-full bg-surface-container-highest overflow-hidden">
                    <div className="h-full bg-primary-container rounded-full" style={{ width: "24%" }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* Attribute Deep-Dive Cards */}
          <div className="px-margin-mobile flex flex-col space-y-space-xs">
            <div className="flex items-center justify-between">
              <span className="font-label-caps text-label-caps uppercase text-on-surface-variant tracking-wider">
                Kinetic Highlights
              </span>
              <span className="font-label-badge text-label-badge text-outline">
                Telemetry Deliberation
              </span>
            </div>
            {/* Deep-Dive 1: Reaction */}
            <div className="p-3.5 rounded-2xl bg-surface-container flex flex-col space-y-2 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-primary/20 flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined text-[16px]">
                      bolt
                    </span>
                  </div>
                  <div>
                    <h3 className="font-headline-md text-[15px] font-bold text-on-surface leading-tight">
                      Reaction Time
                    </h3>
                    {" "}
                    <span className="text-[11px] text-primary font-medium">
                      Top 3% Semi-Pro • Tennis &amp; Basketball
                    </span>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <span className="font-metric-large text-[22px] leading-tight font-bold text-primary">
                    {fmt(reaction.cur)}
                    <span className="text-xs text-on-surface-variant">
                      /100
                    </span>
                  </span>
                  <span className="text-[10px] font-mono text-outline">
                    182ms avg trigger
                  </span>
                </div>
              </div>
              {/* Split-rail Attribute Progress Track */}
              <div className="relative w-full h-2 rounded bg-surface-container-highest overflow-hidden">
                <div className="absolute left-0 top-0 h-full bg-secondary-container/50 rounded" style={{ width: "88%" }}></div>
                {" "}
                <div className="absolute left-0 top-0 h-full bg-primary rounded shadow-[0_0_8px_#4be277]" style={{ width: reaction.curW }}></div>
              </div>
              <div className="flex justify-between items-center text-[11px] font-mono text-on-surface-variant pt-0.5">
                <span>
                  Benchmark: {fmt(reaction.target)} (Twin Target)
                </span>
                <span className="text-primary font-semibold">
                  {deltaText(reaction.delta, "+5 pts vs target")}
                </span>
              </div>
            </div>
            {/* Deep-Dive 2: Technique */}
            <div className="p-3.5 rounded-2xl bg-surface-container flex flex-col space-y-2 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-secondary/20 flex items-center justify-center text-secondary">
                    <span className="material-symbols-outlined text-[16px]">
                      model_training
                    </span>
                  </div>
                  <div>
                    <h3 className="font-headline-md text-[15px] font-bold text-on-surface leading-tight">
                      Biomechanical Technique
                    </h3>
                    {" "}
                    <span className="text-[11px] text-secondary font-medium">
                      +4.2 pts since last session
                    </span>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <span className="font-metric-large text-[22px] leading-tight font-bold text-on-surface">
                    {fmt(technique.cur)}
                    <span className="text-xs text-on-surface-variant">
                      /100
                    </span>
                  </span>
                  <span className="text-[10px] font-mono text-secondary">
                    Forehand stroke fidelity
                  </span>
                </div>
              </div>
              {/* Split-rail Attribute Progress Track */}
              <div className="relative w-full h-2 rounded bg-surface-container-highest overflow-hidden">
                <div className="absolute left-0 top-0 h-full bg-secondary-container/60 rounded" style={{ width: technique.targetW }}></div>
                {" "}
                <div className="absolute left-0 top-0 h-full bg-primary rounded" style={{ width: technique.curW }}></div>
              </div>
              <div className="flex justify-between items-center text-[11px] font-mono text-on-surface-variant pt-0.5">
                <span>
                  Optimal Target: {fmt(technique.target)}
                </span>
                <span className="text-tertiary font-semibold">
                  {deltaText(technique.delta, "-6 pts delta")}
                </span>
              </div>
            </div>
            {/* Deep-Dive 3: Speed */}
            <div className="p-3.5 rounded-2xl bg-surface-container flex flex-col space-y-2 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-surface-container-highest flex items-center justify-center text-on-surface">
                    <span className="material-symbols-outlined text-[16px]">
                      speed
                    </span>
                  </div>
                  <div>
                    <h3 className="font-headline-md text-[15px] font-bold text-on-surface leading-tight">
                      Sprint &amp; Arm Speed
                    </h3>
                    {" "}
                    <span className="text-[11px] text-on-surface-variant">
                      124.6 mph max serve • 4.38s 40m sprint
                    </span>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <span className="font-metric-large text-[22px] leading-tight font-bold text-on-surface">
                    {fmt(speed.cur)}
                    <span className="text-xs text-on-surface-variant">
                      /100
                    </span>
                  </span>
                  <span className="text-[10px] font-mono text-outline">
                    P94 Percentile
                  </span>
                </div>
              </div>
              {/* Split-rail Attribute Progress Track */}
              <div className="relative w-full h-2 rounded bg-surface-container-highest overflow-hidden">
                <div className="absolute left-0 top-0 h-full bg-secondary-container/60 rounded" style={{ width: speed.targetW }}></div>
                {" "}
                <div className="absolute left-0 top-0 h-full bg-primary rounded" style={{ width: speed.curW }}></div>
              </div>
              <div className="flex justify-between items-center text-[11px] font-mono text-on-surface-variant pt-0.5">
                <span>
                  {live ? `Target: ${fmt(speed.target)}` : "P90 Standard: 86"}
                </span>
                {!live && (
                  <span className="text-on-surface-variant">
                    Demo Data Tagged
                  </span>
                )}
              </div>
            </div>
          </div>
          {/* Calibration Actions Call to Action */}
          <div className="px-margin-mobile pt-2 flex flex-col space-y-2.5">
            <button className="w-full py-3.5 px-4 rounded-xl bg-primary text-on-primary font-headline-md text-[15px] font-bold tracking-tight shadow-[0_0_24px_rgba(75,226,119,0.35)] active:scale-[0.98] transition-all flex items-center justify-center gap-2" onClick={() => router.push("/capture")}>
              <span className="material-symbols-outlined text-[20px]">
                play_circle
              </span>
              <span>
                Start Calibration Session
              </span>
            </button>
          </div>
          {/* Subtle Micro-Toast Container for Interactive Clicks */}
          <div className={`fixed bottom-20 left-1/2 -translate-x-1/2 z-50 pointer-events-none transition-all duration-300 ${toastVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"} transform px-4 py-2 rounded-xl bg-surface-bright/95 backdrop-blur-md shadow-2xl text-on-surface text-[12px] font-mono flex items-center gap-2`} id="avatar-toast">
            <span className="material-symbols-outlined text-primary text-[16px]">
              check_circle
            </span>
            <span id="toast-text">
              {toast}
            </span>
          </div>
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
