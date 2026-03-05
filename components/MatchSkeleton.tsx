export default function MatchSkeleton({ count = 5 }: { count?: number }) {
    return (
        <>
            {Array.from({ length: count }).map((_, i) => (
                <div
                    key={i}
                    style={{
                        display: "flex",
                        alignItems: "center",
                        padding: "14px 16px",
                        borderBottom: "1px solid var(--border)",
                        gap: "12px",
                    }}
                >
                    {/* Teams */}
                    <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "8px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <div className="skeleton" style={{ width: 20, height: 20, borderRadius: 4 }} />
                            <div className="skeleton" style={{ width: `${55 + (i % 3) * 15}%`, height: 14 }} />
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <div className="skeleton" style={{ width: 20, height: 20, borderRadius: 4 }} />
                            <div className="skeleton" style={{ width: `${45 + (i % 4) * 12}%`, height: 14 }} />
                        </div>
                    </div>
                    {/* Score */}
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, minWidth: 64 }}>
                        <div className="skeleton" style={{ width: 44, height: 22 }} />
                        <div className="skeleton" style={{ width: 28, height: 10 }} />
                    </div>
                </div>
            ))}
        </>
    );
}

export function LeagueSkeleton({ count = 3 }: { count?: number }) {
    return (
        <>
            {Array.from({ length: count }).map((_, i) => (
                <div key={i} className="league-group">
                    {/* League header skeleton */}
                    <div style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        padding: "10px 16px",
                        borderTop: "1px solid var(--border)",
                        borderBottom: "1px solid var(--border)",
                        background: "var(--bg-surface)",
                    }}>
                        <div className="skeleton" style={{ width: 22, height: 22, borderRadius: 4 }} />
                        <div className="skeleton" style={{ width: `${100 + i * 30}px`, height: 12 }} />
                    </div>
                    <MatchSkeleton count={2 + i} />
                </div>
            ))}
        </>
    );
}

export function LiveMatchSkeleton() {
    return (
        <section style={{ marginBottom: 32 }}>
            <div style={{ padding: "4px 16px 8px" }}>
                <div className="skeleton" style={{ width: 80, height: 24, borderRadius: 20 }} />
            </div>
            <div className="league-group">
                <div style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "10px 16px",
                    borderTop: "1px solid var(--border)",
                    borderBottom: "1px solid var(--border)",
                    background: "var(--bg-surface)",
                }}>
                    <div className="skeleton" style={{ width: 20, height: 20, borderRadius: 4 }} />
                    <div className="skeleton" style={{ width: 150, height: 12 }} />
                </div>
                <MatchSkeleton count={2} />
            </div>
        </section>
    );
}
