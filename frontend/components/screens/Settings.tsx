"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { auth } from "@/lib/api";
import { useAccountEmail, useAthleteName } from "@/lib/useAthlete";

const UNIT_ON = "unit-toggle flex items-center justify-center gap-1.5 py-2 rounded-full font-label-caps text-label-caps uppercase tracking-wider transition-all bg-primary text-on-primary shadow-sm";
const UNIT_OFF = "unit-toggle flex items-center justify-center gap-1.5 py-2 rounded-full font-label-caps text-label-caps uppercase tracking-wider transition-all text-on-surface-variant hover:text-on-surface";

function Switch({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <button aria-checked={on} className={`interactive-switch relative w-12 h-6 rounded-full ${on ? "bg-primary" : "bg-surface-container-highest"} flex-shrink-0 transition-colors p-0.5 focus:outline-none`} onClick={onToggle} role="switch" type="button">
      <span className={`block w-5 h-5 rounded-full ${on ? "bg-on-primary translate-x-6" : "bg-on-surface-variant translate-x-0"} shadow-sm transform transition-transform`}></span>
    </button>
  );
}

import BottomNav from "@/components/BottomNav";


// Generated from design/stitch/settings_preferences_shadowathlete/code.html by scripts/stitch-to-jsx.mjs.
export default function Settings() {
  const router = useRouter();
  const name = useAthleteName();
  const email = useAccountEmail();
  const [units, setUnits] = useState<"metric" | "imperial">("metric");
  const [switches, setSwitches] = useState([true, true, false, true]);
  const [sync, setSync] = useState<"idle" | "syncing" | "done">("idle");
  const [cache, setCache] = useState<"full" | "clearing" | "cleared">("full");
  const flip = (i: number) => setSwitches((s) => s.map((v, j) => (j === i ? !v : v)));

  function syncNow() {
    setSync("syncing");
    setTimeout(() => setSync("done"), 900);
  }

  function purge() {
    setCache("clearing");
    setTimeout(() => setCache("cleared"), 700);
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
                Profile
              </span>
            </div>
          </div>
          <div className="flex items-center gap-space-sm">
            <div className="h-2 w-2 rounded-full bg-secondary shadow-[0_0_8px_#00eefc] animate-pulse" title="Twin Synced"></div>
            <button aria-label="Athlete Profile" onClick={() => router.push("/profile")} className="w-11 h-11 flex items-center justify-center p-0.5 rounded-full hover:opacity-90 transition-opacity">
              <img alt="Profile" className="w-8 h-8 rounded-full object-cover" src="https://lh3.googleusercontent.com/aida/AEtjO1VMnOn0JU8o67qYlYqYCfMg1WkAfuvSKYr7KKY53q6BP96YUKVar9XDhOk_G0q9oEEjtyqPTnjPz-jEJrc0WYt38c3cNqYZcfCBRJw4q5MRzBkPerclP4uhy8_16kr0ms5etlkMLS_PsBNC0_ErIoeYXxd2zuxLTVC_llRYg3rM1224q-gsYbE7WRhzle6ndzpYuYW6zR9J2qVASfJ92oWz4LbzfGQXXuIcMd1SHheY-ciDcBNW3LLRji8" />
            </button>
          </div>
        </div>
      </header>
      <main className="flex-1 flex flex-col relative w-full pt-16 pb-24 bg-surface">
        <div className="flex flex-col w-full px-margin-mobile pb-space-xl">
          {/* Back Action Navigation & Screen Context */}
          <div className="flex items-center justify-between py-space-sm">
            <a aria-label="Return to athlete profile" className="inline-flex items-center gap-space-xs text-on-surface-variant hover:text-primary transition-colors py-space-xs" href="#">
              <span className="material-symbols-outlined text-[20px]">
                arrow_back
              </span>
              <span className="font-label-caps text-label-caps uppercase tracking-wider">
                Back to Profile
              </span>
            </a>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-container-high">
              <span className="inline-block w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_#22c55e] animate-pulse"></span>
              <span className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-widest text-[10px]">
                Ghost Engine Active
              </span>
            </div>
          </div>
          {/* Screen Lead Title */}
          <div className="mt-space-sm mb-space-lg flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary text-[24px]">
                tune
              </span>
              <h1 className="font-headline-xl-mobile text-headline-xl-mobile text-on-surface tracking-tight">
                System &amp; Telemetry
              </h1>
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              Calibrate biometric mesh accuracy, visual fidelity, and neural privacy streams.
            </p>
          </div>
          {/* Account & Identity Section */}
          <div className="flex flex-col gap-space-sm mb-space-lg">
            <div className="flex items-center justify-between px-space-xs">
              <span className="font-label-caps text-label-caps uppercase text-primary tracking-widest flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px]">
                  fingerprint
                </span>
                {" "}Kinetic Identity
              </span>
              <span className="font-label-badge text-label-badge text-secondary font-semibold">
                Tier 1 Pro Mesh
              </span>
            </div>
            <div className="bg-surface-container rounded-xl p-space-md flex flex-col gap-space-md shadow-md">
              {/* Athlete Profile Teaser Row */}
              <div className="flex items-center justify-between gap-space-sm">
                <div className="flex items-center gap-space-md min-w-0">
                  <div className="relative w-12 h-12 rounded-full bg-surface-container-highest flex-shrink-0 overflow-hidden flex items-center justify-center shadow-inner">
                    <img className="w-full h-full object-cover" data-alt="Athletic portrait of Alex Carter, close-up dynamic sports lighting with electric lime rim light and faint cybernetic cyan projection across the shoulder and cheek, hyper-focused determination, studio dark background" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDh71EFrtEEoSrDM6D1CgMSahgRBvh_yvMKGTzxtmmwVhExkp2k5CI3OTdnpSxBDY1RzSzJOyXeqxMZbD6BPkTYX0k-DRyNEu22q4sttEo6zqutnyvtfORXB_N0NJG1b4SVI3mJJ54C0395rPkeXpWZWJlCnmZwFIgCbSzwecTTVxTIFYtvERZuynBTjdpotGdXnAKcJL8i_Hvv9yejByAMwkVEGHCWDCCc7c3bSuMb3eN0ZT2re8Fk" />
                    <div className="absolute inset-0 bg-gradient-to-t from-surface-container-lowest/70 via-transparent to-transparent"></div>
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="font-headline-md text-headline-md text-on-surface truncate">
                      {name}
                    </span>
                    <span className="font-body-sm text-body-sm text-on-surface-variant truncate">
                      {email}
                    </span>
                  </div>
                </div>
                <button aria-label="Edit Profile Details" onClick={() => router.push("/onboarding/details")} className="px-space-sm py-1.5 rounded-full bg-surface-container-high text-primary hover:bg-surface-container-highest transition-colors font-label-caps text-label-caps uppercase tracking-wider flex-shrink-0" type="button">
                  Edit
                </button>
              </div>
              <div className="h-px w-full bg-surface-container-highest"></div>
              {/* Security & Connected Accounts */}
              <div className="flex flex-col gap-space-sm">
                <button className="w-full flex items-center justify-between py-1 text-left group" type="button" onClick={() => router.push("/reset-password")}>
                  <div className="flex items-center gap-space-sm">
                    <span className="material-symbols-outlined text-[20px] text-on-surface-variant group-hover:text-primary transition-colors">
                      lock_reset
                    </span>
                    <div className="flex flex-col">
                      <span className="font-body-md text-body-md text-on-surface">
                        Password &amp; Biometric Auth
                      </span>
                      <span className="font-body-sm text-body-sm text-on-surface-variant">
                        Last updated 18 days ago
                      </span>
                    </div>
                  </div>
                  <span className="material-symbols-outlined text-[20px] text-on-surface-variant group-hover:translate-x-0.5 transition-transform">
                    chevron_right
                  </span>
                </button>
                <div className="flex items-center justify-between py-1">
                  <div className="flex items-center gap-space-sm">
                    <span className="material-symbols-outlined text-[20px] text-on-surface-variant">
                      hub
                    </span>
                    <div className="flex flex-col">
                      <span className="font-body-md text-body-md text-on-surface">
                        Connected Portals
                      </span>
                      <span className="font-body-sm text-body-sm text-on-surface-variant">
                        Apple ID &amp; Google Synced
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="px-2 py-0.5 rounded-full bg-surface-container-high font-label-caps text-label-caps text-secondary uppercase">
                      2 Active
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* Biometrics & Units Specification */}
          <div className="flex flex-col gap-space-sm mb-space-lg">
            <div className="flex items-center justify-between px-space-xs">
              <span className="font-label-caps text-label-caps uppercase text-secondary tracking-widest flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px]">
                  straighten
                </span>
                {" "}Telemetry Metrics
              </span>
              <span className="font-label-caps text-label-caps text-on-surface-variant uppercase">
                Global Units
              </span>
            </div>
            <div className="bg-surface-container rounded-xl p-space-md flex flex-col gap-space-md shadow-md">
              {/* Metric vs Imperial Pill Segmented Control */}
              <div className="flex flex-col gap-2">
                <span className="font-body-md text-body-md text-on-surface font-medium">
                  Measurement Standard
                </span>
                <div className="grid grid-cols-2 p-1 rounded-full bg-surface-container-lowest gap-1" id="units-selector">
                  <button aria-pressed={units === "metric"} className={units === "metric" ? UNIT_ON : UNIT_OFF} data-unit="metric" type="button" onClick={() => setUnits("metric")}>
                    <span className="material-symbols-outlined text-[16px]">
                      speed
                    </span>
                    {" "}Metric (cm, kg, km/h)
                  </button>
                  <button aria-pressed={units === "imperial"} className={units === "imperial" ? UNIT_ON : UNIT_OFF} data-unit="imperial" type="button" onClick={() => setUnits("imperial")}>
                    <span className="material-symbols-outlined text-[16px]">
                      pace
                    </span>
                    {" "}Imperial (ft, lb, mph)
                  </button>
                </div>
              </div>
              <div className="h-px w-full bg-surface-container-highest"></div>
              {/* Kinetic Video Stream Engine Setting */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[20px] text-secondary">
                      videocam
                    </span>
                    <span className="font-body-md text-body-md text-on-surface">
                      Tracking Stream Pipeline
                    </span>
                  </div>
                  <span className="font-label-caps text-label-caps text-primary uppercase">
                    Pro Vision
                  </span>
                </div>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  High frame rates enable micro-second skeletal joint comparison against your digital twin.
                </p>
                <div className="flex flex-col gap-2 mt-1">
                  <label className="flex items-start justify-between p-3 rounded-xl bg-surface-container-high cursor-pointer transition-colors hover:bg-surface-bright">
                    <div className="flex items-start gap-3">
                      <input defaultChecked className="mt-1 accent-primary h-4 w-4 bg-surface-container-lowest border-0" name="video_quality" type="radio" />
                      <div className="flex flex-col">
                        <span className="font-headline-md text-headline-md text-on-surface text-[16px] leading-tight">
                          4K @ 60 FPS • High Bitrate
                        </span>
                        <span className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                          Recommended for millimeter ghost sync. High thermal output.
                        </span>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-primary/20 text-primary font-label-caps text-label-caps uppercase">
                      Ultra
                    </span>
                  </label>
                  <label className="flex items-start justify-between p-3 rounded-xl bg-surface-container-high/60 cursor-pointer transition-colors hover:bg-surface-bright">
                    <div className="flex items-start gap-3">
                      <input className="mt-1 accent-primary h-4 w-4 bg-surface-container-lowest border-0" name="video_quality" type="radio" />
                      <div className="flex flex-col">
                        <span className="font-headline-md text-headline-md text-on-surface text-[16px] leading-tight">
                          1080p @ 60 FPS • Battery Saver
                        </span>
                        <span className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                          Optimized for long field sessions with 40% battery preservation.
                        </span>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-surface-container-highest text-on-surface-variant font-label-caps text-label-caps uppercase">
                      Eco
                    </span>
                  </label>
                </div>
              </div>
            </div>
          </div>
          {/* Digital Twin & Visual Rendering Suite */}
          <div className="flex flex-col gap-space-sm mb-space-lg">
            <div className="flex items-center justify-between px-space-xs">
              <span className="font-label-caps text-label-caps uppercase text-primary tracking-widest flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px]">
                  accessibility_new
                </span>
                {" "}Digital Twin Holography
              </span>
              <span className="font-label-caps text-label-caps text-secondary uppercase">
                Mesh v2.8
              </span>
            </div>
            {/* Telemetry Visual Card Mockup (Delight Moment) */}
            <div className="relative w-full rounded-xl overflow-hidden bg-surface-container-high p-4 flex flex-col justify-end min-h-[140px] shadow-lg">
              <div className="absolute inset-0 bg-cover bg-center opacity-30" data-alt="Futuristic cybernetic athletic twin visualizer, dark obsidian atmosphere with glowing dual wireframe silhouettes of a running athlete, one glowing intense lime and the ghost duplicate trailing in ethereal luminescent cyan with biomechanical vector angles" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCk8wyOmqoKU-hSdNnkdG9TNZz7pQfKnQ88RywVhtK9Dh9pTH3C2AQaePtddVJM2fdx7RrRtgjajAeQTGvAaZJAppwk7GQqyEmdBiIIDCmMYbbK5K6tPRt7kdWO8qOCzh_jf21OlAoxJBigpJbck1QWa4veDzdWrbmJoiDfLSPzbISqsvXh8RD5Ryx6V6nHsqqILasoDDK5XkNAp2UfrjJYwZENMvQdeaA9ycWuQhzNjijwN7svxFNx')" }}></div>
              <div className="absolute inset-0 bg-gradient-to-t from-surface-container via-surface-container/60 to-transparent"></div>
              <div className="relative z-10 flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="font-label-caps text-label-caps text-secondary uppercase tracking-widest">
                    Ghost Trail Overlay
                  </span>
                  <span className="font-headline-md text-headline-md text-on-surface leading-tight">
                    Active Comparative Ghost
                  </span>
                </div>
                <div className="px-3 py-1 rounded-full bg-secondary/10 border-0 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-secondary shadow-[0_0_6px_#00eefc]"></span>
                  <span className="font-label-caps text-label-caps text-secondary uppercase">
                    Real-time
                  </span>
                </div>
              </div>
            </div>
            <div className="bg-surface-container rounded-xl p-space-md flex flex-col gap-space-md shadow-md">
              {/* Toggle 1: Ghost Overlay Trail in Playback */}
              <div className="flex items-center justify-between gap-space-md">
                <div className="flex flex-col min-w-0 pr-space-xs">
                  <span className="font-body-md text-body-md text-on-surface font-medium">
                    Ghost Overlay Trail
                  </span>
                  <span className="font-body-sm text-body-sm text-on-surface-variant">
                    Projects cyan avatar ghost directly onto your playback video feed.
                  </span>
                </div>
                <Switch on={switches[0]} onToggle={() => flip(0)} />
              </div>
              <div className="h-px w-full bg-surface-container-highest"></div>
              {/* Toggle 2: Tactical Deficit Alerts */}
              <div className="flex items-center justify-between gap-space-md">
                <div className="flex flex-col min-w-0 pr-space-xs">
                  <span className="font-body-md text-body-md text-on-surface font-medium">
                    Tactical Deficit Alerts
                  </span>
                  <span className="font-body-sm text-body-sm text-on-surface-variant">
                    Instant audio and haptic ping when stride or swing angle lags behind twin.
                  </span>
                </div>
                <Switch on={switches[1]} onToggle={() => flip(1)} />
              </div>
              <div className="h-px w-full bg-surface-container-highest"></div>
              {/* Toggle 3: Reduced Motion Mode */}
              <div className="flex items-center justify-between gap-space-md">
                <div className="flex flex-col min-w-0 pr-space-xs">
                  <span className="font-body-md text-body-md text-on-surface font-medium">
                    Reduced Motion Skeletal
                  </span>
                  <span className="font-body-sm text-body-sm text-on-surface-variant">
                    Replaces continuous dynamic joint meshes with static keyframe markers.
                  </span>
                </div>
                <Switch on={switches[2]} onToggle={() => flip(2)} />
              </div>
            </div>
          </div>
          {/* Privacy & Telemetry Sync Protocol */}
          <div className="flex flex-col gap-space-sm mb-space-lg">
            <div className="flex items-center justify-between px-space-xs">
              <span className="font-label-caps text-label-caps uppercase text-secondary tracking-widest flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px]">
                  security
                </span>
                {" "}Vault &amp; Neural Sync
              </span>
              <span className="font-label-badge text-label-badge text-primary font-semibold">
                Zero-Knowledge
              </span>
            </div>
            <div className="bg-surface-container rounded-xl p-space-md flex flex-col gap-space-md shadow-md">
              {/* Sync Status Tile */}
              <div className="p-space-sm rounded-xl bg-surface-container-high flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-surface-container-lowest flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined text-[18px]">
                      cloud_done
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-body-md text-body-md text-on-surface font-medium">
                      Cloud Twin Sync
                    </span>
                    <span className="font-body-sm text-body-sm text-on-surface-variant">
                      Synced 2 mins ago • 14.8 MB
                    </span>
                  </div>
                </div>
                <button className={`${sync === "syncing" ? "animate-pulse " : ""}${sync === "done" ? "text-primary " : ""}px-3 py-1 rounded-full bg-surface-container-highest text-secondary hover:bg-secondary hover:text-on-secondary transition-all font-label-caps text-label-caps uppercase`} id="sync-now-btn" type="button" onClick={syncNow}>
                  {sync === "idle" ? "Sync Now" : sync === "syncing" ? "Syncing..." : "Up to date"}
                </button>
              </div>
              {/* Biometric Privacy Protocol Banner */}
              <div className="flex items-start gap-3 p-3 rounded-xl bg-surface-container-lowest">
                <span className="material-symbols-outlined text-primary text-[20px] mt-0.5">
                  verified_user
                </span>
                <div className="flex flex-col">
                  <span className="font-headline-md text-headline-md text-on-surface text-[15px] leading-tight">
                    Biometric Privacy Protocol
                  </span>
                  <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
                    Raw camera video never leaves device memory. Only anonymized 33-point kinetic joint vectors are encrypted and uploaded to calibrate your shadow twin.
                  </p>
                </div>
              </div>
              {/* Background Analysis Toggle */}
              <div className="flex items-center justify-between gap-space-md pt-1">
                <div className="flex flex-col min-w-0 pr-space-xs">
                  <span className="font-body-md text-body-md text-on-surface font-medium">
                    Background Neural Analysis
                  </span>
                  <span className="font-body-sm text-body-sm text-on-surface-variant">
                    Push notifications when off-pitch kinematic computations finish.
                  </span>
                </div>
                <Switch on={switches[3]} onToggle={() => flip(3)} />
              </div>
            </div>
          </div>
          {/* App Info & Storage / Danger Zone */}
          <div className="flex flex-col gap-space-sm">
            <div className="flex items-center justify-between px-space-xs">
              <span className="font-label-caps text-label-caps uppercase text-on-surface-variant tracking-widest flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px]">
                  memory
                </span>
                {" "}Device Cache &amp; Session
              </span>
              <span className="font-label-caps text-label-caps text-on-surface-variant">
                v4.2.1-prod
              </span>
            </div>
            <div className="bg-surface-container rounded-xl p-space-md flex flex-col gap-space-sm shadow-md">
              {/* Clear Local Cache Tile */}
              <div className="flex items-center justify-between py-1">
                <div className="flex flex-col">
                  <span className="font-body-md text-body-md text-on-surface font-medium">
                    Local Video Frame Cache
                  </span>
                  <span className="font-body-sm text-body-sm text-on-surface-variant" id="cache-size-label">
                    {cache === "cleared" ? "0 MB • Cache fully cleared" : "1.4 GB high-speed buffer stored"}
                  </span>
                </div>
                <button className="px-space-md py-1.5 rounded-full bg-surface-container-high text-on-surface hover:bg-surface-bright transition-colors font-label-caps text-label-caps uppercase tracking-wider flex items-center gap-1.5" id="clear-cache-btn" type="button" onClick={purge} disabled={cache !== "full"}>
                  {cache === "clearing" ? (
                    "Clearing..."
                  ) : cache === "cleared" ? (
                    <>
                      <span className="material-symbols-outlined text-[16px] text-primary">done</span> Clean
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-[16px]">
                        mop
                      </span>
                      {" "}Purge
                    </>
                  )}
                </button>
              </div>
              <div className="h-px w-full bg-surface-container-highest my-1"></div>
              {/* Log Out Button */}
              <button className="w-full flex items-center justify-center gap-2 py-3 rounded-full bg-error-container/20 text-error hover:bg-error-container/30 transition-all font-headline-md text-headline-md text-[15px] font-semibold active:scale-[0.98]" type="button" onClick={() => { auth.logout(); router.push("/"); }}>
                <span className="material-symbols-outlined text-[20px]">
                  logout
                </span>
                {" "}Terminate Athlete Session
              </button>
              {/* Build Info Footer */}
              <div className="text-center pt-space-xs">
                <span className="font-label-caps text-label-caps text-on-surface-variant tracking-wider uppercase text-[10px]">
                  ShadowAthlete Mobile OS • Engine Rev 8912 • Neural Build Approved
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
