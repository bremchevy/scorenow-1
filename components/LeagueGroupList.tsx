import { Match, groupByLeague } from "@/lib/sportsrc";
import MatchCard from "./MatchCard";

interface LeagueGroupListProps {
    matches: Match[];
}

function LeagueHeader({ leagueKey, matches }: { leagueKey: string; matches: Match[] }) {
    const league = matches[0]?.league;
    if (!league) return null;

    return (
        <div className="league-header">
            <div className="glass-highlight" aria-hidden />
            {league.logo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={league.logo} alt={league.name} className="league-logo" />
            ) : (
                <span className="league-logo-placeholder">
                    {league.name.charAt(0)}
                </span>
            )}
            <span className="league-name">{league.name}</span>
            {league.country && (
                <span className="league-country">{league.country}</span>
            )}
        </div>
    );
}

export default function LeagueGroupList({ matches }: LeagueGroupListProps) {
    const grouped = groupByLeague(matches);
    const entries = Object.entries(grouped);

    if (entries.length === 0) return null;

    return (
        <>
            {entries.map(([key, leagueMatches]) => (
                <div key={key} className="league-group fade-in">
                    <LeagueHeader leagueKey={key} matches={leagueMatches} />
                    {leagueMatches.map((match) => (
                        <MatchCard key={match.id} match={match} />
                    ))}
                </div>
            ))}
        </>
    );
}
