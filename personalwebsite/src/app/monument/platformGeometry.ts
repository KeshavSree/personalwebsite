export type PlatformPose = { angle: number; height: number; rise: number };
export const ARM_LENGTH = 3.6;
export const STAIR_START = .7;
export const STAIR_RUN = 2.2;
export const STAIR_COUNT = 10;
export function stairHeight(pose: PlatformPose, distance: number) {
  const t=Math.max(0,Math.min(1,(distance-STAIR_START)/STAIR_RUN));
  return pose.rise*Math.ceil(t*STAIR_COUNT)/STAIR_COUNT;
}
export const platformConfigurations = [
  { name: "East ascent", angle: 0, height: 0, rise: .9, depth: 1.6 },
  { name: "Quarter descent", angle: Math.PI / 2, height: 0, rise: -.9, depth: -1.4 },
  { name: "High stair", angle: Math.PI / 2, height: 2.2, rise: 1.1, depth: 1.2 },
  { name: "Reversed stair", angle: Math.PI, height: 2.2, rise: -1.1, depth: -.9 },
  { name: "Lower ascent", angle: Math.PI * 1.5, height: -1.4, rise: .8, depth: 1.2 },
];
export function armPoint(pose: PlatformPose, distance: number): [number,number,number] {
  return [Math.cos(pose.angle)*distance, pose.height+stairHeight(pose,distance), -Math.sin(pose.angle)*distance];
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
  const turn=smooth(progress/.85), lift=smooth((progress-.12)/.88);
  return { angle:from.angle+(nearestAngle(from.angle,to.angle)-from.angle)*turn, height:from.height+(to.height-from.height)*lift, rise:from.rise+(to.rise-from.rise)*smooth((progress-.2)/.8) };
}
