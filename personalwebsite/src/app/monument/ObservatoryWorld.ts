import * as THREE from "three";

// Dimensions reconstructed against the Chapter X green-room frame at 0:34.
// Y is vertical. The camera is the fixed (1,1,1) isometric projection.
export const OBSERVATORY = {
  beam: .55,
  front: {x:0,z:.4,bottom:-5.55,top:6.6},
  rear: {x:0,z:-1.35,bottom:-4.6,top:4.3},
  slate: {left:-2.9,right:4.0,seam:2.25,bottom:1.4,top:4.05,projectionDepth:.3},
  lower: {left:-1.95,right:4.4,back:-.6,front:1.1,y:-.8,travel:2.4},
};

export function buildObservatory() {
  const scene=new THREE.Scene(), root=new THREE.Group();scene.add(root);
  const geometries:THREE.BufferGeometry[]=[];
  const materials:THREE.Material[]=[];
  // Face tones belong to WORLD directions, so a surface turning upward becomes
  // the pale top face instead of retaining its old vertical-face darkness.
  const colors=(hex:number[])=>{
    const m=new THREE.ShaderMaterial({
      uniforms:Object.fromEntries(hex.map((color,i)=>[`c${i}`,{value:new THREE.Color(color)}])),
      vertexShader:`varying vec3 faceNormal; void main(){faceNormal=normalize(mat3(modelMatrix)*normal);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`,
      fragmentShader:`uniform vec3 c0,c1,c2,c3,c4,c5; varying vec3 faceNormal;
        void main(){vec3 n=normalize(faceNormal);vec3 w=abs(n);w/=w.x+w.y+w.z;
        gl_FragColor=vec4((n.x>0.0?c0:c1)*w.x+(n.y>0.0?c2:c3)*w.y+(n.z>0.0?c4:c5)*w.z,1.0);
        #include <colorspace_fragment>
        }`,
    });materials.push(m);return m;
  };
  const ivory=colors([0xe0e9da,0xc5cab9,0xf4f6df,0xaeb7a5,0xb9b6a7,0xc4cdbd]);
  const slate=colors([0xb3b89e,0x969e94,0xa9bec9,0x727e7d,0x858983,0x9aa99e]);
  const single=(color:number)=>{const m=new THREE.MeshBasicMaterial({color,side:THREE.DoubleSide});materials.push(m);return m;};
  const mint=single(0xa9e3c9),dark=single(0x3e4945),white=single(0xf6f8e7),line=single(0x6e9c8b);
  const box=new THREE.BoxGeometry(1,1,1);geometries.push(box);
  const cube=(parent:THREE.Object3D,x:number,y:number,z:number,w:number,h:number,d:number,mat:THREE.Material|THREE.Material[]=ivory)=>{
    const m=new THREE.Mesh(box,mat);m.position.set(x,y,z);m.scale.set(w,h,d);parent.add(m);return m;
  };
  const segment=(parent:THREE.Object3D,a:THREE.Vector3,b:THREE.Vector3,width:number,mat:THREE.Material)=>{
    const m=cube(parent,0,0,0,width,a.distanceTo(b),width,mat);
    m.position.copy(a).add(b).multiplyScalar(.5);m.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),b.clone().sub(a).normalize());return m;
  };
  const {front,rear,slate:s,lower:l,beam:b}=OBSERVATORY;
  cube(root,front.x,(front.top+front.bottom)/2,front.z,b,front.top-front.bottom,b);
  cube(root,rear.x,(rear.top+rear.bottom)/2,rear.z,b,rear.top-rear.bottom,b);
  // The small cap pivots around the tall pillar's own vertical axle.
  const cap=new THREE.Group();cap.name="ivory-cap-y-axle";cap.position.set(0,front.top-b/2,front.z);root.add(cap);
  // At the half-turn the end's underside meets the short pillar's top ONLY
  // in projection: their displacement is (gap,gap,gap).
  const capReach=front.z-rear.z;
  cube(cap,-capReach/2,0,0,capReach+b,b,b);
  // Two open rigid C sections. At the reference stop they read as one rectangle.
  const centerY=(s.top+s.bottom)/2,halfY=(s.top-s.bottom)/2;
  // The slate frame lives BETWEEN the ivory uprights, with a real air gap on
  // either side. Translating equally along X/Y/Z preserves its projection in
  // our locked (1,1,1) camera while correcting the front-to-back ordering.
  const slateDepth=(front.z+rear.z)/2;
  const depthShift=slateDepth-s.projectionDepth;
  const left=new THREE.Group();left.name="slate-left-x-axle";left.position.set(depthShift,centerY+depthShift,slateDepth);root.add(left);
  const right=new THREE.Group();right.name="slate-right-x-axle";right.position.copy(left.position);root.add(right);
  const hiddenCap=new THREE.MeshBasicMaterial({transparent:true,opacity:0,depthWrite:false});materials.push(hiddenCap);
  const opticalRails:{mesh:THREE.Object3D,origin:THREE.Vector3,railY:number}[]=[];
  const seams:{mesh:THREE.Mesh,index:number}[]=[];
  for(const y of [-halfY,halfY]){
    const a=cube(left,(s.left+s.seam-b/2)/2,y,0,s.seam-s.left+b/2,b,b,[slate,slate,slate,slate,slate,slate]);
    const c=cube(right,(s.seam+s.right+b/2)/2,y,0,s.right-s.seam+b/2,b,b,[slate,slate,slate,slate,slate,slate]);
    for(const mesh of [a,c])opticalRails.push({mesh,origin:mesh.position.clone(),railY:y});
    seams.push({mesh:a,index:0},{mesh:c,index:1});
  }
  const leftEnd=new THREE.Group(),rightEnd=new THREE.Group();left.add(leftEnd);right.add(rightEnd);
  // Butt joints: rails own the outer corners; closing posts fit between them.
  // Hidden internal caps must not appear as protruding blocks after depth shifts.
  const postFaces=[slate,slate,hiddenCap,hiddenCap,slate,slate];
  cube(leftEnd,s.left,0,0,b,2*halfY-b,b,postFaces);
  cube(rightEnd,s.right,0,0,b,2*halfY-b,b,postFaces);
  const torus=new THREE.TorusGeometry(.115,.033,10,40);geometries.push(torus);
  const hole=new THREE.CircleGeometry(.1,32);geometries.push(hole);
  for(let i=0;i<5;i++){
    const center=new THREE.Mesh(hole,dark);center.rotation.y=Math.PI/2;center.position.set(s.right+b/2+.002,1.1-i*.55,0);rightEnd.add(center);
    if(i!==1){const rim=new THREE.Mesh(torus,white);rim.rotation.y=Math.PI/2;rim.position.copy(center.position);rim.position.x+=.003;rightEnd.add(rim);}
  }
  // Circular side recesses at the center of the turning end piece.
  const sideHole=new THREE.Mesh(hole,dark);sideHole.position.set(s.right,.55,b/2+.003);rightEnd.add(sideHole);
  // The low walkway SLIDES along X in the footage; it never yaws. Its back
  // rail is an optical branch behind BOTH pillars, its front rail ahead of both.
  const lower=new THREE.Group();lower.name="ivory-frame-x-slide";lower.position.y=l.y;root.add(lower);
  const lowerBack=cube(lower,(l.left+l.right)/2,0,l.back,l.right-l.left+b,b,b);
  const lowerFront=cube(lower,(l.left+l.right)/2,0,l.front,l.right-l.left+b,b,b);
  const opticalDepth=rear.z-1.5*b-l.back;
  lowerBack.position.addScalar(opticalDepth);
  for(const x of [l.left,l.right])cube(lower,x,0,(l.back+l.front)/2,b,b,l.front-l.back-b);
  // Tiny open balconies at the feet of the two uprights.
  function balcony(x:number,y:number,z:number,turn:number,length:number){
    const g=new THREE.Group();g.position.set(x,y,z);g.rotation.y=turn;root.add(g);
    cube(g,length/2,0,0,length+b,.18,b);
    for(const side of [-1,1])cube(g,length/2,.21,side*b/2,length,.25,.045);
    const tip=length+.15;
    for(const side of [-1,1])segment(g,new THREE.Vector3(length,.38,side*b/2),new THREE.Vector3(tip,.05,0),.045,white);
    segment(g,new THREE.Vector3(length,.38,-b/2),new THREE.Vector3(length,.38,b/2),.045,white);
  }
  balcony(0,front.bottom,.4,0,1.25);
  balcony(0,rear.bottom,-1.35,-Math.PI/2,1.2);
  // Door silhouettes, including the distinctive tall pointed opening.
  function door(parent:THREE.Object3D,x:number,y:number,z:number,open:boolean){
    const g=new THREE.Group();g.position.set(x,y,z);parent.add(g);
    const shape=new THREE.Shape();shape.moveTo(-.16,0);shape.lineTo(.16,0);shape.lineTo(.16,.72);shape.lineTo(0,.94);shape.lineTo(-.16,.72);shape.closePath();
    const geo=new THREE.ShapeGeometry(shape);geometries.push(geo);
    const face=new THREE.Mesh(geo,open?dark:mint);g.add(face);
    if(!open){
      for(const dx of [-.11,0,.11])cube(g,dx,.39,.006,.018,.74,.012,line);
      cube(g,0,.42,.012,.12,.025,.018,line);
      cube(g,-.06,.46,.012,.02,.1,.018,line);
      cube(g,.06,.46,.012,.02,.1,.018,line);
    }
    return g;
  }
  const walkEdge=l.front-b/2,walkHeight=l.y+b/2;
  const frontDoor=door(root,0,walkHeight-(walkEdge-(front.z+b/2+.004)),front.z+b/2+.004,true);
  const rearDoor=door(root,0,walkHeight-(walkEdge-(rear.z+b/2+.004)),rear.z+b/2+.004,false);
  // This doorway is mounted to the inside of the slate C and rotates with it.
  const frameDoor=door(leftEnd,s.left+b/2+.006,halfY-b/2-.04,0,false);
  frameDoor.rotation.set(0,Math.PI/2,Math.PI);
  const button=new THREE.Group();button.position.set(s.right-.85,-halfY+b/2+.013,0);right.add(button);
  cube(button,0,0,0,.39,.035,.39,mint);
  cube(button,0,.02,0,.29,.014,.29,white);
  cube(button,0,.03,0,.2,.014,.2,line);
  cube(button,0,.04,0,.14,.014,.14,white);
  opticalRails.push({mesh:button,origin:button.position.clone(),railY:-halfY});
  const traveler=new THREE.Group();traveler.position.set(-.4,1.15,-1.35);traveler.rotation.z=Math.PI/2;root.add(traveler);
  const headGeometry=new THREE.SphereGeometry(.08,16,12);geometries.push(headGeometry);
  const head=new THREE.Mesh(headGeometry,white);head.position.y=.35;traveler.add(head);
  const bodyGeometry=new THREE.ConeGeometry(.1,.26,12);geometries.push(bodyGeometry);
  const body=new THREE.Mesh(bodyGeometry,white);body.position.y=.16;traveler.add(body);
  const world={scene,root,left,right,lower,lowerBack,lowerFront,cap,capReach,traveler,frameDoor,frontDoor,rearDoor,opticalDepth,opticalRails,seams,hiddenCap,slateMaterial:slate,dispose(){geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());}};
  setObservatoryTurn(world,0);
  return world;
}

export function setObservatoryTurn(world:ReturnType<typeof buildObservatory>,angle:number){
  world.left.rotation.x=-angle;
  world.right.rotation.x=angle;
  world.lower.position.x=OBSERVATORY.lower.travel*(Math.cos(angle)-1)/2;
  world.cap.rotation.y=-angle;
  // In the footage both long gray rails remain behind the near pillar and
  // ahead of the rear one even when the rectangle lies horizontally. Correct
  // their depth along the camera null direction AFTER their rigid axle turn.
  for(const rail of world.opticalRails){
    const parent=rail.mesh.parent!;
    const depth=-rail.railY*Math.sin(parent.rotation.x);
    const offset=new THREE.Vector3(depth,depth,depth).applyQuaternion(parent.quaternion.clone().invert());
    rail.mesh.position.copy(rail.origin).add(offset);
  }
  const joined=Math.abs(Math.sin(2*angle))<1e-8;
  for(const seam of world.seams)(seam.mesh.material as THREE.Material[])[seam.index]=joined?world.hiddenCap:world.slateMaterial;
}
