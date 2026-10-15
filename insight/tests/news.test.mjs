import {test} from 'node:test';
import assert from 'node:assert/strict';
import {parseFeed,extractArticle,selectNews,validateColumn} from '../scripts/news.mjs';
const feed={publisher:'NSF',url:'https://www.nsf.gov/rss/rss_www_news.xml',hosts:['www.nsf.gov']};
const item=(title='Memory and attention',url='https://www.nsf.gov/news/memory',date='Thu, 15 Oct 2026 01:00:00 GMT')=>`<item><title><![CDATA[${title}]]></title><link>${url}</link><pubDate>${date}</pubDate><description>Research news</description></item>`;
const options={now:new Date('2026-10-15T05:00:00Z'),excludedTopics:['battery','logistics']};
const source={id:'s1',url:'https://www.nsf.gov/news/memory',publisher:'NSF',text:'A verified research finding and its actual limitations. '.repeat(50)};
test('news feed rejects stale, future, duplicate, work-related and foreign-host items',()=>{
 const xml='<rss>'+item()+item()+item('battery project')+item('old',undefined,'Tue, 01 Sep 2026 01:00:00 GMT')+item('future',undefined,'Thu, 22 Oct 2026 01:00:00 GMT')+item('evil','https://evil.example/x')+'</rss>';
 assert.equal(parseFeed(xml,feed,options).length,1);
 assert.equal(parseFeed(xml,feed,{...options,previous:[{source:{url:source.url}}]}).length,0);
 assert.throws(()=>parseFeed('<!DOCTYPE x>'+xml,feed,options));
});
test('full body is required; navigation and image captions cannot stand in for source text',()=>{
 assert.throws(()=>extractArticle('<main><p>Just a headline</p></main>'));
 const html='<main><nav><p>'+source.text+'</p></nav><article><p>'+source.text+'</p><figure><p>Image copyright</p></figure></article></main>';
 const text=extractArticle(html);assert.equal(text.trim(),source.text.trim());assert.doesNotMatch(text,/Image copyright/);
});
test('source failures stop before any AI; a valid source is selected without invented URLs',async()=>{
 const calls=[];const mock=async url=>{calls.push(String(url));return new Response(String(url).endsWith('robots.txt')?'User-agent: *\nDisallow: /private':String(url)===feed.url?'<rss>'+item()+'</rss>':'<article><p>'+source.text+'</p></article>');};
 const config={feeds:[feed],maxAgeDays:7,excludedTopics:[]};
 const selected=await selectNews(config,[],{fetchImpl:mock,now:options.now});assert.equal(selected.source.url,source.url);assert.equal(calls.length,3);
 await assert.rejects(selectNews(config,[],{fetchImpl:async()=>new Response('',{status:429}),now:options.now}),/원문/);
 await assert.rejects(selectNews(config,[],{fetchImpl:async()=>new Response('User-agent: *\nDisallow: /'),now:options.now}),/robots/);
});
test('columns require factual grounding, exact source and visible fact/analysis structure',()=>{
 const draft={title:'새 관점',deck:'소개',question:'질문',category:'Psychology',sourceUrl:source.url,sections:Array.from({length:5},(_,i)=>({heading:'제목',body:'관찰과 해석의 차이를 생각하며 일상의 판단을 돌아본다. '.repeat(9),kind:i?'analysis':'fact',sourceIds:['s1']}))};
 assert.ok(validateColumn(draft,source)>1200);
 assert.throws(()=>validateColumn({...draft,sourceUrl:'https://evil.example'},source));
 assert.throws(()=>validateColumn({...draft,sections:draft.sections.map(s=>({...s,sourceIds:[]}))},source));
 assert.throws(()=>validateColumn(draft,source,[{title:draft.title}]));
});
