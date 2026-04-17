"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { searchIdeas } from "@/lib/api";
import type { SearchResult } from "@/lib/types";

export default function SearchBar() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [tagsUsed, setTagsUsed] = useState<string[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [error, setError] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setTagsUsed([]);
      setError("");
      setShowResults(false);
      return;
    }

    const timeoutId = setTimeout(async () => {
      setIsSearching(true);
      setError("");
      try {
        const data = (await searchIdeas(query)) as {
          results: SearchResult[];
          tags_used: string[];
        };
        setResults(data.results);
        setTagsUsed(data.tags_used);
        setShowResults(true);
      } catch (searchError) {
        console.error("Search failed:", searchError);
        setResults([]);
        setTagsUsed([]);
        setError("Search is unavailable right now.");
        setShowResults(true);
      } finally {
        setIsSearching(false);
      }
    }, 350);

    return () => clearTimeout(timeoutId);
  }, [query]);

  useEffect(() => {
    const handler = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const clearSearch = () => {
    setQuery("");
    setResults([]);
    setTagsUsed([]);
    setError("");
    setShowResults(false);
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="input-shell overflow-hidden">
        <div className="flex items-center gap-3 px-4 py-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[rgba(207,236,243,0.6)] text-[0.68rem] font-bold uppercase tracking-[0.16em] text-[var(--text)]">
            Find
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => {
              if (results.length > 0 || error) {
                setShowResults(true);
              }
            }}
            placeholder="Search by mood, instrument, genre, or feeling"
            className="min-w-0 flex-1 bg-transparent text-sm text-[var(--text)] outline-none placeholder:text-[var(--soft)]"
          />
          {isSearching ? (
            <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--accent-deep)]">
              searching
            </span>
          ) : query ? (
            <button
              onClick={clearSearch}
              className="rounded-full border border-[rgba(68,54,40,0.08)] px-3 py-2 text-xs font-bold uppercase tracking-[0.14em] text-[var(--muted)]"
            >
              Clear
            </button>
          ) : null}
        </div>
      </div>

      {showResults ? (
        <div className="panel panel-strong absolute left-0 right-0 top-full z-50 mt-3 max-h-[26rem] overflow-y-auto animate-fade-in">
          {tagsUsed.length > 0 ? (
            <div className="flex flex-wrap items-center gap-2 border-b border-[rgba(68,54,40,0.08)] px-4 py-3">
              <span className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--soft)]">
                AI tags
              </span>
              {tagsUsed.map((tag) => (
                <span key={tag} className="tag-badge">
                  {tag}
                </span>
              ))}
            </div>
          ) : null}

          {error ? (
            <div className="px-4 py-8 text-center text-sm text-[var(--muted)]">{error}</div>
          ) : results.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-[var(--muted)]">
              No matching ideas found.
            </div>
          ) : (
            results.map((result) => (
              <Link
                key={`${result.idea_id}-${result.version_id}`}
                href={`/ideas/${result.idea_id}`}
                onClick={() => setShowResults(false)}
                className="block border-b border-[rgba(68,54,40,0.05)] px-4 py-4 transition-colors hover:bg-[rgba(207,236,243,0.45)]"
              >
                <div className="mb-2 flex items-center justify-between gap-3">
                  <span className="font-[family-name:var(--font-display)] text-2xl leading-none">
                    {result.title}
                  </span>
                  <span className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--soft)]">
                    {result.bpm ? `${Math.round(result.bpm)} BPM` : "match"}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {result.mood ? <span className="tag-badge">{result.mood}</span> : null}
                  {result.genre ? <span className="tag-badge">{result.genre}</span> : null}
                  {result.tags?.slice(0, 2).map((tag) => (
                    <span key={tag} className="tag-badge">
                      {tag}
                    </span>
                  ))}
                </div>
              </Link>
            ))
          )}
        </div>
      ) : null}
    </div>
  );
}
