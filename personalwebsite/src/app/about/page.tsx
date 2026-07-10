import type { Metadata } from "next";
import { Linkedin, Github } from "lucide-react";
import { MosaicArch, MosaicDivider, MosaicBullet } from "@/app/components/mosaic";

export const metadata: Metadata = {
  title: "About",
  description:
    "Keshav Sreekantham - Data Science (Computer Science) at Purdue, deploying AI at scale",
};

const SKILLS = [
  "Productization",
  "Cloud Infrastructure",
  "CI Pipeline Development",
  "Machine Learning",
  "Azure",
  "AWS",
  "Python",
  "Rust",
  "Docker",
  "Kubernetes",
];

const CLASSES = [
  "Data Structures & Algorithms",
  "Object-Oriented Programming",
  "Foundations of Computer Science",
  "Introduction to Machine Learning",
  "Numerical Methods",
  "Statistical Theory",
];

const EXPLORING = [
  "Current limits of edge computation",
  "Scalable solutions to private enterprise AI deployment",
  "Existing service ease of agent integration",
];

const ABOUT_QA = [
  { q: "What is your favorite album?", a: "Submarine by The Marías." },
  { q: "How long have you played clarinet?", a: "8 years." },
  { q: "What is your favorite food?", a: "Tacos." },
  {
    q: "What are some of your hobbies?",
    a: "Climbing, eating, pickleball, and on occasion video games and volleyball.",
  },
  {
    q: "Why is every section a question?",
    a: "It's all about asking the right questions.",
  },
];

export default function AboutPage() {
  return (
    <article className="mx-auto max-w-[840px] px-5 pt-16 pb-24 md:px-6 md:pt-24">
      <h1 className="text-[clamp(2rem,5vw,3rem)] font-medium leading-[1.02] tracking-[-0.02em] text-[var(--color-ink)]">
        Who am I?
      </h1>
      <div className="mt-7 flex flex-wrap items-center gap-3">
        <a
          href="https://www.linkedin.com/in/ksreekan"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="LinkedIn"
          className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[var(--color-hairline-strong)] text-[var(--color-ink)] transition-colors hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
        >
          <Linkedin className="h-4 w-4" />
        </a>
        <a
          href="https://github.com/KeshavSree"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="GitHub"
          className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[var(--color-hairline-strong)] text-[var(--color-ink)] transition-colors hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
        >
          <Github className="h-4 w-4" />
        </a>
        <a
          href="mailto:keshav.sreekantham@gmail.com"
          className="inline-flex items-center rounded-full border border-[var(--color-hairline-strong)] px-4 py-1.5 text-[14px] text-[var(--color-ink)] transition-colors hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
        >
          Contact Me
        </a>
        <a
          href="/resume.pdf"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center rounded-full border border-[var(--color-hairline-strong)] px-4 py-1.5 text-[14px] text-[var(--color-ink)] transition-colors hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
        >
          Resume
        </a>
      </div>

      <section className="mt-10 mb-6 space-y-5 text-[16px] leading-[1.75] text-[var(--color-ink)]">
        <p>
          I find the gap. Whether it be building the brand of Purdue Stack or designing tools for Fortune 100 clients,
            I notice problems. Most of those problems I don’t have the capability to solve at that moment,
            whether it be due to time, resources, or my authority to change things.
            However, more often than not, I find a gap within my grasp and I close it.
            The best part is that this skill is field-agnostic, and I grow no matter what I am doing.
        </p>
      </section>

      {/* Tall broken-arch decoration. Near-full-bleed but inset 12px on each side
          (w = 100vw - 24px, centered) to match the uniform gap the bottom strip /
          side hills keep from the screen edge. The middle is transparent, so the
          negative bottom margin lets the Education section pull up into its empty
          centre instead of leaving a blank block. pointer-events-none + aria-hidden:
          purely decorative. */}
      <div
        aria-hidden="true"
        className="pointer-events-none relative left-1/2 mt-8 mb-[-28vw] w-[calc(100vw-24px)] -translate-x-1/2"
      >
        <MosaicArch />
      </div>

      <Section label="Education">
        <p className="text-[16px] text-[var(--color-ink)]">
          <span className="font-medium">Purdue University</span>
          <span className="text-[var(--color-ink-subtle)]"> · 2028</span>
        </p>
        <p className="mt-1 text-[14.5px] text-[var(--color-ink-muted)]">
          B.S. in Data Science (Computer Science)
        </p>
      </Section>

      <Section label="Classes">
        <p className="text-[15px] leading-[1.9] text-[var(--color-ink)]">
          {CLASSES.map((c, i) => (
            <span key={c}>
              {c}
              {i < CLASSES.length - 1 && (
                <span className="mx-2 text-[var(--color-ink-faint)]">·</span>
              )}
            </span>
          ))}
        </p>
      </Section>

      <Section label="Skills">
        <p className="text-[15px] leading-[1.9] text-[var(--color-ink)]">
          {SKILLS.map((skill, i) => (
            <span key={skill}>
              {skill}
              {i < SKILLS.length - 1 && (
                <span className="mx-2 text-[var(--color-ink-faint)]">·</span>
              )}
            </span>
          ))}
        </p>
      </Section>

      <Section label="What am I learning?">
        <ul className="space-y-2.5">
          {EXPLORING.map((item, i) => (
            <li
              key={item}
              className="relative pl-5 text-[15.5px] leading-relaxed text-[var(--color-ink)]"
            >
              <MosaicBullet variant={i} className="absolute left-0 top-[8px] w-[9px]" />
              {item}
            </li>
          ))}
        </ul>
      </Section>

      <Divider variant={2} />

      <section className="my-10">
        <h2 className="text-[19px] font-medium leading-tight tracking-[-0.01em] text-[var(--color-ink)] md:text-[21px]">
          More about me
        </h2>
        <dl className="mt-6 space-y-5">
          {ABOUT_QA.map(({ q, a }) => (
            <div key={q}>
              <dt className="font-mono text-[13px] tracking-[0.02em] text-[var(--color-ink-subtle)]">
                {q}
              </dt>
              <dd className="mt-2 text-[15.5px] leading-[1.7] text-[var(--color-ink-muted)]">
                {a}
              </dd>
            </div>
          ))}
        </dl>
      </section>
    </article>
  );
}

function Section({ label, children }: { label: string; children?: React.ReactNode }) {
  return (
    <section className="my-10">
      <p className="mb-4 font-mono text-[13px] uppercase tracking-[0.2em] text-[var(--color-ink-subtle)]">
        {label}
      </p>
      {children}
    </section>
  );
}

function Divider({ variant = 0 }: { variant?: number }) {
  return <MosaicDivider variant={variant} />;
}
