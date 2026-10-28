import * as THREE from "three";
import {OBSERVATORY} from "./ObservatoryWorld";
import type {buildObservatory} from "./ObservatoryWorld";

/** A face-aligned inscription, carried by the same axle as its blue beam. */
export function createObservatoryEngraving(world:ReturnType<typeof buildObservatory>,section:"work"|"projects"|"about"|"involvement"="work"){
  const canvas=document.createElement('canvas');canvas.width=section==='involvement'?2048:section==='projects'?1536:1024;canvas.height=256;
  const context=canvas.getContext('2d');
  if(!context)return {isFacingCamera:()=>false,setOpacity:()=>{},dispose:()=>{}};
  const letters=section.toUpperCase(),spacing=20;
  context.font='600 184px "Avenir Next", sans-serif';
  context.textBaseline='middle';
  const width=[...letters].reduce((total,letter)=>total+context.measureText(letter).width,0)+spacing*(letters.length-1);
  const text=(dy:number)=>{
    let x=(canvas.width-width)/2;
    for(const letter of letters){context.fillText(letter,x,canvas.height/2+dy);x+=context.measureText(letter).width+spacing;}
  };
  // Solid white lettering with a soft halo; no bevel, outline or shading.
  context.fillStyle='#ffffff';
  context.shadowColor='rgba(255,255,255,.85)';context.shadowBlur=30;
  text(0);
  context.shadowColor='rgba(255,255,255,.55)';context.shadowBlur=12;
  text(0);
  context.shadowBlur=0;text(0);
  const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;
  const geometry=new THREE.PlaneGeometry(section==='involvement'?2.6:section==='projects'?3:1.75,.5);
  const material=new THREE.MeshBasicMaterial({map:texture,transparent:true,opacity:0,depthWrite:false,toneMapped:false});
  const inscription=new THREE.Mesh(geometry,material);
  inscription.name=`${section}-blue-beam-engraving`;
  const carrier=section==='projects'||section==='involvement'?world.left:world.right;
  if(section==='involvement'){
    inscription.rotation.x=Math.PI;
    inscription.position.set(-1.55,(OBSERVATORY.slate.top-OBSERVATORY.slate.bottom)/2,-OBSERVATORY.beam/2-.004);
  }else if(section!=='work'){
    // The lower rail turns toward the viewer in the Projects and About poses.
    inscription.rotation.x=Math.PI/2;
    inscription.position.set(section==='projects'?-.9:3.02,-(OBSERVATORY.slate.top-OBSERVATORY.slate.bottom)/2-OBSERVATORY.beam/2-.004,section==='about'?-.04:0);
  }else inscription.position.set(3.02,(OBSERVATORY.slate.top-OBSERVATORY.slate.bottom)/2-.04,OBSERVATORY.beam/2+.004);
  inscription.layers.mask=carrier.layers.mask;
  inscription.visible=false;carrier.add(inscription);
  const faceNormal=new THREE.Vector3(),viewDirection=new THREE.Vector3();
  return {
    isFacingCamera(camera:THREE.Camera,destinationAngle?:number){
      inscription.updateWorldMatrix(true,false);
      if(destinationAngle===undefined)faceNormal.set(0,0,1).transformDirection(inscription.matrixWorld);
      else{
        faceNormal.set(0,0,1).applyQuaternion(inscription.quaternion);
        faceNormal.applyAxisAngle(new THREE.Vector3(1,0,0),carrier===world.left?-destinationAngle:destinationAngle);
        if(carrier.parent)faceNormal.transformDirection(carrier.parent.matrixWorld);
      }
      camera.getWorldDirection(viewDirection);
      return faceNormal.dot(viewDirection)<-.05;
    },
    setOpacity(opacity:number){material.opacity=opacity;inscription.visible=opacity>0;},
    dispose(){inscription.removeFromParent();geometry.dispose();material.dispose();texture.dispose();},
  };
}
