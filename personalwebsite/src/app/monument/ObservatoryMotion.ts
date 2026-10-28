export type PalacePose={angle:number;unfold:number};
export type PalaceDestination=number|null;
const circle=Math.PI*2;

function nearestAngle(from:number,to:number){
  return to+Math.round((from-to)/circle)*circle;
}

/** Finish each eased leg before choosing the next one, including on retarget. */
export function nextPalaceLeg(pose:PalacePose,destination:PalaceDestination):PalacePose|null{
  if(pose.unfold<1){
    const unfold=destination===null?0:1;
    return pose.unfold===unfold?null:{angle:pose.angle,unfold};
  }
  const angle=nearestAngle(pose.angle,destination??0);
  if(Math.abs(angle-pose.angle)>1e-8)return {angle,unfold:1};
  return destination===null?{angle,unfold:0}:null;
}
