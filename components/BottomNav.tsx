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
