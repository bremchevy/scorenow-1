"use client";

import { useEffect, useState } from "react";
import {
    getMatches,
    getTodayDate,
    getUpcomingMatches,
    fetchRecentResults,
    getLeagues,
    ensureMajorLeaguesInGrouped,
    Match,
    groupByLeague,
} from "@/lib/sportsrc";
import MatchCard from "@/components/MatchCard";
import { LeagueSkeleton } from "@/components/MatchSkeleton";

/** Get league display name from group key (id__name or _placeholder__name) */
function leagueNameFromKey(key: string): string {
    if (key.startsWith("_placeholder__")) return key.replace("_placeholder__", "");
    const name = key.split("__")[1];
    return name ?? key;
}

/** Sort league keys A–Z by league name */
function sortLeagueKeysAtoZ(keys: string[]): string[] {
    return [...keys].sort((a, b) =>
        leagueNameFromKey(a).localeCompare(leagueNameFromKey(b), undefined, { sensitivity: "base" })
    );
}

export default function LeaguesPage() {
    const [grouped, setGrouped] = useState<Record<string, Match[]>>({});
    const [loading, setLoading] = useState(true);
    const [activeLeague, setActiveLeague] = useState<string | null>(null);

    useEffect(() => {
        const today = getTodayDate();
        Promise.all([
            getMatches("all", today),
            getUpcomingMatches(21),
            fetchRecentResults(7),
            getLeagues(),
        ]).then(([todayMatches, upcomingMatches, recentMatches, apiLeagues]) => {
            const combined = [...todayMatches, ...upcomingMatches, ...recentMatches];
            let g = groupByLeague(combined);
            if (apiLeagues.length > 0) {
                for (const league of apiLeagues) {
                    const key = `${league.id}__${league.name}`;
                    if (!g[key]) g[key] = [];
                }
            } else {
                g = ensureMajorLeaguesInGrouped(g);
            }
            setGrouped(g);
            const keys = sortLeagueKeysAtoZ(Object.keys(g));
            if (keys[0]) setActiveLeague(keys[0]);
            setLoading(false);
        });
    }, []);

    const leagueKeys = sortLeagueKeysAtoZ(Object.keys(grouped));

    return (
        <div className="fade-in">
            <div className="section-header">
                <div>
                    <div className="section-title">Leagues</div>
                    <div className="section-subtitle">All competitions</div>
                </div>
                {!loading && (
                    <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text-muted)" }}>
                        {leagueKeys.length} leagues
                    </span>
                )}
            </div>

            {loading && <LeagueSkeleton count={4} />}

            {!loading && leagueKeys.length === 0 && (
                <div className="empty-state">
                    <div className="empty-icon">🏆</div>
                    <div className="empty-title">No leagues found</div>
                    <div className="empty-sub">Check back when matches are scheduled</div>
                </div>
            )}

            {!loading && leagueKeys.length > 0 && (
                <>
                    {/* League dropdown */}
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
                            {leagueKeys.map((key) => {
                                const league = grouped[key][0]?.league;
                                const name = league?.name ?? leagueNameFromKey(key);
                                return (
                                    <option key={key} value={key}>
                                        {name} ({grouped[key].length})
                                    </option>
                                );
                            })}
                        </select>
                    </div>

                    {/* Active league matches */}
                    {activeLeague && grouped[activeLeague] && (
                        <div className="fade-in">
                            <div className="league-header">
                                {grouped[activeLeague][0]?.league.logo ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img
                                        src={grouped[activeLeague][0].league.logo}
                                        alt={grouped[activeLeague][0].league.name}
                                        className="league-logo"
                                    />
                                ) : (
                                    <span className="league-logo-placeholder">
                                        {leagueNameFromKey(activeLeague).charAt(0)}
                                    </span>
                                )}
                                <span className="league-name">{leagueNameFromKey(activeLeague)}</span>
                                {grouped[activeLeague][0]?.league.country && (
                                    <span className="league-country">{grouped[activeLeague][0].league.country}</span>
                                )}
                                <span style={{ marginLeft: "auto", fontSize: 11, color: "var(--text-muted)", fontWeight: 600 }}>
                                    {grouped[activeLeague].length} matches
                                </span>
                            </div>
                            {grouped[activeLeague].length === 0 ? (
                                <div className="search-hint" style={{ padding: "24px 16px" }}>
                                    No matches in this period
                                </div>
                            ) : (
                                grouped[activeLeague].map((match) => (
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
