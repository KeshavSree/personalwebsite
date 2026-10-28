import * as THREE from "three";

type Kit = {geometries: THREE.BufferGeometry[]; pink: THREE.Material; cream: THREE.Material; teal: THREE.Material; frameMaterial: THREE.Material; recess: THREE.Material; green: THREE.Material; leaf: THREE.Material};

/** Static palace around the optical mechanism. All tower parts share one center. */
export function buildObservatoryArchitecture(parent: THREE.Group, kit: Kit, dimensions: typeof import("./ObservatoryWorld").OBSERVATORY) {
  const {geometries,pink,cream,teal}=kit;
  const group=new THREE.Group(); group.name="rose-palace-static-architecture"; parent.add(group);
  const sleeveMaterials:THREE.Material[]=[];
  const box=new THREE.BoxGeometry(1,1,1); geometries.push(box);
  function block(p: THREE.Object3D,x:number,y:number,z:number,w:number,h:number,d:number,material=pink) {
    const m=new THREE.Mesh(box,material); m.position.set(x,y,z);m.scale.set(w,h,d);p.add(m);return m;
  }
  function mesh(p:THREE.Object3D,g:THREE.BufferGeometry,material:THREE.Material|THREE.Material[],x:number,y:number,z:number){
    geometries.push(g);const m=new THREE.Mesh(g,material);m.position.set(x,y,z);p.add(m);return m;
  }
  function arch(p:THREE.Object3D,x:number,bottom:number,z:number,width:number,height:number,depth:number,aperture:number){
    // An open contour avoids sliver triangles across the foot of the arch.
    // Centered extrusion means rotating a wall cannot offset its footprint.
    const r=aperture/2,spring=height-.22-r,s=new THREE.Shape();
    s.moveTo(-width/2,0);s.lineTo(-width/2,height);s.lineTo(width/2,height);s.lineTo(width/2,0);
    s.lineTo(r,0);s.lineTo(r,spring);s.absarc(0,spring,r,0,Math.PI,false);s.lineTo(-r,0);s.closePath();
    const geo=new THREE.ExtrudeGeometry(s,{depth,bevelEnabled:false,curveSegments:24});geo.translate(0,0,-depth/2);
    return mesh(p,geo,[pink,kit.recess],x,bottom,z);
  }
  function dome(p:THREE.Object3D,y:number,radius:number){
    const profile=[[0,0],[.78,0],[.94,.16],[1,.38],[.96,.65],[.79,.96],[.54,1.28],[.28,1.63],[.10,1.94],[.035,2.10],[0,2.18]]
      .map(([r,h])=>new THREE.Vector2(r*radius,h*radius));
    mesh(p,new THREE.LatheGeometry(profile,16),teal,0,y,0);
    mesh(p,new THREE.OctahedronGeometry(radius*.115),teal,0,y+radius*2.26,0);
  }
  function crown(p:THREE.Object3D,y:number,w:number){
    // The reference's crown is a small open pavilion, with deep arches beneath
    // a rose frieze, stepped ivory cornices and a pointed turquoise onion dome.
    const wall=.1,h=.82;
    const floor=block(p,0,y-.04,0,w+.1,.08,w+.1,cream);
    floor.name="gazebo-floor";
    for(const sign of [-1,1]){
      arch(p,0,y,sign*(w-wall)/2,w,h,wall,w*.56);
      const side=arch(p,sign*(w-wall)/2,y,0,w-2*wall,h,wall,w*.56);
      side.rotation.y=Math.PI/2;
    }
    const roof=y+h;
    block(p,0,roof+.025,0,w+.12,.05,w+.12,cream);
    block(p,0,roof+.09,0,w+.22,.08,w+.22,cream);

    block(p,0,roof+.35,0,w+.25,.04,w+.25,cream);
    block(p,0,roof+.40,0,w+.3,.06,w+.3,cream);
    // Actual recessed apertures with ivory reveals, rather than painted tiles.
    const friezeWidth=w+.14,recessDepth=.045;
    block(p,0,roof+.23,0,friezeWidth-2*recessDepth,.2,friezeWidth-2*recessDepth,pink);
    const faceShape=new THREE.Shape();
    faceShape.moveTo(-friezeWidth/2,-.1);faceShape.lineTo(friezeWidth/2,-.1);
    faceShape.lineTo(friezeWidth/2,.1);faceShape.lineTo(-friezeWidth/2,.1);faceShape.closePath();
    for(const t of [-.3,0,.3]){
      const x=t*w,r=.04,hole=new THREE.Path();
      hole.moveTo(x-r,-r);hole.lineTo(x-r,r);hole.lineTo(x+r,r);hole.lineTo(x+r,-r);hole.closePath();
      faceShape.holes.push(hole);
    }
    const friezeGeometry=new THREE.ExtrudeGeometry(faceShape,{depth:recessDepth,bevelEnabled:false});
    friezeGeometry.translate(0,0,-recessDepth);geometries.push(friezeGeometry);
    for(let side=0;side<4;side++){
      const angle=side*Math.PI/2,face=new THREE.Group();
      face.position.set(Math.sin(angle)*friezeWidth/2,roof+.23,Math.cos(angle)*friezeWidth/2);
      face.rotation.y=angle;p.add(face);
      face.add(new THREE.Mesh(friezeGeometry,[pink,cream]));
      for(const t of [-.3,0,.3])block(face,t*w,0,-recessDepth+.004,.08,.08,.004,teal);
    }
    for(const a of [-1,1])for(const b of [-1,1])
      block(p,a*(w/2+.04),roof+.49,b*(w/2+.04),.13,.18,.13,cream);
    dome(p,roof+.43,w*.53);
  }
  function spire(parent:THREE.Object3D,x:number,y:number,z:number,scale:number,turn=0){
    const turret=new THREE.Group();turret.name="reference-arched-spire";
    turret.position.set(x,y,z);turret.rotation.z=turn;turret.scale.setScalar(scale);
    parent.add(turret);crown(turret,0,.67);return turret;
  }
  function terrace(x:number,y:number,z:number,w:number,d:number){
    const p=new THREE.Group();p.position.set(x,y,z);group.add(p);
    const thickness=Math.min(w,d);
    block(p,0,-thickness/2,0,w,thickness,d,pink);return p;
  }
  const landings:{from:THREE.Vector3;to:THREE.Vector3;steps:THREE.Group}[]=[];
  // The architecture is built from the mechanism's landing elevations.
  const b=dimensions.beam,lowerTop=dimensions.lower.y+b/2;
  const floor=-5.55,bottom=-18;
  const galleryTop=(floor+lowerTop)/2;
  // Free-standing square piers replace the wall/baseplate foundation.
  const supports:THREE.Mesh[]=[];
  function pier(x:number,z:number,top:number){
    const m:THREE.Mesh<THREE.BufferGeometry,THREE.Material|THREE.Material[]>=block(group,x,(bottom+top)/2,z,b,top-bottom,b);
    // Narrow arched apertures are carved through the original square shaft,
    // with a pale sill and mauve reveal as in the reference's lower towers.
    const h=top-bottom,outline=new THREE.Shape();
    outline.moveTo(-.5,-.5);outline.lineTo(.5,-.5);outline.lineTo(.5,.5);outline.lineTo(-.5,.5);outline.closePath();
    const opening=new THREE.Path(),r=.11/b,base=.5-2.2/h,spring=base+.85/h;
    opening.moveTo(-r,base);opening.lineTo(-r,spring);
    opening.absellipse(0,spring,r,.11/h,Math.PI,0,true,0);
    opening.lineTo(r,base);opening.closePath();outline.holes.push(opening);
    const carved=new THREE.ExtrudeGeometry(outline,{depth:1,bevelEnabled:false,curveSegments:20});
    carved.translate(0,0,-.5);geometries.push(carved);m.geometry=carved;m.material=[pink,kit.recess];
    block(group,x,top-2.2+.025,z,.22,.05,b,cream);
    m.name="square-gallery-pier";supports.push(m);return m;
  }



  const lowerWidth=b;
  const lowerX=dimensions.courtyard.x;
  const lowerZ=dimensions.lower.front;
  const centerY=(dimensions.slate.top+dimensions.slate.bottom)/2;
  const halfY=(dimensions.slate.top-dimensions.slate.bottom)/2;
  const opticalZ=(dimensions.front.z+dimensions.rear.z)/2;
  const shift=opticalZ-dimensions.slate.projectionDepth;
  const upperX=dimensions.slate.right+shift+b;
  const upperZ=opticalZ-halfY;
  const upperTop=centerY+shift+b/2;

  // One connected L-shaped gallery. Its two terminal edges coincide exactly
  // with the lift decks at their middle and lower stops.
  const leftEdge=lowerX+lowerWidth/2;
  terrace((leftEdge+1.15)/2,galleryTop,lowerZ,1.15-leftEdge,b);
  pier(1.15,lowerZ,galleryTop-b);
  terrace(1.15,galleryTop,(lowerZ+upperZ)/2,b,lowerZ-upperZ+b);
  const upperEdge=upperX-b/2;
  const upperGallery=terrace((1.15+upperEdge)/2,galleryTop,upperZ,upperEdge-1.15,b);
  // This buttress shares the courtyard foundation and supports the upper lift.
  // The fixed gallery pier sits beside the moving shaft, not beneath it.
  pier(1.15,upperZ,galleryTop-b);

  // The reference supports its walkways with deep arched haunches. This
  // spandrel occupies only the bay between the two existing square piers.
  const bay=lowerZ-upperZ-b,haunch=.95;
  const spandrel=new THREE.Shape();
  spandrel.moveTo(-bay/2,0);spandrel.lineTo(bay/2,0);
  spandrel.lineTo(bay/2,-haunch);
  spandrel.bezierCurveTo(bay/2,-.38,bay*.22,-.06,0,-.06);
  spandrel.bezierCurveTo(-bay*.22,-.06,-bay/2,-.38,-bay/2,-haunch);
  spandrel.closePath();
  const vault=new THREE.ExtrudeGeometry(spandrel,{depth:b,bevelEnabled:false,curveSegments:32});
  vault.translate(0,0,-b/2);
  const galleryArch=mesh(group,vault,[pink,kit.recess],1.15,galleryTop-b,(lowerZ+upperZ)/2);
  galleryArch.rotation.y=Math.PI/2;galleryArch.name="gallery-integral-arch";

  // Static routes branch from the gallery, clear of both lift footprints.
  // Separate corner cubes and butt-ended spans avoid coplanar joints.
  function causeway(points:[number,number][],top:number){
    points.forEach(([x,z],i)=>{
      if(i>0)terrace(x,top,z,b,b);
      pier(x,z,top-b);
      if(!i)return;
      const [px,pz]=points[i-1],alongX=x!==px;
      const length=Math.abs(alongX?x-px:z-pz)-b;
      const cx=(x+px)/2,cz=(z+pz)/2;
      terrace(cx,top,cz,alongX?length:b,alongX?b:length);
      if(length>1.2){
        const vault=arch(group,cx,top-b-1.6,cz,length,1.6,b,length-.25);
        if(!alongX)vault.rotation.y=Math.PI/2;
      }
    });
  }
  const extensionStart=group.children.length;
  causeway([[-1.35,lowerZ],[-1.35,3.3],[-4,3.3],[-4,4.8],[-6.4,4.8],[-6.4,6.6]],galleryTop);
  const rightStart=group.children.length;
  causeway([[2.35,upperZ],[2.35,-3.7],[4.7,-3.7],[4.7,-4.6],[6.6,-4.6],[6.6,-6.7]],galleryTop);

  for(const part of group.children.slice(extensionStart))part.traverse(mesh=>{mesh.userData.sideMist=true;});

  // Keep each right-hand wing rigid, including its piers, sills and shadows.
  const historyWings=[new THREE.Group(),new THREE.Group()];
  const rightParts=group.children.slice(rightStart);
  historyWings.forEach((wing,i)=>{wing.name=`history-clearance-wing-${i}`;group.add(wing);});
  for(const part of rightParts)historyWings[part.position.x>4.8?1:0].add(part);

  // Distant, low-contrast bridges repeat the reference's architectural
  // vocabulary. Camera-ray displacement keeps them behind the main palace.
  const distant=new THREE.Group();distant.name="mist-distant-bridges";
  distant.position.set(-9,-9,-9);group.add(distant);
  const haze=new THREE.MeshBasicMaterial({color:0x99aaa2,opacity:.19});
  const farHaze=new THREE.MeshBasicMaterial({color:0x99aaa2,opacity:.085});
  sleeveMaterials.push(haze,farHaze);
  const backPaths:[number,number][][]=[
    [[-7,1],[-4.8,1],[-4.8,-2],[-2.5,-2]],
    [[1,-5],[3.2,-5],[3.2,-7],[6,-7]],
    [[-8,3],[-8,0],[-6,0],[-6,-2]],
    [[0,-7],[0,-9],[2,-9],[2,-11]],
  ];
  for(const [pathIndex,points] of backPaths.entries()){
    const bridgeMaterial=pathIndex<2?haze:farHaze;
    for(let i=0;i<points.length;i++){
      const [x,z]=points[i],top=-5.8;
      block(distant,x,top-.275,z,b,b,b,bridgeMaterial);
      block(distant,x,(top-b-18)/2,z,b,top-b+18,b,bridgeMaterial);
      if(!i)continue;
      const [px,pz]=points[i-1],alongX=x!==px,length=Math.abs(alongX?x-px:z-pz)-b;
      block(distant,(x+px)/2,top-.275,(z+pz)/2,alongX?length:b,b,alongX?b:length,bridgeMaterial);
      const bay=arch(distant,(x+px)/2,top-2.1,(z+pz)/2,length,1.55,b,Math.max(.3,length-.3));
      if(!alongX)bay.rotation.y=Math.PI/2;
      bay.material=bridgeMaterial;
    }
  }
  distant.traverse(part=>{part.userData.backdrop=true;part.userData.sideMist=true;});

  // Front gallery corner extends as a rigid square sleeve. At Position 3
  // its back edge meets the near edge of the ivory rail in the locked view.
  const cornerHigh=lowerTop-b;
  const cornerTravel=cornerHigh-galleryTop;
  const cornerSleeve=new THREE.Group();group.add(cornerSleeve);
  cornerSleeve.name="front-corner-rising-sleeve";
  cornerSleeve.position.set(1.15+b,galleryTop+b,lowerZ+b);
  const cornerBody=block(cornerSleeve,0,-(cornerTravel+b)/2,0,b,cornerTravel+b,b,pink);

  type Lift={carrier:THREE.Group;deck:THREE.Mesh;stages:THREE.Mesh[];low:number;high:number;x:number;z:number;width:number;depth:number};
  function lift(name:string,x:number,z:number,low:number,high:number,width:number,depth:number,deckMaterial=pink,deckThickness=b):Lift{
    const carrier=new THREE.Group();carrier.name=name;carrier.position.set(x,low,z);group.add(carrier);
    // Four open walls and a substantial ivory roof: the roof IS the landing.
    const wall=.12,head=1.05;
    for(const sign of [-1,1]){
      arch(carrier,0,-head,sign*(depth-wall)/2,b,head-deckThickness,wall,b*.52);
      const side=arch(carrier,sign*(b-wall)/2,-head,0,depth-2*wall,head-deckThickness,wall,depth*.48);side.rotation.y=Math.PI/2;
    }
    const deck=block(carrier,0,-deckThickness/2,0,width,deckThickness,depth,deckMaterial);
    // Rigid nested stone stages translate inside one another; no tower mesh
    // stretches, turns off-axis, or changes its proportions.
    const stages:THREE.Mesh[]=[];
    const height=(high-low)/5+.08;

    for(let i=0;i<6;i++){
      const stage=block(group,x,low-head-height/2,z,b,height,b,pink);
      stage.name=`${name}-stage-${i}`;
      // Deterministic depth bias for equal-width sliding sleeves: their shared
      // faces otherwise alternate at floating-point precision during movement.
      const sleeveMaterial=pink.clone();
      sleeveMaterial.polygonOffset=true;sleeveMaterial.polygonOffsetFactor=-i;
      sleeveMaterial.polygonOffsetUnits=-i;stage.material=sleeveMaterial;
      sleeveMaterials.push(sleeveMaterial);
      stages.push(stage);
    }
    return {carrier,deck,stages,low,high,x,z,width,depth};
  }
  // Join the lift's back edge to the near turquoise rail, not the
  // higher-looking outer edge of the closing post.
  const leftDockOffset=lowerZ-b/2-(opticalZ+halfY+b/2);
  const leftFrameTop=upperTop+leftDockOffset;
  const courtyardLift=lift("courtyard-to-ivory-lift",lowerX,lowerZ,galleryTop,leftFrameTop,lowerWidth,b);
  // Move the complete lift along the camera ray. Its image is unchanged,
  // but the ivory crossing now occludes the shaft instead of being pierced.
  const liftDepth=new THREE.Group();liftDepth.name="left-lift-impossible-depth";
  liftDepth.position.set(-5,-5,-5);group.add(liftDepth);
  liftDepth.add(courtyardLift.carrier,...courtyardLift.stages);
  courtyardLift.deck.position.addScalar(-liftDepth.position.z-leftDockOffset);
  // Crown coordinates start at the floor's TOP. Seat its underside on the
  // deck so the two upward faces never occupy the same plane during motion.
  const pavilionScale=.82/b,pavilionFloorTop=.5+.08*pavilionScale;
  spire(courtyardLift.deck,0,pavilionFloorTop,0,pavilionScale);
  // The lowest sleeve continues into the mist, without a visible cut end.
  block(liftDepth,lowerX,(-18+galleryTop-1.05)/2,lowerZ,b,galleryTop-1.05+18,b,pink);
  const frameLift=lift("gallery-to-turquoise-lift",upperX,upperZ,galleryTop,upperTop,b,b,pink,b);
  // A pavilion grows from the moving tower's existing square roof.
  // Match the main pavilion; its square walls align with the tower shaft.
  spire(frameLift.deck,0,pavilionFloorTop,0,pavilionScale);
  // The right windowed tower moves as one rigid body. Its neighboring gallery
  // pier remains fixed and extends down; no stationary shaft sits under the lift.
  for(const stage of frameLift.stages)stage.removeFromParent();
  frameLift.stages.length=0;
  // Even at its highest stop, the moving shaft continues below the fog.
  const shaftBottom=-18-upperTop;
  const movingShaft=block(frameLift.carrier,0,(shaftBottom-1.05)/2,0,b,-1.05-shaftBottom,b,pink);
  movingShaft.name="right-lift-rigid-shaft";
  function setLiftPhase(angle:number){
    upperGallery.position.y=galleryTop;
    const cornerPhase=Math.max(0,-Math.cos(angle))**2;
    cornerSleeve.position.y=galleryTop+b+cornerTravel*cornerPhase;
    const ivoryStop=(lowerTop-galleryTop)/(leftFrameTop-galleryTop);
    const phase=((angle%(2*Math.PI))+2*Math.PI)%(2*Math.PI);
    let leftStop=ivoryStop*Math.max(0,Math.cos(angle))**2+Math.max(0,-Math.sin(angle))**2;
    // The shorter ring clears to the right of this roof. Keep the pavilion
    // above its edge until that clearance opens, with a continuous easing curve.
    if(phase<=Math.PI/2)leftStop=ivoryStop*(1-Math.sin(angle)**4);
    if(phase>=Math.PI&&phase<=1.5*Math.PI){
      // Lead the sliding ring gently throughout 4 → 3. The global turn
      // already eases in/out, so a broad monotonic curve avoids a late rush.
      const progress=(1.5*Math.PI-phase)/(Math.PI/2);
      const descent=progress+.95*progress*(1-progress);
      leftStop=1-descent;
    }
    const stops=[leftStop,Math.sin(angle)**2];
    [courtyardLift,frameLift].forEach((lift,i)=>{
      const rise=(lift.high-lift.low)*stops[i];
      lift.carrier.position.y=lift.low+rise;
      for(let j=0;j<lift.stages.length;j++){
        const stage=lift.stages[j];
        stage.position.y=lift.low-1.05-stage.scale.y/2+rise*j/5;
      }
    });
  }
  setLiftPhase(0);
  return {dispose:()=>sleeveMaterials.forEach(m=>m.dispose()),group,supports,landings,crown,spire,setLiftPhase,courtyardLift,frameLift,movingShaft,galleryTop,upperGallery,cornerSleeve,cornerBody,cornerHigh,historyWings};
}
