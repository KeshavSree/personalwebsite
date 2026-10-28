import ObservatoryStudy from "@/app/monument/ObservatoryStudy";
import ObservatoryContent,{ObservatoryContactLinks} from "@/app/monument/ObservatoryContent";

export default function Page() {
  return <ObservatoryStudy content={{
    work:<ObservatoryContent section="work"/>,
    projects:<ObservatoryContent section="projects"/>,
    involvement:<ObservatoryContent section="involvement"/>,
    about:<ObservatoryContent section="about"/>,
  }} contactLinks={<ObservatoryContactLinks/>}/>;
}
