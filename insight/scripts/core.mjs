import fs from 'node:fs';
import path from 'node:path';
export const ROOT=process.cwd();
export const policy=JSON.parse(fs.readFileSync(path.join(ROOT,'data/policy.json'),'utf8'));
export const dayKey=(now=new Date())=>new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Seoul',year:'numeric',month:'2-digit',day:'2-digit'}).format(now);
export function readJSON(file,fallback={}){try{return JSON.parse(fs.readFileSync(file,'utf8'));}catch(e){if(e.code==='ENOENT')return fallback;throw new Error('저장 데이터가 손상되었습니다. 자동 중지합니다.');}}
export function writeJSON(file,value){fs.mkdirSync(path.dirname(file),{recursive:true});fs.writeFileSync(file+'.tmp',JSON.stringify(value,null,2)+'\n');fs.renameSync(file+'.tmp',file);}
export function reserve(file,kind,limit){const all=readJSON(file);const date=dayKey();const d=all[date]||{};if(d.blocked)throw new Error('무료 할당량 오류가 발생하여 오늘의 AI 요청을 중지했습니다.');if((d[kind]||0)>=limit)throw new Error(`오늘의 ${kind} 한도(${limit}회)에 도달했습니다.`);d[kind]=(d[kind]||0)+1;all[date]=d;writeJSON(file,all);}
export function block(file){const all=readJSON(file);const day=dayKey();all[day]={...all[day],blocked:true};writeJSON(file,all);}
export function checkConfig(env=process.env,now=dayKey()){
 if(env.FREE_TIER_CONFIRMED!=='true')throw new Error('결제 계정 미연결 확인이 필요합니다. FREE_TIER_CONFIRMED=true 설정 전에는 AI를 호출하지 않습니다.');
 if(!env.GEMINI_API_KEY)throw new Error('GEMINI_API_KEY가 설정되지 않았습니다.');
 if(!policy.allowedModels.includes(env.GEMINI_MODEL))throw new Error('무료 검증 목록에 없는 모델입니다. 무료 정책을 확인하고 data/policy.json을 갱신하세요.');
 if(now>policy.validUntil)throw new Error('무료 모델 정책 확인 기간이 만료되었습니다. 공식 요금표를 다시 확인하고 policy.json을 갱신하세요.');
 return env.GEMINI_MODEL;
}
export async function request(url,options={}){const r=await fetch(url,{...options,signal:AbortSignal.timeout(45000)});if(!r.ok)throw Object.assign(new Error(r.status===429?'무료 할당량 또는 호출 속도 한도를 초과했습니다. 오늘은 자동 중지합니다.':r.status===401||r.status===403?'API 키 또는 API 사용 권한을 확인하세요.':`외부 서비스 응답 오류 (${r.status}). 자동 재시도하지 않습니다.`),{status:r.status});return r;}
export async function gemini(prompt,{ledger,kind='generationCalls',json=true,maxTokens=7000}={}){
 const model=checkConfig();reserve(ledger,kind,policy.limits[kind]);
 try{const r=await request(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`,{method:'POST',headers:{'Content-Type':'application/json','x-goog-api-key':process.env.GEMINI_API_KEY},body:JSON.stringify({contents:[{role:'user',parts:[{text:prompt}]}],generationConfig:{maxOutputTokens:maxTokens,temperature:json?0.25:0.6,...(json?{responseMimeType:'application/json'}:{})}})});
 const d=await r.json();const candidate=d.candidates?.[0];if(candidate?.finishReason!=='STOP')throw new Error('AI 응답이 안전 필터 또는 출력 한도로 종료되었습니다.');const text=candidate.content?.parts?.filter(p=>!p.thought).map(p=>p.text||'').join('');if(!text)throw new Error('AI가 빈 응답을 반환했습니다.');return json?JSON.parse(text):text;
 }catch(e){if(e.status===429)block(ledger);throw e;}
}
export const normalize=s=>String(s).toLowerCase().replace(/[^\p{L}\p{N}]/gu,'');
export function validateArticle(a,book,sources,previous=[]){
 if(!a||typeof a.title!=='string'||!a.title.trim()||a.title.length>120||typeof a.deck!=='string'||typeof a.question!=='string')throw new Error('제목·소개·질문 형식 오류');
 if(a.book?.title!==book.title||a.book?.author!==book.author)throw new Error('도서명 또는 저자가 검색 결과와 불일치합니다.');
 if(!Array.isArray(a.sections)||a.sections.length!==6)throw new Error('본문은 6개 섹션이어야 합니다.');
 let length=0;for(const s of a.sections){if(typeof s.heading!=='string'||typeof s.body!=='string'||!Array.isArray(s.sourceIds)||!['fact','analysis'].includes(s.kind))throw new Error('본문 구조 오류');length+=s.body.length;if(s.kind==='fact'&&!s.sourceIds.length)throw new Error('사실 문단에 근거가 없습니다.');if(s.sourceIds.some(id=>!sources.some(x=>x.id===id)))throw new Error('존재하지 않는 출처');}
 if(length<2500||length>3500)throw new Error(`본문 분량(${length}자)이 2,500~3,500자 범위를 벗어났습니다.`);
 const body=a.sections.map(s=>s.body).join('\n');
 if(/책 전체를 (읽|분석)|완독했/.test(body))throw new Error('전체 독서를 오인시키는 표현');
 for(const src of sources){const clean=src.text.replace(/\s+/g,' ');const out=body.replace(/\s+/g,' ');for(let i=0;i<out.length-80;i+=10){if(clean.includes(out.slice(i,i+80)))throw new Error('출처와 긴 연속 표현이 겹칩니다.');}}
 if(previous.some(p=>normalize(p.book.title)===normalize(book.title)&&normalize(p.book.author)===normalize(book.author)))throw new Error('이미 발행한 도서입니다.');
 const grams=t=>new Set(normalize(t).match(/.{1,8}/g)||[]);const aa=grams(body);
 for(const p of previous){const bb=grams(p.sections.map(s=>s.body).join(''));const shared=[...aa].filter(v=>bb.has(v)).length;if(shared/Math.max(1,Math.min(aa.size,bb.size))>.65)throw new Error('기존 글과 본문이 지나치게 유사합니다.');}
 return length;
}
export function validateReview(r,sources){if(!r||r.pass!==true||r.unsupportedClaims?.length!==0||r.copyrightRisk!==false||r.identityMatch!==true||!Array.isArray(r.evidence)||r.evidence.length<3)throw new Error('AI 교차 검토를 통과하지 못했습니다.');for(const e of r.evidence){const src=sources.find(s=>s.id===e.sourceId);if(typeof e.claim!=='string'||typeof e.quote!=='string'||e.quote.length<15||!src?.text.includes(e.quote))throw new Error('검증 근거가 실제 수집 자료와 일치하지 않습니다.');}}
