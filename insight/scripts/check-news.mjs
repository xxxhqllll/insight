import fs from 'node:fs';
import {selectNews} from './news.mjs';
const config=JSON.parse(fs.readFileSync('data/news-sources.json'));
const previous=JSON.parse(fs.readFileSync('data/articles.json'));
const s=await selectNews(config,previous);
console.log(JSON.stringify({publisher:s.source.publisher,title:s.source.title,url:s.source.url,publishedAt:s.source.publishedAt,bodyCharacters:s.source.text.length}));
