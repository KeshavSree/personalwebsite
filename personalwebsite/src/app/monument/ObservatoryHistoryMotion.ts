import * as THREE from "three";
import type {buildObservatory} from "./ObservatoryWorld";

const ramp=(value:number,start:number,end:number)=>{
  const t=THREE.MathUtils.clamp((value-start)/(end-start),0,1);
  return t*t*(3-2*t);
};

/** Additive offsets are removed before the mechanical pose is updated. */
export function createHistoryClearance(world:ReturnType<typeof buildObservatory>){
  const parts=[world.architecture.frameLift.carrier,...world.architecture.historyWings,world.architecture.upperGallery,world.left,world.right];
  const offsets=parts.map(()=>new THREE.Vector3());
  function reset(){parts.forEach((part,i)=>{part.position.sub(offsets[i]);offsets[i].set(0,0,0);});}
  function apply(progress:number){
    reset();
    // The tower leads, the nearby gallery follows, and the outer arches trail.
    const drops=[ramp(progress,.10,.80)*16,ramp(progress,.18,.85)*14,ramp(progress,.25,.95)*18,ramp(progress,.12,.85)*16];
    drops.forEach((drop,i)=>offsets[i].set(0,-drop,0));
    // Follow the negative X ground axis: upper-left in the isometric view,
    // parallel to the long blue beam, with no change in world height.
    const nudge=ramp(progress,.20,.90)*.32;
    offsets[4].set(-nudge,0,0);offsets[5].copy(offsets[4]);
    parts.forEach((part,i)=>part.position.add(offsets[i]));
  }
  return {reset,apply};
}
