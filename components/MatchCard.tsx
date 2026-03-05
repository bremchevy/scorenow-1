import Link from "next/link";
import Image from "next/image";
import { Match } from "@/lib/sportsrc";

interface MatchCardProps {
    match: Match;
    onClick?: () => void;
}

function TeamLogo({ src, name }: { src?: string; name: string }) {
    if (src) {
        return (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={src} alt={name} className="team-logo" width={20} height={20} />
        );
    }
    return (
        <span className="team-logo-placeholder">
            {name.charAt(0).toUpperCase()}
        </span>
    );
}

export default function MatchCard({ match, onClick }: MatchCardProps) {
    const isLive = match.status === "inprogress";
    const isFinished = match.status === "finished";
    const isUpcoming = match.status === "upcoming";

    const formatTime = (t?: string) => {
        if (!t) return "";
        // Try to format as HH:MM if it's an ISO time or just return as-is
        if (t.includes("T")) {
            try {
                return new Date(t).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
            } catch {
                return t;
            }
        }
        return t;
    };

    return (
        <Link
            href={`/match/${match.id}`}
            className={`match-card${isLive ? " live" : ""}`}
            onClick={onClick}
        >
            {/* Teams column */}
            <div className="match-card-teams">
                <div className="match-team-row">
                    <TeamLogo src={match.homeTeam.logo} name={match.homeTeam.name} />
                    <span className="team-name">{match.homeTeam.name}</span>
                </div>
                <div className="match-team-row">
                    <TeamLogo src={match.awayTeam.logo} name={match.awayTeam.name} />
                    <span className="team-name">{match.awayTeam.name}</span>
                </div>
            </div>

            {/* Center: score / time */}
            <div className="match-card-center">
                {isLive && (
                    <>
                        <div className="score-display">
                            <span>{match.homeScore ?? 0}</span>
                            <span className="score-sep">-</span>
                            <span>{match.awayScore ?? 0}</span>
                        </div>
                        <span className="match-time-label live-time">
                            {match.time ? `${match.time}` : "LIVE"}
                        </span>
                    </>
                )}
                {isFinished && (
                    <>
                        <div className="score-display">
                            <span>{match.homeScore ?? 0}</span>
                            <span className="score-sep">-</span>
                            <span>{match.awayScore ?? 0}</span>
                        </div>
                        <span className="ft-badge">FT</span>
                    </>
                )}
                {isUpcoming && (
                    <>
                        <span className="upcoming-time">{formatTime(match.time) || "--:--"}</span>
                        <span className="dash-score">vs</span>
                    </>
                )}
            </div>
        </Link>
    );
}
