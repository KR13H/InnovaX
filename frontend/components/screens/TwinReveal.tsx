"use client";

import { useRouter } from "next/navigation";

// Generated from design/stitch/digital_twin_reveal_shadowathlete/code.html by scripts/stitch-to-jsx.mjs.
export default function TwinReveal() {
  const router = useRouter();
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
                Twin Reveal
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-space-xs">
            <img alt="Profile" className="w-8 h-8 rounded-full object-cover p-0.5 bg-surface-container-high" src="https://lh3.googleusercontent.com/aida/AEtjO1VMnOn0JU8o67qYlYqYCfMg1WkAfuvSKYr7KKY53q6BP96YUKVar9XDhOk_G0q9oEEjtyqPTnjPz-jEJrc0WYt38c3cNqYZcfCBRJw4q5MRzBkPerclP4uhy8_16kr0ms5etlkMLS_PsBNC0_ErIoeYXxd2zuxLTVC_llRYg3rM1224q-gsYbE7WRhzle6ndzpYuYW6zR9J2qVASfJ92oWz4LbzfGQXXuIcMd1SHheY-ciDcBNW3LLRji8" />
            <button aria-label="Close view" className="min-w-[44px] min-h-[44px] flex items-center justify-center text-on-surface-variant hover:text-on-surface transition-colors rounded-full active:bg-surface-container-high" onClick={() => router.push("/home")} type="button">
              <span className="material-symbols-outlined text-[20px]">
                close
              </span>
            </button>
          </div>
        </div>
      </header>
      <main className="flex flex-col relative w-full pt-16 bg-surface min-h-screen">
        <div className="flex flex-col w-full px-gutter-mobile pb-10 space-y-space-lg">
          {/* Status Chip & Header Stream */}
          <div className="flex flex-col items-center text-center space-y-space-xs pt-space-sm">
            <div className="inline-flex items-center gap-space-xs px-3 py-1 rounded-full bg-surface-container-high text-secondary">
              <span className="w-2 h-2 rounded-full bg-secondary-container shadow-[0_0_10px_#00eefc] animate-pulse"></span>
              <span className="font-label-caps text-label-caps uppercase tracking-wider text-secondary">
                Digital Twin Ready
              </span>
            </div>
            <h2 className="font-headline-xl-mobile text-headline-xl-mobile text-on-surface tracking-tight">
              Meet your{" "}
              <span className="text-secondary drop-shadow-[0_0_12px_rgba(0,238,252,0.35)]">
                Shadow
              </span>
              .
            </h2>
            <p className="font-body-sm text-body-sm text-on-surface-variant max-w-xs leading-relaxed">
              Your persistent digital athlete is born. It starts with an uncalibrated baseline and develops organically through every analyzed session.
            </p>
          </div>
          {/* Centerpiece Visual: Holographic Skeletal Mesh Twin View */}
          <div className="relative w-full rounded-xl overflow-hidden bg-surface-container-lowest shadow-2xl">
            {/* Visual Stage */}
            {" "}
            <div className="relative w-full aspect-[4/3] overflow-hidden">
              <img alt="Digital Twin kinetic skeletal mesh telemetry visualization" className="w-full h-full object-cover object-center filter contrast-125 saturate-110" src="https://lh3.googleusercontent.com/aida/AEtjO1XZFPB7qXAINXh7iUONHmwTzU597Ct6KjoCvu5zaVQBoT_EzmUeU7lNJe_qSiwdz2XnbTDEgwbELm_yYntJdCdInDbLFmSv3llsBXuujsGQqtTICoI3gVWLeElUIBhxmN_pOn0Ugl915WdXL0XqCyRZa5g2CLJVJmXpHbfbzbFoKlu3Gc0EugzPK89uqhqqiiwV7fD6h_F-IJaBwN0OtBBA19tXd5yLOuuOHoDpq1PAhHAUsyHUnpuk5S0" />
              {" "}
              {/* HUD Holographic Vignette / Laser Scrim Overlays */}
              {" "}
              <div className="absolute inset-0 bg-gradient-to-t from-surface-container-lowest via-surface-container-lowest/30 to-transparent"></div>
              {" "}
              <div className="absolute inset-0 bg-gradient-to-r from-surface-container-lowest/60 via-transparent to-surface-container-lowest/60"></div>
              {" "}
              {/* Telemetry Corner Reticles */}
              {" "}
              <div className="absolute top-3 left-3 flex items-center space-x-1">
                <span className="w-1.5 h-1.5 bg-secondary-container rounded-full animate-ping"></span>
                <span className="font-label-caps text-label-caps text-secondary-container">
                  OPTICAL FEED // 60 FPS
                </span>
              </div>
              {" "}
              <div className="absolute top-3 right-3 font-label-caps text-label-caps text-outline">
                LATENCY &lt; 8MS
              </div>
              {" "}
              {/* Real-time Calibration Target Overlay */}
              {" "}
              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                <div className="flex items-center gap-space-xs bg-surface-container-highest/80 backdrop-blur-md px-2.5 py-1 rounded-full">
                  <span className="material-symbols-outlined text-primary text-[14px]">
                    sensors
                  </span>
                  <span className="font-label-caps text-label-caps text-primary tracking-wider uppercase">
                    Spatial Sync 99.4%
                  </span>
                </div>
                <div className="flex items-center gap-1 bg-surface-container-highest/80 backdrop-blur-md px-2.5 py-1 rounded-full text-secondary">
                  <span className="material-symbols-outlined text-[14px]">
                    token
                  </span>
                  <span className="font-label-caps text-label-caps">
                    GEN-001 SEED
                  </span>
                </div>
              </div>
            </div>
            {" "}
            {/* Digital Twin ID Chip Strip */}
            {" "}
            <div className="flex items-center justify-between px-space-md py-space-sm bg-surface-container-low">
              <div className="flex items-center space-x-2">
                <span className="material-symbols-outlined text-secondary text-[18px]">
                  fingerprint
                </span>
                <span className="font-label-caps text-label-caps text-on-surface tracking-wider">
                  TWIN #SHDW-7492
                </span>
              </div>
              <span className="font-label-caps text-label-caps text-tertiary-fixed-dim bg-on-tertiary/60 px-2 py-0.5 rounded-full">
                UNCALIBRATED BASELINE
              </span>
            </div>
          </div>
          {/* Attribute Preview Cards (Telemetry Grid) */}
          <div className="space-y-space-sm">
            {/* Kinetic Score Preview Card */}
            {" "}
            <div className="p-space-md rounded-xl bg-surface-container-low shadow-sm flex flex-col space-y-space-xs relative overflow-hidden">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-space-xs">
                  <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined text-[16px]">
                      speed
                    </span>
                  </div>
                  <span className="font-label-caps text-label-caps uppercase text-on-surface-variant">
                    Kinetic Score
                  </span>
                </div>
                <span className="font-label-caps text-label-caps text-primary px-2 py-0.5 rounded bg-primary/10">
                  PENDING DATA
                </span>
              </div>
              <div className="pt-space-xs flex items-baseline justify-between">
                <span className="font-headline-md text-headline-md text-on-surface font-display-hero">
                  Baseline Initializing...
                </span>
              </div>
              {/* Dual Indicator Split-Rail */}
              <div className="relative w-full h-1.5 rounded-full bg-surface-container-highest overflow-hidden mt-1">
                <div className="absolute inset-0 bg-gradient-to-r from-secondary-container/40 via-primary-container/40 to-secondary-container/40 animate-pulse"></div>
              </div>
              <p className="font-body-sm text-body-sm text-outline flex items-center gap-1 pt-0.5">
                <span className="material-symbols-outlined text-[14px] text-tertiary">
                  info
                </span>
                {" "}Calibrates automatically on your 1st recorded session
              </p>
            </div>
            {" "}
            {/* Senses & Sports Parallel Grid */}
            {" "}
            <div className="grid grid-cols-2 gap-space-sm">
              {/* Senses Nodes */}
              <div className="p-space-md rounded-xl bg-surface-container-low flex flex-col justify-between">
                <div className="flex items-center gap-space-xs">
                  <div className="w-6 h-6 rounded-full bg-secondary/10 flex items-center justify-center text-secondary">
                    <span className="material-symbols-outlined text-[14px]">
                      hub
                    </span>
                  </div>
                  <span className="font-label-caps text-label-caps text-on-surface-variant">
                    Biometric Senses
                  </span>
                </div>
                <div className="mt-space-md">
                  <div className="font-headline-md text-headline-md text-secondary">
                    33 Nodes
                  </div>
                  {" "}
                  <div className="font-body-sm text-body-sm text-on-surface-variant">
                    Active Tracking Mesh
                  </div>
                </div>
              </div>
              {/* Connected Sports Module */}
              <div className="p-space-md rounded-xl bg-surface-container-low flex flex-col justify-between">
                <div className="flex items-center gap-space-xs">
                  <div className="w-6 h-6 rounded-full bg-tertiary/10 flex items-center justify-center text-tertiary">
                    <span className="material-symbols-outlined text-[14px]">
                      sports_tennis
                    </span>
                  </div>
                  <span className="font-label-caps text-label-caps text-on-surface-variant">
                    Model Ready
                  </span>
                </div>
                <div className="mt-space-md">
                  <div className="font-headline-md text-headline-md text-on-surface">
                    Tennis
                  </div>
                  {" "}
                  <div className="font-body-sm text-body-sm text-outline truncate">
                    + Cricket, Ball, Run
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* Transparent Info & Trust Callout Banner */}
          <div className="p-space-md rounded-xl bg-surface-container-high/60 backdrop-blur-md flex items-start gap-space-sm">
            <span className="material-symbols-outlined text-secondary text-[22px] flex-shrink-0 mt-0.5" style={{ fontVariationSettings: "'FILL' 1" }}>
              verified_user
            </span>
            <div className="flex flex-col space-y-0.5">
              <span className="font-label-caps text-label-caps text-secondary uppercase tracking-wider">
                Uncompromised Fidelity
              </span>
              <p className="font-body-sm text-body-sm text-on-surface-variant leading-snug">
                Your Shadow learns your genuine motion. No invented scores or fabricated benchmarks — record or upload your first video to start calibration.
              </p>
            </div>
          </div>
          {/* Kinetic Action Group */}
          <div className="flex flex-col space-y-space-sm pt-space-xs">
            {/* Primary CTA: Analyze Session */}
            <button className="w-full h-14 rounded-full bg-primary-container text-on-primary-container font-headline-md text-headline-md font-bold flex items-center justify-center gap-space-sm shadow-[0_0_24px_rgba(34,197,94,0.3)] active:scale-[0.98] transition-all hover:bg-primary-fixed" id="analyzeBtn" type="button" onClick={() => router.push("/capture")}>
              <span className="material-symbols-outlined text-[24px]">
                videocam
              </span>
              <span>
                Analyze your first session
              </span>
            </button>
            {/* Secondary CTA: Explore Dashboard */}
            <button className="w-full h-12 rounded-full bg-surface-container-high text-on-surface font-headline-md text-[16px] flex items-center justify-center gap-space-xs active:bg-surface-container-highest transition-colors" onClick={() => router.push("/home")} type="button">
              <span className="material-symbols-outlined text-[20px] text-on-surface-variant">
                space_dashboard
              </span>
              <span>
                Explore Home Dashboard
              </span>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
