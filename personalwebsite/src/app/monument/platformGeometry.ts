import { Euler, Quaternion, Vector3 } from "three";

export type PlatformPose = { angle: number; height: number; tilt: number; roll: number };
export const ARM_LENGTH = 3.6;
export const STAIR_START = .7;
export const STAIR_RUN = 2.2;
export const STAIR_COUNT = 10;
export const STAIR_RISE = .9;
export function stairHeight(distance: number) {
  const t=Math.max(0,Math.min(1,(distance-STAIR_START)/STAIR_RUN));
  return STAIR_RISE*Math.ceil(t*STAIR_COUNT)/STAIR_COUNT;
}
export const platformConfigurations = [
  { name: "The first ascent", angle: 0, height: 0, tilt: 0, roll: 0, depth: 1.6 },
  { name: "Along the wall", angle: Math.PI/2, height: 0, tilt: Math.PI/2, roll: 0, depth: -1.4 },
  { name: "Beneath the path", angle: Math.PI, height: 2.2, tilt: Math.PI, roll: 0, depth: 1.2 },
  { name: "The falling stair", angle: 0, height: 1.5, tilt: 0, roll: -Math.PI/2, depth: 1.3 },
  { name: "The far side", angle: Math.PI*1.5, height: 0, tilt: -Math.PI/2, roll: 0, depth: 1.2 },
];
export function orientation(pose: PlatformPose) {
  return new Quaternion().setFromEuler(new Euler(pose.tilt,pose.angle,pose.roll,"YXZ"));
}
export function transform(pose: PlatformPose, point: [number,number,number]): [number,number,number] {
  const p=new Vector3(...point).applyQuaternion(orientation(pose));p.y+=pose.height;
  return p.toArray() as [number,number,number];
}
export function surfaceNormal(pose: PlatformPose) {
  return new Vector3(0,1,0).applyQuaternion(orientation(pose));
}
export function armPoint(pose: PlatformPose, distance: number): [number,number,number] {
  return transform(pose,[distance,stairHeight(distance),0]);
}
export function dockPoint(index: number, distance = 0): [number,number,number] {
  const config = platformConfigurations[index];
  return armPoint(config,ARM_LENGTH+distance).map(v=>v+config.depth) as [number,number,number];
}
export function travelerPoint(pose: PlatformPose, dock: number, distance: number): [number,number,number] {
  return distance <= ARM_LENGTH ? armPoint(pose,distance) : dockPoint(dock,distance-ARM_LENGTH);
}
export function nearestAngle(from: number, to: number) {
  return from + Math.atan2(Math.sin(to-from),Math.cos(to-from));
}
export const smooth = (t: number) => { const x=Math.max(0,Math.min(1,t)); return x*x*(3-2*x); };
export function platformMotion(from: PlatformPose, to: PlatformPose, progress: number): PlatformPose {
  const turn=smooth(progress), lift=smooth((progress-.12)/.88);
  return {
    angle:from.angle+(nearestAngle(from.angle,to.angle)-from.angle)*turn,
    tilt:from.tilt+(nearestAngle(from.tilt,to.tilt)-from.tilt)*turn,
    roll:from.roll+(nearestAngle(from.roll,to.roll)-from.roll)*turn,
    height:from.height+(to.height-from.height)*lift,
  };
}
