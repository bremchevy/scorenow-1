"use client";

import { useEffect, useRef, useState } from "react";
import { getTodayDate, getMatches, Match } from "@/lib/sportsrc";
import MatchCard from "./MatchCard";

interface SearchOverlayProps {
    onClose: () => void;
}

export default function SearchOverlay({ onClose }: SearchOverlayProps) {
    const [query, setQuery] = useState("");
    const [matches, setMatches] = useState<Match[]>([]);
    const [loading, setLoading] = useState(true);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        inputRef.current?.focus();
        getMatches("all", getTodayDate()).then((data) => {
            setMatches(data);
            setLoading(false);
        });
    }, []);

    // Close on Escape
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, [onClose]);

    const q = query.trim().toLowerCase();
    const filtered =
        q.length >= 1
            ? matches.filter(
                (m) =>
                    m.homeTeam.name.toLowerCase().includes(q) ||
                    m.awayTeam.name.toLowerCase().includes(q) ||
                    m.league.name.toLowerCase().includes(q)
            )
            : [];

    return (
        <div className="search-overlay">
            <div className="search-header">
                <div className="search-input-wrap">
                    <span className="search-input-icon">
                        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="11" cy="11" r="8" />
                            <path d="m21 21-4.35-4.35" />
                        </svg>
                    </span>
                    <input
                        ref={inputRef}
                        type="text"
                        className="search-input"
                        placeholder="Team or league..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                    />
                    {query && (
                        <button
                            style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", lineHeight: 1, padding: "0 2px" }}
                            onClick={() => setQuery("")}
                            aria-label="Clear"
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                            </svg>
                        </button>
                    )}
                </div>
                <button className="search-cancel" onClick={onClose}>Cancel</button>
            </div>

            <div className="search-results">
                {loading && (
                    <div className="search-hint">Loading matches…</div>
                )}
                {!loading && q.length === 0 && (
                    <div className="search-hint">Search by team or league name</div>
                )}
                {!loading && q.length > 0 && filtered.length === 0 && (
                    <div className="search-hint">No results for &ldquo;{query}&rdquo;</div>
                )}
                {!loading &&
                    filtered.map((match) => (
                        <MatchCard key={match.id} match={match} onClick={onClose} />
                    ))}
            </div>
        </div>
    );
}
