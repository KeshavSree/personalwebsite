"use client";
import {useEffect,useLayoutEffect,useRef,useState} from "react";
import type {ReactNode} from "react";
import Image from "next/image";
import {ArrowLeft,ArrowRight,ArrowUpRight} from "lucide-react";

type Entry={slug:string;title:string;role?:string;date?:string;logo?:string;links?:{label:string;url:string}[];summary:string;body:ReactNode};

/** Navigate within the reading column, keeping the palace and main menu mounted. */
export default function ObservatoryEntryBrowser({items,section,headingText}:{items:Entry[];section:"involvement"|"projects";headingText:string}){
  const [selected,setSelected]=useState<string|null>(null);
  const host=useRef<HTMLDivElement>(null),heading=useRef<HTMLHeadingElement>(null);
  const listPosition=useRef(0),lastEntry=useRef<string|null>(null),pushed=useRef(false),mounted=useRef(false);
  const entry=items.find(item=>item.slug===selected);
  useEffect(()=>{
    const sync=()=>{
      const [category,slug]=window.location.hash.slice(1).split('/');
      setSelected(category===section&&items.some(item=>item.slug===slug)?slug:null);
    };
    sync();
    window.addEventListener('popstate',sync);window.addEventListener('hashchange',sync);
    return()=>{window.removeEventListener('popstate',sync);window.removeEventListener('hashchange',sync);};
  },[items,section]);
  useLayoutEffect(()=>{
    if(!mounted.current){mounted.current=true;return;}
    const scroll=host.current?.closest('.observatory-content');
    if(selected){scroll?.scrollTo({top:0});heading.current?.focus({preventScroll:true});}
    else{
      scroll?.scrollTo({top:listPosition.current});
      const link=host.current?.querySelector<HTMLAnchorElement>(`[data-entry="${lastEntry.current}"]`);
      if(link)link.focus({preventScroll:true});else heading.current?.focus({preventScroll:true});
    }
  },[selected]);
  const open=(slug:string)=>{
    listPosition.current=host.current?.closest('.observatory-content')?.scrollTop??0;
    lastEntry.current=slug;pushed.current=true;
    window.history.pushState(null,'',`#${section}/${slug}`);window.dispatchEvent(new HashChangeEvent("hashchange"));setSelected(slug);
  };
  const back=()=>{
    if(pushed.current){pushed.current=false;window.history.back();}
    else{window.history.pushState(null,'',`#${section}`);window.dispatchEvent(new HashChangeEvent("hashchange"));setSelected(null);}
  };
  return <div ref={host} className={`observatory-involvement-browser observatory-${section}-browser`} onKeyDown={event=>{if(event.key==='Escape'&&entry){event.preventDefault();back();}}}>
    {entry?<div key={entry.slug} data-entry-detail={entry.slug} className="observatory-involvement-view">
      <a href={`#${section}`} className="observatory-involvement-back" onClick={event=>{if(!event.metaKey&&!event.ctrlKey&&!event.shiftKey&&!event.altKey){event.preventDefault();back();}}}><ArrowLeft size={15} aria-hidden="true"/> {section==="projects"?"Projects":"Involvement"}</a>
      <header className="observatory-involvement-detail-heading">
        {entry.logo&&<Image className="observatory-involvement-logo" src={entry.logo} alt="" width={48} height={48} sizes="48px"/>}
        <div>{(entry.role||entry.date)&&<p className="observatory-entry-subtitle">{[entry.role,entry.date].filter(Boolean).join(" · ")}</p>}<h1 id="palace-section-heading" ref={heading} tabIndex={-1}>{entry.title}</h1></div>
      </header>
      <div className="observatory-involvement-body">{entry.body}</div>
    </div>:<div key="list" className="observatory-involvement-view observatory-entry-list-view">
      <a href="#" className="observatory-section-back"><ArrowLeft size={15} aria-hidden="true"/> Home</a>
      <h1 id="palace-section-heading" ref={heading} tabIndex={-1}>{headingText}</h1>
      {items.map(item=><article className="observatory-entry observatory-involvement" key={item.slug}>
        <div className="observatory-involvement-preview"><a aria-label={`Read more about ${item.title}`} href={`#${section}/${item.slug}`} data-entry={item.slug} className="observatory-entry-open" onClick={event=>{if(!event.metaKey&&!event.ctrlKey&&!event.shiftKey&&!event.altKey){event.preventDefault();open(item.slug);}}}/>
          {item.logo&&<Image className="observatory-involvement-logo" src={item.logo} alt="" width={48} height={48} sizes="48px"/>}
          <div className="observatory-involvement-intro"><div className="observatory-entry-title-row"><h2>{item.title}</h2>{section==="projects"&&item.date&&<span className="observatory-project-preview-date">{item.date}</span>}{section==="projects"&&item.links&&<span className="observatory-entry-links observatory-project-preview-links">{item.links.map(link=><a key={link.url} href={link.url} target="_blank" rel="noopener noreferrer">{link.label}<ArrowUpRight className="observatory-external-arrow" size={14} aria-hidden="true"/></a>)}</span>}</div>{section!=="projects"&&(item.role||item.date)&&<p className="observatory-entry-subtitle">{[item.role,item.date].filter(Boolean).join(" · ")}</p>}{item.summary&&<p className="observatory-involvement-description">{item.summary}</p>}</div>
          <ArrowRight className="observatory-involvement-arrow" size={17} aria-hidden="true"/>
        </div>
      </article>)}
    </div>}
  </div>;
}
