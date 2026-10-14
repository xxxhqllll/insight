// Dependency-free ZIP (stored entries) for downloading the complete portable source.
import fs from 'node:fs';
import path from 'node:path';
const root=process.cwd();
const crcTable=Array.from({length:256},(_,n)=>{for(let k=0;k<8;k++)n=n&1?0xedb88320^(n>>>1):n>>>1;return n>>>0;});
const crc32=b=>{let c=0xffffffff;for(const n of b)c=crcTable[(c^n)&255]^(c>>>8);return(c^0xffffffff)>>>0;};
const excluded=new Set(['.git','.next','node_modules','out','.runtime','.openai','.codex']);
const names=[];function walk(dir){for(const f of fs.readdirSync(dir,{withFileTypes:true})){if(excluded.has(f.name)||f.name.startsWith('.env')&&f.name!=='.env.example'||/\.zip$|\.tsbuildinfo$/.test(f.name))continue;const full=path.join(dir,f.name);if(f.isDirectory())walk(full);else if(f.isFile())names.push(path.relative(root,full).replaceAll('\\','/'));}}walk(root);
let offset=0;const files=[],central=[];
for(const n of names.sort()){const name=Buffer.from('insight/'+n),data=fs.readFileSync(path.join(root,n)),crc=crc32(data),h=Buffer.alloc(30);h.writeUInt32LE(0x04034b50);h.writeUInt16LE(20,4);h.writeUInt16LE(0x800,6);h.writeUInt16LE(33,12);h.writeUInt32LE(crc,14);h.writeUInt32LE(data.length,18);h.writeUInt32LE(data.length,22);h.writeUInt16LE(name.length,26);files.push(h,name,data);const c=Buffer.alloc(46);c.writeUInt32LE(0x02014b50);c.writeUInt16LE(20,4);c.writeUInt16LE(20,6);c.writeUInt16LE(0x800,8);c.writeUInt16LE(33,14);c.writeUInt32LE(crc,16);c.writeUInt32LE(data.length,20);c.writeUInt32LE(data.length,24);c.writeUInt16LE(name.length,28);c.writeUInt32LE(offset,42);central.push(c,name);offset+=h.length+name.length+data.length;}
const cd=Buffer.concat(central),end=Buffer.alloc(22);end.writeUInt32LE(0x06054b50);end.writeUInt16LE(names.length,8);end.writeUInt16LE(names.length,10);end.writeUInt32LE(cd.length,12);end.writeUInt32LE(offset,16);fs.mkdirSync('public',{recursive:true});fs.writeFileSync('public/insight-source.zip',Buffer.concat([...files,cd,end]));console.log(`Portable source: ${names.length} files`);
