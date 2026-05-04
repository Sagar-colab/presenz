"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import type { ProfileDraft } from "./types";

const MIN_PHOTOS = 3;
const MAX_PHOTOS = 6;

type Tile =
  | { state: "uploaded"; url: string }
  | { state: "uploading" }
  | { state: "blocked"; reason: string };

export function Step4Photos({
  draft,
  set,
}: {
  draft: ProfileDraft;
  set: (patch: Partial<ProfileDraft>) => void;
}) {
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [tiles, setTiles] = useState<Tile[]>(
    draft.photos.map((url) => ({ state: "uploaded", url } as Tile)),
  );

  function syncPhotos(next: Tile[]) {
    setTiles(next);
    set({
      photos: next.flatMap((t) => (t.state === "uploaded" ? [t.url] : [])),
    });
  }

  async function onFiles(files: FileList | null) {
    if (!files) return;
    const room = MAX_PHOTOS - tiles.filter((t) => t.state !== "blocked").length;
    const accepted = Array.from(files).slice(0, room);

    for (const file of accepted) {
      const dataUrl = await readAsDataUrl(file);
      const placeholder: Tile = { state: "uploading" };
      const optimistic = [...tiles, placeholder];
      syncPhotos(optimistic);
      const idx = optimistic.length - 1;

      try {
        const r = await fetch("/api/profile/photo", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ dataUrl }),
        });
        const j = await r.json();
        if (!r.ok || !j.ok) {
          syncPhotos(replaceAt(optimistic, idx, { state: "blocked", reason: prettyReason(j.reason ?? "unknown") }));
          continue;
        }
        syncPhotos(replaceAt(optimistic, idx, { state: "uploaded", url: j.url }));
      } catch {
        syncPhotos(replaceAt(optimistic, idx, { state: "blocked", reason: "Upload failed. Try again." }));
      }
    }

    if (fileRef.current) fileRef.current.value = "";
  }

  function remove(i: number) {
    syncPhotos(tiles.filter((_, idx) => idx !== i));
  }

  return (
    <section className="space-y-7">
      <header className="space-y-2">
        <h1 className="text-[28px] tracking-tightish text-ink">Your photos</h1>
        <p className="text-[15px] leading-relaxed text-ink-muted">
          Three to six photos that look like you, today. Faces visible. No filters that change your
          features. Each photo is privately scanned for safety before saving.
        </p>
      </header>

      <div className="grid grid-cols-3 gap-2.5">
        {tiles.map((tile, i) => (
          <PhotoTile key={i} tile={tile} onRemove={() => remove(i)} />
        ))}
        {tiles.length < MAX_PHOTOS && (
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="aspect-[4/5] rounded-xl bg-surface-alt hairline flex flex-col items-center justify-center text-ink-muted hover:bg-white"
          >
            <span className="text-2xl leading-none">+</span>
            <span className="mt-1 text-[12.5px]">Add photo</span>
          </button>
        )}
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        multiple
        hidden
        onChange={(e) => onFiles(e.target.files)}
      />

      <p className="text-[12.5px] leading-relaxed text-ink-faint">
        {tiles.filter((t) => t.state === "uploaded").length} of {MAX_PHOTOS} ·{" "}
        Minimum {MIN_PHOTOS} required.
      </p>
    </section>
  );
}

export function isStep4Valid(d: ProfileDraft) {
  return d.photos.length >= MIN_PHOTOS && d.photos.length <= MAX_PHOTOS;
}

function PhotoTile({ tile, onRemove }: { tile: Tile; onRemove: () => void }) {
  if (tile.state === "uploading") {
    return <div className="aspect-[4/5] rounded-xl shimmer hairline" />;
  }
  if (tile.state === "blocked") {
    return (
      <div className="aspect-[4/5] rounded-xl bg-[#FBEDEC] hairline p-3 flex flex-col justify-between">
        <span className="text-[11.5px] font-medium text-danger">Blocked</span>
        <p className="text-[12px] leading-snug text-danger">{tile.reason}</p>
        <button onClick={onRemove} className="self-start text-[12px] text-ink-muted underline">
          Remove
        </button>
      </div>
    );
  }
  return (
    <div className="relative group aspect-[4/5] overflow-hidden rounded-xl hairline bg-surface-alt">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={tile.url} alt="" className="h-full w-full object-cover" />
      <button
        type="button"
        onClick={onRemove}
        aria-label="Remove photo"
        className="absolute right-2 top-2 inline-flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-white opacity-0 group-hover:opacity-100 focus-visible:opacity-100"
      >
        ✕
      </button>
    </div>
  );
}

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result));
    r.onerror = () => reject(r.error);
    r.readAsDataURL(file);
  });
}

function replaceAt<T>(arr: T[], i: number, v: T): T[] {
  const next = arr.slice();
  next[i] = v;
  return next;
}

function prettyReason(r: string) {
  if (r.startsWith("blocked_")) {
    const kind = r.replace("blocked_", "");
    if (kind === "nudity") return "Photo flagged: please use a non-explicit image.";
    if (kind === "violence") return "Photo flagged: violent content not allowed.";
    if (kind === "spoof") return "Photo flagged: looks like a screen capture.";
    return "Photo blocked.";
  }
  if (r === "rate_limited") return "Slow down — try again in a moment.";
  if (r === "unauthorized") return "Session expired. Sign in again.";
  return "Couldn't upload that photo.";
}
