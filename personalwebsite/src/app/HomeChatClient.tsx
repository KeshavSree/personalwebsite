"use client";
import {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
  type RefObject,
  type PointerEvent as ReactPointerEvent,
} from "react";
import Link from "next/link";
import { ChevronDown, Github, Linkedin } from "lucide-react";
import {
  MosaicBottomStrip,
  MosaicHill,
  MosaicPanelBacking,
} from "@/app/components/mosaic";

export type ContribDay = { date: string; count: number; level: number };

// Right-side vertical GitHub contribution history. Fetches the full history and
// renders it as a hand-built grid of chunky rounded tiles running top(oldest) →
// bottom(newest): each week is a horizontal row of 7 day-tiles, weeks stacked
// down the column (no rotate transform). Lives in its own scroll container; a
// bottom spacer parks the newest end at the bottom of the links box on load, and
// scrolling up reveals older history. Hovering a tile pops it and shows an
// edge-aware tooltip. Colored in the mosaic red ramp. Desktop only.
const TILE = 26; // tile edge in px
const GAP = 4; // gap-1
const CELL = TILE + GAP;
const GRID_TOP = 34; // room above the grid for the contribution-count caption
const GRID_LEFT = 40; // room left of the grid for the month labels
// Mosaic-red ramp indexed by GitHub level 0–4 (empty tint → deep red), with a
// slightly darker parallel border per bucket for the chunky tessera edge.
const TILE_FILL = ["#F4E4E1", "#E1AEA9", "#CE7C78", "#BA5A5A", "#8B3A3A"];
const TILE_BORDER = ["#E6CFCB", "#D69A93", "#BE6763", "#A34A4A", "#6E2C2C"];

function VerticalHistoryCalendar({
  anchorRef,
  initialData,
  onScrolledChange,
}: {
  anchorRef: RefObject<HTMLDivElement | null>;
  initialData?: ContribDay[] | null;
  onScrolledChange?: (scrolled: boolean) => void;
}) {
  const [data, setData] = useState<ContribDay[] | null>(initialData ?? null);
  const [spacer, setSpacer] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const tipRef = useRef<HTMLDivElement>(null);
  const tipTextRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    // The server usually supplies the (daily-cached) history as a prop, so this
    // client fetch is only a fallback for when it wasn't provided.
    if (initialData && initialData.length > 0) return;
    let cancelled = false;
    fetch("https://github-contributions-api.jogruber.de/v4/KeshavSree?y=all")
      .then((r) => r.json())
      .then((j: { contributions?: ContribDay[] }) => {
        if (cancelled) return;
        const now = new Date();
        const today = `${now.getFullYear()}-${String(
          now.getMonth() + 1,
        ).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
        const days = [...(j.contributions ?? [])]
          .filter((d) => d.date <= today)
          .sort((a, b) => a.date.localeCompare(b.date));
        const first = days.findIndex((d) => d.count > 0);
        setData(first > 0 ? days.slice(first) : days);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [initialData]);

  // Group the contiguous daily history into GitHub-style weeks (Sun→Sat). The
  // first real day is padded with leading nulls to its weekday slot and the tail
  // is padded to a full week; weeks render stacked top(oldest) → bottom(newest).
  const weeks = useMemo(() => {
    if (!data || data.length === 0) return [] as (ContribDay | null)[][];
    const first = new Date(data[0].date + "T00:00:00");
    const cells: (ContribDay | null)[] = [];
    for (let i = 0; i < first.getDay(); i++) cells.push(null);
    for (const d of data) cells.push(d);
    while (cells.length % 7 !== 0) cells.push(null);
    const out: (ContribDay | null)[][] = [];
    for (let i = 0; i < cells.length; i += 7) out.push(cells.slice(i, i + 7));
    return out;
  }, [data]);

  const total = useMemo(
    () => (data ? data.reduce((s, d) => s + d.count, 0) : 0),
    [data],
  );

  const contentHeight = weeks.length * CELL;

  // Spacer below the grid so the newest end rests at the bottom of the links box;
  // recompute on resize.
  useEffect(() => {
    if (contentHeight === 0) return;
    const measure = () => {
      const cont = scrollRef.current;
      if (!cont) return;
      const contBottom = cont.getBoundingClientRect().bottom;
      const anchorBottom =
        anchorRef.current?.getBoundingClientRect().bottom ?? contBottom;
      setSpacer(Math.max(0, contBottom - anchorBottom));
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [contentHeight, anchorRef]);

  // Park at the most recent (bottom) once spacing is known.
  useEffect(() => {
    const cont = scrollRef.current;
    if (cont) cont.scrollTop = cont.scrollHeight;
  }, [spacer, contentHeight]);

  const fmt = useMemo(
    () =>
      new Intl.DateTimeFormat("en-US", {
        weekday: "long",
        month: "short",
        day: "numeric",
        year: "numeric",
        timeZone: "UTC",
      }),
    [],
  );

  // Edge-aware tooltip (ported from the reference's web component): reveal, then
  // measure and clamp so it never runs off the top or the side of the viewport.
  const showTip = useCallback(
    (e: ReactPointerEvent<HTMLDivElement>, day: ContribDay) => {
      if (e.pointerType === "touch") return;
      const tt = tipRef.current;
      const txt = tipTextRef.current;
      if (!tt || !txt) return;
      txt.textContent = `${day.count} commit${
        day.count === 1 ? "" : "s"
      } on ${fmt.format(new Date(day.date + "T00:00:00Z"))}`;
      tt.style.visibility = "visible";
      tt.style.opacity = "1";
      const tileBox = e.currentTarget.getBoundingClientRect();
      const ttBox = tt.getBoundingClientRect();
      const padding = 12;
      const htmlWidth = document.documentElement.clientWidth;
      const tileCenterX = tileBox.left + tileBox.width / 2;
      let left = tileCenterX - ttBox.width / 2;
      if (left < padding) {
        left = Math.min(tileBox.left, padding);
      } else if (left + ttBox.width + padding > htmlWidth) {
        left = Math.max(
          tileBox.right - ttBox.width,
          htmlWidth - padding - ttBox.width,
        );
      }
      tt.style.left = `${left}px`;
      tt.style.top = `${tileBox.top - ttBox.height - padding}px`;
      tt.style.setProperty("--arrow-x", `${tileCenterX - left}px`);
    },
    [fmt],
  );

  const hideTip = useCallback(() => {
    const tt = tipRef.current;
    if (!tt) return;
    tt.style.opacity = "0";
    tt.style.visibility = "hidden";
  }, []);

  // Memoize the tile grid so unrelated state changes (spacer/parking) never
  // rebuild the ~2,000-node tree. (No content-visibility here: its paint
  // containment would clip the hover scale-pop at each row's edge.)
  const grid = useMemo(
    () =>
      weeks.map((week, wi) => (
        <div key={wi} className="flex" style={{ gap: GAP }}>
          {week.map((day, di) => {
            if (!day) {
              return <div key={di} style={{ width: TILE, height: TILE }} />;
            }
            const lvl = Math.max(0, Math.min(4, day.level));
            return (
              <div
                key={di}
                onPointerEnter={(e) => showTip(e, day)}
                onPointerLeave={hideTip}
                style={{
                  width: TILE,
                  height: TILE,
                  backgroundColor: TILE_FILL[lvl],
                  borderColor: TILE_BORDER[lvl],
                  borderStyle: "solid",
                }}
                className="relative rounded-sm border transition-transform duration-150 ease-out hover:z-10 hover:scale-125"
              />
            );
          })}
        </div>
      )),
    [weeks, showTip, hideTip],
  );

  return (
    <>
      {/* Vertical "Github!" label reading top-to-bottom (tops of letters facing
          right) down the right edge of the contributions column. */}
      <div
        aria-hidden="true"
        className="rise pointer-events-none absolute right-2 top-1/2 z-[2] hidden -translate-y-1/2 [writing-mode:vertical-rl] font-mono text-[13px] uppercase tracking-[0.24em] text-[var(--color-ink-subtle)] md:block"
        style={{ animationDelay: "500ms" }}
      >
        Github!
      </div>
      <div
        ref={scrollRef}
        onScroll={(e) => {
          // The tooltip is fixed-positioned, so drop it when the column scrolls.
          hideTip();
          // Parked at the bottom on load; treat "scrolled" as having moved up
          // away from that resting position.
          const el = e.currentTarget;
          onScrolledChange?.(
            el.scrollHeight - el.clientHeight - el.scrollTop > 8,
          );
        }}
        onPointerLeave={hideTip}
        aria-hidden="true"
        style={{ animationDelay: "450ms" }}
        className="rise quiet-scroll absolute inset-y-0 right-0 z-[1] hidden w-[286px] overflow-y-auto overscroll-contain md:block"
      >
        <div
          className="relative"
          style={
            contentHeight
              ? { height: GRID_TOP + contentHeight + 14 }
              : undefined
          }
        >
          {contentHeight > 0 && (
            <div
              className="absolute font-mono text-[11px] uppercase tracking-[0.14em] text-[var(--color-ink-subtle)]"
              style={{ top: 8, left: GRID_LEFT }}
            >
              {total.toLocaleString()} contributions
            </div>
          )}
          <div
            className="absolute flex flex-col"
            style={{ top: GRID_TOP, left: GRID_LEFT, gap: GAP }}
          >
            {grid}
          </div>
        </div>
        <div aria-hidden="true" style={{ height: spacer }} />
      </div>
      {/* Single fixed-position tooltip, imperatively positioned in showTip. Kept
          outside the scroll container so overflow can't clip it. */}
      <div
        ref={tipRef}
        aria-hidden="true"
        className="pointer-events-none fixed z-50 whitespace-nowrap rounded-md px-2 py-1 font-mono text-[11px] leading-[1.3] text-[var(--color-surface)] shadow-md"
        style={{
          visibility: "hidden",
          opacity: 0,
          background: "var(--color-ink)",
          transition: "opacity 150ms ease-out, visibility 150ms ease-out",
        }}
      >
        <span ref={tipTextRef} />
        <span
          aria-hidden="true"
          style={{
            position: "absolute",
            top: "100%",
            left: "var(--arrow-x, 50%)",
            transform: "translateX(-50%)",
            width: 0,
            height: 0,
            borderLeft: "5px solid transparent",
            borderRight: "5px solid transparent",
            borderTop: "5px solid var(--color-ink)",
          }}
        />
      </div>
    </>
  );
}

// The panel tan is sliced into four cream blocks by three transparent gaps —
// each seam slightly slanted, and no two seams parallel (slants +4 / -6 / +8) —
// so it reads as four hand-cut mosaic tiles, one loosely per nav link.
const PANEL_SLICES = [
  "18,26 160,14 168,17 172,181 150,178 20,188 12,108 26,58",
  "180,17 270,34 321,22 315,183 270,192 184,181",
  "333,22 400,14 518,30 526,188 410,176 327,183",
  "530,30 682,22 672,102 686,182 540,190 538,188",
];

// PANEL_SLICES point strings ("x,y x,y …" in a 700×200 space) → a CSS
// clip-path polygon expressed in % of the tile element's box, so each nav tile
// can be its own clipped, independently-hoverable cream tessera.
function pointsToClip(points: string): string {
  const coords = points
    .trim()
    .split(/\s+/)
    .map((p) => {
      const [x, y] = p.split(",").map(Number);
      return `${((x / 700) * 100).toFixed(3)}% ${((y / 200) * 100).toFixed(3)}%`;
    });
  return `polygon(${coords.join(", ")})`;
}

// Horizontal center (% of the 700-wide box) of a tile's bounding box, used to
// place its word roughly at the tile's middle.
function tileCenterX(points: string): number {
  const xs = points
    .trim()
    .split(/\s+/)
    .map((p) => Number(p.split(",")[0]));
  return ((Math.min(...xs) + Math.max(...xs)) / 2 / 700) * 100;
}

// Home background: the same mosaic frame system as interior pages, but arranged
// differently (side hills on the opposite corners, distinct shapes) so the two
// backgrounds read as their own places.
// Temporary toggle: set to false to hide the home page's bottom mosaic strip
// and the two side hills. The links-panel mosaic tile is separate and stays.
const SHOW_MOSAIC_FRAME = false;

function HomeMosaicFrame() {
  if (!SHOW_MOSAIC_FRAME) return null;
  return (
    <>
      <MosaicBottomStrip />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0 hidden overflow-hidden md:block"
      >
        <MosaicHill
          variant="b"
          side="left"
          className="left-[12px] top-20 h-[320px] w-[71px]"
        />
        <MosaicHill
          variant="a"
          side="right"
          className="bottom-40 right-[12px] h-[340px] w-[75px]"
        />
      </div>
    </>
  );
}

// Rotating typewriter "answers" to the hero question. Types a word char by
// char, holds it ~1s, then deletes it faster than it typed, and cycles the
// list. The blinking bar cursor reuses the caret-blink keyframe (which globals
// disables under prefers-reduced-motion; the loop itself also no-ops there,
// showing a single static answer).
const ANSWERS = [
  "Ruthless Optimist",
  "Engineer",
  "Student",
  "Musician",
  "Dreamer",
  "Boilermaker",
  "Researcher",
];

function TypingAnswers() {
  const [index, setIndex] = useState(0);
  const [text, setText] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      setText(ANSWERS[index]);
      return;
    }
    const current = ANSWERS[index];
    // Typing 80ms/char; hold 2600ms when full; deleting a brisk 40ms/char.
    const delay = deleting ? 40 : text.length < current.length ? 80 : 2600;
    const t = window.setTimeout(() => {
      if (!deleting) {
        if (text.length < current.length) {
          setText(current.slice(0, text.length + 1));
        } else {
          setDeleting(true);
        }
      } else if (text.length > 0) {
        setText(current.slice(0, text.length - 1));
      } else {
        setDeleting(false);
        setIndex((i) => (i + 1) % ANSWERS.length);
      }
    }, delay);
    return () => clearTimeout(t);
  }, [text, deleting, index]);

  return (
    <span
      className="font-mono text-[clamp(1.05rem,2.6vw,1.5rem)] leading-none text-[var(--color-ink)]"
      aria-label={`Keshav is a ${ANSWERS.join(", ")}`}
    >
      <span aria-hidden="true">{text}</span>
      <span
        aria-hidden="true"
        className="caret-blink ml-1 inline-block w-[0.5ch] bg-[var(--color-accent)]"
        style={{ height: "1.05em", verticalAlign: "-0.12em" }}
      />
    </span>
  );
}

export default function HomeChatClient({
  initialHistory,
}: {
  initialHistory?: ContribDay[] | null;
} = {}) {
  // Hide the "Scroll ↓" hint once the visitor scrolls the GitHub history column.
  const [historyScrolled, setHistoryScrolled] = useState(false);
  const linksBoxRef = useRef<HTMLDivElement>(null);
  // Ignore any history-scroll trigger for the first 250ms after load, so the
  // calendar's initial programmatic park-at-bottom (or early layout jitter)
  // can't dismiss the scroll hint before the visitor actually scrolls.
  const scrollArmedRef = useRef(false);
  useEffect(() => {
    const t = window.setTimeout(() => {
      scrollArmedRef.current = true;
    }, 250);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="relative h-[100dvh] overflow-hidden bg-[var(--color-surface)] text-[var(--color-ink)]">
      <HomeMosaicFrame />
      {/* Cream cover for the strip below the bottom mosaic, so the calendar
          can't peek through the gap between the mosaic and the page edge. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 z-[2] hidden h-[14px] bg-[var(--color-surface)] md:block"
      />
      <div className="relative mx-auto h-full w-full max-w-[1060px]">
        <section className="relative z-10 flex h-full flex-col justify-center px-7 py-12 md:py-8 md:mr-[310px]">
          <div className="rise" style={{ animationDelay: "80ms" }}>
            <h1 className="text-[clamp(2rem,4.6vw,3.1rem)] font-bold leading-[0.98] tracking-[-0.045em] text-[var(--color-ink)] md:whitespace-nowrap">
              Who is Keshav Sreekantham?
            </h1>
          </div>

          <div className="rise mt-5" style={{ animationDelay: "180ms" }}>
            <TypingAnswers />
          </div>

          <p
            className="rise mt-14 text-center font-mono text-[13px] uppercase tracking-[0.2em] text-[var(--color-ink-muted)] md:mt-16"
            style={{ animationDelay: "260ms" }}
          >
            Click a section to learn
          </p>

          <div
            ref={linksBoxRef}
            className="rise relative mx-auto mt-8 h-[116px] w-full max-w-[640px]"
            style={{ animationDelay: "340ms" }}
            aria-label="Sections"
          >
            <MosaicPanelBacking />
            {[
              { href: "/work", label: "Work", points: PANEL_SLICES[0], dx: 5 },
              { href: "/projects", label: "Projects", points: PANEL_SLICES[1], dx: 0 },
              { href: "/involvement", label: "Involvement", points: PANEL_SLICES[2], dx: 0 },
              { href: "/about", label: "About", points: PANEL_SLICES[3], dx: -5 },
            ].map((t) => (
              <Link
                key={t.href}
                href={t.href}
                aria-label={t.label}
                className="group absolute inset-0 z-10 bg-[var(--color-surface-raised)] transition-transform duration-200 ease-out hover:-translate-y-[6px]"
                style={{ clipPath: pointsToClip(t.points) }}
              >
                <span
                  className="absolute -translate-x-1/2 -translate-y-1/2 whitespace-nowrap text-[16px] font-bold text-[var(--color-ink)] transition-colors group-hover:text-[var(--color-accent)] md:text-[24px]"
                  style={{ left: `calc(${tileCenterX(t.points)}% + ${t.dx}px)`, top: "50%" }}
                >
                  {t.label}
                </span>
              </Link>
            ))}
          </div>

          <div
            className="rise mt-11 flex flex-wrap items-center justify-center gap-3"
            style={{ animationDelay: "440ms" }}
          >
            <a
              href="https://www.linkedin.com/in/ksreekan"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[var(--color-hairline-strong)] text-[var(--color-ink)] transition-colors hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
            >
              <Linkedin className="h-[18px] w-[18px]" />
            </a>
            <a
              href="https://github.com/KeshavSree"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[var(--color-hairline-strong)] text-[var(--color-ink)] transition-colors hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
            >
              <Github className="h-[18px] w-[18px]" />
            </a>
            <a
              href="mailto:keshav.sreekantham@gmail.com"
              className="inline-flex items-center rounded-full border border-[var(--color-hairline-strong)] px-5 py-2 text-[15px] text-[var(--color-ink)] transition-colors hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
            >
              Email
            </a>
            <a
              href="/resume.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center rounded-full border border-[var(--color-hairline-strong)] px-5 py-2 text-[15px] text-[var(--color-ink)] transition-colors hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
            >
              Resume
            </a>
          </div>
        </section>
        <VerticalHistoryCalendar
          anchorRef={linksBoxRef}
          initialData={initialHistory}
          onScrolledChange={(s) => {
            // Latch: once the visitor scrolls the history, keep the hint gone
            // even if they scroll back to the original (bottom) position.
            if (s && scrollArmedRef.current) setHistoryScrolled(true);
          }}
        />
        {/* Scroll hint centered under the GitHub history column; fades once the
            visitor scrolls that column. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute bottom-70 right-[143px] z-[20] hidden translate-x-1/2 md:block"
        >
          <div className="rise" style={{ animationDelay: "500ms" }}>
            <div
              className={`flex flex-col items-center gap-1 font-mono text-[11px] uppercase tracking-[0.2em] text-[var(--color-ink-muted)] transition-all duration-300 ease-out ${
                historyScrolled ? "translate-y-24 opacity-0" : "translate-y-0 opacity-100"
              }`}
            >
              <span>Scroll</span>
              <ChevronDown className="h-4 w-4" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
