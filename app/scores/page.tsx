"use client";

import { useEffect, useState } from "react";
import { getMatches, getTodayDate, filterMatchesByCuratedLeagues, Match } from "@/lib/sportsrc";
import LeagueGroupList from "@/components/LeagueGroupList";
import { LeagueSkeleton } from "@/components/MatchSkeleton";

export default function ScoresPage() {
    const [matches, setMatches] = useState<Match[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getMatches("finished", getTodayDate()).then((data) => {
            setMatches(filterMatchesByCuratedLeagues(data));
            setLoading(false);
        });
    }, []);

    return (
        <div className="fade-in">
            <div className="section-header">
                <div>
                    <div className="section-title">Results</div>
                    <div className="section-subtitle">Today&apos;s finished matches</div>
                </div>
                {!loading && matches.length > 0 && (
                    <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text-muted)" }}>
                        {matches.length} matches
                    </span>
                )}
            </div>

            {loading && <LeagueSkeleton count={3} />}

            {!loading && matches.length > 0 && (
                <LeagueGroupList matches={matches} />
            )}

            {!loading && matches.length === 0 && (
                <div className="empty-state">
                    <div className="empty-icon">🏁</div>
                    <div className="empty-title">No results yet</div>
                    <div className="empty-sub">Results will appear here once matches are finished</div>
                </div>
            )}
        </div>
    );
}
