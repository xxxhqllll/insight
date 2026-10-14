// Free metadata search only. No paid search, billing flow, scraping, or retry loop.
const cache = new Map();
const clean = value => typeof value === 'string' ? value.trim() : '';
const norm = value => clean(value).toLowerCase().replace(/[^\p{L}\p{N}]/gu, '');
function usable(book, previous) {
  return book.title && book.author && book.year && !previous.some(a =>
    (norm(a.book?.title) === norm(book.title) || norm(a.book?.originalTitle) === norm(book.title)) &&
    [a.book?.author, a.book?.originalAuthor].some(author => norm(author) === norm(book.author)));
}
function googleBooks(data) {
  return (data.items || []).filter(x => /^[\w-]+$/.test(x.id || '')).map(x => ({
    id: x.id, title: clean(x.volumeInfo?.title).slice(0,300),
    author: Array.isArray(x.volumeInfo?.authors) ? x.volumeInfo.authors.filter(a=>typeof a==='string').join(', ').slice(0,300) : '',
    year: clean(x.volumeInfo?.publishedDate), description: clean(x.volumeInfo?.description).slice(0,1500),
    provider: 'Google Books', infoLink: 'https://books.google.com/books?id=' + encodeURIComponent(x.id)
  }));
}
function openLibrary(data) {
  return (data.docs || []).map(x => {
    const id = clean(x.key).replace(/^\/works\//,'');
    return {id: 'ol-' + id, title: clean(x.title).slice(0,300),
      author: Array.isArray(x.author_name) ? x.author_name.filter(a=>typeof a==='string').join(', ').slice(0,300) : '',
      year: Number.isInteger(x.first_publish_year) ? String(x.first_publish_year) : '',
      description: '', provider: 'Open Library', infoLink: 'https://openlibrary.org/works/' + id,
      valid: /^OL\d+W$/.test(id)};
  }).filter(x => x.valid).map(({valid,...book})=>book);
}
export async function searchBooks(query, {
  googleKey = '', previous = [], limit = 20, fetchImpl = globalThis.fetch,
  beforeRequest = async () => {}, onProviderError = () => {}, cacheMs = 600000
} = {}) {
  query = clean(query);
  if(!query || query.length>150) throw new Error('검색어는 1~150자여야 합니다.');
  limit = Math.min(20, Math.max(1, limit));
  const key = query + ':' + limit + ':' + (googleKey ? 'key' : 'public');
  const hit = cache.get(key);
  if(hit && Date.now()-hit.at<cacheMs) {
    const books=hit.books.filter(b=>usable(b,previous));
    if(books.length)return {...hit.result,books,cached:true};
  }
  const errors=[];
  for(const provider of ['Google Books','Open Library']) {
    // Quota reservation is outside the catch: the fallback cannot bypass this app's cap.
    await beforeRequest(provider);
    try {
      const u=new URL(provider==='Google Books' ? 'https://www.googleapis.com/books/v1/volumes' : 'https://openlibrary.org/search.json');
      u.searchParams.set('q',query);
      if(provider==='Google Books') {
        u.searchParams.set('maxResults',String(limit));u.searchParams.set('printType','books');
        if(googleKey)u.searchParams.set('key',googleKey);
      } else {
        u.searchParams.set('limit',String(limit));
        u.searchParams.set('fields','key,title,author_name,first_publish_year');
      }
      const response=await fetchImpl(u,{signal:AbortSignal.timeout(20000)});
      if(!response.ok)throw Object.assign(new Error(provider+' 응답 오류 ('+response.status+')'),{status:response.status});
      const data=await response.json();
      const all=provider==='Google Books'?googleBooks(data):openLibrary(data);
      const books=all.filter(b=>usable(b,previous));
      if(!books.length)throw new Error(provider+'에서 정확한 출간 정보가 있는 새 도서를 찾지 못했습니다.');
      const result={provider,books,fallback:provider==='Open Library',errors,cached:false};
      if(cache.size>=50)cache.delete(cache.keys().next().value);
      cache.set(key,{at:Date.now(),books:all,result});
      return result;
    } catch(error) {
      const detail={provider,status:error.status || null,message:provider+' 검색 '+(error.status ? '오류 ('+error.status+')' : '실패 또는 유효한 후보 없음')};
      errors.push(detail);onProviderError(detail);
    }
  }
  throw Object.assign(new Error('Google Books와 Open Library 도서 검색을 모두 완료하지 못했습니다. '+errors.map(e=>e.message).join(' / ')+' 자동 재시도나 유료 전환은 하지 않습니다.'),{service:'book-search',errors});
}
