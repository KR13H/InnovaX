"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ApiError, api, auth } from "@/lib/api";

// Generated from design/stitch/log_in_shadowathlete/code.html by scripts/stitch-to-jsx.mjs.
export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("expired")) setError("Your session expired — please sign in again.");
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await auth.login(email.trim(), password);
      // Accounts that never finished onboarding have no athlete profile yet.
      const hasProfile = await api("/athlete/profile").then(
        () => true,
        (e) => !(e instanceof ApiError && e.status === 404),
      );
      router.push(hasProfile ? "/home" : "/onboarding/details");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setSubmitting(false);
    }
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
                Login
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
          {/* Subtle Dynamic Ambient Glow Background Overlay */}
          <div className="fixed inset-0 pointer-events-none -z-10 flex items-center justify-center overflow-hidden">
            <div className="w-72 h-72 rounded-full bg-primary/10 blur-[100px] -top-10 -left-10 absolute"></div>
            <div className="w-80 h-80 rounded-full bg-secondary-container/10 blur-[120px] top-1/3 -right-20 absolute"></div>
          </div>
          <div className="px-margin-mobile flex flex-col pt-space-md">
            {/* Segmented Mode Control (Log In vs Create Account) */}
            <div className="p-space-xs bg-surface-container-low rounded-xl flex items-center mb-space-lg shadow-sm">
              <button className="flex-1 py-space-sm px-space-md rounded-lg font-label-caps text-label-caps tracking-wider transition-all duration-200 bg-surface-container text-primary flex items-center justify-center gap-space-xs shadow-sm" type="button">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
                {" "}LOG IN
              </button>
              <button className="flex-1 py-space-sm px-space-md rounded-lg font-label-caps text-label-caps tracking-wider transition-all duration-200 text-on-surface-variant hover:text-on-surface flex items-center justify-center" type="button" onClick={() => router.push("/signup")}>
                CREATE ACCOUNT
              </button>
            </div>
            {/* Telemetry Header Context */}
            <div className="mb-space-lg">
              <div className="inline-flex items-center gap-space-xs px-space-sm py-0.5 rounded-full bg-surface-container text-secondary text-label-badge font-label-badge mb-space-sm">
                <span className="material-symbols-outlined text-[14px]">
                  tune
                </span>
                {" "}KINETIC IDENTITY NODE 01
              </div>
              {" "}
              <h2 className="font-headline-xl-mobile text-headline-xl-mobile text-on-surface tracking-tight">
                Welcome back
              </h2>
              {" "}
              <p className="font-body-sm text-body-sm text-on-surface-variant mt-space-xs">
                Log in to sync with your digital twin and resume live latency telemetry.
              </p>
            </div>
            {/* Dismissible Notice Banner (Error / Session State) */}
            {error && (
            <div className="mb-space-md bg-surface-container p-space-sm rounded-xl flex items-start gap-space-sm shadow-md transition-all duration-300" id="authNotice">
              <div className="p-1 rounded bg-error-container text-error flex items-center justify-center shrink-0 mt-0.5">
                <span className="material-symbols-outlined text-[16px]">
                  sync_problem
                </span>
              </div>
              <div className="flex-1 min-w-0 pr-space-xs">
                <p className="font-label-badge text-label-badge text-error tracking-wide uppercase">
                  {error?.includes("expired") ? "Session Handshake Expired" : "Sign-in Failed"}
                </p>
                {" "}
                <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5 leading-snug">
                  {error}
                </p>
              </div>
              <button aria-label="Dismiss notice" className="p-1 text-on-surface-variant hover:text-on-surface transition-colors" onClick={() => setError(null)} type="button">
                <span className="material-symbols-outlined text-[18px]">
                  close
                </span>
              </button>
            </div>
            )}
            {/* Main Authentication Form */}
            <form className="flex flex-col gap-space-md" onSubmit={onSubmit}>
              {/* Email Field Container */}
              <div className="flex flex-col gap-space-xs">
                <div className="flex justify-between items-center px-1">
                  <label className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider" htmlFor="athleteEmail">
                    Athlete Identifier / Email
                  </label>
                  <span className={`font-label-caps text-label-caps text-primary flex items-center gap-0.5 ${emailOk ? "" : "invisible"}`}>
                    <span className="material-symbols-outlined text-[13px]">
                      verified
                    </span>
                    {" "}VALID
                  </span>
                </div>
                <div className="relative flex items-center">
                  <span className="material-symbols-outlined absolute left-space-md text-[20px] text-on-surface-variant pointer-events-none">
                    alternate_email
                  </span>
                  <input className="w-full bg-surface-container-low text-on-surface font-body-md text-body-md pl-12 pr-20 py-3.5 rounded-xl transition-all outline-none focus:bg-surface-container placeholder:text-outline-variant" id="athleteEmail" placeholder="alex.carter@kinetics.io" type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                  <div className="absolute right-space-sm flex items-center gap-1">
                    <button aria-label="Clear field" className="w-7 h-7 flex items-center justify-center rounded-full text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors" onClick={() => { setEmail(""); document.getElementById("athleteEmail")?.focus(); }} type="button">
                      <span className="material-symbols-outlined text-[16px]">
                        cancel
                      </span>
                    </button>
                    <div className={`w-6 h-6 flex items-center justify-center text-primary ${emailOk ? "" : "invisible"}`}>
                      <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                        check_circle
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              {/* Password Field Container */}
              <div className="flex flex-col gap-space-xs">
                <div className="flex justify-between items-center px-1">
                  <label className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider" htmlFor="athletePassword">
                    Security Passkey
                  </label>
                  <Link className="font-label-caps text-label-caps text-secondary-container hover:text-secondary tracking-wider uppercase transition-colors" href="/reset-password">
                    Forgot password?
                  </Link>
                </div>
                <div className="relative flex items-center">
                  <span className="material-symbols-outlined absolute left-space-md text-[20px] text-on-surface-variant pointer-events-none">
                    lock
                  </span>
                  <input className="w-full bg-surface-container-low text-on-surface font-body-md text-body-md pl-12 pr-12 py-3.5 rounded-xl transition-all outline-none focus:bg-surface-container placeholder:text-outline-variant tracking-widest" id="athletePassword" placeholder="••••••••••••" type={showPassword ? "text" : "password"} required autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} />
                  <button aria-label="Toggle password visibility" className="absolute right-space-sm w-9 h-9 flex items-center justify-center rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors" id="togglePasswordBtn" onClick={() => setShowPassword((v) => !v)} type="button">
                    <span className="material-symbols-outlined text-[20px]">
                      {showPassword ? "visibility_off" : "visibility"}
                    </span>
                  </button>
                </div>
              </div>
              {/* Sync Digital Twin Status Check Indicator */}
              <div className="px-space-md py-space-sm bg-surface-container-lowest rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-space-sm">
                  <div className="w-2 h-2 rounded-full bg-secondary-container animate-ping"></div>
                  <span className="font-body-sm text-body-sm text-on-surface-variant">
                    Twin Target Stream:
                  </span>
                </div>
                <span className="font-label-caps text-label-caps text-secondary">
                  SYNC_READY (0.4ms)
                </span>
              </div>
              {/* Primary Kinetic Action Button */}
              <button className="w-full mt-space-xs py-4 px-space-lg rounded-xl bg-primary-container text-on-primary font-display-hero-mobile text-body-lg font-bold flex items-center justify-center gap-space-sm tracking-wide shadow-md active:scale-[0.98] transition-all hover:bg-primary disabled:opacity-70 disabled:cursor-wait" type="submit" disabled={submitting}>
                <span>
                  {submitting ? "SYNCING…" : "LOG IN"}
                </span>
                <span className="material-symbols-outlined text-[22px]">
                  arrow_forward
                </span>
              </button>
            </form>
            {/* Biometric Passkey Fast Track (Moment of Delight) */}
            <div className="mt-space-md">
              <button className="w-full py-3.5 px-space-md rounded-xl bg-surface-container text-secondary flex items-center justify-between shadow-sm active:bg-surface-container-high transition-colors group" type="button" onClick={() => router.push("/home")}>
                <div className="flex items-center gap-space-sm">
                  <div className="w-8 h-8 rounded-lg bg-surface-container-highest flex items-center justify-center text-secondary-container">
                    <span className="material-symbols-outlined text-[20px]">
                      fingerprint
                    </span>
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="font-label-caps text-label-caps tracking-wider text-on-surface">
                      FACE ID PASSKEY
                    </span>
                    <span className="font-body-sm text-[11px] text-on-surface-variant leading-none">
                      Instant Biometric Twin Uplink
                    </span>
                  </div>
                </div>
                <span className="material-symbols-outlined text-secondary text-[20px] transition-transform group-hover:translate-x-0.5">
                  chevron_right
                </span>
              </button>
            </div>
            {/* Divider Section */}
            <div className="relative my-space-lg flex items-center justify-center">
              <div className="w-full h-px bg-surface-container-high absolute inset-0 my-auto"></div>
              <span className="relative px-space-md bg-surface font-label-caps text-label-caps text-outline uppercase tracking-widest">
                Or continue with
              </span>
            </div>
            {/* Social Authentication Grid */}
            <div className="grid grid-cols-2 gap-space-sm">
              <button className="py-3 px-space-md rounded-xl bg-surface-container-low text-on-surface flex items-center justify-center gap-space-sm font-label-badge text-label-badge active:bg-surface-container-high transition-colors shadow-sm" type="button">
                <svg aria-hidden="true" className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 4.88c.67-.82 1.13-1.96.99-3.11-1 .04-2.17.67-2.86 1.48-.6.69-1.13 1.83-.98 2.95 1.11.09 2.2-.55 2.85-1.32z"></path>
                </svg>
                <span>
                  Apple
                </span>
              </button>
              <button className="py-3 px-space-md rounded-xl bg-surface-container-low text-on-surface flex items-center justify-center gap-space-sm font-label-badge text-label-badge active:bg-surface-container-high transition-colors shadow-sm" type="button">
                <svg aria-hidden="true" className="w-4 h-4" viewBox="0 0 24 24">
                  <path d="M12 5c1.55 0 2.9.54 3.97 1.57l2.97-2.97C17.15 1.9 14.77 1 12 1 7.6 1 3.82 3.52 1.97 7.18l3.66 2.84C6.51 7.24 9.02 5 12 5z" fill="#EA4335"></path>
                  <path d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58l3.72 2.89c2.18-2.01 3.7-4.97 3.7-8.71z" fill="#4285F4"></path>
                  <path d="M5.63 13.98c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09L1.97 6.96C1.22 8.47.78 10.18.78 12s.44 3.53 1.19 5.04l3.66-2.84z" fill="#FBBC05"></path>
                  <path d="M12 23c3.24 0 5.95-1.08 7.93-2.91l-3.72-2.89c-1.07.72-2.45 1.16-4.21 1.16-2.98 0-5.49-2.24-6.37-5.02L1.97 16.18C3.82 19.84 7.6 23 12 23z" fill="#34A853"></path>
                </svg>
                <span>
                  Google
                </span>
              </button>
            </div>
            {/* Secondary Prompt Context */}
            <div className="mt-space-xl mb-space-lg text-center flex flex-col items-center gap-space-xs">
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                Don’t have an athlete account?
              </p>
              <Link className="font-headline-md text-body-md text-primary hover:text-primary-fixed transition-colors inline-flex items-center gap-1 font-semibold" href="/signup">
                Create account{" "}
                <span className="material-symbols-outlined text-[16px]">
                  north_east
                </span>
              </Link>
            </div>
            {/* Tactical Live Status Ping Footer */}
            <div className="flex items-center justify-center gap-space-sm py-space-sm opacity-60">
              <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
              <span className="font-label-caps text-[10px] tracking-widest text-outline uppercase">
                Encrypted Kinetic Handshake v4.2 • ShadowProtocol
              </span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
