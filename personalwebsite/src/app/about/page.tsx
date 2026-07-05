import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";

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

const EXPLORING = [
  "[[MCP and agent-callable real-world services]]",
  "[[Agents that save time, not just effort]]",
  "[[Chat-first interfaces and AI-native product surfaces]]",
  "[[Founder density at the undergrad level]]",
];

const INTERESTS: { label: string; image: string; href?: string }[] = [
  { label: "[[Music]]", image: "/interests/music-interest.jpg" },
  { label: "[[Travel]]", image: "/interests/travel-interest.jpg" },
  { label: "[[AI / ML]]", image: "/interests/ai-interest.jpg" },
];

const CONNECT = [
  { label: "LinkedIn", href: "https://www.linkedin.com/in/ksreekan" },
  { label: "GitHub", href: "https://github.com/KeshavSree" },
  { label: "Email", href: "mailto:ksreekan@purdue.edu" },
  { label: "Resume (PDF)", href: "/resume.pdf" },
];

export default function AboutPage() {
  return (
    <article className="mx-auto max-w-[720px] px-5 pt-16 pb-24 md:px-6 md:pt-24">
      <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-[var(--color-ink-subtle)]">
        About
      </p>

      <h1 className="mt-5 text-[clamp(2rem,5vw,3rem)] font-medium leading-[1.02] tracking-[-0.02em] text-[var(--color-ink)]">
        Keshav Sreekantham
      </h1>
      <ul className="mt-7 flex flex-wrap gap-x-6 gap-y-2">
        {CONNECT.map((c) => (
          <li key={c.label}>
            <a
              href={c.href}
              target={c.href.startsWith("http") ? "_blank" : undefined}
              rel={c.href.startsWith("http") ? "noopener noreferrer" : undefined}
              className="group inline-flex items-baseline gap-1.5 text-[15px] text-[var(--color-ink)] transition-colors hover:text-[var(--color-accent)]"
            >
              <span className="border-b border-[var(--color-hairline-strong)] pb-0.5 group-hover:border-[var(--color-accent)]">
                {c.label}
              </span>
              <span className="text-[var(--color-ink-faint)] transition-colors group-hover:text-[var(--color-accent)]">
                ↗
              </span>
            </a>
          </li>
        ))}
      </ul>

      <section className="mt-10 mb-6 space-y-5 text-[16px] leading-[1.75] text-[var(--color-ink)]">
        <p>
          I find the gap. Whether it be building the brand of Purdue Stack or designing tools for Fortune 100 clients,
            I notice problems. Most of those problems I don’t have the capability to solve at that moment,
            whether it be due to time, resources, or my authority to change things.
            However, more often than not, I find a gap within my grasp and I close it.
            The best part is that this skill is field-agnostic, and I grow no matter what I am doing.
        </p>
      </section>

      <Divider />

      <Section label="Education">
        <p className="text-[16px] text-[var(--color-ink)]">
          <span className="font-medium">Purdue University</span>
          <span className="text-[var(--color-ink-subtle)]"> · [[2023–2027]]</span>
        </p>
        <p className="mt-1 text-[14.5px] text-[var(--color-ink-muted)]">
          [[B.S. in Computer Science &amp; Artificial Intelligence (double major).]]
        </p>
      </Section>

      <Divider />

      <Section label="Currently exploring">
        <ul className="space-y-2.5">
          {EXPLORING.map((item) => (
            <li
              key={item}
              className="relative pl-5 text-[15.5px] leading-relaxed text-[var(--color-ink)]"
            >
              <span className="absolute left-0 top-[10px] h-px w-3 bg-[var(--color-accent)]" />
              {item}
            </li>
          ))}
        </ul>
      </Section>

      <Divider />

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

      <Divider />

      <Section label="Interests">
        <div className="grid grid-cols-2 gap-3">
          {INTERESTS.map((interest) => {
            const Tag = interest.href ? Link : "div";
            const props = interest.href ? { href: interest.href } : {};
            return (
              <Tag
                key={interest.label}
                {...(props as { href: string })}
                className="group relative block aspect-[4/3] overflow-hidden rounded-md"
              >
                <Image
                  src={interest.image}
                  alt={interest.label}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                  sizes="(max-width: 768px) 50vw, 360px"
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[oklch(20%_0.018_55_/_0.55)] to-transparent p-3">
                  <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-[var(--color-surface)]">
                    {interest.label}
                  </span>
                </div>
              </Tag>
            );
          })}
        </div>
      </Section>

      <Divider />

      <blockquote className="my-10 border-l-2 border-[var(--color-accent)] pl-6">
        <p className="font-serif text-[20px] italic leading-snug text-[var(--color-ink-muted)]">
          [[He who has a why to live for can bear almost any how.]]
        </p>
        <footer className="mt-3 text-[13px] text-[var(--color-ink-subtle)]">
          [[Friedrich Nietzsche]]
        </footer>
      </blockquote>
    </article>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <section className="my-10">
      <p className="mb-4 font-mono text-[11px] uppercase tracking-[0.2em] text-[var(--color-ink-subtle)]">
        {label}
      </p>
      {children}
    </section>
  );
}

function Divider() {
  return <div className="h-px bg-[var(--color-hairline)]" />;
}
