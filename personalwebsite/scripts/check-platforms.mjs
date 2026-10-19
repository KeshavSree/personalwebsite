import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import ts from 'typescript';
import { OrthographicCamera, Vector3 } from 'three';

const source=readFileSync(new URL('../src/app/monument/platformGeometry.ts',import.meta.url),'utf8');
const code=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.ESNext}}).outputText;
const {ARM_LENGTH,STAIR_COUNT,platformConfigurations:configs,armPoint,dockPoint,travelerPoint,platformMotion}=await import(`data:text/javascript;base64,${Buffer.from(code).toString('base64')}`);
const camera=new OrthographicCamera(-7,7,7,-7,.1,100);
camera.position.set(14,14,14);camera.lookAt(0,0,0);camera.updateMatrixWorld();
const screen=p=>new Vector3(...p).project(camera);
const screenGap=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
const fixedDocks=configs.map((_,i)=>dockPoint(i));
for(let i=0;i<configs.length;i++){
  const c=configs[i],end=armPoint(c,ARM_LENGTH),dock=dockPoint(i);
  assert.ok(new Vector3(...end).distanceTo(new Vector3(...dock))>1.5,'Every landing must be physically separate');
  for(const y of [-.3,0])for(const width of [-.36,.36]){
    const offset=[Math.sin(c.angle)*width,y,Math.cos(c.angle)*width];
    assert.ok(screenGap(screen(end.map((v,j)=>v+offset[j])),screen(dock.map((v,j)=>v+offset[j])))<1e-12,'Entire mating face must align');
  }
  const before=travelerPoint(c,i,ARM_LENGTH-1e-7),after=travelerPoint(c,i,ARM_LENGTH+1e-7);
  assert.ok(screenGap(screen(before),screen(after))<1e-6,'Marker must cross the depth seam continuously');
}
let samples=0;
for(const from of configs)for(const to of configs){
  if(from===to)continue;
  for(let i=0;i<=120;i++){
    const p=platformMotion(from,to,i/120);
    const pivot=armPoint(p,0),end=armPoint(p,ARM_LENGTH);
    assert.ok(Math.abs(pivot[0])===0);assert.ok(Math.abs(pivot[2])===0,'Pivot never moves sideways');
    assert.ok(Math.abs(Math.hypot(end[0]-pivot[0],end[2]-pivot[2])-ARM_LENGTH)<1e-12,'Platform run cannot stretch');
    assert.ok(Math.abs(p.rise)/STAIR_COUNT<.3,'Adjacent treads must overlap vertically');
    assert.ok(Math.abs(end[1]-pivot[1]-p.rise)<1e-12,'Stair flight must meet the elevated end landing');
    assert.deepEqual(configs.map((_,j)=>dockPoint(j)),fixedDocks,'Destination landings cannot track the moving endpoint');
    samples++;
  }
  const final=platformMotion(from,to,1);
  assert.ok(new Vector3(...armPoint(final,ARM_LENGTH)).distanceTo(new Vector3(...armPoint(to,ARM_LENGTH)))<1e-12);
}
console.log(`PASS: 5 depth-separated docks, full-face projection alignment, continuous traveler, ${samples} turn/lift/stair samples across 20 transitions.`);
