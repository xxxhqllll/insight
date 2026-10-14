import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {pathToFileURL} from 'node:url';
const script=pathToFileURL(path.resolve('scripts/generate.mjs')).href;
const policy=JSON.parse(fs.readFileSync('data/policy.json'));
function runPipeline({badReview=false,quota=false,booksQuota=false,allBookQuota=false}={}){
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'insight-pipeline-'));fs.mkdirSync(path.join(dir,'data'));
 for(const name of ['policy.json','sources.json'])fs.copyFileSync('data/'+name,path.join(dir,'data',name));
 fs.writeFileSync(path.join(dir,'data/articles.json'),'[]');fs.writeFileSync(path.join(dir,'data/status.json'),JSON.stringify({state:'not_configured'}));
 const code=`
 const source='Evidence Book by Evidence Author. '+ 'A verified source sentence that exists. '.repeat(40);
 const book={title:'Evidence Book',author:'Evidence Author'};
 const draft={title:'검증 아티클',deck:'소개',question:'질문',book,sections:Array.from({length:6},(_,i)=>({heading:'Section '+i,body:'독립적 사고와 새로운 질문을 점검한다. '.repeat(20),kind:'fact',sourceIds:['s1']}))};
 const responses=[{bookId:${booksQuota?"'ol-OL123W'":"'test-book'"},sourceUrls:['https://mitpress.mit.edu/book-one','https://mitpress.mit.edu/book-two']},draft,{pass:${!badReview},identityMatch:true,copyrightRisk:false,unsupportedClaims:[],evidence:Array(3).fill({claim:'Known claim',sourceId:'s1',quote:'A verified source sentence that exists.'})}];
 let calls=0;
 globalThis.fetch=async(url,options)=>{const u=String(url);if(u.includes('googleapis.com/books')){if(${booksQuota||allBookQuota})return new Response('',{status:429});return Response.json({items:[{id:'test-book',volumeInfo:{title:book.title,authors:[book.author],publishedDate:'2020'}}]});}if(u.includes('openlibrary.org/search.json')){if(${allBookQuota})return new Response('',{status:429});return Response.json({docs:[{key:'/works/OL123W',title:book.title,author_name:[book.author],first_publish_year:2020}]});}if(u.includes('generativelanguage')){calls++;${quota?"return new Response('',{status:429});":"return Response.json({candidates:[{finishReason:'STOP',content:{parts:[{text:JSON.stringify(responses.shift())}]}}]});"}}if(u.endsWith('robots.txt'))return new Response('User-agent: *\\nDisallow: /private',{headers:{'content-type':'text/plain'}});return new Response('<html><title>Public primary source</title><main>'+source+'</main></html>',{headers:{'content-type':'text/html'}});};
 await import(${JSON.stringify(script)});console.log('CALLS:'+calls);
 `;
 const r=spawnSync(process.execPath,['--input-type=module','-e',code],{cwd:dir,env:{...process.env,GEMINI_API_KEY:'mock-only',GEMINI_MODEL:policy.allowedModels[0],FREE_TIER_CONFIRMED:'true'},encoding:'utf8'});
 const articles=JSON.parse(fs.readFileSync(path.join(dir,'data/articles.json'))),status=JSON.parse(fs.readFileSync(path.join(dir,'data/status.json'))),usage=JSON.parse(fs.readFileSync(path.join(dir,'data/usage.json')));
 fs.rmSync(dir,{recursive:true});return {r,articles,status,usage};
}
test('mock end-to-end: selected source-backed book publishes only after all 3 AI stages',()=>{const {r,articles,status}=runPipeline();assert.equal(r.status,0,r.stderr);assert.equal(articles.length,1);assert.equal(status.state,'published');assert.match(r.stdout,/CALLS:3/);assert.equal(articles[0].references.length,2);assert.equal(articles[0].sample,false);});
test('mock end-to-end: semantic rejection leaves article store unchanged',()=>{const {r,articles,status}=runPipeline({badReview:true});assert.equal(r.status,1);assert.equal(articles.length,0);assert.equal(status.state,'skipped');});
test('mock end-to-end: quota error stops without retry and persists block',()=>{const {r,articles,usage}=runPipeline({quota:true});assert.equal(r.status,1);assert.equal(articles.length,0);assert.match(r.stdout,/CALLS:1/);assert.equal(Object.values(usage)[0].blocked,true);});

test('mock end-to-end: Google Books 429 uses Open Library and completes all AI stages',()=>{
 const {r,articles,status,usage}=runPipeline({booksQuota:true});
 assert.equal(r.status,0,r.stderr);assert.equal(articles.length,1);assert.equal(status.bookProvider,'Open Library');
 assert.equal(Object.values(usage)[0].bookSearches,2);assert.match(r.stdout,/CALLS:3/);assert.equal(Object.values(usage)[0].blocked,undefined);
});
test('mock end-to-end: both metadata services fail before any Gemini request',()=>{
 const {r,articles,status,usage}=runPipeline({allBookQuota:true});
 assert.equal(r.status,1);assert.equal(articles.length,0);assert.match(r.stdout,/CALLS:0/);assert.match(status.message,/Google Books와 Open Library/);
 assert.equal(Object.values(usage)[0].bookSearches,2);assert.equal(Object.values(usage)[0].generationCalls,undefined);
});
