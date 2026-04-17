"use client";

import { useMemo, useState } from "react";
import IdeaCard from "@/components/IdeaCard";
import type { Idea } from "@/lib/types";

interface ClusterViewProps {
  ideas: Idea[];
}

const CLUSTER_MODES = [
  { key: "all", label: "All ideas", color: "#CFECF3" },
  { key: "mood", label: "By mood", color: "#CFECF3" },
  { key: "genre", label: "By genre", color: "#60714c" },
] as const;

type ClusterMode = (typeof CLUSTER_MODES)[number]["key"];

export default function ClusterView({ ideas }: ClusterViewProps) {
  const [mode, setMode] = useState<ClusterMode>("all");

  const clusters = useMemo(() => {
    if (mode === "all") return { "All Ideas": ideas };

    const grouped: Record<string, Idea[]> = {};
    ideas.forEach((idea) => {
      const version = idea.latest_version;
      let key = "Uncategorized";
      if (mode === "mood" && version?.mood) key = version.mood;
      else if (mode === "genre" && version?.genre) key = version.genre;

      const normalized = key.charAt(0).toUpperCase() + key.slice(1).toLowerCase();
      if (!grouped[normalized]) grouped[normalized] = [];
      grouped[normalized].push(idea);
    });

    return grouped;
  }, [ideas, mode]);

  const sortedClusters = Object.entries(clusters).sort((a, b) => {
    if (a[0] === "Uncategorized") return 1;
    if (b[0] === "Uncategorized") return -1;
    return b[1].length - a[1].length;
  });

  const activeMode = CLUSTER_MODES.find((entry) => entry.key === mode)!;

  return (
    <div>
      <div className="mb-8 inline-flex items-center gap-1 rounded-full border border-[rgba(68,54,40,0.08)] bg-[rgba(255,252,247,0.7)] p-1">
        {CLUSTER_MODES.map((entry) => (
          <button
            key={entry.key}
            onClick={() => setMode(entry.key)}
            className={`rounded-full px-5 py-2 text-sm font-semibold transition-all duration-200 ${
              mode === entry.key
                ? "bg-[rgba(34,27,22,0.92)] text-[#fff7f0]"
                : "text-[var(--muted)] hover:bg-[rgba(207,236,243,0.45)] hover:text-[var(--text)]"
            }`}
          >
            {entry.label}
          </button>
        ))}
      </div>

      <div className="space-y-12">
        {sortedClusters.map(([clusterName, clusterIdeas], idx) => (
          <div key={clusterName} className="animate-fade-in" style={{ animationDelay: `${idx * 0.08}s` }}>
            {mode !== "all" ? (
              <div className="mb-5 flex items-center gap-4">
                <h2 className="font-[family-name:var(--font-display)] text-4xl leading-none capitalize tracking-[-0.04em]">
                  {clusterName}
                </h2>
                <div
                  className="h-px flex-1"
                  style={{
                    background: `linear-gradient(to right, ${activeMode.color}40, transparent)`,
                  }}
                />
                <span
                  className="rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.12em]"
                  style={{
                    background: `${activeMode.color}14`,
                    color: activeMode.color,
                    border: `1px solid ${activeMode.color}22`,
                  }}
                >
                  {clusterIdeas.length} idea{clusterIdeas.length !== 1 ? "s" : ""}
                </span>
              </div>
            ) : null}

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {clusterIdeas.map((idea, i) => (
                <IdeaCard key={idea.id} idea={idea} index={i} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
