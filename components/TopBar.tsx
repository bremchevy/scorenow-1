"use client";

import { useRef, useEffect } from "react";
import { usePathname } from "next/navigation";

const pageTitles: Record<string, string> = {
    "/": "ScoreNow",
    "/live": "Live Now",
    "/scores": "Scores",
    "/leagues": "Leagues",
};

interface TopBarProps {
    searchOpen: boolean;
    onOpenSearch: () => void;
    onCloseSearch: () => void;
    searchQuery: string;
    onSearchQueryChange: (value: string) => void;
}

export default function TopBar({
    searchOpen,
    onOpenSearch,
    onCloseSearch,
    searchQuery,
    onSearchQueryChange,
}: TopBarProps) {
    const pathname = usePathname();
    const inputRef = useRef<HTMLInputElement>(null);

    const isMatch = pathname.startsWith("/match/");
    const titleKey = isMatch ? "/match" : pathname;
    const rawTitle = pageTitles[titleKey] ?? "ScoreNow";

    useEffect(() => {
        if (searchOpen) {
            inputRef.current?.focus();
        }
    }, [searchOpen]);

    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (e.key === "Escape") onCloseSearch();
        };
        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, [onCloseSearch]);

    return (
        <header className={`top-bar ${searchOpen ? "top-bar--search-open" : ""}`}>
            {searchOpen ? (
                <>
                    <div className="top-bar-search-wrap">
                        <span className="search-input-icon" aria-hidden>
                            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="11" cy="11" r="8" />
                                <path d="m21 21-4.35-4.35" />
                            </svg>
                        </span>
                        <input
                            ref={inputRef}
                            type="search"
                            className="top-bar-search-input"
                            placeholder="Team or league..."
                            value={searchQuery}
                            onChange={(e) => onSearchQueryChange(e.target.value)}
                            aria-label="Search matches"
                        />
                        {searchQuery && (
                            <button
                                type="button"
                                className="top-bar-search-clear"
                                onClick={() => onSearchQueryChange("")}
                                aria-label="Clear search"
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                                    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                                </svg>
                            </button>
                        )}
                    </div>
                    <button type="button" className="search-cancel" onClick={onCloseSearch}>
                        Cancel
                    </button>
                </>
            ) : (
                <>
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
                            onClick={onOpenSearch}
                            aria-label="Search matches"
                        >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="11" cy="11" r="8" />
                                <path d="m21 21-4.35-4.35" />
                            </svg>
                        </button>
                    </div>
                </>
            )}
        </header>
    );
}
