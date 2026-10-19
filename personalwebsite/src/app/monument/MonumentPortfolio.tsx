"use client";

import { useEffect, useState } from "react";
import MonumentArtwork, { type SceneName } from "./MonumentArtwork";
import work from "@/data/work.json";
import projects from "@/data/projects.json";
import involvement from "@/data/involvement.json";
import about from "@/data/about.json";
import "./monument.css";

const categories: { id: Exclude<SceneName, "home">; label: string }[] = [
  { id: "experience", label: "Experience" },
  { id: "projects", label: "Projects" },
  { id: "involvement", label: "Involvement" },
  { id: "about", label: "About" },
];

function fromHash(): SceneName {
  const value = window.location.hash.slice(1);
  return categories.some(({ id }) => id === value) ? value as SceneName : "home";
}

function SectionContent({ scene }: { scene: Exclude<SceneName, "home"> }) {
  if (scene === "experience") {
    return <>
      {work.map((job) => <article className="mv-entry" key={`${job.company}-${job.role}`}>
        <span className="mv-entry-date">{job.startDate} — {job.endDate}</span>
        <h3>{job.role}</h3><p className="mv-entry-subtitle">{job.company}</p>
        <ul>{job.highlights.map((point) => <li key={point}>{point}</li>)}</ul>
      </article>)}
    </>;
  }
  if (scene === "projects") {
    return <>
      {projects.map((project) => <article className="mv-entry" key={project.id}>
        <span className="mv-entry-date">{project.date}</span>
        <h3>{project.title}</h3><p>{project.description}</p>
        <p className="mv-entry-tools">{project.tools}</p>
        {project.links.length > 0 && <div className="mv-entry-links">{project.links.map((link) => <a href={link.url} target="_blank" rel="noopener noreferrer" key={link.url}>{link.label}<span aria-hidden="true"> ↗</span></a>)}</div>}
      </article>)}
    </>;
  }
  if (scene === "involvement") {
    return <>
      {involvement.map((item) => <article className="mv-entry" key={item.slug}>
        <span className="mv-entry-date">{item.role}</span>
        <h3>{item.title}</h3>
        {item.whatIsIt && <p>{item.whatIsIt}</p>}
        {item.whatsMyRole && <p>{item.whatsMyRole}</p>}
        {item.link && <div className="mv-entry-links"><a href={item.link} target="_blank" rel="noopener noreferrer">Visit {item.title}<span aria-hidden="true"> ↗</span></a></div>}
      </article>)}
    </>;
  }
  return <>
    <article className="mv-entry mv-about-entry"><h3>{about.heading}</h3><p>{about.bio}</p></article>
    <article className="mv-entry"><span className="mv-entry-date">Education</span><h3>{about.education.institution}</h3><p>{about.education.degree} · {about.education.year}</p></article>
    <article className="mv-entry"><span className="mv-entry-date">What I work with</span><p>{about.skills.join(" · ")}</p></article>
    <article className="mv-entry"><span className="mv-entry-date">Get in touch</span><div className="mv-entry-links"><a href="mailto:keshav.sreekantham@gmail.com">Email ↗</a><a href="https://github.com/KeshavSree" target="_blank" rel="noopener noreferrer">GitHub ↗</a><a href="https://www.linkedin.com/in/ksreekan" target="_blank" rel="noopener noreferrer">LinkedIn ↗</a><a href="/resume" target="_blank" rel="noopener noreferrer">Resume ↗</a></div></article>
  </>;
}

export default function MonumentPortfolio() {
  const [scene, setScene] = useState<SceneName>("home");
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const sync = () => {
      const next = fromHash();
      setScene(next);
    };
    sync();
    setIsReady(true);
    window.addEventListener("popstate", sync);
    return () => {
      window.removeEventListener("popstate", sync);
    };
  }, []);

  const choose = (next: SceneName) => {
    if (next === scene) return;
    if (next === "home") {
      window.history.pushState(null, "", window.location.pathname + window.location.search);
    } else {
      window.history.pushState(null, "", `#${next}`);
    }
    setScene(next);
  };

  return <div className={`mv-site ${scene === "home" ? "mv-home" : "mv-open"}`} data-scene={scene} data-ready={isReady}>
    <div className="mv-grain" aria-hidden="true" />
    <header className="mv-header">
      <h1 className="mv-brand"><button className="mv-name" type="button" onClick={() => choose("home")} aria-label="Keshav Sreekantham — return to the opening monument">Keshav Sreekantham</button></h1>
    </header>

    <main className="mv-layout">
      <div className="mv-left-column">
        <nav className="mv-nav" aria-label="Portfolio sections">
          {categories.map(({ id, label }) => <button key={id} type="button" onClick={() => choose(id)} className={`mv-category ${scene === id ? "is-active" : ""}`} aria-current={scene === id ? "page" : undefined}><span className="mv-category-diamond" aria-hidden="true" />{label}</button>)}
        </nav>
        <p className="mv-instruction">Choose a path to change the monument.</p>
        <div className="mv-side-links"><a href="mailto:keshav.sreekantham@gmail.com">Contact</a><a href="/resume" target="_blank" rel="noopener noreferrer">Résumé</a><a href="https://github.com/KeshavSree" target="_blank" rel="noopener noreferrer">GitHub</a></div>
      </div>

      <div className="mv-right-column">
        <div className="mv-art-window"><MonumentArtwork scene={scene}/></div>
        {scene !== "home" && <section className="mv-content" key={scene} aria-label={`${scene} details`}>
          <div className="mv-content-heading"><span className="mv-roman">{String(categories.findIndex(({ id }) => id === scene) + 1).padStart(2, "0")}</span><h2>{scene}</h2><button type="button" className="mv-close" onClick={() => choose("home")}>Close<span aria-hidden="true"> ×</span></button></div>
          <div className="mv-content-body"><SectionContent scene={scene} /></div>
        </section>}
      </div>
    </main>
    <footer className="mv-footer"><span>© {new Date().getFullYear()} Keshav Sreekantham</span></footer>
  </div>;
}
