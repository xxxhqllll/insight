# INSIGHT — 해외 뉴스에서 출발하는 지적 일상

실제 해외 공개 뉴스 원문으로 한국어 독립 칼럼을 작성하는 개인용 정적 웹앱입니다. 기존 책 아티클·읽기 기록·북마크는 유지합니다. 토론 기능은 없습니다.

## 현재 자동 발행
- 한국 시간 매일 오전 7시 기준 GitHub Actions 실행. 예약이 지연될 수 있습니다.
- 하루 최대 1편, 1,200~1,800자. 원문 작성일부터 7일 이내 뉴스만 후보로 사용합니다.
- RSS는 발견용입니다. 실제 본문 1,600자 이상을 확보해야 AI를 호출합니다. 제목·요약만으로 글을 만들지 않습니다.
- 첫 섹션은 원문 기반 사실, 나머지는 INSIGHT AI의 해석·한계·질문으로 표시합니다.
- 단일 기관 발표 기반이며 여러 언론이 교차 취재한 기사로 가장하지 않습니다.
- 작성 1회 + 검증 1회. 근거·분량 검증 실패 시 발행하지 않습니다. 자동 재시도 없음.
- 기존 책 콘텐츠는 삭제하지 않고 새 칼럼을 앞에 추가합니다.

## 실제 원문 제공처
현재 연결: NSF·NIH·NASA의 공식 공개 뉴스. 정책 링크와 피드 주소는 data/news-sources.json에 있습니다. 텍스트만 수집하고 사진·로고·영상·별도 저작권 표시 자료는 제외합니다. robots.txt 수집 제한도 확인합니다.
BBC/CNN/TED는 자동 이용 권한이 확인되지 않아 연결하지 않았습니다. 이들 기사를 읽었다고 표시하지 않습니다. NASA는 원문 제공처일 뿐 AI 칼럼을 승인하거나 정확성을 보증하지 않습니다.
업무 관련 물류·배터리·무역·환율 등은 후보에서 제외합니다. 현재 제공처는 과학·인간·사회 연구 중심이며 매일 다양한 문화 뉴스가 확보된다는 보장은 없습니다.

## 실행
1. Node.js 22 설치 후 이 폴더에서 터미널을 엽니다.
2. npm ci
3. npm run dev (개발) 또는 npm run build 후 npm start (정적 읽기)
4. http://localhost:4173 에서 읽습니다. dev는 출력된 개발 주소를 사용합니다.

## 무료 Gemini 키 및 설정
https://aistudio.google.com/apikey 에서 본인 Google 계정으로 키를 만듭니다. 결제 계정이 연결되지 않은 Free 프로젝트만 사용하세요. 키를 채팅·소스·브라우저 코드에 넣지 마세요.
로컬 생성은 .env.local에 GEMINI_API_KEY, GEMINI_MODEL, FREE_TIER_CONFIRMED=true를 설정한 뒤 npm run generate입니다. 모델은 data/policy.json의 검증 목록 안에서 환경변수로 지정합니다. 공급자 무료 정책은 바뀔 수 있으므로 기한이 지나면 재확인 전 자동 중단됩니다.

## GitHub와 무료 배포
공개 저장소의 insight/ 아래 소스, 저장소 루트 .github/workflows/insight.yml이 필요합니다. Settings → Pages → Source에서 GitHub Actions를 선택하세요.
Settings → Secrets and variables → Actions에서 Secret GEMINI_API_KEY, Variables GEMINI_MODEL, FREE_TIER_CONFIRMED=true, ENABLE_AUTO_GENERATION=true를 등록합니다. 키는 서버 환경에만 전달됩니다.
Actions의 INSIGHT — generate and publish → Run workflow에서 generate를 켜면 당일 한도 안에서 수동 시도합니다. 일반 코드 push는 사이트만 배포합니다. 예약 실행은 자동 생성 후 JSON을 커밋하고 배포합니다.

## 비용과 한도
유료 API·DB·서버를 사용하지 않습니다. 공개 저장소의 GitHub 호스팅 실행 환경과 Pages를 사용합니다. 무료 한도·정책은 각 제공자의 현재 정책을 따릅니다.
- 하루 발행 최대 1편, 생성 시도 1회, 전체 Gemini 호출 최대 3회(뉴스 정상 경로 2회).
- 뉴스 RSS 최대 3개, 원문 후보 최대 3개. 네트워크 요청은 시간·용량 한도가 있습니다.
- 429 발생 시 해당 날짜 AI를 차단합니다. 유료 모델 전환·결제 등록·자동 재시도를 하지 않습니다.
- 앱 상한만으로 Google 프로젝트의 결제 상태를 판별할 수 없습니다. 반드시 결제 계정 미연결 상태를 유지하세요.
- 읽기 기록과 북마크는 같은 브라우저의 LocalStorage에 저장됩니다. 설정에서 JSON으로 내보낼 수 있습니다.

## 상태 확인
웹 설정의 자동 발행 상태와 Actions의 Content status를 확인하세요. 사이트 배포 성공과 새 칼럼 발행 성공은 별개입니다. skipped면 이유를 표시하고 기존 글을 유지합니다.
2026-10-15 뉴스 전환 때만 이전 도서 선정 실패를 남은 AI 2회 안에서 한 번 이어갈 수 있는 --resume 검증 경로가 있습니다. 일일 기록과 한도를 초기화하지 않습니다. 그 외 재시도는 거절합니다.

## 검증
npm test / npm run typecheck / npm run build
scripts/check-news.mjs는 AI를 호출하지 않고 실제 뉴스 원문 접근과 본문 확보만 확인합니다.
