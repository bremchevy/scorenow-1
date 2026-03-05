"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getMatchDetail, MatchDetail } from "@/lib/sportsrc";
import StreamEmbed from "@/components/StreamEmbed";
import Link from "next/link";

function TeamLogo({ src, name, large }: { src?: string; name: string; large?: boolean }) {
    const size = large ? 56 : 20;
    if (src) {
        return (
            // eslint-disable-next-line @next/next/no-img-element
            <img
                src={src}
                alt={name}
                className={large ? "detail-team-logo" : "team-logo"}
                style={{ width: size, height: size }}
            />
        );
    }
    return (
        <span className={large ? "detail-team-logo-placeholder" : "team-logo-placeholder"}>
            {name.charAt(0).toUpperCase()}
        </span>
    );
}

function StatusBadge({ match }: { match: MatchDetail }) {
    if (match.status === "inprogress") {
        return (
            <div className="live-badge">
                <span className="live-badge-dot" />
                {match.time ? `${match.time}'` : "Live"}
            </div>
        );
    }
    if (match.status === "finished") {
        return <span className="ft-badge" style={{ fontSize: 12, padding: "4px 10px", background: "var(--bg-surface-2)", borderRadius: 20, border: "1px solid var(--border)" }}>Full Time</span>;
    }
    return (
        <span style={{ fontSize: 13, color: "var(--text-muted)", fontWeight: 600 }}>
            {match.time || "Upcoming"}
        </span>
    );
}

export default function MatchDetailPage() {
    const params = useParams();
    const router = useRouter();
    const id = typeof params.id === "string" ? params.id : Array.isArray(params.id) ? params.id[0] : "";
    const [match, setMatch] = useState<MatchDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);

    useEffect(() => {
        if (!id) return;
        console.log(`[MatchDetailPage] Loading ID: ${id}`);
        getMatchDetail(id).then((data) => {
            console.log(`[MatchDetailPage] Data received:`, data);
            if (!data) {
                console.error(`[MatchDetailPage] Could not fetch data for ID: ${id}`);
                setNotFound(true);
            } else {
                setMatch(data);
            }
            setLoading(false);
        });
    }, [id]);

    if (loading) {
        return (
            <div style={{ padding: "20px 16px" }}>
                <div className="skeleton" style={{ width: 80, height: 14, marginBottom: 24 }} />
                <div className="skeleton" style={{ width: "100%", height: 200, borderRadius: 16 }} />
                <div style={{ marginTop: 24, display: "flex", flexDirection: "column", gap: 12 }}>
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="skeleton" style={{ width: "100%", height: 48 }} />
                    ))}
                </div>
            </div>
        );
    }

    if (notFound || !match) {
        return (
            <div className="empty-state">
                <div className="empty-icon">❓</div>
                <div className="empty-title">Match not found</div>
                <div className="empty-sub">This match may have been removed or the ID is invalid.</div>
                <Link href="/" className="back-btn" style={{ marginTop: 12 }}>← Back to Home</Link>
            </div>
        );
    }

    const hasScore = match.homeScore !== null && match.awayScore !== null;

    return (
        <div className="fade-in">
            {/* Back nav */}
            <div style={{ padding: "12px 16px 0" }}>
                <button className="back-btn" onClick={() => router.back()}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="m15 18-6-6 6-6" />
                    </svg>
                    Back
                </button>
            </div>

            {/* Hero */}
            <div className="detail-hero">
                {/* League */}
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
                    {match.league.logo ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={match.league.logo} alt={match.league.name} style={{ width: 18, height: 18, borderRadius: 3, objectFit: "contain" }} />
                    ) : null}
                    <span style={{ fontSize: 12, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.4px" }}>
                        {match.league.name}
                    </span>
                    {match.league.country && (
                        <span style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 500 }}>
                            · {match.league.country}
                        </span>
                    )}
                </div>

                {/* Teams + Score */}
                <div className="detail-teams">
                    <div className="detail-team">
                        <TeamLogo src={match.homeTeam.logo} name={match.homeTeam.name} large />
                        <span className="detail-team-name">{match.homeTeam.name}</span>
                    </div>

                    <div className="detail-score-center">
                        {hasScore ? (
                            <div className="detail-score">
                                <span>{match.homeScore}</span>
                                <span className="detail-score-dash"> – </span>
                                <span>{match.awayScore}</span>
                            </div>
                        ) : (
                            <div style={{ fontSize: 28, fontWeight: 800, color: "var(--text-muted)" }}>vs</div>
                        )}
                        <StatusBadge match={match} />
                    </div>

                    <div className="detail-team">
                        <TeamLogo src={match.awayTeam.logo} name={match.awayTeam.name} large />
                        <span className="detail-team-name">{match.awayTeam.name}</span>
                    </div>
                </div>

                {/* Meta chips */}
                <div className="detail-meta-row">
                    {match.venue && (
                        <div className="detail-meta-chip">
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                                <circle cx="12" cy="10" r="3" />
                            </svg>
                            {match.venue}
                        </div>
                    )}
                    {match.referee && (
                        <div className="detail-meta-chip">
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                <circle cx="12" cy="7" r="4" />
                            </svg>
                            {match.referee}
                        </div>
                    )}
                    {match.date && (
                        <div className="detail-meta-chip">
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                                <line x1="16" y1="2" x2="16" y2="6" />
                                <line x1="8" y1="2" x2="8" y2="6" />
                                <line x1="3" y1="10" x2="21" y2="10" />
                            </svg>
                            {match.date}
                        </div>
                    )}
                </div>
            </div>

            {/* Stream Section */}
            <div className="stream-section">
                <div className="info-section-title" style={{ marginBottom: 12 }}>Live Stream</div>
                {match.streamUrl ? (
                    <StreamEmbed streamUrl={match.streamUrl} />
                ) : (
                    <div className="no-stream">
                        <div className="no-stream-icon">📺</div>
                        <div className="no-stream-text">
                            {match.status === "upcoming"
                                ? "Stream will be available when the match starts"
                                : "No stream available for this match"}
                        </div>
                    </div>
                )}
            </div>

            {/* Match Info */}
            {(match.venue || match.referee) && (
                <div className="info-section">
                    <div className="info-section-title">Match Info</div>
                    {match.venue && (
                        <div className="info-row">
                            <span className="info-label">Venue</span>
                            <span className="info-value">{match.venue}</span>
                        </div>
                    )}
                    {match.referee && (
                        <div className="info-row">
                            <span className="info-label">Referee</span>
                            <span className="info-value">{match.referee}</span>
                        </div>
                    )}
                    {match.date && (
                        <div className="info-row">
                            <span className="info-label">Date</span>
                            <span className="info-value">{match.date}</span>
                        </div>
                    )}
                    <div className="info-row">
                        <span className="info-label">Status</span>
                        <span className="info-value" style={{ textTransform: "capitalize" }}>
                            {match.status === "inprogress" ? "In Progress" : match.status}
                        </span>
                    </div>
                </div>
            )}

            {/* Bottom spacer */}
            <div style={{ height: 24 }} />
        </div>
    );
}
