"use client";
import {useEffect,useMemo,useRef,useState} from "react";
import type {PointerEvent as ReactPointerEvent} from "react";
import {ChevronDown} from "lucide-react";

type Day={date:string;count:number;level:number};
const fills=["#FFFFFF","#9CCADD","#7DB9D4","#438BAD","#245572"];
const borders=["#E5E5E5","#81B3C7","#639FB9","#33728F","#1B4159"];

// Fixed daily counts keep colors stable as the history grows.
const contributionTier=(count:number)=>count<=0?0:count<5?1:count<10?2:count<20?3:4;

export default function ObservatoryHistory({active,onProgress}:{active:boolean;onProgress:(progress:number)=>void}){
  const [days,setDays]=useState<Day[]|null>(null),[error,setError]=useState(false);
  const shell=useRef<HTMLElement>(null),scroller=useRef<HTMLDivElement>(null);
  const tip=useRef<HTMLDivElement>(null),tipText=useRef<HTMLSpanElement>(null);
  const dateFormat=useMemo(()=>new Intl.DateTimeFormat("en-US",{weekday:"long",month:"short",day:"numeric",year:"numeric",timeZone:"UTC"}),[]);
  const hideTip=()=>{if(tip.current){tip.current.style.visibility="hidden";tip.current.style.opacity="0";}};
  const showTip=(event:ReactPointerEvent<HTMLSpanElement>,day:Day)=>{
    if(event.pointerType==="touch"||!tip.current||!tipText.current)return;
    const tooltip=tip.current;
    tipText.current.textContent=`${day.count} commit${day.count===1?"":"s"} on ${dateFormat.format(new Date(`${day.date}T00:00:00Z`))}`;
    tooltip.style.visibility="visible";tooltip.style.opacity="1";
    const tile=event.currentTarget.getBoundingClientRect(),bounds=tooltip.getBoundingClientRect();
    const left=Math.max(12,Math.min(tile.left+tile.width/2-bounds.width/2,document.documentElement.clientWidth-bounds.width-12));
    tooltip.style.left=`${left}px`;
    tooltip.style.setProperty("--arrow-x",`${tile.left+tile.width/2-left}px`);
    tooltip.dataset.side=tile.top>bounds.height+12?"above":"below";
    tooltip.style.top=`${tile.top>bounds.height+12?tile.top-bounds.height-10:tile.bottom+10}px`;
  };
  const amount=useRef(0),desired=useRef(0),activeRef=useRef(active);
  const [scrolled,setScrolled]=useState(false);
  const exit=useRef<{start:number|null;amount:number;scrollTop:number;scrollEnd:number}|null>(null);
  useEffect(()=>{
    activeRef.current=active;
    if(!active){
      desired.current=0;
      const element=scroller.current;
      if(element&&amount.current>0)exit.current={start:null,amount:amount.current,scrollTop:element.scrollTop,scrollEnd:element.scrollHeight-element.clientHeight};
      else if(element)element.scrollTop=element.scrollHeight;
      if(tip.current){tip.current.style.visibility="hidden";tip.current.style.opacity="0";}
    }else exit.current=null;
  },[active]);
  useEffect(()=>{
    const controller=new AbortController();
    fetch("https://github-contributions-api.jogruber.de/v4/KeshavSree?y=all",{signal:controller.signal})
      .then(response=>{if(!response.ok)throw new Error("History unavailable");return response.json();})
      .then((data:{contributions?:Day[]})=>{
        const now=new Date();
        const today=`${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,"0")}-${String(now.getDate()).padStart(2,"0")}`;
        const history=(data.contributions??[]).filter(day=>/^\d{4}-\d{2}-\d{2}$/.test(day.date)&&day.date<=today).sort((a,b)=>a.date.localeCompare(b.date));
        const first=history.findIndex(day=>day.count>0);
        setDays(first>=0?history.slice(first):history);
      }).catch(()=>{if(!controller.signal.aborted)setError(true);});
    return()=>controller.abort();
  },[]);
  const weeks=useMemo(()=>{
    if(!days?.length)return [];
    const cells:(Day|null)[]=Array(new Date(`${days[0].date}T00:00:00Z`).getUTCDay()).fill(null);
    cells.push(...days);while(cells.length%7)cells.push(null);
    const result:(Day|null)[][]=[];
    for(let i=0;i<cells.length;i+=7)result.push(cells.slice(i,i+7));
    return result;
  },[days]);
  // Native scrolling starts at the newest week. The empty space beneath it
  // parks its bottom edge at 170px; scrolling backward pulls that edge down.
  useEffect(()=>{
    const element=scroller.current;if(!element)return;
    element.scrollTop=element.scrollHeight;
    desired.current=0;
  },[weeks]);
  useEffect(()=>{
    let frame=0,previous=0;
    const tick=(time:number)=>{
      const dt=Math.min(50,time-(previous||time));previous=time;
      const goal=!activeRef.current||matchMedia("(max-width:760px)").matches?0:desired.current;
      const reduced=matchMedia("(prefers-reduced-motion: reduce)").matches;
      const retract=exit.current;
      if(retract&&!activeRef.current){
        retract.start??=time;
        const t=reduced?1:Math.min(1,(time-retract.start)/900),ease=t*t*(3-2*t);
        amount.current=retract.amount*(1-ease);
        if(scroller.current)scroller.current.scrollTop=retract.scrollTop+(retract.scrollEnd-retract.scrollTop)*ease;
        if(t===1)exit.current=null;
      }else{
        // Short damping smooths trackpad input while browsing the history.
        amount.current=reduced?goal:amount.current+(goal-amount.current)*(1-Math.exp(-dt/110));
      }
      if(Math.abs(goal-amount.current)<.0001)amount.current=goal;
      onProgress(amount.current);
      frame=requestAnimationFrame(tick);
    };
    frame=requestAnimationFrame(tick);return()=>cancelAnimationFrame(frame);
  },[onProgress]);
  return <aside ref={shell} className={`observatory-history ${active?"":"observatory-history-away"}`} aria-label="GitHub contribution history" inert={!active}>
    <span className="observatory-history-label" aria-hidden="true">Github!</span>
    <div ref={scroller} className="observatory-history-scroll" tabIndex={active?0:-1} aria-label="GitHub contributions, chronological top to bottom. Scroll up to go back in time." onPointerLeave={hideTip} onKeyDown={event=>{if(event.key==="Escape")hideTip();}} onScroll={event=>{
      hideTip();
      if(!activeRef.current)return;
      const element=event.currentTarget;
      const distance=Math.max(0,element.scrollHeight-element.clientHeight-element.scrollTop);
      desired.current=Math.min(1,distance/Math.max(1,(element.clientHeight-170)*1.7));
      if(distance>8)setScrolled(true);
    }}>
      <div className="observatory-history-grid">
        {days&&<p className="observatory-history-total">{days.reduce((sum,day)=>sum+day.count,0).toLocaleString()} contributions</p>}
        {!days&&<p className="observatory-history-total">{error?"History unavailable":"Loading history…"}</p>}
        {weeks.map((week,index)=><div className="observatory-history-week" key={week.find(Boolean)?.date??index}>{week.map((day,column)=>day?<span key={day.date} className="observatory-history-day" onPointerEnter={event=>showTip(event,day)} onPointerLeave={hideTip} style={{background:fills[contributionTier(day.count)],borderColor:borders[contributionTier(day.count)]}} aria-label={`${day.date}: ${day.count} commits`}/>:<span key={`empty-${column}`}/>)}</div>)}
      </div>
      <div className="observatory-history-spacer" aria-hidden="true"/>
    </div>
    <div ref={tip} className="observatory-history-tooltip" role="tooltip" aria-hidden="true"><span ref={tipText}/><span className="observatory-history-tooltip-arrow"/></div>
    {!scrolled&&<span className="observatory-history-hint" aria-hidden="true">Scroll <ChevronDown size={14}/></span>}
  </aside>;
}
