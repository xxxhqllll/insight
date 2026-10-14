import {test} from 'node:test';
import assert from 'node:assert/strict';
import {searchBooks} from '../scripts/books.mjs';
const google={items:[{id:'book1',volumeInfo:{title:'Test Book',authors:['Test Author'],publishedDate:'2020'}}]};
const ol={docs:[{key:'/works/OL123W',title:'Test Book',author_name:['Test Author'],first_publish_year:2020}]};
test('Google success uses one request and preserves metadata',async()=>{
 let calls=0;const r=await searchBooks('google-success',{cacheMs:0,fetchImpl:async()=>{calls++;return Response.json(google);}});
 assert.equal(calls,1);assert.equal(r.provider,'Google Books');assert.equal(r.books[0].year,'2020');
});
test('Google 429 falls back once to free Open Library without key',async()=>{
 let urls=[],reservations=0;const r=await searchBooks('fallback-429',{cacheMs:0,beforeRequest:async()=>{reservations++;},fetchImpl:async(u)=>{urls.push(String(u));return urls.length===1?new Response('',{status:429}):Response.json(ol);}});
 assert.equal(urls.length,2);assert.equal(reservations,2);assert.equal(r.provider,'Open Library');assert.equal(r.books[0].id,'ol-OL123W');assert.equal(r.errors[0].status,429);
 assert.ok(!urls[1].includes('key='));assert.equal(r.books[0].infoLink,'https://openlibrary.org/works/OL123W');
});
test('missing publication information and duplicates cannot become candidates',async()=>{
 const previous=[{book:{title:'Test Book',author:'Test Author'}}];
 let calls=0;await assert.rejects(searchBooks('no-new-candidates',{cacheMs:0,previous,fetchImpl:async()=>{calls++;return Response.json(calls===1?google:ol);}}),/모두/);assert.equal(calls,2);
});
test('both services exhausted stop after two calls without paid fallback',async()=>{
 let calls=0;await assert.rejects(searchBooks('both-429',{cacheMs:0,fetchImpl:async()=>{calls++;return new Response('',{status:429});}}),error=>error.service==='book-search'&&error.errors.length===2);
 assert.equal(calls,2);
});
test('application daily cap cannot be bypassed by provider fallback',async()=>{
 let reserved=0,calls=0;await assert.rejects(searchBooks('quota-stop',{cacheMs:0,beforeRequest:async()=>{if(++reserved>1)throw Error('daily cap');},fetchImpl:async()=>{calls++;return new Response('',{status:429});}}),/daily cap/);
 assert.equal(calls,1);
});
test('API keys never appear in provider errors',async()=>{
 try{await searchBooks('redaction',{cacheMs:0,googleKey:'SECRET_TEST_VALUE',fetchImpl:async()=>{throw Error('SECRET_TEST_VALUE');}});assert.fail('must fail');}
 catch(e){assert.ok(!JSON.stringify(e.errors).includes('SECRET_TEST_VALUE'));assert.ok(!e.message.includes('SECRET_TEST_VALUE'));}
});
test('cache avoids repeat requests but still excludes already published books',async()=>{
 let calls=0;const options={fetchImpl:async()=>{calls++;return Response.json(google);}};
 await searchBooks('cache-case',options);const r=await searchBooks('cache-case',options);assert.equal(calls,1);assert.equal(r.cached,true);
});
