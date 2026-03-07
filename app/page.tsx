"use client";

import { useEffect, useState } from "react";
import { getMatches, getTodayDate, getUpcomingMatches, fetchRecentResults, filterMatchesByCuratedLeagues, Match } from "@/lib/sportsrc";
import LeagueGroupList from "@/components/LeagueGroupList";
import { LeagueSkeleton, LiveMatchSkeleton } from "@/components/MatchSkeleton";
import MatchCard from "@/components/MatchCard";

const REFRESH_INTERVAL = 90_000; // Increased to 90s to save quota

export default function HomePage() {
  const [liveMatches, setLiveMatches] = useState<Match[]>([]);
  const [upcomingMatches, setUpcomingMatches] = useState<Match[]>([]);
  const [pastMatches, setPastMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [liveLoading, setLiveLoading] = useState(false);

  const today = getTodayDate();

  // Initial load: Fetch everything with smaller ranges
  useEffect(() => {
    const initialLoad = async () => {
      try {
        const [live, upcoming, past] = await Promise.all([
          getMatches("inprogress", today),
          getUpcomingMatches(7), // Next 7 days for curated leagues
          fetchRecentResults(2),
        ]);
        setLiveMatches(filterMatchesByCuratedLeagues(live));
        // Show all upcoming (no league filter) so we display whatever the API returns
        setUpcomingMatches(upcoming);
        setPastMatches(filterMatchesByCuratedLeagues(past));
      } catch (err) {
        console.error("Initial load error:", err);
      } finally {
        setLoading(false);
      }
    };

    initialLoad();

    // Refresh loop: Only fetch LIVE matches to save API credits
    const timer = setInterval(async () => {
      try {
        setLiveLoading(true);
        const live = await getMatches("inprogress", today);
        setLiveMatches(filterMatchesByCuratedLeagues(live));
      } catch (err) {
        console.error("Refresh error:", err);
      } finally {
        setLiveLoading(false);
      }
    }, REFRESH_INTERVAL);

    return () => clearInterval(timer);
  }, [today]);

  const formattedDate = new Date().toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <div className="fade-in">
      {/* Date header */}
      <div className="section-header">
        <div>
          <div className="section-title">Today</div>
          <div className="section-subtitle">{formattedDate}</div>
        </div>
        {!loading && (liveMatches.length > 0 || liveLoading) && (
          <div className="live-badge">
            <span className="live-badge-dot" />
            {liveLoading ? "Updating..." : `${liveMatches.length} Live`}
          </div>
        )}
      </div>

      {loading ? (
        <LeagueSkeleton count={3} />
      ) : (
        <>
          {/* Live Matches */}
          <section style={{ marginBottom: 32 }}>
            {(liveMatches.length > 0 || liveLoading) && (
              <div style={{ padding: "4px 16px 8px" }}>
                <div className="live-badge" style={{ display: "inline-flex" }}>
                  <span className="live-badge-dot" />
                  Live Now
                </div>
              </div>
            )}

            {liveLoading && liveMatches.length === 0 ? (
              <LiveMatchSkeleton />
            ) : liveMatches.length > 0 ? (
              <LeagueGroupList matches={liveMatches} />
            ) : null}
          </section>

          {/* Upcoming Matches - Always show header if loading is done */}
          <section style={{ marginBottom: 32 }}>
            <div style={{ padding: "8px 16px 12px" }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text-muted)", letterSpacing: "0.5px", textTransform: "uppercase" }}>
                Upcoming (Next 7 Days)
              </span>
            </div>
            {upcomingMatches.length > 0 ? (
              <LeagueGroupList matches={upcomingMatches} />
            ) : (
              <div style={{ padding: "0 16px 16px", color: "var(--text-muted)", fontSize: 14 }}>
                No upcoming matches found for the next few days.
              </div>
            )}
          </section>

          {/* Recent Results */}
          {pastMatches.length > 0 && (
            <section style={{ marginBottom: 32 }}>
              <div style={{ padding: "8px 16px 12px" }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text-muted)", letterSpacing: "0.5px", textTransform: "uppercase" }}>
                  Recent Results (Last 3 Days)
                </span>
              </div>
              <LeagueGroupList matches={pastMatches} />
            </section>
          )}

          {!liveLoading && liveMatches.length === 0 && upcomingMatches.length === 0 && pastMatches.length === 0 && (
            <div className="empty-state">
              <div className="empty-icon">⚽</div>
              <div className="empty-title">No data available</div>
              <div className="empty-sub">Check back later for match updates</div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
