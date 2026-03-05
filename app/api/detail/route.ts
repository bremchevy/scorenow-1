import { NextRequest, NextResponse } from "next/server";

const API_BASE = "https://api.sportsrc.org/v2/";
const API_KEY = process.env.SPORTSRC_KEY ?? process.env.NEXT_PUBLIC_SPORTSRC_KEY ?? "";

interface CacheEntry {
    data: any;
    timestamp: number;
}

const globalCache = new Map<string, CacheEntry>();
const DETAIL_CACHE_TTL = 4 * 60 * 60 * 1000; // 4 hours

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const type = searchParams.get("type") ?? "detail";

    if (!id) {
        return NextResponse.json({ error: "id is required" }, { status: 400 });
    }

    const cacheKey = `detail-${id}`;
    const now = Date.now();
    const cached = globalCache.get(cacheKey);

    if (cached && (now - cached.timestamp) < DETAIL_CACHE_TTL) {
        return NextResponse.json(cached.data, {
            headers: { "X-Cache-Status": "HIT" }
        });
    }

    const url = new URL(API_BASE);
    url.searchParams.set("type", type);
    url.searchParams.set("id", id);

    try {
        const res = await fetch(url.toString(), {
            headers: {
                "X-API-KEY": API_KEY,
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
            },
            next: { revalidate: 3600 },
        });

        const data = await res.json().catch(() => null);

        if (res.ok && data) {
            globalCache.set(cacheKey, { data, timestamp: now });
        }

        return NextResponse.json(data ?? null, {
            status: res.ok ? 200 : res.status,
            headers: {
                "Cache-Control": `public, s-maxage=3600, stale-while-revalidate=59`,
                "X-Cache-Status": "MISS"
            }
        });
    } catch (err) {
        console.error("[/api/detail]", err);
        return NextResponse.json(null, { status: 500 });
    }
}
