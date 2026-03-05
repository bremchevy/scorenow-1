"use client";

import { useEffect, useState } from "react";
import { getMatches, getTodayDate, Match } from "@/lib/sportsrc";
import LeagueGroupList from "@/components/LeagueGroupList";
import { LeagueSkeleton } from "@/components/MatchSkeleton";

const REFRESH_INTERVAL = 15_000;

export default function LivePage() {
    const [matches, setMatches] = useState<Match[]>([]);
    const [loading, setLoading] = useState(true);

    const load = async () => {
        const data = await getMatches("inprogress", getTodayDate());
        setMatches(data);
        setLoading(false);
    };

    useEffect(() => {
        load();
        const timer = setInterval(load, REFRESH_INTERVAL);
        return () => clearInterval(timer);
    }, []);

    return (
        <div className="fade-in">
            <div className="section-header">
                <div>
                    <div className="section-title">Live Now</div>
                    <div className="section-subtitle">Refreshes every 15 seconds</div>
                </div>
                {!loading && matches.length > 0 && (
                    <div className="live-badge">
                        <span className="live-badge-dot" />
                        {matches.length} matches
                    </div>
                )}
            </div>

            {loading && <LeagueSkeleton count={2} />}

            {!loading && matches.length > 0 && (
                <LeagueGroupList matches={matches} />
            )}

            {!loading && matches.length === 0 && (
                <div className="empty-state">
                    <div className="empty-icon">📡</div>
                    <div className="empty-title">No live matches</div>
                    <div className="empty-sub">
                        Check the Home tab for upcoming fixtures — we&apos;ll update here when a match kicks off.
                    </div>
                </div>
            )}
        </div>
    );
}
