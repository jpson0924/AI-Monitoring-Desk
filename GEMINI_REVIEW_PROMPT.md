# Gemini Review Request: Market Signal

아래 프로젝트를 UI/UX, 코드 구조, 확장성 관점에서 리뷰해 주세요.

## 앱 개요

앱 이름: Market Signal

검색어 입력형 앱이 아니라, 외부 뉴스/RSS/테크 블로그를 주기적으로 수집한 뒤 현재 시점의 주요 기술 의제(Agenda)를 뽑아 시각화하는 정적 대시보드 프로토타입입니다.

현재 구현:

- 최근 수집 뉴스 브리핑
- 뉴스 기반 액션 보드: 뉴스에서 할 일, 먼저 읽을 원문, 맥락으로 이어보기
- 최근 뉴스별 `왜 중요한가` 근거, 해시태그, 대표 원문 링크
- 회사별 레이더: 회사 카드, 키워드 워드 클라우드, 히트맵, 추진 키워드 스택
- 키워드별 레이더: 관심도 맵, 기사/기업 움직임 타임라인
- 타임라인 기사 클릭 시 원문 새 탭 열기
- `요약` 또는 카드 클릭 시 Deep Dive 모달
- 국내외 수집 링크 패널
- 매일 아침 `scripts/update-agenda-data.mjs`가 RSS/HTML 소스를 수집해 `agenda-data.js`와 `agenda-data.json`을 생성

## 리뷰받고 싶은 포인트

1. Visual Hierarchy
   - 최근 수집 뉴스 브리핑이 첫 화면에서 가장 먼저 눈에 띄는지
   - `왜 중요한가`, 해시태그, 대표 원문 링크의 정보량이 적절한지
   - 중요도별 폰트 크기, 색상, 배치가 자연스러운지

2. Dashboard UI Detail
   - 회사별/키워드별 탭 전환 경험이 명확한지
   - 워드 클라우드, 히트맵, 타임라인 카드가 대시보드 템플릿으로 충분히 모던한지
   - 카드 UI, 여백, 컬러, 배지, 링크 스타일이 일관적인지

3. Responsive Design
   - 모바일, 태블릿, 데스크톱에서 깨질 가능성이 있는 레이아웃이 있는지
   - 긴 한국어 제목, 긴 영어 링크 제목, 해시태그가 들어올 때 UI가 안정적인지

4. CSS Quality
   - 현재는 Tailwind가 아니라 순수 CSS입니다.
   - 중복 스타일, 과한 selector, 추후 Tailwind로 옮길 때 정리하면 좋을 구조가 있는지 봐주세요.

5. Data/API Extensibility
   - `agenda-data.js` / `agenda-data.json` 형태가 향후 Claude API, OpenAI API, 크롤러, 서버 API와 연결하기 좋은지
   - `app.js`의 렌더링 함수들이 데이터 매핑 구조로 충분히 유지보수 가능한지
   - `scripts/update-agenda-data.mjs`의 수집/스코어링/태그 생성 로직에서 개선할 점이 있는지

## 파일 구조

```text
index.html
styles.css
app.js
agenda-data.js
agenda-data.json
scripts/update-agenda-data.mjs
README.md
```

## 실행 방법

정적 파일로 바로 열기:

```text
index.html
```

로컬 HTTP 미리보기:

```bash
python3 -m http.server 4173 --bind 127.0.0.1
```

데이터 수동 갱신:

```bash
node scripts/update-agenda-data.mjs
```

## 특히 봐줬으면 하는 질문

- 첫 화면에서 "왜 이 뉴스가 한국 AI 사업자에게 중요한지"가 충분히 설득력 있게 전달되나요?
- 해시태그가 도움이 되나요, 아니면 노이즈가 되나요?
- 최근 뉴스 카드의 정보량이 많다면 어떤 정보부터 줄이는 게 좋을까요?
- 타임라인에서 원문 링크와 요약 버튼을 분리한 UX가 직관적인가요?
- 이 앱을 실제 서비스 대시보드로 확장한다면 가장 먼저 고쳐야 할 구조적 문제는 무엇인가요?
