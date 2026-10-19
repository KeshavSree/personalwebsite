import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import ts from 'typescript';
import {Box3, OrthographicCamera, Vector3} from 'three';
const source=readFileSync(new URL('../src/app/monument/ObservatoryWorld.ts',import.meta.url),'utf8');
const code=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.ESNext}}).outputText.replaceAll('from "three"',`from "${import.meta.resolve('three')}"`);
const {OBSERVATORY:d,SLATE_LAYER,buildObservatory,setObservatoryTurn}=await import(`data:text/javascript;base64,${Buffer.from(code).toString('base64')}`);
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
const parts=[world.left,world.right,world.cap];
const pivots=parts.map(p=>p.position.clone());
const half=(d.slate.top-d.slate.bottom)/2;
for(let stop=-4;stop<=4;stop++){
  setObservatoryTurn(world,stop*Math.PI/2);world.root.updateMatrixWorld(true);
  for(const sign of [-1,1]){
    const a=world.left.localToWorld(new Vector3(d.slate.seam,sign*half,0));
    const b=world.right.localToWorld(new Vector3(d.slate.seam,sign*(stop%2===0?1:-1)*half,0));
    assert.ok(a.distanceTo(b)<1e-12,'Split gray rails fail to meet at a quarter-turn');
  }
}
setObservatoryTurn(world,Math.PI);world.root.updateMatrixWorld(true);
const capEnd=world.cap.localToWorld(new Vector3(-world.capReach,-d.beam/2,0));
const pillarTop=new Vector3(d.rear.x,d.rear.top,d.rear.z);
assert.ok(screenGap(capEnd,pillarTop)<1e-12,'Top arm fails to dock in projection');
assert.ok(capEnd.distanceTo(pillarTop)>2,'Top arm dock must remain physically impossible');
for(const x of [-d.beam/2,d.beam/2])for(const z of [-d.beam/2,d.beam/2]){
  const capCorner=world.cap.localToWorld(new Vector3(-world.capReach+x,-d.beam/2,z));
  assert.ok(screenGap(capCorner,pillarTop.clone().add(new Vector3(-x,0,-z)))<1e-12,'Top arm docking face has a corner gap');
}
for(const door of [world.frontDoor,world.rearDoor]){
  const edge=d.lower.front-d.beam/2;
  const landing=new Vector3(edge-door.position.z,d.lower.y+d.beam/2,edge);
  assert.ok(screenGap(door.position,landing)<1e-12,'Door threshold floats above its apparent landing');
}
for(let sample=0;sample<=360;sample++){
  setObservatoryTurn(world,sample*Math.PI/180);world.root.updateMatrixWorld(true);
  parts.forEach((part,i)=>{
    assert.ok(part.position.distanceTo(pivots[i])===0,'An axle moved');
    const axis=new Vector3(...(i<2?[1,0,0]:[0,1,0]));
    assert.ok(axis.clone().applyQuaternion(part.quaternion).distanceTo(axis)<1e-12,'A body turned off its axle');
    assert.ok(part.scale.distanceTo(new Vector3(1,1,1))===0,'A body deformed');
  });
  assert.deepEqual([world.lower.rotation.x,world.lower.rotation.y,world.lower.rotation.z],[0,0,0]);
  assert.ok(world.lower.position.x>=-d.lower.travel-1e-12&&world.lower.position.x<=1e-12,'Walkway left its slide range');
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
world.dispose();
console.log('PASS: 0:34 overlap order; gray quarter-turn joins; impossible top-arm docking; 361 rigid-axle, linear-slide and optical-wrap samples.');
