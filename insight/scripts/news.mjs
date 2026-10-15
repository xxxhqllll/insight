import {createHash} from 'node:crypto';
import {robotsAllows} from './sources.mjs';
export function decode(s){return String(s).replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g,'$1').replace(/&#(x[0-9a-f]+|\d+);/gi,(_,n)=>{const c=n[0].toLowerCase()==='x'?parseInt(n.slice(1),16):Number(n);return c>0&&c<=0x10ffff?String.fromCodePoint(c):'';}).replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&quot;/g,'"').replace(/&apos;|&#39;/g,"'").replace(/&nbsp;/g,' ').replace(/&amp;/g,'&');}
export function plain(html){return decode(decode(html).replace(/<(script|style|nav|header|footer|figure|aside)\b[^>]*>[\s\S]*?<\/\1>/gi,' ').replace(/<[^>]+>/g,' ')).replace(/\s+/g,' ').trim();}
function tag(xml,name){return xml.match(new RegExp('<'+name+'(?:\\s[^>]*)?>([\\s\\S]*?)</'+name+'>','i'))?.[1]||'';}
export function newsURL(value,feed){const u=new URL(value);if(u.protocol!=='https:'||u.port||u.username||u.password||!feed.hosts.includes(u.hostname))throw Error('허용되지 않은 뉴스 주소');u.hash='';for(const key of [...u.searchParams.keys()])if(/^utm_/i.test(key))u.searchParams.delete(key);return u.href;}
export function parseFeed(xml,feed,{now=new Date(),maxAgeDays=7,excludedTopics=[],previous=[]}={}){
 if(/<!DOCTYPE|<!ENTITY/i.test(xml))throw Error('외부 엔티티가 있는 피드는 사용하지 않습니다.');
 const seen=new Set();const out=[];
 for(const item of xml.match(/<item\b[^>]*>[\s\S]*?<\/item>/gi)||[]){try{
  const title=plain(tag(item,'title')),url=newsURL(plain(tag(item,'link')),feed),date=new Date(plain(tag(item,'pubDate'))),blurb=plain(tag(item,'description'));
  if(!title||!Number.isFinite(+date)||+date>+now+300000||+now-date>maxAgeDays*86400000||seen.has(url))continue;
  if(excludedTopics.some(t=>(title+' '+blurb).toLowerCase().includes(t))||previous.some(a=>a.source?.url===url||a.references?.some(r=>r.url===url)))continue;
  seen.add(url);out.push({id:'news-'+createHash('sha256').update(url).digest('hex').slice(0,16),title,url,publishedAt:date.toISOString(),publisher:feed.publisher,feed});
 }catch{/* invalid/untrusted item is excluded */}}
 return out.sort((a,b)=>Date.parse(b.publishedAt)-Date.parse(a.publishedAt));
}
export async function readLimited(response,max=2000000){if(!response.ok)throw Error('원문 응답 오류 ('+response.status+')');if(Number(response.headers.get('content-length'))>max)throw Error('자료 크기 한도 초과');let size=0;const chunks=[];for await(const value of response.body){size+=value.length;if(size>max)throw Error('자료 크기 한도 초과');chunks.push(value);}return Buffer.concat(chunks).toString('utf8');}
export async function fetchNews(url,feed,{fetchImpl=globalThis.fetch,robots=new Map()}={}){
 url=newsURL(url,feed);const u=new URL(url);
 const get=async value=>{const r=await fetchImpl(value,{redirect:'manual',signal:AbortSignal.timeout(20000),headers:{'User-Agent':'INSIGHTPersonalReader/2.0'}});if(r.status>=300&&r.status<400)throw Error('리디렉션 자료는 자동 처리하지 않습니다.');return readLimited(r);};
 if(!robots.has(u.origin))robots.set(u.origin,await get(u.origin+'/robots.txt'));
 if(!robotsAllows(robots.get(u.origin),u.pathname+u.search))throw Error('robots 정책으로 수집 제외');
 return get(url);
}
export function extractArticle(html){
 const article=html.match(/<article\b[^>]*>([\s\S]*?)<\/article>/i)?.[1];
 const main=article||html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/i)?.[1];
 if(!main)throw Error('기사 본문 영역을 확인하지 못했습니다.');
 const cleaned=main.replace(/<(script|style|nav|header|footer|figure|aside)\b[^>]*>[\s\S]*?<\/\1>/gi,' ');
 const paragraphs=(cleaned.match(/<p\b[^>]*>[\s\S]*?<\/p>/gi)||[]).map(plain).filter(p=>p.length>=50);
 const text=paragraphs.join('\n');
 if(text.length<1600)throw Error('원문 본문이 부족합니다. 제목이나 요약만으로 작성하지 않습니다.');
 if(/all rights reserved|text copyright|copyrighted text/i.test(text))throw Error('별도 저작권 표시가 있는 본문은 제외합니다.');
 return text.slice(0,20000);
}
export async function selectNews(config,previous,{beforeFeed=()=>{},beforeArticle=()=>{},fetchImpl=globalThis.fetch,now=new Date()}={}){
 const robots=new Map(),candidates=[],errors=[];
 for(const feed of config.feeds){await beforeFeed();try{const xml=await fetchNews(feed.url,feed,{fetchImpl,robots});candidates.push(...parseFeed(xml,feed,{now,maxAgeDays:config.maxAgeDays,excludedTopics:config.excludedTopics,previous}));}catch(e){errors.push(feed.publisher+': '+e.message);}}
 const unique=[...new Map(candidates.sort((a,b)=>Date.parse(b.publishedAt)-Date.parse(a.publishedAt)).map(c=>[c.url,c])).values()];
 for(const c of unique.slice(0,3)){await beforeArticle();try{const html=await fetchNews(c.url,c.feed,{fetchImpl,robots});const text=extractArticle(html);return {source:{id:'s1',url:c.url,title:c.title,publisher:c.publisher,publishedAt:c.publishedAt,retrievedAt:now.toISOString(),text},id:c.id,policy:c.feed.policy};}catch(e){errors.push(c.publisher+': '+e.message);}}
 throw Error('최근 7일 내 새 원문을 확보하지 못해 발행을 건너뜁니다. '+errors.join(' / ').slice(0,800));
}
export function validateColumn(a,source,previous=[]){
 if(!a||typeof a.title!=='string'||!a.title.trim()||a.title.length>120||typeof a.deck!=='string'||typeof a.question!=='string'||!['Psychology','Society','Culture','History','Philosophy','Science'].includes(a.category))throw Error('칼럼 기본 형식 오류');
 if(a.sourceUrl!==source.url||!Array.isArray(a.sections)||a.sections.length!==5)throw Error('원문 연결 또는 섹션 형식 오류');
 let length=0;for(const [i,s] of a.sections.entries()){if(typeof s.heading!=='string'||typeof s.body!=='string'||!['fact','analysis'].includes(s.kind)||!Array.isArray(s.sourceIds)||!s.sourceIds.length||s.sourceIds.some(id=>id!==source.id))throw Error('근거 없는 칼럼 문단');if(i===0&&s.kind!=='fact'||i>0&&s.kind!=='analysis')throw Error('사실과 해석 구분 오류');length+=s.body.length;}
 if(length<1200||length>1800)throw Error('칼럼 분량('+length+'자)이 1,200~1,800자 범위를 벗어났습니다.');
 const body=a.sections.map(s=>s.body).join('\n');
 for(let i=0;i<body.length-70;i+=5)if(source.text.includes(body.slice(i,i+70)))throw Error('원문 표현을 과도하게 재현했습니다.');
 if(previous.some(p=>p.source?.url===source.url||p.title===a.title))throw Error('이미 발행한 주제입니다.');
 if(source.publisher==='NASA'&&/NASA에 따르면|나사에 따르면|NASA가 (분석|해석|보증)/i.test(body))throw Error('NASA가 AI 출력을 보증하는 인상을 주는 표현');
 return length;
}
