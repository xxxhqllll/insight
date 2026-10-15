import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import {ROOT} from './core.mjs';
const port=4173;
const server=http.createServer(async(req,res)=>{
 const send=(code,data)=>{res.writeHead(code,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'});res.end(JSON.stringify(data));};
 // Same-origin only, no CORS; reject DNS rebinding and cross-site browser requests.
 if(!['127.0.0.1:4173','localhost:4173'].includes(req.headers.host))return send(403,{error:'로컬 주소로만 접근할 수 있습니다.'});
 if(req.headers.origin&&!['http://127.0.0.1:4173','http://localhost:4173'].includes(req.headers.origin))return send(403,{error:'허용되지 않은 출처입니다.'});
 if(req.headers['sec-fetch-site']==='cross-site')return send(403,{error:'외부 사이트의 요청은 허용하지 않습니다.'});
 const url=new URL(req.url,'http://localhost:4173');
 try{
 if(req.method!=='GET'&&req.method!=='HEAD')return send(405,{error:'지원하지 않는 메서드'});
 const out=path.join(ROOT,'out'),decoded=decodeURIComponent(url.pathname);let file=path.resolve(out,'.'+decoded);if(!file.startsWith(out+path.sep)&&file!==out)return send(403,{error:'허용되지 않은 경로'});if(fs.existsSync(file)&&fs.statSync(file).isDirectory())file=path.join(file,'index.html');if(!fs.existsSync(file))return send(404,{error:'파일이 없습니다. npm run build 후 실행하세요.'});const types={'.html':'text/html; charset=utf-8','.js':'application/javascript','.css':'text/css','.json':'application/json','.zip':'application/zip','.svg':'image/svg+xml','.woff2':'font/woff2'};res.writeHead(200,{'Content-Type':types[path.extname(file)]||'application/octet-stream','X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer','Cache-Control':'no-cache'});if(req.method==='HEAD')return res.end();fs.createReadStream(file).pipe(res);
 }catch{send(500,{error:'로컬 요청을 처리하지 못했습니다.'});}
});server.requestTimeout=65000;server.headersTimeout=10000;server.listen(port,'127.0.0.1',()=>console.log('INSIGHT: http://localhost:4173'));
