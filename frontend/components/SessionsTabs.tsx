import Link from "next/link";

// Segmented switch at the top of the Sessions tab: the session list vs. the progress tracker.
export default function SessionsTabs({ active }: { active: "history" | "progress" }) {
  const tab = (key: "history" | "progress", href: string, label: string, icon: string) => (
    <Link
      href={href}
      aria-current={active === key ? "page" : undefined}
      className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg font-label-caps text-label-caps uppercase tracking-wider transition-colors ${active === key ? "bg-surface-container-highest text-primary" : "text-on-surface-variant"}`}
    >
      <span className="material-symbols-outlined text-[16px]">{icon}</span>
      {label}
    </Link>
  );
  return (
    <div className="flex p-1 rounded-xl bg-surface-container-low">
      {tab("history", "/sessions", "History", "history")}
      {tab("progress", "/progress", "Progress", "monitoring")}
    </div>
  );
}
