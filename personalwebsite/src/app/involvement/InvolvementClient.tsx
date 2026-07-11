"use client";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { InvolvementEntry } from "@/data/involvementData";
import { MosaicDivider, MosaicBullet } from "@/app/components/mosaic";

interface Props {
  involvements: InvolvementEntry[];
}

export function InvolvementClient({ involvements }: Props) {
  return (
    <article className="mx-auto max-w-[880px] px-5 pt-16 pb-24 md:px-6 md:pt-24">
      <h1 className="text-[clamp(2rem,5vw,3rem)] font-medium leading-[1.02] tracking-[-0.02em] text-[var(--color-ink)]">
        Where am I involved on campus?
      </h1>
      {involvements.length === 0 ? (
        <p className="mt-14 text-[15px] text-[var(--color-ink-muted)]">
          Nothing here yet.
        </p>
      ) : (
        <div className="mt-14 space-y-16">
          {involvements.map((inv, i) => (
            <div
              key={inv.slug}
              className={i === involvements.length - 1 ? "pb-16 md:pb-24" : ""}
            >
              <MosaicDivider variant={(i * 5 + 2) % 3} />
              <InvolvementSection inv={inv} index={i} />
            </div>
          ))}
        </div>
      )}
    </article>
  );
}

function InvolvementSection({
  inv,
  index,
}: {
  inv: InvolvementEntry;
  index: number;
}) {
  return (
    <section id={inv.slug} className="scroll-mt-[80px] pt-10">
      <header>
        <div className="flex items-baseline justify-between gap-x-3">
          <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
            <h2 className="text-[clamp(1.4rem,2.6vw,1.75rem)] font-medium leading-tight tracking-[-0.01em] text-[var(--color-ink)]">
              {inv.title}
            </h2>
            <span className="relative top-[1.5px] flex items-center gap-x-2.5">
              <MosaicBullet
                variant={index}
                className="h-[7px] w-[7px] shrink-0"
              />
              <span className="text-[15.5px] text-[var(--color-ink-muted)]">
                {inv.role}
              </span>
            </span>
          </div>
          <span className="flex-none font-mono text-[13px] uppercase tracking-[0.14em] text-[var(--color-ink-subtle)]">
            {inv.date}
          </span>
        </div>
        {inv.link && (
          <Link
            href={inv.link}
            target="_blank"
            rel="noopener noreferrer"
            className="group mt-5 inline-flex items-center gap-1.5 rounded-full border border-[var(--color-hairline-strong)] bg-[var(--color-surface-raised)] px-3.5 py-1.5 text-[13px] text-[var(--color-ink)] transition-all hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
          >
            Visit site
            <ArrowUpRight className="h-3 w-3 opacity-60 transition-opacity group-hover:opacity-100" />
          </Link>
        )}
      </header>

      {inv.whatIsIt && (
        <Block label="What is it?" body={inv.whatIsIt} uppercaseLabel={false} />
      )}
      {inv.whatsMyRole && (
        <Block label="What's my role?" body={inv.whatsMyRole} uppercaseLabel={false} />
      )}

      {inv.contributions.length > 0 && (
        <div className="mt-10">
          <p className="font-mono text-[13px] uppercase tracking-[0.2em] text-[var(--color-ink-subtle)]">
            Contributions
          </p>
          <dl className="mt-5 space-y-6">
            {inv.contributions.map((c, i) => (
              <div
                key={i}
                className="grid grid-cols-1 gap-2 md:grid-cols-[180px_1fr] md:gap-6"
              >
                <dt className="font-mono text-[12px] uppercase tracking-[0.14em] text-[var(--color-ink)]">
                  {c.area}
                </dt>
                <dd className="text-[15px] leading-[1.65] text-[var(--color-ink-muted)]">
                  {c.detail}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      )}

      {inv.howItShapedMe.length > 0 && (
        <div className="mt-10">
          <p className="font-mono text-[13px] tracking-[0.02em] text-[var(--color-ink-subtle)]">
            How has it shaped me?
          </p>
          <div className="mt-4 space-y-4 text-[15.5px] leading-[1.7] text-[var(--color-ink)]">
            {inv.howItShapedMe.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
        </div>
      )}

      {inv.highlights.length > 0 && (
        <div className="mt-10">
          <p className="font-mono text-[13px] uppercase tracking-[0.2em] text-[var(--color-ink-subtle)]">
            Highlights
          </p>
          <ul className="mt-5 space-y-2.5">
            {inv.highlights.map((b, i) => (
              <li
                key={i}
                className="relative pl-5 text-[15px] leading-[1.65] text-[var(--color-ink)]"
              >
                <span className="absolute left-0 top-[12px] h-px w-3 bg-[var(--color-hairline-strong)]" />
                {b}
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}

function Block({
  label,
  body,
  uppercaseLabel = true,
}: {
  label: string;
  body: string;
  uppercaseLabel?: boolean;
}) {
  return (
    <div className="mt-10">
      <p
        className={`font-mono text-[13px] text-[var(--color-ink-subtle)] ${
          uppercaseLabel ? "uppercase tracking-[0.2em]" : "tracking-[0.02em]"
        }`}
      >
        {label}
      </p>
      <div className="mt-4 space-y-4 text-[15.5px] leading-[1.7] text-[var(--color-ink)]">
        {body.split(/\n\s*\n/).map((para, i) => (
          <p key={i}>{para}</p>
        ))}
      </div>
    </div>
  );
}
