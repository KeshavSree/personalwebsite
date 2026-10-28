import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import ts from 'typescript';
import {Box3, OrthographicCamera, Raycaster, Triangle, Vector3} from 'three';
const source=readFileSync(new URL('../src/app/monument/ObservatoryWorld.ts',import.meta.url),'utf8');
const transpile=(source)=>ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.ESNext}}).outputText.replaceAll('from "three"',`from "${import.meta.resolve('three')}"`);
const architectureCode=transpile(readFileSync(new URL('../src/app/monument/ObservatoryArchitecture.ts',import.meta.url),'utf8'));
const architectureURL=`data:text/javascript;base64,${Buffer.from(architectureCode).toString('base64')}`;
const code=transpile(source).replace('from "./ObservatoryArchitecture"',`from "${architectureURL}"`);
const {OBSERVATORY:d,SLATE_LAYER,buildObservatory,observatorySlideLimit,setObservatoryHome,setObservatoryHomeTransition,setObservatoryTurn}=await import(`data:text/javascript;base64,${Buffer.from(code).toString('base64')}`);
const motionCode=transpile(readFileSync(new URL('../src/app/monument/ObservatoryMotion.ts',import.meta.url),'utf8'));
const {nextPalaceLeg}=await import(`data:text/javascript;base64,${Buffer.from(motionCode).toString('base64')}`);
const world=buildObservatory();
const camera=new OrthographicCamera(-7,7,8,-8,.1,100);
camera.position.set(16,16,16);camera.lookAt(0,0,0);camera.updateMatrixWorld();
const screenGap=(a,b)=>{a=a.clone().project(camera);b=b.clone().project(camera);return Math.hypot(a.x-b.x,a.y-b.y);};
world.root.updateMatrixWorld(true);
// At 0:34 BOTH gray rails pass between the pillars. The LOW walkway wraps them.
for(const rail of [...world.left.children.slice(0,2),...world.right.children.slice(0,2)]){
  const bounds=new Box3().setFromObject(rail);
  assert.ok(bounds.min.z>d.rear.z+d.beam/2,'Gray rail intersects rear pillar');
  assert.ok(bounds.max.z<d.front.z-d.beam/2,'Gray rail intersects near pillar');
}
assert.ok(new Box3().setFromObject(world.lowerBack).max.z<d.rear.z-d.beam/2,'Low back rail cuts through a pillar');
assert.ok(new Box3().setFromObject(world.lowerFront).min.z>d.front.z+d.beam/2,'Low front rail cuts through a pillar');
// The composited frame gets one optical depth, while its own render pass keeps
// real connected corners and their shading. Do not move individual gray beams.
assert.ok(world.slateDepth>d.rear.z+d.beam/2);
assert.ok(world.slateDepth<d.front.z-d.beam/2);
for(const part of [world.left,world.right])part.traverse(object=>assert.equal(object.layers.mask,1<<SLATE_LAYER));
// Position 1: rear tower's front top edge shares the teal rail's back edge
// in the locked isometric view, including both corners of its square width.
const rearRailShift=world.slateDepth-d.beam/2-(d.rear.z+d.beam/2);
for(const edge of [-d.beam/2,d.beam/2]){
  const tower=new Vector3(d.rear.x+edge,world.rearCrown.position.y,d.rear.z+d.beam/2);
  const rail=new Vector3(d.rear.x+edge+rearRailShift,d.slate.top+(world.slateDepth-d.slate.projectionDepth)+d.beam/2,world.slateDepth-d.beam/2);
  assert.ok(screenGap(tower,rail)<1e-12,'Position 1 rear pillar top misses teal surface');
}
const parts=[world.left,world.right,world.cap];
const route=world.movingRoute;
assert.equal(route.turningStair.parent,world.left,'Stair needs to belong to the existing left axle');
assert.equal(route.passage.parent,world.right,'Arcade needs to belong to the existing right axle');
// The flight runs BESIDE the upper rail. Putting it in the rail's plane
// would bury its last treads inside a solid beam.
assert.equal(route.turningStair.position.z,d.beam);
const movingChildren=[route.turningStair,route.passage];
const localMatrices=movingChildren.map(part=>part.matrix.clone());
const pivots=parts.map(p=>p.position.clone());
const lifts=[world.architecture.courtyardLift,world.architecture.frameLift];
assert.equal(lifts[1].deck.layers.mask,1<<SLATE_LAYER,'Docking deck must share the frame depth pass');
for(const support of world.architecture.supports) assert.equal(support.scale.x,support.scale.z,'Support must have a square section');
for(const lift of lifts) for(const stage of lift.stages) assert.equal(stage.scale.x,stage.scale.z,'Lift shaft must have a square section');
for(const lift of lifts){
  assert.equal(lift.deck.scale.x,lift.deck.scale.z,'Lift top must be square');
  for(const stage of lift.stages) assert.equal(stage.scale.x,lift.deck.scale.x,'Lift must maintain one width');
  const floor=lift.deck.getObjectByName('gazebo-floor');
  assert.ok(floor,'Moving gazebo needs its own floor');
  const floorBounds=new Box3().setFromObject(floor);
  const deckTop=lift.deck.localToWorld(new Vector3(0,.5,0)).y;
  assert.ok(Math.abs(floorBounds.min.y-deckTop)<1e-7,'Gazebo floor must sit on its deck');
  assert.ok(floorBounds.max.y-deckTop>.06,'Gazebo floor top must not be coplanar with the deck');
}
assert.equal(lifts[0].low,world.architecture.galleryTop,'Left lift must stop at the gallery');
const stageScales=lifts.map(lift=>lift.stages.map(stage=>stage.scale.clone()));
const movingShaft=world.architecture.movingShaft;
assert.equal(movingShaft.parent,lifts[1].carrier,'Right shaft must travel with its windowed top');
const shaftOffset=movingShaft.position.clone(),shaftScale=movingShaft.scale.clone();
const sceneryMatrix=world.architecture.group.matrixWorld.clone();
const viewingDirection=new Vector3(-1,-1,-1).normalize();
const raycaster=new Raycaster();
function assertPavilionClear(lift,sample,obstacles=world.lower.children){
  const rails=obstacles.map(rail=>new Box3().setFromObject(rail).expandByScalar(-1e-5));
  lift.deck.getObjectByName('reference-arched-spire').traverse(part=>{
    if(!part.isMesh)return;
    const pavilionBounds=new Box3().setFromObject(part);
    const position=part.geometry.attributes.position,index=part.geometry.index;
    for(const bounds of rails){
      if(!pavilionBounds.intersectsBox(bounds))continue;
      const count=index?index.count:position.count;
      for(let vertex=0;vertex<count;vertex+=3){
        const points=[0,1,2].map(offset=>new Vector3().fromBufferAttribute(position,index?index.getX(vertex+offset):vertex+offset).applyMatrix4(part.matrixWorld));
        assert.ok(!bounds.intersectsTriangle(new Triangle(...points)),`Moving geometry intersects ${lift.carrier.name} pavilion at ${sample}`);
      }
    }
  });
}
function assertUncovered(point,label){
  const origin=point.clone().addScaledVector(viewingDirection,-40);
  raycaster.set(origin,viewingDirection);
  const hit=raycaster.intersectObject(world.architecture.group,true)[0];
  assert.ok(!hit||hit.distance>=40-.01,`Static palace obscures ${label}`);
}
const half=(d.slate.top-d.slate.bottom)/2;
for(let stop=-4;stop<=4;stop++){
  setObservatoryTurn(world,stop*Math.PI/2);world.root.updateMatrixWorld(true);
  for(const sign of [-1,1]){
    const a=world.left.localToWorld(new Vector3(d.slate.seam,sign*half,0));
    const b=world.right.localToWorld(new Vector3(d.slate.seam,sign*(stop%2===0?1:-1)*half,0));
    assert.ok(a.distanceTo(b)<1e-12,'Split gray rails fail to meet at a quarter-turn');
  }
  if(Math.abs(stop)%2===1){
    const lift=world.architecture.frameLift;
    for(const height of [-d.beam/2,d.beam/2]){
      const tip=world.lower.localToWorld(new Vector3(d.lower.right+d.beam/2,height,d.lower.back+d.beam/2));
      const towerZ=lift.z+d.beam/2;
      const towerEdge=new Vector3(lift.x-d.beam/2,tip.y+towerZ-tip.z,towerZ);
      assert.ok(screenGap(tip,towerEdge)<1e-12,'Ivory end leaves a sliver or overlaps the right tower');
    }
    const sign=Math.sin(stop*Math.PI/2);
    for(const edge of [-d.beam/2,0,d.beam/2]){
      const frame=world.right.localToWorld(new Vector3(d.slate.right+d.beam/2,sign*(-half+edge),-sign*d.beam/2));
      const landing=new Vector3(lift.x-lift.width/2,lift.carrier.position.y,lift.z+edge);
      assert.ok(screenGap(frame,landing)<1e-12,'Upper lift misses the rotating frame landing');
      // Check the whole docking face, not just its top edge.
      for(const height of [-.5,.5]){
        const roof=lift.deck.localToWorld(new Vector3(-.5,height,edge/d.beam));
        const rail=world.right.localToWorld(new Vector3(d.slate.right+d.beam/2,sign*(-half+edge),-sign*height*d.beam));
        assert.ok(roof.distanceTo(rail)<1e-12,'Roof and frame docking faces have mismatched thickness');
      }
    }
    if(sign>0){
      assert.ok(Math.abs(world.architecture.courtyardLift.carrier.position.y-world.architecture.galleryTop)<1e-12,'Courtyard lift misses middle gallery');
    }else{
      const leftLift=world.architecture.courtyardLift;
      const frameZ=world.left.position.z+half+d.beam/2;
      const offset=leftLift.z-d.beam/2-frameZ;
      for(const edge of [-d.beam/2,d.beam/2])for(const height of [-d.beam,0]){
        const landing=new Vector3(leftLift.x+edge,leftLift.carrier.position.y+height,leftLift.z-d.beam/2);
        const frame=new Vector3(leftLift.x+edge-offset,world.left.position.y+d.beam/2+height,frameZ);
        assert.ok(screenGap(landing,frame)<1e-12,'Position 4 lift face misses near turquoise rail');
        const roof=leftLift.deck.localToWorld(new Vector3(edge/d.beam,height/d.beam+.5,-.5));
        assert.ok(roof.distanceTo(frame)<1e-12,'Actual roof geometry does not meet turquoise rail');
      }
    }
  }
}
setObservatoryTurn(world,0);world.root.updateMatrixWorld(true);
for(const edge of [-d.beam/2,0,d.beam/2]){
  const lift=world.architecture.courtyardLift;
  const landing=new Vector3(lift.x+lift.width/2,lift.carrier.position.y,lift.z+edge);
  const path=world.lower.localToWorld(new Vector3(d.lower.left-d.beam/2,d.beam/2,d.lower.front+edge));
  assert.ok(landing.distanceTo(path)<1e-12,'Courtyard lift misses ivory ring');
}
setObservatoryTurn(world,Math.PI);world.root.updateMatrixWorld(true);
// The rising front corner meets the ivory front rail across its full top edge.
for(const edge of [-d.beam/2,d.beam/2]){
  const top=world.architecture.cornerSleeve.localToWorld(new Vector3(edge,0,-d.beam/2));
  const rail=new Vector3(1.15+d.beam+edge,d.lower.y+d.beam/2,d.lower.front+d.beam/2);
  assert.ok(top.distanceTo(rail)<1e-12,'Rising front corner is not flush with ivory walkway');
}
const capEnd=world.cap.localToWorld(new Vector3(-world.capReach,-d.beam/2,0));
const pillarTop=new Vector3(d.rear.x,d.rear.top,d.rear.z);
assert.ok(screenGap(capEnd,pillarTop)<1e-12,'Top arm fails to dock in projection');
assert.ok(capEnd.distanceTo(pillarTop)>2,'Top arm dock must remain physically impossible');
for(const x of [-d.beam/2,d.beam/2])for(const z of [-d.beam/2,d.beam/2]){
  const capCorner=world.cap.localToWorld(new Vector3(-world.capReach+x,-d.beam/2,z));
  assert.ok(screenGap(capCorner,pillarTop.clone().add(new Vector3(-x,0,-z)))<1e-12,'Top arm docking face has a corner gap');
}
setObservatoryTurn(world,Math.PI/2);world.root.updateMatrixWorld(true);
for(const y of [-.5,.5])for(const z of [-.5,.5]){
  const capCorner=world.capBeam.localToWorld(new Vector3(-.5,y,z));
  const towerCorner=world.rearCrown.localToWorld(new Vector3(-z*d.beam,(y-.5)*d.beam,d.beam/2));
  assert.ok(capCorner.distanceTo(towerCorner)<1e-12,'Raised peach tower misses upper arm docking face');
}
for(const door of [world.rearDoor]){
  const edge=d.lower.front-d.beam/2;
  const landing=new Vector3(edge-door.position.z,d.lower.y+d.beam/2,edge);
  assert.ok(screenGap(door.position,landing)<1e-12,'Door threshold floats above its apparent landing');
}
assert.equal(world.frontDoor.parent,world.frontShaft,'Purple window must travel with the front shaft');
const windowLocal=world.frontDoor.position.clone();
for(let sample=0;sample<=360;sample++){
  setObservatoryTurn(world,sample*Math.PI/180);world.root.updateMatrixWorld(true);
  for(const lift of lifts)assertPavilionClear(lift,sample);
  movingChildren.forEach((part,i)=>assert.ok(part.matrix.equals(localMatrices[i]),'Architectural extension moves independently of its axle'));
  for(const [index,[x,y]] of [[route.stairStart,route.stairBottom],[route.stairEnd,route.stairTop]].entries()){
    for(const edge of [-d.beam/2,d.beam/2]){
      const flight=route.turningStair.localToWorld(new Vector3(x,y,edge));
      const landing=route.stairLandings[index].localToWorld(new Vector3(index===0?.5:-.5,.5,edge/d.beam));
      assert.ok(flight.distanceTo(landing)<1e-12,'Rotating stair leaves its landing');
      const optical=flight.clone().addScalar(world.slateDepth-flight.z);
      assert.ok(screenGap(flight,optical)<1e-12,'Stair optical projection shifts a landing');
    }
  }
  const walkNormal=new Vector3(0,1,0).transformDirection(route.turningStair.matrixWorld);
  assert.ok(Math.abs(walkNormal.y-Math.cos(sample*Math.PI/180))<1e-12,'Stair walking surface does not rotate rigidly sideways and upside-down');
  assert.ok(world.architecture.group.matrixWorld.equals(sceneryMatrix),'Scenery moves with the mechanism');
  assert.ok(movingShaft.position.equals(shaftOffset)&&movingShaft.scale.equals(shaftScale),'Moving tower shaft must remain rigid');
  lifts.forEach((lift,index)=>{
    assert.equal(lift.carrier.position.x,lift.x);assert.equal(lift.carrier.position.z,lift.z);
    assert.ok(lift.carrier.position.y>=lift.low-1e-12&&lift.carrier.position.y<=lift.high+1e-12,'Lift overshoots its landings');
    assert.deepEqual(lift.carrier.rotation.toArray().slice(0,3),[0,0,0],'Lift leaves its vertical axis');
    lift.stages.forEach((stage,i)=>{
      assert.equal(stage.position.x,lift.x);assert.equal(stage.position.z,lift.z);
      assert.ok(stage.scale.equals(stageScales[index][i]),'Stone lift stage stretches');
      if(i){
        const previous=lift.stages[i-1];
        assert.ok(stage.position.y-stage.scale.y/2<previous.position.y+previous.scale.y/2,'Lift shaft has an open gap');
      }
    });
  });
  // New scenery must not mask the impossible joins in any intermediate pose.
  for(const part of [world.left,world.right])for(const y of [-half,half]){
    const point=part.localToWorld(new Vector3(d.slate.seam,y,0));
    point.addScalar(world.slateDepth-point.z);
    assertUncovered(point,'split-frame seam');
  }
  parts.forEach((part,i)=>{
    assert.ok(part.position.distanceTo(pivots[i])===0,'An axle moved');
    const axis=new Vector3(...(i<2?[1,0,0]:[0,1,0]));
    assert.ok(axis.clone().applyQuaternion(part.quaternion).distanceTo(axis)<1e-12,'A body turned off its axle');
    assert.ok(part.scale.distanceTo(new Vector3(1,1,1))===0,'A body deformed');
  });
  assert.deepEqual([world.lower.rotation.x,world.lower.rotation.y,world.lower.rotation.z],[0,0,0]);
  const cornerDock=-1;
  const towerDock=d.courtyard.x+d.beam-d.lower.left;
  const clearance=observatorySlideLimit()-d.lower.right;
  assert.ok(world.lower.position.x>=Math.min(towerDock,cornerDock)-1e-12&&world.lower.position.x<=clearance+1e-12,'Walkway left its slide range');
  assert.ok(d.lower.right+world.lower.position.x<=observatorySlideLimit()+1e-12,'Longer walkway overshoots its fixed outer clearance');
  assert.equal(world.lower.position.y,d.lower.y);assert.equal(world.lower.position.z,0);
  for(const rail of world.grayRails){
    assert.ok(rail.mesh.position.distanceTo(rail.origin)<1e-12,'A beam moved away from its connected/shaded corner');
    for(const x of [-.5,.5])for(const y of [-.5,.5])for(const z of [-.5,.5]){
      const corner=new Vector3(x,y,z);
      const actual=rail.mesh.localToWorld(corner.clone());
      const ideal=rail.mesh.parent.localToWorld(corner.multiply(rail.mesh.scale).add(rail.origin));
      assert.ok(screenGap(actual,ideal)<1e-12,'A gray beam changes its projected shape during the optical correction');
      // Project onto the compositing plane along the locked camera ray.
      // Screen position stays fixed; visible depth stays between both pillars.
      const imagePoint=actual.clone().addScalar(world.slateDepth-actual.z);
      assert.ok(screenGap(actual,imagePoint)<1e-12,'Composite changes the frame silhouette');
      assert.ok(imagePoint.z>d.rear.z+d.beam/2&&imagePoint.z<d.front.z-d.beam/2);
    }
  }
  for(const x of [d.lower.left,d.lower.right]){
    const ideal=world.lower.localToWorld(new Vector3(x,0,d.lower.back));
    const actual=ideal.clone().addScalar(world.opticalDepth);
    assert.ok(screenGap(ideal,actual)<1e-12,'Optical wrap opens during slide');
    assert.ok(ideal.distanceTo(actual)>2,'Optical wrap was welded into an ordinary rectangle');
  }
}
// Every stair terminates at the upper terrace elevation, with no floating tread.
for(const {from,to,steps} of world.architecture.landings){
  const bounds=new Box3().setFromObject(steps);
  assert.ok(Math.abs(bounds.max.y-to.y)<1e-6,'Stair does not reach its landing');
  assert.ok(bounds.min.x<=from.x+.01 && bounds.max.x>=to.x-.01,'Stair run misses a landing');
}
// Home uses the same optical branch as the turning positions, without a
// rendering-mode or depth-offset jump at the start of its lift animation.
setObservatoryTurn(world,0);world.root.updateMatrixWorld(true);
const restoredParts=[world.left,world.right,world.lower,world.lowerBack,world.frontShaft,world.rearShaft,world.rearCrown,world.cap,world.architecture.upperGallery,...lifts.map(lift=>lift.carrier)];
const regularMatrices=restoredParts.map(part=>part.matrixWorld.clone());
setObservatoryHome(world);world.root.updateMatrixWorld(true);
assert.equal(world.isHome,true);
const homeIvory=new Box3().setFromObject(world.lowerFront);
assert.ok(Math.abs(homeIvory.min.y-world.architecture.galleryTop)<1e-12,'Home ivory frame floats above or cuts into the rose gallery');
const blueFront=new Box3().setFromObject(world.grayRails[0].mesh);
assert.ok(Math.abs(blueFront.min.y-homeIvory.max.y)<1e-12,'Home blue underside must rest on the ivory top');
const logicalBack=new Box3().setFromObject(world.lowerBack).translate(new Vector3().setScalar(-world.opticalDepth));
assert.ok(blueFront.intersectsBox(logicalBack.expandByScalar(1e-8)),'Home blue rail misses its ivory landing');
assert.ok(world.left.rotation.x===0,'Home blue frame must be vertical');
assert.equal(world.right.rotation.x,0,'Home blue frame must be vertical');
assert.ok(Math.abs(world.right.position.x+d.slate.right-world.lower.position.x-d.lower.right)<1e-12,'Home blue and ivory right edges must align');
assert.equal(world.right.position.z,d.lower.back,'Home blue post must align with the ivory back rail');
const homeCap=new Box3().setFromObject(world.capBeam);
const homeUpperBlue=new Box3().setFromObject(world.grayRails[2].mesh);
assert.ok(Math.abs((homeCap.max.y-homeCap.min.z)-(homeUpperBlue.max.y-homeUpperBlue.max.z))<1e-12,'Home bridge and blue walking surfaces must meet at their facing edges');
assert.equal(world.cap.rotation.y,-Math.PI,'Home bridge must face along the blue upper rail');
assert.equal(world.capBeam.scale.x,world.capReach+d.beam,'Home must preserve the bridge length');
assert.ok(world.frontShaft.position.y<-18&&world.rearShaft.position.y<-18,'Both central towers must shorten in Home');
const homeLowerBlue=new Box3().setFromObject(world.grayRails[0].mesh);
const homeGallery=new Box3().setFromObject(world.architecture.upperGallery);
assert.ok(Math.abs((homeGallery.max.y-homeGallery.max.z)-(homeUpperBlue.max.y-homeUpperBlue.min.z))<1e-12,'Right Home gallery misses the blue walking surface');
assert.equal(world.architecture.frameLift.carrier.position.y,world.architecture.upperGallery.position.y,'Right Home gazebo must travel with its gallery');
const leftFloor=new Box3().setFromObject(world.architecture.courtyardLift.deck.getObjectByName('gazebo-floor'));
const leftFloorCenter=leftFloor.getCenter(new Vector3());leftFloorCenter.y=leftFloor.max.y;
const stairBase=world.movingRoute.stairLandings[0];
const stairBaseBounds=new Box3().setFromObject(stairBase);
const stairLandingTop=stairBaseBounds.getCenter(new Vector3());stairLandingTop.y=stairBaseBounds.max.y;
assert.ok(Math.abs((leftFloorCenter.y-leftFloorCenter.z)-(stairLandingTop.y-stairLandingTop.z))<1e-12,'Left Home gazebo floor misses the top of the bottom stair landing');
for(const lift of lifts)assertPavilionClear(lift,'home');
for(const stop of [0,Math.PI/2,Math.PI,3*Math.PI/2]){
  setObservatoryTurn(world,stop);world.root.updateMatrixWorld(true);
  const expected=restoredParts.map(part=>part.matrixWorld.clone());
  setObservatoryHome(world);setObservatoryTurn(world,stop);world.root.updateMatrixWorld(true);
  restoredParts.forEach((part,i)=>assert.ok(part.matrixWorld.equals(expected[i]),'Home preview changes an existing stop'));
}
setObservatoryTurn(world,0);world.root.updateMatrixWorld(true);
restoredParts.forEach((part,i)=>assert.ok(part.matrixWorld.equals(regularMatrices[i]),'Position 1 does not restore after home'));
// Sample the reversible lift, with monotonically increasing separation.
let lastGap=-1;
const blueMeshes=[];
for(const frame of [world.left,world.right])frame.traverse(part=>{if(part.isMesh)blueMeshes.push(part);});
for(let sample=0;sample<=240;sample++){
  setObservatoryHomeTransition(world,sample/240);world.root.updateMatrixWorld(true);
  assert.ok(world.frontDoor.position.equals(windowLocal),'Purple window slides independently during Home transition');
  const windowWorld=world.frontDoor.getWorldPosition(new Vector3());
  assert.ok(Math.abs(windowWorld.y-(world.frontShaft.position.y+windowLocal.y))<1e-12,'Purple window loses its shaft height during Home transition');
  const ivory=new Box3().setFromObject(world.lowerFront);
  const blue=new Box3().setFromObject(world.grayRails[0].mesh);
  const gap=blue.min.y-ivory.max.y;
  assert.ok(gap>=-1e-12&&gap>=lastGap-1e-12,'Home lift closes clearance while rising');lastGap=gap;
  for(const lift of lifts){
    assertPavilionClear(lift,`home lift ${sample}/240`);
    assertPavilionClear(lift,`blue home lift ${sample}/240`,blueMeshes);
  }
  assert.ok(world.left.rotation.x===0);assert.equal(world.right.rotation.x,0);
  assert.equal(world.lowerBack.position.y,world.opticalDepth,'Optical branch jumps during home lift');
}
restoredParts.forEach((part,i)=>assert.ok(part.matrixWorld.equals(regularMatrices[i]),'Home lift endpoint differs from Position 1'));
for(let destination=0;destination<4;destination++){
  let pose={angle:0,unfold:0};
  const legs=[];
  for(let step=0;step<4;step++){
    const next=nextPalaceLeg(pose,destination*Math.PI/2);if(!next)break;
    legs.push(next);pose=next;
  }
  assert.deepEqual(legs[0],{angle:0,unfold:1},'Home must lift to Position 1 before turning');
  assert.equal(pose.unfold,1);
  assert.ok(Math.abs(Math.sin((pose.angle-destination*Math.PI/2)/2))<1e-8,'Home route misses its selected position');
  assert.equal(nextPalaceLeg(pose,destination*Math.PI/2),null,'Completed route should settle');
  for(let step=0;step<4;step++){
    const next=nextPalaceLeg(pose,null);if(!next)break;
    if(next.unfold<1)assert.ok(Math.abs(Math.sin(pose.angle/2))<1e-8,'Return must reach Position 1 before lowering');
    pose=next;
  }
  assert.equal(pose.unfold,0,'Return route fails to reach Home');
}
assert.deepEqual(nextPalaceLeg({angle:0,unfold:.4},null),{angle:0,unfold:0});
assert.deepEqual(nextPalaceLeg({angle:0,unfold:.4},Math.PI),{angle:0,unfold:1});
const historyCode=transpile(readFileSync(new URL('../src/app/monument/ObservatoryHistoryMotion.ts',import.meta.url),'utf8'));
const {createHistoryClearance}=await import(`data:text/javascript;base64,${Buffer.from(historyCode).toString('base64')}`);
setObservatoryHome(world);
const clearance=createHistoryClearance(world);
const historyParts=[world.architecture.frameLift.carrier,...world.architecture.historyWings,world.architecture.upperGallery,world.left,world.right];
const rest=historyParts.map(part=>part.position.clone());
clearance.apply(.2);
assert.ok(historyParts[0].position.y<rest[0].y,'Tower must lead the descent');
assert.equal(historyParts[2].position.y,rest[2].y,'Outer arches must start later');
clearance.apply(1);
for(let i=0;i<3;i++)assert.ok(historyParts[i].position.y<rest[i].y-12,'Right architecture must descend below the fog');
assert.ok(historyParts[4].position.distanceTo(rest[4])<.5,'Blue passage adjustment must remain tiny');
assert.equal(historyParts[4].position.y,rest[4].y,'Blue passage must not rise');
assert.equal(historyParts[4].position.z,rest[4].z,'Blue passage must follow only its X ground axis');
assert.ok(historyParts[4].position.x<rest[4].x,'Blue passage must move left along the isometric beam');
for(let cycle=0;cycle<10;cycle++)for(let step=0;step<=100;step++)clearance.apply(step/100);
clearance.reset();
historyParts.forEach((part,i)=>assert.ok(part.position.distanceTo(rest[i])<1e-10,'History must restore the exact resting pose'));
setObservatoryTurn(world,Math.PI/2);const categoryPose=historyParts.map(part=>part.position.clone());
clearance.apply(0);clearance.reset();
historyParts.forEach((part,i)=>assert.ok(part.position.distanceTo(categoryPose[i])<1e-10,'Category poses must stay untouched'));
world.dispose();
console.log('PASS: staggered history clearance, fog-depth drops, tiny passage nudge and reversible category restoration.');
console.log('PASS: vertical Home, 241 lift samples, all four outbound/return routes, and restoration of original stops.');
console.log('PASS: original optical joins; both lift docking edges; middle-gallery stop; 361 samples of rigid axles, vertical lifts, shaft overlap, scenery clearance and optical wraps.');
