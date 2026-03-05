import type { Metadata, Viewport } from "next";
import "./globals.css";
import BottomNav from "@/components/BottomNav";
import TopBar from "@/components/TopBar";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#0a0a0f",
};

export const metadata: Metadata = {
  title: "ScoreNow — Live Football Scores",
  description:
    "Real-time football scores, live match updates, and embedded streams for every game.",
  keywords: ["football", "live scores", "soccer", "matches", "stream"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <div className="app-shell">
          <TopBar />
          <main className="page-content">{children}</main>
          <BottomNav />
        </div>
      </body>
    </html>
  );
}
