"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { configurations, interpolate, route } from "./illusionGeometry";
import "./illusion.css";

export default function IllusionPrototype() {
  const host = useRef<HTMLDivElement>(null);
  const selection = useRef(0);
  const reveal = useRef(false);
  const paused = useRef(false);
  const replay = useRef(0);
  const [selected,setSelected] = useState(0);
  const [isPaused,setPaused] = useState(false);
  const [status,setStatus] = useState("Follow the white marker around the impossible loop.");
  useEffect(() => {
    if (!host.current) return;
    const element = host.current;
    const renderer = new THREE.WebGLRenderer({ antialias:true, alpha:true });
    renderer.setPixelRatio(Math.min(devicePixelRatio,2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    element.appendChild(renderer.domElement);
    const world = new THREE.Scene();
    world.add(new THREE.AmbientLight(0xffffff,2));
    const sun = new THREE.DirectionalLight(0xffffff,3);
    sun.position.set(-3,10,5); world.add(sun);
    const camera = new THREE.OrthographicCamera(-8,8,7,-7,.1,100);
    const group = new THREE.Group(); world.add(group);
    const geometry = new THREE.BoxGeometry(1,1,1);
    const material = new THREE.MeshStandardMaterial({color:0xdcb2a0, roughness:1});
    const stepMaterial = new THREE.MeshStandardMaterial({color:0xf0ddba, roughness:1});
    const beams: THREE.Mesh[] = Array.from({length:3},() => { const m=new THREE.Mesh(geometry,material); group.add(m); return m; });
    const steps = Array.from({length:40},() => { const m=new THREE.Mesh(geometry,stepMaterial); group.add(m); return m; });
    const invisible = new THREE.MeshBasicMaterial({visible:false});
    beams[0].material=[material,material,material,invisible,material,material];
    beams[2].material=[material,material,invisible,material,material,material];
    const markerGeometry = new THREE.SphereGeometry(.115,20,12);
    const markerMaterial = new THREE.MeshBasicMaterial({color:0xffffff});
    const marker = new THREE.Mesh(markerGeometry,markerMaterial); group.add(marker);
    // Paired identical cross-sections at both ends make a seamless projected
    // join, while the traveler crosses a nonzero world-space separation.
    const seamMaterial = new THREE.MeshBasicMaterial({color:0x56d8c6});
    const seamGeometry = new THREE.BoxGeometry(.065,.012,.44);
    const seam = new THREE.Mesh(seamGeometry,seamMaterial); group.add(seam);
    const measureGeometry = new THREE.BufferGeometry();
    const measureMaterial = new THREE.LineDashedMaterial({color:0x56d8c6,dashSize:.14,gapSize:.1});
    const measure = new THREE.Line(measureGeometry,measureMaterial); group.add(measure);
    let current = {...configurations[0]}, from = {...current}, to = {...current};
    let lastSelection = 0, lastReplay = 0, elapsed = 0, lastTime = 0, phase = 1, walking = 0, wasMoving = false;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const resize = () => {
      const w=element.clientWidth,h=element.clientHeight;
      renderer.setSize(w,h);
      const aspect=w/h;
      const extent=Math.max(6.3,7/aspect);
      camera.top=extent; camera.bottom=-extent; camera.left=-extent*aspect; camera.right=extent*aspect;
      camera.updateProjectionMatrix();
    };
    const observer=new ResizeObserver(resize); observer.observe(element); resize();
    const up = new THREE.Vector3(0,1,0);
    const placeBeam=(mesh:THREE.Mesh,a:THREE.Vector3,b:THREE.Vector3) => {
      mesh.position.copy(a).add(b).multiplyScalar(.5); mesh.position.y-=.22;
      const delta=b.clone().sub(a);
      mesh.scale.set(.44,delta.length()+.002,.44);
      mesh.quaternion.setFromUnitVectors(up,delta.normalize());
    };
    renderer.setAnimationLoop((time:number) => {
      const dt=Math.min((time-lastTime)/1000,.05); lastTime=time;
      if(lastSelection!==selection.current || lastReplay!==replay.current) {
        from={...current}; to={...configurations[selection.current]};
        if(lastReplay!==replay.current) { from={...configurations[(selection.current+4)%5]}; }
        lastSelection=selection.current; lastReplay=replay.current; elapsed=0; phase=0;
        setStatus("The stair rises and the loop folds; the impossible join stays connected.");
      }
      if(!paused.current) {
        elapsed+=dt; phase=reduced?1:Math.min(1,elapsed/3.6);
        current=interpolate(from,to,phase*phase*(3-2*phase));
        walking+=dt*.085;
      }
      if(phase===1 && wasMoving) setStatus("Follow the white marker: one circuit returns to the same pixel at a different height.");
      wasMoving=phase<1;
      const points=route(current).map(p=>new THREE.Vector3(...p));
      // Independent landings translate in real 3D. Each flight derives its
      // tread rise/run from those landings, including reversal through level.
      [[0,1],[2,3],[4,5]].forEach(([a,b],i)=>placeBeam(beams[i],points[a],points[b]));
      [[1,2],[3,4]].forEach(([start,end],flight)=>{
        const a=points[start],b=points[end],count=20;
        for(let i=0;i<count;i++) {
          const m=steps[flight*count+i],t=(i+.5)/count;
          m.position.copy(a).lerp(b,t);
          m.position.y=a.y+(b.y-a.y)*(i+1)/count-.22;
          m.scale.set(.44,.44,Math.abs(b.z-a.z)/count+.006);
        }
      });
      // Center in the image plane without changing the optical seam.
      const bounds = new THREE.Box3();
      points.forEach(p=>bounds.expandByPoint(p.clone()));
      const center=bounds.getCenter(new THREE.Vector3());
      group.position.copy(center).multiplyScalar(-1);
      let distance=0;
      const lengths=points.slice(1).map((p,i)=>p.distanceTo(points[i]));
      const total=lengths.reduce((a,b)=>a+b,0);
      const target=(walking%1)*total;
      let segment=0;
      while(segment<lengths.length-1 && distance+lengths[segment]<target) distance+=lengths[segment++];
      const t=(target-distance)/lengths[segment];
      marker.position.copy(points[segment]).lerp(points[segment+1],t);
      if(segment===1 || segment===3) marker.position.y=points[segment].y+(points[segment+1].y-points[segment].y)*Math.ceil(t*20)/20;
      marker.position.y+=.13;
      seam.position.copy(points[5]); seam.position.y+=.009;
      measureGeometry.setFromPoints([points[0],points[5]]); measure.computeLineDistances(); measure.visible=reveal.current;
      camera.position.set(reveal.current?18:14,reveal.current?8:14,reveal.current?5:14);
      camera.lookAt(0,0,0);
      renderer.render(world,camera);
    });
    return()=>{renderer.setAnimationLoop(null);observer.disconnect();geometry.dispose();material.dispose();invisible.dispose();stepMaterial.dispose();markerGeometry.dispose();markerMaterial.dispose();seamGeometry.dispose();seamMaterial.dispose();measureGeometry.dispose();measureMaterial.dispose();renderer.dispose();renderer.domElement.remove();};
  },[]);
  return <div className="illusion-lab">
    <header><span>GEOMETRY STUDY / 01</span><h1>Impossible paths</h1><p>Five configurations. One continuous optical loop.</p></header>
    <nav aria-label="Illusion configurations">{configurations.map((c,i)=><button key={c.name} aria-pressed={selected===i} onClick={()=>{selection.current=i;setSelected(i);}}><small>0{i+1}</small>{c.name}</button>)}</nav>
    <div className="illusion-stage" ref={host} role="img" aria-label={`Animated impossible staircase: ${configurations[selected].name}`} />
    <footer><p aria-live="polite">{status}</p><div><button onClick={()=>{paused.current=!paused.current;setPaused(paused.current);}}>{isPaused?"Resume":"Pause"}</button><button onClick={()=>{replay.current++;}}>Replay transition</button><label><input type="checkbox" onChange={e=>{reveal.current=e.target.checked;}} /> Reveal geometry</label></div><small>Prototype only · turquoise marks the join between physically separated ends.</small></footer>
  </div>;
}
