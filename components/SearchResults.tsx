"use client";

import { useEffect, useState } from "react";
import { getTodayDate, getMatches, Match } from "@/lib/sportsrc";
import MatchCard from "./MatchCard";

interface SearchResultsProps {
    query: string;
    onMatchClick?: () => void;
}

export default function SearchResults({ query, onMatchClick }: SearchResultsProps) {
    const [matches, setMatches] = useState<Match[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getMatches("all", getTodayDate()).then((data) => {
            setMatches(data);
            setLoading(false);
        });
    }, []);

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
        <div className="search-results-inline">
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
                    <MatchCard key={match.id} match={match} onClick={onMatchClick} />
                ))}
        </div>
    );
}
