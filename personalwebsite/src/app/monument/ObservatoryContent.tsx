import Image from "next/image";
import {ArrowUpRight,Github,Linkedin,Mail} from "lucide-react";
import {getJobs} from "@/data/workData";
import {getInvolvements} from "@/data/involvementData";
import {projects} from "@/data/projectsData";
import type {Project,ProjectLink} from "@/data/projectsData";
import about from "@/data/about.json";
import ObservatoryEntryBrowser from "./ObservatoryEntryBrowser";
import type {InvolvementEntry} from "@/data/involvementData";
import type {PalaceSection} from "./ObservatoryNavigation";

const linkLabels:Record<ProjectLink["type"],string>={github:"GitHub",devpost:"Devpost",website:"Visit",npm:"npm",appstore:"App Store",linkedin:"LinkedIn",arxiv:"arXiv",pdf:"PDF",youtube:"YouTube",instagram:"Instagram"};

export function ObservatoryContactLinks(){
  return <div className="observatory-contact-links">
    <a href="https://www.linkedin.com/in/ksreekan" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" title="LinkedIn"><Linkedin size={18} aria-hidden="true"/></a>
    <a href="https://github.com/KeshavSree" target="_blank" rel="noopener noreferrer" aria-label="GitHub" title="GitHub"><Github size={18} aria-hidden="true"/></a>
    <a href="mailto:keshav.sreekantham@gmail.com" aria-label="Email" title="Email"><Mail size={18} aria-hidden="true"/></a>
    <a href="/resume" target="_blank" rel="noopener noreferrer">Resume</a>
  </div>;
}

function Paragraphs({text}:{text:string}){
  return text.split(/\n\s*\n/).map((paragraph,index)=><p key={index}>{paragraph.split(/(\*[^*]+\*)/g).map((part,partIndex)=>part.startsWith("*")&&part.endsWith("*")?<em key={partIndex}>{part.slice(1,-1)}</em>:part)}</p>);
}

/** Preserve the original content, with concise Work summaries for the palace. */
export default function ObservatoryContent({section}:{section:PalaceSection}){
  if(section==="work")return <>{getJobs().map(job=><article className="observatory-entry" key={`${job.company}-${job.title}`}>
    <p className="observatory-entry-date">{job.year}</p>
    <div className="observatory-work-heading">
      <Image className="observatory-work-logo" src={job.icon} alt={`${job.company} logo`} width={48} height={48} sizes="48px"/>
      <div><h2>{job.title}</h2><p className="observatory-entry-subtitle">{job.company}</p></div>
    </div>
    <p>{job.summary}</p>
  </article>)}</>;

  if(section==="projects")return <ObservatoryEntryBrowser section="projects" headingText="What have I built?" items={projects.map(project=>({slug:project.id,title:project.title,date:project.date,links:project.links.map(link=>({url:link.url,label:link.label||linkLabels[link.type]})),summary:project.description,body:<ObservatoryProjectDetails project={project}/>}))}/>;

  if(section==="involvement")return <ObservatoryEntryBrowser section="involvement" headingText="Where am I involved on campus?" items={getInvolvements().map(item=>({...item,body:<ObservatoryInvolvementDetails item={item}/>}))}/>;

  return <>
    <div className="observatory-about-intro"><div className="observatory-about-profile"><Image className="observatory-about-portrait" src="/keshav-linkedin.png" alt="Keshav Sreekantham" width={800} height={800} sizes="(max-width: 1000px) 150px, 180px"/><ObservatoryContactLinks/></div><p>{about.bio}</p></div>
    <section className="observatory-entry"><h2>Education</h2><div className="observatory-education-heading"><Image src="/purdue-linkedin-logo.jpg" alt="Purdue University logo" width={48} height={48}/><div><p>{about.education.institution} · {about.education.year}</p><p className="observatory-entry-subtitle">{about.education.degree}</p></div></div><div className="observatory-prose-block"><h3>Classes</h3><p>{about.classes.join(" · ")}</p></div></section>
    <section className="observatory-entry"><h2>More about me</h2><dl className="observatory-questions">{about.qa.map(({q,a})=><div key={q}><dt>{q}</dt><dd>{a}</dd></div>)}</dl></section>
  </>;
}

export function ObservatoryInvolvementDetails({item}:{item:InvolvementEntry}){
  return <>
    {item.link&&<div className="observatory-entry-links"><a href={item.link} target="_blank" rel="noopener noreferrer">Visit site<ArrowUpRight className="observatory-external-arrow" size={14} aria-hidden="true"/></a></div>}
    {item.whatIsIt&&<div className="observatory-prose-block"><h3>What is it?</h3><Paragraphs text={item.whatIsIt}/></div>}
    {item.whatsMyRole&&<div className="observatory-prose-block"><h3>What&apos;s my role?</h3><Paragraphs text={item.whatsMyRole}/></div>}
    {item.contributions.length>0&&<div className="observatory-prose-block"><h3>Contributions</h3><dl>{item.contributions.map((contribution,index)=><div key={index}><dt>{contribution.area}</dt><dd>{contribution.detail}</dd></div>)}</dl></div>}
    {item.howItShapedMe.length>0&&<div className="observatory-prose-block"><h3>How has it shaped me?</h3>{item.howItShapedMe.map((paragraph,index)=><p key={index}>{paragraph.split(/(\*[^*]+\*)/g).map((part,partIndex)=>part.startsWith("*")&&part.endsWith("*")?<em key={partIndex}>{part.slice(1,-1)}</em>:part)}</p>)}</div>}
    {item.highlights.length>0&&<div className="observatory-prose-block"><h3>Highlights</h3><ul>{item.highlights.map((bullet,index)=><li key={index}>{bullet}</li>)}</ul></div>}

  </>;
}

export function ObservatoryProjectDetails({project}:{project:Project}){
  return <>
    {project.awards&&<p className="observatory-entry-award">{project.awards}</p>}
    {project.description&&<p>{project.description}</p>}
    {project.sections?.map(section=><section className="observatory-prose-block" key={section.title}><h3>{section.title}</h3><Paragraphs text={section.body}/>{section.items&&<ol>{section.items.map((item,index)=><li key={index}>{item}</li>)}</ol>}</section>)}
    {project.tools&&<p className="observatory-entry-tools"><span>Tools:</span> {project.tools}</p>}
    <div className="observatory-entry-links">{project.links.map(link=><a key={link.url} href={link.url} target="_blank" rel="noopener noreferrer">{link.label||linkLabels[link.type]}<ArrowUpRight className="observatory-external-arrow" size={14} aria-hidden="true"/></a>)}</div>
    {project.display.websiteUrl&&<iframe className="observatory-website-preview" loading="lazy" src={project.display.websiteUrl} title={`${project.title} website preview`}/> }
    {project.display.embedUrl&&<iframe className="observatory-project-embed" loading="lazy" height={project.display.embedHeight??375} src={project.display.embedUrl} title={`${project.title} embed`} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen/>}
    {project.display.images?.map(image=><Image className="observatory-project-image" key={image.src} src={image.src} alt={image.alt} width={image.width} height={image.height} sizes="(max-width: 760px) 90vw, 42vw"/>)}

  </>;
}
