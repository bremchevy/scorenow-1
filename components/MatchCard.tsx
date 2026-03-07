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

function formatUpcomingDate(dateStr: string): string {
    if (!dateStr) return "";
    try {
        const d = new Date(dateStr + "T12:00:00");
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        d.setHours(0, 0, 0, 0);
        if (d.getTime() === today.getTime()) return "Today";
        if (d.getTime() === tomorrow.getTime()) return "Tomorrow";
        return d.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" });
    } catch {
        return dateStr;
    }
}

export default function MatchCard({ match, onClick }: MatchCardProps) {
    const isLive = match.status === "inprogress";
    const isFinished = match.status === "finished";
    const isUpcoming = match.status === "upcoming";

    const formatTime = (t?: string) => {
        if (!t) return "";
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
                        <span className="upcoming-datetime">
                            {formatUpcomingDate(match.date)}
                            {match.date && (match.time || formatTime(match.time)) ? " · " : ""}
                            {formatTime(match.time) || match.time || "--:--"}
                        </span>
                        <span className="dash-score">vs</span>
                    </>
                )}
            </div>
        </Link>
    );
}
