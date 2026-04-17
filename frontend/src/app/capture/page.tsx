"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AudioCapture from "@/components/AudioCapture";
import { getAudioUrl, getIdea, getIdeas } from "@/lib/api";
import type { CaptureResponse, Idea, IdeasListResponse } from "@/lib/types";

export default function CapturePage() {
  const router = useRouter();
  const [lastCapture, setLastCapture] = useState<CaptureResponse | null>(null);
  const [lastCaptureIdea, setLastCaptureIdea] = useState<Idea | null>(null);

  useEffect(() => {
    const hydrateLastCapture = async () => {
      try {
        const data = (await getIdeas(0, 1)) as IdeasListResponse;
        const latest = data.items[0];
        if (!latest || !latest.latest_version) return;

        setLastCapture({
          id: latest.id,
          title: latest.title,
          version_id: latest.latest_version.id,
          file_path: latest.latest_version.file_path,
          bpm: latest.latest_version.bpm,
          key_signature: latest.latest_version.key_signature,
          mood: latest.latest_version.mood,
          genre: latest.latest_version.genre,
          energy_level: latest.latest_version.energy_level,
          instruments: latest.latest_version.instruments ?? [],
          tags: latest.latest_version.tags ?? [],
          duration: latest.latest_version.duration,
          created_at: latest.updated_at,
        });
      } catch (error) {
        console.error("Could not load latest capture:", error);
      }
    };

    void hydrateLastCapture();
  }, []);

  const handleCaptureComplete = async (data: unknown) => {
    const payload = data as Partial<CaptureResponse> | null;

    if (!payload || typeof payload.id !== "number" || typeof payload.file_path !== "string") {
      return;
    }

    const normalized: CaptureResponse = {
      id: payload.id,
      title: payload.title ?? "Untitled Idea",
      version_id: payload.version_id ?? 0,
      file_path: payload.file_path,
      bpm: payload.bpm ?? null,
      key_signature: payload.key_signature ?? null,
      mood: payload.mood ?? null,
      genre: payload.genre ?? null,
      energy_level: payload.energy_level ?? null,
      instruments: Array.isArray(payload.instruments) ? payload.instruments : [],
      tags: Array.isArray(payload.tags) ? payload.tags : [],
      duration: payload.duration ?? null,
      created_at: payload.created_at ?? new Date().toISOString(),
    };

    setLastCapture(normalized);

    try {
      const idea = (await getIdea(normalized.id)) as Idea;
      setLastCaptureIdea(idea);
    } catch (error) {
      console.error("Could not hydrate captured idea details:", error);
    }
  };

  return (
    <div className="page-shell page-stack">
      <section className="page-hero animate-fade-in">
        <div className="hero-grid lg:grid-cols-[1.2fr_0.9fr] lg:items-center">
          <div>
            <p className="eyebrow">ambient capture</p>
            <h1 className="display-title max-w-3xl">Keep the best minute in reach.</h1>
            <p className="lede mt-5">
              The listener holds a rolling sixty-second buffer so you can keep playing
              until something clicks, then save the part worth revisiting.
            </p>
          </div>

          <div className="panel p-6">
            <p className="metric-label">Capture tips</p>
            <div className="mt-3 grid gap-3">
              {[
                "Let the buffer fill for a few seconds before your first capture.",
                "Keep the mic close and avoid speakers to reduce room feedback.",
                "Use short sessions often instead of waiting for a perfect take.",
              ].map((tip, index) => (
                <div key={tip} className="flex gap-3">
                  <div className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[rgba(34,27,22,0.92)] text-xs font-bold text-[#fff7f0]">
                    {index + 1}
                  </div>
                  <p className="text-sm leading-7 text-[var(--muted)]">{tip}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="animate-fade-in animate-fade-in-delay-1">
          <AudioCapture onCaptureComplete={handleCaptureComplete} />
        </div>

        <div className="page-stack animate-fade-in animate-fade-in-delay-2">
          {lastCapture ? (
            <div className="panel p-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="eyebrow mb-2">latest result</p>
                  <h2 className="section-title text-[2rem]">{lastCapture.title}</h2>
                </div>
                <button
                  onClick={() => router.push(`/ideas/${lastCapture.id}`)}
                  className="button-ghost"
                >
                  Open detail
                </button>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3">
                {[
                  ["BPM", lastCapture.bpm ? Math.round(lastCapture.bpm).toString() : "--"],
                  ["Key", lastCapture.key_signature ?? "--"],
                  ["Mood", lastCapture.mood ?? "--"],
                  ["Genre", lastCapture.genre ?? "--"],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    className="rounded-[1.25rem] border border-[rgba(68,54,40,0.08)] bg-[rgba(255,252,247,0.76)] p-4"
                  >
                    <p className="metric-label">{label}</p>
                    <p className="mt-3 text-2xl font-[family-name:var(--font-display)] capitalize">
                      {value}
                    </p>
                  </div>
                ))}
              </div>

              {lastCapture.tags.length > 0 ? (
                <div className="mt-5 flex flex-wrap gap-2">
                  {lastCapture.tags.map((tag) => (
                    <span key={tag} className="tag-badge">
                      {tag}
                    </span>
                  ))}
                </div>
              ) : null}

              <div className="mt-6 rounded-[1.1rem] border border-[rgba(68,54,40,0.1)] bg-[rgba(255,252,247,0.72)] p-4 text-sm text-[var(--muted)]">
                <p>
                  <span className="font-semibold text-[var(--text)]">Audio URL:</span>{" "}
                  <a
                    href={getAudioUrl(lastCapture.file_path)}
                    target="_blank"
                    rel="noreferrer"
                    className="underline decoration-[rgba(68,54,40,0.25)] underline-offset-4"
                  >
                    {getAudioUrl(lastCapture.file_path)}
                  </a>
                </p>
                <p className="mt-2 break-all">
                  <span className="font-semibold text-[var(--text)]">Stored file:</span>{" "}
                  backend/audio_files/{lastCapture.file_path}
                </p>
                {lastCaptureIdea?.versions ? (
                  <p className="mt-2">
                    <span className="font-semibold text-[var(--text)]">Versions in idea:</span>{" "}
                    {lastCaptureIdea.versions.length}
                  </p>
                ) : null}
              </div>
            </div>
          ) : (
            <div className="panel p-6">
              <p className="eyebrow">waiting for a take</p>
              <h2 className="section-title text-[2rem]">Nothing captured yet.</h2>
              <p className="mt-4 text-sm leading-7 text-[var(--muted)]">
                Start listening, play something, and hit capture when you hear a phrase
                worth keeping. The result card will show analysis here.
              </p>
            </div>
          )}

          <div className="panel p-6">
            <p className="eyebrow">use cases</p>
            <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
              {[
                ["Riff sketch", "Catch fragments before they vanish."],
                ["Melody test", "Hum an idea quickly without opening a DAW."],
                ["Rhythm seed", "Tap patterns and return to them later."],
              ].map(([title, copy]) => (
                <div
                  key={title}
                  className="rounded-[1.25rem] border border-[rgba(68,54,40,0.08)] bg-[rgba(255,252,247,0.7)] p-4"
                >
                  <p className="text-sm font-bold uppercase tracking-[0.12em] text-[var(--accent-deep)]">
                    {title}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{copy}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
