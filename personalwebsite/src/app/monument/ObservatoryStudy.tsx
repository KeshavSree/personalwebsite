"use client";
import {useEffect,useRef,useState} from "react";
import * as THREE from "three";
import {buildObservatory,setObservatoryTurn} from "./ObservatoryWorld";
import "./observatory.css";

export default function ObservatoryStudy(){
  const host=useRef<HTMLDivElement>(null),target=useRef(0);
  const [turn,setTurn]=useState(0),[moving,setMoving]=useState(false),[failed,setFailed]=useState(false);
  useEffect(()=>{
    if(!host.current)return;
    const element=host.current;
    let renderer:THREE.WebGLRenderer;
    try{renderer=new THREE.WebGLRenderer({alpha:true,antialias:true});}catch{setFailed(true);return;}
    renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.outputColorSpace=THREE.SRGBColorSpace;element.appendChild(renderer.domElement);
    const world=buildObservatory();
    const camera=new THREE.OrthographicCamera(-7,7,8,-8,.1,100);
    const look=new THREE.Vector3(.65,.25,0);camera.position.copy(look).add(new THREE.Vector3(16,16,16));camera.lookAt(look);
    let current=0,from=0,to=0,start=0,active=false,dirty=true;
    const resize=()=>{const w=element.clientWidth,h=element.clientHeight;if(!w||!h)return;renderer.setSize(w,h);const aspect=w/h;const extent=Math.max(7.6,5.4/aspect);camera.top=extent;camera.bottom=-extent;camera.left=-extent*aspect;camera.right=extent*aspect;camera.updateProjectionMatrix();dirty=true;};
    const observer=new ResizeObserver(resize);observer.observe(element);resize();
    const reduce=matchMedia("(prefers-reduced-motion: reduce)").matches;
    renderer.setAnimationLoop(time=>{
      if(target.current!==to){from=current;to=target.current;start=time;active=true;setMoving(true);}
      if(active){const t=reduce?1:Math.min(1,(time-start)/1800);current=from+(to-from)*t*t*(3-2*t);setObservatoryTurn(world,current);dirty=true;if(t===1){active=false;setMoving(false);}}
      if(dirty){renderer.render(world.scene,camera);dirty=false;}
    });
    const repaint=()=>{dirty=true;};window.addEventListener("resize",repaint);
    return()=>{renderer.setAnimationLoop(null);observer.disconnect();window.removeEventListener("resize",repaint);world.dispose();renderer.dispose();renderer.domElement.remove();};
  },[]);
  const rotate=(direction:number)=>{const next=target.current+direction*Math.PI/2;target.current=next;setTurn(Math.round(next/(Math.PI/2)));};
  return <div className="observatory-study">
    <header><span>CHAPTER X · OBSERVATORY</span><h1>The green-room mechanism</h1><p>Structure study from the 0:34 reference.</p></header>
    <div className="observatory-canvas" ref={host} role="img" aria-label="Tall ivory paths intersected by a split slate rectangular frame and a lower ivory walkway">{failed&&<p>WebGL is unavailable.</p>}</div>
    <footer><div className="observatory-controls"><button aria-label="Turn clockwise" onClick={()=>rotate(1)}>↻</button><button onClick={()=>{target.current=0;setTurn(0);}}>Reset to 0:34</button><button aria-label="Turn counterclockwise" onClick={()=>rotate(-1)}>↺</button></div><p aria-live="polite">{moving?"Turning…":`Position ${((turn%4)+4)%4+1} · fixed isometric camera`}</p></footer>
  </div>;
}
