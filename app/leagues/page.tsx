"use client";

import { useEffect, useState } from "react";
import {
    getMatches,
    getTodayDate,
    getUpcomingMatches,
    fetchRecentResults,
    CURATED_LEAGUES,
    getMatchesForCuratedLeague,
    groupByLeague,
    Match,
} from "@/lib/sportsrc";
import MatchCard from "@/components/MatchCard";
import { LeagueSkeleton } from "@/components/MatchSkeleton";

export default function LeaguesPage() {
    const [grouped, setGrouped] = useState<Record<string, Match[]>>({});
    const [loading, setLoading] = useState(true);
    const [activeLeague, setActiveLeague] = useState<string | null>(CURATED_LEAGUES[0] ?? null);

    useEffect(() => {
        const today = getTodayDate();
        Promise.all([
            getMatches("all", today),
            getUpcomingMatches(14),
            fetchRecentResults(5),
        ]).then(([todayMatches, upcomingMatches, recentMatches]) => {
            const combined = [...todayMatches, ...upcomingMatches, ...recentMatches];
            setGrouped(groupByLeague(combined));
            setLoading(false);
        });
    }, []);

    const matchesForActive = activeLeague ? getMatchesForCuratedLeague(grouped, activeLeague) : [];

    return (
        <div className="fade-in">
            <div className="section-header">
                <div>
                    <div className="section-title">Leagues</div>
                    <div className="section-subtitle">All competitions</div>
                </div>
                {!loading && (
                    <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text-muted)" }}>
                        {CURATED_LEAGUES.length} leagues
                    </span>
                )}
            </div>

            {loading && <LeagueSkeleton count={4} />}

            {!loading && (
                <>
                    <div className="league-dropdown-wrap">
                        <label htmlFor="league-select" className="league-dropdown-label">
                            Choose league
                        </label>
                        <select
                            id="league-select"
                            className="league-dropdown"
                            value={activeLeague ?? ""}
                            onChange={(e) => setActiveLeague(e.target.value || null)}
                            aria-label="Select league"
                        >
                            {CURATED_LEAGUES.map((name) => {
                                const count = getMatchesForCuratedLeague(grouped, name).length;
                                return (
                                    <option key={name} value={name}>
                                        {name} ({count})
                                    </option>
                                );
                            })}
                        </select>
                    </div>

                    {activeLeague && (
                        <div className="fade-in">
                            <div className="league-header">
                                {matchesForActive[0]?.league.logo ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img
                                        src={matchesForActive[0].league.logo}
                                        alt={matchesForActive[0].league.name}
                                        className="league-logo"
                                    />
                                ) : (
                                    <span className="league-logo-placeholder">
                                        {activeLeague.charAt(0)}
                                    </span>
                                )}
                                <span className="league-name">{activeLeague}</span>
                                {matchesForActive[0]?.league.country && (
                                    <span className="league-country">{matchesForActive[0].league.country}</span>
                                )}
                                <span style={{ marginLeft: "auto", fontSize: 11, color: "var(--text-muted)", fontWeight: 600 }}>
                                    {matchesForActive.length} matches
                                </span>
                            </div>
                            {matchesForActive.length === 0 ? (
                                <div className="search-hint" style={{ padding: "24px 16px" }}>
                                    No matches in this period
                                </div>
                            ) : (
                                matchesForActive.map((match) => (
                                    <MatchCard key={match.id} match={match} />
                                ))
                            )}
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
