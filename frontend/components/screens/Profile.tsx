"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { auth } from "@/lib/api";
import { DEMO_NAME, useAccountEmail, useAthleteProfile } from "@/lib/useAthlete";
import { useToast } from "@/lib/useToast";

const SWITCH_ON = "w-12 h-6 rounded-full bg-primary flex items-center p-0.5 transition-colors cursor-pointer";
const SWITCH_OFF = "w-12 h-6 rounded-full bg-surface-container-highest flex items-center p-0.5 transition-colors cursor-pointer";
const KNOB_ON = "w-5 h-5 rounded-full bg-on-primary-fixed shadow-md transform translate-x-6 transition-transform";
const KNOB_OFF = "w-5 h-5 rounded-full bg-on-surface-variant shadow-md transform translate-x-0 transition-transform";

import BottomNav from "@/components/BottomNav";


// Generated from design/stitch/mobile_athlete_profile_settings/code.html by scripts/stitch-to-jsx.mjs.
export default function Profile() {
  const router = useRouter();
  const profile = useAthleteProfile();
  const email = useAccountEmail();
  const name = profile?.name || DEMO_NAME;
  const [ghostTrail, setGhostTrail] = useState(true);
  const [alerts, setAlerts] = useState(true);
  const [toast, toastVisible, showToast] = useToast("Settings updated successfully", 2600);

  function share() {
    navigator.clipboard?.writeText(window.location.origin + "/avatar").catch(() => {});
    showToast("Shadow Twin Telemetry link copied to clipboard!");
  }

  function logout() {
    auth.logout();
    showToast("Secure biometric session terminated.");
    setTimeout(() => router.push("/"), 700);
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
            <button aria-label="Alex Carter athlete profile" onClick={() => router.push("/settings")} className="relative p-0.5 rounded-full min-w-[44px] min-h-[44px] flex items-center justify-center">
              <img alt="Athlete Avatar" className="w-8 h-8 rounded-full object-cover shadow-[0_0_8px_rgba(0,238,252,0.3)]" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAYlzWa0WhdHMrlXCOeOKrE_gA6mkG7xt-gxYspgU6fUaJkV_Akz3Qz6MylgYcPyVE5OFBPRU96jXhHmhrUEMgtTe5nfrrt5Ip72wHjEBYrLJcFt3L5dJ4GHGcCD6NC26qS_GST3vE73Y1k2PcA1WX9In53HhyZuOM2ZyVBvkQRU2MYC4KbQ7J3e7gzFYeCTbh28FW7TZt25JcL5lEMN9kpQGB5Rl-Bpp84AiV9NN1X0XPv8ZVW6f2y" />
            </button>
          </div>
        </div>
      </header>
      <main className="flex flex-col relative w-full pt-16 pb-20 bg-surface flex-1">
        <div className="flex flex-col w-full px-margin-mobile pb-space-xl gap-space-md">
          {/* Profile Header HUD */}
          <section className="relative w-full rounded-xl bg-surface-container-high p-space-md shadow-xl overflow-hidden">
            <div className="absolute -top-12 -right-12 w-40 h-40 rounded-full bg-secondary/10 blur-3xl pointer-events-none"></div>
            {" "}
            <div className="absolute -bottom-10 -left-10 w-36 h-36 rounded-full bg-primary/10 blur-2xl pointer-events-none"></div>
            {" "}
            <div className="relative z-10 flex flex-col gap-space-md">
              {/* Top Row: Avatar & Core ID */}
              <div className="flex items-center gap-space-md">
                <div className="relative flex-shrink-0">
                  <div className="w-20 h-20 rounded-full overflow-hidden shadow-[0_0_16px_rgba(75,226,119,0.3)] bg-surface-container-highest">
                    <img alt="Alex Carter Studio Athletic Portrait" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida/AEtjO1VMnOn0JU8o67qYlYqYCfMg1WkAfuvSKYr7KKY53q6BP96YUKVar9XDhOk_G0q9oEEjtyqPTnjPz-jEJrc0WYt38c3cNqYZcfCBRJw4q5MRzBkPerclP4uhy8_16kr0ms5etlkMLS_PsBNC0_ErIoeYXxd2zuxLTVC_llRYg3rM1224q-gsYbE7WRhzle6ndzpYuYW6zR9J2qVASfJ92oWz4LbzfGQXXuIcMd1SHheY-ciDcBNW3LLRji8" />
                  </div>
                  {" "}
                  <span className="absolute -bottom-1 -right-1 bg-surface-container-lowest text-primary px-space-xs py-0.5 rounded-full font-label-caps text-label-caps uppercase shadow-md flex items-center gap-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
                    {" "}LVL 27
                  </span>
                  {" "}
                  <button aria-label="Edit Profile Avatar" className="absolute -top-1 -right-1 w-7 h-7 rounded-full bg-surface-container-highest text-secondary flex items-center justify-center shadow hover:bg-surface-bright transition-colors" id="editAvatarBtn" onClick={() => router.push("/capture")}>
                    <span className="material-symbols-outlined text-[15px]">
                      photo_camera
                    </span>
                  </button>
                </div>
                <div className="flex flex-col min-w-0 flex-1">
                  <div className="flex items-center gap-space-xs flex-wrap">
                    <h1 className="font-headline-md text-headline-md font-bold text-on-surface truncate">
                      {name}
                    </h1>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-secondary/15 text-secondary font-label-caps text-label-caps uppercase">
                      <span className="material-symbols-outlined text-[12px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                        verified
                      </span>
                      {" "}Semi-Pro
                    </span>
                  </div>
                  <span className="font-body-sm text-body-sm text-on-surface-variant truncate">
                    {email ?? "alex.carter@kinetics.io"}
                  </span>
                  <span className="font-label-caps text-label-caps text-secondary uppercase tracking-widest mt-1">
                    Twin Node ID: #SHDW-7492-AC
                  </span>
                </div>
              </div>
              {/* Telemetry Score Bento Strip */}
              <div className="grid grid-cols-2 gap-space-sm bg-surface-container-lowest/80 rounded-lg p-space-sm">
                <div className="flex flex-col justify-center">
                  <span className="font-label-caps text-label-caps uppercase text-on-surface-variant tracking-wider">
                    Athlete Kinetic Score
                  </span>
                  <div className="flex items-baseline gap-space-xs mt-0.5">
                    <span className="font-metric-large text-metric-large font-bold text-primary tracking-tight">
                      782
                    </span>
                    <span className="font-label-caps text-label-caps text-primary flex items-center font-bold">
                      <span className="material-symbols-outlined text-[14px]">
                        trending_up
                      </span>
                      +14 pts
                    </span>
                  </div>
                </div>
                <div className="flex flex-col justify-center items-end text-right">
                  <span className="font-label-caps text-label-caps uppercase text-secondary tracking-wider">
                    Cohort Benchmark
                  </span>
                  <div className="flex items-center gap-1 mt-1">
                    <span className="px-2 py-0.5 rounded-full bg-secondary-container text-on-secondary-container font-label-caps text-label-caps uppercase font-bold">
                      Top 4%
                    </span>
                  </div>
                  <span className="font-body-sm text-body-sm text-on-surface-variant text-[11px] mt-0.5">
                    Global Semi-Pro Division
                  </span>
                </div>
              </div>
              {/* Quick Action Buttons */}
              <div className="flex items-center gap-space-sm">
                <button className="flex-1 min-h-[48px] px-space-md py-2.5 rounded-lg bg-primary text-on-primary font-headline-md text-[14px] font-bold uppercase tracking-wider flex items-center justify-center gap-space-xs shadow-[0_0_20px_rgba(75,226,119,0.3)] active:scale-[0.98] transition-transform" id="editProfileBtn" onClick={() => router.push("/settings")}>
                  <span className="material-symbols-outlined text-[18px]">
                    edit
                  </span>
                  {" "}Edit Profile
                </button>
                <button className="flex-1 min-h-[48px] px-space-md py-2.5 rounded-lg bg-surface-container-highest text-secondary font-headline-md text-[14px] font-bold uppercase tracking-wider flex items-center justify-center gap-space-xs hover:bg-surface-bright active:scale-[0.98] transition-transform shadow" id="shareTwinBtn" onClick={share}>
                  <span className="material-symbols-outlined text-[18px]">
                    share_location
                  </span>
                  {" "}Share Twin
                </button>
              </div>
            </div>
          </section>
          {/* Biometrics & Body Spec Card */}
          <section className="flex flex-col w-full rounded-xl bg-surface-container p-space-md shadow-lg gap-space-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-space-xs">
                <span className="w-1.5 h-3.5 rounded-full bg-primary"></span>
                <h2 className="font-label-caps text-label-caps uppercase tracking-wider text-on-surface">
                  Kinetic Biometrics
                </h2>
              </div>
              <span className="font-label-caps text-label-caps uppercase text-secondary">
                Verified Sensor Hub
              </span>
            </div>
            <div className="grid grid-cols-4 gap-space-xs mt-1">
              <div className="flex flex-col items-center justify-center p-space-xs rounded-lg bg-surface-container-high text-center">
                <span className="font-label-caps text-label-caps uppercase text-on-surface-variant">
                  Age
                </span>
                <span className="font-headline-md text-[18px] font-bold text-on-surface mt-0.5">
                  {profile?.age ?? 24}
                </span>
                <span className="font-body-sm text-[10px] text-on-surface-variant">
                  years
                </span>
              </div>
              <div className="flex flex-col items-center justify-center p-space-xs rounded-lg bg-surface-container-high text-center">
                <span className="font-label-caps text-label-caps uppercase text-on-surface-variant">
                  Height
                </span>
                <span className="font-headline-md text-[18px] font-bold text-on-surface mt-0.5">
                  {profile?.height_cm ?? 185}
                </span>
                <span className="font-body-sm text-[10px] text-on-surface-variant">
                  cm
                </span>
              </div>
              <div className="flex flex-col items-center justify-center p-space-xs rounded-lg bg-surface-container-high text-center">
                <span className="font-label-caps text-label-caps uppercase text-on-surface-variant">
                  Weight
                </span>
                <span className="font-headline-md text-[18px] font-bold text-on-surface mt-0.5">
                  {profile?.weight_kg ?? 78}
                </span>
                <span className="font-body-sm text-[10px] text-on-surface-variant">
                  kg
                </span>
              </div>
              <div className="flex flex-col items-center justify-center p-space-xs rounded-lg bg-surface-container-high text-center">
                <span className="font-label-caps text-label-caps uppercase text-on-surface-variant">
                  Dominant
                </span>
                <span className="font-headline-md text-[18px] font-bold text-primary mt-0.5">
                  Right
                </span>
                <span className="font-body-sm text-[10px] text-on-surface-variant">
                  Hand/Foot
                </span>
              </div>
            </div>
          </section>
          {/* Personal Bests / Telemetry PRs */}
          <section className="flex flex-col w-full rounded-xl bg-surface-container p-space-md shadow-lg gap-space-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-space-xs">
                <span className="w-1.5 h-3.5 rounded-full bg-secondary"></span>
                <h2 className="font-label-caps text-label-caps uppercase tracking-wider text-on-surface">
                  Personal Bests &amp; Records
                </h2>
              </div>
              <span className="font-label-caps text-label-caps text-on-surface-variant uppercase">
                Optical Tracking
              </span>
            </div>
            <div className="grid grid-cols-3 gap-space-sm mt-1">
              {/* PR 1 */}
              <div className="flex flex-col p-space-sm rounded-lg bg-surface-container-high relative overflow-hidden">
                <div className="absolute top-0 right-0 p-1">
                  <span className="material-symbols-outlined text-primary text-[14px]">
                    bolt
                  </span>
                </div>
                <span className="font-label-caps text-label-caps uppercase text-on-surface-variant truncate">
                  Tennis Serve
                </span>
                <span className="font-headline-md text-[20px] font-bold text-on-surface mt-1">
                  124.6
                </span>
                <span className="font-label-caps text-label-caps text-primary uppercase">
                  mph • PR
                </span>
              </div>
              {/* PR 2 */}
              <div className="flex flex-col p-space-sm rounded-lg bg-surface-container-high relative overflow-hidden">
                <div className="absolute top-0 right-0 p-1">
                  <span className="material-symbols-outlined text-secondary text-[14px]">
                    speed
                  </span>
                </div>
                <span className="font-label-caps text-label-caps uppercase text-on-surface-variant truncate">
                  40yd Sprint
                </span>
                <span className="font-headline-md text-[20px] font-bold text-on-surface mt-1">
                  4.38
                </span>
                <span className="font-label-caps text-label-caps text-secondary uppercase">
                  sec • Laser
                </span>
              </div>
              {/* PR 3 */}
              <div className="flex flex-col p-space-sm rounded-lg bg-surface-container-high relative overflow-hidden">
                <div className="absolute top-0 right-0 p-1">
                  <span className="material-symbols-outlined text-primary text-[14px]">
                    sports_cricket
                  </span>
                </div>
                <span className="font-label-caps text-label-caps uppercase text-on-surface-variant truncate">
                  Bowling Run
                </span>
                <span className="font-headline-md text-[20px] font-bold text-on-surface mt-1">
                  88.2
                </span>
                <span className="font-label-caps text-label-caps text-primary uppercase">
                  mph • Release
                </span>
              </div>
            </div>
          </section>
          {/* Active Disciplines & Targets */}
          <section className="flex flex-col w-full rounded-xl bg-surface-container p-space-md shadow-lg gap-space-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-space-xs">
                <span className="w-1.5 h-3.5 rounded-full bg-primary"></span>
                <h2 className="font-label-caps text-label-caps uppercase tracking-wider text-on-surface">
                  Active Sports &amp; Disciplines
                </h2>
              </div>
              <span className="font-label-caps text-label-caps uppercase text-primary">
                3 Active Links
              </span>
            </div>
            {/* Sport 1 (Primary) */}
            <div className="flex flex-col p-space-sm rounded-lg bg-surface-container-high gap-space-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-space-xs">
                  <span className="material-symbols-outlined text-primary text-[20px]">
                    sports_tennis
                  </span>
                  <span className="font-headline-md text-[16px] font-semibold text-on-surface">
                    Tennis
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-primary/15 text-primary font-label-caps text-label-caps uppercase">
                    Primary
                  </span>
                </div>
                <span className="font-label-caps text-label-caps uppercase text-on-surface-variant">
                  142 Telemetry Runs
                </span>
              </div>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                Focus: Deep baseline topspin forehand stability &amp; kinetic chain whip.
              </p>
              {/* Attribute Bar */}
              <div className="w-full bg-surface-container-lowest h-2 rounded-full overflow-hidden mt-1 relative">
                <div className="bg-secondary/40 h-full w-[88%] rounded-full absolute left-0 top-0"></div>
                {" "}
                <div className="bg-primary h-full w-[94%] rounded-full absolute left-0 top-0 shadow-[0_0_8px_rgba(75,226,119,0.7)]"></div>
              </div>
              <div className="flex justify-between items-center text-[10px] font-label-caps text-on-surface-variant uppercase">
                <span>
                  Shadow Target: 88%
                </span>
                <span className="text-primary font-bold">
                  Current Form: 94% (+6%)
                </span>
              </div>
            </div>
            {/* Sport 2 (Secondary) */}
            <div className="flex flex-col p-space-sm rounded-lg bg-surface-container-high gap-space-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-space-xs">
                  <span className="material-symbols-outlined text-secondary text-[20px]">
                    sports_cricket
                  </span>
                  <span className="font-headline-md text-[16px] font-semibold text-on-surface">
                    Cricket
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-surface-container-highest text-on-surface-variant font-label-caps text-label-caps uppercase">
                    Secondary
                  </span>
                </div>
                <span className="font-label-caps text-label-caps uppercase text-on-surface-variant">
                  68 Sessions
                </span>
              </div>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                Focus: Fast bowling run-up momentum conservation &amp; front-foot brace angle.
              </p>
            </div>
            {/* Sport 3 & 4 Mini Links */}
            <div className="grid grid-cols-2 gap-space-xs">
              <div className="flex items-center gap-space-xs p-2.5 rounded-lg bg-surface-container-high">
                <span className="material-symbols-outlined text-tertiary text-[18px]">
                  sports_basketball
                </span>
                <div className="flex flex-col min-w-0">
                  <span className="font-body-sm text-body-sm font-semibold text-on-surface truncate">
                    Basketball
                  </span>
                  <span className="font-label-caps text-[10px] text-on-surface-variant">
                    Jump Load Sync
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-space-xs p-2.5 rounded-lg bg-surface-container-high">
                <span className="material-symbols-outlined text-secondary text-[18px]">
                  directions_run
                </span>
                <div className="flex flex-col min-w-0">
                  <span className="font-body-sm text-body-sm font-semibold text-on-surface truncate">
                    Running
                  </span>
                  <span className="font-label-caps text-[10px] text-on-surface-variant">
                    Cadence Radar
                  </span>
                </div>
              </div>
            </div>
            {/* Weekly Commitment Goal */}
            <div className="flex items-center justify-between p-space-sm rounded-lg bg-surface-container-lowest mt-1">
              <div className="flex items-center gap-space-sm">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined text-[20px]">
                    event_repeat
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="font-body-sm text-body-sm font-semibold text-on-surface">
                    Weekly Training Goal
                  </span>
                  <span className="font-body-sm text-[12px] text-on-surface-variant">
                    Target: 5 high-speed telemetry sessions
                  </span>
                </div>
              </div>
              <div className="flex flex-col items-end">
                <span className="font-headline-md text-[18px] font-bold text-primary">
                  4 / 5
                </span>
                <span className="font-label-caps text-label-caps uppercase text-secondary">
                  80% Done
                </span>
              </div>
            </div>
          </section>
          {/* Preferences & App Settings Module */}
          <section className="flex flex-col w-full rounded-xl bg-surface-container p-space-md shadow-lg gap-space-sm">
            <div className="flex items-center gap-space-xs">
              <span className="w-1.5 h-3.5 rounded-full bg-secondary"></span>
              <h2 className="font-label-caps text-label-caps uppercase tracking-wider text-on-surface">
                System Preferences &amp; Settings
              </h2>
            </div>
            <div className="flex flex-col gap-1 mt-1">
              {/* Setting Item 1: Camera */}
              <div onClick={() => router.push("/settings")} className="flex items-center justify-between p-space-sm rounded-lg bg-surface-container-high min-h-[48px] hover:bg-surface-bright transition-colors cursor-pointer">
                <div className="flex items-center gap-space-sm min-w-0">
                  <span className="material-symbols-outlined text-secondary text-[22px]">
                    videocam
                  </span>
                  <div className="flex flex-col min-w-0">
                    <span className="font-body-md text-body-md text-on-surface font-medium truncate">
                      Telemetry Video Quality
                    </span>
                    <span className="font-body-sm text-[12px] text-on-surface-variant truncate">
                      High speed capture &amp; frame interpolation
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-space-xs flex-shrink-0">
                  <span className="px-2 py-0.5 rounded bg-surface-container text-primary font-label-caps text-label-caps uppercase font-bold">
                    4K 60FPS
                  </span>
                  <span className="material-symbols-outlined text-on-surface-variant text-[18px]">
                    chevron_right
                  </span>
                </div>
              </div>
              {/* Setting Item 2: Ghost Overlay */}
              <div className="flex items-center justify-between p-space-sm rounded-lg bg-surface-container-high min-h-[48px]">
                <div className="flex items-center gap-space-sm min-w-0">
                  <span className="material-symbols-outlined text-primary text-[22px]">
                    blur_on
                  </span>
                  <div className="flex flex-col min-w-0">
                    <span className="font-body-md text-body-md text-on-surface font-medium truncate">
                      Ghost Overlay Trail
                    </span>
                    <span className="font-body-sm text-[12px] text-on-surface-variant truncate">
                      Render digital twin kinetic shadow
                    </span>
                  </div>
                </div>
                <button aria-label="Toggle Ghost Overlay Trail" aria-pressed={ghostTrail} className={ghostTrail ? SWITCH_ON : SWITCH_OFF} id="toggleGhostTrail" onClick={() => { setGhostTrail(!ghostTrail); showToast(`Ghost Overlay Trail ${ghostTrail ? "Disabled" : "Enabled"}`); }}>
                  <div className={ghostTrail ? KNOB_ON : KNOB_OFF}></div>
                </button>
              </div>
              {/* Setting Item 3: Push Alerts */}
              <div className="flex items-center justify-between p-space-sm rounded-lg bg-surface-container-high min-h-[48px]">
                <div className="flex items-center gap-space-sm min-w-0">
                  <span className="material-symbols-outlined text-tertiary text-[22px]">
                    notifications_active
                  </span>
                  <div className="flex flex-col min-w-0">
                    <span className="font-body-md text-body-md text-on-surface font-medium truncate">
                      Analysis &amp; Deficit Alerts
                    </span>
                    <span className="font-body-sm text-[12px] text-on-surface-variant truncate">
                      Instant notification when twin parses run
                    </span>
                  </div>
                </div>
                <button aria-label="Toggle Analysis Alerts" aria-pressed={alerts} className={alerts ? SWITCH_ON : SWITCH_OFF} id="toggleAlerts" onClick={() => { setAlerts(!alerts); showToast(`Push Telemetry Alerts ${alerts ? "Disabled" : "Enabled"}`); }}>
                  <div className={alerts ? KNOB_ON : KNOB_OFF}></div>
                </button>
              </div>
              {/* Setting Item 4: Biometrics & Privacy */}
              <div onClick={() => router.push("/settings")} className="flex items-center justify-between p-space-sm rounded-lg bg-surface-container-high min-h-[48px] hover:bg-surface-bright transition-colors cursor-pointer">
                <div className="flex items-center gap-space-sm min-w-0">
                  <span className="material-symbols-outlined text-secondary text-[22px]">
                    shield
                  </span>
                  <div className="flex flex-col min-w-0">
                    <span className="font-body-md text-body-md text-on-surface font-medium truncate">
                      Biometric Privacy &amp; Cloud Sync
                    </span>
                    <span className="font-body-sm text-[12px] text-on-surface-variant truncate">
                      End-to-end encrypted limb kinematic vectors
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-space-xs flex-shrink-0">
                  <span className="px-2 py-0.5 rounded bg-surface-container text-secondary font-label-caps text-label-caps uppercase font-bold">
                    Sync On
                  </span>
                  <span className="material-symbols-outlined text-on-surface-variant text-[18px]">
                    chevron_right
                  </span>
                </div>
              </div>
              {/* Setting Item 5: Help & Support */}
              <div onClick={() => showToast("Support: help@shadowathlete.app")} className="flex items-center justify-between p-space-sm rounded-lg bg-surface-container-high min-h-[48px] hover:bg-surface-bright transition-colors cursor-pointer">
                <div className="flex items-center gap-space-sm min-w-0">
                  <span className="material-symbols-outlined text-on-surface-variant text-[22px]">
                    support_agent
                  </span>
                  <div className="flex flex-col min-w-0">
                    <span className="font-body-md text-body-md text-on-surface font-medium truncate">
                      Help, Support &amp; Feedback
                    </span>
                    <span className="font-body-sm text-[12px] text-on-surface-variant truncate">
                      Kinetic calibration guides &amp; bug logs
                    </span>
                  </div>
                </div>
                <span className="material-symbols-outlined text-on-surface-variant text-[18px]">
                  chevron_right
                </span>
              </div>
            </div>
            {/* Log Out Button */}
            <div className="mt-space-sm pt-space-xs flex flex-col">
              <button className="w-full min-h-[48px] rounded-lg bg-error-container/40 text-error hover:bg-error-container/60 active:scale-[0.99] font-headline-md text-[14px] font-bold uppercase tracking-wider flex items-center justify-center gap-space-xs transition-all" id="logoutBtn" onClick={logout}>
                <span className="material-symbols-outlined text-[18px]">
                  logout
                </span>
                {" "}Log Out {name}
              </button>
              <span className="font-label-caps text-label-caps text-center text-on-surface-variant uppercase mt-space-sm opacity-60">
                ShadowAthlete AI Core v4.2.1 • Build 8820
              </span>
            </div>
          </section>
          {/* Interactive Feedback Toast */}
          <div className={`fixed bottom-20 left-1/2 -translate-x-1/2 px-4 py-2.5 rounded-full bg-surface-bright text-on-surface shadow-2xl flex items-center gap-2 font-body-sm text-body-sm pointer-events-none ${toastVisible ? "opacity-100" : "opacity-0"} transition-opacity duration-300 z-50`} id="toastMessage">
            <span className="material-symbols-outlined text-primary text-[18px]">
              check_circle
            </span>
            <span id="toastText">
              {toast}
            </span>
          </div>
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
