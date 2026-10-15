import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {pathToFileURL} from 'node:url';
const script=pathToFileURL(path.resolve('scripts/news-generate.mjs')).href;
function run({badReview=false,quota=false,short=false,existing=false}={}){
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'insight-news-'));fs.mkdirSync(path.join(dir,'data'));
 for(const f of ['policy.json','sources.json','news-sources.json'])fs.copyFileSync('data/'+f,path.join(dir,'data',f));
 const old=[{id:'old-book',sample:true,title:'Existing book'}];fs.writeFileSync(path.join(dir,'data/articles.json'),JSON.stringify(old));fs.writeFileSync(path.join(dir,'data/status.json'),'{}');
 const model=JSON.parse(fs.readFileSync('data/policy.json')).allowedModels[0];
 const code=`
 const today=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Seoul'}).format(new Date());
 ${existing?`const fs=await import('node:fs');fs.writeFileSync('data/usage.json',JSON.stringify({[today]:{generationAttempts:1}}));`:''}
 const source='A verified research finding and its actual limitations. '.repeat(50);
 const url='https://www.nsf.gov/news/memory';
 const draft={title:'검증된 칼럼',deck:'소개',question:'질문',category:'Psychology',sourceUrl:url,sections:Array.from({length:5},(_,i)=>({heading:'제목',body:'관찰과 해석의 차이를 생각하며 일상의 판단을 돌아본다. '.repeat(${short?1:9}),kind:i?'analysis':'fact',sourceIds:['s1']}))};
 const responses=[draft,{pass:${!badReview},identityMatch:true,copyrightRisk:false,unsupportedClaims:[],evidence:Array(3).fill({claim:'연구결과',sourceId:'s1',quote:'A verified research finding and its actual limitations.'})}];let calls=0;
 globalThis.fetch=async u=>{u=String(u);if(u.includes('generativelanguage')){calls++;return ${quota?"new Response('',{status:429})":"Response.json({candidates:[{finishReason:'STOP',content:{parts:[{text:JSON.stringify(responses.shift())}]}}]})"};}if(u.endsWith('robots.txt'))return new Response('User-agent: *\\nDisallow: /private');if(u.includes('rss_www_news.xml'))return new Response('<rss><item><title>Memory and attention</title><link>'+url+'</link><pubDate>'+new Date().toUTCString()+'</pubDate></item></rss>');if(!u.endsWith('/news/memory'))return new Response('',{status:503});return new Response('<article><p>'+source+'</p></article>');};
 await import(${JSON.stringify(script)});console.log('CALLS:'+calls);
 `;
 const r=spawnSync(process.execPath,['--input-type=module','-e',code],{cwd:dir,env:{...process.env,GEMINI_API_KEY:'mock',GEMINI_MODEL:model,FREE_TIER_CONFIRMED:'true'},encoding:'utf8'});
 const a=JSON.parse(fs.readFileSync(path.join(dir,'data/articles.json'))),s=JSON.parse(fs.readFileSync(path.join(dir,'data/status.json'))),usage=JSON.parse(fs.readFileSync(path.join(dir,'data/usage.json')));fs.rmSync(dir,{recursive:true});return {r,a,s,usage};
}
test('news pipeline publishes one grounded article in 2 AI calls and preserves old content',()=>{const {r,a,s}=run();assert.equal(r.status,0,r.stderr);assert.equal(a.length,2);assert.equal(a[1].id,'old-book');assert.equal(a[0].kind,'news');assert.equal(s.state,'published');assert.match(r.stdout,/CALLS:2/);});
test('review or length failure never publishes invented filler',()=>{for(const options of [{badReview:true},{short:true}]){const {r,a,s}=run(options);assert.equal(r.status,1);assert.equal(a.length,1);assert.equal(s.state,'skipped');}});
test('429 blocks future AI calls; an already used daily attempt is not reset',()=>{const {r,a,usage}=run({quota:true});assert.equal(a.length,1);assert.match(r.stdout,/CALLS:1/);assert.equal(Object.values(usage)[0].blocked,true);const used=run({existing:true});assert.equal(used.r.status,1);assert.match(used.r.stdout,/CALLS:0/);});
