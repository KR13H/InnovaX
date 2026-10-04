"use client";

import { useRouter } from "next/navigation";

// Generated from design/stitch/welcome_shadowathlete/code.html by scripts/stitch-to-jsx.mjs.
export default function Welcome() {
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
                Welcome
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
        <div className="flex flex-col w-full px-margin-mobile pb-safe">
          {/* Dynamic Kinetic Aura Background Glow */}
          <div className="relative w-full overflow-hidden rounded-xl bg-surface-container-lowest mt-space-sm shadow-xl">
            <div className="absolute -top-12 -left-12 w-48 h-48 bg-primary/10 rounded-full blur-3xl pointer-events-none"></div>
            {" "}
            <div className="absolute -bottom-10 -right-10 w-56 h-56 bg-secondary-container/15 rounded-full blur-3xl pointer-events-none"></div>
            {" "}
            {/* Centerpiece Hero Visual with Telemetry HUD Overlay */}
            {" "}
            <div className="relative w-full aspect-[16/10] overflow-hidden">
              <img alt="Dynamic athletic forehand stroke with cybernetic telemetry overlay" className="w-full h-full object-cover transform scale-105" src="https://lh3.googleusercontent.com/aida/AEtjO1UQmzyfdQkENsiuMIjSUdGWCMB0ZIaO6XZo8l_f4Boh7wWmW09d4uCLBx_9CvbuVZ4Nza2MM2-bA4n6S3kRN_u1_jzL54aJSuKydLjUsaRK26BjtNMh_rPG-hzoShAw358qOG6NTs4OXO1N0fQxG6iDUrqDgtenkziQJk4Yitu7O8gJ_ZlscqLATQzZOeUVqW0BqAOJ9YDp1-XJ_yYZnoq9dsZUJ2KKDQvVkpsoFDYrSOf9DrlAdg9EkfA" />
              {" "}
              {/* Cinematic Vignette & Edge Scrim */}
              {" "}
              <div className="absolute inset-0 bg-gradient-to-t from-surface-container-lowest via-surface-container-lowest/30 to-transparent"></div>
              {" "}
              <div className="absolute inset-0 bg-gradient-to-r from-surface-container-lowest/60 via-transparent to-surface-container-lowest/60"></div>
              {" "}
              {/* Real-time Twin Ghost Status Badge */}
              {" "}
              <div className="absolute top-space-sm left-space-sm flex items-center gap-space-xs px-space-sm py-space-xs rounded-full bg-surface-container-highest/80 backdrop-blur-md">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary-container opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-secondary-container"></span>
                </span>
                <span className="font-label-caps text-label-caps text-secondary tracking-wider uppercase">
                  GHOST SYNC 99.4%
                </span>
              </div>
              {" "}
              {/* Kinetic Telemetry Delta Chip */}
              {" "}
              <div className="absolute top-space-sm right-space-sm flex items-center gap-space-xs px-space-sm py-space-xs rounded-full bg-surface-container-highest/80 backdrop-blur-md">
                <span className="material-symbols-outlined text-primary text-[14px]">
                  bolt
                </span>
                <span className="font-label-caps text-label-caps text-primary tracking-wider">
                  +4.2 KM/H VELOCITY
                </span>
              </div>
              {" "}
              {/* Holographic Scanline Overlay Line */}
              {" "}
              <div className="absolute bottom-4 left-space-sm right-space-sm flex items-center justify-between px-space-sm py-1 rounded bg-surface-container-high/60 backdrop-blur-md">
                <div className="flex items-center gap-space-xs">
                  <span className="material-symbols-outlined text-secondary text-[16px]">
                    accessibility_new
                  </span>
                  <span className="font-label-caps text-label-caps text-on-surface-variant">
                    SKELETAL MESH: 32 NODES
                  </span>
                </div>
                <span className="font-label-caps text-label-caps text-primary">
                  LOCKED
                </span>
              </div>
            </div>
            {" "}
            {/* Identity & Brand Anchor */}
            {" "}
            <div className="p-space-md flex flex-col items-center text-center">
              <div className="flex items-center gap-space-xs px-space-sm py-1 rounded-full bg-surface-container-high mb-space-sm">
                <img alt="ShadowAthlete Mark" className="w-5 h-5 object-contain" src="https://lh3.googleusercontent.com/aida/AEtjO1U3su2IAJUfImc-QDFIgi5gzTYlDbkzgOVUovo_BNyYGtYNa9qhX4P-2oyefwHVQLhZ1Ab4ChydkqNbQYJ6oFFxL_5J_Qddc6EFgbqZ0J_0WRGiZMLAdr9Zbyj22BuHGThZeOIqyijB8g8KkiHaFQvfwq9-n-bK31wtBSZzAKwsfXkmsWzUb-vNdXU1acb3RA2HpoEFk8GGPHAJO2_JBzWeKHcIe9Wj_ZNrU6FINegMlz-Os5bYSEFdNK0" />
                <span className="font-label-caps text-label-caps text-secondary tracking-widest uppercase">
                  SHADOWATHLETE AI
                </span>
              </div>
              <h2 className="font-headline-xl-mobile text-headline-xl-mobile text-on-surface tracking-tight mb-space-xs">
                Meet the athlete you’re chasing.
              </h2>
              <p className="font-label-caps text-label-caps text-primary uppercase tracking-widest mb-space-sm">
                Your only opponent is you.
              </p>
              <p className="font-body-sm text-body-sm text-on-surface-variant max-w-xs leading-relaxed">
                Record your movement, train against your persistent digital twin, and shatter your personal bests across Tennis, Cricket, Basketball, and Running.
              </p>
            </div>
          </div>
          {/* Telemetry Capability Stream */}
          <div className="flex flex-col gap-space-sm mt-space-md">
            {/* Feature 1 */}
            <div className="flex items-start gap-space-md p-space-md rounded-xl bg-surface-container-low transition-all active:scale-[0.99]">
              <div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center shrink-0 shadow-sm shadow-secondary-container/10">
                <span className="material-symbols-outlined text-secondary text-[22px]">
                  person_pin
                </span>
              </div>
              <div className="flex flex-col min-w-0">
                <span className="font-body-md text-body-md font-semibold text-on-surface leading-tight">
                  Persistent Digital Twin
                </span>
                <span className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                  One unified kinetic avatar synchronized seamlessly across all your sports.
                </span>
              </div>
            </div>
            {/* Feature 2 */}
            <div className="flex items-start gap-space-md p-space-md rounded-xl bg-surface-container-low transition-all active:scale-[0.99]">
              <div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center shrink-0 shadow-sm shadow-primary/10">
                <span className="material-symbols-outlined text-primary text-[22px]">
                  auto_videocam
                </span>
              </div>
              <div className="flex flex-col min-w-0">
                <span className="font-body-md text-body-md font-semibold text-on-surface leading-tight">
                  Vision Biomechanics
                </span>
                <span className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                  Sub-millimeter joint tracking &amp; speed analytics without specialized wearables.
                </span>
              </div>
            </div>
            {/* Feature 3 */}
            <div className="flex items-start gap-space-md p-space-md rounded-xl bg-surface-container-low transition-all active:scale-[0.99]">
              <div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center shrink-0 shadow-sm shadow-secondary-container/10">
                <span className="material-symbols-outlined text-secondary text-[22px]">
                  history_toggle_off
                </span>
              </div>
              <div className="flex flex-col min-w-0">
                <span className="font-body-md text-body-md font-semibold text-on-surface leading-tight">
                  Ghost Match Duels
                </span>
                <span className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                  Race side-by-side against your previous best session rendered directly in real-time AR.
                </span>
              </div>
            </div>
          </div>
          {/* Interactive Action Module */}
          <div className="flex flex-col gap-space-sm mt-space-lg">
            {/* Primary CTA: High-intensity electric lime trigger */}
            <button className="w-full min-h-[52px] bg-primary text-on-primary font-headline-md text-[17px] font-bold rounded-xl flex items-center justify-center gap-space-xs shadow-lg shadow-primary/25 active:scale-[0.98] transition-transform" onClick={() => router.push("/signup")} type="button">
              <span>
                Create account
              </span>
              <span className="material-symbols-outlined text-[20px] font-bold">
                arrow_forward
              </span>
            </button>
            {/* Secondary Ghost Trigger */}
            <button className="w-full min-h-[48px] bg-surface-container-high text-on-surface font-headline-md text-[16px] font-semibold rounded-xl flex items-center justify-center transition-colors active:bg-surface-container-highest" onClick={() => router.push("/login")} type="button">
              <span>
                Log in
              </span>
            </button>
          </div>
          {/* Compliance & Telemetry Agreement Micro-copy */}
          <div className="mt-space-md mb-space-sm text-center px-space-sm">
            <p className="font-label-badge text-label-badge text-outline">
              By continuing, you accept the{" "}
              <a className="text-on-surface-variant underline decoration-outline-variant hover:text-primary transition-colors" href="#">
                Terms of Service
              </a>
              {" "}and acknowledge our{" "}
              <a className="text-on-surface-variant underline decoration-outline-variant hover:text-primary transition-colors" href="#">
                Biometric Privacy Protocol
              </a>
              .
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
