"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

// Re-mounts on every navigation: fades the new screen in and resets scroll to the top
// (the desktop phone frame scrolls an inner container, which Next.js doesn't reset itself).
export default function Template({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  useEffect(() => {
    document.getElementById("app-scroll")?.scrollTo(0, 0);
  }, [pathname]);
  return <div className="screen-enter">{children}</div>;
}
