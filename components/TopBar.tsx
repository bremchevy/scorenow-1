"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import SearchOverlay from "./SearchOverlay";

const pageTitles: Record<string, string> = {
    "/": "ScoreNow",
    "/live": "Live Now",
    "/scores": "Scores",
    "/leagues": "Leagues",
};

export default function TopBar() {
    const pathname = usePathname();
    const [searchOpen, setSearchOpen] = useState(false);

    const isMatch = pathname.startsWith("/match/");
    const titleKey = isMatch ? "/match" : pathname;
    const rawTitle = pageTitles[titleKey] ?? "ScoreNow";

    return (
        <>
            <header className="top-bar">
                <div className="top-bar-title">
                    {rawTitle === "ScoreNow" ? (
                        <>Score<span>Now</span></>
                    ) : (
                        rawTitle
                    )}
                </div>
                <div className="top-bar-actions">
                    <button
                        className="icon-btn"
                        onClick={() => setSearchOpen(true)}
                        aria-label="Search matches"
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="11" cy="11" r="8" />
                            <path d="m21 21-4.35-4.35" />
                        </svg>
                    </button>
                </div>
            </header>
            {searchOpen && <SearchOverlay onClose={() => setSearchOpen(false)} />}
        </>
    );
}
