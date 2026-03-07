import { NextRequest, NextResponse } from "next/server";

const API_BASE = "https://api.sportsrc.org/v2/";
const API_KEY = process.env.SPORTSRC_KEY ?? process.env.NEXT_PUBLIC_SPORTSRC_KEY ?? "";

interface CacheEntry {
    data: any;
    timestamp: number;
}

// Global cache to persist across requests (server-side)
const globalCache = new Map<string, CacheEntry>();
const LIVE_CACHE_TTL = 45 * 1000; // 45 seconds for inprogress
const FIXTURE_CACHE_TTL = 4 * 60 * 60 * 1000; // 4 hours for upcoming/finished

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type");
    const sport = searchParams.get("sport") ?? "football";
    const status = searchParams.get("status");
    const date = searchParams.get("date");

    // Cache key based on all params
    const cacheKey = `${type}-${sport}-${status}-${date}`;
    const now = Date.now();
    const cached = globalCache.get(cacheKey);

    const ttl = status === "inprogress" ? LIVE_CACHE_TTL : FIXTURE_CACHE_TTL;

    if (cached && (now - cached.timestamp) < ttl) {
        return NextResponse.json(cached.data, {
            headers: { "X-Cache-Status": "HIT" }
        });
    }

    const url = new URL(API_BASE);
    if (type) url.searchParams.set("type", type);
    if (sport) url.searchParams.set("sport", sport);
    if (status) url.searchParams.set("status", status);
    if (date) url.searchParams.set("date", date);

    // Debug: log request (no key value)
    console.log("[matches API] request", { type, sport, status, date, hasKey: !!API_KEY });

    try {
        const res = await fetch(url.toString(), {
            headers: {
                "X-API-KEY": API_KEY,
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
            },
            next: { revalidate: Math.floor(ttl / 1000) },
        });

        const data = await res.json().catch(() => null);

        // Debug: log response summary
        const dataArray = data?.data ?? data?.matches ?? (Array.isArray(data) ? data : null);
        const count = Array.isArray(dataArray) ? dataArray.length : (data?.total_matches ?? "?");
        console.log("[matches API] response", { status: res.status, ok: res.ok, success: data?.success, count });

        if (res.ok && data) {
            globalCache.set(cacheKey, { data, timestamp: now });
        }

        return NextResponse.json(data ?? [], {
            status: res.ok ? 200 : res.status,
            headers: {
                "Cache-Control": `public, s-maxage=${Math.floor(ttl / 1000)}, stale-while-revalidate=59`,
                "X-Cache-Status": "MISS"
            }
        });
    } catch (err) {
        console.error("[/api/matches]", err);
        return NextResponse.json([], { status: 500 });
    }
}
