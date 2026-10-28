import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {createRequire} from 'node:module';
import {dirname,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import ts from 'typescript';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';

const app=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const require=createRequire(import.meta.url);
const cache=new Map();
function load(filename){
  if(cache.has(filename))return cache.get(filename).exports;
  if(filename.endsWith('.json'))return JSON.parse(readFileSync(filename,'utf8'));
  const module={exports:{}};cache.set(filename,module);
  const code=ts.transpileModule(readFileSync(filename,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX,esModuleInterop:true}}).outputText;
  const localRequire=id=>{
    if(!id.startsWith('.')&&!id.startsWith('@/'))return require(id);
    let path=id.startsWith('@/')?resolve(app,'src',id.slice(2)):resolve(dirname(filename),id);
    if(!/\.(json|tsx?)$/.test(path))path+=existsSync(path+'.tsx')?'.tsx':'.ts';
    return load(path);
  };
  new Function('require','module','exports',code)(localRequire,module,module.exports);
  return module.exports;
}
const {default:Content,ObservatoryInvolvementDetails,ObservatoryProjectDetails}=load(resolve(app,'src/app/monument/ObservatoryContent.tsx'));
const {palaceChapters,palaceDestination,palaceSectionFromHash}=load(resolve(app,'src/app/monument/ObservatoryNavigation.ts'));
const read=name=>JSON.parse(readFileSync(resolve(app,`src/data/${name}.json`),'utf8'));
const {getInvolvements}=load(resolve(app,'src/data/involvementData.ts'));
const work=read('work'),projects=read('projects'),involvement=read('involvement'),about=read('about');
const authored={
  work:work.flatMap(job=>[job.role,job.company,`${job.startDate} - ${job.endDate}`,job.summary]),
  projects:projects.flatMap(project=>[project.title,project.date,project.description,project.tools,...(project.awards?[project.awards]:[])]),
  involvement:involvement.flatMap(item=>[item.title,item.role,item.summary,...[item.date,item.whatIsIt,item.whatsMyRole].filter(Boolean),...(item.howItShapedMe??[]),...(item.highlights??[]),...(item.contributions??[]).flatMap(c=>[c.area,c.detail])]),
  about:[about.bio,about.education.institution,about.education.year,about.education.degree,...about.classes,...about.qa.flatMap(item=>[item.q,item.a])],
};
for(const job of work){
  const impactNumbers=job.highlights.join(' ').match(/\d[\d,]*(?:\.\d+)?(?:[kKmM])?(?:\+|%)?/g)??[];
  for(const number of impactNumbers)assert.ok(job.summary.includes(number),`${job.role}: impact number missing from summary: ${number}`);
}
const normalize=value=>value.replace(/\s+/g,' ').trim();
const escape=value=>renderToStaticMarkup(React.createElement('span',null,value)).replace(/^<span>|<\/span>$/g,'');
for(const [index,chapter] of palaceChapters.entries()){
  const listHtml=renderToStaticMarkup(React.createElement(Content,{section:chapter.id}));
  const detailHtml=chapter.id==='projects'?projects.map(project=>renderToStaticMarkup(React.createElement(ObservatoryProjectDetails,{project}))).join(''):chapter.id==='involvement'?getInvolvements().map(item=>renderToStaticMarkup(React.createElement(ObservatoryInvolvementDetails,{item}))).join(''):'';
  const html=normalize(listHtml+detailHtml);
  for(const text of authored[chapter.id])assert.ok(html.includes(normalize(escape(text))),`${chapter.id}: authored text missing or changed: ${text}`);
  if(chapter.id==='work'){assert.equal((html.match(/<article /g)??[]).length,work.length);assert.ok(!html.includes('<ul>'),'Work entries should use one summary paragraph, not bullets');}
  if(chapter.id==='projects'){
    for(const project of projects)assert.ok(listHtml.includes(`#projects/${project.id}`),'Project detail link missing');
    assert.ok(!listHtml.includes('<iframe')&&!listHtml.includes('Tools:'),'Project media and tools must appear only in details');
  }
  if(chapter.id==='involvement'){
    assert.ok(!listHtml.includes('<details'),'Involvement should navigate into a detail view');
    for(const item of involvement)assert.ok(listHtml.includes(`#involvement/${item.slug}`),'Detail navigation link missing');
    for(const item of involvement){assert.ok(html.includes(encodeURIComponent(item.logo))||html.includes(item.logo),'Organization logo missing');assert.ok(readFileSync(resolve(app,'public',item.logo.slice(1))).length>0,'Logo asset missing');}
  }
  assert.equal(palaceDestination(chapter.id),index*Math.PI/2);
  assert.equal(palaceSectionFromHash(`#${chapter.id}`),chapter.id);
  console.log(`PASS: ${chapter.title}: ${authored[chapter.id].length} verbatim text fields and position ${index+1}.`);
}
assert.equal(palaceSectionFromHash('#involvement/purdue-stack'),'involvement');
assert.equal(palaceSectionFromHash('#projects/redub'),'projects');
assert.equal(palaceDestination(null),null);
assert.equal(palaceSectionFromHash(''),null);
assert.equal(palaceSectionFromHash('#experience'),'work');
console.log('PASS: Home and legacy experience links resolve correctly.');
