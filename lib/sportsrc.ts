const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

async function fetchSportsRC(params: Record<string, string>) {
    const cacheKey = JSON.stringify(params);
    const cached = cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        return cached.data;
    }

    const isDetail = params.type === "detail";
    const endpoint = isDetail ? "/api/detail" : "/api/matches";

    // When running on the client, we can use relative URLs.
    // In server components, you'd need the full absolute URL, but our fetch calls are mostly client-side.
    const url = new URL(endpoint, typeof window !== "undefined" ? window.location.origin : "http://localhost:3000");
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));

    const res = await fetch(url.toString());

    if (!res.ok) {
        console.error(`Local Proxy API error: ${res.status} ${res.statusText}`);
        return null;
    }

    const data = await res.json();
    cache.set(cacheKey, { data, timestamp: Date.now() });
    return data;
}

export type MatchStatus = "inprogress" | "upcoming" | "finished";

export interface Team {
    id: string;
    name: string;
    logo?: string;
}

export interface Match {
    id: string;
    homeTeam: Team;
    awayTeam: Team;
    homeScore: number | null;
    awayScore: number | null;
    status: MatchStatus;
    time?: string;      // e.g. "45'" or "FT"
    date: string;
    league: {
        id: string;
        name: string;
        country?: string;
        logo?: string;
    };
}

export interface MatchDetail extends Match {
    venue?: string;
    referee?: string;
    streamUrl?: string;
    homeFormation?: string;
    awayFormation?: string;
}

// Normalize raw API match objects into our typed structure
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeMatch(raw: any, leagueInfo?: any): Match {
    // Heuristics for team names
    const homeName = String(raw.teams?.home?.name ?? raw.home_name ?? raw.homeTeam?.name ?? raw.home_team_id?.name ?? raw.home_team_name ?? raw.home ?? "Home");
    const awayName = String(raw.teams?.away?.name ?? raw.away_name ?? raw.awayTeam?.name ?? raw.away_team_id?.name ?? raw.away_team_name ?? raw.away ?? "Away");

    // Heuristics for logos
    const homeLogo = raw.teams?.home?.badge ?? raw.teams?.home?.logo ?? raw.home_logo ?? raw.homeTeam?.logo ?? raw.home_team_logo;
    const awayLogo = raw.teams?.away?.badge ?? raw.teams?.away?.logo ?? raw.away_logo ?? raw.awayTeam?.logo ?? raw.away_team_logo;

    // Heuristics for scores
    const homeScoreVal = raw.score?.current?.home ?? raw.home_score ?? raw.home_team_score ?? raw.score?.home ?? (typeof raw.score === 'string' ? raw.score.split('-')[0] : null);
    const awayScoreVal = raw.score?.current?.away ?? raw.away_score ?? raw.away_team_score ?? raw.score?.away ?? (typeof raw.score === 'string' ? raw.score.split('-')[1] : null);

    // League info can come from parent object in nested responses
    const leagueData = leagueInfo || raw.league;

    return {
        id: String(raw.id ?? raw.match_id ?? raw.matchId ?? ""),
        homeTeam: {
            id: String(raw.teams?.home?.id ?? raw.home_id ?? raw.homeTeam?.id ?? raw.home_team_id ?? ""),
            name: homeName,
            logo: homeLogo,
        },
        awayTeam: {
            id: String(raw.teams?.away?.id ?? raw.away_id ?? raw.awayTeam?.id ?? raw.away_team_id ?? ""),
            name: awayName,
            logo: awayLogo,
        },
        homeScore: homeScoreVal !== null && homeScoreVal !== undefined ? Number(homeScoreVal) : null,
        awayScore: awayScoreVal !== null && awayScoreVal !== undefined ? Number(awayScoreVal) : null,
        status: String(raw.status ?? raw.match_status ?? "upcoming") as MatchStatus,
        time: String(raw.status_detail ?? raw.time ?? raw.match_time ?? raw.match_status_text ?? raw.status_text ?? raw.minute ?? ""),
        date: String(raw.date ?? raw.match_date ?? ""),
        league: {
            id: String(leagueData?.id ?? raw.league_id ?? ""),
            name: String(leagueData?.name ?? raw.league_name ?? "Unknown League"),
            country: leagueData?.country ? String(leagueData.country) : undefined,
            logo: leagueData?.logo ? String(leagueData.logo) : undefined,
        },
    };
}

export async function getMatches(
    status: MatchStatus | "all",
    date: string
): Promise<Match[]> {
    try {
        if (status === "all") {
            const [live, upcoming, finished] = await Promise.all([
                getMatches("inprogress", date),
                getMatches("upcoming", date),
                getMatches("finished", date),
            ]);
            return [...live, ...upcoming, ...finished];
        }

        const params: Record<string, string> = {
            type: "matches",
            sport: "football",
            status
        };

        // Date is not reliable for live matches and often results in 0 matches.
        if (status !== "inprogress" && date) {
            params.date = date;
        }

        const data = await fetchSportsRC(params);
        if (!data) return [];

        const rawData = data.data ?? data.matches ?? data;

        // Handle nested structure: data -> [ { league: {}, matches: [] } ]
        if (Array.isArray(rawData)) {
            const allMatches: Match[] = [];
            rawData.forEach((item: any) => {
                if (item.matches && Array.isArray(item.matches)) {
                    // This is the league-grouped format
                    item.matches.forEach((m: any) => {
                        allMatches.push(normalizeMatch(m, item.league));
                    });
                } else if (item.teams || item.home_name) {
                    // This is a direct match object format
                    allMatches.push(normalizeMatch(item));
                }
            });
            return allMatches;
        }

        return [];
    } catch (err) {
        console.error("getMatches error:", err);
        return [];
    }
}

/**
 * Helper to sleep between requests to avoid rate limits
 */
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Fetches upcoming matches for a range of days
 * @param days Number of days into the future to fetch
 */
export async function getUpcomingMatches(days: number = 7): Promise<Match[]> {
    const dates: string[] = [];
    const today = new Date();

    for (let i = 0; i <= days; i++) {
        const d = new Date(today);
        d.setDate(today.getDate() + i);
        dates.push(d.toISOString().split("T")[0]);
    }

    try {
        // Fetch matches for all dates sequentially with small delays to avoid 429s
        const allResults: Match[] = [];
        for (const date of dates) {
            const result = await getMatches("upcoming", date);
            if (result && result.length > 0) {
                allResults.push(...result);
            }
            // Small pause between requests
            await sleep(500);
        }

        return allResults;
    } catch (err) {
        console.error("getUpcomingMatches error:", err);
        return [];
    }
}

/**
 * Fetches recent results for a range of past days
 * @param days Number of days into the past to fetch
 */
export async function fetchRecentResults(days: number = 3): Promise<Match[]> {
    const dates: string[] = [];
    const today = new Date();

    for (let i = 1; i <= days; i++) {
        const d = new Date(today);
        d.setDate(today.getDate() - i);
        dates.push(d.toISOString().split("T")[0]);
    }

    try {
        const allResults: Match[] = [];
        for (const date of dates) {
            const result = await getMatches("finished", date);
            if (result && result.length > 0) {
                allResults.push(...result);
            }
            // Small pause
            await sleep(500);
        }
        return allResults;
    } catch (err) {
        console.error("fetchRecentResults error:", err);
        return [];
    }
}

export async function getMatchDetail(id: string): Promise<MatchDetail | null> {
    try {
        console.log(`[sportsrc] Fetching detail for: ${id}`);
        const fullData = await fetchSportsRC({ type: "detail", id });
        if (!fullData) return null;

        // Try to find the match info in various common nesting locations
        const mainData = fullData.data || fullData.match || fullData;
        const rawMatch = mainData.match_info || mainData.info?.match || mainData.match || (mainData.id === id ? mainData : null);

        if (!rawMatch) {
            console.error("[sportsrc] Could not find match_info in response:", fullData);
            // If it's a flat object that looks like a match, use it
            if (mainData.id || mainData.match_id || mainData.teams) {
                const base = normalizeMatch(mainData);
                return { ...base };
            }
            return null;
        }

        const base = normalizeMatch(rawMatch);

        // Extract stream from sources array
        const sources = mainData.sources || fullData.sources || [];
        const firstStream = sources.length > 0 ? (sources[0].embedUrl || sources[0].embed_url || sources[0].url) : null;

        // Extract extra info
        const info = mainData.info || fullData.info || {};
        const venueInfo = info.venue || rawMatch.venue || {};
        const refereeInfo = info.referee || rawMatch.referee;

        return {
            ...base,
            venue: String(venueInfo.stadium || venueInfo.name || venueInfo.venue_name || (typeof venueInfo === 'string' ? venueInfo : "") || ""),
            referee: String(refereeInfo?.name || (typeof refereeInfo === 'string' ? refereeInfo : "") || ""),
            streamUrl: String(firstStream || rawMatch.stream_url || rawMatch.stream || rawMatch.embed_url || ""),
        };
    } catch (err) {
        console.error("getMatchDetail error:", err);
        return null;
    }
}

export function getTodayDate(): string {
    return new Date().toISOString().split("T")[0];
}

/** Major leagues to always show in the Leagues page even if no matches in range */
export const MAJOR_LEAGUES = [
    "Premier League",
    "La Liga",
    "Serie A",
    "Bundesliga",
    "Ligue 1",
    "UEFA Champions League",
    "UEFA Europa League",
    "UEFA Europa Conference League",
    "FA Cup",
    "Carabao Cup",
    "Copa del Rey",
    "Coppa Italia",
    "Saudi Pro League",
    "MLS",
    "Eredivisie",
    "Liga Portugal",
    "Championship",
    "Scottish Premiership",
];

export interface LeagueInfo {
    id: string;
    name: string;
    country?: string;
    logo?: string;
}

/**
 * Try to fetch all leagues from the API (if supported).
 * Returns empty array if the API does not support type=leagues.
 */
export async function getLeagues(): Promise<LeagueInfo[]> {
    try {
        const data = await fetchSportsRC({ type: "leagues", sport: "football" });
        if (!data) return [];
        const raw = data.data ?? data.leagues ?? data;
        if (!Array.isArray(raw)) return [];
        return raw.map((item: any) => ({
            id: String(item.id ?? item.league_id ?? ""),
            name: String(item.name ?? item.league_name ?? "Unknown"),
            country: item.country ? String(item.country) : undefined,
            logo: item.logo ? String(item.logo) : undefined,
        })).filter((l: LeagueInfo) => l.id || l.name !== "Unknown");
    } catch {
        return [];
    }
}

/**
 * Ensures major leagues appear in grouped even when they have no matches in the fetched range.
 * Adds placeholder entries (empty match array) for each major league not already present.
 */
export function ensureMajorLeaguesInGrouped(grouped: Record<string, Match[]>): Record<string, Match[]> {
    const out = { ...grouped };
    const existingNames = new Set(
        Object.keys(out).map((k) => (k.startsWith("_placeholder__") ? k.replace("_placeholder__", "") : k.split("__")[1] ?? ""))
    );
    for (const name of MAJOR_LEAGUES) {
        if (existingNames.has(name)) continue;
        const key = `_placeholder__${name}`;
        if (!out[key]) out[key] = [];
        existingNames.add(name);
    }
    return out;
}

const TOP_LEAGUES = [
    "Premier League",
    "La Liga",
    "Serie A",
    "Bundesliga",
    "Ligue 1",
    "UEFA Champions League",
    "UEFA Europa League",
    "FA Cup",
    "Carabao Cup",
    "Copa del Rey",
    "Coppa Italia",
    "Saudi Pro League",
    "MLS",
];

export function groupByLeague(matches: Match[]): Record<string, Match[]> {
    // 1. Group raw matches into an object
    const rawGrouped = matches.reduce(
        (acc, match) => {
            const key = `${match.league.id}__${match.league.name}`;
            if (!acc[key]) acc[key] = [];
            acc[key].push(match);
            return acc;
        },
        {} as Record<string, Match[]>
    );

    // 2. Sort the keys with TOP_LEAGUES prioritized
    const sortedKeys = Object.keys(rawGrouped).sort((a, b) => {
        const nameA = a.split("__")[1] || "";
        const nameB = b.split("__")[1] || "";

        let indexA = TOP_LEAGUES.findIndex((l) => nameA.includes(l));
        let indexB = TOP_LEAGUES.findIndex((l) => nameB.includes(l));

        // If not in top leagues, assign a high index to push them down
        if (indexA === -1) indexA = 999;
        if (indexB === -1) indexB = 999;

        // Both in top leagues or neither in top leagues
        if (indexA !== indexB) {
            return indexA - indexB;
        }

        // If both have the same priority (e.g., both 999), sort alphabetically
        return nameA.localeCompare(nameB);
    });

    // 3. Rebuild object in sorted order
    const sortedGrouped: Record<string, Match[]> = {};
    for (const key of sortedKeys) {
        sortedGrouped[key] = rawGrouped[key];
    }

    return sortedGrouped;
}
