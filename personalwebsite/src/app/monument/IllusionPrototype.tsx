"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { ARM_LENGTH, STAIR_START, STAIR_RUN, STAIR_COUNT, STAIR_RISE, orientation, dockPoint, platformConfigurations as configurations, platformMotion, smooth, travelerPoint, type PlatformPose } from "./platformGeometry";
import "./illusion.css";

export default function IllusionPrototype() {
  const host = useRef<HTMLDivElement>(null);
  const selection = useRef(0);
  const paused = useRef(false);
  const walkRequest = useRef(0);
  const [selected,setSelected] = useState(0);
  const [isPaused,setPaused] = useState(false);
  const [status,setStatus] = useState("Follow the marker across the optical join.");
  const [failed,setFailed] = useState(false);
  useEffect(() => {
    if (!host.current) return;
    const element=host.current;
    let renderer: THREE.WebGLRenderer;
    try { renderer=new THREE.WebGLRenderer({antialias:true,alpha:true}); }
    catch { setFailed(true); return; }
    renderer.setPixelRatio(Math.min(devicePixelRatio,2));
    renderer.outputColorSpace=THREE.SRGBColorSpace;
    element.appendChild(renderer.domElement);
    const world=new THREE.Scene();
    world.add(new THREE.AmbientLight(0xffffff,2));
    const light=new THREE.DirectionalLight(0xffffff,2.5); light.position.set(-3,10,5); world.add(light);
    // Fixed in both position and orientation. Resizing changes only the frustum.
    const camera=new THREE.OrthographicCamera(-7,7,7,-7,.1,100);
    camera.position.set(14,14,14); camera.lookAt(0,0,0);
    const root=new THREE.Group(); world.add(root);
    const box=new THREE.BoxGeometry(1,1,1);
    const cream=new THREE.MeshStandardMaterial({color:0xead6b1,roughness:1});
    const pink=new THREE.MeshStandardMaterial({color:0xc99b96,roughness:1});
    const support=new THREE.MeshStandardMaterial({color:0x52797a,roughness:1});
    const teal=new THREE.MeshStandardMaterial({color:0x56c7b9,roughness:1});
    const hidden=new THREE.MeshBasicMaterial({visible:false});
    const mesh=(parent:THREE.Object3D, x:number,y:number,z:number,w:number,h:number,d:number,material:THREE.Material|THREE.Material[])=>{
      const m=new THREE.Mesh(box,material); m.position.set(x,y,z);m.scale.set(w,h,d);parent.add(m);return m;
    };
    const platform=new THREE.Group();root.add(platform);
    mesh(platform,STAIR_START/2,-.15,0,STAIR_START,.3,.72,cream);
    const stairEnd=STAIR_START+STAIR_RUN;
    const arm=mesh(platform,(stairEnd+ARM_LENGTH)/2,-.15,0,ARM_LENGTH-stairEnd,.3,.72,cream);
    arm.position.y=STAIR_RISE-.15;
    Array.from({length:STAIR_COUNT},(_,i)=>mesh(platform,STAIR_START+(i+.5)*STAIR_RUN/STAIR_COUNT,STAIR_RISE*(i+1)/STAIR_COUNT-.15,0,STAIR_RUN/STAIR_COUNT+.004,.3,.72,[pink,pink,cream,cream,cream,cream]));
    mesh(platform,0,-.15,-.95,.72,.3,2.6,cream);
    mesh(platform,0,-.15,0,.9,.3,.9,cream);
    // A visible horizontal axle on a fixed rear pier. Nothing is parented
    // to an additional rotating joint.
    mesh(root,0,-2.2,-1.25,.65,4.4,.65,support);
    mesh(root,0,-4.5,-1.25,1.3,.2,1.3,support);
    const axleGeometry=new THREE.CylinderGeometry(.15,.15,1.65,24);
    const axle=new THREE.Mesh(axleGeometry,teal);axle.rotation.x=Math.PI/2;axle.position.z=-.6;root.add(axle);
    const collarGeometry=new THREE.TorusGeometry(.4,.06,12,48);
    const collar=new THREE.Mesh(collarGeometry,teal);collar.position.z=.42;root.add(collar);
    const ringGeometry=new THREE.TorusGeometry(.27,.055,12,48);
    const ring=new THREE.Mesh(ringGeometry,teal);ring.rotation.x=-Math.PI/2;ring.position.y=.025;platform.add(ring);
    // The asymmetric counter-arm makes rigid rotation around the anchor legible.
    for(let i=0;i<3;i++) mesh(platform,-.19+i*.19,.012,-1.9,.08,.025,.08,teal);
    const docks=configurations.map((config,i)=>{
      const g=new THREE.Group();g.position.set(...dockPoint(i));g.quaternion.copy(orientation(config));root.add(g);
      const entry=mesh(g,.65,-.15,0,1.3,.3,.72,pink);
      mesh(g,1.35,-.15,0,.8,.3,1.05,pink);
      const worldEnd=new THREE.Vector3(1.35,-.3,-.48).applyQuaternion(orientation(config)).add(g.position);
      const foot=Math.min(-5.4,worldEnd.y-2.2), height=worldEnd.y-foot;
      const piston=mesh(root,worldEnd.x,foot+height/2,worldEnd.z,.23,height,.23,support);
      mesh(root,worldEnd.x,foot-.1,worldEnd.z,.65,.2,.65,support);
      const beacon=mesh(g,1.35,.045,0,.18,.09,.18,teal);
      const seam=mesh(g,.005,.007,0,.035,.014,.72,teal);
      return {group:g,base:g.position.clone(),entry,beacon,seam,piston,foot,top:worldEnd.y};
    });
    const markerGeometry=new THREE.SphereGeometry(.105,24,16);
    const markerMaterial=new THREE.MeshBasicMaterial({color:0xffffff});
    const marker=new THREE.Group();root.add(marker);
    const head=new THREE.Mesh(markerGeometry,markerMaterial);head.position.y=.62;marker.add(head);
    const bodyGeometry=new THREE.ConeGeometry(.14,.48,16);
    const body=new THREE.Mesh(bodyGeometry,markerMaterial);body.position.y=.27;marker.add(body);
    const footRingGeometry=new THREE.TorusGeometry(.14,.018,6,32);
    const footRing=new THREE.Mesh(footRingGeometry,teal);footRing.rotation.x=-Math.PI/2;footRing.position.y=.015;marker.add(footRing);
    // Fixed bounds and framing: the scene never pans to follow a mechanism.
    const resize=()=>{
      const w=element.clientWidth,h=element.clientHeight,aspect=w/h;
      renderer.setSize(w,h);const extent=Math.max(6.4,6.2/aspect);
      camera.left=-extent*aspect;camera.right=extent*aspect;camera.top=extent;camera.bottom=-extent;camera.updateProjectionMatrix();
    };
    const observer=new ResizeObserver(resize);observer.observe(element);resize();
    let current:PlatformPose={...configurations[0]},from={...current};
    let dock=0,target=0,lastWalk=0,lastTime=0,elapsed=0,distance=0,returnDistance=0;
    let phase:"walking"|"rest"|"returning"|"moving"="walking";
    const reduced=matchMedia("(prefers-reduced-motion: reduce)").matches;
    const startMove=()=>{
      from={...current};elapsed=0;phase="moving";
      const to=configurations[target];
      const rotating=orientation(to).angleTo(orientation(current))>.001;
      const lifting=to.lifts.some((height,i)=>Math.abs(height-current.lifts[i])>.001);
      setStatus(rotating && lifting?"Release the landing. Turn the axle. Raise the next connection.":"Exchanging depth: one landing descends as the hidden landing rises.");
    };
    renderer.setAnimationLoop((time:number)=>{
      const dt=Math.min((time-lastTime)/1000,.05);lastTime=time;
      if(target!==selection.current){
        target=selection.current;
        if(distance>.001){returnDistance=distance;elapsed=0;phase="returning";setStatus("Returning to the anchor before the platform moves…");}
        else startMove();
      }
      if(lastWalk!==walkRequest.current){
        lastWalk=walkRequest.current;
        if(phase==="rest"){returnDistance=distance;elapsed=0;phase="returning";}
      }
      if(!paused.current){
        elapsed+=dt;
        if(phase==="returning"){
          distance=returnDistance*(1-smooth(elapsed/1.1));
          if(elapsed>=1.1){distance=0;startMove();}
        }else if(phase==="moving"){
          const t=reduced?1:Math.min(1,elapsed/4.2);
          current=platformMotion(from,configurations[target],t);
          if(t===1){dock=target;phase="walking";elapsed=0;setStatus("Connected. The marker crosses to a landing at a different physical height.");}
        }else if(phase==="walking"){
          distance=(ARM_LENGTH+1.35)*smooth(Math.min(1,elapsed/3.5));
          if(elapsed>=3.5){phase="rest";setStatus("Choose a passage. The lifts make room; the stair turns; a new route meets it.");}
        }
      }
      platform.quaternion.copy(orientation(current));
      const aligned=phase!=="moving";
      // Remove only mating end caps after docking; the full solid is visible
      // while turning. Both rectangular cross-sections project identically.
      arm.material=aligned?[hidden,cream,cream,cream,cream,cream]:cream;
      docks.forEach((d,i)=>{
        d.group.position.copy(d.base);d.group.position.y+=current.lifts[i];
        d.piston.scale.y=Math.max(.1,d.top+current.lifts[i]-d.foot);d.piston.position.y=d.foot+d.piston.scale.y/2;
        d.entry.material=aligned && i===dock?[pink,hidden,pink,pink,pink,pink]:pink;
        d.seam.visible=aligned && i===dock;
        d.beacon.scale.y=aligned && i===dock?.18:.09;
      });
      const point=travelerPoint(current,dock,distance);
      marker.position.set(...point);
      marker.quaternion.copy(orientation(current));
      renderer.render(world,camera);
    });
    return()=>{renderer.setAnimationLoop(null);observer.disconnect();box.dispose();axleGeometry.dispose();collarGeometry.dispose();ringGeometry.dispose();markerGeometry.dispose();bodyGeometry.dispose();footRingGeometry.dispose();[cream,pink,support,teal,hidden,markerMaterial].forEach(m=>m.dispose());renderer.dispose();renderer.domElement.remove();};
  },[]);
  const choose=(i:number)=>{selection.current=i;setSelected(i);};
  return <div className="illusion-lab">
    <header><span>GEOMETRY STUDY / 05</span><h1>The turning stair.</h1><p>One horizontal axle · independent vertical lifts · fixed camera</p></header>
    <nav aria-label="Platform configurations">{configurations.map((c,i)=><button key={c.name} aria-pressed={selected===i} onClick={()=>choose(i)}><small>0{i+1}</small>{c.name}</button>)}</nav>
    <div className="illusion-stage" ref={host} role="img" aria-label={`Rotating and lifting platform: ${configurations[selected].name}`}>{failed&&<p>WebGL is unavailable in this browser.</p>}</div>
    <footer><p aria-live="polite">{status}</p><div><button onClick={()=>choose((selected+1)%5)}>Next position →</button><button onClick={()=>{paused.current=!paused.current;setPaused(paused.current);}}>{isPaused?"Resume":"Pause"}</button><button onClick={()=>{walkRequest.current++;}}>Walk again</button></div><small>The stair only turns around its horizontal axle. Each landing only moves vertically.</small></footer>
  </div>;
}
