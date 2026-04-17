"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { getAudioUrl } from "@/lib/api";
import type { Idea } from "@/lib/types";

function getMoodClass(mood: string | null): string {
  if (!mood) return "";
  const value = mood.toLowerCase();
  if (value.includes("happy") || value.includes("uplifting") || value.includes("joy")) {
    return "mood-happy";
  }
  if (value.includes("sad") || value.includes("melanchol")) {
    return "mood-sad";
  }
  if (value.includes("energetic") || value.includes("upbeat")) {
    return "mood-energetic";
  }
  if (value.includes("peace") || value.includes("dream") || value.includes("calm")) {
    return "mood-peaceful";
  }
  if (value.includes("aggress") || value.includes("intense") || value.includes("dark")) {
    return "mood-aggressive";
  }
  return "";
}

function formatDuration(seconds: number | null): string {
  if (!seconds) return "";
  const minutes = Math.floor(seconds / 60);
  const remainder = Math.floor(seconds % 60);
  return `${minutes}:${remainder.toString().padStart(2, "0")}`;
}

function formatDate(dateString: string): string {
  // The backend stores local IST timestamps without timezone info.
  // We parse and format using IST to ensure the correct local date.
  const raw = dateString.includes("+") || dateString.endsWith("Z")
    ? dateString
    : dateString.replace(" ", "T") + "+05:30";
  const date = new Date(raw);
  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

interface IdeaCardProps {
  idea: Idea;
  index?: number;
}

export default function IdeaCard({ idea, index = 0 }: IdeaCardProps) {
  const version = idea.latest_version;
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const togglePlay = async (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    if (!version?.file_path) return;

    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
      return;
    }

    audio.src = getAudioUrl(version.file_path);
    try {
      await audio.play();
      setIsPlaying(true);
    } catch (error) {
      console.error("Unable to play preview:", error);
    }
  };

  return (
    <Link
      href={`/ideas/${idea.id}`}
      className="panel panel-hover block p-5 animate-fade-in"
      style={{ animationDelay: `${index * 0.06}s`, opacity: 0 }}
    >
      <audio ref={audioRef} onEnded={() => setIsPlaying(false)} className="hidden" />

      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-[0.68rem] font-bold uppercase tracking-[0.16em] text-[var(--soft)]">
            {formatDate(idea.created_at)}
          </p>
          <h3 className="mt-2 truncate font-[family-name:var(--font-display)] text-3xl leading-none tracking-[-0.04em]">
            {idea.title}
          </h3>
        </div>
        {version?.file_path ? (
          <button
            onClick={togglePlay}
            className="shrink-0 rounded-full border border-[rgba(68,54,40,0.12)] bg-[rgba(255,252,247,0.84)] px-4 py-2 text-xs font-bold uppercase tracking-[0.14em] text-[var(--accent-deep)] transition-all hover:border-[rgba(68,54,40,0.2)]"
            title={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? "Pause" : "Play"}
          </button>
        ) : null}
      </div>

      <div className="mb-4 flex h-12 items-center gap-[2px] overflow-hidden rounded-[1.1rem] border border-[rgba(68,54,40,0.08)] bg-[rgba(255,252,247,0.72)] px-3">
        {Array.from({ length: 36 }).map((_, i) => (
          <div
            key={i}
            className="flex-1 rounded-full transition-all"
            style={{
              height: `${Math.abs(Math.sin(i * 1.5)) * 78 + 18}%`,
              background: isPlaying
                ? `rgba(207,236,243,${0.38 + Math.abs(Math.cos(i * 1.2)) * 0.42})`
                : "rgba(43,108,127,0.18)",
            }}
          />
        ))}
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-x-3 gap-y-2 text-xs font-semibold uppercase tracking-[0.08em] text-[var(--muted)]">
        {version?.bpm ? (
          <span className="rounded-full bg-[rgba(207,236,243,0.5)] px-3 py-1">
            {Math.round(version.bpm)} BPM
          </span>
        ) : null}
        {version?.key_signature ? (
          <span className="rounded-full bg-[rgba(43,108,127,0.1)] px-3 py-1">
            {version.key_signature}
          </span>
        ) : null}
        {version?.duration ? (
          <span className="rounded-full bg-[rgba(34,27,22,0.05)] px-3 py-1">
            {formatDuration(version.duration)}
          </span>
        ) : null}
        {idea.version_count && idea.version_count > 1 ? (
          <span className="rounded-full bg-[rgba(96,113,76,0.1)] px-3 py-1 text-[var(--accent-olive)]">
            {idea.version_count} versions
          </span>
        ) : null}
      </div>

      <div className="flex flex-wrap gap-1.5">
        {version?.mood ? (
          <span className={`tag-badge ${getMoodClass(version.mood)}`}>{version.mood}</span>
        ) : null}
        {version?.genre ? <span className="tag-badge">{version.genre}</span> : null}
        {version?.tags?.slice(0, 2).map((tag) => (
          <span key={tag} className="tag-badge">
            {tag}
          </span>
        ))}
      </div>
    </Link>
  );
}
