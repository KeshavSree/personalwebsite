"use client";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { ChatArtifact, type Artifact } from "@/app/components/ChatArtifact";
import { useChatThread } from "@/app/components/ChatThread";
import { MosaicTiles, type Tile } from "@/app/components/mosaic";

// Closing animation duration. Must match the longest of `sheetOut` /
// `scrimOut` in globals.css so we don't unmount mid-animation.
const CLOSE_MS = 260;

// Bottom-sheet overlay used on mobile when a citation pill is tapped. Reads
// the active artifact from the chat thread context, renders it in `overlay`
// mode (which surfaces the annotation as a pulsating, tap-friendly toggle),
// and dismisses on scrim tap, close button, or Escape. Hidden on lg+ where
// the side panel handles the same job.
//
// To play a closing animation, the overlay holds onto the artifact through a
// local "closing" phase even after the context's `overlay` is cleared. During
// that window the sheet animates out, then we unmount.
export function ArtifactOverlay() {
  const ctx = useChatThread();
  const ctxArtifact = ctx?.overlay ?? null;

  // Local rendered artifact: kept alive during the close animation so the
  // sheet has something to slide away with.
  const [rendered, setRendered] = useState<Artifact | null>(null);
  const [closing, setClosing] = useState(false);

  // Sync from context: when the context flips to a new artifact, show it
  // (and cancel any in-flight close). When the context clears, start the
  // close animation.
  useEffect(() => {
    if (ctxArtifact) {
      setRendered(ctxArtifact);
      setClosing(false);
      return;
    }
    if (rendered) {
      setClosing(true);
      const t = setTimeout(() => {
        setClosing(false);
        setRendered(null);
      }, CLOSE_MS);
      return () => clearTimeout(t);
    }
  }, [ctxArtifact, rendered]);

  // Lock body scroll while open so the page underneath doesn't drift.
  useEffect(() => {
    if (!rendered) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [rendered]);

  // Close on Escape.
  useEffect(() => {
    if (!rendered || closing) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") ctx?.setOverlay(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [rendered, closing, ctx]);

  if (typeof window === "undefined" || !rendered) return null;

  const dismiss = () => {
    if (closing) return;
    ctx?.setOverlay(null);
  };

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-end justify-center lg:hidden"
      role="dialog"
      aria-modal="true"
    >
      <button
        type="button"
        aria-label="Close"
        onClick={dismiss}
        className={`absolute inset-0 bg-[oklch(20%_0.018_55_/_0.45)] backdrop-blur-[2px] ${
          closing ? "scrim-out" : "scrim-in"
        }`}
      />
      <div
        className={`relative flex max-h-[95dvh] w-full flex-col rounded-t-[20px] border-t border-[var(--color-hairline)] bg-[var(--color-surface)] shadow-[var(--shadow-lift)] transition-[max-height] duration-200 ease-out ${
          closing ? "sheet-out" : "sheet-in"
        }`}
      >
        {/* Drag indicator + close */}
        <div className="relative flex items-center justify-end px-5 pt-4 pb-1">
          <span
            aria-hidden="true"
            className="absolute left-1/2 top-2 h-1 w-10 -translate-x-1/2 rounded-full bg-[var(--color-hairline-strong)]"
          />
          <button
            type="button"
            onClick={dismiss}
            aria-label="Close"
            className="-mr-2 flex h-9 w-9 items-center justify-center rounded-full text-[var(--color-ink-muted)] transition-colors hover:text-[var(--color-ink)]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="relative overflow-y-auto px-5 pb-8 pt-2 quiet-scroll">
          <div>
            <ChatArtifact artifact={rendered} mode="overlay" />
          </div>
          <MobileArtifactBranch />
        </div>
      </div>
    </div>,
    document.body,
  );
}

const MOBILE_TILES: Tile[] = [
  { points: "189,44 150,40 152,60 189,58", c: "red" },
  { points: "150,40 112,46 116,60 152,60", c: "green" },
  { points: "112,46 78,38 82,58 116,60", c: "blue" },
  { points: "78,38 44,44 48,58 82,58", c: "red" },
  { points: "44,44 12,40 16,56 48,58", c: "green" },
];

// A small mosaic run signing off the bottom of the mobile artifact sheet.
function MobileArtifactBranch() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 190 62"
      className="pointer-events-none ml-auto mt-4 block h-[58px] w-[178px]"
      fill="none"
    >
      <MosaicTiles tiles={MOBILE_TILES} gap={1.8} />
    </svg>
  );
}
