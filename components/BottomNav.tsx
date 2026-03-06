"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";

const tabs = [
    {
        href: "/",
        label: "Home",
        icon: (active: boolean) => (
            <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
        ),
    },
    {
        href: "/live",
        label: "Live",
        isLive: true,
        icon: (active: boolean) => (
            <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <circle cx="12" cy="12" r="3" fill={active ? "white" : "currentColor"} />
            </svg>
        ),
    },
    {
        href: "/scores",
        label: "Scores",
        icon: (active: boolean) => (
            <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="3" width="20" height="14" rx="2" />
                <path d="M8 21h8M12 17v4" />
                <line x1="7" y1="10" x2="17" y2="10" />
                <line x1="7" y1="7" x2="17" y2="7" />
            </svg>
        ),
    },
    {
        href: "/leagues",
        label: "Leagues",
        icon: (active: boolean) => (
            <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
                <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
                <path d="M4 22h16" />
                <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
                <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
                <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
            </svg>
        ),
    },
];

export default function BottomNav() {
    const pathname = usePathname();

    const isActive = (href: string) => {
        if (href === "/") return pathname === "/";
        return pathname.startsWith(href);
    };

    return (
        <nav className="bottom-nav">
            <div className="glass-highlight" aria-hidden />
            {tabs.map((tab) => {
                const active = isActive(tab.href);
                return (
                    <Link key={tab.href} href={tab.href} className={`nav-item${active ? " active" : ""}`}>
                        {tab.isLive && <span className="nav-live-dot" />}
                        <span className="nav-icon-wrap">{tab.icon(active)}</span>
                        <span className="nav-label">{tab.label}</span>
                    </Link>
                );
            })}
        </nav>
    );
}
