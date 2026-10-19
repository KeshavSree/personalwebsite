// The seam is a real discontinuity in world space, along the null direction
// of the fixed isometric projection. No camera movement or image transforms.
export type Point = [number, number, number];
export type Configuration = { name: string; right: number; left: number; back: number; rise: number; level: number };
export const configurations: Configuration[] = [
  { name: "Ascending loop", right: 4, left: -3, back: -4, rise: 2.4, level: 0 },
  { name: "Reversed depth", right: 4, left: -4, back: -5, rise: -2, level: 1 },
  { name: "Sunken passage", right: 3, left: -4, back: -4, rise: 3, level: -1.5 },
  { name: "Descending return", right: 5, left: -5, back: -5, rise: -3, level: -3 },
  { name: "Double ascent", right: 4, left: -3, back: -3, rise: 3.8, level: 1.8 },
];
export function interpolate(a: Configuration, b: Configuration, t: number): Configuration {
  const lerp = (x: number, y: number) => x + (y - x) * t;
  return { name: b.name, right: lerp(a.right,b.right), left: lerp(a.left,b.left), back: lerp(a.back,b.back), rise: lerp(a.rise,b.rise), level: lerp(a.level,b.level) };
}
export function route(c: Configuration): Point[] {
  return [[0,0,0], [c.right,0,0], [c.right,c.level,c.back], [c.left,c.level,c.back], [c.left,c.rise,c.rise], [c.rise,c.rise,c.rise]];
}
export function project([x,y,z]: Point): [number,number] {
  return [(x-z)/Math.sqrt(2), (2*y-x-z)/Math.sqrt(6)];
}
