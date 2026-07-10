"use client";
import Image from "next/image";
import { JobEntry } from "@/utils/jobUtils";
import { MosaicDivider, MosaicBullet } from "@/app/components/mosaic";

function slugify(s: string) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

interface Props {
  jobs: JobEntry[];
}

export function WorkTimelineClient({ jobs }: Props) {
  return (
    <article className="mx-auto max-w-[880px] px-5 pt-16 pb-24 md:px-6 md:pt-24">
      <h1 className="text-[clamp(2rem,5vw,3rem)] font-medium leading-[1.02] tracking-[-0.02em] text-[var(--color-ink)]">
        Where have I worked?
      </h1>
      <ol className="mt-14">
        {jobs.map((job, i) => (
          <li
            key={i}
            id={slugify(job.company)}
            className="relative scroll-mt-[80px]"
          >
            <MosaicDivider variant={(i * 5 + 2) % 3} />
            <div className="grid grid-cols-[44px_1fr] gap-5 py-8 md:grid-cols-[56px_1fr] md:gap-7">
              <div className="relative flex flex-none items-start pt-0.5">
                <div className="relative h-11 w-11 overflow-hidden rounded-md bg-[var(--color-surface-muted)] md:h-12 md:w-12">
                  <Image
                    src={job.icon}
                    alt={job.company}
                    fill
                    sizes="48px"
                    className="object-cover"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).style.display = "none";
                    }}
                  />
                </div>
              </div>
              <div className="min-w-0">
                <div className="flex items-baseline justify-between gap-x-3">
                  <h2 className="text-[19px] font-medium leading-tight tracking-[-0.01em] text-[var(--color-ink)] md:text-[21px]">
                    {job.title}
                  </h2>
                  <span className="flex-none font-mono text-[13px] uppercase tracking-[0.14em] text-[var(--color-ink-subtle)]">
                    {job.year}
                  </span>
                </div>
                <p className="mt-1 text-[14.5px] text-[var(--color-ink-muted)]">
                  {job.company}
                </p>
                <ul className="mt-4 space-y-2.5">
                  {job.description.map((bullet, j) => (
                    <li
                      key={j}
                      className="relative pl-5 text-[15px] leading-[1.65] text-[var(--color-ink)]"
                    >
                      <MosaicBullet variant={j} className="absolute left-0 top-[11px] w-[9px]" />
                      {bullet}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </li>
        ))}
      </ol>
    </article>
  );
}
