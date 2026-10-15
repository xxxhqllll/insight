# INSIGHT

AI 토론 기능은 제거되었습니다. 웹과 로컬 모두 아티클 읽기·검색·북마크 기능을 제공합니다.

책에서 출발하는 개인용 지식 매거진. Next.js 15 · TypeScript · Tailwind CSS 4 · 정적 JSON.

**사이트 읽기는 바로 가능. 실제 자동 발행은 본인의 무료 API 키 설정이 필요합니다. 키가 없을 때 가짜 AI 답변이나 가짜 발행 성공을 보여 주지 않습니다.**

## 1. 무엇이 작동하나요?

| 기능 | 제공 방식 |
|---|---|
| HOME / LIBRARY / EXPLORE | 샘플 에세이 3편, 7개 분야, 제목·저자 검색 |
| 독서 화면 | 6개 본문 + 출처, 질문, 약 2,500~3,500자 샘플 |
| 기록 / 북마크 / 다크 모드 / 관심 분야 | 현재 브라우저 LocalStorage, 계정 불필요 |
| 실시간 도서 검색 | Google Books, 직접 검색 및 분야별 추천, 브라우저당 하루 5회 |
| 매일 새 글 생성 | GitHub Actions + Gemini + 접근 허용된 공개 자료, 설정 후 작동 |
| 내보내기 | 모든 아티클과 읽기 설정을 JSON 다운로드 |
| 운영 상태 | 최근 빌드에 포함된 생성 결과 및 실패 사유 |
| 소스코드 | 설정 메뉴에서 ZIP 다운로드, 빌드마다 갱신 |

현재 포함된 3편은 카프카 『변신』, 스미스 『국부론』, 다윈 『종의 기원』을 출발점으로 한 **샘플 독립 에세이**입니다. 실제 자동 발행한 것처럼 표시하지 않습니다. 실시간 외부 API 통합은 사용자 키가 없어 실제 응답 검증 전입니다.

## 2. 월 0원 조건 — 먼저 확인하세요

이 프로젝트는 구독, 유료 API, 유료 DB, 유료 서버를 요구하지 않습니다. 결제나 유료 전환 기능도 없습니다. 아래 조건을 유지하세요.

1. **Google AI Studio의 Free 프로젝트만 사용하고 Cloud Billing 계정을 연결하지 마세요.** 기존 결제 연결 프로젝트의 키를 사용하지 마세요. 앱은 API 키만으로 결제 상태를 증명할 수 없습니다. `FREE_TIER_CONFIRMED`는 직접 확인했다는 표시이지 자동 결제 조회가 아닙니다.
2. GitHub Free **공개(Public) 저장소** + 기본 `ubuntu-latest` GitHub-hosted runner + GitHub Pages를 사용하세요. 사용자 지정 도메인, 대형 runner, 유료 요금제는 필요 없습니다. 워크플로는 비공개 저장소에서 실행을 중지합니다.
3. 계정에서 사용량 추가 결제를 켜지 마세요. 무료 제한 오류가 나면 기다리거나 기능을 끄세요. 앱이 다른 유료 서비스로 우회하지 않습니다.
4. 무료 조건을 확인한 날짜는 **2026-10-14**입니다. 설정의 재확인 기한이 지나면 AI는 중지됩니다. 영구 무료나 매일 발행 성공을 보장하는 서비스가 아닙니다. 공급자가 정책을 바꾸면 무료 기능을 중단하는 방식입니다.

검증된 모델: `gemini-3.5-flash-lite`, `gemini-3.8-flash`. 실행 모델은 `GEMINI_MODEL`에서 지정합니다. Google 검색 grounding, Maps, 이미지 생성, 유료 검색은 호출하지 않습니다. API 제공 한도는 프로젝트마다 달라질 수 있습니다. 실제 한도는 AI Studio에서 확인하세요.

공식 근거:
- [Gemini 요금표](https://ai.google.dev/gemini-api/docs/pricing)
- [Gemini 결제 등급](https://ai.google.dev/gemini-api/docs/billing)
- [Gemini 호출 제한](https://ai.google.dev/gemini-api/docs/rate-limits)
- [GitHub Actions 과금](https://docs.github.com/en/billing/concepts/product-billing/github-actions)
- [GitHub Pages 사용 조건](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site)

## 3. 가장 쉬운 시작 — 내 PC에서 읽기

### 준비

1. [Node.js](https://nodejs.org/)에서 **22 이상 LTS**를 무료로 설치하세요. 설치 시 기본 선택을 유지하면 됩니다.
2. `insight-source.zip`을 내려받고 **압축을 풀어 주세요.** 안에 있는 `insight` 폴더를 엽니다.
3. Windows 탐색기의 폴더 주소창에 `powershell`을 입력하고 Enter를 누릅니다. Mac은 터미널에서 해당 폴더로 이동합니다.
4. 아래 명령을 한 줄씩 입력합니다.

```sh
npm ci
npm run build
npm start
```

5. 브라우저에서 **http://localhost:4173** 을 엽니다.

종료는 터미널에서 `Ctrl+C`. 다음번에는 같은 폴더에서 `npm start`만 실행하면 됩니다. 아티클이나 코드를 바꿨다면 `npm run build` 후 실행하세요. 개발 중 화면 수정은 `npm run dev`로 가능합니다. 

Windows에서 `npm.ps1` 실행이 제한된다면 같은 명령을 `npm.cmd ci`, `npm.cmd run build`, `npm.cmd start`로 입력하거나 명령 프롬프트(cmd)를 사용하세요. 시스템 전체의 보안 정책을 바꿀 필요 없습니다.

## 4. 자동 발행용 무료 Gemini 키 발급

1. [Google AI Studio API Keys](https://aistudio.google.com/api-keys)에 Google 계정으로 로그인합니다.
2. API 키 만들기에서 **결제 계정이 연결되지 않은 신규 프로젝트**를 선택합니다. 카드나 결제 활성화를 요구하는 흐름은 진행하지 않습니다.
3. AI Studio에서 해당 프로젝트의 사용 등급이 **Free**인지 확인합니다. 이용 가능 지역과 계정 제한은 Google의 안내를 따릅니다.
4. 키를 복사합니다. 채팅, 소스코드, 스크린샷에 공개하지 마세요.
5. `insight` 폴더의 `.env.example`을 복사하여 `.env.local`로 이름을 바꿉니다. Windows에서 확장명이 `.txt`로 붙지 않았는지 확인합니다.

```dotenv
GEMINI_API_KEY=여기에_본인의_키
GEMINI_MODEL=gemini-3.5-flash-lite
FREE_TIER_CONFIRMED=true
GOOGLE_BOOKS_API_KEY=
```

6. 기존 서버를 `Ctrl+C`로 종료하고 `npm start`로 다시 실행합니다.
7. **DISCUSSION → 아티클 선택 → 질문 입력**. 첫 답변이 실제 Gemini 응답입니다. 설정 화면에서 연결 모델과 오류를 확인할 수 있습니다.



[API 키 공식 안내](https://ai.google.dev/gemini-api/docs/api-key)

## 5. Google Books 키는 선택 사항입니다

EXPLORE와 자동 생성은 Google Books를 우선 사용하고, 호출 제한·응답 실패·유효한 새 도서 부족 시 무료 Open Library Search API로 한 번 전환합니다. 별도 Open Library 키나 결제 등록은 필요 없습니다. 각 제공자는 최대 1회만 호출하며, 두 요청 모두 일일 도서 검색 상한에 포함합니다. 같은 검색의 성공 결과는 메모리에 10분간 캐시합니다. 두 서비스가 모두 실패하면 해당 작업을 중단합니다. Gemini 429는 다른 모델로 전환하지 않고 기존대로 당일 차단합니다.

EXPLORE의 검색은 공개 메타데이터 API에 키 없이 요청합니다. 서비스·프로젝트 제한으로 403/429가 발생하면 오류를 표시하고 무한 재시도하지 않습니다.

자동 발행에 전용 키를 쓰려면:

1. [Google Cloud Console](https://console.cloud.google.com/)에서 **결제 미연결 프로젝트**를 선택합니다.
2. API 및 서비스 → 라이브러리 → **Books API** → 사용.
3. 사용자 인증 정보 → API 키 만들기.
4. API 제한을 **Books API**로 설정합니다.
5. 로컬 `.env.local` 또는 GitHub Secret `GOOGLE_BOOKS_API_KEY`에만 저장합니다.

브라우저 검색에 이 키를 노출하지 않습니다. GitHub의 호스팅 runner는 IP가 고정되어 있지 않으므로 IP 제한을 임의로 설정하면 자동 발행이 막힐 수 있습니다. 결제 연결을 요구하면 진행하지 말고 키 없는 공개 검색만 사용하세요.

[Google Books API 문서](https://developers.google.com/books/docs/v1/using)

## 6. GitHub 연결 — 개발 경험이 없어도 가능

1. [GitHub](https://github.com/) 무료 계정을 만듭니다. 카드 등록은 필요 없습니다.
2. [GitHub Desktop](https://desktop.github.com/)을 무료 설치하고 로그인합니다.
3. File → **Add local repository** → 압축을 푼 `insight` 폴더 선택.
4. 저장소가 없다는 안내가 나오면 **create a repository here**를 선택합니다. 이름은 `insight`, 위치는 현재 폴더를 사용합니다. `insight/insight`처럼 이중 폴더가 생기지 않게 확인합니다.
5. 파일 목록에서 `.env.local`이 **보이지 않는지 반드시 확인**합니다. 보이면 중단하고 `.gitignore`를 확인하세요.
6. Summary에 `Initial INSIGHT`를 적고 Commit to main을 누릅니다.
7. **Publish repository** → `Keep this code private` 체크 해제 → Publish repository.
8. 저장소 홈페이지에서 `package.json`, `app`, `data`, `scripts`, `.github/workflows/insight.yml`이 최상위에 있는지 확인합니다. ZIP 자체만 올리면 실행되지 않습니다.

공개 저장소에는 소스와 아티클만 올라갑니다. 브라우저에 있는 읽기 기록은 전송되지 않습니다. GitHub Pages 사이트와 아티클은 인터넷에 공개됩니다. 개인 계정 로그인이 있는 비공개 서비스로 착각하지 마세요. 이 대화에서 제공된 비공개 확인용 사이트와, 사용자가 만드는 공개 GitHub Pages 사이트는 별개입니다.

## 7. 무료 웹 배포

1. GitHub 저장소 → Settings → Pages.
2. Build and deployment → Source에서 **GitHub Actions** 선택.
3. Settings → Actions → General → Workflow permissions에서 **Read and write permissions**를 허용합니다. 조직 정책 또는 main 보호 규칙이 쓰기를 막으면 관리자 확인이 필요합니다.
4. Actions → **INSIGHT — generate and publish** → Run workflow.
5. `generate`는 처음에는 **체크하지 않습니다.** 샘플만 배포합니다.
6. 녹색 성공 표시 후 Settings → Pages의 주소로 접속합니다. 일반적으로 `https://사용자명.github.io/insight/`입니다.

하위 경로는 `actions/configure-pages`의 `base_path`로 자동 설정됩니다. 자체 도메인 구매는 불필요합니다. Vercel은 필수가 아니며 이 안내는 GitHub Pages 무료 경로만 사용합니다. GitHub Actions가 커밋한 뒤 같은 워크플로에서 직접 빌드·배포하므로, 봇 커밋이 다른 워크플로를 다시 시작하지 않는 문제도 피합니다.

## 8. 매일 오전 7시 자동 발행 켜기

저장소 → Settings → Secrets and variables → Actions에서 아래 값을 설정합니다.

**Secrets 탭 → New repository secret**

| 이름 | 값 |
|---|---|
| `GEMINI_API_KEY` | 무료 프로젝트의 Gemini 키 |
| `GOOGLE_BOOKS_API_KEY` | 선택 사항. Books API 전용 키 |

**Variables 탭 → New repository variable**

| 이름 | 값 |
|---|---|
| `GEMINI_MODEL` | `gemini-3.5-flash-lite` |
| `FREE_TIER_CONFIRMED` | 결제 미연결 Free 확인 후 `true` |
| `ENABLE_AUTO_GENERATION` | `true` |

1. Actions → Run workflow → `generate` 체크 → 실행하여 한 번 확인합니다.
2. 다음부터 UTC 22:00, 즉 **한국 시간 다음 날 07:00**에 예약 작업을 요청합니다.
3. GitHub 예약은 지연되거나 실행이 누락될 수 있습니다. 오전 7시 정각 발행을 보장하지 않습니다.
4. 공개 저장소의 일정은 장기간 활동이 없으면 비활성화될 수 있습니다. GitHub 공식 문서의 60일 기준과 Actions 알림을 확인하세요.
5. 중지는 `ENABLE_AUTO_GENERATION=false`. 급히 중지하려면 Actions에서 해당 워크플로를 Disable 합니다.

직접 PC에서 생성하려면 키 설정 후 `npm run generate`, 성공하면 `npm run build`를 실행하세요. 이 명령도 하루 1회 시도 제한을 따릅니다. PC와 GitHub는 별도 실행 환경이므로 **둘을 동시에 자동 운영하지 마세요.** 공급자 한도는 API 프로젝트 단위로 합산됩니다.

### 발행이 건너뛰어질 수 있는 이유

이 버전은 유료 검색 없이 Google Books 후보에서 AI가 책과 1차 자료 URL을 제안합니다. AI가 제안한 주소를 신뢰하지 않고 실제 접근, 허용 호스트, robots, 텍스트, 도서 정체성을 다시 확인합니다. 웹 전체를 검색하는 서비스가 아니어서 최근 책이나 국내 도서는 자료 확보에 자주 실패할 수 있습니다. **매일 새 글을 보장하려고 근거를 만들어내지 않습니다.**

- 정확한 제목·저자·출간 정보를 가진 후보가 없음
- 이미 다룬 도서 또는 유사 본문
- 접근 허용된 충분한 공개 자료를 최소 2개 확보하지 못함
- 사이트가 robots 또는 이용 정책으로 자동 수집을 금지함
- 내용 2,500~3,500자, 출처 표시, 근거 대조 검사 실패
- 무료 프로젝트 한도 또는 API 권한 오류
- 무료 정책 재확인 기한 만료

허용된 수집 호스트는 `data/sources.json`에서 관리합니다. 접근 제한 우회·로그인·유료벽·임의 PDF 크롤링은 하지 않습니다. 샘플의 Gutenberg는 서지 링크로만 사용하고, 자동 수집 제한을 존중하여 생성 수집기에서는 차단했습니다. 새 도메인을 추가할 때는 이용약관과 robots를 먼저 확인하세요. robots가 없거나 확인할 수 없어도 보수적으로 건너뜁니다.

[GitHub 예약 실행 안내](https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows#schedule)
[Project Gutenberg 자동 접근 정책](https://www.gutenberg.org/policy/robot_access.html)

## 9. 무료 사용량 제한

| 작업 | 이 앱의 상한 | 저장 위치 |
|---|---|---|
| 자동 생성 시도 | 한국 날짜 기준 1회/일, 실패도 소모 | `data/usage.json` |
| 발행 | 최대 1편/일 | `data/articles.json` |
| 생성 Gemini 요청 | 선정·작성·검증 최대 3회/일 | `data/usage.json` |
| 자동 도서 검색 | 최대 5회/일, 현재 과정은 1회 | `data/usage.json` |
| 수집 대상 | 최대 3개 URL/시도, 각 robots 확인 포함 | `data/usage.json` |
| 브라우저 도서 검색 | 하루 5회 | LocalStorage |
| 오류 429 | 해당 환경의 당일 AI 호출 차단 | 각 사용량 파일 |
| 실패 재시도 | 자동 재시도 없음 | 사용자 다음 날 재실행 |

이 숫자는 **Google에서 보장하는 무료 한도가 아니라 앱이 정한 상한**입니다. 실제 공급자 한도가 더 낮으면 더 일찍 중지됩니다. 429가 일시적인 분당 제한이어도 보수적으로 당일 중지합니다. 브라우저 저장소 삭제·다른 기기·별도 프로젝트 사본은 카운터를 공유하지 않습니다. 앱 카운터는 결제 방지의 최종 장치가 아닙니다. **결제 미연결 프로젝트가 필수**입니다.

GitHub 작업은 외부 호출 전에 당일 시도 예약을 먼저 커밋합니다. 중간 취소나 장애 이후 같은 날 무한 재시도하지 않습니다. 저장소 충돌·쓰기 실패 시 호출 전 예약 단계에서 중단합니다. 빌드 artifact는 1일 보관합니다. GitHub 자체 무료 정책이 바뀌는지 계정 알림도 확인하세요.

`data/policy.json`의 무료 확인 유효기간은 2026-11-13까지입니다. 이후 공식 요금표와 AI Studio 프로젝트 등급을 확인하고, 무료 모델 목록·확인일·다음 확인 기한을 갱신해야 합니다. 무료 아닌 모델을 목록에 추가하지 마세요. 환경변수 변경만으로 미검증 모델을 쓰지 못하게 되어 있습니다.

## 10. 품질·출처·저작권

원작 대신 읽을 수 있는 상세 줄거리나 번역을 생성하지 않도록 프롬프트를 제한하고, 긴 동일 표현도 검사합니다. 도서 정체성, 6개 본문, 분량, 출처 ID, 자료 존재, 기존 내용 중복을 코드로 확인합니다. 다음 AI 호출에서는 전체 사실 주장과 자료를 다시 대조하며, 검증 근거 문자열이 실제 수집 텍스트에 있는지도 코드로 검사합니다.

**이 검사는 인간의 사실 확인 또는 저작권 법률 판단을 대체하지 않습니다.** 같은 모델의 재검토는 같은 오류를 놓칠 수 있고, 텍스트 일치 검사는 모든 유사 표현을 잡지 못합니다. 자동 검토를 통과해도 오해가 있을 수 있습니다. 아티클의 독립적 해석과 사실을 구별하고 의심되는 부분은 원문 링크로 확인하세요. 특정 한국어 번역본이나 원문 전체를 저장소에 복제하지 않습니다. 수집 원문은 생성 중 메모리에만 두고, 발행 JSON에는 URL·검증된 주장 목록만 남깁니다.

공개 자료가 있다는 이유만으로 모든 재사용 권리가 생기는 것은 아닙니다. 상업 서비스로 바꾸거나 원작 대체형 콘텐츠를 제공하려면 별도 권리 검토가 필요합니다.

## 11. 파일 구성

```text
app/page.tsx                  화면과 브라우저 기능
app/globals.css               반응형 디자인 / 다크 모드
app/layout.tsx                HTML / 메타데이터
next.config.mjs               정적 export와 하위 경로
scripts/core.mjs              Gemini / 정책 / 사용량 / 검증
scripts/sources.mjs           허용 호스트 / robots / 자료 수집
scripts/generate.mjs          자동 선정 → 수집 → 생성 → 검증 → 저장
scripts/local-server.mjs      로컬 정적 서버
scripts/package-source.mjs    배포용 소스 ZIP 생성
.github/workflows/insight.yml  예약·수동 생성 + Pages 배포
data/articles.json            아티클
data/status.json              최근 생성 상태
data/usage.json               자동 생성 사용량
data/policy.json              무료 모델 허용 목록 / 기한
data/sources.json             공개 자료 호스트 정책
tests/*.test.mjs               비용·품질 차단 + 모의 생성 통합 테스트
```

확인 명령:

```sh
npm test
npm run typecheck
npm run build
```

## 12. 자주 막히는 부분

- **모델 404:** AI Studio에서 이용 가능한 무료 모델을 확인합니다. 모델이 사라졌다면 자동 대체하지 않고 멈춥니다. 공식 문서를 확인해 허용 목록과 환경변수를 함께 수정합니다.
- **403:** 키의 API 제한, 프로젝트 권한, 이용 지역을 확인합니다. 비용을 내서 해결하지 않습니다.
- **429:** 해당 API 작업을 중단합니다. 무료 한도가 회복된 뒤 다시 이용하세요.
- **예약 상태에서 멈춤:** Actions 로그 확인. 실행 취소·실패로 당일 시도를 이미 예약했을 수 있습니다. 다음 날 다시 실행합니다.
- **Pages 404:** Public 저장소인지, Pages Source가 GitHub Actions인지, main 브랜치와 배포 성공 여부를 확인합니다.
- **Git push 실패:** main 쓰기 권한과 보호 규칙을 확인합니다. 다른 사람이 수정한 상태로 자동 재시도하지 않습니다.
- **새 글이 없음:** 설정 → 마지막 시도와 실패 메시지 확인. 자료 부족이면 정상적인 발행 중단입니다. 샘플 날짜가 오늘로 자동 바뀌지 않습니다.
- **북마크가 사라짐:** 브라우저 또는 사이트 주소별 저장입니다. 시크릿 모드 종료·사이트 데이터 삭제 시 없어질 수 있으니 주기적으로 내보내세요.
- **프로세스 중단 후 생성 잠금:** 다른 생성 프로세스가 정말 종료되었는지 확인한 후 `.runtime/generate.lock`만 삭제합니다. 당일 사용량 파일은 초기화하지 마세요.

구현 검증: 정적 빌드·TypeScript·안전장치 및 모의 생성 통합 테스트 9개 통과. 외부 API 응답을 가정한 모의 테스트는 실제 공급자 API 성공을 의미하지 않습니다. 현재 환경에서 실제 브라우저 조작 확인 및 사용자 API 키를 쓰는 end-to-end 실행은 수행하지 않았습니다. 개인 GitHub 계정의 저장소 연결·Secrets 등록·예약 실행은 사용자가 위 절차로 활성화해야 합니다.


### 2026-10-14 수정: 무료 도서 검색 대체 경로

Google Books → Open Library 자동 전환을 추가했습니다. 기존 당일 생성 시도·AI 호출 한도와 사용 기록은 초기화하지 않습니다. Google Books 오류와 Gemini 오류를 구별해서 표시합니다. `scripts/check-books.mjs`는 최대 2회 도서 메타데이터 요청만 수행하는 진단이며, AI 호출·아티클 발행·사용 기록 초기화는 하지 않습니다. 메타데이터 모듈 변경 커밋의 GitHub Actions에서 이 진단을 실행합니다. 해당 단계가 경고로 끝나면 로그를 확인하세요.

Open Library 이용 안내: https://openlibrary.org/developers/api
