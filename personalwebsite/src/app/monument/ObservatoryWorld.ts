import * as THREE from "three";
import {buildObservatoryArchitecture} from "./ObservatoryArchitecture";

export const SLATE_LAYER = 1;

// Dimensions reconstructed against the Chapter X green-room frame at 0:34.
// Y is vertical. The camera is the fixed (1,1,1) isometric projection.
export const OBSERVATORY = {
  beam: .55,
  front: {x:0,z:.4,bottom:-5.55,top:6.6},
  rear: {x:0,z:-1.35,bottom:-4.6,top:4.3},
  courtyard: {x:-2.5},
  slate: {left:-2.9,right:4.0,seam:2.25,bottom:1.4,top:4.05,projectionDepth:.3},
  lower: {left:-.45,right:4.7,back:-.6,front:1.1,y:-.8},
};

export function observatorySlideLimit(){
  const {front,rear,slate,lower,beam}=OBSERVATORY;
  const opticalZ=(front.z+rear.z)/2;
  const towerX=slate.right+opticalZ-slate.projectionDepth+beam;
  const towerZ=opticalZ-(slate.top-slate.bottom)/2;
  // The cap's far edge and the tower's near edge share the same x-z
  // coordinate in the locked isometric view. No overlap or exposed sliver.
  return towerX-towerZ-beam+lower.back;
}

/** A shorter shuttle clears the towers on the outside before docking again. */
export function observatorySlideX(angle:number){
  const quarter=Math.PI/2,phase=((angle%(2*Math.PI))+2*Math.PI)%(2*Math.PI);
  const stop=Math.floor(phase/quarter),t=phase/quarter-stop;
  // Keep the original left tower join at 1 and the rising corner join at 3.
  // The horizontal-frame stops provide the extra clearance to the right.
  const towerDock=OBSERVATORY.courtyard.x+OBSERVATORY.beam-OBSERVATORY.lower.left;
  const cornerDock=-1.0;
  // A fixed outer stop couples length and travel: extending the right end
  // reduces the slide by exactly the same distance.
  const clearance=observatorySlideLimit()-OBSERVATORY.lower.right;
  const stops=[towerDock,clearance,cornerDock,clearance,towerDock];
  return THREE.MathUtils.lerp(stops[stop],stops[stop+1],(1-Math.cos(Math.PI*t))/2);
}

export function buildObservatory() {
  const scene=new THREE.Scene(), root=new THREE.Group();scene.add(root);
  const geometries:THREE.BufferGeometry[]=[];
  const materials:THREE.Material[]=[];
  // One albedo per material. Face shading and occlusion come from the light.
  const stone=(color:number)=>{
    const material=new THREE.MeshLambertMaterial({color});
    materials.push(material);return material;
  };
  const pink=stone(0xf3a99e),ivory=pink;
  const slate=stone(0x55b9b3);
  const cream=stone(0xffecd0);
  const teal=stone(0x2babad);
  const green=stone(0x477c4f),leaf=stone(0x699355);
  // The cream walking face is a different stone, not a painted highlight.
  const capStone=[pink,pink,cream,pink,pink,pink];
  const single=(color:number)=>{const m=new THREE.MeshBasicMaterial({color,side:THREE.DoubleSide});materials.push(m);return m;};
  const mint=single(0x55b9b3),dark=single(0x74536b),white=single(0xfff5df),line=single(0x227e86);
  const architecture=buildObservatoryArchitecture(root,{geometries,pink,cream,teal,frameMaterial:slate,recess:pink,green,leaf},OBSERVATORY);
  // The docking roof and frame must resolve depth together. Rendering the roof
  // in ordinary world depth lets the optical plane paint a false side face over
  // its landing, even when all projected edge coordinates agree.
  architecture.frameLift.deck.traverse(part=>part.layers.set(SLATE_LAYER));
  // Resolve the left landing in the frame pass; its shaft stays behind the
  // ivory ring. A camera-ray offset joins the roof to the rail in real depth.
  architecture.courtyardLift.deck.traverse(part=>part.layers.set(SLATE_LAYER));
  const box=new THREE.BoxGeometry(1,1,1);geometries.push(box);
  const cube=(parent:THREE.Object3D,x:number,y:number,z:number,w:number,h:number,d:number,mat:THREE.Material|THREE.Material[]=ivory)=>{
    const m=new THREE.Mesh(box,mat);m.position.set(x,y,z);m.scale.set(w,h,d);parent.add(m);return m;
  };
  const segment=(parent:THREE.Object3D,a:THREE.Vector3,b:THREE.Vector3,width:number,mat:THREE.Material)=>{
    const m=cube(parent,0,0,0,width,a.distanceTo(b),width,mat);
    m.position.copy(a).add(b).multiplyScalar(.5);m.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),b.clone().sub(a).normalize());return m;
  };
  const {front,rear,slate:s,lower:l,beam:b}=OBSERVATORY;
  // Real openings through otherwise uninterrupted shafts; keep the entire
  // optical crossing zone solid so its depth mask cannot acquire false gaps.
  function shaft(x:number,z:number,bottom:number,top:number,windows:number[],material:THREE.Material|THREE.Material[]=[ivory,pink]){
    const outline=new THREE.Shape();
    outline.moveTo(-b/2,0);outline.lineTo(b/2,0);outline.lineTo(b/2,top-bottom);outline.lineTo(-b/2,top-bottom);outline.closePath();
    for(const level of windows){
      const y=level-bottom,r=.12,h=.95,path=new THREE.Path();
      path.moveTo(-r,y);path.lineTo(-r,y+h-r);path.absarc(0,y+h-r,r,Math.PI,0,true);path.lineTo(r,y);path.closePath();outline.holes.push(path);
    }
    const geometry=new THREE.ExtrudeGeometry(outline,{depth:b,bevelEnabled:false,curveSegments:20});geometry.translate(0,0,-b/2);geometries.push(geometry);
    const mesh=new THREE.Mesh(geometry,material);mesh.position.set(x,bottom,z);root.add(mesh);
    return mesh;
  }
  const frontWindow=4.8;
  const frontShaft=shaft(front.x,front.z,-18,front.top-b,[-4.4,frontWindow]);
  const frameDepth=(front.z+rear.z)/2;
  const rearDockShift=(frameDepth-b/2)-(rear.z+b/2);
  const rearLow=s.top+(frameDepth-s.projectionDepth)+b/2-rearDockShift;
  const rearShaft=shaft(rear.x,rear.z,-18,rearLow-b,[-3.6],pink);
  // A rigid upper sleeve rises into the cap at the first quarter-turn.
  // Its narrower stem nests inside the fixed shaft without coplanar surfaces.
  const rearCrown=new THREE.Group();rearCrown.name="rear-tower-vertical-sleeve";
  rearCrown.position.set(rear.x,rear.top,rear.z);root.add(rearCrown);
  cube(rearCrown,0,-b/2,0,b,b,b,pink);
  const rearRise=front.top-rear.top;
  const rearStem=front.top-rearLow+b;
  cube(rearCrown,0,-b-rearStem/2,0,b-.04,rearStem,b-.04,pink);
  // The small cap pivots around the tall pillar's own vertical axle.
  const cap=new THREE.Group();cap.name="ivory-cap-y-axle";cap.position.set(0,front.top-b/2,front.z);root.add(cap);
  // At the half-turn the end's underside meets the short pillar's top ONLY
  // in projection: their displacement is (gap,gap,gap).
  const capReach=front.z-rear.z;
  const capBeam=cube(cap,-capReach/2,0,0,capReach+b,b,b,capStone);
  // The pavilion belongs to the cap's rigid Y axle. The far end and underside
  // remain bare so the impossible docking face is still fully readable.
  architecture.spire(cap,0,b/2+.04,0,.82);
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
  const grayRails:{mesh:THREE.Mesh,origin:THREE.Vector3}[]=[];
  const seams:{mesh:THREE.Mesh,index:number}[]=[];
  for(const y of [-halfY,halfY]){
    const a=cube(left,(s.left+s.seam-b/2)/2,y,0,s.seam-s.left+b/2,b,b,[slate,slate,slate,slate,slate,slate]);
    const c=cube(right,(s.seam+s.right+b/2)/2,y,0,s.right-s.seam+b/2,b,b,[slate,slate,slate,slate,slate,slate]);
    for(const mesh of [a,c])grayRails.push({mesh,origin:mesh.position.clone()});
    seams.push({mesh:a,index:0},{mesh:c,index:1});
  }
  const leftEnd=new THREE.Group(),rightEnd=new THREE.Group();left.add(leftEnd);right.add(rightEnd);
  // Butt joints: rails own the outer corners; closing posts fit between them.
  // Hidden internal caps must not appear as protruding blocks after depth shifts.
  const postFaces=[slate,slate,hiddenCap,hiddenCap,slate,slate];
  cube(leftEnd,s.left,0,0,b,2*halfY-b,b,postFaces);
  cube(rightEnd,s.right,0,0,b,2*halfY-b,b,postFaces);
  // Extend the existing C bodies themselves. Both additions inherit the exact
  // same optical pass and single axle as their parent; no independent motion.
  // A stair climbs from the lower rail into the upper rail. Its whole walking
  // surface turns sideways/upside-down with the left C.
  const stairStart=s.left+b/2,stairEnd=stairStart+2.45;
  const stairBottom=-halfY+b/2,stairTop=halfY+b/2;
  const stairCount=14,stairRun=(stairEnd-stairStart)/stairCount;
  const stairRise=(stairTop-stairBottom)/stairCount;
  const stairShape=new THREE.Shape();
  stairShape.moveTo(stairStart,stairBottom);
  for(let i=0;i<stairCount;i++){
    stairShape.lineTo(stairStart+i*stairRun,stairBottom+(i+1)*stairRise-.044);
    stairShape.lineTo(stairStart+(i+1)*stairRun,stairBottom+(i+1)*stairRise-.044);
  }
  // The reverse face is a second staircase, descending in the opposite
  // direction when the rigid flight turns over. Both faces end flush with
  // the top/bottom faces of the same cubic landings.
  stairShape.lineTo(stairEnd,stairTop-b);
  for(let i=stairCount-1;i>=0;i--){
    stairShape.lineTo(stairStart+(i+1)*stairRun,stairBottom+i*stairRise-b+.044);
    stairShape.lineTo(stairStart+i*stairRun,stairBottom+i*stairRise-b+.044);
  }
  stairShape.closePath();
  const stairGeometry=new THREE.ExtrudeGeometry(stairShape,{depth:b,bevelEnabled:false});
  stairGeometry.translate(0,0,-b/2);geometries.push(stairGeometry);
  const turningStair=new THREE.Group();turningStair.name="left-axle-integral-stair";left.add(turningStair);
  // The flight runs beside the rail, not through its upper beam. Full-width
  // landings turn back into the ring at both ends.
  turningStair.position.z=b;
  turningStair.add(new THREE.Mesh(stairGeometry,slate));
  for(let i=0;i<stairCount;i++){
    cube(turningStair,stairStart+(i+.5)*stairRun,stairBottom+(i+1)*stairRise-.022,
      0,stairRun,.044,b,cream);
    cube(turningStair,stairStart+(i+.5)*stairRun,stairBottom+i*stairRise-b+.022,
      0,stairRun,.044,b,cream);
  }
  const stairLandings=[cube(left,stairStart-b/2,stairBottom-b/2,b,b,b,b,slate),
    cube(left,stairEnd+b/2,stairTop-b/2,b,b,b,b,slate)];
  // The opposite C becomes a deep, open arcade. Its feet and crown terminate
  // at the inside edges of its existing rails, leaving the optical split bare.
  const passage=new THREE.Group();passage.name="right-axle-integral-arcade";right.add(passage);
  const passageLeft=s.seam+.28,passageRight=s.right-b/2;
  const passageWidth=passageRight-passageLeft,passageHeight=2*halfY-b;
  const openingRadius=(passageWidth-.26)/2;
  const spring=passageHeight-.18-openingRadius;
  const arcade=new THREE.Shape();
  arcade.moveTo(-passageWidth/2,0);arcade.lineTo(-passageWidth/2,passageHeight);
  arcade.lineTo(passageWidth/2,passageHeight);arcade.lineTo(passageWidth/2,0);
  arcade.lineTo(openingRadius,0);arcade.lineTo(openingRadius,spring);
  arcade.absarc(0,spring,openingRadius,0,Math.PI,false);
  arcade.lineTo(-openingRadius,0);arcade.closePath();
  const arcadeGeometry=new THREE.ExtrudeGeometry(arcade,{depth:b,bevelEnabled:false,curveSegments:24});
  arcadeGeometry.translate(0,0,-b/2);geometries.push(arcadeGeometry);
  const wall=new THREE.Mesh(arcadeGeometry,slate);
  wall.position.set((passageLeft+passageRight)/2,-halfY+b/2,0);passage.add(wall);
  const movingRoute={turningStair,passage,stairLandings,stairStart,stairEnd,stairBottom,stairTop,stairCount};
  const torus=new THREE.TorusGeometry(.115,.033,10,40);geometries.push(torus);
  const hole=new THREE.CircleGeometry(.1,32);geometries.push(hole);
  for(let i=0;i<5;i++){
    // Keep the controls inside the free middle face. The two outer corner
    // faces dock against the lift roof and must have no protruding ring rims.
    const center=new THREE.Mesh(hole,dark);center.rotation.y=Math.PI/2;center.position.set(s.right+b/2+.002,.64-i*.32,0);rightEnd.add(center);
    if(i!==1){const rim=new THREE.Mesh(torus,white);rim.rotation.y=Math.PI/2;rim.position.copy(center.position);rim.position.x+=.003;rightEnd.add(rim);}
  }
  // Circular side recesses at the center of the turning end piece.
  const sideHole=new THREE.Mesh(hole,dark);sideHole.position.set(s.right,.55,b/2+.003);rightEnd.add(sideHole);
  // The low walkway SLIDES along X in the footage; it never yaws. Its back
  // rail is an optical branch behind BOTH pillars, its front rail ahead of both.
  const lower=new THREE.Group();lower.name="ivory-frame-x-slide";lower.position.y=l.y;root.add(lower);
  const lowerBack=cube(lower,(l.left+l.right)/2,0,l.back,l.right-l.left+b,b,b,cream);
  const lowerFront=cube(lower,(l.left+l.right)/2,0,l.front,l.right-l.left+b,b,b,cream);
  const opticalDepth=rear.z-1.5*b-l.back;
  lowerBack.position.addScalar(opticalDepth);
  for(const x of [l.left,l.right]){
    const end=cube(lower,x,0,(l.back+l.front)/2,l.front-l.back-b,b,b,cream);
    end.rotation.y=Math.PI/2;
  }
  // Tiny open balconies at the feet of the two uprights.
  function balcony(x:number,y:number,z:number,turn:number,length:number){
    const g=new THREE.Group();g.position.set(x,y,z);g.rotation.y=turn;root.add(g);
    cube(g,length/2,.09-b/2,0,length+b,b,b);
    for(const side of [-1,1])cube(g,length/2,.21,side*b/2,length,.25,.045);
    const tip=length+.15;
    for(const side of [-1,1])segment(g,new THREE.Vector3(length,.38,side*b/2),new THREE.Vector3(tip,.05,0),.045,white);
    segment(g,new THREE.Vector3(length,.38,-b/2),new THREE.Vector3(length,.38,b/2),.045,white);
  }
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
  // Mount the purple window on the shaft, including its Home retraction.
  const frontDoor=door(frontShaft,0,frontWindow-frontShaft.position.y,b/2+.004,true);
  const rearDoor=door(root,0,walkHeight-(walkEdge-(rear.z+b/2+.004)),rear.z+b/2+.004,false);
  // This doorway is mounted to the inside of the slate C and rotates with it.
  const frameDoor=door(leftEnd,s.left+b/2+.006,halfY-b/2-.04,0,false);
  frameDoor.rotation.set(0,Math.PI/2,Math.PI);
  const button=new THREE.Group();button.position.set(s.right-.85,-halfY+b/2+.013,0);right.add(button);
  cube(button,0,0,0,.39,.035,.39,mint);
  cube(button,0,.02,0,.29,.014,.29,white);
  cube(button,0,.03,0,.2,.014,.2,line);
  cube(button,0,.04,0,.14,.014,.14,white);
  // Shade the genuinely connected gray pieces together in their own pass.
  // The compositor supplies impossible depth relative to the ivory structure;
  // individual beam offsets would expose false corner faces and lighting seams.
  for(const part of [left,right])part.traverse(object=>object.layers.set(SLATE_LAYER));
  // Height fog lives in the architecture's coordinate system, not the image.
  // Equal camera-ray offsets used by the illusion must not change its altitude.
  const homeShadowOffset={value:0},homeRearShadowOffset={value:0};
  const fogMaterials=new Map<string,THREE.Material>();
  root.traverse(object=>{
    if(!(object instanceof THREE.Mesh))return;
    let offset=0;
    for(let ancestor:THREE.Object3D|null=object.parent;ancestor;ancestor=ancestor.parent){
      if(ancestor.name==="left-lift-impossible-depth")offset=5;
      if(ancestor.name==="mist-distant-bridges")offset=9;
    }
    let shadowOffset=object.userData.backdrop?0:offset;
    let homeShadow=object===frontShaft;
    let rearHomeShadow=object===rearShaft;
    for(let part:THREE.Object3D|null=object;part;part=part.parent)
      if(part===rearCrown)rearHomeShadow=true;
    for(let part:THREE.Object3D|null=object;part;part=part.parent)
      if(part===cap||part===frontShaft)homeShadow=true;
    for(let part:THREE.Object3D|null=object;part;part=part.parent)
      if(part===architecture.courtyardLift.deck)shadowOffset=5-part.position.x;
    if(object.layers.isEnabled(SLATE_LAYER))offset=0;
    const fogRange=object.userData.backdrop?"-7.0,-5.2":"mix(-10.0,-6.0,outwardMist),mix(-4.0,-2.8,outwardMist)";
    const lateralFog=object.userData.sideMist?"1.0":"0.0";
    const fogged=(source:THREE.Material)=>{
      if(source.opacity===0)return source;
      const key=source.uuid+":"+offset+":"+shadowOffset+":"+fogRange+":"+lateralFog+":"+homeShadow+":"+rearHomeShadow;
      const existing=fogMaterials.get(key);if(existing)return existing;
      const material=source.clone();materials.push(material);
      material.onBeforeCompile=shader=>{
        shader.uniforms.homeShadowOffset=homeShadowOffset;
        shader.uniforms.homeRearShadowOffset=homeRearShadowOffset;
        shader.vertexShader="uniform float homeShadowOffset; uniform float homeRearShadowOffset;\n"+shader.vertexShader;
        shader.vertexShader="varying float palaceAltitude; varying vec3 palacePosition;\n"+shader.vertexShader;
        shader.vertexShader=shader.vertexShader.replace("#include <project_vertex>",
          "#include <project_vertex>\npalaceAltitude=(modelMatrix*vec4(transformed,1.0)).y+"+offset.toFixed(1)+";\npalacePosition=(modelMatrix*vec4(transformed,1.0)).xyz+vec3("+offset.toFixed(1)+");");
        // Sample shadows at the connected lift, before its camera-ray displacement.
        shader.vertexShader=shader.vertexShader.replace("#include <shadowmap_vertex>",
          "worldPosition.xyz+=vec3("+shadowOffset.toFixed(4)+(homeShadow?"+homeShadowOffset":rearHomeShadow?"+homeRearShadowOffset":"")+");\n#include <shadowmap_vertex>\nworldPosition.xyz-=vec3("+shadowOffset.toFixed(4)+(homeShadow?"+homeShadowOffset":rearHomeShadow?"+homeRearShadowOffset":"")+");");
        shader.fragmentShader="varying float palaceAltitude; varying vec3 palacePosition;\n"+shader.fragmentShader;
        shader.fragmentShader=shader.fragmentShader.replace("#include <dithering_fragment>",
          "#include <dithering_fragment>\n"+
          "vec2 p=palacePosition.xz;\n"+
          "float routeDistance=min(length(p-vec2(clamp(p.x,-2.5,1.15),1.1)),min(length(p-vec2(1.15,clamp(p.y,-1.8,1.1))),length(p-vec2(clamp(p.x,1.15,3.775),-1.8))));\n"+
          "float outwardMist=smoothstep(0.55,2.4,routeDistance);\nfloat clearAir=smoothstep("+fogRange+",palaceAltitude);\nfloat sideMist=1.0-smoothstep(0.1,3.5,routeDistance);\nfloat lowArchitecture=1.0-smoothstep(-1.0,0.0,palaceAltitude);\ngl_FragColor.a*=clearAir*mix(1.0,sideMist,lowArchitecture*"+lateralFog+");");
      };
      material.customProgramCacheKey=()=>"palace-height-fog-"+offset+"-shadow-"+shadowOffset+"-"+fogRange+"-"+lateralFog+"-"+homeShadow+"-"+rearHomeShadow;
      // Keep opaque depth ordering; only the final contribution fades into air.
      material.blending=THREE.CustomBlending;
      material.blendSrc=THREE.SrcAlphaFactor;material.blendDst=THREE.OneMinusSrcAlphaFactor;
      material.blendSrcAlpha=THREE.OneFactor;material.blendDstAlpha=THREE.OneMinusSrcAlphaFactor;
      fogMaterials.set(key,material);return material;
    };
    object.material=Array.isArray(object.material)?object.material.map(fogged):fogged(object.material);
  });
  const sun=new THREE.DirectionalLight(0xffffff,2.2);
  sun.position.set(-8,14,10);sun.target.position.set(0,0,0);
  sun.layers.enableAll();sun.castShadow=true;
  sun.shadow.mapSize.set(2048,2048);
  Object.assign(sun.shadow.camera,{left:-13,right:13,top:13,bottom:-13,near:.5,far:60});
  sun.shadow.bias=-.00015;sun.shadow.normalBias=.025;sun.shadow.radius=2;
  const fill=new THREE.AmbientLight(0xffffff,2);fill.layers.enableAll();
  scene.add(sun,sun.target,fill);
  root.traverse(object=>{if(object instanceof THREE.Mesh){object.castShadow=!object.userData.backdrop;object.receiveShadow=true;}});
  const world={isHome:false,homeRearCrownShadowDrop:0,homeShadowOffset,homeRearShadowOffset,scene,root,architecture,movingRoute,frontShaft,rearShaft,rearCrown,rearRise,rearLow,left,right,lower,lowerBack,lowerFront,cap,capBeam,capReach,frameDoor,frontDoor,rearDoor,opticalDepth,grayRails,slateDepth,seams,hiddenCap,slateMaterial:slate,dispose(){sun.shadow.map?.dispose();architecture.dispose();geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());}};
  setObservatoryTurn(world,0);
  return world;
}

export function setObservatoryTurn(world:ReturnType<typeof buildObservatory>,angle:number){
  world.isHome=false;
  world.homeShadowOffset.value=0;
  world.homeRearShadowOffset.value=0;
  world.homeRearCrownShadowDrop=0;
  // Restore the regular mechanism elevations when leaving the home preview.
  const {front,rear,slate,lower}=OBSERVATORY;
  world.frontShaft.position.y=world.rearShaft.position.y=-18;
  world.cap.position.y=front.top-OBSERVATORY.beam/2;
  const frameY=(slate.top+slate.bottom)/2+(front.z+rear.z)/2-slate.projectionDepth;
  world.left.position.y=world.right.position.y=frameY;
  world.left.position.z=world.right.position.z=world.slateDepth;
  world.lower.position.y=lower.y;
  world.lowerBack.position.set((lower.left+lower.right)/2,0,lower.back).addScalar(world.opticalDepth);
  world.architecture.setLiftPhase(angle);
  world.left.rotation.x=-angle;
  world.right.rotation.x=angle;
  world.lower.position.x=observatorySlideX(angle);
  world.cap.rotation.y=-angle;
  const towerDock=Math.max(0,Math.sin(angle))**2;
  world.rearCrown.position.y=OBSERVATORY.rear.top+world.rearRise*towerDock-(OBSERVATORY.rear.top-world.rearLow)*Math.max(0,Math.cos(angle))**2;
  // Retract the plain arm end as the tower rises to walking-surface height.
  // The two solids butt face-to-face instead of occupying the same cube.
  const tipRetraction=OBSERVATORY.beam*towerDock;
  world.capBeam.scale.x=world.capReach+OBSERVATORY.beam-tipRetraction;
  world.capBeam.position.x=(-world.capReach+tipRetraction)/2;
  const joined=Math.abs(Math.sin(2*angle))<1e-8;
  for(const seam of world.seams)(seam.mesh.material as THREE.Material[])[seam.index]=joined?world.hiddenCap:world.slateMaterial;
}

/** Shared vertical lift between Home (0) and Position 1 (1). */
export function setObservatoryHomeTransition(world:ReturnType<typeof buildObservatory>,progress:number){
  setObservatoryTurn(world,0);
  const t=THREE.MathUtils.clamp(progress,0,1);
  world.isHome=t===0;
  const {beam,slate,front,lower}=OBSERVATORY;
  const ivoryHome=world.architecture.galleryTop+beam/2;
  const blueHome=ivoryHome+beam+(slate.top-slate.bottom)/2;
  const blueRise=world.left.position.y-blueHome;
  // The blue closing post shares the ivory back-right corner in Home.
  // Restore this small docking offset continuously during the common lift.
  const ivoryHomeX=world.right.position.x+slate.right-lower.right;
  world.lower.position.x=THREE.MathUtils.lerp(ivoryHomeX,world.lower.position.x,t);
  world.left.position.z=world.right.position.z=THREE.MathUtils.lerp(lower.back,world.slateDepth,t);
  // Lower the intact tower shafts into the fog rather than compressing their
  // windows. Keep the half-turned spire assembly at its Home landing height,
  // restoring its normal height during the lift.
  const blueTop=blueHome+(slate.top-slate.bottom)/2+beam/2;
  // Match the two facing edges, rather than the rail centerlines.
  const capHome=blueTop+(front.z-lower.back-beam)-beam/2;
  world.cap.rotation.y=-Math.PI*(1-t);
  const frontDrop=(world.cap.position.y-capHome)*(1-t);
  world.cap.position.y-=frontDrop;
  world.frontShaft.position.y-=frontDrop;
  const rearDrop=(blueRise+beam)*(1-t);
  world.rearCrown.position.y-=rearDrop;
  world.rearShaft.position.y-=rearDrop;
  // Shadow geometry uses the physically joined position behind the optical
  // bridge, so its shadows continue across the blue/rose seam.
  world.homeShadowOffset.value=-(front.z-lower.back-beam)*(1-t);
  world.homeRearShadowOffset.value=(world.capReach-(front.z-lower.back-beam))*(1-t);
  const rearHomeTop=world.rearLow-blueRise-beam;
  world.homeRearCrownShadowDrop=(rearHomeTop-capHome+beam/2+world.capReach)*(1-t);
  const bottomWalk=blueHome-(slate.top-slate.bottom)/2+beam/2;
  const leftLift=world.architecture.courtyardLift;
  const stairZ=lower.back+beam;
  const pavilionFloor=.08*.82;
  // Align the pavilion floor with the top of the bottom stair landing.
  const leftHome=bottomWalk+leftLift.z-stairZ-pavilionFloor;
  const leftDelta=(leftHome-leftLift.carrier.position.y)*(1-t);
  leftLift.carrier.position.y+=leftDelta;
  for(let i=0;i<leftLift.stages.length;i++)
    leftLift.stages[i].position.y+=leftDelta*i/5;
  const rightLift=world.architecture.frameLift;
  const rightHome=blueTop+(rightLift.z+beam/2)-(lower.back-beam/2);
  const rightDelta=(rightHome-rightLift.carrier.position.y)*(1-t);
  rightLift.carrier.position.y+=rightDelta;
  world.architecture.upperGallery.position.y+=rightDelta;
  // Both frames retain their Position 1 orientation and optical ordering.
  // The blue frame rises farther, opening clearance continuously; reversing
  // this same path closes the gap only as the terraces settle into Home.
  world.lower.position.y=THREE.MathUtils.lerp(ivoryHome,world.lower.position.y,t);
  world.left.position.y=world.right.position.y=THREE.MathUtils.lerp(blueHome,world.left.position.y,t);
}

export function setObservatoryHome(world:ReturnType<typeof buildObservatory>){
  setObservatoryHomeTransition(world,0);
}
