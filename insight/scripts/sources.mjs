import { readJSON,request,ROOT } from './core.mjs';
import path from 'node:path';
const rules=readJSON(path.join(ROOT,'data/sources.json'));
export function safeURL(value){const u=new URL(value);if(u.protocol!=='https:'||u.port||u.username||u.password||!rules.allowedHosts.includes(u.hostname)||rules.blockedHosts.includes(u.hostname))throw new Error('허용된 공개 자료 사이트가 아닙니다.');return u;}
async function getChecked(url,remaining=3){const u=safeURL(url);const r=await fetch(u,{redirect:'manual',headers:{'User-Agent':'INSIGHTPersonalReader/1.0'},signal:AbortSignal.timeout(15000)});if(r.status>=300&&r.status<400){if(!remaining)throw new Error('리디렉션 한도');return getChecked(new URL(r.headers.get('location'),u).href,remaining-1);}if(!r.ok)throw new Error(`자료 접근 실패 (${r.status})`);return r;}
export function robotsAllows(text,pathname){
 // Conservative: honor every Disallow group, including restrictions for other bots.
 const disallows=text.split('\n').map(x=>x.replace(/#.*/,'').trim()).filter(x=>/^disallow:/i.test(x)).map(x=>x.slice(x.indexOf(':')+1).trim()).filter(Boolean);
 return !disallows.some(rule=>{const end=rule.endsWith('$');const pattern=rule.replace(/\$$/,'').split('*').map(x=>x.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')).join('.*');return new RegExp('^'+pattern+(end?'$':'')).test(pathname);});
}
export async function collect(value,id){const u=safeURL(value);
 const robots=await getChecked(new URL('/robots.txt',u).href);if(!robotsAllows(await robots.text(),u.pathname+u.search))throw new Error('robots 정책에 따라 수집하지 않습니다.');
 const r=await getChecked(u.href);if(!/text\/html|text\/plain/.test(r.headers.get('content-type')||''))throw new Error('지원하지 않는 자료 형식');
 const reader=r.body.getReader();let size=0,chunks=[];while(true){const {done,value}=await reader.read();if(done)break;size+=value.length;if(size>1500000){await reader.cancel();throw new Error('자료 크기 한도 초과');}chunks.push(value);}const html=Buffer.concat(chunks).toString('utf8');
 const text=html.replace(/<(script|style|nav|header|footer)\b[^>]*>[\s\S]*?<\/\1>/gi,' ').replace(/<[^>]+>/g,' ').replace(/&nbsp;|&#160;/g,' ').replace(/&amp;/g,'&').replace(/&quot;/g,'"').replace(/&#39;/g,"'").replace(/\s+/g,' ').trim();
 if(text.length<700)throw new Error('검증 가능한 자료가 부족합니다.');return {id,url:u.href,title:(html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]||u.hostname).replace(/<[^>]+>/g,''),text:text.slice(0,14000),retrievedAt:new Date().toISOString()};
}
