"use client";

import { useState } from "react";
import TopBar from "./TopBar";
import SearchResults from "./SearchResults";

interface AppShellProps {
    children: React.ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
    const [searchOpen, setSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    const openSearch = () => {
        setSearchQuery("");
        setSearchOpen(true);
    };

    const closeSearch = () => {
        setSearchOpen(false);
        setSearchQuery("");
    };

    return (
        <>
            <TopBar
                searchOpen={searchOpen}
                onOpenSearch={openSearch}
                onCloseSearch={closeSearch}
                searchQuery={searchQuery}
                onSearchQueryChange={setSearchQuery}
            />
            <main className="page-content">
                {searchOpen ? (
                    <SearchResults query={searchQuery} onMatchClick={closeSearch} />
                ) : (
                    children
                )}
            </main>
        </>
    );
}
