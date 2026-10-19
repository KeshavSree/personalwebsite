import { Quaternion, Vector3 } from "three";

export type PlatformPose = { roll: number; lifts: number[] };
export const ARM_LENGTH = 3.6;
export const STAIR_START = .7;
export const STAIR_RUN = 2.2;
export const STAIR_COUNT = 10;
export const STAIR_RISE = .9;
export const AXLE = new Vector3(0,0,1);
export function stairHeight(distance: number) {
  const t=Math.max(0,Math.min(1,(distance-STAIR_START)/STAIR_RUN));
  return STAIR_RISE*Math.ceil(t*STAIR_COUNT)/STAIR_COUNT;
}
const stops=[
  {name:"The first ascent",roll:0,depth:1.6},
  {name:"The rising wall",roll:Math.PI/2,depth:-1.4},
  {name:"Beneath the stair",roll:Math.PI,depth:1.2},
  {name:"The descending wall",roll:Math.PI*1.5,depth:1.3},
  {name:"The hidden landing",roll:Math.PI*2,depth:-1.6},
];
export const platformConfigurations=stops.map((stop,i)=>({...stop,lifts:stops.map((_,j)=>i===j?0:-1.8)}));
// This body has ONE permanently fixed axle. Its pivot never translates.
export function orientation(pose: PlatformPose) {
  return new Quaternion().setFromAxisAngle(AXLE,pose.roll);
}
export function transform(pose: PlatformPose, point:[number,number,number]):[number,number,number] {
  return new Vector3(...point).applyQuaternion(orientation(pose)).toArray() as [number,number,number];
}
export function surfaceNormal(pose: PlatformPose) { return new Vector3(0,1,0).applyQuaternion(orientation(pose)); }
export function armPoint(pose: PlatformPose,distance:number):[number,number,number] { return transform(pose,[distance,stairHeight(distance),0]); }
export function dockPoint(index:number,distance=0):[number,number,number] {
  const c=platformConfigurations[index];
  return armPoint(c,ARM_LENGTH+distance).map(v=>v+c.depth) as [number,number,number];
}
export function travelerPoint(pose:PlatformPose,dock:number,distance:number):[number,number,number] {
  if(distance<=ARM_LENGTH)return armPoint(pose,distance);
  const p=dockPoint(dock,distance-ARM_LENGTH);p[1]+=pose.lifts[dock];return p;
}
export function nearestAngle(from:number,to:number){return from+Math.atan2(Math.sin(to-from),Math.cos(to-from));}
export const smooth=(t:number)=>{const x=Math.max(0,Math.min(1,t));return x*x*(3-2*x);};
export function platformMotion(from:PlatformPose,to:PlatformPose,progress:number):PlatformPose {
  return {
    roll:from.roll+(nearestAngle(from.roll,to.roll)-from.roll)*smooth((progress-.12)/.72),
    lifts:from.lifts.map((height,i)=>{
      // Release the old route before rotating; receive the new route afterward.
      const t=to.lifts[i]>height?smooth((progress-.48)/.52):smooth(progress/.38);
      return height+(to.lifts[i]-height)*t;
    }),
  };
}
