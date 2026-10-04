"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import QuickCapture from "@/components/QuickCapture";

// Shared tab bar. Markup is the 5-tab variant from the Stitch "My Avatar" screen;
// the active tab gets the same classes Stitch applies via `data-active-classes`.
const TABS = [
  { href: "/home", icon: "home", label: "Home" },
  { href: "/sports", icon: "sprint", label: "Sports" },
  { href: "/avatar", icon: "accessibility_new", label: "My Avatar" },
  { href: "/sessions", icon: "history_toggle_off", label: "Sessions", also: ["/progress", "/compare"] },
  { href: "/profile", icon: "person", label: "Profile", also: ["/settings"] },
];

const BASE = "flex flex-col items-center justify-center min-w-[56px] min-h-[44px] py-1 transition-colors group";
const ACTIVE = "text-primary [&_span.indicator]:opacity-100 [&_.material-symbols-outlined]:text-primary";

/** `capture={false}` hides the floating record button (for screens with their own "new session" action). */
export default function BottomNav({ capture = true }: { capture?: boolean } = {}) {
  const pathname = usePathname();
  return (
    <>
    {capture && <QuickCapture />}
    <nav className="fixed bottom-0 inset-x-0 z-50 pb-safe bg-surface-container-lowest/85 backdrop-blur-xl shadow-[0_-4px_24px_rgba(0,0,0,0.6)]">
      <div className="flex items-center justify-around h-16 px-space-xs">
        {TABS.map((tab) => {
          const active = [tab.href, ...(tab.also ?? [])].some((p) => pathname === p || pathname.startsWith(p + "/"));
          return (
            <Link
              key={tab.href}
              href={tab.href}
              aria-current={active ? "page" : undefined}
              className={`${BASE} ${active ? ACTIVE : "text-on-surface-variant"}`}
            >
              <span className="material-symbols-outlined text-[22px] transition-transform group-hover:scale-110">{tab.icon}</span>
              <span className="font-label-caps text-label-caps uppercase mt-1">{tab.label}</span>
              <span className="indicator h-1 w-1 rounded-full bg-primary mt-0.5 opacity-0 transition-opacity"></span>
            </Link>
          );
        })}
      </div>
    </nav>
    </>
  );
}
