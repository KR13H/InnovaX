"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ApiError, api, auth } from "@/lib/api";
import { saveDraft } from "@/lib/onboarding";

const REQ_ON = "flex items-center gap-1.5 px-2 py-1 rounded bg-surface-container-low text-primary transition-colors";
const REQ_OFF = "flex items-center gap-1.5 px-2 py-1 rounded bg-surface-container-low text-outline opacity-60 transition-colors";
const BAR_ON = "h-full rounded-full bg-primary transition-all duration-300";
const BAR_OFF = "h-full rounded-full bg-surface-variant transition-all duration-300";

// Generated from design/stitch/sign_up_shadowathlete/code.html by scripts/stitch-to-jsx.mjs.
export default function SignUp() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [conflictEmail, setConflictEmail] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const req = {
    len: password.length >= 8,
    upper: /[A-Z]/.test(password),
    num: /[0-9]/.test(password),
    sym: /[^A-Za-z0-9]/.test(password),
  };
  const score = Object.values(req).filter(Boolean).length;
  const strength =
    score === 4
      ? { text: "SYNCHRONIZED (STRONG)", color: "text-primary" }
      : score >= 2
        ? { text: "INTERMEDIATE RESOLUTION", color: "text-tertiary" }
        : { text: "VULNERABLE TELEMETRY", color: "text-error" };
  const matches = confirm.length > 0 && confirm === password;
  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!matches) return setError("Passwords do not match.");
    if (!req.len) return setError("Password needs at least 8 characters.");
    if (!name.trim()) return setError("Please enter your name.");
    setSubmitting(true);
    try {
      await auth.signup(email.trim(), password);
      await auth.login(email.trim(), password);
      // Create the athlete profile now so the name is stored even if onboarding is skipped.
      await api("/athlete/profile", { method: "POST", body: JSON.stringify({ name: name.trim() }) }).catch(() => {});
      saveDraft({ name: name.trim() });
      router.push("/onboarding/details");
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) setConflictEmail(email);
      else setError(err instanceof Error ? err.message : "Sign up failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="bg-surface text-on-surface font-body-md text-body-md flex flex-col min-h-screen antialiased">
      <header className="fixed top-0 inset-x-0 z-50 bg-surface-container-lowest/80 backdrop-blur-xl shadow-[0_4px_24px_rgba(0,0,0,0.5)] pt-safe">
        <div className="h-16 px-space-sm flex items-center justify-between">
          <div className="flex items-center gap-space-xs">
            <button className="w-11 h-11 flex items-center justify-center text-on-surface-variant hover:text-on-surface rounded-full transition-colors" onClick={() => router.back()}>
              <span className="material-symbols-outlined text-[20px]">
                arrow_back
              </span>
            </button>
            <img alt="Athletic silhouette icon with a subtle glowing cyan/lime duplicate shadow offset mark, symbolizing 'ShadowAthlete' and 'Your only opponent is you'. Brand logo" className="h-7 w-auto object-contain" src="https://lh3.googleusercontent.com/aida/AEtjO1U3su2IAJUfImc-QDFIgi5gzTYlDbkzgOVUovo_BNyYGtYNa9qhX4P-2oyefwHVQLhZ1Ab4ChydkqNbQYJ6oFFxL_5J_Qddc6EFgbqZ0J_0WRGiZMLAdr9Zbyj22BuHGThZeOIqyijB8g8KkiHaFQvfwq9-n-bK31wtBSZzAKwsfXkmsWzUb-vNdXU1acb3RA2HpoEFk8GGPHAJO2_JBzWeKHcIe9Wj_ZNrU6FINegMlz-Os5bYSEFdNK0" />
            <h1 className="font-headline-md text-body-md tracking-tight uppercase text-on-surface truncate">
              Auth
            </h1>
          </div>
          <div className="flex items-center gap-space-xs">
            <img alt="Profile" className="w-7 h-7 rounded-full object-cover ring-1 ring-secondary-container/40" src="https://lh3.googleusercontent.com/aida/AEtjO1VMnOn0JU8o67qYlYqYCfMg1WkAfuvSKYr7KKY53q6BP96YUKVar9XDhOk_G0q9oEEjtyqPTnjPz-jEJrc0WYt38c3cNqYZcfCBRJw4q5MRzBkPerclP4uhy8_16kr0ms5etlkMLS_PsBNC0_ErIoeYXxd2zuxLTVC_llRYg3rM1224q-gsYbE7WRhzle6ndzpYuYW6zR9J2qVASfJ92oWz4LbzfGQXXuIcMd1SHheY-ciDcBNW3LLRji8" />
            <button className="w-11 h-11 flex items-center justify-center text-on-surface-variant hover:text-error transition-colors" onClick={() => router.push("/")}>
              <span className="material-symbols-outlined text-[20px]">
                close
              </span>
            </button>
          </div>
        </div>
      </header>
      <main className="flex flex-col relative w-full pt-16 pb-safe bg-surface min-h-screen">
        <div className="flex flex-col w-full px-margin-mobile pb-space-xl">
          {/* Brand Telemetry Header Banner */}
          <div className="relative w-full pt-space-md pb-space-sm flex flex-col gap-space-xs">
            <div className="inline-flex items-center gap-space-xs self-start px-space-sm py-1 bg-surface-container-high rounded-full shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
              <span className="font-label-caps text-label-caps tracking-widest text-primary uppercase">
                KINETIC DIGITAL TWIN ID // 2.4
              </span>
            </div>
            <h2 className="font-headline-xl-mobile text-headline-xl-mobile text-on-surface tracking-tight mt-space-xs font-bold">
              Create athlete account
            </h2>
            <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
              One account. One persistent digital twin across all your sports.
            </p>
          </div>
          {/* Inline Dynamic Alert / Notice (Dismissable Simulation) */}
          {(conflictEmail || error) && (
          <div className="w-full mt-space-sm mb-space-sm p-space-sm rounded-xl bg-error-container/25 flex items-start gap-space-sm shadow-md transition-all duration-300" id="email-conflict-banner">
            <span className="material-symbols-outlined text-error text-[20px] shrink-0 mt-0.5">
              error_outline
            </span>
            <div className="flex-1 min-w-0 flex flex-col">
              <div className="flex items-center justify-between">
                <span className="font-headline-md text-body-sm font-semibold text-error tracking-tight">
                  {conflictEmail ? "Identity collision detected" : "Sign up failed"}
                </span>
                <button className="text-on-surface-variant hover:text-on-surface" onClick={() => { setConflictEmail(null); setError(null); }} type="button">
                  <span className="material-symbols-outlined text-[16px]">
                    close
                  </span>
                </button>
              </div>
              {conflictEmail ? (
              <>
              <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5 leading-snug">
                Email{" "}
                <span className="text-on-surface font-medium">
                  {conflictEmail}
                </span>
                {" "}is already registered.
              </p>
              <Link className="inline-flex items-center gap-1 font-label-badge text-label-badge text-secondary-fixed-dim hover:text-secondary mt-1 uppercase tracking-wider font-semibold" href="/login">
                Sign in with existing credentials{" "}
                <span className="material-symbols-outlined text-[14px]">
                  arrow_forward
                </span>
              </Link>
              </>
              ) : (
              <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5 leading-snug">
                {error}
              </p>
              )}
            </div>
          </div>
          )}
          {/* Registration Form */}
          <form className="flex flex-col gap-space-md mt-space-xs" id="signup-form" onSubmit={onSubmit}>
            {/* Full Name Input */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label className="font-label-caps text-label-caps tracking-widest text-on-surface-variant uppercase" htmlFor="full-name">
                  Full Name
                </label>
                <span className="font-label-caps text-label-caps text-secondary-fixed-dim/80">
                  ATHLETE CALLSIGN
                </span>
              </div>
              <div className="relative flex items-center bg-surface-container-low rounded-xl px-space-sm py-3.5 shadow-sm focus-within:bg-surface-container-high transition-colors">
                <span className="material-symbols-outlined text-on-surface-variant text-[20px] shrink-0 mr-space-xs">
                  person
                </span>
                <input className="w-full bg-transparent font-body-md text-body-md text-on-surface placeholder:text-outline focus:outline-none" id="full-name" placeholder="e.g. Alex Carter" type="text" required autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} />
                <button className="w-7 h-7 flex items-center justify-center rounded-full bg-surface-container hover:bg-surface-bright text-on-surface-variant hover:text-on-surface transition-colors shrink-0 ml-space-xs" onClick={() => { setName(""); document.getElementById("full-name")?.focus(); }} type="button">
                  <span className="material-symbols-outlined text-[16px]">
                    cancel
                  </span>
                </button>
              </div>
            </div>
            {/* Email Address Input */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label className="font-label-caps text-label-caps tracking-widest text-on-surface-variant uppercase" htmlFor="email-field">
                  Email Address
                </label>
                <span className={`inline-flex items-center gap-1 font-label-caps text-label-caps text-primary tracking-wider uppercase ${emailOk ? "" : "invisible"}`} id="email-sync-status">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                  {" "}Telemetry Link OK
                </span>
              </div>
              <div className="relative flex items-center bg-surface-container-low rounded-xl px-space-sm py-3.5 shadow-sm focus-within:bg-surface-container-high transition-colors">
                <span className="material-symbols-outlined text-on-surface-variant text-[20px] shrink-0 mr-space-xs">
                  alternate_email
                </span>
                <input className="w-full bg-transparent font-body-md text-body-md text-on-surface placeholder:text-outline focus:outline-none" id="email-field" placeholder="alex@example.com" type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                <div className={`flex items-center gap-1 shrink-0 ml-space-xs ${emailOk ? "" : "invisible"}`}>
                  <span className="material-symbols-outlined text-primary text-[20px]" title="Valid Email Mesh Node">
                    check_circle
                  </span>
                </div>
              </div>
            </div>
            {/* Password Input */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label className="font-label-caps text-label-caps tracking-widest text-on-surface-variant uppercase" htmlFor="password-field">
                  Biometric Key / Password
                </label>
                <span className={`font-label-caps text-label-caps ${strength.color} uppercase tracking-widest font-semibold`} id="strength-label">
                  {strength.text}
                </span>
              </div>
              <div className="relative flex items-center bg-surface-container-low rounded-xl px-space-sm py-3.5 shadow-sm focus-within:bg-surface-container-high transition-colors">
                <span className="material-symbols-outlined text-on-surface-variant text-[20px] shrink-0 mr-space-xs">
                  lock
                </span>
                <input className="w-full bg-transparent font-body-md text-body-md text-on-surface placeholder:text-outline focus:outline-none tracking-normal font-body-md" id="password-field" placeholder="Enter secure key" type={showPassword ? "text" : "password"} required autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} />
                <button className="w-7 h-7 flex items-center justify-center rounded-full text-on-surface-variant hover:text-on-surface transition-colors shrink-0 ml-space-xs" id="pw-toggle-btn" onClick={() => setShowPassword((v) => !v)} type="button">
                  <span className="material-symbols-outlined text-[18px]" id="pw-toggle-icon">
                    {showPassword ? "visibility_off" : "visibility"}
                  </span>
                </button>
              </div>
              {/* Segmented Strength Indicator Rail */}
              <div className="flex flex-col gap-1.5 mt-1">
                <div className="grid grid-cols-4 gap-1.5 w-full h-1.5 rounded-full overflow-hidden bg-surface-container-lowest p-0.5">
                  <div className={req.len ? BAR_ON : BAR_OFF} id="bar-len"></div>
                  <div className={req.upper ? BAR_ON : BAR_OFF} id="bar-upper"></div>
                  <div className={req.num ? BAR_ON : BAR_OFF} id="bar-num"></div>
                  <div className={req.sym ? BAR_ON : BAR_OFF} id="bar-sym"></div>
                </div>
                {/* Interactive Validation Matrix Badges */}
                <div className="grid grid-cols-2 gap-1.5 pt-0.5">
                  <div className={req.len ? REQ_ON : REQ_OFF} id="req-len">
                    <span className="material-symbols-outlined text-[13px]">
                      {req.len ? "check" : "remove"}
                    </span>
                    <span className="font-label-caps text-label-caps">
                      8+ CHARACTERS
                    </span>
                  </div>
                  <div className={req.upper ? REQ_ON : REQ_OFF} id="req-upper">
                    <span className="material-symbols-outlined text-[13px]">
                      {req.upper ? "check" : "remove"}
                    </span>
                    <span className="font-label-caps text-label-caps">
                      UPPERCASE
                    </span>
                  </div>
                  <div className={req.num ? REQ_ON : REQ_OFF} id="req-num">
                    <span className="material-symbols-outlined text-[13px]">
                      {req.num ? "check" : "remove"}
                    </span>
                    <span className="font-label-caps text-label-caps">
                      NUMBER
                    </span>
                  </div>
                  <div className={req.sym ? REQ_ON : REQ_OFF} id="req-sym">
                    <span className="material-symbols-outlined text-[13px]">
                      {req.sym ? "check" : "remove"}
                    </span>
                    <span className="font-label-caps text-label-caps">
                      SYMBOL
                    </span>
                  </div>
                </div>
              </div>
            </div>
            {/* Confirm Password Input */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label className="font-label-caps text-label-caps tracking-widest text-on-surface-variant uppercase" htmlFor="confirm-password-field">
                  Confirm Password
                </label>
                <span className={`font-label-caps text-label-caps ${matches ? "text-primary" : "text-error"} uppercase ${confirm ? "" : "invisible"}`}>
                  {matches ? "TWIN MATCH CONFIRMED" : "KEYS DO NOT MATCH"}
                </span>
              </div>
              <div className="relative flex items-center bg-surface-container-low rounded-xl px-space-sm py-3.5 shadow-sm focus-within:bg-surface-container-high transition-colors">
                <span className="material-symbols-outlined text-on-surface-variant text-[20px] shrink-0 mr-space-xs">
                  verified_user
                </span>
                <input className="w-full bg-transparent font-body-md text-body-md text-on-surface placeholder:text-outline focus:outline-none" id="confirm-password-field" placeholder="Re-enter password" type="password" required autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
                <div className={`flex items-center justify-center w-6 h-6 rounded-full bg-primary-container/20 text-primary shrink-0 ml-space-xs ${matches ? "" : "invisible"}`}>
                  <span className="material-symbols-outlined text-[16px] font-bold">
                    done_all
                  </span>
                </div>
              </div>
            </div>
            {/* Biometric Privacy & Vector Architecture Card */}
            <div className="p-space-sm bg-surface-container-low rounded-xl flex flex-col gap-space-xs shadow-sm mt-space-xs">
              <div className="flex items-start gap-space-sm">
                <label className="relative flex items-center justify-center cursor-pointer mt-0.5">
                  <input defaultChecked required className="peer sr-only" id="terms-checkbox" type="checkbox" />
                  <div className="w-5 h-5 rounded bg-surface-container-highest peer-checked:bg-primary transition-colors flex items-center justify-center">
                    <span className="material-symbols-outlined text-on-primary text-[15px] scale-0 peer-checked:scale-100 transition-transform font-bold">
                      check
                    </span>
                  </div>
                </label>
                <div className="flex flex-col gap-0.5">
                  <span className="font-headline-md text-body-sm font-semibold text-on-surface">
                    Accept Kinetic Protocol &amp; Biometric Privacy
                  </span>
                  <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
                    Your movement video stays private. Only anonymized joint vectors are used to build and train your digital shadow.
                  </p>
                </div>
              </div>
              {/* Telemetry Vector Visualization Preview Graphic */}
              <div className="mt-space-xs p-space-xs rounded-lg bg-surface-container-lowest flex items-center justify-between">
                <div className="flex items-center gap-space-xs min-w-0">
                  <div className="w-7 h-7 rounded-lg bg-secondary-container/15 flex items-center justify-center text-secondary-container shrink-0">
                    <span className="material-symbols-outlined text-[18px]">
                      neurology
                    </span>
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="font-label-caps text-label-caps text-on-surface tracking-wider uppercase truncate">
                      SKELETAL MESH 48-NODE ANONYMIZATION
                    </span>
                    <span className="font-body-sm text-body-sm text-on-surface-variant text-[11px] truncate">
                      Zero facial imagery saved // ISO-27701 compliant
                    </span>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded bg-surface-container-high text-secondary text-label-caps font-label-caps uppercase shrink-0">
                  AES-256
                </span>
              </div>
            </div>
            {/* Primary CTA Button (48px+ touch target) */}
            <button className="relative w-full h-14 bg-primary text-on-primary rounded-xl font-headline-md text-body-md font-bold tracking-tight shadow-[0_0_24px_-2px_rgba(34,197,94,0.35)] active:scale-[0.98] transition-all flex items-center justify-center gap-2 overflow-hidden mt-space-xs disabled:opacity-90 disabled:cursor-wait" id="submit-cta" type="submit" disabled={submitting}>
              <span className={submitting ? "hidden" : "flex items-center gap-2"} id="btn-text">
                Create account{" "}
                <span className="material-symbols-outlined text-[18px]">
                  arrow_forward
                </span>
              </span>
              {/* Hidden Spin State Component */}
              <span className={`${submitting ? "flex" : "hidden"} items-center gap-2 font-headline-md text-body-md text-on-primary`} id="btn-loading">
                <svg className="animate-spin h-5 w-5 text-on-primary" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" fill="currentColor"></path>
                </svg>
                {" "}Generating Shadow Core...
              </span>
            </button>
          </form>
          {/* SSO Divider */}
          <div className="relative flex items-center justify-center my-space-lg">
            <div className="w-full h-px bg-surface-container-high"></div>
            <span className="absolute px-space-sm bg-surface font-label-caps text-label-caps text-outline uppercase tracking-widest">
              Or sign up with
            </span>
          </div>
          {/* Native SSO Buttons */}
          <div className="grid grid-cols-2 gap-space-sm w-full">
            {/* Apple Native SSO */}
            <button className="h-12 w-full rounded-xl bg-surface-container-low hover:bg-surface-container-high text-on-surface font-headline-md text-body-sm font-semibold flex items-center justify-center gap-2 shadow-sm transition-colors active:scale-[0.98]" type="button">
              <svg className="w-4 h-4 fill-current mb-0.5" viewBox="0 0 170 170">
                <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.7-3.08-7.7-7.98-12-14.7-6.09-9.5-10.9-20.2-14.44-32.1-3.54-11.9-5.31-23.07-5.31-33.51 0-14.36 3.65-26.04 10.95-35.03 7.3-9 16.32-13.6 27.06-13.83 4.8 0 10.23 1.25 16.3 3.75 6.07 2.5 10.13 3.82 12.18 3.96 1.74-.23 5.92-1.6 12.54-4.11 6.62-2.5 12.08-3.65 16.39-3.44 12.78.65 22.95 5.56 30.51 14.75-11.13 6.75-16.6 15.93-16.42 27.53.18 9.09 3.65 16.79 10.42 23.1 6.77 6.3 14.65 10.1 23.63 11.4-2.28 6.94-5.07 14.49-8.35 22.65zm-29.08-111.4c0-7.39 2.65-14.28 7.95-20.67 5.3-6.39 12.01-10.41 20.13-12.06.33 1.3.49 2.5.49 3.59 0 7.39-2.83 14.52-8.49 21.39-5.65 6.87-12.44 10.82-20.37 11.85-.22-1.42-.33-2.79-.33-4.1z"></path>
              </svg>
              <span>
                Apple
              </span>
            </button>
            {/* Google Native SSO */}
            <button className="h-12 w-full rounded-xl bg-surface-container-low hover:bg-surface-container-high text-on-surface font-headline-md text-body-sm font-semibold flex items-center justify-center gap-2 shadow-sm transition-colors active:scale-[0.98]" type="button">
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"></path>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"></path>
              </svg>
              <span>
                Google
              </span>
            </button>
          </div>
          {/* Active Footnote / Login Direct Link */}
          <div className="mt-space-lg flex flex-col items-center justify-center gap-space-xs text-center">
            <p className="font-body-md text-body-sm text-on-surface-variant">
              Already have an athlete account?{" "}
              <Link className="text-primary hover:text-primary-fixed font-headline-md font-semibold ml-1 inline-flex items-center gap-0.5" href="/login">
                Log in{" "}
                <span className="material-symbols-outlined text-[16px]">
                  chevron_right
                </span>
              </Link>
            </p>
            {/* Biometric Hardware Sync Diagnostic Badge */}
            <div className="inline-flex items-center gap-2 mt-space-sm px-space-sm py-1 rounded bg-surface-container-lowest text-outline">
              <span className="w-1.5 h-1.5 rounded-full bg-secondary-fixed"></span>
              <span className="font-label-caps text-label-caps tracking-widest uppercase">
                READY FOR WEARABLE &amp; OPTICAL CALIBRATION
              </span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
