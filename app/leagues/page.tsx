"use client";

import { useEffect, useState } from "react";
import { getMatches, getTodayDate, Match, groupByLeague } from "@/lib/sportsrc";
import MatchCard from "@/components/MatchCard";
import { LeagueSkeleton } from "@/components/MatchSkeleton";

export default function LeaguesPage() {
    const [grouped, setGrouped] = useState<Record<string, Match[]>>({});
    const [loading, setLoading] = useState(true);
    const [activeLeague, setActiveLeague] = useState<string | null>(null);

    useEffect(() => {
        getMatches("all", getTodayDate()).then((matches) => {
            const g = groupByLeague(matches);
            setGrouped(g);
            // default to first league
            const first = Object.keys(g)[0];
            if (first) setActiveLeague(first);
            setLoading(false);
        });
    }, []);

    const leagueKeys = Object.keys(grouped);

    return (
        <div className="fade-in">
            <div className="section-header">
                <div>
                    <div className="section-title">Leagues</div>
                    <div className="section-subtitle">All competitions today</div>
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
                    {/* League pill selector */}
                    <div className="date-pill-row">
                        {leagueKeys.map((key) => {
                            const league = grouped[key][0]?.league;
                            return (
                                <button
                                    key={key}
                                    className={`date-pill${activeLeague === key ? " active" : ""}`}
                                    onClick={() => setActiveLeague(key)}
                                    style={{ cursor: "pointer", fontFamily: "inherit", border: activeLeague === key ? "none" : undefined }}
                                >
                                    {league?.name ?? key.split("__")[1]}
                                </button>
                            );
                        })}
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
                                        {grouped[activeLeague][0]?.league.name.charAt(0)}
                                    </span>
                                )}
                                <span className="league-name">{grouped[activeLeague][0]?.league.name}</span>
                                {grouped[activeLeague][0]?.league.country && (
                                    <span className="league-country">{grouped[activeLeague][0]?.league.country}</span>
                                )}
                                <span style={{ marginLeft: "auto", fontSize: 11, color: "var(--text-muted)", fontWeight: 600 }}>
                                    {grouped[activeLeague].length} matches
                                </span>
                            </div>
                            {grouped[activeLeague].map((match) => (
                                <MatchCard key={match.id} match={match} />
                            ))}
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
