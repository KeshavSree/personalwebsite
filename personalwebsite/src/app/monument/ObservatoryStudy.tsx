"use client";
import {useCallback,useEffect,useRef,useState} from "react";
import type {CSSProperties,ReactNode} from "react";
import {Jost} from "next/font/google";
import {flushSync} from "react-dom";
import {ArrowLeft} from "lucide-react";
import * as THREE from "three";
import {buildObservatory,observatorySlideX,setObservatoryHome,setObservatoryHomeTransition,setObservatoryTurn} from "./ObservatoryWorld";
import {nextPalaceLeg} from "./ObservatoryMotion";
import type {PalacePose} from "./ObservatoryMotion";
import {palaceChapters,palaceDestination,palaceSectionFromHash} from "./ObservatoryNavigation";
import type {PalaceSection} from "./ObservatoryNavigation";
import {createObservatoryEngraving} from "./ObservatoryEngraving";
import {createObservatoryRenderer} from "./ObservatoryRenderer";
import ObservatoryHistory from "./ObservatoryHistory";
import {createHistoryClearance} from "./ObservatoryHistoryMotion";
import "./observatory.css";

const palaceFont=Jost({subsets:["latin"],weight:["300","400","700"],display:"swap",variable:"--font-palace"});
const homeAnswers=["Ruthless Optimist.","Engineer.","Student.","Musician.","Dreamer.","Boilermaker.","Researcher."];

function HomeAnswers(){
  const [answer,setAnswer]=useState(0),[text,setText]=useState(""),[deleting,setDeleting]=useState(false);
  useEffect(()=>{
    if(matchMedia("(prefers-reduced-motion: reduce)").matches){
      if(text===homeAnswers[0])return;
      const timer=window.setTimeout(()=>setText(homeAnswers[0]),0);
      return()=>window.clearTimeout(timer);
    }
    const current=homeAnswers[answer];
    // Match the original hero: type at 80ms, hold 2600ms, erase at 40ms.
    const delay=deleting?40:text.length<current.length?80:2600;
    const timer=window.setTimeout(()=>{
      if(!deleting){
        if(text.length<current.length)setText(current.slice(0,text.length+1));
        else setDeleting(true);
      }else if(text.length>0)setText(current.slice(0,text.length-1));
      else{setDeleting(false);setAnswer(index=>(index+1)%homeAnswers.length);}
    },delay);
    return()=>window.clearTimeout(timer);
  },[answer,text,deleting]);
  return <p className="observatory-home-answer" aria-label={`Keshav is a ${homeAnswers.join(", ")}`}><span aria-hidden="true">{text}</span><span className="observatory-answer-caret" aria-hidden="true"/></p>;
}

export default function ObservatoryStudy({content,contactLinks}:{content:Record<PalaceSection,ReactNode>;contactLinks:ReactNode}){
  const host=useRef<HTMLDivElement>(null),target=useRef<number|null>(null);
  const [section,setSection]=useState<PalaceSection|null>(null),[moving,setMoving]=useState(false),[failed,setFailed]=useState(false);
  const historyProgress=useRef(0);
  const updateHistoryProgress=useCallback((progress:number)=>{historyProgress.current=progress;},[]);
  const scrollArea=useRef<HTMLElement>(null);
  const sparkleSequence=useRef(0);
  const [sparkles,setSparkles]=useState<{chapter:string;id:number;particles:CSSProperties[]}|null>(null);
  const displayedSection=useRef<PalaceSection|null>(null);
  const menuViewTransition=useRef<ViewTransition|null>(null);
  const changeSection=useCallback((next:PalaceSection|null,animate=true)=>{
    if(displayedSection.current===next)return;
    const changesLayout=(displayedSection.current===null)!==(next===null);
    displayedSection.current=next;
    const update=()=>{target.current=palaceDestination(next);setSparkles(null);setSection(next);};
    menuViewTransition.current?.skipTransition();
    if(!animate||!changesLayout||!document.startViewTransition||matchMedia("(prefers-reduced-motion: reduce)").matches){update();return;}
    document.documentElement.classList.add('palace-menu-transition');
    const transition=document.startViewTransition(()=>flushSync(update));
    menuViewTransition.current=transition;
    void transition.finished.catch(()=>{}).finally(()=>{
      if(menuViewTransition.current===transition){menuViewTransition.current=null;document.documentElement.classList.remove('palace-menu-transition');}
    });
  },[]);
  const chapter=palaceChapters.find(item=>item.id===section);
  const select=(next:PalaceSection|null,updateHistory=true)=>{
    changeSection(next);
    if(updateHistory){
      const hash=next?`#${next}`:"";
      if(window.location.hash!==hash){window.history.pushState(null,"",`${window.location.pathname}${window.location.search}${hash}`);window.dispatchEvent(new HashChangeEvent("hashchange"));}
    }
  };
  useEffect(()=>{
    const restoration=window.history.scrollRestoration;
    window.history.scrollRestoration="manual";
    const sync=()=>changeSection(palaceSectionFromHash(window.location.hash));
    changeSection(palaceSectionFromHash(window.location.hash),false);
    window.addEventListener("popstate",sync);window.addEventListener("hashchange",sync);
    return()=>{window.history.scrollRestoration=restoration;window.removeEventListener("popstate",sync);window.removeEventListener("hashchange",sync);menuViewTransition.current?.skipTransition();document.documentElement.classList.remove("palace-menu-transition");};
  },[changeSection]);
  useEffect(()=>{
    scrollArea.current?.scrollTo({top:0});
    document.title=chapter?`${chapter.title} · Keshav Sreekantham`:"Keshav Sreekantham";
  },[chapter]);
  const sparkle=(id:string)=>{
    if(matchMedia("(prefers-reduced-motion: reduce)").matches)return;
    setSparkles({chapter:id,id:++sparkleSequence.current,particles:Array.from({length:128},()=>{
      const size=.6+Math.random()*1.1;
      return {left:`${3+Math.random()*90}%`,top:`${8+Math.random()*84}%`,width:size,height:size,
        animationDelay:`${Math.random()*.8}s`,animationDuration:`${.9+Math.random()*.7}s`,
        "--sparkle-drift-x":`${section?-2+Math.random()*4:2+Math.random()*6}px`,"--sparkle-drift-y":`${section?2+Math.random()*6:-1-Math.random()*4}px`,
        "--sparkle-brightness":.4+Math.random()*.5} as CSSProperties;
    })});
  };
  useEffect(()=>{
    if(!host.current)return;
    const element=host.current;
    let renderer:THREE.WebGLRenderer;
    try{renderer=new THREE.WebGLRenderer({alpha:true,antialias:true});}catch{queueMicrotask(()=>setFailed(true));return;}
    const restingPixelRatio=Math.min(devicePixelRatio,2);
    let renderPixelRatio=restingPixelRatio;
    renderer.setPixelRatio(renderPixelRatio);renderer.outputColorSpace=THREE.SRGBColorSpace;element.appendChild(renderer.domElement);
    const world=buildObservatory();setObservatoryHome(world);
    const clearance=createHistoryClearance(world);let lastHistoryProgress=0;
    const engravings=[createObservatoryEngraving(world),createObservatoryEngraving(world,"projects"),createObservatoryEngraving(world,"about"),createObservatoryEngraving(world,"involvement")];const engravingAngles=[0,Math.PI/2,3*Math.PI/2,Math.PI],engravingOpacities=[0,0,0,0],engravingGoals=[0,0,0,0],engravingFades=[false,false,false,false];let lastEngravingTime=0;
    const camera=new THREE.OrthographicCamera(-7,7,8,-8,.1,100);
    const look=new THREE.Vector3(-.3,-.8,0);camera.position.copy(look).add(new THREE.Vector3(16,16,16));camera.lookAt(look);
    const compositor=createObservatoryRenderer(renderer,world,camera);
    let pose:PalacePose={angle:0,unfold:0},dirty=true;
    let leg:{from:PalacePose;to:PalacePose;start:number;duration:number}|null=null;
    let framing=0,frameTarget=0,frameLeg:{from:number;to:number;start:number}|null=null;
    let width=1,height=1;
    const motionPreference=matchMedia("(prefers-reduced-motion: reduce)");
    const frameCamera=()=>{
      const mobile=width<=760,aspect=width/height;
      const extent=Math.max(8.2,6.2/aspect);
      camera.top=extent;camera.bottom=-extent;camera.left=-extent*aspect;camera.right=extent*aspect;
      // Keep the full-height spire in view while the Home return finishes
      // turning. Enlarge it further only as the shafts actually retract.
      const homeZoom=mobile?1.03:THREE.MathUtils.lerp(1.22,.96,pose.unfold);
      const readingZoom=mobile ? .92*1.2 : .99*(width>=1100&&height>=800?1.2:1);
      camera.zoom=THREE.MathUtils.lerp(homeZoom,readingZoom,framing);
      const center=mobile ? .53 : THREE.MathUtils.lerp(.56,.775,framing);
      const verticalPan=mobile?0:framing*.105;
      camera.setViewOffset(width,height,-(center-.5)*width,-verticalPan*height,width,height);
      camera.updateProjectionMatrix();dirty=true;
    };
    const resize=()=>{
      width=element.clientWidth;height=element.clientHeight;if(!width||!height)return;
      renderer.setSize(width,height);compositor.resize();frameCamera();
    };
    const observer=new ResizeObserver(resize);observer.observe(element);resize();
    renderer.setAnimationLoop(time=>{
      // Clear the additive history offsets before changing any mechanical pose.
      clearance.reset();
      const historyAmount=historyProgress.current;
      const waitingForHistory=historyAmount>0&&target.current!==null;
      const desiredFrame=target.current===null||waitingForHistory?0:1;
      if(desiredFrame!==frameTarget){frameTarget=desiredFrame;frameLeg={from:framing,to:frameTarget,start:time};}
      if(frameLeg){
        const t=motionPreference.matches?1:Math.min(1,(time-frameLeg.start)/1800),ease=t*t*(3-2*t);
        framing=THREE.MathUtils.lerp(frameLeg.from,frameLeg.to,ease);dirty=true;
        if(t===1)frameLeg=null;
      }
      if(!leg&&!waitingForHistory){
        const next=nextPalaceLeg(pose,target.current);
        if(next){
          const lift=next.unfold!==pose.unfold;
          const duration=lift?3200:2400*Math.max(1,Math.abs(next.angle-pose.angle)/(Math.PI/2),Math.abs(observatorySlideX(next.angle)-observatorySlideX(pose.angle))/1.2);
          leg={from:{...pose},to:next,start:time,duration};setMoving(true);
        }
      }
      if(leg){
        const t=motionPreference.matches?1:Math.min(1,(time-leg.start)/leg.duration),ease=t*t*(3-2*t);
        pose={angle:THREE.MathUtils.lerp(leg.from.angle,leg.to.angle,ease),unfold:THREE.MathUtils.lerp(leg.from.unfold,leg.to.unfold,ease)};
        if(leg.from.unfold!==leg.to.unfold)setObservatoryHomeTransition(world,pose.unfold);
        else setObservatoryTurn(world,pose.angle);
        dirty=true;
        if(t===1){pose=leg.to;leg=null;if(!nextPalaceLeg(pose,target.current))setMoving(false);}
      }
      if(pose.unfold===0&&pose.angle===0)clearance.apply(historyAmount);
      const engravingDelta=Math.min(50,time-(lastEngravingTime||time))/1000;lastEngravingTime=time;
      engravings.forEach((engraving,index)=>{
        const goal=target.current===engravingAngles[index]?1:0;
        if(goal!==engravingGoals[index]){
          // Decide once, before the incoming face turns toward the camera.
          engravingFades[index]=goal===1&&engraving.isFacingCamera(camera);
          engravingGoals[index]=goal;
        }
        const stillTransitioning=!!leg||waitingForHistory||!!nextPalaceLeg(pose,target.current);
        let next=goal;
        if(!motionPreference.matches){
          if(goal===1&&engravingFades[index])next=THREE.MathUtils.damp(engravingOpacities[index],1,3,engravingDelta);
          else if(goal===0&&engravingOpacities[index]>0&&engraving.isFacingCamera(camera)){
            // Fade promptly during motion when this face will remain visible.
            // Otherwise keep it lit until the mechanism carries it out of view.
            const remainsVisible=engraving.isFacingCamera(camera,target.current??0);
            next=stillTransitioning&&!remainsVisible?engravingOpacities[index]:THREE.MathUtils.damp(engravingOpacities[index],0,8,engravingDelta);
          }
        }
        const settledEngraving=Math.abs(next-goal)<.001?goal:next;
        if(settledEngraving!==engravingOpacities[index]){engravingOpacities[index]=settledEngraving;engraving.setOpacity(settledEngraving);dirty=true;}
      });
      const historyMoving=historyAmount!==lastHistoryProgress;
      if(historyMoving){dirty=true;lastHistoryProgress=historyAmount;}
      // The multi-pass compositor costs four times as many pixels at DPR 2.
      // Keep motion lighter, then restore the crisp resting frame immediately.
      const nextPixelRatio=leg||frameLeg||historyMoving?Math.min(restingPixelRatio,1.5):restingPixelRatio;
      if(nextPixelRatio!==renderPixelRatio){
        renderPixelRatio=nextPixelRatio;renderer.setPixelRatio(renderPixelRatio);
        compositor.resize();dirty=true;
      }
      if(dirty){frameCamera();compositor.render();dirty=false;}
    });
    const repaint=()=>{dirty=true;};window.addEventListener("resize",repaint);
    return()=>{renderer.setAnimationLoop(null);observer.disconnect();window.removeEventListener("resize",repaint);compositor.dispose();engravings.forEach(engraving=>engraving.dispose());world.dispose();renderer.dispose();renderer.domElement.remove();};
  },[]);
  return <div className={`observatory-study ${section?"observatory-reading":"observatory-home"} ${palaceFont.variable}`} data-section={section??"home"}>
    <a className="observatory-skip" href={section?"#palace-content":"#palace-navigation"} onClick={event=>{event.preventDefault();if(section)scrollArea.current?.focus();else document.getElementById("palace-navigation")?.focus();}}>Skip to {section?"content":"navigation"}</a>
    <div className="observatory-canvas" ref={host} role="img" aria-label="A rose-stone palace with two rising towers connecting an ivory sliding path and a turquoise impossible rotating passage">{failed&&<p>WebGL is unavailable.</p>}</div>
    {section===null&&<header className="observatory-header observatory-home-return">
      <h1>Who is Keshav Sreekantham?</h1>
      <HomeAnswers/>
      <p className="observatory-currently-building">Currently building <a href="#projects/tara">Tara <span aria-hidden="true">→</span></a></p>
    </header>}
    <ObservatoryHistory active={section===null&&!moving} onProgress={updateHistoryProgress}/>
    <nav id="palace-navigation" className="observatory-chapters" aria-label="Main navigation" tabIndex={-1}>
      <ol>{palaceChapters.map(item=><li key={item.id}><a href={`#${item.id}`} aria-current={section===item.id?"page":undefined} onClick={event=>{if(!event.metaKey&&!event.ctrlKey&&!event.shiftKey&&!event.altKey){event.preventDefault();select(item.id);}}}
        onPointerEnter={event=>{if(event.pointerType!=="touch")sparkle(item.id);}}
        onPointerLeave={()=>setSparkles(current=>current?.chapter===item.id?null:current)}
        onFocus={()=>sparkle(item.id)}
        onBlur={()=>setSparkles(current=>current?.chapter===item.id?null:current)}>
        <span style={{viewTransitionName:`palace-nav-${item.id}-number`}} className="observatory-chapter-number" aria-hidden="true">{item.number}</span><span style={{viewTransitionName:`palace-nav-${item.id}-label`}}>{item.title}</span>
        {sparkles?.chapter===item.id&&<span key={sparkles.id} className="observatory-sparkles" aria-hidden="true">{sparkles.particles.map((style,index)=><span key={index} style={style}/>)}</span>}
      </a></li>)}</ol>
      {section===null&&<div className="observatory-home-contact">{contactLinks}</div>}
    </nav>
    {chapter&&<section key={chapter.id} id="palace-content" className="observatory-content" ref={scrollArea} aria-labelledby="palace-section-heading" tabIndex={0}>
      <div className="observatory-content-inner">{chapter.id!=="involvement"&&chapter.id!=="projects"&&<><a href="#" className="observatory-section-back" onClick={event=>{event.preventDefault();select(null);}}><ArrowLeft size={15} aria-hidden="true"/> Home</a><h1 id="palace-section-heading">{chapter.heading}</h1></>}{content[chapter.id]}</div>
    </section>}
    <p className="observatory-status" role="status">{moving?`${chapter?.title??"Home"} · Turning…`:chapter?.title??"Home"}</p>
  </div>;
}
