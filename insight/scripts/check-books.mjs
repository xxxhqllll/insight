// Live metadata-only diagnosis. Does not call Gemini, publish, or reset any usage.
import {searchBooks} from './books.mjs';
let calls=0;
const result=await searchBooks('subject:science',{
 limit:3,cacheMs:0,
 beforeRequest:async()=>{if(++calls>2)throw Error('진단 요청 한도 초과');},
 onProviderError:detail=>console.warn(detail.message)
});
console.log(JSON.stringify({provider:result.provider,metadataRequests:calls,books:result.books.map(b=>({title:b.title,author:b.author,year:b.year})),geminiCalls:0},null,2));
