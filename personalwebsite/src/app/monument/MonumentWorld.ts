import * as THREE from "three";

export type MovingParts = {
  leftTower: THREE.Group;
  leftStairs: THREE.Group;
  rightTower: THREE.Group;
  upperGallery: THREE.Group;
  lowerCourt: THREE.Group;
  crossing: THREE.Group;
  crossingEnd: THREE.Object3D;
  impossibleLanding: THREE.Group;
  traveler: THREE.Group;
};

export const monumentAnchors = {
  leftTower: [-3.05, -.65, .48],
  rightTower: [3.02, -2.1, -.5],
  upperGallery: [0, -1.2, 1.75],
  lowerCourt: [.55, -4.6, 2.8],
  crossing: [.05, 2.43, 1.13],
} as const;

const plaster = new THREE.MeshLambertMaterial({ color: "#efa29d" });
const plasterLight = new THREE.MeshLambertMaterial({ color: "#f7b09f" });
const plasterShade = new THREE.MeshLambertMaterial({ color: "#c78391" });
const deepRose = new THREE.MeshLambertMaterial({ color: "#8e667e" });
const cream = new THREE.MeshLambertMaterial({ color: "#ffead0" });
const creamShade = new THREE.MeshLambertMaterial({ color: "#ecd0b6" });
const turquoise = new THREE.MeshLambertMaterial({ color: "#2ea8a9" });
const turquoiseDark = new THREE.MeshLambertMaterial({ color: "#16888e" });
const foliage = new THREE.MeshLambertMaterial({ color: "#3b7452" });
const foliageLight = new THREE.MeshLambertMaterial({ color: "#558b58" });

const materials = [plasterShade, plasterLight, cream, plasterShade, plaster, plasterLight];

function box(parent: THREE.Object3D, x: number, y: number, z: number, w: number, h: number, d: number, mat: THREE.Material | THREE.Material[] = materials) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
  mesh.position.set(x, y, z);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  parent.add(mesh);
  return mesh;
}

function archShape(width: number, height: number, aperture: number) {
  const half = width / 2;
  const inner = aperture / 2;
  const shape = new THREE.Shape();
  shape.moveTo(-half, 0);
  shape.lineTo(half, 0);
  shape.lineTo(half, height);
  shape.lineTo(-half, height);
  shape.closePath();
  const hole = new THREE.Path();
  hole.moveTo(-inner, 0);
  hole.lineTo(-inner, height * .48);
  hole.absarc(0, height * .48, inner, Math.PI, 0, true);
  hole.lineTo(inner, 0);
  hole.closePath();
  shape.holes.push(hole);
  return shape;
}

function archWall(parent: THREE.Object3D, x: number, y: number, z: number, width: number, height: number, depth: number, aperture = width * .48) {
  const mesh = new THREE.Mesh(
    new THREE.ExtrudeGeometry(archShape(width, height, aperture), { depth, bevelEnabled: false, curveSegments: 12 }),
    [plaster, plasterShade],
  );
  mesh.position.set(x, y, z);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  parent.add(mesh);
  return mesh;
}

function archedWindow(parent: THREE.Object3D, x: number, y: number, z: number, width: number, height: number, rotationY = 0) {
  const shape = new THREE.Shape();
  shape.moveTo(-width / 2, 0);
  shape.lineTo(width / 2, 0);
  shape.lineTo(width / 2, height - width / 2);
  shape.absarc(0, height - width / 2, width / 2, 0, Math.PI, false);
  shape.closePath();
  const mesh = new THREE.Mesh(new THREE.ShapeGeometry(shape, 12), deepRose);
  mesh.position.set(x, y, z);
  mesh.rotation.y = rotationY;
  parent.add(mesh);
  const reveal = mesh.clone();
  reveal.material = creamShade;
  reveal.scale.set(.68, .76, 1);
  reveal.position.z += Math.cos(rotationY) * .012;
  reveal.position.x += Math.sin(rotationY) * .012;
  parent.add(reveal);
}

function dome(parent: THREE.Object3D, x: number, y: number, z: number, radius: number) {
  const profile = [
    new THREE.Vector2(0, 0),
    new THREE.Vector2(radius * .84, .03),
    new THREE.Vector2(radius, radius * .24),
    new THREE.Vector2(radius * .92, radius * .64),
    new THREE.Vector2(radius * .66, radius * 1.05),
    new THREE.Vector2(radius * .2, radius * 1.55),
    new THREE.Vector2(0, radius * 1.94),
  ];
  const body = new THREE.Mesh(new THREE.LatheGeometry(profile, 12), turquoise);
  body.position.set(x, y, z);
  body.castShadow = true;
  parent.add(body);
  const finial = new THREE.Mesh(new THREE.OctahedronGeometry(radius * .14), turquoiseDark);
  finial.position.set(x, y + radius * 2.06, z);
  parent.add(finial);
}

function crenellations(parent: THREE.Object3D, width: number, depth: number, y: number) {
  for (const x of [-width / 2, width / 2]) {
    for (const z of [-depth / 2, depth / 2]) box(parent, x, y, z, .18, .22, .18, cream);
  }
  for (const x of [-width / 4, width / 4]) {
    box(parent, x, y - .025, -depth / 2, .12, .13, .14, cream);
    box(parent, x, y - .025, depth / 2, .12, .13, .14, cream);
  }
}

function tower(parent: THREE.Object3D, { x, y, z, height, width = .9, roof = true, windows = true, openTop = false }: { x: number; y: number; z: number; height: number; width?: number; roof?: boolean; windows?: boolean; openTop?: boolean }) {
  const group = new THREE.Group();
  group.position.set(x, y, z);
  parent.add(group);
  const openingHeight = openTop ? Math.min(2.25, height * .38) : 0;
  if (openTop) {
    box(group, 0, (height - openingHeight) / 2, 0, width, height - openingHeight, width, materials);
    // The opening walls are centered on the same square footprint as the
    // shaft, cornice and dome. Rotating a wall changes its axis, not its origin.
    const frontArch = archWall(group, 0, height - openingHeight, width / 2 - .14, width, openingHeight, .14, width * .48);
    frontArch.material = [plasterLight, plasterShade];
    const sideArch = archWall(group, width / 2 - .14, height - openingHeight, 0, width, openingHeight, .14, width * .48);
    sideArch.rotation.y = Math.PI / 2;
    sideArch.material = [plasterShade, plasterShade];
    box(group, 0, height - .06, 0, width, .14, width, plasterLight);
  } else {
    box(group, 0, height / 2, 0, width, height, width, materials);
  }
  box(group, 0, height + .05, 0, width + .18, .13, width + .18, cream);
  box(group, 0, height + .19, 0, width + .11, .19, width + .11, [plasterLight, plasterShade, cream, plaster, plasterLight, plaster]);
  for (const inset of [-.27, 0, .27]) {
    box(group, inset * width, height + .16, width / 2 + .075, .075, .075, .015, turquoiseDark);
    box(group, width / 2 + .075, height + .16, inset * width, .015, .075, .075, turquoiseDark);
  }
  crenellations(group, width + .1, width + .1, height + .34);
  if (windows) {
    if (!openTop) {
      archedWindow(group, 0, height * .55, width / 2 + .011, width * .31, width * .7);
      archedWindow(group, width / 2 + .011, height * .55, 0, width * .31, width * .7, Math.PI / 2);
      archedWindow(group, 0, height * .21, width / 2 + .011, width * .12, width * .31);
    } else {
      const lowerArchHeight = Math.min(1.9, height * .37);
      archedWindow(group, 0, height * .14, width / 2 + .012, width * .43, lowerArchHeight);
      archedWindow(group, width / 2 + .012, height * .14, 0, width * .39, lowerArchHeight * .87, Math.PI / 2);
    }
  }
  if (roof) dome(group, 0, height + .27, 0, width * .46);
  return group;
}

function terrace(parent: THREE.Object3D, x: number, y: number, z: number, width: number, depth: number) {
  const group = new THREE.Group();
  group.position.set(x, y, z);
  parent.add(group);
  box(group, 0, -.11, 0, width, .22, depth, materials);
  box(group, 0, .015, 0, width, .035, depth, cream);
  box(group, -width / 2, .16, 0, .12, .3, depth, cream);
  box(group, width / 2, .16, 0, .12, .3, depth, cream);
  box(group, 0, .16, -depth / 2, width, .3, .12, cream);
  return group;
}

function arcadedPlatform(parent: THREE.Object3D, x: number, level: number, z: number, width: number, depth: number, base: number, aperture: number) {
  const height = level - base;
  const wall = .34;
  // The arcade faces sit exactly on the deck's front and right edges. Both
  // walls finish at the walking surface; changing a deck cannot orphan them.
  archWall(parent, x, base, z + depth / 2 - wall, width, height, wall, aperture);
  const side = archWall(parent, x + width / 2 - wall, base, z, depth, height, wall, Math.min(aperture, depth * .55));
  side.rotation.y = Math.PI / 2;
  terrace(parent, x, level, z, width, depth);
  box(parent, x, level + .035, z + depth / 2, width + .04, .1, .12, cream);
}

function levelBridge(parent: THREE.Object3D, from: Point3, to: Point3, width = .62) {
  const dx = to[0] - from[0];
  const dz = to[2] - from[2];
  if (Math.abs(from[1] - to[1]) > .001 || (Math.abs(dx) > .001 && Math.abs(dz) > .001)) {
    throw new Error("Bridge endpoints must share a level and an isometric axis");
  }
  const alongX = Math.abs(dx) > .001;
  const length = Math.hypot(dx, dz);
  const centerX = (from[0] + to[0]) / 2;
  const centerZ = (from[2] + to[2]) / 2;
  box(parent, centerX, from[1] - .1, centerZ, alongX ? length : width, .2, alongX ? width : length, materials);
  for (const edge of [-1, 1]) {
    box(parent,
      centerX + (alongX ? 0 : edge * width / 2), from[1] + .13,
      centerZ + (alongX ? edge * width / 2 : 0),
      alongX ? length : .1, .28, alongX ? .1 : length, cream);
  }
}

type Point3 = readonly [number, number, number];

function stairsBetween(parent: THREE.Object3D, from: Point3, to: Point3, count: number) {
  const group = new THREE.Group();
  parent.add(group);
  for (let i = 0; i < count; i++) {
    box(group, 0, 0, 0, 1, .13, .54, cream);
    box(group, 0, 0, .26, 1, .15, .045, plasterLight);
  }
  retargetStairs(group, from, to);
  return group;
}

export function retargetStairs(group: THREE.Group, from: Point3, to: Point3) {
  const dx = to[0] - from[0];
  const dz = to[2] - from[2];
  if (Math.abs(dx) > .001 && Math.abs(dz) > .001) throw new Error("Stair run must follow one isometric axis");
  const length = Math.hypot(dx, dz);
  const climb = to[1] - from[1];
  group.position.set((from[0] + to[0]) / 2, from[1], (from[2] + to[2]) / 2);
  group.rotation.y = Math.atan2(-dz, dx);
  const count = group.children.length / 2;
  for (let i = 0; i < count; i++) {
    const t = (i + .5) / count;
    const tread = group.children[i * 2] as THREE.Mesh;
    const lip = group.children[i * 2 + 1] as THREE.Mesh;
    tread.position.set((t - .5) * length, t * climb, 0);
    lip.position.set((t - .5) * length, t * climb - .075, .26);
    tread.scale.x = lip.scale.x = length / count + .015;
  }
}

function cypress(parent: THREE.Object3D, x: number, y: number, z: number, height: number) {
  box(parent, x, y + height * .13, z, .08, height * .26, .08, creamShade);
  const tree = new THREE.Mesh(new THREE.ConeGeometry(height * .19, height, 7), foliage);
  tree.position.set(x, y + height * .6, z);
  parent.add(tree);
}

function planter(parent: THREE.Object3D, x: number, y: number, z: number) {
  box(parent, x, y, z, .42, .09, .42, cream);
  const green = new THREE.Mesh(new THREE.DodecahedronGeometry(.22, 0), foliageLight);
  green.position.set(x, y + .1, z);
  parent.add(green);
}

export function buildMonument(): { scene: THREE.Scene; parts: MovingParts } {
  const scene = new THREE.Scene();
  scene.add(new THREE.AmbientLight("#fff8ed", .98));
  const key = new THREE.DirectionalLight("#fff1e4", 1.72);
  key.position.set(-5, 11, 9);
  key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048);
  key.shadow.camera.left = -10;
  key.shadow.camera.right = 10;
  key.shadow.camera.top = 13;
  key.shadow.camera.bottom = -13;
  key.shadow.normalBias = .035;
  key.shadow.radius = 3;
  scene.add(key);
  const fill = new THREE.DirectionalLight("#8acccc", .38);
  fill.position.set(7, 5, -7);
  scene.add(fill);

  const root = new THREE.Group();
  root.rotation.y = 0;
  scene.add(root);

  // Stepped architectural core and open arcades. The arches are actual holes,
  // so the eye can see one tier through another as components rotate.
  arcadedPlatform(root, -.3, 2.25, .45, 2.75, 1.1, -2.8, 1.43);
  tower(root, { x: -.36, y: .85, z: -1.02, height: 6.25, width: 1.12, openTop: true });
  tower(root, { x: 1.18, y: .27, z: -1.0, height: 3.8, width: .88, roof: false });
  terrace(root, .88, 3.55, -.58, 1.8, 1.35);
  box(root, .88, 3.59, -.58, 1.07, .04, .57, turquoise);
  box(root, .88, 3.64, -.58, .73, .025, .34, turquoiseDark);
  box(root, .82, 1.07, .71, .34, 2.87, .07, turquoise);
  box(root, .82, -.41, .78, .34, .11, .18, turquoiseDark);
  box(root, 1.26, 2.29, .43, 1.14, .045, .35, turquoise);
  cypress(root, -1.56, 2.32, .34, .77);
  cypress(root, 1.52, 3.7, -.95, .57);

  const leftTower = new THREE.Group();
  leftTower.position.set(...monumentAnchors.leftTower);
  root.add(leftTower);
  tower(leftTower, { x: 0, y: 0, z: 0, height: 4.5, width: .88, openTop: true });
  terrace(leftTower, .1, 1.56, .43, 1.18, .95);
  planter(leftTower, -.27, 1.61, .64);
  const leftStairs = stairsBetween(root, [-3.05, 3.85, .48], [-.55, 2.25, .48], 18);

  const rightTower = new THREE.Group();
  rightTower.position.set(...monumentAnchors.rightTower);
  root.add(rightTower);
  tower(rightTower, { x: 0, y: 0, z: 0, height: 4.8, width: .94, openTop: true });
  arcadedPlatform(root, 2.06, .75, .65, 1.95, .9, -2.45, .88);
  // The right terrace meets the tower through a short landing at the same
  // level; its footprint overlaps both structures instead of ending in air.
  box(root, 2.69, .68, .08, .58, .14, .43, cream);
  planter(root, 2.69, .84, .75);

  const upperGallery = new THREE.Group();
  upperGallery.position.set(...monumentAnchors.upperGallery);
  root.add(upperGallery);
  arcadedPlatform(upperGallery, -.03, 1.3, -.19, 2.48, .96, 0, .92);
  tower(upperGallery, { x: -2.75, y: -3.4, z: -.19, height: 4.7, width: .82, openTop: true });
  levelBridge(upperGallery, [-2.75, 1.3, -.19], [-1.27, 1.3, -.19], .62);
  box(upperGallery, -.03, 1.34, -.19, 1.85, .025, .28, turquoise);
  box(upperGallery, -.03, 1.36, -.19, 1.53, .015, .19, turquoiseDark);
  cypress(upperGallery, -1.03, 1.48, -.19, .53);

  const lowerCourt = new THREE.Group();
  lowerCourt.position.set(...monumentAnchors.lowerCourt);
  root.add(lowerCourt);
  arcadedPlatform(lowerCourt, -1.3, 3.2, -1.3, 3.4, .7, -.2, 1.4);
  box(lowerCourt, -1.3, 3.24, -1.48, 2.35, .026, .16, turquoise);
  arcadedPlatform(lowerCourt, -.05, 1.9, .2, 3.9, 1.4, -.8, 1.78);
  tower(lowerCourt, { x: -1.6, y: 1.9, z: -.1, height: 1.12, width: .76 });
  tower(lowerCourt, { x: 1.52, y: 1.9, z: .21, height: 1.43, width: .75, roof: false });
  planter(lowerCourt, -1.04, 1.8, -.2);
  planter(lowerCourt, .87, 1.8, -.42);
  cypress(lowerCourt, -.6, 1.84, -.25, .74);
  stairsBetween(lowerCourt, [.2, 3.2, -1.3], [.2, 1.9, .1], 14);

  const crossing = new THREE.Group();
  crossing.position.set(...monumentAnchors.crossing);
  root.add(crossing);
  box(crossing, .88, -.09, 0, 1.76, .18, .56, materials);
  box(crossing, .88, .09, -.29, 1.76, .27, .09, cream);
  box(crossing, .88, .09, .29, 1.76, .27, .09, cream);
  for (let i = 0; i < 12; i++) box(crossing, (i + .5) * 1.76 / 12, .019, 0, .015, .012, .53, creamShade);
  const crossingEnd = new THREE.Object3D();
  crossingEnd.position.set(1.76, 0, 0);
  crossing.add(crossingEnd);

  const impossibleLanding = new THREE.Group();
  root.add(impossibleLanding);
  terrace(impossibleLanding, 0, 0, 0, .85, .75);
  box(impossibleLanding, 0, -.4, 0, .47, .58, .47, materials);

  // Tiny white traveler gives the eye a consistent scale, as in the game.
  const traveler = new THREE.Group();
  traveler.position.set(...monumentAnchors.crossing);
  root.add(traveler);
  const cloak = new THREE.Mesh(new THREE.ConeGeometry(.15, .45, 8), new THREE.MeshLambertMaterial({ color: "#fff9ed" }));
  cloak.position.y = .23;
  traveler.add(cloak);
  const head = new THREE.Mesh(new THREE.SphereGeometry(.09, 8, 8), cream);
  head.position.y = .54;
  traveler.add(head);

  return { scene, parts: { leftTower, leftStairs, rightTower, upperGallery, lowerCourt, crossing, crossingEnd, impossibleLanding, traveler } };
}

export function disposeMonument(scene: THREE.Scene) {
  const geometries = new Set<THREE.BufferGeometry>();
  scene.traverse((object) => { if (object instanceof THREE.Mesh) geometries.add(object.geometry); });
  geometries.forEach((geometry) => geometry.dispose());
}
