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

    console.log("[sportsrc] fetch", params);
    const res = await fetch(url.toString());

    if (!res.ok) {
        console.warn("[sportsrc] fetch not ok", { url: url.toString(), status: res.status, statusText: res.statusText });
        if (res.status >= 500) {
            console.error(`Local Proxy API error: ${res.status} ${res.statusText}`);
        }
        return null;
    }

    const data = await res.json();
    const dataArray = data?.data ?? data?.matches ?? (Array.isArray(data) ? data : null);
    const matchCount = Array.isArray(dataArray) ? dataArray.length : 0;
    console.log("[sportsrc] response", { ...params, matchCount, hasData: !!data });
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

    // For upcoming matches, derive date/time from timestamp if present (so we can sort and display)
    const ts = raw.timestamp ?? raw.match_timestamp;
    let dateStr = String(raw.date ?? raw.match_date ?? "");
    let timeStr = String(raw.status_detail ?? raw.time ?? raw.match_time ?? raw.match_status_text ?? raw.status_text ?? raw.minute ?? "");
    if (ts && (raw.status === "upcoming" || raw.match_status === "upcoming")) {
        try {
            const d = new Date(Number(ts));
            dateStr = d.toISOString().split("T")[0];
            timeStr = d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", hour12: false });
        } catch {
            // keep existing dateStr/timeStr
        }
    }

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
        time: timeStr,
        date: dateStr,
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
        if (!data) {
            console.log("[sportsrc] getMatches no data", { status, date });
            return [];
        }

        // API can return: { data: [...] } or { data: { leagues: [...] } } or { data: { ... } }; extract league-group array
        let rawData: unknown = data.data ?? data.matches ?? data.results ?? data.fixtures ?? data.events ?? data;
        if (Array.isArray(data.data)) rawData = data.data;
        if (rawData && typeof rawData === "object" && !Array.isArray(rawData)) {
            const obj = rawData as Record<string, unknown>;
            const inner = obj.data ?? obj.leagues ?? obj.matches ?? obj.results ?? obj.fixtures ?? obj.events;
            if (Array.isArray(inner)) rawData = inner;
            else {
                // Find first value that is an array of league-group objects (have .league and .matches)
                for (const v of Object.values(obj)) {
                    if (Array.isArray(v) && v.length > 0 && v.some((x: any) => x?.league && Array.isArray(x?.matches))) {
                        rawData = v;
                        break;
                    }
                }
            }
        }

        console.log("[sportsrc] getMatches raw", { status, date, isArray: Array.isArray(rawData), length: Array.isArray(rawData) ? rawData.length : "n/a" });

        // Handle nested structure: data -> [ { league: {}, matches: [] } ]
        if (Array.isArray(rawData)) {
            const allMatches: Match[] = [];
            rawData.forEach((item: any) => {
                if (item && item.matches && Array.isArray(item.matches)) {
                    item.matches.forEach((m: any) => {
                        allMatches.push(normalizeMatch(m, item.league));
                    });
                } else if (item && (item.teams || item.home_name)) {
                    allMatches.push(normalizeMatch(item));
                }
            });
            console.log("[sportsrc] getMatches parsed", { status, date, count: allMatches.length });
            return allMatches;
        }

        const rawKeys = typeof rawData === "object" && rawData !== null ? Object.keys(rawData).join(", ") : "";
        const topKeys = typeof data === "object" && data !== null ? Object.keys(data).join(", ") : "";
        console.log("[sportsrc] getMatches rawData not array", { status, date, rawKeys, topLevelKeys: topKeys });

        // rawData may be data.data (object with 5 keys) – find any array inside it
        let fallbackArray: any[] | null = null;
        const obj = (rawData === data ? (data as any)?.data : rawData) ?? rawData;
        if (obj && typeof obj === "object" && !Array.isArray(obj)) {
            for (const v of Object.values(obj)) {
                if (!Array.isArray(v) || v.length === 0) continue;
                const first = v[0];
                if (first && typeof first === "object") {
                    if ((first as any).matches && Array.isArray((first as any).matches)) {
                        fallbackArray = v as any[];
                        break;
                    }
                    if ((first as any).teams || (first as any).league) {
                        fallbackArray = v as any[];
                        break;
                    }
                }
            }
            if (!fallbackArray && typeof obj === "object") {
                const allArrs = (Object.values(obj) as any[]).filter((v) => Array.isArray(v) && v.length > 0);
                if (allArrs.length > 0) fallbackArray = allArrs.flat();
            }
        }
        if (fallbackArray && fallbackArray.length > 0) {
            const allMatches: Match[] = [];
            fallbackArray.forEach((item: any) => {
                if (item && item.matches && Array.isArray(item.matches)) {
                    item.matches.forEach((m: any) => allMatches.push(normalizeMatch(m, item.league)));
                } else if (item && (item.teams || item.home_name)) {
                    allMatches.push(normalizeMatch(item));
                }
            });
            console.log("[sportsrc] getMatches parsed (fallback)", { status, date, count: allMatches.length });
            return allMatches;
        }
        return [];
    } catch (err) {
        console.error("[sportsrc] getMatches error:", err);
        return [];
    }
}

/**
 * Helper to sleep between requests to avoid rate limits
 */
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Fetches upcoming matches. Tries without date first (some APIs return "next N" upcoming);
 * if empty, fetches by date range.
 * @param days Number of days into the future when using date range
 */
export async function getUpcomingMatches(days: number = 7): Promise<Match[]> {
    const today = new Date();

    try {
        // Try without date first – some APIs return all upcoming matches in one call
        console.log("[sportsrc] getUpcomingMatches: trying without date first");
        const withoutDate = await getMatches("upcoming", "");
        if (withoutDate && withoutDate.length > 0) {
            console.log("[sportsrc] getUpcomingMatches: got", withoutDate.length, "from no-date request");
            const sorted = [...withoutDate].sort((a, b) => {
                const d = (a.date || "").localeCompare(b.date || "");
                if (d !== 0) return d;
                return (a.time || "").localeCompare(b.time || "");
            });
            return sorted;
        }

        console.log("[sportsrc] getUpcomingMatches: no-date empty, falling back to date range (days=" + days + ")");
        // Fallback: fetch by date for each of the next N days
        const dates: string[] = [];
        for (let i = 0; i <= days; i++) {
            const d = new Date(today);
            d.setDate(today.getDate() + i);
            dates.push(d.toISOString().split("T")[0]);
        }

        const allResults: Match[] = [];
        const seenIds = new Set<string>();
        for (const date of dates) {
            const result = await getMatches("upcoming", date);
            if (result && result.length > 0) {
                for (const m of result) {
                    if (!seenIds.has(m.id)) {
                        seenIds.add(m.id);
                        allResults.push(m);
                    }
                }
            }
            await sleep(500);
        }
        allResults.sort((a, b) => {
            const d = (a.date || "").localeCompare(b.date || "");
            if (d !== 0) return d;
            return (a.time || "").localeCompare(b.time || "");
        });
        console.log("[sportsrc] getUpcomingMatches: date range total", allResults.length, "dates tried:", dates.length);
        return allResults;
    } catch (err) {
        console.error("[sportsrc] getUpcomingMatches error:", err);
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

/** Curated leagues shown on the Leagues page (display names; matching is flexible) */
export const CURATED_LEAGUES = [
    "UEFA Champions League",
    "Premier League",
    "La Liga",
    "Copa del Rey",
    "Supercopa de España",
    "FIFA World Cup",
    "FA Cup",
    "Carabao Cup",
    "Serie A",
    "Bundesliga",
    "Ligue 1",
    "MLS",
];

/** Leagues that must be from a specific country (strict: no other region's same-named league) */
const LEAGUE_REQUIRED_COUNTRY: Record<string, string> = {
    "Premier League": "England",
    "La Liga": "Spain",
    "FA Cup": "England",
    "Carabao Cup": "England",
    "Copa del Rey": "Spain",
    "Supercopa de España": "Spain",
};

/** Normalize for league name matching (ignore spaces, case) so "La Liga" matches "LaLiga". */
function normalizeLeagueName(s: string): string {
    return s.toLowerCase().replace(/\s+/g, "").replace(/[^\w]/g, "");
}

/** Get league name from group key (id__name) */
function leagueNameFromKey(key: string): string {
    return key.split("__")[1] ?? key;
}

/** Required country for a curated league display name (undefined = any country) */
function getRequiredCountryForCuratedLeague(curatedLeagueName: string): string | undefined {
    return LEAGUE_REQUIRED_COUNTRY[curatedLeagueName];
}

/**
 * Get all matches from grouped that belong to a curated league (by name match).
 * Uses normalized names so e.g. "La Liga" matches "LaLiga", "La Liga Santander", etc.
 * Enforces country when defined (e.g. Premier League = England only, La Liga = Spain only).
 * For MLS: also includes all Inter Miami matches (any competition).
 */
export function getMatchesForCuratedLeague(
    grouped: Record<string, Match[]>,
    leagueName: string
): Match[] {
    const matches: Match[] = [];
    const curatedNorm = normalizeLeagueName(leagueName);
    const requiredCountry = getRequiredCountryForCuratedLeague(leagueName);
    for (const key of Object.keys(grouped)) {
        const name = leagueNameFromKey(key);
        const nameNorm = normalizeLeagueName(name);
        const nameMatches =
            nameNorm === curatedNorm ||
            nameNorm.includes(curatedNorm) ||
            curatedNorm.includes(nameNorm) ||
            name.toLowerCase().includes(leagueName.toLowerCase()) ||
            leagueName.toLowerCase().includes(name.toLowerCase());
        if (!nameMatches) continue;
        const fromGroup = grouped[key];
        if (requiredCountry) {
            matches.push(...fromGroup.filter((m) => m.league.country === requiredCountry));
        } else {
            matches.push(...fromGroup);
        }
    }
    // MLS tab: also include all Inter Miami matches from any league (e.g. Leagues Cup)
    if (curatedNorm === "mls") {
        const seen = new Set(matches.map((m) => m.id));
        for (const groupMatches of Object.values(grouped)) {
            for (const m of groupMatches) {
                if (isInterMiamiMatch(m) && !seen.has(m.id)) {
                    matches.push(m);
                    seen.add(m.id);
                }
            }
        }
    }
    return matches;
}

/** Returns true if the match's league is in CURATED_LEAGUES (by name match) and passes country when required. */
function isCuratedLeague(leagueName: string, leagueCountry?: string): boolean {
    const a = normalizeLeagueName(leagueName);
    const aLower = leagueName.toLowerCase();
    return CURATED_LEAGUES.some((curated) => {
        const b = normalizeLeagueName(curated);
        const bLower = curated.toLowerCase();
        const nameMatches =
            a === b ||
            a.includes(b) ||
            b.includes(a) ||
            aLower.includes(bLower) ||
            bLower.includes(aLower);
        if (!nameMatches) return false;
        const requiredCountry = LEAGUE_REQUIRED_COUNTRY[curated];
        if (!requiredCountry) return true;
        return leagueCountry === requiredCountry;
    });
}

/** Whether the match involves Inter Miami (home or away). */
export function isInterMiamiMatch(m: Match): boolean {
    const name = (s: string) => s.toLowerCase().includes("inter miami");
    return name(m.homeTeam.name) || name(m.awayTeam.name);
}

/**
 * Filter matches to only those from CURATED_LEAGUES. Use on Home, Live, and Scores.
 * Premier League = England only; La Liga and Spanish cups = Spain only.
 * All Inter Miami matches are always included, plus all other MLS matches.
 */
export function filterMatchesByCuratedLeagues(matches: Match[]): Match[] {
    return matches.filter(
        (m) =>
            isCuratedLeague(m.league.name, m.league.country) ||
            isInterMiamiMatch(m)
    );
}

const TOP_LEAGUES = [
    "UEFA Champions League",
    "Premier League",
    "La Liga",
    "Copa del Rey",
    "Supercopa de España",
    "Serie A",
    "Bundesliga",
    "Ligue 1",
    "FA Cup",
    "Carabao Cup",
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
