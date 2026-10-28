export const palaceChapters = [
  {id:"work",number:"I",title:"Work",heading:"Where have I worked?",position:0},
  {id:"projects",number:"II",title:"Projects",heading:"What have I built?",position:1},
  {id:"involvement",number:"III",title:"Involvement",heading:"Where am I involved on campus?",position:2},
  {id:"about",number:"IV",title:"About",heading:"Who am I?",position:3},
] as const;

export type PalaceSection = typeof palaceChapters[number]["id"];

export function palaceSectionFromHash(hash:string):PalaceSection|null {
  const value=hash.replace(/^#/,"").split("/")[0];
  if(value==="experience")return "work";
  return palaceChapters.find(chapter=>chapter.id===value)?.id??null;
}

export function palaceDestination(section:PalaceSection|null):number|null {
  return section===null?null:palaceChapters.find(chapter=>chapter.id===section)!.position*Math.PI/2;
}
