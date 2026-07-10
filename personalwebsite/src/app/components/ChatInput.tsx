"use client";
import {
  type FormEvent,
  type KeyboardEvent,
  type RefObject,
} from "react";
import { ArrowUp, Square } from "lucide-react";
import { MosaicTiles, type Tile } from "@/app/components/mosaic";

type ChatInputProps = {
  variant: "hero" | "docked";
  value: string;
  onChange: (v: string) => void;
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
  onKeyDown: (e: KeyboardEvent<HTMLTextAreaElement>) => void;
  inputRef: RefObject<HTMLTextAreaElement | null>;
  queueNavIndex: number;
  isProcessing?: boolean;
  onStop?: () => void;
};

export function ChatInput({
  variant,
  value,
  onChange,
  onSubmit,
  onKeyDown,
  inputRef,
  queueNavIndex,
  isProcessing = false,
  onStop,
}: ChatInputProps) {
  const isHero = variant === "hero";
  const formClass = isHero
    ? "relative"
    : "relative mx-auto w-full max-w-[620px] shrink-0 pb-[env(safe-area-inset-bottom)] md:pb-8";
  const placeholder =
    queueNavIndex >= 0
      ? "Editing queued message…"
      : isHero
        ? "Ask anything about Keshav"
        : "Ask a follow-up";

  // Hero = a wall-less terminal prompt. A transparent textarea sits exactly over
  // a mirror span so we can render our own text + a blinking block cursor (the
  // native caret is hidden). The mirror also drives auto-grow: as it wraps, the
  // container grows and the absolutely-positioned textarea stretches to match.
  if (isHero) {
    return (
      <form onSubmit={onSubmit} className="relative">
        <div className="flex items-start gap-3 font-mono text-[clamp(1.2rem,2.4vw,1.6rem)] leading-relaxed">
          <span
            aria-hidden="true"
            className="select-none pt-[1px] text-[var(--color-accent)]"
          >
            &gt;
          </span>
          <div className="relative min-w-0 flex-1">
            <div
              aria-hidden="true"
              className="relative whitespace-pre-wrap break-words"
            >
              {value ? (
                <>
                  <span className="text-[var(--color-ink)]">{value}</span>
                  <span className="caret-blink ml-[2px] inline-block h-[1.05em] w-[0.5ch] translate-y-[0.18em] bg-[var(--color-accent)]" />
                </>
              ) : (
                <>
                  {/* empty state: block cursor sits ON the first letter of the
                      placeholder (terminal-style), semi-opaque so it shows through */}
                  <span className="caret-blink absolute left-0 top-[0.2em] h-[1.05em] w-[0.9ch] bg-[var(--color-accent)] opacity-60" />
                  <span className="text-[var(--color-ink-faint)]">{placeholder}</span>
                </>
              )}
            </div>
            <textarea
              ref={inputRef}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              onKeyDown={onKeyDown}
              rows={1}
              aria-label="Ask anything about Keshav"
              className="absolute inset-0 h-full w-full resize-none overflow-hidden bg-transparent font-mono text-[clamp(1.2rem,2.4vw,1.6rem)] leading-relaxed text-transparent caret-transparent focus:outline-none"
              autoFocus
            />
          </div>
        </div>
      </form>
    );
  }

  return (
    <form onSubmit={onSubmit} className={formClass}>
      {!isHero && <DockedInputVine />}
      <div
        className={`relative z-10 flex items-end gap-2 rounded-[14px] border bg-[var(--color-surface-raised)] px-4 py-3 shadow-[var(--shadow-soft)] transition-all focus-within:border-[var(--color-accent)] focus-within:shadow-[var(--shadow-lift)] ${
          queueNavIndex >= 0
            ? "border-[var(--color-accent)]"
            : "border-[var(--color-hairline)]"
        }`}
      >
        <textarea
          ref={inputRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={onKeyDown}
          rows={1}
          placeholder={placeholder}
          className={`flex-1 resize-none bg-transparent py-1.5 text-[15px] leading-relaxed text-[var(--color-ink)] placeholder:text-[var(--color-ink-faint)] focus:outline-none ${
            isHero ? "" : "pl-4"
          }`}
          autoFocus={isHero}
        />
        {isProcessing ? (
          <button
            type="button"
            onClick={onStop}
            aria-label="Stop generating"
            title="Stop generating"
            className="flex h-9 w-9 flex-none items-center justify-center rounded-full bg-[var(--color-ink)] text-[var(--color-surface)] transition-all hover:bg-[var(--color-accent-hover)]"
          >
            <Square className="h-3 w-3" fill="currentColor" />
          </button>
        ) : (
          <button
            type="submit"
            disabled={!value.trim()}
            aria-label="Send"
            className="group/btn flex h-9 w-9 flex-none items-center justify-center rounded-full bg-[var(--color-accent)] text-[var(--color-surface)] transition-all hover:bg-[var(--color-accent-hover)] disabled:opacity-30"
          >
            <ArrowUp className="h-4 w-4" />
          </button>
        )}
      </div>
    </form>
  );
}

const DOCK_TILES: Tile[] = [
  { points: "8,10 40,16 34,40 6,32", c: "red" },
  { points: "40,16 70,12 66,34 34,40", c: "green" },
  { points: "70,12 96,20 92,40 66,34", c: "blue" },
  { points: "6,32 34,40 30,58 4,50", c: "green" },
  { points: "34,40 66,34 62,56 30,58", c: "red" },
];

// A small mosaic cluster tucked into the docked input's top-left corner.
function DockedInputVine() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 138 88"
      className="pointer-events-none absolute -left-3 -top-4 z-20 h-[88px] w-[138px] -scale-x-100"
      fill="none"
    >
      <MosaicTiles tiles={DOCK_TILES} gap={1.8} />
    </svg>
  );
}
