import type { Metadata, Viewport } from "next";
import "./globals.css";
import BottomNav from "@/components/BottomNav";
import AppShell from "@/components/AppShell";
import { ThemeProvider } from "@/components/ThemeProvider";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#f5f5f7",
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
    <html lang="en" suppressHydrationWarning>
      <body>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){var t=localStorage.getItem("scorenow-theme");var v=["light","dark","blue","red","green","purple"];if(t&&v.indexOf(t)!==-1){document.documentElement.setAttribute("data-theme",t);}else{document.documentElement.setAttribute("data-theme","light");}})();`,
          }}
        />
        <ThemeProvider>
          <div className="app-bg" aria-hidden />
          <div className="app-shell">
            <AppShell>{children}</AppShell>
            <BottomNav />
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
