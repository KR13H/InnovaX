"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef } from "react";
import { stageClip } from "@/lib/clip";

import BottomNav from "@/components/BottomNav";


// Generated from design/stitch/tennis_details_analysis/code.html by scripts/stitch-to-jsx.mjs.
export default function TennisDetails() {
  const router = useRouter();
  const cameraInput = useRef<HTMLInputElement>(null);
  const uploadInput = useRef<HTMLInputElement>(null);

  // Hand the picked clip to the review screen, which uploads it for tennis analysis.
  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    stageClip(file, "tennis");
    router.push("/capture/review?sport=tennis");
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
                Sports
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
        <div className="flex flex-col w-full px-margin-mobile pb-space-xl gap-space-md">
          {/* Top Sport Badge & Context Header */}
          <div className="flex flex-col gap-space-xs mt-space-sm">
            <div className="flex items-center justify-between">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-container-high text-primary font-label-caps text-label-caps">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
                {" "}PRIMARY DISCIPLINE • LEVEL 27
              </div>
              <span className="font-label-badge text-label-badge text-on-surface-variant bg-surface-container px-2 py-0.5 rounded">
                Demo Data
              </span>
            </div>
            <h1 className="font-headline-xl-mobile text-headline-xl-mobile font-semibold text-on-surface tracking-tight">
              Tennis Biomechanics
            </h1>
            <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
              Forehand unit turn, backhand crosscourt &amp; serve pronation telemetry.
            </p>
          </div>
          {/* Primary Kinetic Call-to-Actions */}
          <div className="grid grid-cols-2 gap-gutter-mobile">
            <button className="flex items-center justify-center gap-2 py-3.5 px-3 bg-primary text-on-primary rounded-xl font-headline-md text-body-md font-bold shadow-[0_0_20px_rgba(75,226,119,0.25)] active:scale-[0.98] transition-all" id="btn-record" type="button" onClick={() => cameraInput.current?.click()}>
              <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                videocam
              </span>
              <span>
                Record video
              </span>
            </button>
            <button className="flex items-center justify-center gap-2 py-3.5 px-3 bg-surface-container-high text-on-surface rounded-xl font-headline-md text-body-md font-semibold active:scale-[0.98] transition-all hover:bg-surface-bright" id="btn-upload" type="button" onClick={() => uploadInput.current?.click()}>
              <span className="material-symbols-outlined text-[20px] text-secondary">
                upload_file
              </span>
              <span>
                Upload video
              </span>
            </button>
          </div>
          {/* Hero Analysis Visualizer Card */}
          <div className="relative w-full rounded-xl overflow-hidden bg-surface-container-lowest shadow-xl flex flex-col">
            <div className="relative w-full h-56 bg-surface-container">
              <div className="w-full h-full bg-cover bg-center" data-alt="Professional tennis female player executing a dynamic forehand stroke on a twilight hard court, illuminated with luminous cyan skeletal tracking vector lines and neon lime racket velocity directional arrows matching high-performance AI telemetry." style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuByYZu2J6WtkWRBblx51JyQkSzbdbaYgmwaK2oG-uDKV9MmVHGAPi6nB_U6dLS_QkS1HBh-ZAOOfGoae9NEd7ot0RYUolP9U34DXB4NGWKiDGv0mljBZ0IpGzjySqjxO9toWwkLDaroCbZ3ktlx8sHUKe_hwjn0yfvxTs8JAIpe7MSEgGavLzZyQ_l3DjoAzmuHHbrMsOIRQj1p02SL6l_EcIdKP1DgYxGi-UpuK5FqCBnv875CNJXn')" }}></div>
              {" "}
              {/* HUD Overlay Elements */}
              {" "}
              <div className="absolute inset-0 bg-gradient-to-t from-surface-container-lowest via-surface-container-lowest/30 to-transparent"></div>
              {" "}
              {/* Real-time skeletal node overlay simulation tags */}
              {" "}
              <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded bg-surface/85 backdrop-blur-md">
                <span className="material-symbols-outlined text-[15px] text-secondary">
                  flare
                </span>
                <span className="font-label-caps text-label-caps text-secondary uppercase tracking-wider">
                  Shadow Twin Mesh
                </span>
              </div>
              {" "}
              <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 rounded bg-surface/85 backdrop-blur-md">
                <span className="font-label-caps text-label-caps text-primary uppercase">
                  33/33 Joints
                </span>
              </div>
              {" "}
              {/* Kinetic Telemetry Callouts directly mapped to joints */}
              {" "}
              <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-on-surface">
                <div className="flex items-center gap-2 bg-surface-container/90 backdrop-blur-md px-2.5 py-1.5 rounded-lg">
                  <div className="w-2 h-2 rounded-full bg-primary"></div>
                  <div className="flex flex-col">
                    <span className="font-label-caps text-[10px] text-on-surface-variant uppercase leading-none">
                      Elbow Flexion
                    </span>
                    <span className="font-headline-md text-body-md font-semibold text-on-surface">
                      142°{" "}
                      <span className="text-primary text-[11px] font-normal">
                        Optimal
                      </span>
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 bg-surface-container/90 backdrop-blur-md px-2.5 py-1.5 rounded-lg">
                  <div className="w-2 h-2 rounded-full bg-secondary"></div>
                  <div className="flex flex-col">
                    <span className="font-label-caps text-[10px] text-on-surface-variant uppercase leading-none">
                      Load Knee Flex
                    </span>
                    <span className="font-headline-md text-body-md font-semibold text-on-surface">
                      128°{" "}
                      <span className="text-secondary text-[11px] font-normal">
                        Target 130°
                      </span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
            {/* Live Telemetry Health Bar inside hero card */}
            <div className="px-space-md py-3 flex items-center justify-between bg-surface-container-low text-on-surface">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-primary">
                  verified
                </span>
                <span className="font-body-sm text-body-sm text-on-surface font-medium">
                  97.2% Model Fidelity
                </span>
              </div>
              <div className="flex items-center gap-1 text-on-surface-variant font-label-caps text-label-caps">
                <span>
                  99.1% FRAMES TRACKED
                </span>
              </div>
            </div>
          </div>
          {/* Stroke Classification & Action Distribution */}
          <div className="flex flex-col bg-surface-container rounded-xl p-space-md gap-space-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[20px]">
                  sports_tennis
                </span>
                <h2 className="font-headline-md text-body-lg font-semibold text-on-surface">
                  Stroke Distribution
                </h2>
              </div>
              <span className="font-label-caps text-label-caps text-on-surface-variant">
                LAST 240 SHOTS
              </span>
            </div>
            {/* Multi-segmented Kinetic Bar */}
            <div className="w-full h-3 bg-surface-container-highest rounded-full overflow-hidden flex gap-0.5">
              <div className="h-full bg-primary" style={{ width: "54%" }} title="Forehand: 54%"></div>
              <div className="h-full bg-secondary-container" style={{ width: "28%" }} title="Backhand: 28%"></div>
              <div className="h-full bg-tertiary" style={{ width: "12%" }} title="Serve: 12%"></div>
              <div className="h-full bg-surface-bright" style={{ width: "6%" }} title="Ready: 6%"></div>
            </div>
            {/* Stroke breakdown legend */}
            <div className="grid grid-cols-4 gap-1 pt-1">
              <div className="flex flex-col">
                <div className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-primary"></span>
                  <span className="font-label-caps text-[10px] text-on-surface-variant uppercase">
                    Forehand
                  </span>
                </div>
                <span className="font-headline-md text-body-md font-bold text-on-surface">
                  54%
                </span>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-secondary-container"></span>
                  <span className="font-label-caps text-[10px] text-on-surface-variant uppercase">
                    Backhand
                  </span>
                </div>
                <span className="font-headline-md text-body-md font-bold text-on-surface">
                  28%
                </span>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-tertiary"></span>
                  <span className="font-label-caps text-[10px] text-on-surface-variant uppercase">
                    Serve
                  </span>
                </div>
                <span className="font-headline-md text-body-md font-bold text-on-surface">
                  12%
                </span>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-surface-bright"></span>
                  <span className="font-label-caps text-[10px] text-on-surface-variant uppercase">
                    Ready
                  </span>
                </div>
                <span className="font-headline-md text-body-md font-bold text-on-surface">
                  6%
                </span>
              </div>
            </div>
          </div>
          {/* Personal Bests & Kinetic Chain Performance */}
          <div className="flex flex-col gap-space-xs">
            <div className="flex items-center justify-between">
              <h2 className="font-headline-md text-body-lg font-semibold text-on-surface">
                Performance Benchmarks
              </h2>
              <span className="font-label-caps text-label-caps text-secondary uppercase">
                vs Shadow Twin
              </span>
            </div>
            <div className="grid grid-cols-3 gap-gutter-mobile">
              {/* PR 1 */}
              <div className="bg-surface-container rounded-xl p-3 flex flex-col justify-between">
                <div className="flex items-center justify-between text-on-surface-variant">
                  <span className="font-label-caps text-[10px] uppercase">
                    Serve Speed
                  </span>
                  <span className="material-symbols-outlined text-[16px] text-primary">
                    bolt
                  </span>
                </div>
                <div className="my-1.5">
                  <span className="font-headline-md text-body-lg font-bold text-on-surface">
                    124.6
                  </span>
                  {" "}
                  <span className="font-body-sm text-[11px] text-on-surface-variant">
                    MPH
                  </span>
                </div>
                <span className="font-label-caps text-[10px] text-primary bg-primary-container/20 px-1.5 py-0.5 rounded w-fit">
                  +3.2 mph PR
                </span>
              </div>
              {/* PR 2 */}
              <div className="bg-surface-container rounded-xl p-3 flex flex-col justify-between">
                <div className="flex items-center justify-between text-on-surface-variant">
                  <span className="font-label-caps text-[10px] uppercase">
                    Racket Lag
                  </span>
                  <span className="material-symbols-outlined text-[16px] text-secondary">
                    timer
                  </span>
                </div>
                <div className="my-1.5">
                  <span className="font-headline-md text-body-lg font-bold text-on-surface">
                    38
                  </span>
                  {" "}
                  <span className="font-body-sm text-[11px] text-on-surface-variant">
                    ms
                  </span>
                </div>
                <span className="font-label-caps text-[10px] text-secondary bg-on-secondary-fixed-variant/40 px-1.5 py-0.5 rounded w-fit">
                  -6ms faster
                </span>
              </div>
              {/* PR 3 */}
              <div className="bg-surface-container rounded-xl p-3 flex flex-col justify-between">
                <div className="flex items-center justify-between text-on-surface-variant">
                  <span className="font-label-caps text-[10px] uppercase">
                    Kinetic Chain
                  </span>
                  <span className="material-symbols-outlined text-[16px] text-primary">
                    hub
                  </span>
                </div>
                <div className="my-1.5">
                  <span className="font-headline-md text-body-lg font-bold text-on-surface">
                    92%
                  </span>
                  {" "}
                  <span className="font-body-sm text-[11px] text-on-surface-variant">
                    Sync
                  </span>
                </div>
                <span className="font-label-caps text-[10px] text-primary bg-primary-container/20 px-1.5 py-0.5 rounded w-fit">
                  Top 4%
                </span>
              </div>
            </div>
          </div>
          {/* Hardware Sensors Telemetry State (Truthful UX) */}
          <div className="flex items-center justify-between p-3.5 bg-surface-container-low rounded-xl">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-surface-container-highest flex items-center justify-center text-on-surface-variant">
                <span className="material-symbols-outlined text-[18px]">
                  sensors_off
                </span>
              </div>
              <div className="flex flex-col">
                <span className="font-body-sm text-body-sm text-on-surface font-semibold">
                  Ball Spin &amp; String Impact
                </span>
                <span className="font-body-sm text-[11px] text-on-surface-variant">
                  Optical tracking active • Dampener sensor unlinked
                </span>
              </div>
            </div>
            <span className="font-label-caps text-[10px] text-tertiary bg-tertiary-container/20 px-2 py-1 rounded uppercase font-semibold">
              Sensor Not Connected
            </span>
          </div>
          {/* Recent Tennis Sessions */}
          <div className="flex flex-col gap-space-xs">
            <div className="flex items-center justify-between">
              <h2 className="font-headline-md text-body-lg font-semibold text-on-surface">
                Recent Recorded Sessions
              </h2>
              <Link className="font-label-caps text-label-caps text-primary uppercase flex items-center gap-0.5" href="/sessions">
                View All{" "}
                <span className="material-symbols-outlined text-[14px]">
                  arrow_forward
                </span>
              </Link>
            </div>
            {/* Session Card 1 */}
            <div className="flex items-center justify-between p-3.5 bg-surface-container rounded-xl active:bg-surface-container-high transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-surface-container-high overflow-hidden relative flex-shrink-0">
                  <div className="w-full h-full bg-cover bg-center" data-alt="Athletic woman practicing a powerful tennis groundstroke on a sunlit court with subtle tracking markers overlay." style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCqUWSAng0L2UY--IED85xTYUdycgkqvfk43GkXLqtuhA_J-Ib8U-LPI7iYKUWddsK9mOXBL0i9602nHdJIGh-hMWNOq3fAs0xUtnroUWAEWKs9R9-K_IKYNP1hkqgcYDgptg-yNtN_4FyqswlvWrNoUMIITyOh_HnJiAQdQFw_vcD6Nj9zgs8W6Ill9Ag0v9YaTyc8zKDKUEiGLXFoglVBAgWDMI6Eu5igCnysZC7zb8vmcHpg_leL')" }}></div>
                </div>
                <div className="flex flex-col">
                  <span className="font-body-md text-body-md font-semibold text-on-surface">
                    Morning Baseline Forehand
                  </span>
                  <div className="flex items-center gap-2 text-on-surface-variant font-body-sm text-[12px]">
                    <span>
                      Yesterday
                    </span>
                    <span>
                      •
                    </span>
                    <span>
                      14m 20s
                    </span>
                    <span>
                      •
                    </span>
                    <span className="text-primary font-medium">
                      88 shots
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-end">
                <div className="flex items-center gap-1">
                  <span className="font-headline-md text-body-lg font-bold text-primary">
                    814
                  </span>
                  <span className="material-symbols-outlined text-primary text-[16px]">
                    trending_up
                  </span>
                </div>
                <span className="font-label-caps text-[10px] text-on-surface-variant uppercase">
                  Biom Score
                </span>
              </div>
            </div>
            {/* Session Card 2 */}
            <div className="flex items-center justify-between p-3.5 bg-surface-container rounded-xl active:bg-surface-container-high transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-surface-container-high overflow-hidden relative flex-shrink-0">
                  <div className="w-full h-full bg-cover bg-center" data-alt="Close up of tennis racket impact point on ball with illuminated digital trace vectors over player wrist." style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBF6_NvqsedFvCYd8mjC2jH89uR1jSevshIoWNUTTInQcTM50LLfWu9HsrvuvFJpCRyGcLzAt-4CNu9S-daebqYaiHnyB3bmpeJIcGtjewLOYfxFHjoS-uAqxTYwiwQUpocG3b5YnUj80yCRsjIXbfQRCmbI-q7big7wUM11btCmm8rkFCaukSegbopvP9TUmBzSqTYB9iWbQyURjIGlryqpFwHY1BQnFxVTPerkQ9f8VEGuG8qaFg8')" }}></div>
                </div>
                <div className="flex flex-col">
                  <span className="font-body-md text-body-md font-semibold text-on-surface">
                    Backhand Crosscourt Drill
                  </span>
                  <div className="flex items-center gap-2 text-on-surface-variant font-body-sm text-[12px]">
                    <span>
                      May 10
                    </span>
                    <span>
                      •
                    </span>
                    <span>
                      18m 05s
                    </span>
                    <span>
                      •
                    </span>
                    <span className="text-secondary font-medium">
                      112 shots
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-end">
                <div className="flex items-center gap-1">
                  <span className="font-headline-md text-body-lg font-bold text-secondary">
                    792
                  </span>
                  <span className="material-symbols-outlined text-secondary text-[16px]">
                    done
                  </span>
                </div>
                <span className="font-label-caps text-[10px] text-on-surface-variant uppercase">
                  Biom Score
                </span>
              </div>
            </div>
          </div>
          {/* Hidden native file input for camera/gallery triggers */}
          <input accept="video/*" capture="environment" className="hidden" id="camera-capture-input" type="file" ref={cameraInput} onChange={onFile} />
          <input accept="video/*" className="hidden" id="video-upload-input" type="file" ref={uploadInput} onChange={onFile} />
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
