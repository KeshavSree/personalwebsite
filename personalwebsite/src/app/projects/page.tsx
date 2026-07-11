import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { projects } from "@/data/projectsData";
import type { Project, ProjectLink } from "@/data/projectsData";
import type { Metadata } from "next";
import { HashScroller } from "@/app/components/HashScroller";
import { MosaicDivider } from "@/app/components/mosaic";

export const metadata: Metadata = {
  title: "Projects",
  description: "Learn about selected projects Keshav has shipped.",
};

const LINK_LABEL: Record<ProjectLink["type"], string> = {
  github: "GitHub",
  devpost: "Devpost",
  website: "Visit",
  npm: "npm",
  appstore: "App Store",
  linkedin: "LinkedIn",
  arxiv: "arXiv",
  pdf: "PDF",
  youtube: "YouTube",
  instagram: "Instagram",
};

export default function ProjectsPage() {
  return (
    <article className="mx-auto max-w-[920px] px-5 pt-16 pb-24 md:px-6 md:pt-24">
      <HashScroller />
      <h1 className="text-[clamp(2rem,5vw,3rem)] font-medium leading-[1.02] tracking-[-0.02em] text-[var(--color-ink)]">
        What have I built?
      </h1>
      <ol className="mt-14">
        {projects.map((project, i) => (
          <ProjectBlock key={project.id} project={project} index={i} />
        ))}
      </ol>
    </article>
  );
}

function ProjectBlock({ project, index }: { project: Project; index: number }) {
  const { display, links } = project;
  return (
    <li id={project.id} className="scroll-mt-[80px]">
      <MosaicDivider variant={(index * 5 + 2) % 3} />
      <div className="py-10">
      <header className="flex items-baseline justify-between gap-x-4">
        <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
          <h2 className="text-[22px] font-medium leading-tight tracking-[-0.01em] text-[var(--color-ink)] md:text-[26px]">
            {project.title}
          </h2>
          {project.awards && (
            <span className="rounded-sm bg-[var(--color-accent-soft)] px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--color-accent-hover)]">
              {project.awards}
            </span>
          )}
        </div>
        <span className="flex-none font-mono text-[13px] uppercase tracking-[0.14em] text-[var(--color-ink-subtle)]">
          {project.date}
        </span>
      </header>

      <p className="mt-3 text-[15.5px] leading-[1.7] text-[var(--color-ink)]">
        {project.description}
      </p>

      <p className="mt-2 text-[13px] text-[var(--color-ink-muted)]">
        <span className="text-[var(--color-ink)]">Tools:</span> {project.tools}
      </p>

      {links.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {links.map((link) => (
            <a
              key={link.url}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-1.5 rounded-full border border-[var(--color-hairline-strong)] bg-[var(--color-surface-raised)] px-3.5 py-1.5 text-[13px] text-[var(--color-ink)] transition-all hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
            >
              {LINK_LABEL[link.type] ?? link.label}
              <ArrowUpRight className="h-3 w-3 opacity-60 transition-opacity group-hover:opacity-100" />
            </a>
          ))}
        </div>
      )}

      {display.embedUrl && (
        <div className="mt-6 overflow-hidden rounded-md border border-[var(--color-hairline)] bg-[var(--color-surface-muted)]">
          <iframe
            className="block w-full"
            height={display.embedHeight ?? 375}
            src={display.embedUrl}
            title={`${project.title} embed`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      )}

      {display.images && display.images.length > 0 && (
        <div className="mt-6 flex flex-col gap-4">
          {display.images.map((img) => (
            <div
              key={img.src}
              className="overflow-hidden rounded-md border border-[var(--color-hairline)] bg-[var(--color-surface-muted)]"
            >
              <Image
                src={img.src}
                alt={img.alt}
                width={img.width}
                height={img.height}
                className="h-auto w-full"
              />
            </div>
          ))}
        </div>
      )}
      </div>
    </li>
  );
}
