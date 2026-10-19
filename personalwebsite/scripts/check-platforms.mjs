import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import ts from 'typescript';
import { OrthographicCamera, Vector3 } from 'three';
const source=readFileSync(new URL('../src/app/monument/platformGeometry.ts',import.meta.url),'utf8');
const code=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.ESNext}}).outputText.replaceAll('from "three"',`from "${import.meta.resolve('three')}"`);
const {ARM_LENGTH,platformConfigurations:configs,armPoint,dockPoint,travelerPoint,platformMotion,orientation,transform,surfaceNormal}=await import(`data:text/javascript;base64,${Buffer.from(code).toString('base64')}`);
const camera=new OrthographicCamera(-7,7,7,-7,.1,100);
camera.position.set(14,14,14);camera.lookAt(0,0,0);camera.updateMatrixWorld();
const screen=p=>new Vector3(...p).project(camera);
const gap=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
const fixedDocks=configs.map((_,i)=>dockPoint(i));
for(let i=0;i<configs.length;i++){
  const c=configs[i],end=armPoint(c,ARM_LENGTH),dock=dockPoint(i);
  assert.ok(new Vector3(...end).distanceTo(new Vector3(...dock))>1.5,'Each route requires an impossible depth transfer');
  for(const y of [-.3,0])for(const z of [-.36,.36]){
    const offset=new Vector3(0,y,z).applyQuaternion(orientation(c)).toArray();
    assert.ok(gap(screen(end.map((v,j)=>v+offset[j])),screen(dock.map((v,j)=>v+offset[j])))<1e-12,'Whole docking face must project identically');
  }
  assert.ok(gap(screen(travelerPoint(c,i,ARM_LENGTH-1e-7)),screen(travelerPoint(c,i,ARM_LENGTH+1e-7)))<1e-6,'Traveler must cross without a screen jump');
}
assert.ok(surfaceNormal(configs[1]).dot(new Vector3(0,1,0))<1e-12,'Wall surface must actually face sideways');
assert.ok(surfaceNormal(configs[2]).y<-.999,'Underside surface must face down');
const vertices=[[0,0,0],[.7,0,.36],[1.8,.45,-.36],[3.6,.9,0],[0,0,-2.2]];
let samples=0;
for(const from of configs)for(const to of configs){
  if(from===to)continue;
  assert.ok(gap(screen(dockPoint(configs.indexOf(from))),screen(dockPoint(configs.indexOf(to))))>.05,'Every transition must create a different optical connection');
  for(let i=0;i<=120;i++){
    const p=platformMotion(from,to,i/120);
    for(const a of vertices)for(const b of vertices){
      const before=new Vector3(...a).distanceTo(new Vector3(...b));
      const after=new Vector3(...transform(p,a)).distanceTo(new Vector3(...transform(p,b)));
      assert.ok(Math.abs(before-after)<1e-12,'All stair and platform geometry must remain rigid');
    }
    assert.deepEqual(configs.map((_,j)=>dockPoint(j)),fixedDocks,'Landings cannot follow the moving endpoint');
    samples++;
  }
  const final=platformMotion(from,to,1);
  assert.ok(new Vector3(...armPoint(final,ARM_LENGTH)).distanceTo(new Vector3(...armPoint(to,ARM_LENGTH)))<1e-12);
}
console.log(`PASS: upward/sideways/downward surfaces; 5 impossible joins; ${samples} rigid multi-axis samples across all 20 transitions.`);
