import * as THREE from "three";

export type MovingParts = {
  leftTower: THREE.Group;
  rightTower: THREE.Group;
  upperGallery: THREE.Group;
  lowerCourt: THREE.Group;
  crossing: THREE.Group;
  crossingEnd: THREE.Object3D;
  impossibleLanding: THREE.Group;
  traveler: THREE.Group;
};

const plaster = new THREE.MeshLambertMaterial({ color: "#e9a5a0" });
const plasterLight = new THREE.MeshLambertMaterial({ color: "#f4b5a8" });
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
    const frontArch = archWall(group, -width / 2, height - openingHeight, width / 2 - .14, width, openingHeight, .14, width * .48);
    frontArch.material = [plasterLight, plasterShade];
    const sideArch = archWall(group, -width / 2, height - openingHeight, width / 2 - .14, width, openingHeight, .14, width * .48);
    sideArch.rotation.y = Math.PI / 2;
    sideArch.position.x = width / 2 - .14;
    sideArch.position.z = width / 2;
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

function stairs(parent: THREE.Object3D, x: number, y: number, z: number, length: number, climb: number, count: number, rotationY = 0) {
  const group = new THREE.Group();
  group.position.set(x, y, z);
  group.rotation.y = rotationY;
  parent.add(group);
  for (let i = 0; i < count; i++) {
    const t = (i + .5) / count;
    box(group, (t - .5) * length, t * climb, 0, length / count + .015, .13, .54, cream);
    box(group, (t - .5) * length, t * climb - .075, .26, length / count + .015, .15, .045, plasterLight);
  }
  return group;
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
  scene.add(new THREE.AmbientLight("#fff8ed", 1.28));
  const key = new THREE.DirectionalLight("#fff1e4", 2.05);
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
  const fill = new THREE.DirectionalLight("#8acccc", .55);
  fill.position.set(7, 5, -7);
  scene.add(fill);

  const root = new THREE.Group();
  root.rotation.y = 0;
  scene.add(root);

  // Stepped architectural core and open arcades. The arches are actual holes,
  // so the eye can see one tier through another as components rotate.
  const mainArcade = archWall(root, -.5, -2.8, 1.55, 3.1, 4.0, .3, 1.55);
  mainArcade.rotation.y = Math.PI / 2;
  archWall(root, .05, -2.8, -.8, 2.8, 4.3, .34, 1.15);
  tower(root, { x: -.36, y: .85, z: -1.02, height: 6.25, width: 1.12, openTop: true });
  tower(root, { x: 1.18, y: .27, z: -1.0, height: 3.8, width: .88, roof: false });
  terrace(root, -.25, 2.25, .45, 3.1, 1.22);
  terrace(root, .88, 3.55, -.58, 1.8, 1.35);
  box(root, .88, 3.59, -.58, 1.07, .04, .57, turquoise);
  box(root, .88, 3.64, -.58, .73, .025, .34, turquoiseDark);
  box(root, .82, 1.07, .71, .34, 2.87, .07, turquoise);
  box(root, .82, -.41, .78, .34, .11, .18, turquoiseDark);
  box(root, 1.26, 2.29, .43, 1.14, .045, .35, turquoise);
  stairs(root, -.95, 2.1, .52, 1.14, 1.4, 10, 0);
  cypress(root, -1.56, 2.32, .34, .77);
  cypress(root, 1.52, 3.7, -.95, .57);

  const leftTower = new THREE.Group();
  leftTower.position.set(-2.55, -.65, .28);
  root.add(leftTower);
  tower(leftTower, { x: 0, y: 0, z: 0, height: 4.5, width: .88, openTop: true });
  terrace(leftTower, .1, 1.56, .43, 1.18, .95);
  planter(leftTower, -.27, 1.61, .64);
  stairs(root, -1.4, 3.85, .71, 2.3, -1.6, 18, 0);

  const rightTower = new THREE.Group();
  rightTower.position.set(2.52, -.95, -.35);
  root.add(rightTower);
  tower(rightTower, { x: 0, y: 0, z: 0, height: 4.8, width: .94, openTop: true });
  archWall(root, 1.0, -2.45, .31, 2.05, 3.1, .3, .88);
  terrace(root, 1.55, .75, .65, 1.95, .9);
  stairs(root, 1.74, -.69, 1.24, 1.69, 1.38, 13, Math.PI / 2);
  planter(root, 2.17, .84, .75);

  const upperGallery = new THREE.Group();
  upperGallery.position.set(.06, 1.24, .42);
  root.add(upperGallery);
  archWall(upperGallery, -1.31, 0, -.34, 2.62, 1.28, .28, .92);
  terrace(upperGallery, -.03, 1.3, -.19, 2.8, .96);
  box(upperGallery, .87, 1.36, -.19, .75, .04, .52, turquoise);
  box(upperGallery, -.48, 1.37, .17, 1.55, .035, .16, turquoise);
  cypress(upperGallery, -1.03, 1.48, -.19, .53);

  const lowerCourt = new THREE.Group();
  lowerCourt.position.set(.15, -3.15, 1.5);
  root.add(lowerCourt);
  archWall(lowerCourt, -2.0, -.8, .23, 4.0, 2.45, .4, 1.8);
  archWall(lowerCourt, -.84, -2.24, .23, 1.7, 2.7, .34, .71);
  terrace(lowerCourt, -.05, 1.7, .2, 3.9, 1.4);
  tower(lowerCourt, { x: -1.85, y: 1.5, z: -.1, height: 1.52, width: .76 });
  tower(lowerCourt, { x: 1.84, y: 1.48, z: .21, height: 1.85, width: .75, roof: false });
  planter(lowerCourt, -1.04, 1.8, -.2);
  planter(lowerCourt, 1.02, 1.8, .52);
  cypress(lowerCourt, -.6, 1.84, -.25, .74);
  stairs(lowerCourt, .94, 1.75, 1.0, 1.8, 1.02, 13, 0);

  const crossing = new THREE.Group();
  crossing.position.set(.05, 2.43, 1.13);
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
  traveler.position.set(.05, 2.43, 1.13);
  root.add(traveler);
  const cloak = new THREE.Mesh(new THREE.ConeGeometry(.15, .45, 8), new THREE.MeshLambertMaterial({ color: "#fff9ed" }));
  cloak.position.y = .23;
  traveler.add(cloak);
  const head = new THREE.Mesh(new THREE.SphereGeometry(.09, 8, 8), cream);
  head.position.y = .54;
  traveler.add(head);

  return { scene, parts: { leftTower, rightTower, upperGallery, lowerCourt, crossing, crossingEnd, impossibleLanding, traveler } };
}

export function disposeMonument(scene: THREE.Scene) {
  const geometries = new Set<THREE.BufferGeometry>();
  scene.traverse((object) => { if (object instanceof THREE.Mesh) geometries.add(object.geometry); });
  geometries.forEach((geometry) => geometry.dispose());
}
