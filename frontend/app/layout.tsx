import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ShadowAthlete",
  description: "Your only opponent is you. AI-powered multi-sport athlete digital twin.",
  appleWebApp: { capable: true, statusBarStyle: "black-translucent", title: "ShadowAthlete" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#10141a",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body>
        <div className="app-frame" id="app-frame">
          <div className="app-scroll" id="app-scroll">
            {children}
          </div>
        </div>
      </body>
    </html>
  );
}
