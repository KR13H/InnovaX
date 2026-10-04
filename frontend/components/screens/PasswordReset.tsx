"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

// Generated from design/stitch/password_reset_shadowathlete/code.html by scripts/stitch-to-jsx.mjs.
export default function PasswordReset() {
  const router = useRouter();
  // The backend has no reset endpoint yet, so the "sent" state and resend timer are simulated.
  const [resendIn, setResendIn] = useState(45);

  useEffect(() => {
    if (resendIn <= 0) return;
    const t = setTimeout(() => setResendIn((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [resendIn]);

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
                Password Reset
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
        <div className="flex flex-col w-full px-margin-mobile pb-space-xl">
          {/* Key Visual Badge with Cybernetic Aura */}
          <div className="flex flex-col items-center justify-center pt-space-lg pb-space-md relative">
            <div className="relative flex items-center justify-center w-24 h-24 rounded-full bg-surface-container-low shadow-[0_0_36px_rgba(0,238,252,0.18)]">
              {/* Outer glowing telemetry ring */}
              <svg className="absolute inset-0 w-full h-full animate-[spin_16s_linear_infinite]" viewBox="0 0 100 100">
                <circle className="text-secondary/20" cx="50" cy="50" fill="none" r="46" stroke="currentColor" strokeDasharray="4 6" strokeWidth="1.5"></circle>
                <circle className="text-secondary-container" cx="50" cy="50" fill="none" r="40" stroke="currentColor" strokeDasharray="14 120" strokeLinecap="round" strokeWidth="1.5"></circle>
                <circle className="text-primary" cx="50" cy="50" fill="none" r="40" stroke="currentColor" strokeDasharray="20 180" strokeLinecap="round" strokeWidth="2"></circle>
              </svg>
              {/* Core Icon Plate */}
              <div className="relative flex items-center justify-center w-16 h-16 rounded-full bg-surface-container-high shadow-[0_0_20px_rgba(34,197,94,0.22)]">
                <span className="material-symbols-outlined text-secondary-container text-[30px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                  lock_reset
                </span>
                {/* Twin sync pulse point */}
                <span className="absolute top-3 right-3 w-2 h-2 rounded-full bg-primary animate-ping"></span>
                <span className="absolute top-3 right-3 w-2 h-2 rounded-full bg-primary"></span>
              </div>
            </div>
            {/* Security Protocol Chip */}
            <div className="mt-space-sm inline-flex items-center gap-1.5 px-space-sm py-0.5 rounded-full bg-surface-container-high text-secondary">
              <span className="w-1.5 h-1.5 rounded-full bg-secondary-container shadow-[0_0_6px_#00eefc]"></span>
              <span className="font-label-caps text-label-caps uppercase tracking-wider">
                Bio-Key Vault v4.2
              </span>
            </div>
          </div>
          {/* Header Block */}
          <div className="text-center px-space-xs mt-space-xs">
            <h2 className="font-headline-xl-mobile text-headline-xl-mobile text-on-surface tracking-tight">
              Reset your password
            </h2>
            {" "}
            <p className="mt-space-xs font-body-sm text-body-sm text-on-surface-variant max-w-[320px] mx-auto leading-relaxed">
              Enter the email address linked to your ShadowAthlete account and we’ll send you a secure verification link.
            </p>
          </div>
          {/* STAGE 1: Email Form State */}
          <div className="mt-space-lg flex flex-col gap-space-md">
            <div className="flex flex-col gap-space-xs">
              <div className="flex items-center justify-between px-space-xs">
                <label className="font-label-caps text-label-caps uppercase text-on-surface-variant tracking-wider" htmlFor="recovery-email">
                  Athlete Account ID
                </label>
                <span className="font-label-caps text-label-caps text-primary flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">
                    verified
                  </span>
                  {" "}Verified Member
                </span>
              </div>
              {/* High Contrast Input */}
              <div className="relative flex items-center rounded-xl bg-surface-container-low shadow-[0_4px_20px_rgba(0,0,0,0.45)]">
                <div className="pl-space-md text-on-surface-variant flex items-center">
                  <span className="material-symbols-outlined text-[20px]">
                    alternate_email
                  </span>
                </div>
                <input className="w-full bg-transparent px-space-sm py-3.5 text-on-surface font-body-md text-body-md focus:outline-none" id="recovery-email" placeholder="your.email@domain.com" type="email" defaultValue="alex.carter@kinetics.io" />
                <div className="pr-space-md flex items-center">
                  <span className="material-symbols-outlined text-primary text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                    check_circle
                  </span>
                </div>
              </div>
            </div>
            {/* Primary Action CTA */}
            <button className="group relative w-full overflow-hidden rounded-xl bg-primary-container py-3.5 px-space-md font-headline-md text-body-md font-bold text-on-primary-container flex items-center justify-center gap-space-xs shadow-[0_0_24px_rgba(34,197,94,0.35)] active:scale-[0.99] transition-all hover:bg-primary" type="button" onClick={() => setResendIn(45)}>
              <span className="material-symbols-outlined text-[20px] transition-transform group-hover:translate-x-0.5">
                bolt
              </span>
              <span>
                Send reset link
              </span>
              <span className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></span>
            </button>
          </div>
          {/* STAGE 2: Sent Confirmation Banner */}
          <div className="mt-space-lg rounded-xl bg-surface-container-low p-space-md relative overflow-hidden shadow-[0_8px_24px_rgba(0,0,0,0.5)]">
            {/* Kinetic Left Indicator Rail */}
            {" "}
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary shadow-[0_0_12px_#22c55e]"></div>
            {" "}
            <div className="flex items-start gap-space-sm">
              <div className="p-2 rounded-lg bg-surface-container-high text-primary shrink-0 mt-0.5 shadow-[0_0_12px_rgba(34,197,94,0.2)]">
                <span className="material-symbols-outlined text-[20px]">
                  mark_email_read
                </span>
              </div>
              <div className="flex flex-col gap-1 min-w-0">
                <div className="flex items-center gap-space-xs">
                  <span className="font-label-badge text-label-badge text-primary uppercase font-bold tracking-wider">
                    Transmission Sent
                  </span>
                  <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
                </div>
                <p className="font-body-sm text-body-sm text-on-surface">
                  Check your inbox! We sent a password reset link to{" "}
                  <span className="font-bold text-secondary">
                    alex.c***@kinetics.io
                  </span>
                  .
                </p>
                <div className="flex items-center justify-between pt-space-xs mt-1">
                  <span className="font-body-sm text-body-sm text-on-surface-variant">
                    Didn’t get it?
                  </span>
                  <button className="inline-flex items-center gap-1 font-label-caps text-label-caps text-secondary uppercase tracking-wider hover:text-primary transition-colors disabled:cursor-default" type="button" disabled={resendIn > 0} onClick={() => setResendIn(45)}>
                    <span className="material-symbols-outlined text-[14px]">
                      schedule
                    </span>
                    {" "}Resend in{" "}
                    <span className={`font-bold ${resendIn > 0 ? "text-on-surface" : "text-primary"}`} id="countdown">
                      {resendIn > 0 ? `${resendIn}s` : "Now"}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>
          {/* STAGE 3: Set New Password Section (Step-down Preview) */}
          <div className="mt-space-lg rounded-xl bg-surface-container-low p-space-md relative">
            <div className="flex items-center justify-between mb-space-sm">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-secondary-container shadow-[0_0_8px_#00eefc]"></div>
                <h3 className="font-headline-md text-body-lg text-on-surface font-semibold tracking-tight">
                  Stage 2: Set New Key
                </h3>
              </div>
              <span className="px-2 py-0.5 rounded bg-surface-container-highest text-secondary font-label-caps text-label-caps uppercase">
                Ready for Sync
              </span>
            </div>
            {" "}
            {/* Password Input 1 */}
            {" "}
            <div className="flex flex-col gap-space-xs mt-space-sm">
              <label className="font-label-caps text-label-caps uppercase text-on-surface-variant tracking-wider" htmlFor="new-password">
                New Password
              </label>
              <div className="relative flex items-center rounded-xl bg-surface-container-lowest">
                <div className="pl-space-md text-on-surface-variant flex items-center">
                  <span className="material-symbols-outlined text-[18px]">
                    key
                  </span>
                </div>
                <input className="w-full bg-transparent px-space-sm py-3 text-on-surface font-body-md text-body-md focus:outline-none" id="new-password" type="password" defaultValue="••••••••••••••••" />
                <button className="pr-space-md text-on-surface-variant hover:text-on-surface flex items-center" type="button">
                  <span className="material-symbols-outlined text-[18px]">
                    visibility
                  </span>
                </button>
              </div>
              {/* Strength Meter Dual-Rail */}
              <div className="flex flex-col gap-1.5 mt-1 px-1">
                <div className="flex items-center justify-between">
                  <span className="font-label-caps text-label-caps uppercase text-on-surface-variant">
                    Entropy Matrix
                  </span>
                  <span className="font-label-caps text-label-caps text-primary uppercase font-bold tracking-wider flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                    {" "}Strong (98% Twin-Protected)
                  </span>
                </div>
                {/* Dual Split-Rail Metric */}
                <div className="grid grid-cols-4 gap-1.5 h-1.5 w-full">
                  <div className="rounded-full bg-primary shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
                  <div className="rounded-full bg-primary shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
                  <div className="rounded-full bg-primary shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
                  <div className="rounded-full bg-secondary-container shadow-[0_0_8px_rgba(0,238,252,0.6)]"></div>
                </div>
              </div>
            </div>
            {" "}
            {/* Password Input 2 */}
            {" "}
            <div className="flex flex-col gap-space-xs mt-space-md">
              <label className="font-label-caps text-label-caps uppercase text-on-surface-variant tracking-wider" htmlFor="confirm-password">
                Confirm New Password
              </label>
              <div className="relative flex items-center rounded-xl bg-surface-container-lowest">
                <div className="pl-space-md text-on-surface-variant flex items-center">
                  <span className="material-symbols-outlined text-[18px]">
                    lock
                  </span>
                </div>
                <input className="w-full bg-transparent px-space-sm py-3 text-on-surface font-body-md text-body-md focus:outline-none" id="confirm-password" type="password" defaultValue="••••••••••••••••" />
                <div className="pr-space-md flex items-center">
                  <span className="material-symbols-outlined text-primary text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                    check_circle
                  </span>
                </div>
              </div>
            </div>
            {" "}
            {/* Update CTA */}
            {" "}
            <div className="mt-space-lg">
              <button className="w-full rounded-xl bg-surface-container-high py-3.5 px-space-md font-headline-md text-body-md font-bold text-secondary flex items-center justify-center gap-space-xs shadow-[0_0_20px_rgba(0,238,252,0.15)] active:scale-[0.99] transition-all hover:bg-surface-bright" type="button" onClick={() => router.push("/login")}>
                <span className="material-symbols-outlined text-[20px] text-secondary-container">
                  sync_saved_locally
                </span>
                <span>
                  Update password &amp; Log in
                </span>
              </button>
            </div>
          </div>
          {/* Bottom Utility Navigation */}
          <div className="mt-space-xl flex flex-col items-center justify-center gap-space-sm pb-space-lg">
            <Link className="group inline-flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors py-2 px-space-md rounded-full bg-surface-container-low active:bg-surface-container-high" href="/login">
              <span className="material-symbols-outlined text-[18px] transition-transform group-hover:-translate-x-1">
                arrow_back
              </span>
              <span className="font-body-sm text-body-sm font-semibold">
                Back to Log In
              </span>
            </Link>
            <div className="flex items-center gap-1.5 opacity-60">
              <span className="material-symbols-outlined text-[14px] text-on-surface-variant">
                shield
              </span>
              <span className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-widest">
                End-to-End Encrypted Telemetry
              </span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
