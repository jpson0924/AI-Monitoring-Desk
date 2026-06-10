import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const indexPath = resolve(rootDir, "index.html");
const cssPath = resolve(rootDir, "styles.css");
const appPath = resolve(rootDir, "app.js");
const jsOutputPath = resolve(rootDir, "agenda-data.js");
const jsonOutputPath = resolve(rootDir, "agenda-data.json");
const restoredHtmlPath = resolve(rootDir, "signal-desk-screen-share-restored.html");
const shareHtmlPath = resolve(rootDir, "signal-desk-screen-share.html");
const shareTextPath = resolve(rootDir, "signal-desk-screen-share.txt");
const historyDir = resolve(rootDir, "history");
const KST_OFFSET_MS = 9 * 60 * 60 * 1000;
const DAILY_UPDATE_HOUR_KST = 8;
const DAILY_UPDATE_MINUTE_KST = 20;
const colors = ["#0f8f82", "#3563c8", "#d68419", "#c54b40", "#3f8f4f", "#7a5a26"];

const sources = [
  {
    name: "AI Times",
    region: "KR",
    kind: "RSS",
    url: "https://www.aitimes.com/",
    feed: "https://cdn.aitimes.com/rss/gn_rss_allArticle.xml"
  },
  {
    name: "DigitalToday AI",
    region: "KR",
    kind: "HTML",
    url: "https://www.digitaltoday.co.kr/news/articleList.html?sc_section_code=S1N10&view_type=sm",
    mode: "html"
  },
  {
    name: "Bloter IT",
    region: "KR",
    kind: "HTML",
    url: "https://www.bloter.net/news/articleList.html?sc_section_code=S1N4&view_type=sm",
    mode: "html"
  },
  {
    name: "ZDNet Korea AI",
    region: "KR",
    kind: "HTML",
    url: "https://zdnet.co.kr/search/?kwd=AI",
    mode: "html"
  },
  {
    name: "Google News KR Hot AI",
    region: "KR",
    kind: "Search RSS",
    url: "https://news.google.com/search?q=%EC%A0%A0%EC%8A%A8%20%ED%99%A9%20%EB%B0%A9%ED%95%9C%20OR%20%EC%97%94%EB%B9%84%EB%94%94%EC%95%84%20%ED%95%9C%EA%B5%AD%20OR%20AI%20%EB%B0%98%EB%8F%84%EC%B2%B4%20OR%20%ED%94%BC%EC%A7%80%EC%BB%AC%20AI",
    feed: "https://news.google.com/rss/search?q=%EC%A0%A0%EC%8A%A8%20%ED%99%A9%20%EB%B0%A9%ED%95%9C%20OR%20%EC%97%94%EB%B9%84%EB%94%94%EC%95%84%20%ED%95%9C%EA%B5%AD%20OR%20AI%20%EB%B0%98%EB%8F%84%EC%B2%B4%20OR%20%ED%94%BC%EC%A7%80%EC%BB%AC%20AI&hl=ko&gl=KR&ceid=KR:ko"
  },
  {
    name: "Google News KR NVIDIA Korea",
    region: "KR",
    kind: "Search RSS",
    url: "https://news.google.com/search?q=%22%EC%A0%A0%EC%8A%A8%20%ED%99%A9%22%20%EB%B0%A9%ED%95%9C%20OR%20%EC%97%94%EB%B9%84%EB%94%94%EC%95%84%20%ED%95%9C%EA%B5%AD%20%EB%A1%9C%EB%B3%B4%ED%8B%B1%EC%8A%A4%20OR%20%ED%94%BC%EC%A7%80%EC%BB%AC%20AI%20%ED%95%9C%EA%B5%AD%20OR%20GTC%20%EC%84%9C%EC%9A%B8",
    feed: "https://news.google.com/rss/search?q=%22%EC%A0%A0%EC%8A%A8%20%ED%99%A9%22%20%EB%B0%A9%ED%95%9C%20OR%20%EC%97%94%EB%B9%84%EB%94%94%EC%95%84%20%ED%95%9C%EA%B5%AD%20%EB%A1%9C%EB%B3%B4%ED%8B%B1%EC%8A%A4%20OR%20%ED%94%BC%EC%A7%80%EC%BB%AC%20AI%20%ED%95%9C%EA%B5%AD%20OR%20GTC%20%EC%84%9C%EC%9A%B8&hl=ko&gl=KR&ceid=KR:ko"
  },
  {
    name: "Google News KR Big Tech",
    region: "KR",
    kind: "Search RSS",
    url: "https://news.google.com/search?q=%EC%82%BC%EC%84%B1%20SK%20%EB%84%A4%EC%9D%B4%EB%B2%84%20%EC%B9%B4%EC%B9%B4%EC%98%A4%20%EC%97%94%EB%B9%84%EB%94%94%EC%95%84%20AI%20OR%20Anthropic%20OR%20OpenAI",
    feed: "https://news.google.com/rss/search?q=%EC%82%BC%EC%84%B1%20SK%20%EB%84%A4%EC%9D%B4%EB%B2%84%20%EC%B9%B4%EC%B9%B4%EC%98%A4%20%EC%97%94%EB%B9%84%EB%94%94%EC%95%84%20AI%20OR%20Anthropic%20OR%20OpenAI&hl=ko&gl=KR&ceid=KR:ko"
  },
  {
    name: "Google News KR AI Startup",
    region: "KR",
    kind: "Search RSS",
    url: "https://news.google.com/search?q=%EA%B5%AD%EB%82%B4%20AI%20%EC%8A%A4%ED%83%80%ED%8A%B8%EC%97%85%20%ED%88%AC%EC%9E%90%20OR%20%EB%A1%9C%EB%B4%87%20%EC%8A%A4%ED%83%80%ED%8A%B8%EC%97%85%20OR%20%EC%97%85%EC%8A%A4%ED%85%8C%EC%9D%B4%EC%A7%80%20OR%20%EB%A6%AC%EB%B2%A8%EB%A6%AC%EC%98%A8%20OR%20%ED%93%A8%EB%A6%AC%EC%98%A4%EC%82%AC",
    feed: "https://news.google.com/rss/search?q=%EA%B5%AD%EB%82%B4%20AI%20%EC%8A%A4%ED%83%80%ED%8A%B8%EC%97%85%20%ED%88%AC%EC%9E%90%20OR%20%EB%A1%9C%EB%B4%87%20%EC%8A%A4%ED%83%80%ED%8A%B8%EC%97%85%20OR%20%EC%97%85%EC%8A%A4%ED%85%8C%EC%9D%B4%EC%A7%80%20OR%20%EB%A6%AC%EB%B2%A8%EB%A6%AC%EC%98%A8%20OR%20%ED%93%A8%EB%A6%AC%EC%98%A4%EC%82%AC&hl=ko&gl=KR&ceid=KR:ko"
  },
  {
    name: "Google News KR AI Policy",
    region: "KR",
    kind: "Search RSS",
    url: "https://news.google.com/search?q=%EA%B3%BC%EA%B8%B0%EC%A0%95%ED%86%B5%EB%B6%80%20AI%20OR%20%EA%B0%9C%EC%9D%B8%EC%A0%95%EB%B3%B4%EC%9C%84%20AI%20OR%20%EA%B5%AD%EB%B0%A9%20AI%20OR%20%EC%86%8C%EB%B2%84%EB%A6%B0%20AI",
    feed: "https://news.google.com/rss/search?q=%EA%B3%BC%EA%B8%B0%EC%A0%95%ED%86%B5%EB%B6%80%20AI%20OR%20%EA%B0%9C%EC%9D%B8%EC%A0%95%EB%B3%B4%EC%9C%84%20AI%20OR%20%EA%B5%AD%EB%B0%A9%20AI%20OR%20%EC%86%8C%EB%B2%84%EB%A6%B0%20AI&hl=ko&gl=KR&ceid=KR:ko"
  },
  {
    name: "Naver IT",
    region: "KR",
    kind: "Portal",
    url: "https://news.naver.com/section/105"
  },
  {
    name: "Daum Digital",
    region: "KR",
    kind: "Portal",
    url: "https://news.daum.net/digital"
  },
  {
    name: "The Verge AI",
    region: "Global",
    kind: "RSS",
    url: "https://www.theverge.com/ai-artificial-intelligence",
    feed: "https://www.theverge.com/rss/ai-artificial-intelligence/index.xml"
  },
  {
    name: "TechCrunch AI",
    region: "Global",
    kind: "RSS",
    url: "https://techcrunch.com/category/artificial-intelligence/",
    feed: "https://techcrunch.com/category/artificial-intelligence/feed/"
  },
  {
    name: "OpenAI News",
    region: "Global",
    kind: "RSS",
    url: "https://openai.com/news/",
    feed: "https://openai.com/news/rss.xml"
  },
  {
    name: "Google AI Blog",
    region: "Global",
    kind: "RSS",
    url: "https://blog.google/technology/ai/",
    feed: "https://blog.google/innovation-and-ai/technology/ai/rss/"
  },
  {
    name: "Apple Newsroom",
    region: "Global",
    kind: "RSS",
    url: "https://www.apple.com/newsroom/",
    feed: "https://www.apple.com/newsroom/rss-feed.rss"
  },
  {
    name: "MIT Technology Review",
    region: "Global",
    kind: "RSS",
    url: "https://www.technologyreview.com/",
    feed: "https://www.technologyreview.com/feed/"
  },
  {
    name: "WIRED AI",
    region: "Global",
    kind: "RSS",
    url: "https://www.wired.com/tag/artificial-intelligence/",
    feed: "https://www.wired.com/feed/tag/ai/latest/rss"
  },
  {
    name: "VentureBeat AI",
    region: "Global",
    kind: "RSS",
    url: "https://venturebeat.com/category/ai/",
    feed: "https://venturebeat.com/category/ai/feed/"
  },
  {
    name: "Hacker News",
    region: "Global",
    kind: "RSS",
    url: "https://news.ycombinator.com/",
    feed: "https://news.ycombinator.com/rss"
  }
];

const agendaTerms = [
  {
    id: "agent",
    label: "Agent",
    aliases: ["agent", "agents", "autonomous", "operator", "workflow", "tool use", "computer use"],
    color: "#0f8f82",
    title: "자율형 AI Agent가 업무 실행과 보안 통제의 핵심 의제로 부상",
    summary: "에이전트가 조회를 넘어 실행, 승인, 감사 로그가 필요한 업무 레이어로 이동하고 있습니다.",
    description: "툴 실행, 장시간 작업, 승인 게이트가 함께 언급됩니다.",
    brief: {
      background: "AI Agent가 이메일, 코드, 브라우저, 업무 도구를 직접 다루기 시작하면서 실행 경계가 제품 설계의 중심이 됐습니다.",
      reaction: "플랫폼 기업은 SDK와 런타임을 확장하고, 보안 업계는 샌드박스와 감사 로그를 기본 요구사항으로 제안합니다.",
      implication: "Agent 제품 경쟁은 자동화 범위뿐 아니라 권한 위임, 실패 복구, 승인 UX의 완성도로 갈립니다."
    }
  },
  {
    id: "mcp",
    label: "MCP",
    aliases: ["mcp", "model context protocol", "server", "connector", "integration", "tools"],
    color: "#3563c8",
    title: "MCP와 외부 도구 연결 표준이 AI 앱 생태계 확장의 관문으로 부상",
    summary: "모델과 사내 시스템, 개발 도구, 데이터 소스를 안전하게 연결하는 표준화 흐름이 강해지고 있습니다.",
    description: "외부 시스템 연결 표준으로 빠르게 제품 메시지화되고 있습니다.",
    brief: {
      background: "AI 앱이 단일 챗봇을 넘어 실제 업무 시스템과 연결되면서 표준화된 컨텍스트·툴 프로토콜 수요가 커졌습니다.",
      reaction: "개발자 커뮤니티는 서버 템플릿과 권한 패턴을 빠르게 실험하고, 기업은 내부 데이터 연결의 통제 지점을 검토합니다.",
      implication: "엔터프라이즈 AI 도입은 모델 성능만큼 연결 가능한 시스템 범위와 권한 관리 체계에 좌우됩니다."
    }
  },
  {
    id: "on-device",
    label: "On-Device",
    aliases: ["on-device", "on device", "edge ai", "npu", "local model", "device", "privacy"],
    color: "#d68419",
    title: "온디바이스 AI 경쟁이 NPU, 개인정보, 지연시간 중심으로 재편",
    summary: "모바일, PC, 브라우저 업체가 로컬 추론과 개인정보 보호 메시지를 전면에 세우고 있습니다.",
    description: "모바일, PC, 브라우저에서 로컬 추론 메시지가 강화됩니다.",
    brief: {
      background: "클라우드 추론 비용과 개인정보 규제가 맞물리며 일부 AI 기능을 기기 내부에서 처리하려는 압력이 커졌습니다.",
      reaction: "디바이스 업체는 NPU 성능, 지연시간, 배터리 효율을 묶어 차별화하고 개발자에게 로컬 API를 제공합니다.",
      implication: "서비스 사업자는 클라우드, 엣지, 로컬 모델을 상황별로 라우팅하는 제품 구조를 준비해야 합니다."
    }
  },
  {
    id: "sovereign",
    label: "Sovereign AI",
    aliases: ["sovereign", "national ai", "local cloud", "data sovereignty", "government", "public sector"],
    color: "#3f8f4f",
    title: "Sovereign AI와 로컬 클라우드 연합 전략이 공공·산업 AI 의제로 확대",
    summary: "정부, 통신사, 클라우드 사업자가 데이터 주권과 자체 모델 확보를 같은 전략으로 묶고 있습니다.",
    description: "정부, 통신, 클라우드가 로컬 데이터 주권을 사업화합니다.",
    brief: {
      background: "AI 인프라가 산업 경쟁력과 안보 이슈로 해석되면서 데이터와 컴퓨트를 국내 통제권 안에 두려는 요구가 커졌습니다.",
      reaction: "클라우드 사업자는 현지 리전과 파트너십을 늘리고, 로컬 기업은 산업별 특화 모델과 공공 조달 채널을 노립니다.",
      implication: "글로벌 AI 기업은 지역별 규제, 데이터 거버넌스, 로컬 파트너 번들 전략을 정교화해야 합니다."
    }
  },
  {
    id: "evalops",
    label: "EvalOps",
    aliases: ["eval", "evaluation", "benchmark", "monitoring", "guardrail", "safety", "red team"],
    color: "#c54b40",
    title: "AI 평가와 운영 모니터링이 모델 출시 이후의 핵심 통제면으로 이동",
    summary: "프롬프트 변경, 모델 교체, 툴 추가에 따른 품질 회귀를 감지하려는 수요가 커지고 있습니다.",
    description: "모델 도입 이후의 품질 추적과 회귀 테스트가 중요해집니다.",
    brief: {
      background: "AI 기능이 프로덕션 워크플로에 들어가며 작은 변경도 품질과 규정 준수 리스크로 이어지게 됐습니다.",
      reaction: "플랫폼과 스타트업은 평가 데이터셋, 추적, 실패 재현 기능을 LLMOps의 다음 계층으로 포지셔닝합니다.",
      implication: "AI 제품팀은 출시 전 데모보다 운영 중 회귀 감지와 부서별 품질 기준 관리 능력을 먼저 설계해야 합니다."
    }
  },
  {
    id: "ai-code",
    label: "AI Code",
    aliases: ["code", "coding", "developer", "github", "ide", "pull request", "software engineering"],
    color: "#7a5a26",
    title: "AI 코딩 도구가 IDE 보조를 넘어 저장소 운영과 배포 검증으로 확장",
    summary: "코드 생성보다 이슈 분석, 테스트 수정, PR 리뷰 자동화가 새 관심사로 이동하고 있습니다.",
    description: "코드 생성에서 저장소 운영과 검증 자동화로 관심이 이동합니다.",
    brief: {
      background: "개발자가 생성형 코딩에 익숙해지면서 병목이 코드 작성에서 검증, 리뷰, 배포 신뢰성으로 이동했습니다.",
      reaction: "툴 업체들은 터미널, GitHub, CI를 연결한 장시간 작업 에이전트를 내세우며 팀 단위 생산성 지표를 강조합니다.",
      implication: "기업 도입 판단은 라인 수 증가보다 실패 복구, 테스트 통과율, 보안 리뷰 누락 감소 같은 운영 지표로 옮겨갑니다."
    }
  }
];

const companies = [
  {
    id: "openai",
    name: "OpenAI",
    sector: "Model Platform",
    color: "#3563c8",
    short: "OA",
    focus: "에이전트 플랫폼과 멀티모달",
    terms: ["agent", "evalops", "ai-code", "mcp"],
    agendas: [
      {
        label: "Agent Runtime 표준화",
        term: "agent",
        description: "SDK, 툴 호출, 상태 관리를 묶어 에이전트 앱의 기본 실행 레이어를 장악하려는 흐름입니다.",
        heat: ["Runtime", "Tool Call", "Trace", "Handoff"]
      },
      {
        label: "평가 자동화 내재화",
        term: "evalops",
        description: "모델 교체와 프롬프트 변경 전후 품질 회귀를 플랫폼 안에서 검증하게 만드는 전략입니다.",
        heat: ["Regression", "Eval", "Guardrail", "Trace"]
      },
      {
        label: "개발 워크플로 장악",
        term: "ai-code",
        description: "코드 생성보다 이슈 분석, 테스트 수정, 리뷰까지 이어지는 저장소 운영면으로 확장하고 있습니다.",
        heat: ["Repo Ops", "PR Review", "CI Fix", "IDE"]
      },
      {
        label: "외부 툴 연결성 확보",
        term: "mcp",
        description: "타사 업무 시스템과 데이터 소스를 모델 경험 안으로 끌어오는 연결 표준 경쟁에 대응합니다.",
        heat: ["Connector", "Tool", "Context", "API"]
      }
    ]
  },
  {
    id: "anthropic",
    name: "Anthropic",
    sector: "Model Provider",
    color: "#0f8f82",
    short: "AN",
    focus: "MCP와 에이전트 개발면",
    terms: ["mcp", "agent", "ai-code", "evalops"],
    agendas: [
      {
        label: "MCP 생태계 선점",
        term: "mcp",
        description: "Claude가 업무 시스템과 연결되는 기본 통로를 MCP 서버와 커넥터 생태계로 넓히고 있습니다.",
        heat: ["MCP Server", "Connector", "Tool Use", "Permission"]
      },
      {
        label: "Claude Code 운영화",
        term: "ai-code",
        description: "IDE 보조를 넘어 터미널, 저장소, 테스트 수정까지 맡는 개발 운영 도구로 포지셔닝합니다.",
        heat: ["Claude Code", "Terminal", "Repo", "Test"]
      },
      {
        label: "권한 있는 Tool Use",
        term: "agent",
        description: "에이전트가 실제 업무를 실행할 때 승인, 권한 범위, 감사 로그를 제품 차별점으로 밀고 있습니다.",
        heat: ["Approval", "Audit", "Desktop", "Agent"]
      },
      {
        label: "안전성 평가 메시지",
        term: "evalops",
        description: "기업 도입의 불안을 줄이기 위해 모델 성능보다 실패 경계와 평가 체계를 함께 강조합니다.",
        heat: ["Safety Eval", "Red Team", "Policy", "Logs"]
      }
    ]
  },
  {
    id: "google",
    name: "Google",
    sector: "Cloud & Search",
    color: "#d68419",
    short: "GO",
    focus: "검색 재구성과 온디바이스",
    terms: ["on-device", "agent", "evalops", "sovereign"],
    agendas: [
      {
        label: "검색 수익모델 재설계",
        term: "agent",
        description: "AI 답변, 쇼핑, 광고가 한 화면에 섞이면서 검색 UX와 수익 배분이 동시에 흔들리고 있습니다.",
        heat: ["AI Search", "Ads", "Shopping", "Overview"]
      },
      {
        label: "Gemini 온디바이스화",
        term: "on-device",
        description: "Android와 Chrome 안에서 지연시간, 프라이버시, 로컬 개인화를 묶어 차별화하려는 흐름입니다.",
        heat: ["Gemini Nano", "Android", "Chrome", "NPU"]
      },
      {
        label: "TPU 원가 우위 방어",
        term: "evalops",
        description: "모델 경쟁을 클라우드 인프라 비용과 TPU 스택 락인으로 연결해 장기 원가 경쟁력을 지키려 합니다.",
        heat: ["TPU", "Vertex", "Cost", "Cloud"]
      },
      {
        label: "지역 AI 클라우드 패키징",
        term: "sovereign",
        description: "각국 데이터 주권 요구에 맞춰 클라우드 리전, 파트너, 모델 제공 방식을 현지화합니다.",
        heat: ["Region", "Gov", "Local Cloud", "Data"]
      }
    ]
  },
  {
    id: "apple",
    name: "Apple",
    sector: "Device & OS",
    color: "#5b6472",
    short: "AP",
    focus: "온디바이스 AI와 OS 배포면",
    terms: ["on-device", "agent", "evalops", "ai-code"],
    agendas: [
      {
        label: "Apple Intelligence 배포면",
        term: "on-device",
        description: "iPhone, iPad, Mac 기본 OS에 AI 기능이 들어가면 소비자 접점의 기본 기대치가 바뀝니다.",
        heat: ["Apple Intelligence", "iOS", "macOS", "On-device"]
      },
      {
        label: "Siri 에이전트화",
        term: "agent",
        description: "Siri와 앱 인텐트가 실제 작업 실행으로 확장되면 모바일 에이전트 UX의 기준점이 됩니다.",
        heat: ["Siri", "App Intents", "Agent", "Mobile"]
      },
      {
        label: "Private Cloud Compute",
        term: "evalops",
        description: "개인 데이터와 클라우드 추론을 함께 쓰는 구조에서 프라이버시와 감사 가능성이 차별점이 됩니다.",
        heat: ["Privacy", "PCC", "Audit", "Safety"]
      },
      {
        label: "개발자 AI API 잠금",
        term: "ai-code",
        description: "앱 개발자가 Apple의 OS AI API를 쓰게 되면 배포 채널과 사용자 경험의 통제력이 커집니다.",
        heat: ["Developer API", "App Store", "Xcode", "SDK"]
      }
    ]
  },
  {
    id: "naver",
    name: "Naver",
    sector: "Korea Platform",
    color: "#3f8f4f",
    short: "NV",
    focus: "AI 팩토리와 소버린 클라우드",
    terms: ["sovereign", "on-device", "agent", "evalops"],
    agendas: [
      {
        label: "AI 팩토리·GPU 조달 전선",
        term: "sovereign",
        description: "정부 GPU 사업, 엔비디아 협력, 네이버클라우드 운영 역량이 국내 AI 인프라 영업 기회로 이어지는지 봐야 합니다.",
        heat: ["AI Factory", "GPU", "NVIDIA", "Cloud"]
      },
      {
        label: "하이퍼클로바 산업 패키지",
        term: "evalops",
        description: "한국어 모델과 검색·커머스 데이터를 산업별 업무 패키지로 묶어 글로벌 범용 모델과 차별화할 수 있습니다.",
        heat: ["HyperCLOVA", "Korean Data", "Commerce", "Quality"]
      },
      {
        label: "검색·커머스 AI 수익화",
        term: "agent",
        description: "검색, 쇼핑, 광고 추천을 생성형 응답 안에서 재배치해 플랫폼 체류와 거래 전환을 노립니다.",
        heat: ["Search", "Shopping", "Ads", "Creator"]
      },
      {
        label: "온디바이스 협력 가능성",
        term: "on-device",
        description: "모바일, 브라우저, 차량 등 한국어 개인화가 필요한 접점에서 로컬 추론 파트너십 여지가 있습니다.",
        heat: ["Mobile", "Browser", "Vehicle", "Personalization"]
      }
    ]
  },
  {
    id: "kakao",
    name: "Kakao",
    sector: "Korea Platform",
    color: "#8a6d1f",
    short: "KK",
    focus: "메신저 기반 AI와 커머스",
    terms: ["agent", "evalops", "sovereign", "ai-code"],
    agendas: [
      {
        label: "카카오톡 AI 접점 확대",
        term: "agent",
        description: "메신저, 채널, 커머스 안에서 AI가 예약, 상담, 추천 같은 실행 흐름으로 들어갈 여지가 큽니다.",
        heat: ["KakaoTalk", "Channel", "Commerce", "Assistant"]
      },
      {
        label: "개인화 데이터 안전성",
        term: "evalops",
        description: "대화와 생활 데이터 기반 서비스가 커질수록 동의, 보관, 추천 품질 관리가 핵심 리스크가 됩니다.",
        heat: ["Consent", "Privacy", "Personalization", "Quality"]
      },
      {
        label: "로컬 플랫폼 방어",
        term: "sovereign",
        description: "글로벌 AI 앱이 국내 생활 플랫폼 접점을 잠식하지 못하도록 로컬 맥락과 제휴 자산을 묶어야 합니다.",
        heat: ["Local Context", "Partner", "Map", "Payment"]
      },
      {
        label: "창작·광고 자동화",
        term: "ai-code",
        description: "콘텐츠 제작, 광고 문안, 쇼핑 운영 자동화가 소상공인과 브랜드 고객의 지불 의사로 이어질 수 있습니다.",
        heat: ["Creator", "Ad", "Shopping", "SMB"]
      }
    ]
  },
  {
    id: "sktelecom",
    name: "SK Telecom",
    sector: "Telco AI",
    color: "#c54b40",
    short: "SK",
    focus: "통신 AI와 데이터센터",
    terms: ["agent", "on-device", "sovereign", "evalops"],
    agendas: [
      {
        label: "통신형 AI 에이전트",
        term: "agent",
        description: "통화, 일정, 고객센터, 멤버십 접점을 묶어 통신사형 개인·기업 에이전트로 확장할 수 있습니다.",
        heat: ["A.", "Call", "Membership", "Agent"]
      },
      {
        label: "GW급 AIDC 사업화",
        term: "sovereign",
        description: "GPU, 전력, 네트워크를 결합한 대규모 AI 데이터센터 수요를 통신 자산으로 흡수하려는 흐름입니다.",
        heat: ["AIDC", "GW Scale", "GPU", "Power"]
      },
      {
        label: "AI 팩토리·디지털 트윈 협력",
        term: "on-device",
        description: "제조 현장과 반도체 공정에 AI 시뮬레이션, 네트워크, 디지털 트윈을 붙여 B2B 레퍼런스를 만들 수 있습니다.",
        heat: ["AI Factory", "Digital Twin", "Semiconductor", "NVIDIA"]
      },
      {
        label: "엔터프라이즈 AX 패키징",
        term: "evalops",
        description: "기업 고객에게 모델보다 상담, 보안, 품질 운영을 묶은 AX 패키지로 판매하는 전략이 중요합니다.",
        heat: ["AX", "AICC", "Security", "Ops"]
      }
    ]
  },
  {
    id: "samsung",
    name: "Samsung",
    sector: "Device & Chip",
    color: "#3563c8",
    short: "SS",
    focus: "온디바이스 AI와 반도체",
    terms: ["on-device", "evalops", "agent", "sovereign"],
    agendas: [
      {
        label: "Galaxy AI 온디바이스화",
        term: "on-device",
        description: "스마트폰의 실시간 번역, 요약, 개인화 기능이 로컬 추론과 프라이버시 메시지의 대표 접점입니다.",
        heat: ["Galaxy AI", "NPU", "Privacy", "Mobile"]
      },
      {
        label: "HBM 이후 AI 팩토리 공급망",
        term: "on-device",
        description: "HBM, 메모리, 파운드리 수요가 AI 팩토리 구축과 서비스 원가 안정성을 좌우하는 사업 변수입니다.",
        heat: ["HBM", "Memory", "Foundry", "AI Factory"]
      },
      {
        label: "가전·로봇 피지컬 AI 접점",
        term: "agent",
        description: "TV, 가전, 로봇이 생활 공간의 AI 인터페이스가 되면 피지컬 AI 서비스 번들과 데이터 접점이 새로 열립니다.",
        heat: ["Physical AI", "Robot", "TV", "Appliance"]
      },
      {
        label: "기기 내 데이터 거버넌스",
        term: "evalops",
        description: "개인 데이터가 기기에서 처리될수록 모델 업데이트, 권한, 안전성 평가 체계가 구매 조건이 됩니다.",
        heat: ["On-device Eval", "Permission", "Update", "Safety"]
      }
    ]
  },
  {
    id: "lgai",
    name: "LG AI Research",
    sector: "Industrial AI",
    color: "#9a3f5d",
    short: "LG",
    focus: "산업 특화 모델과 제조 AI",
    terms: ["evalops", "agent", "sovereign", "on-device"],
    agendas: [
      {
        label: "EXAONE 산업 모델",
        term: "evalops",
        description: "범용 챗봇보다 제조, 화학, 바이오 같은 그룹 산업 데이터를 잘 다루는 특화 모델 전략입니다.",
        heat: ["EXAONE", "Manufacturing", "Chemistry", "Bio"]
      },
      {
        label: "제조 현장 자동화",
        term: "agent",
        description: "품질 검사, 설비 이상 탐지, 작업자 지원을 AI 에이전트형 업무 흐름으로 바꾸는 영역입니다.",
        heat: ["Inspection", "Factory", "Anomaly", "Workflow"]
      },
      {
        label: "기업 데이터 폐쇄망",
        term: "sovereign",
        description: "민감한 산업 데이터는 클라우드보다 사내망과 전용 모델 운영 요구가 강해질 수 있습니다.",
        heat: ["Private Data", "On-prem", "Governance", "B2B"]
      },
      {
        label: "멀티모달 R&D",
        term: "on-device",
        description: "이미지, 센서, 문서 데이터를 함께 읽는 모델이 산업 AI 정확도와 자동화 범위를 넓힙니다.",
        heat: ["Vision", "Sensor", "Document", "Multimodal"]
      }
    ]
  },
  {
    id: "kt",
    name: "KT",
    sector: "Telco Cloud",
    color: "#7a5a26",
    short: "KT",
    focus: "통신 AX와 공공 클라우드",
    terms: ["agent", "sovereign", "evalops", "on-device"],
    agendas: [
      {
        label: "AICC·상담 자동화",
        term: "agent",
        description: "콜센터, 영업, 고객 응대를 AI가 처리하면서 통신사의 B2B AX 매출화가 빨라질 수 있습니다.",
        heat: ["AICC", "Contact Center", "Sales", "Agent"]
      },
      {
        label: "공공·금융 AI 클라우드",
        term: "sovereign",
        description: "국내 데이터 보관과 보안 요구가 강한 고객에게 로컬 클라우드와 모델 운영을 묶어 제안합니다.",
        heat: ["Public", "Finance", "Cloud", "Compliance"]
      },
      {
        label: "망 데이터 기반 품질 운영",
        term: "evalops",
        description: "네트워크와 고객 운영 데이터를 AI 서비스 품질, 장애 예측, 보안 운영으로 연결할 수 있습니다.",
        heat: ["Network Data", "Ops", "SOC", "Quality"]
      },
      {
        label: "엣지 AI 접점",
        term: "on-device",
        description: "통신망과 엣지 인프라를 활용하면 지연시간이 중요한 산업 현장 AI에 강점이 생깁니다.",
        heat: ["Edge", "5G", "Latency", "Factory"]
      }
    ]
  },
  {
    id: "upstage",
    name: "Upstage",
    sector: "AI Startup",
    color: "#0f8f82",
    short: "UP",
    focus: "문서 AI와 기업 LLM",
    terms: ["ai-code", "agent", "evalops", "sovereign"],
    agendas: [
      {
        label: "문서 AI 업무 자동화",
        term: "agent",
        description: "계약서, 청구서, 내부 문서 처리 자동화는 기업이 바로 비용 절감을 체감하는 AI 영역입니다.",
        heat: ["Document AI", "OCR", "Invoice", "Contract"]
      },
      {
        label: "Solar LLM 기업 API",
        term: "sovereign",
        description: "한국어와 기업 문서에 최적화된 모델 API로 글로벌 모델 의존도를 낮추는 선택지가 됩니다.",
        heat: ["Solar", "Korean LLM", "API", "Enterprise"]
      },
      {
        label: "평가 기반 도입 설득",
        term: "evalops",
        description: "벤치마크와 PoC 결과를 구매 논리로 연결해야 스타트업의 엔터프라이즈 영업이 쉬워집니다.",
        heat: ["Benchmark", "PoC", "Accuracy", "Eval"]
      },
      {
        label: "개발자 워크플로 연동",
        term: "ai-code",
        description: "문서, 검색, API를 개발자 친화적으로 붙이면 기업 내부 AI 앱 생태계에 진입할 수 있습니다.",
        heat: ["API", "SDK", "Search", "Workflow"]
      }
    ]
  },
  {
    id: "rebellions",
    name: "Rebellions",
    sector: "AI Semiconductor",
    color: "#d68419",
    short: "RB",
    focus: "국산 AI 가속기와 추론 원가",
    terms: ["on-device", "sovereign", "evalops", "agent"],
    agendas: [
      {
        label: "국산 AI 칩 공급",
        term: "on-device",
        description: "국내 데이터센터의 추론 원가와 공급망 리스크를 낮추는 대안으로 AI 가속기 수요가 커집니다.",
        heat: ["AI Chip", "Inference", "NPU", "Datacenter"]
      },
      {
        label: "통신·클라우드 협력",
        term: "sovereign",
        description: "통신사와 클라우드 사업자가 국산 칩을 채택하면 소버린 AI 인프라 논리가 강해집니다.",
        heat: ["Telco", "Cloud", "Sovereign", "Rack"]
      },
      {
        label: "모델 최적화 생태계",
        term: "evalops",
        description: "칩 성능은 모델 압축, 서빙, 벤치마크 툴과 묶일 때 실제 구매 이유가 됩니다.",
        heat: ["Optimization", "Serving", "Benchmark", "SDK"]
      },
      {
        label: "온프레미스 AI 수요",
        term: "agent",
        description: "보안이 민감한 기업은 사내망 추론과 전용 하드웨어를 함께 요구할 가능성이 높습니다.",
        heat: ["On-prem", "Private AI", "Security", "B2B"]
      }
    ]
  },
  {
    id: "furiosa",
    name: "FuriosaAI",
    sector: "AI Semiconductor",
    color: "#3f8f4f",
    short: "FA",
    focus: "저전력 추론 칩",
    terms: ["on-device", "evalops", "sovereign", "agent"],
    agendas: [
      {
        label: "저전력 추론 원가",
        term: "on-device",
        description: "GPU 의존도가 높아질수록 전력 대비 추론 성능은 AI 서비스 마진의 핵심 지표가 됩니다.",
        heat: ["Low Power", "Inference", "TCO", "Server"]
      },
      {
        label: "서버 생태계 확장",
        term: "sovereign",
        description: "국산 칩이 서버, 클라우드, SI 파트너와 묶여야 실제 도입 가능한 인프라 대안이 됩니다.",
        heat: ["Server", "Cloud", "Partner", "Deployment"]
      },
      {
        label: "벤치마크 신뢰 확보",
        term: "evalops",
        description: "칩 도입은 성능 수치보다 실제 모델 워크로드에서 검증된 벤치마크와 안정성이 중요합니다.",
        heat: ["Benchmark", "Workload", "Stability", "SDK"]
      },
      {
        label: "전용 AI 어플라이언스",
        term: "agent",
        description: "보안과 지연시간이 중요한 현장형 AI 서비스는 전용 장비와 모델 번들로 팔릴 수 있습니다.",
        heat: ["Appliance", "Edge", "Factory", "Private"]
      }
    ]
  },
  {
    id: "wrtn",
    name: "Wrtn",
    sector: "AI Service",
    color: "#7b61c9",
    short: "WR",
    focus: "개인·소상공인 AI 앱",
    terms: ["agent", "ai-code", "evalops", "sovereign"],
    agendas: [
      {
        label: "B2C AI 슈퍼앱",
        term: "agent",
        description: "검색, 작성, 요약, 자동화를 한 앱 안에 묶어 일반 사용자 접점을 넓히는 전략입니다.",
        heat: ["Super App", "Search", "Write", "Automation"]
      },
      {
        label: "소상공인 업무 자동화",
        term: "agent",
        description: "마케팅 문구, 고객 응대, 예약, 콘텐츠 운영은 작지만 반복적인 지불 의사가 있는 영역입니다.",
        heat: ["SMB", "Marketing", "CS", "Reservation"]
      },
      {
        label: "콘텐츠 생성 워크플로",
        term: "ai-code",
        description: "이미지, 영상, 문서 생성 기능을 업무 흐름으로 묶을 때 단순 챗봇보다 체류와 전환이 커집니다.",
        heat: ["Content", "Image", "Video", "Workflow"]
      },
      {
        label: "사용자 데이터 신뢰",
        term: "evalops",
        description: "개인 업무 데이터를 다루는 서비스일수록 보관, 삭제, 추천 투명성 메시지가 중요합니다.",
        heat: ["User Data", "Trust", "Deletion", "Consent"]
      }
    ]
  },
  {
    id: "fasoo",
    name: "Fasoo AI",
    sector: "Security AI",
    color: "#c54b40",
    short: "FS",
    focus: "문서 보안과 기업 AX",
    terms: ["evalops", "agent", "sovereign", "ai-code"],
    agendas: [
      {
        label: "문서 보안 AI",
        term: "evalops",
        description: "기업 문서와 민감정보를 AI가 다룰 때 접근권한, 추적, 유출 방지가 구매 조건이 됩니다.",
        heat: ["DRM", "DLP", "Audit", "Policy"]
      },
      {
        label: "글로벌 AX 영업",
        term: "agent",
        description: "미국 법인과 파트너를 통해 제조, 금융, 공공 고객의 업무 자동화 수요를 공략합니다.",
        heat: ["AX", "US", "Manufacturing", "Finance"]
      },
      {
        label: "데이터 거버넌스 번들",
        term: "sovereign",
        description: "AI 도입 전 데이터 분류, 권한, 보존 정책을 정리하는 보안 번들이 중요해집니다.",
        heat: ["Governance", "Classification", "Retention", "Permission"]
      },
      {
        label: "문서 워크플로 자동화",
        term: "ai-code",
        description: "검토, 요약, 승인, 배포를 문서 보안 체계 안에서 자동화하면 기존 고객 기반을 확장할 수 있습니다.",
        heat: ["Review", "Summary", "Approval", "Workflow"]
      }
    ]
  },
  {
    id: "microsoft",
    name: "Microsoft",
    sector: "Enterprise Stack",
    color: "#c54b40",
    short: "MS",
    focus: "Copilot 운영면과 보안",
    terms: ["agent", "evalops", "ai-code", "mcp"],
    agendas: [
      {
        label: "Copilot 업무 레이어화",
        term: "agent",
        description: "Office, Teams, Windows의 반복 업무를 Copilot 액션으로 묶어 기업 기본 업무면을 넓힙니다.",
        heat: ["Office", "Teams", "Workflow", "Agent"]
      },
      {
        label: "Graph Grounding 강화",
        term: "mcp",
        description: "메일, 문서, 일정, 권한 정보를 Graph로 묶어 기업 내부 문맥을 모델 응답의 핵심 자산으로 만듭니다.",
        heat: ["Graph", "Identity", "Context", "Permission"]
      },
      {
        label: "보안 Copilot 확장",
        term: "evalops",
        description: "SOC, Defender, 감사 로그를 결합해 에이전트 도입에서 가장 먼저 예산이 붙는 보안 영역을 공략합니다.",
        heat: ["SOC", "Defender", "Audit", "Policy"]
      },
      {
        label: "개발자 플랫폼 방어",
        term: "ai-code",
        description: "GitHub와 Azure DevOps를 통해 코드 작성 이후 리뷰, 테스트, 배포 검증까지 묶어두려 합니다.",
        heat: ["GitHub", "Azure DevOps", "Review", "CI"]
      }
    ]
  }
];

const companyPriority = [
  "naver",
  "kakao",
  "sktelecom",
  "samsung",
  "lgai",
  "kt",
  "upstage",
  "rebellions",
  "furiosa",
  "wrtn",
  "fasoo",
  "openai",
  "anthropic",
  "google",
  "apple",
  "microsoft"
];

function decodeXml(value = "") {
  return value
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tag(block, name) {
  const match = block.match(new RegExp(`<${name}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${name}>`, "i"));
  return match ? decodeXml(match[1]) : "";
}

function escapeRegExp(value = "") {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function keywordMatches(haystack, keyword) {
  const lowered = keyword.toLowerCase();
  if (!/[a-z0-9]/.test(lowered)) return haystack.includes(lowered);
  const needsBoundary = lowered.length <= 4 || /^[a-z0-9&.+-]+(?:\s+[a-z0-9&.+-]+)*$/.test(lowered);
  if (!needsBoundary) return haystack.includes(lowered);
  return new RegExp(`(^|[^a-z0-9])${escapeRegExp(lowered)}($|[^a-z0-9])`, "i").test(haystack);
}

function stripKnownSourceSuffix(value = "", source = "") {
  const sourcePattern = source ? new RegExp(`\\s+-\\s+${escapeRegExp(source)}$`, "i") : null;
  return String(value)
    .replace(sourcePattern || /$a/, "")
    .replace(/\s+-\s+(?:v\.daum\.net|m\.news\.naver\.com|news\.naver\.com|네이버뉴스|naver news|google news|daum|다음뉴스)$/i, "");
}

function attrFromTag(block = "", tagName = "", attrName = "") {
  const tagMatch = block.match(new RegExp(`<${tagName}\\b([^>]*)>`, "i"));
  if (!tagMatch) return "";
  const attrMatch = tagMatch[1].match(new RegExp(`${attrName}=["']([^"']+)["']`, "i"));
  return attrMatch ? decodeXml(attrMatch[1]) : "";
}

function imageFromHtml(value = "") {
  const imgMatch = decodeXml(value).match(/<img\b[^>]*\bsrc=["']([^"']+)["']/i);
  return imgMatch ? decodeXml(imgMatch[1]) : "";
}

function usableImageUrl(url = "") {
  const imageUrl = String(url).trim();
  if (!/^https?:\/\//i.test(imageUrl)) return "";
  if (/(?:spacer|sprite|blank|1x1|transparent|logo|favicon|profile_photo)/i.test(imageUrl)) return "";
  return imageUrl;
}

function imageFromFeedBlock(block = "", summary = "") {
  return (
    usableImageUrl(attrFromTag(block, "media:content", "url")) ||
    usableImageUrl(attrFromTag(block, "media:thumbnail", "url")) ||
    usableImageUrl(attrFromTag(block, "enclosure", "url")) ||
    usableImageUrl(imageFromHtml(summary)) ||
    ""
  );
}

function parseFeed(xml, sourceName) {
  const blocks = [...xml.matchAll(/<item[\s\S]*?<\/item>/gi)].map((match) => match[0]);
  const entries = blocks.length ? blocks : [...xml.matchAll(/<entry[\s\S]*?<\/entry>/gi)].map((match) => match[0]);

  return entries
    .map((block) => {
      const rawLink = tag(block, "link");
      const hrefMatch = block.match(/<link[^>]+href="([^"]+)"/i);
      const published = tag(block, "pubDate") || tag(block, "updated") || tag(block, "published");
      const publishedAt = published ? new Date(published) : new Date();
      const source = tag(block, "source") || sourceName;
      const summary = tag(block, "description") || tag(block, "summary") || tag(block, "content:encoded");
      return {
        source,
        title: cleanTitle(stripKnownSourceSuffix(tag(block, "title"), source)),
        summary,
        link: hrefMatch ? hrefMatch[1] : rawLink,
        imageUrl: imageFromFeedBlock(block, summary),
        publishedAt: Number.isNaN(publishedAt.getTime()) ? new Date() : publishedAt
      };
    })
    .filter((item) => item.title);
}

function absoluteUrl(url, baseUrl) {
  try {
    return new URL(url, baseUrl).toString();
  } catch {
    return "";
  }
}

function attrsFromTag(tagHtml = "") {
  const attrs = {};
  for (const match of tagHtml.matchAll(/([:\w-]+)\s*=\s*["']([^"']*)["']/g)) {
    attrs[match[1].toLowerCase()] = decodeXml(match[2]);
  }
  return attrs;
}

function imageFromArticleHtml(html = "", baseUrl = "") {
  const candidates = [];
  const metaKeys = new Set(["og:image", "og:image:url", "twitter:image", "twitter:image:src", "thumbnail", "image"]);

  for (const match of html.matchAll(/<meta\b[^>]*>/gi)) {
    const attrs = attrsFromTag(match[0]);
    const key = String(attrs.property || attrs.name || attrs.itemprop || "").toLowerCase();
    if (metaKeys.has(key) && attrs.content) candidates.push(attrs.content);
  }

  for (const match of html.matchAll(/<link\b[^>]*>/gi)) {
    const attrs = attrsFromTag(match[0]);
    if (String(attrs.rel || "").toLowerCase() === "image_src" && attrs.href) candidates.push(attrs.href);
  }

  for (const match of html.matchAll(/"image"\s*:\s*(?:"([^"]+)"|\[\s*"([^"]+)")/gi)) {
    candidates.push(match[1] || match[2]);
  }

  for (const candidate of candidates) {
    const imageUrl = usableImageUrl(absoluteUrl(candidate, baseUrl));
    if (imageUrl) return imageUrl;
  }

  return "";
}

async function fetchArticleImage(url = "") {
  if (!url) return "";
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 9000);
  try {
    const response = await fetch(url, {
      headers: { "user-agent": "MarketSignalBot/1.0" },
      signal: controller.signal
    });
    if (!response.ok) return "";
    const contentType = response.headers.get("content-type") || "";
    if (contentType && !/html|xml|text/i.test(contentType)) return "";
    const html = await response.text();
    return imageFromArticleHtml(html, response.url || url);
  } catch {
    return "";
  } finally {
    clearTimeout(timeout);
  }
}

function weakImageUrl(url = "") {
  return /(?:news\.google|googleusercontent\.com|gstatic\.com)/i.test(url);
}

function cleanTitle(value) {
  const cleaned = decodeXml(value)
    .replace(/^\[[^\]]+\]\s*/g, "")
    .replace(/^[가-힣]{2,4}\s?기자\s*/g, "")
    .replace(/\s+-\s+(?:v\.daum\.net|m\.news\.naver\.com|news\.naver\.com|네이버뉴스|naver news|google news|daum|다음뉴스)$/i, "")
    .replace(/\s+/g, " ")
    .trim();
  if (cleaned.length <= 96) return cleaned;
  const sentenceMatch = cleaned.slice(0, 120).match(/[.!?。]|다\./);
  if (sentenceMatch && sentenceMatch.index > 28 && sentenceMatch.index < 96) {
    return cleaned.slice(0, sentenceMatch.index + sentenceMatch[0].length);
  }
  return `${cleaned.slice(0, 92).trim()}...`;
}

function truncateSentence(value = "", max = 168) {
  const text = decodeXml(value)
    .replace(/^\[[^\]]+\]\s*/g, "")
    .replace(/^[가-힣]{2,4}\s?기자\s*/g, "")
    .replace(/\s+-\s+(?:v\.daum\.net|m\.news\.naver\.com|news\.naver\.com|네이버뉴스|naver news|google news|daum|다음뉴스)$/i, "")
    .replace(/\s+/g, " ")
    .trim();
  if (text.length <= max) return text;
  const head = text.slice(0, max);
  const sentenceEnds = [head.lastIndexOf("."), head.lastIndexOf("다."), head.lastIndexOf("?"), head.lastIndexOf("!")];
  const sentenceEnd = Math.max(...sentenceEnds);
  if (sentenceEnd > 72) return head.slice(0, sentenceEnd + 1).trim();
  return `${head.replace(/[,\s·…~\-–—]+$/g, "").trim()}...`;
}

const articleFrames = [
  {
    pattern: /젠슨|jensen|huang|엔비디아|nvidia|피지컬\s*ai|로보틱스|로봇/i,
    topic: "엔비디아·피지컬 AI 협력",
    detail: "엔비디아의 한국 파트너십이 GPU 공급, AI 팩토리, 로봇·게임·제조 협력으로 실제 전환되는지 봐야 하는 신호입니다.",
    why: "단순 행사성 노출인지, 국내 기업의 제품·인프라 로드맵을 바꿀 협력인지 구분해야 합니다.",
    next: "NVIDIA 의존 기능, 대체 인프라, 공동 PoC 후보를 한 표로 정리하세요.",
    reaction: "국내 플랫폼, 통신, 제조 기업이 AI 팩토리와 피지컬 AI 협력 범위를 빠르게 비교하고 있습니다."
  },
  {
    pattern: /ai\s*(?:반도체|칩)|hbm|gpu|npu|가속기|ai\s*팩토리|데이터센터|aipc/i,
    topic: "AI 인프라·반도체 수급",
    detail: "AI 서비스의 원가와 출시 속도를 좌우하는 GPU, HBM, NPU, AI 팩토리 조달 신호입니다.",
    why: "모델 성능보다 인프라 확보 조건과 추론 단가가 사업성 판단의 병목이 될 수 있습니다.",
    next: "GPU/NPU 조달안, 클라우드 단가, 서비스별 추론비 민감도를 업데이트하세요.",
    reaction: "대기업과 스타트업이 엔비디아 의존도, 국산 칩 대안, 클라우드 조달 조건을 함께 검토하고 있습니다."
  },
  {
    pattern: /과기정통부|정부|공공|정책|규제|조달|국산|소버린|k-ai/i,
    topic: "정책·공공 조달",
    detail: "정부 정책, 공공 조달, 국산 AI 인프라가 국내 AI 사업 기회로 연결되는 신호입니다.",
    why: "예산과 조달 조건이 생기면 기술 우위보다 인증, 레퍼런스, 국내 데이터 처리 요건이 앞에 옵니다.",
    next: "공공 제안서에 필요한 보안 인증, 국내 데이터 처리, 레퍼런스 항목을 점검하세요.",
    reaction: "국내 플랫폼, SI, 클라우드 기업이 정책 예산과 산업별 레퍼런스를 묶어 영업 포인트로 삼고 있습니다."
  },
  {
    pattern: /보안|kisa|개인정보|유출|위협|감사|권한|통제|복원력|사이버/i,
    topic: "AI 보안·감사",
    detail: "AI 도입 심사에서 권한 통제, 감사 로그, 보안 검증이 구매 조건으로 올라오는 신호입니다.",
    why: "AI가 업무 시스템에 연결될수록 기능 데모보다 사고 대응과 통제 화면이 먼저 검토됩니다.",
    next: "관리자 승인, 감사 로그, 데이터 반출 통제 화면을 영업 자료 앞단에 배치하세요.",
    reaction: "기업 고객은 PoC 단계부터 보안 체크리스트와 운영 책임 범위를 요구하기 시작했습니다."
  },
  {
    pattern: /ax|엔터프라이즈|파트너|협력|클라우드|도입|상용화|솔루션|lg cns|델|microsoft|anthropic|openai/i,
    topic: "엔터프라이즈 AX 상용화",
    detail: "AI가 실험용 챗봇을 넘어 파트너 영업, 클라우드 현대화, 업무 전환 패키지로 팔리는 신호입니다.",
    why: "고객은 모델 이름보다 어느 업무에 붙고, 누가 운영하며, 어느 파트너가 책임지는지를 봅니다.",
    next: "우리 제품의 적용 업무, 운영 책임, 파트너 번들 가능성을 1페이지로 정리하세요.",
    reaction: "SI, 클라우드, 보안 파트너들이 모델 API를 실제 업무 전환 패키지로 재포장하고 있습니다."
  }
];

function agendaImageForArticle(article) {
  const feedImage = usableImageUrl(article.imageUrl);
  if (feedImage) {
    return {
      imageUrl: feedImage,
      imageAlt: `${article.source} 기사 관련 이미지`,
      imageCredit: article.source
    };
  }
  return {
    imageUrl: "",
    imageAlt: "",
    imageCredit: ""
  };
}

function articleFrame(article) {
  const haystack = `${article.title} ${article.summary} ${article.source}`;
  return (
    articleFrames.find((frame) => frame.pattern.test(haystack)) || {
      topic: "AI 사업 신호",
      detail: "AI 시장의 제품, 인프라, 규제, 파트너십 중 하나가 움직이는 기사입니다.",
      why: "제목만 보고 넘기기보다 고객 제안, 제품 로드맵, 파트너십에 미치는 영향을 분리해야 합니다.",
      next: "원문에서 발표 주체, 적용 산업, 후속 계약 가능성을 확인하세요.",
      reaction: "관련 기업들이 제품 메시지와 영업 포인트를 조정할 수 있는 신호로 해석됩니다."
    }
  );
}

function articleSpecificSignal(article, frame) {
  const haystack = `${article.title} ${article.summary} ${article.source}`.toLowerCase();
  const rules = [
    {
      pattern: /쇼맨십|게임회동|뒷얘기|삼겹살|회동/i,
      detail:
        "행사성 회동과 실제 피지컬 AI 협력 사이의 간극을 짚는 신호입니다. 후속 발표가 제품 계약, GPU 공급, 공동 PoC로 이어졌는지 확인해야 합니다.",
      owner: "사업개발",
      question: "이 회동이 실제 파트너십인가, 아니면 관계 형성 이벤트인가?",
      task: "후속 계약, 공동 PoC, GPU 공급 언급이 있는지 원문에 표시하고 행사성 노출이면 관망 처리하세요.",
      check: "후속 발표, 계약 주체, 공동 PoC, GPU 공급 조건"
    },
    {
      pattern: /ai\s*팩토리|중심지|의존\s*탈피|엔비디아\s*의존/i,
      detail:
        "한국이 AI 팩토리 거점으로 부상하는 동시에 엔비디아 의존 리스크가 커진다는 신호입니다. 대체 인프라와 국산 칩 활용 가능성을 같이 봐야 합니다.",
      owner: "인프라/전략",
      question: "우리 서비스 원가가 엔비디아 의존 리스크에 얼마나 노출돼 있나?",
      task: "GPU 의존도, 국산 NPU 대체안, 클라우드 단가를 오늘 비용표에 반영하세요.",
      check: "GPU 조달 주체, 대체 인프라, 국산 칩 채택 가능성"
    },
    {
      pattern: /휴머노이드|로봇.*간담회|업계\s*간담회/i,
      detail:
        "정부가 휴머노이드·로봇 AI 생태계의 정책 수요를 직접 수렴하는 신호입니다. 로봇 데이터, 부품, 안전 인증, 실증 예산으로 이어질지 확인해야 합니다.",
      owner: "신사업/정책",
      question: "로봇·피지컬 AI가 우리 고객군에서 올해 PoC가 가능한 영역인가?",
      task: "로봇 AI 실증 예산, 안전 인증, 데이터 확보 요구를 사업 기회로 분리하세요.",
      check: "참여 기업, 정부 예산, 실증 일정, 인증 요구"
    },
    {
      pattern: /k-ai\s*반도체|성장\s*포럼|과기정통부.*반도체/i,
      detail:
        "정부가 K-AI 반도체를 산업 육성 의제로 다시 끌어올리는 신호입니다. 조달, 실증, 국산 NPU 채택 조건이 생기는지 봐야 합니다.",
      owner: "인프라/공공영업",
      question: "국산 AI 반도체가 비용 절감 옵션인지, 조달 필수 조건인지 구분됐나?",
      task: "국산 NPU 조달·검증 조건을 공공 제안서 체크리스트에 추가하세요.",
      check: "조달 조건, 검증 지표, 지원 예산, 참여 기업"
    },
    {
      pattern: /델|dell|파트너.*수익|사이버\s*복원력|클라우드\s*현대화/i,
      detail:
        "엔터프라이즈 AI 도입이 파트너 수익, 보안 복원력, 클라우드 현대화 패키지로 묶이는 신호입니다. SI·리셀러 채널 전략에 반영할 만합니다.",
      owner: "채널/영업",
      question: "우리 제안은 모델 기능이 아니라 운영 책임과 채널 수익을 설명하고 있나?",
      task: "AI 도입 패키지를 보안 복원력, 클라우드 현대화, 파트너 마진 관점으로 재정리하세요.",
      check: "파트너 혜택, 보안 요구, 클라우드 전환 범위"
    },
    {
      pattern: /lg cns|aind|에이전틱\s*ai|개발\s*플랫폼/i,
      detail:
        "SI 기업이 AI를 개발·운영 자동화 플랫폼으로 제품화하는 신호입니다. 내부 개발 생산성보다 고객 IT 전환 패키지로 팔릴 가능성을 봐야 합니다.",
      owner: "제품/엔터프라이즈",
      question: "우리는 에이전틱 개발 플랫폼과 경쟁/연동 중 어느 쪽인가?",
      task: "개발·운영 자동화 기능을 고객 IT 전환 패키지로 설명할 수 있는지 점검하세요.",
      check: "자동화 범위, 운영 책임, 모델 파트너, 도입 고객"
    },
    {
      pattern: /gpu.*확충|베라루빈|네이버.*삼성.*엘리스|정부\s*gpu/i,
      detail:
        "정부 GPU 확충 사업이 민간 클라우드·AI 인프라 업체 선정으로 구체화되는 신호입니다. 조달 일정과 운영 주체를 확인해야 합니다.",
      owner: "인프라/전략",
      question: "정부 GPU 확충이 우리 조달 비용과 공공 영업 조건을 바꾸나?",
      task: "선정 사업자, 공급 일정, 이용 단가를 인프라 조달 시나리오에 반영하세요.",
      check: "선정 기업, GPU 규모, 서비스 개시일, 이용 단가"
    },
    {
      pattern: /skt|sk텔레콤|aidc|gw급|ai\s*인프라\s*동맹/i,
      detail:
        "통신사가 엔비디아와 AI 데이터센터 사업을 결합하는 신호입니다. 전력, 네트워크, GPU 운영 역량이 B2B 판매 포인트가 됩니다.",
      owner: "B2B 전략",
      question: "통신사 AI 데이터센터가 우리 고객 제안의 경쟁자 또는 파트너인가?",
      task: "전력, 네트워크, GPU 운영 역량을 기준으로 협업/경쟁 포인트를 나누세요.",
      check: "데이터센터 규모, 엔비디아 협력 범위, 타깃 고객, 과금 구조"
    },
    {
      pattern: /hbm|파운드리|메모리/i,
      detail:
        "AI 인프라 경쟁이 HBM·메모리·파운드리 공급망으로 번지는 신호입니다. 원가와 공급 안정성 리스크를 함께 봐야 합니다.",
      owner: "인프라/재무",
      question: "HBM·메모리 수급 변화가 추론 단가와 공급 안정성을 흔드나?",
      task: "클라우드 단가, 장기 예약, 대체 벤더 옵션을 원가 시나리오에 업데이트하세요.",
      check: "공급 업체, 생산 일정, 단가 변화, 클라우드 반영 여부"
    },
    {
      pattern: /보안|감사|권한|사이버|복원력/i,
      detail:
        "AI 도입 논의가 기능 데모를 넘어 보안, 감사, 복원력 요구로 이동하는 신호입니다. 구매 조건에 통제 화면과 책임 범위를 넣어야 합니다.",
      owner: "보안/제품",
      question: "고객 구매 조건에 권한·감사·복원력 요구가 먼저 들어오고 있나?",
      task: "관리자 승인, 감사 로그, 데이터 반출 통제 화면을 제안서 앞단에 배치하세요.",
      check: "권한 범위, 감사 로그, 사고 대응, 데이터 반출 통제"
    }
  ];
  return (
    rules.find((rule) => rule.pattern.test(haystack)) || {
      detail: `${frame.detail} ${frame.why}`,
      owner: "전략",
      question: `${frame.topic} 이슈가 고객 제안, 제품 로드맵, 파트너십 우선순위를 바꾸나?`,
      task: frame.next,
      check: "발표 주체, 적용 산업, 후속 일정, 계약 가능성"
    }
  );
}

function articleSpecificDetail(article, frame) {
  return articleSpecificSignal(article, frame).detail;
}

function articleDetailSummary(article, businessRelevance) {
  const frame = articleFrame(article);
  const title = cleanTitle(stripKnownSourceSuffix(article.title, article.source));
  const cleanedSummary = article.summary ? cleanTitle(stripKnownSourceSuffix(article.summary, article.source)) : "";
  const compactSummary = cleanedSummary.replace(/\s/g, "");
  const compactTitle = title.replace(/\s/g, "");
  const sourceDetail =
    cleanedSummary && cleanedSummary !== title && !compactSummary.startsWith(compactTitle)
      ? truncateSentence(cleanedSummary, 142)
      : truncateSentence(articleSpecificDetail(article, frame), 184);
  const reason = businessRelevance.reasons[0]?.label ? `판정 근거: ${businessRelevance.reasons[0].label}.` : "";
  return truncateSentence(`${sourceDetail} ${reason}`, 190);
}

function articleActionBrief(article) {
  const frame = articleFrame(article);
  const signal = articleSpecificSignal(article, frame);
  return {
    topic: frame.topic,
    why: frame.why,
    owner: signal.owner,
    decision: signal.question,
    question: signal.question,
    task: signal.task,
    nextStep: signal.task,
    sourceCheck: signal.check,
    evidenceChecklist: signal.check
  };
}

function articleBriefForArticle(article, businessRelevance) {
  const frame = articleFrame(article);
  return {
    background: articleDetailSummary(article, businessRelevance),
    reaction: frame.reaction,
    implication: frame.next
  };
}

function hotReasonForArticle(article, businessRelevance) {
  const frame = articleFrame(article);
  const topReason = businessRelevance.reasons[0]?.label || "사업 임팩트";
  return `${frame.topic} 관점의 기사이며 ${topReason} 신호가 감지돼 한국 AI 사업 임팩트 ${businessRelevance.score}점으로 분류했습니다.`;
}

function parseHtmlLinks(html, source) {
  const anchors = [...html.matchAll(/<a\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi)];
  return anchors
    .map((match) => {
      const link = absoluteUrl(decodeXml(match[1]), source.url);
      const title = cleanTitle(match[2]);
      const rawImage = imageFromHtml(match[0]);
      const imageUrl = rawImage ? usableImageUrl(absoluteUrl(rawImage, source.url)) : "";
      return {
        source: source.name,
        title,
        summary: title,
        link,
        imageUrl,
        publishedAt: new Date()
      };
    })
    .filter((item) => item.link && item.title.length >= 12)
    .filter((item) => {
      const haystack = `${item.title} ${item.link}`.toLowerCase();
      return /ai|인공지능|생성형|챗gpt|openai|anthropic|google|naver|agent|mcp|llm|클라우드|반도체|보안|로봇|데이터/.test(haystack);
    })
    .slice(0, 30);
}

async function fetchSource(source) {
  if (!source.feed && source.mode !== "html") return [];
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);
  try {
    const response = await fetch(source.feed || source.url, {
      headers: { "user-agent": "SignalDesk/1.0" },
      signal: controller.signal
    });
    if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
    const body = await response.text();
    return source.mode === "html" ? parseHtmlLinks(body, source) : parseFeed(body, source.name);
  } catch (error) {
    console.warn(`[warn] ${source.name}: ${error.message}`);
    return [];
  } finally {
    clearTimeout(timeout);
  }
}

function uniqByTitle(items) {
  const seen = new Set();
  return items.filter((item) => {
    const key = item.title.toLowerCase().replace(/[^a-z0-9가-힣]/g, "").slice(0, 90);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function scoreArticle(article, term) {
  const title = article.title.toLowerCase();
  const body = `${article.title} ${article.summary}`.toLowerCase();
  return term.aliases.reduce((score, alias) => {
    const lowered = alias.toLowerCase();
    if (title.includes(lowered)) return score + 3;
    if (body.includes(lowered)) return score + 1;
    return score;
  }, 0);
}

function scoreTerms(articles) {
  return agendaTerms
    .map((term) => {
      const matches = articles
        .map((article) => ({ article, score: scoreArticle(article, term) }))
        .filter((match) => match.score > 0)
        .sort((a, b) => b.score - a.score || b.article.publishedAt - a.article.publishedAt);

      const score = matches.reduce((sum, match) => sum + match.score, 0);
      const sourceCount = new Set(matches.map((match) => match.article.source)).size;
      return { ...term, matches, score, sourceCount };
    })
    .sort((a, b) => b.score - a.score || b.sourceCount - a.sourceCount);
}

const koreaBusinessRules = [
  {
    label: "한국 직접성",
    weight: 36,
    keywords: [
      "한국",
      "국내",
      "네이버",
      "naver",
      "카카오",
      "kakao",
      "삼성",
      "samsung",
      "sk",
      "skt",
      "kt",
      "lg",
      "엔비디아",
      "nvidia",
      "젠슨",
      "jensen",
      "huang",
      "kisa",
      "현대",
      "쿠팡",
      "토스",
      "업스테이지",
      "뤼튼",
      "리벨리온",
      "퓨리오사",
      "파수",
      "더존",
      "한글과컴퓨터",
      "스마일게이트",
      "개인정보보호위원회",
      "과기정통부",
      "금융위"
    ],
    detail: "한국 시장, 국내 기업, 규제 기관과 직접 연결됩니다."
  },
  {
    label: "사업화 신호",
    weight: 22,
    keywords: ["방한", "회동", "만찬", "만난다", "출시", "상용화", "도입", "투자", "인수", "파트너십", "협력체", "포럼", "법인", "공략", "시장", "고객", "매출", "요금", "엔터프라이즈", "b2b", "ax", "솔루션"],
    detail: "매출, 고객 확보, 파트너십, 시장 진입과 연결되는 신호입니다."
  },
  {
    label: "규제·리스크",
    weight: 22,
    keywords: ["개인정보", "규제", "보안", "저작권", "소송", "감사", "정책", "가이드라인", "유출", "안전", "심의", "compliance"],
    detail: "도입 리스크, 컴플라이언스, 신뢰성 판단에 영향을 줍니다."
  },
  {
    label: "인프라·원가",
    weight: 18,
    keywords: ["hbm", "ai 팩토리", "피지컬 ai", "로보틱스", "로봇", "데이터센터", "gpu", "npu", "반도체", "클라우드", "aws", "azure", "엔비디아", "nvidia", "전력", "칩", "서버", "tpu"],
    detail: "AI 서비스 원가, 확장성, 공급망과 관련된 신호입니다."
  },
  {
    label: "산업 적용",
    weight: 16,
    keywords: ["금융", "의료", "헬스케어", "제조", "리테일", "게임", "커머스", "물류", "반도체", "자동차", "공공"],
    detail: "실제 산업 적용과 고객 세그먼트 확장을 보여줍니다."
  },
  {
    label: "인재·생태계",
    weight: 8,
    keywords: ["교육", "대학", "인재", "연구", "kaist", "카이스트"],
    detail: "채용, 인재 공급, 산학 생태계 관점에서 참고할 신호입니다."
  },
  {
    label: "플랫폼 경쟁",
    weight: 14,
    keywords: ["openai", "anthropic", "google", "microsoft", "apple", "aws", "claude", "gemini", "copilot", "codex", "siri", "오픈ai", "앤트로픽", "구글", "애플"],
    detail: "국내 사업자가 의존하거나 경쟁해야 하는 글로벌 플랫폼 변화입니다."
  }
];

function businessRelevanceForArticle(article, generatedAt = new Date()) {
  const haystack = `${article.title} ${article.summary} ${article.source}`.toLowerCase();
  const hits = koreaBusinessRules
    .map((rule) => {
      let matched = rule.keywords.filter((keyword) => keywordMatches(haystack, keyword));
      if (rule.label === "사업화 신호" && /대학|kaist|카이스트|교육/.test(haystack)) {
        matched = matched.filter((keyword) => !["투자", "시장"].includes(keyword));
      }
      return {
        ...rule,
        matched
      };
    })
    .filter((rule) => rule.matched.length);
  const sourceBoost = /AI Times|DigitalToday|Bloter|ZDNet Korea|Naver|Daum/.test(article.source) ? 10 : 0;
  const hours = Math.max(1, Math.round((generatedAt.getTime() - article.publishedAt.getTime()) / 36e5));
  const recencyBoost = hours <= 24 ? 8 : hours <= 72 ? 4 : 0;
  const rawScore = hits.reduce((sum, rule) => sum + rule.weight, sourceBoost + recencyBoost);
  const score = Math.min(100, rawScore);

  return {
    score,
    level: score >= 70 ? "높음" : score >= 45 ? "중간" : "낮음",
    reasons: hits.slice(0, 3).map((rule) => ({
      label: rule.label,
      value: rule.matched.slice(0, 2).join(", "),
      detail: rule.detail
    }))
  };
}

const explicitAppleSignalPattern =
  /\bapple\b|\bapple intelligence\b|애플\s*인텔리전스|애플|\bsiri\b|시리|\bprivate cloud compute\b|\biphone\b|\bios\b|\bmacos\b/;

function isExplicitAppleArticle(article, includeSummary = false) {
  const haystack = includeSummary
    ? `${article.title} ${article.summary} ${article.source}`.toLowerCase()
    : `${article.title} ${article.source}`.toLowerCase();
  return explicitAppleSignalPattern.test(haystack);
}

function isAiBusinessArticle(article) {
  const haystack = `${article.title} ${article.summary}`.toLowerCase();
  return /ai|인공지능|생성형|llm|에이전트|agent|오픈ai|openai|앤트로픽|anthropic|클로드|claude|gemini|제미나이|apple intelligence|애플 인텔리전스|siri|시리|private cloud compute|copilot|코파일럿|codex|npu|gpu|hbm|데이터센터|디지털 트윈|피지컬|로보틱스|로봇|robot|모델|챗봇|chatbot|머신러닝|딥러닝/.test(haystack);
}

function aggregateBusinessRelevance(matches, generatedAt) {
  const scored = matches
    .map((match) => ({
      ...match,
      businessRelevance: businessRelevanceForArticle(match.article, generatedAt)
    }))
    .sort(
      (a, b) =>
        b.businessRelevance.score - a.businessRelevance.score ||
        b.score - a.score ||
        b.article.publishedAt - a.article.publishedAt
    );
  const topScore = scored[0]?.businessRelevance.score || 0;
  const averageTop = scored.length
    ? Math.round(scored.slice(0, 3).reduce((sum, item) => sum + item.businessRelevance.score, 0) / Math.min(scored.length, 3))
    : 0;
  const reasons = scored.flatMap((item) => item.businessRelevance.reasons).slice(0, 3);
  return {
    score: Math.max(topScore, averageTop),
    level: Math.max(topScore, averageTop) >= 70 ? "높음" : Math.max(topScore, averageTop) >= 45 ? "중간" : "낮음",
    reasons,
    matches: scored
  };
}

function kstParts(date) {
  const shifted = new Date(date.getTime() + KST_OFFSET_MS);
  return {
    year: shifted.getUTCFullYear(),
    month: String(shifted.getUTCMonth() + 1).padStart(2, "0"),
    day: String(shifted.getUTCDate()).padStart(2, "0"),
    hour: String(shifted.getUTCHours()).padStart(2, "0"),
    minute: String(shifted.getUTCMinutes()).padStart(2, "0"),
    weekday: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][shifted.getUTCDay()]
  };
}

function formatKst(date) {
  const part = kstParts(date);
  return `${part.year}.${part.month}.${part.day} ${part.hour}:${part.minute}`;
}

function formatKstDate(date) {
  const part = kstParts(date);
  return `${part.year}.${part.month}.${part.day} ${part.weekday}`;
}

function formatKstKey(date) {
  const part = kstParts(date);
  return `${part.year}-${part.month}-${part.day}`;
}

function formatAssetVersion(date) {
  const part = kstParts(date);
  return `${part.year}${part.month}${part.day}${part.hour}${part.minute}`;
}

function assetVersionFromGeneratedAt(value) {
  const match = String(value).match(/^(\d{4})\.(\d{2})\.(\d{2}) (\d{2}):(\d{2})/);
  return match ? `${match[1]}${match[2]}${match[3]}${match[4]}${match[5]}` : formatAssetVersion(new Date());
}

function nextKstMorning(date) {
  const shifted = new Date(date.getTime() + KST_OFFSET_MS);
  const next = new Date(
    Date.UTC(
      shifted.getUTCFullYear(),
      shifted.getUTCMonth(),
      shifted.getUTCDate(),
      DAILY_UPDATE_HOUR_KST,
      DAILY_UPDATE_MINUTE_KST,
      0
    )
  );
  const pastToday =
    shifted.getUTCHours() > DAILY_UPDATE_HOUR_KST ||
    (shifted.getUTCHours() === DAILY_UPDATE_HOUR_KST && shifted.getUTCMinutes() >= DAILY_UPDATE_MINUTE_KST);
  if (pastToday) next.setUTCDate(next.getUTCDate() + 1);
  return new Date(next.getTime() - KST_OFFSET_MS);
}

function widthPercent(value, max) {
  const width = Math.max(24, Math.round((value / Math.max(max, 1)) * 100));
  return `${width}%`;
}

function hashtagsForTerm(term, matches) {
  const companyTags = ["OpenAI", "Anthropic", "Google", "Naver", "Microsoft", "NVIDIA", "Notion", "Meta"]
    .filter((name) => matches.some(({ article }) => `${article.title} ${article.summary}`.toLowerCase().includes(name.toLowerCase())))
    .slice(0, 2);
  const aliasTags = term.aliases
    .filter((alias) => alias.length <= 18)
    .map((alias) => alias.replace(/\s+/g, ""))
    .slice(0, 3);
  return [...new Set([term.label.replace(/\s+/g, ""), ...companyTags, ...aliasTags])]
    .slice(0, 5)
    .map((tag) => `#${tag}`);
}

function relatedCompaniesForTerm(term, matches) {
  const knownCompanies = [
    ...companies.map((company) => company.name),
    "NVIDIA",
    "Meta",
    "Amazon",
    "Samsung",
    "Kakao",
    "SK Telecom"
  ];
  const haystack = matches
    .slice(0, 12)
    .map(({ article }) => `${article.title} ${article.summary}`)
    .join(" ")
    .toLowerCase();
  const mentioned = knownCompanies.filter((name) => haystack.includes(name.toLowerCase()));
  const strategic = companies.filter((company) => company.terms.includes(term.id)).map((company) => company.name);
  return [...new Set([...mentioned, ...strategic])].slice(0, 5);
}

function sourcesForTerm(term, matches) {
  const articleSources = matches
    .slice(0, 6)
    .map(({ article }) => ({
      title: article.title,
      url: article.link,
      media: article.source,
      time: formatKst(article.publishedAt)
    }))
    .filter((source) => source.title && source.url);

  if (articleSources.length) return articleSources;

  return sources.slice(0, 3).map((source) => ({
    title: `${term.label} 레이더 수집 대기`,
    url: source.url,
    media: source.name
  }));
}

function normalizedNeedles(values = []) {
  return values
    .flat()
    .filter(Boolean)
    .map((value) => String(value).toLowerCase().replace(/^#/, "").trim())
    .filter((value) => value.length > 1);
}

function textHasNeedle(text, needles) {
  return normalizedNeedles(needles).some((needle) => text.includes(needle));
}

function strategyNeedlesForAgenda(agenda, term) {
  return normalizedNeedles([
    agenda.label,
    agenda.description,
    agenda.heat,
    term?.label,
    term?.aliases
  ]);
}

function articleMatchesCompanyAgenda(article, company, agenda, term) {
  const haystack = `${article.title} ${article.summary} ${article.source}`.toLowerCase();
  const obviousNoise = /노조|파업|임금|longevity|hrv|건강관리|연예|스포츠|주가 급등락/i.test(haystack);
  if (obviousNoise) return false;

  const strategyNeedles = strategyNeedlesForAgenda(agenda, term);
  const hasStrategyNeedle = textHasNeedle(haystack, strategyNeedles);
  const agendaText = `${agenda.label} ${agenda.description} ${(agenda.heat || []).join(" ")}`.toLowerCase();
  const agendaWantsInfra = /ai\s*factory|ai\s*팩토리|gpu|hbm|npu|데이터센터|aidc|반도체|공급망|로봇|로보틱스|피지컬|디지털\s*트윈/i.test(agendaText);
  const infraFallback =
    agendaWantsInfra &&
    ["sovereign", "on-device"].includes(agenda.term) &&
    /엔비디아|nvidia|gpu|hbm|npu|ai\s*팩토리|데이터센터|aidc|로봇|로보틱스/i.test(haystack);
  const securityFallback =
    agenda.term === "evalops" && /보안|감사|권한|복원력|사이버|평가|품질|guardrail/i.test(haystack);
  const enterpriseFallback =
    ["agent", "ai-code"].includes(agenda.term) && /agent|에이전트|ax|업무\s*자동화|개발\s*플랫폼|workflow|워크플로/i.test(haystack);
  return isAiBusinessArticle(article) && (hasStrategyNeedle || infraFallback || securityFallback || enterpriseFallback);
}

function refineCompanyAgenda(company, agenda, sources) {
  if (!sources.length) return agenda;
  const haystack = `${agenda.label} ${agenda.description} ${sources.map((source) => source.title).join(" ")}`.toLowerCase();
  const refinements = [
    {
      company: "naver",
      pattern: /ai\s*팩토리|gpu|엔비디아|nvidia|소버린|클라우드/i,
      label: "AI 팩토리·GPU 조달 전선",
      description: "네이버의 클라우드·AI 운영 역량이 정부 GPU 사업, 엔비디아 협력, 소버린 AI 수요와 연결되는지 봐야 합니다.",
      takeaway: "공공·대기업 제안에서 AI 팩토리 운영 경험, GPU 확보, 국내 데이터 처리 조건을 경쟁사와 비교하세요."
    },
    {
      company: "sktelecom",
      pattern: /nvidia|엔비디아|ai\s*인프라|aidc|gw급|데이터센터|ai\s*팩토리/i,
      label: "엔비디아 AIDC 동맹",
      description: "SKT가 네트워크와 데이터센터 자산을 엔비디아 GPU 인프라 수요와 결합해 B2B AI 인프라 사업으로 확장하는 신호입니다.",
      takeaway: "AIDC, 전력, GPU 운영, 기업 AX 패키지를 묶은 제휴·영업 시나리오를 업데이트하세요."
    },
    {
      company: "samsung",
      pattern: /hbm|파운드리|메모리|ai\s*팩토리|로봇|엔비디아|nvidia/i,
      label: "HBM 이후 AI 팩토리 공급망",
      description: "삼성의 메모리·파운드리·디바이스 자산이 AI 팩토리, 로봇, 온디바이스 AI 수요와 어떻게 연결되는지 봐야 합니다.",
      takeaway: "HBM, 파운드리, 온디바이스 NPU, 로봇 AI 접점을 제품·파트너십 관점에서 분리하세요."
    },
    {
      company: "lgai",
      pattern: /lg cns|anthropic|openai|클로드|ax|엔터프라이즈|si/i,
      label: "멀티모델 AX SI 패키지",
      description: "LG 계열의 AX 사업이 OpenAI, Anthropic 등 모델 파트너를 실제 기업 업무 전환 패키지로 묶는지 확인해야 합니다.",
      takeaway: "고객별로 OpenAI형, Claude형, 사내 데이터형 패키지를 어떻게 구분해 팔지 비교하세요."
    },
    {
      company: "kt",
      pattern: /금융|공공|클라우드|aicc|ax|망|보안/i,
      label: "금융·공공 AX 번들",
      description: "KT의 통신망, 클라우드, 상담 자동화 자산이 규제 산업의 AX 예산과 맞물리는지 봐야 합니다.",
      takeaway: "금융·공공 고객용 PoC에는 데이터 보관, 감사 로그, 상담 자동화 ROI를 함께 넣으세요."
    }
  ];
  const match = refinements.find((item) => item.company === company.id && item.pattern.test(haystack));
  return match ? { ...agenda, label: match.label, description: match.description, takeaway: match.takeaway } : agenda;
}

function sourcesForCompanyAgenda(company, agenda, termSignal, allArticles = []) {
  const matches = termSignal.matches || [];
  const productNeedles = {
    openai: ["OpenAI", "ChatGPT", "Codex", "Agents SDK", "Responses API", "Sora"],
    anthropic: ["Anthropic", "Claude", "Claude Code", "MCP"],
    google: ["Google", "Gemini", "AI Overviews", "Android", "Chrome", "TPU", "Vertex"],
    naver: ["Naver", "네이버", "HyperCLOVA", "CLOVA", "클로바"],
    kakao: ["Kakao", "카카오", "카카오톡", "KoGPT", "카나나"],
    sktelecom: ["SK Telecom", "SKT", "에이닷", "A.", "SK하이닉스", "SK hynix"],
    samsung: ["Samsung", "삼성", "Galaxy AI", "갤럭시 AI", "HBM"],
    lgai: ["LG AI", "LG AI Research", "EXAONE", "엑사원", "LG", "LG CNS"],
    kt: ["KT", "케이티", "AICC", "믿음"],
    upstage: ["Upstage", "업스테이지", "Solar", "솔라"],
    rebellions: ["Rebellions", "리벨리온", "ATOM", "Rebel"],
    furiosa: ["Furiosa", "FuriosaAI", "퓨리오사", "Warboy", "RNGD"],
    wrtn: ["Wrtn", "뤼튼"],
    fasoo: ["Fasoo", "파수", "심볼로직", "Symbologic"],
    microsoft: ["Microsoft", "Copilot", "Graph", "Office", "Teams", "Defender", "GitHub", "Azure", "Windows"]
  };
  const needles = [company.name, company.id, ...(productNeedles[company.id] || [])]
    .map((value) => String(value).toLowerCase())
    .filter((value) => value.length > 2);
  const directMatches = matches.filter(({ article }) => {
    const haystack = `${article.title} ${article.summary} ${article.source}`.toLowerCase();
    return needles.some((needle) => haystack.includes(needle)) && articleMatchesCompanyAgenda(article, company, agenda, termSignal);
  });
  const companyWideMatches = allArticles
    .map((article) => ({ article, score: 0 }))
    .filter(({ article }) => {
      const haystack = `${article.title} ${article.summary} ${article.source}`.toLowerCase();
      return needles.some((needle) => haystack.includes(needle)) && articleMatchesCompanyAgenda(article, company, agenda, termSignal);
    });
  const selected = (directMatches.length ? directMatches : companyWideMatches)
    .sort((a, b) => businessRelevanceForArticle(b.article).score - businessRelevanceForArticle(a.article).score || b.article.publishedAt - a.article.publishedAt)
    .slice(0, 3);
  const evidence = directMatches.length
    ? "회사·전략 직접 언급"
    : "회사 관련 AI 전략 기사";

  return selected.map(({ article }) => ({
    title: article.title,
    url: article.link,
    media: article.source,
    time: formatKst(article.publishedAt),
    evidence,
    summary: articleDetailSummary(article, businessRelevanceForArticle(article)),
    takeaway: articleActionBrief(article).nextStep
  }));
}

function sourceSummaryForCompanyAgenda(sources, termSignal, company) {
  if (!sources.length) return `${company.name} 직접 원문 수집 대기`;
  const media = [...new Set(sources.map((source) => source.media))].slice(0, 2).join(", ");
  const directCount = sources.filter((source) => source.evidence === "회사·전략 직접 언급").length;
  const companyCount = sources.filter(
    (source) => source.evidence === "회사·전략 직접 언급" || source.evidence === "회사 관련 AI 전략 기사"
  ).length;
  const basis = directCount ? "직접 근거" : companyCount ? "회사 원문" : "시장 신호";
  return `${media} · ${basis} ${sources.length}건`;
}

function takeawayForCompanyAgenda(company, agenda, termId) {
  const guide = {
    agent: "우리 서비스에서 조회가 실행으로 바뀌는 접점을 찾고, 승인/로그/롤백 요구사항을 먼저 점검하세요.",
    mcp: "연동 후보 데이터와 업무 시스템을 우선순위화하고, 커넥터·권한 범위 전략을 점검하세요.",
    "ai-code": "코드 생성량보다 테스트 통과율, 리뷰 품질, 배포 실패 감소 같은 운영 지표로 비교하세요.",
    evalops: "품질 평가를 출시 전 QA가 아니라 운영 중 회귀 감지와 감사 로그 체계로 설계하세요.",
    "on-device": "지연시간이나 개인정보가 민감한 AI 기능을 로컬 처리 후보로 분리해 보세요.",
    sovereign: "국내 데이터 보관, 공공 조달, 산업별 특화 모델 요구가 기회인지 리스크인지 나눠 보세요."
  };
  return agenda.takeaway || guide[termId] || `${company.name}의 ${agenda.label} 움직임이 제품, 파트너십, 리스크에 주는 영향을 점검하세요.`;
}

function whyHotForTerm(term, matches, sourceCount, mentions) {
  const sources = [...new Set(matches.slice(0, 5).map((match) => match.article.source))];
  if (!matches.length) {
    return `${term.label} 관련 키워드가 상시 추적 대상에 올라와 있어 기본 레이더에 유지됩니다.`;
  }
  return `${sources.slice(0, 3).join(", ")} 등 ${sourceCount}개 소스에서 ${matches.length}개 기사 신호가 잡혔고, 키워드 가중 언급이 ${mentions}회로 묶였습니다.`;
}

function hotnessForTerm({ term, matches, sourceCount, mentions, relatedCompanies, sourceLinks, businessRelevance }) {
  const sourceNames = [...new Set(matches.slice(0, 6).map((match) => match.article.source))];
  const recentHours = matches.length
    ? Math.max(1, Math.round((Date.now() - Math.max(...matches.map((match) => match.article.publishedAt.getTime()))) / 36e5))
    : null;

  return {
    formula: "소스 다양성 + 기사 신호 수 + 키워드 언급 밀도 + 기업 연결성을 함께 반영",
    reasons: [
      {
        label: "사업 임팩트",
        value: `${businessRelevance.score}점`,
        detail: businessRelevance.reasons[0]?.detail || "한국 AI 사업 관점의 직접성, 사업화, 규제, 인프라 신호를 반영했습니다."
      },
      {
        label: "매체 분산",
        value: `${sourceCount}개`,
        detail: sourceNames.length
          ? `${sourceNames.slice(0, 3).join(", ")} 등 서로 다른 매체에서 같은 의제가 반복 감지됐습니다.`
          : "기본 추적 소스에서 상시 모니터링 중인 의제입니다."
      },
      {
        label: "기사 신호",
        value: `${Math.max(matches.length, sourceLinks.length)}건`,
        detail: "최근 24시간 수집분 중 제목과 요약이 해당 의제와 직접 맞물린 기사입니다."
      },
      {
        label: "언급 밀도",
        value: `${mentions}회`,
        detail: `${term.label} 및 유사 표현이 제목, 요약, 출처 신호에서 가중치 있게 반복됐습니다.`
      },
      {
        label: "기업 연결",
        value: `${relatedCompanies.length}곳`,
        detail: `${relatedCompanies.slice(0, 4).join(", ")}의 제품, 인프라, 정책 움직임과 연결됩니다.`
      },
      {
        label: "최신성",
        value: recentHours ? `${recentHours}h` : "상시",
        detail: recentHours ? `가장 최근 관련 신호가 약 ${recentHours}시간 전 수집됐습니다.` : "최신 기사 수집 전에도 추적해야 하는 상시 레이더 의제입니다."
      }
    ]
  };
}

function hashId(value) {
  let hash = 0;
  for (const char of value) hash = (hash << 5) - hash + char.charCodeAt(0);
  return Math.abs(hash).toString(36);
}

function relatedCompaniesForArticle(article) {
  const knownCompanies = [
    ...companies.map((company) => company.name),
    "NVIDIA",
    "Meta",
    "Amazon",
    "Samsung",
    "Kakao",
    "SK Telecom"
  ];
  const haystack = `${article.title} ${article.summary}`.toLowerCase();
  return knownCompanies.filter((name) => haystack.includes(name.toLowerCase())).slice(0, 5);
}

function hashtagsForArticle(article) {
  const haystack = `${article.title} ${article.summary} ${article.source}`.toLowerCase();
  const signalTags = [
    [/젠슨|jensen|huang|엔비디아|nvidia/, "NVIDIA"],
    [/피지컬\s*ai|physical ai|로보틱스|로봇|자율주행|스마트팩토리/, "피지컬AI"],
    [/hbm|ai\s*반도체|반도체|gpu|npu|칩|가속기|데이터센터/, "AI반도체"],
    [/방한|회동|협력|파트너|제휴|동맹|연합/, "협력"],
    [/보안|kisa|위협|유출|권한|감사|통제/, "보안"],
    [/투자|유치|펀딩|출자|인수|m&a/, "투자"],
    [/정책|규제|과기정통부|개인정보|공공|정부/, "정책"]
  ]
    .filter(([pattern]) => pattern.test(haystack))
    .map(([, tag]) => tag);
  if (isExplicitAppleArticle(article)) signalTags.unshift("Apple");
  const topicTags = agendaTerms
    .filter((term) => scoreArticle(article, term) > 0)
    .map((term) => term.label.replace(/\s+/g, ""));
  const companyTags = relatedCompaniesForArticle(article);
  const genericCompanyTags = new Set(["OpenAI", "Anthropic", "Google", "Microsoft", "Apple"]);
  const filteredCompanyTags = companyTags.filter((tag) => !genericCompanyTags.has(tag) || tag !== "Apple" || isExplicitAppleArticle(article));
  return [...new Set([...signalTags, ...topicTags, ...filteredCompanyTags])]
    .slice(0, 5)
    .map((tag) => `#${tag}`);
}

function hotnessForArticle(article, generatedAt, businessRelevance) {
  const hours = Math.max(1, Math.round((generatedAt.getTime() - article.publishedAt.getTime()) / 36e5));
  const frame = articleFrame(article);
  return {
    formula: "한국 AI 사업 임팩트 + 원문 최신성 + 출처 신뢰 + 후속 확인 필요성을 반영",
    reasons: [
      {
        label: "사업 임팩트",
        value: `${businessRelevance.score}점`,
        detail: businessRelevance.reasons[0]?.detail || "한국 AI 사업자에게 영향을 줄 수 있는 사업, 규제, 인프라 신호를 반영했습니다."
      },
      {
        label: "수집 시각",
        value: `${hours}h`,
        detail: `약 ${hours}시간 전 발행 또는 수집된 최신 원문입니다.`
      },
      {
        label: "원문 소스",
        value: article.source,
        detail: `${article.source}에서 직접 수집한 기사이며 ${frame.topic} 관점으로 분류했습니다.`
      },
      {
        label: "기사 내용",
        value: frame.topic,
        detail: frame.detail
      },
      {
        label: "오늘 확인",
        value: "액션",
        detail: frame.next
      }
    ]
  };
}

function buildNewsAgenda(article, generatedAt, index, businessRelevance = businessRelevanceForArticle(article, generatedAt)) {
  const relatedCompanies = relatedCompaniesForArticle(article);
  const bucket = articleTopicBucket(article);
  const pinned = bucket === "nvidia-korea" && !isWeakTopNewsArticle(article);
  const summary = articleDetailSummary(article, businessRelevance);
  const reason = hotReasonForArticle(article, businessRelevance);
  const actionBrief = articleActionBrief(article);
  const image = agendaImageForArticle(article);
  return {
    rank: index + 1,
    id: `news-${index + 1}-${hashId(article.link || article.title)}`,
    collectedAt: `${formatKst(generatedAt)} KST`,
    title: article.title,
    score: Math.max(58, Math.min(98, businessRelevance.score + 18 - index * 3)),
    summary,
    mentions: 1,
    sources: [
      {
        title: article.title,
        url: article.link,
        media: article.source,
        time: formatKst(article.publishedAt)
      }
    ],
    sourceCount: 1,
    momentum: "NEW",
    metric: pinned ? "Pinned Hot" : "원문 1건",
    pinned,
    topicBucket: bucket,
    imageUrl: image.imageUrl,
    imageAlt: image.imageAlt,
    imageCredit: image.imageCredit,
    reason,
    whyHot: reason,
    actionBrief,
    businessRelevance,
    hotness: hotnessForArticle(article, generatedAt, businessRelevance),
    keywords: hashtagsForArticle(article),
    hashtags: hashtagsForArticle(article),
    related_companies: relatedCompanies,
    signals: `${article.source} · ${actionBrief.topic}`,
    articles: [
      {
        title: article.title,
        source: article.source,
        url: article.link,
        time: formatKst(article.publishedAt)
      }
    ],
    brief: articleBriefForArticle(article, businessRelevance)
  };
}

async function imageFromSource(source, cache, blocked = new Set()) {
  if (!source?.url) return null;
  let imageUrl = cache.get(source.url);
  if (typeof imageUrl === "undefined") {
    imageUrl = await fetchArticleImage(source.url);
    cache.set(source.url, imageUrl);
  }
  if (!imageUrl || blocked.has(imageUrl)) return null;
  return {
    imageUrl,
    imageAlt: `${source.media || "원문"} 기사 대표 이미지`,
    imageCredit: source.media || "원문 이미지"
  };
}

async function imageFromRelatedArticles(agenda, articles, cache, blocked = new Set()) {
  const agendaSources = new Set((agenda.sources || []).map((source) => source.url).filter(Boolean));
  const candidates = articles
    .filter((article) => article.link && !agendaSources.has(article.link) && articleTopicBucket(article) === agenda.topicBucket)
    .sort((a, b) => businessRelevanceForArticle(b).score - businessRelevanceForArticle(a).score || b.publishedAt - a.publishedAt)
    .slice(0, 10);

  for (const article of candidates) {
    const feedImage = usableImageUrl(article.imageUrl);
    if (feedImage && !blocked.has(feedImage) && !weakImageUrl(feedImage)) {
      return {
        imageUrl: feedImage,
        imageAlt: `${article.source} 관련 기사 대표 이미지`,
        imageCredit: `${article.source} 관련 기사`
      };
    }
  }

  for (const article of candidates.slice(0, 5)) {
    let imageUrl = cache.get(article.link);
    if (typeof imageUrl === "undefined") {
      imageUrl = await fetchArticleImage(article.link);
      cache.set(article.link, imageUrl);
    }
    if (!imageUrl || blocked.has(imageUrl) || weakImageUrl(imageUrl)) continue;
    return {
      imageUrl,
      imageAlt: `${article.source} 관련 기사 대표 이미지`,
      imageCredit: `${article.source} 관련 기사`
    };
  }

  return null;
}

function setAgendaImage(agenda, image) {
  agenda.imageUrl = image?.imageUrl || "";
  agenda.imageAlt = image?.imageAlt || "";
  agenda.imageCredit = image?.imageCredit || "";
  if (Array.isArray(agenda.articles) && agenda.articles[0]) {
    agenda.articles[0].imageUrl = agenda.imageUrl;
  }
}

async function enrichHotAgendaImages(data, articles = []) {
  const cache = new Map();
  const usedImages = new Set();
  for (const agenda of data.hotAgendas || []) {
    const currentImage = usableImageUrl(agenda.imageUrl);
    const blocked = new Set([...usedImages]);
    if (currentImage && weakImageUrl(currentImage)) blocked.add(currentImage);
    if (currentImage && !weakImageUrl(currentImage) && !usedImages.has(currentImage)) {
      usedImages.add(currentImage);
      continue;
    }

    const sources = Array.isArray(agenda.sources) ? agenda.sources : [];
    let replacement = null;
    for (const source of sources.slice(0, 3)) {
      replacement = await imageFromSource(source, cache, blocked);
      if (replacement && !weakImageUrl(replacement.imageUrl)) break;
    }
    if (!replacement || weakImageUrl(replacement.imageUrl)) {
      replacement = await imageFromRelatedArticles(agenda, articles, cache, blocked);
    }

    if (replacement && !usedImages.has(replacement.imageUrl)) {
      setAgendaImage(agenda, replacement);
      usedImages.add(replacement.imageUrl);
    } else if (currentImage && !usedImages.has(currentImage) && !weakImageUrl(currentImage)) {
      usedImages.add(currentImage);
    } else {
      setAgendaImage(agenda, null);
    }
  }
}

function articleTopicBucket(article) {
  const haystack = `${article.title} ${article.summary} ${article.source}`.toLowerCase();
  if (/(젠슨\s*황|jensen\s*huang|엔비디아|nvidia)/i.test(haystack) && /(방한|한국|korea|피지컬|로보틱스|로봇|게임|회동|크래프톤|삼성|sk|현대|네이버|lg)/i.test(haystack)) return "nvidia-korea";
  if (/앤트로픽|anthropic|글래스윙|glasswing|kisa|사이버\s*보안/i.test(haystack)) return "anthropic-security";
  if (/ai\s*(?:반도체|칩)|hbm|gpu|npu|칩셋|가속기|퓨리오사|리벨리온|국산.*반도체|반도체.*포럼/i.test(haystack)) return "ai-chip";
  if (isExplicitAppleArticle(article)) return "apple";
  if (/네이버|naver|소버린|hyperclova|하이퍼클로바/i.test(haystack)) return "naver";
  if (/카카오|kakao|카나나|kanana/i.test(haystack)) return "kakao";
  if (/skt|sk텔레콤|sk\s*telecom|ai\s*팩토리|디지털\s*트윈/i.test(haystack)) return "skt";
  return cleanTitle(article.title).slice(0, 28).toLowerCase();
}

function isMarketSpeculationArticle(article) {
  const haystack = `${article.title} ${article.summary} ${article.source}`.toLowerCase();
  const marketFrame =
    /주가|증시|코스피|코스닥|특징주|테마주|관련주|수혜주|급등|상승세|투자자|목표가|매수|실적 기대|관심 집중|주목|기대 속/.test(haystack);
  return marketFrame && !hasConcreteBusinessAction(article);
}

function hasConcreteBusinessAction(article) {
  const haystack = `${article.title} ${article.summary} ${article.source}`.toLowerCase();
  return /계약|공급|도입|출시|런칭|상용화|협력 체결|mou|공동 개발|전략적 투자|투자 유치|추가 투자|인수|m&a|정책|예산|조달|사업 선정|국산화|전면 도입|공개|발표|파트너십|고객사|수주|구축/.test(
    haystack
  );
}

function isWeakTopNewsArticle(article) {
  const haystack = `${article.title} ${article.summary} ${article.source}`.toLowerCase();
  const blogFrame = /naver blog|블로그/.test(haystack);
  const eventColorFrame = /말말말|깜짝\s*선물|화제의|뒷얘기|삼겹살|회동.*후일담|관심 집중/.test(haystack);
  const concreteAction = hasConcreteBusinessAction(article);
  return isMarketSpeculationArticle(article) || (blogFrame && !concreteAction) || (eventColorFrame && !concreteAction);
}

function strategicImportanceScore(article) {
  const haystack = `${article.title} ${article.summary} ${article.source}`.toLowerCase();
  let score = 0;
  if (/과기정통부|정부|공공|정책|예산|조달|국산화|사업 선정|규제|개인정보보호위원회|kisa/.test(haystack)) score += 44;
  if (/전략적 투자|투자 유치|추가 투자|인수|m&a|출자|펀딩/.test(haystack)) score += 42;
  if (/전면 도입|업무에 본격 도입|고객사|수주|공급|계약|구축|상용화|출시|런칭/.test(haystack)) score += 38;
  if (/협력 체결|mou|공동 개발|파트너십|동맹|연합/.test(haystack)) score += 30;
  if (/ai\s*팩토리|gpu|npu|hbm|데이터센터|반도체|가속기|private cloud compute|온디바이스|apple intelligence|애플 인텔리전스/.test(haystack)) score += 24;
  if (/openai|anthropic|google|microsoft|apple|nvidia|오픈ai|앤트로픽|구글|마이크로소프트|애플|엔비디아|삼성|네이버|카카오|sk텔레콤|skt/.test(haystack)) score += 16;

  const researchOnly = /대학|kaist|카이스트|논문|연구진|개발/.test(haystack) && !hasConcreteBusinessAction(article);
  if (researchOnly) score -= 24;
  if (isWeakTopNewsArticle(article)) score -= 34;

  return Math.max(-40, Math.min(110, score));
}

function pickDiverseArticles(candidates, limit = 5) {
  const selected = [];
  const selectedUrls = new Set();
  const bucketCounts = new Map();
  const sourceCounts = new Map();

  for (const candidate of candidates) {
    const bucket = articleTopicBucket(candidate.article);
    const source = candidate.article.source || "Source";
    if ((bucketCounts.get(bucket) || 0) >= 1) continue;
    if ((sourceCounts.get(source) || 0) >= 2) continue;
    selected.push(candidate);
    selectedUrls.add(candidate.article.link);
    bucketCounts.set(bucket, 1);
    sourceCounts.set(source, (sourceCounts.get(source) || 0) + 1);
    if (selected.length >= limit) return selected;
  }

  return selected;
}

function latestArticleScore(article, businessRelevance, generatedAt) {
  const hours = Math.max(1, Math.round((generatedAt.getTime() - article.publishedAt.getTime()) / 36e5));
  const recencyScore = Math.max(0, 36 - hours * 1.5);
  const trustedSource =
    /AI Times|DigitalToday|Bloter|ZDNet Korea|Naver|Daum|연합뉴스|조선|중앙|매일경제|한국경제|전자신문|ZDNET Korea/i.test(article.source) &&
    !/Naver Blog|Blog|블로그/i.test(article.source);
  const koreaSourceBoost = trustedSource ? 18 : 0;
  const directCompanyBoost = relatedCompaniesForArticle(article).length ? 10 : 0;
  const haystack = `${article.title} ${article.summary} ${article.source}`.toLowerCase();
  const strategicScore = strategicImportanceScore(article);
  const hotKoreaBoost = /ai 반도체|hbm|피지컬 ai|로보틱스|로봇|kisa|삼성전자|sk텔레콤|sk하이닉스|apple intelligence|애플 인텔리전스/.test(haystack) ? 16 : 0;
  const nvidiaVisitBoost =
    /(젠슨\s*황|jensen\s*huang|엔비디아|nvidia)/i.test(haystack) &&
    /(방한|한국|korea|로보틱스|피지컬|ai\s*팩토리|hbm|삼성|sk|현대|네이버|lg)/i.test(haystack) &&
    hasConcreteBusinessAction(article)
      ? 24
      : 0;
  const titlePenalty = /deepfake|nudes|celebrity gossip|rumor/i.test(haystack) ? 22 : 0;
  const marketSpeculationPenalty = isMarketSpeculationArticle(article) ? 72 : 0;
  const weakTopNewsPenalty = isWeakTopNewsArticle(article) ? 46 : 0;
  const lowImportancePenalty = strategicScore < 18 ? 30 : 0;
  return (
    businessRelevance.score * 0.86 +
    strategicScore +
    recencyScore * 0.65 +
    koreaSourceBoost +
    directCompanyBoost +
    hotKoreaBoost +
    nvidiaVisitBoost -
    titlePenalty -
    marketSpeculationPenalty -
    weakTopNewsPenalty -
    lowImportancePenalty
  );
}

function buildHotAgendas(scoredTerms, generatedAt, articles) {
  const usedUrls = new Set();
  const latestNewsCandidates = articles
    .map((article) => {
      const businessRelevance = businessRelevanceForArticle(article, generatedAt);
      const strategicScore = strategicImportanceScore(article);
      return {
        article,
        businessRelevance,
        strategicScore,
        latestScore: latestArticleScore(article, businessRelevance, generatedAt)
      };
    })
    .filter(
      ({ article, businessRelevance, strategicScore }) =>
        article.link &&
        article.title &&
        isAiBusinessArticle(article) &&
        businessRelevance.score >= 52 &&
        (strategicScore >= 18 || businessRelevance.score >= 82) &&
        !isMarketSpeculationArticle(article)
    )
    .sort(
      (a, b) =>
        b.latestScore - a.latestScore ||
        b.businessRelevance.score - a.businessRelevance.score ||
        b.article.publishedAt - a.article.publishedAt
    )
    .filter(({ article }) => {
      if (usedUrls.has(article.link)) return false;
      usedUrls.add(article.link);
      return true;
    })
    .slice(0, 160);
  const latestNewsArticles = pickDiverseArticles(latestNewsCandidates, 5);

  if (latestNewsArticles.length >= 5) {
    return latestNewsArticles.map(({ article, businessRelevance }, index) =>
      buildNewsAgenda(article, generatedAt, index, businessRelevance)
    );
  }

  const terms = scoredTerms
    .map((term) => {
      const businessRelevance = aggregateBusinessRelevance(term.matches, generatedAt);
      return {
        ...term,
        matches: businessRelevance.matches,
        businessRelevance
      };
    })
    .filter((term) => term.score > 0 && term.matches.length && term.businessRelevance.score >= 45)
    .sort((a, b) => b.businessRelevance.score - a.businessRelevance.score || b.score - a.score || b.sourceCount - a.sourceCount)
    .slice(0, 5);
  const termAgendas = terms.map((term, index) => {
    const topSources = [...new Set(term.matches.slice(0, 6).map((match) => match.article.source))].slice(0, 3);
    const mentions = Math.max(18, term.score * 6 + term.sourceCount * 3);
    const sourceCount = Math.max(term.sourceCount, topSources.length || 3);
    const sourceLinks = sourcesForTerm(term, term.matches);
    const score = Math.min(100, Math.max(58, Math.round(62 + term.score * 3 + sourceCount * 2 - index * 2)));
    const reason = whyHotForTerm(term, term.matches, sourceCount, mentions);
    const keywords = hashtagsForTerm(term, term.matches);
    const relatedCompanies = relatedCompaniesForTerm(term, term.matches);
    const hotness = hotnessForTerm({
      term,
      matches: term.matches,
      sourceCount,
      mentions,
      relatedCompanies,
      sourceLinks,
      businessRelevance: term.businessRelevance
    });
    return {
      rank: index + 1,
      id: term.id,
      collectedAt: `${formatKst(generatedAt)} KST`,
      title: term.title,
      score,
      summary: term.summary,
      mentions,
      sources: sourceLinks,
      sourceCount,
      momentum: `+${Math.min(48, 12 + index * 3 + term.sourceCount * 4)}%`,
      metric: `${sourceCount}개 매체 보도`,
      reason,
      whyHot: reason,
      businessRelevance: {
        score: term.businessRelevance.score,
        level: term.businessRelevance.level,
        reasons: term.businessRelevance.reasons
      },
      hotness,
      keywords,
      hashtags: keywords,
      related_companies: relatedCompanies,
      signals: topSources.length
        ? `${topSources.join(", ")} 중심 ${term.matches.length}개 신호`
        : `${term.label} 관련 기본 추적 신호`,
      articles: term.matches.slice(0, 4).map(({ article }) => ({
        title: article.title,
        source: article.source,
        url: article.link,
        time: formatKst(article.publishedAt)
      })),
      brief: term.brief
    };
  });

  if (latestNewsArticles.length + termAgendas.length >= 5) {
    return [
      ...latestNewsArticles.map(({ article, businessRelevance }, index) =>
        buildNewsAgenda(article, generatedAt, index, businessRelevance)
      ),
      ...termAgendas.slice(0, 5 - latestNewsArticles.length)
    ].map((agenda, index) => ({ ...agenda, rank: index + 1 }));
  }

  termAgendas.flatMap((agenda) => agenda.sources.map((source) => source.url)).forEach((url) => usedUrls.add(url));
  const rankedArticles = articles
    .map((article) => {
      const businessRelevance = businessRelevanceForArticle(article, generatedAt);
      return {
        article,
        businessRelevance,
        strategicScore: strategicImportanceScore(article),
        latestScore: latestArticleScore(article, businessRelevance, generatedAt)
      };
    })
    .filter(
      ({ article, businessRelevance, strategicScore }) =>
        article.link &&
        article.title &&
        isAiBusinessArticle(article) &&
        businessRelevance.score >= 45 &&
        (strategicScore >= 12 || businessRelevance.score >= 74) &&
        !isMarketSpeculationArticle(article)
    )
    .sort(
      (a, b) =>
        b.latestScore - a.latestScore ||
        b.businessRelevance.score - a.businessRelevance.score ||
        b.article.publishedAt - a.article.publishedAt
    );
  const fallbackNewsArticles = [];
  for (const item of rankedArticles) {
    if (usedUrls.has(item.article.link)) continue;
    usedUrls.add(item.article.link);
    fallbackNewsArticles.push(item);
    if (fallbackNewsArticles.length >= 5 - termAgendas.length) break;
  }
  const latestNews = fallbackNewsArticles.map(({ article, businessRelevance }, index) =>
    buildNewsAgenda(article, generatedAt, termAgendas.length + index, businessRelevance)
  );

  return [...termAgendas, ...latestNews].map((agenda, index) => ({ ...agenda, rank: index + 1 }));
}

function buildCompanies(scoredTerms, generatedAt, articles = []) {
  const scoreMap = new Map(scoredTerms.map((term) => [term.id, term.score]));
  const signalMap = new Map(scoredTerms.map((term) => [term.id, term]));
  const labelMap = new Map(agendaTerms.map((term) => [term.id, term]));

  return companies.map((company) => {
    const rankedCandidates = company.agendas
      .map((agenda, index) => {
        const termId = agenda.term;
        const term = labelMap.get(termId);
        const termSignal = signalMap.get(termId) || { ...term, matches: [], score: 0, sourceCount: 0 };
        const evidenceSources = sourcesForCompanyAgenda(company, agenda, termSignal, articles);
        const refinedAgenda = refineCompanyAgenda(company, agenda, evidenceSources);
        const rawScore = evidenceSources.length ? scoreMap.get(termId) || 1 : Math.max(1, (scoreMap.get(termId) || 1) * 0.45);
        return {
          label: refinedAgenda.label,
          weight: Math.min(98, Math.max(40, rawScore * 7 + 38 + (evidenceSources.length ? 8 : 0) - index * 5)),
          color: term.color,
          description: refinedAgenda.description,
          heat: refinedAgenda.heat || agenda.heat || [refinedAgenda.label, ...term.aliases.slice(0, 3)],
          sources: evidenceSources,
          sourceSummary: sourceSummaryForCompanyAgenda(evidenceSources, term, company),
          takeaway: refinedAgenda.takeaway || takeawayForCompanyAgenda(company, refinedAgenda, termId),
          termId,
          term
        };
      })
      .sort((a, b) => Number(Boolean(b.sources.length)) - Number(Boolean(a.sources.length)) || b.weight - a.weight);
    const ranked = [];
    const seenLabels = new Set();
    for (const item of rankedCandidates) {
      const key = item.label.replace(/\s+/g, "").toLowerCase();
      if (seenLabels.has(key)) continue;
      seenLabels.add(key);
      ranked.push(item);
    }

    return {
      id: company.id,
      name: company.name,
      sector: company.sector,
      color: company.color,
      short: company.short,
      focus: company.focus,
      updatedAt: `${formatKst(generatedAt)} KST`,
      keywords: ranked.slice(0, 5).map(({ label, weight, color, description, termId, sources, sourceSummary, takeaway }) => ({
        label,
        weight,
        color,
        description,
        termId,
        sources,
        sourceSummary,
        takeaway
      })),
      stack: ranked.slice(0, 3).map(({ label, description, weight, termId, sources, sourceSummary, takeaway }) => ({
        title: label,
        body: description,
        score: String(Math.round(weight)),
        date: formatKst(generatedAt),
        termId,
        sources,
        sourceSummary,
        takeaway
      })),
      heat: ranked.flatMap(({ heat }) => heat).slice(0, 12)
    };
  }).sort((a, b) => {
    const aPriority = companyPriority.indexOf(a.id);
    const bPriority = companyPriority.indexOf(b.id);
    return (aPriority === -1 ? 999 : aPriority) - (bPriority === -1 ? 999 : bPriority);
  });
}

const businessKeywordDefinitions = [
  {
    id: "nvidia-korea",
    label: "피지컬 AI 파트너십 전선",
    aliases: ["nvidia", "엔비디아", "젠슨 황", "피지컬 ai", "로봇", "크래프톤"],
    color: "#0f8f82",
    pattern: /젠슨|jensen|huang|엔비디아|nvidia|피지컬\s*ai|로보틱스|로봇|크래프톤|방한/i,
    description: "엔비디아의 한국 파트너십, 로봇·게임·제조 AI 협력 신호입니다.",
    brief: {
      background: "젠슨 황 방한과 국내 기업 회동은 피지컬 AI와 GPU 생태계가 한국 산업 파트너를 찾는 신호입니다.",
      reaction: "게임, 제조, 로봇, 반도체 기업들이 엔비디아 스택과의 접점을 빠르게 확인하고 있습니다.",
      implication: "국내 AI 사업자는 GPU 의존 기능, 로봇·시뮬레이션 연동, 파트너십 후보를 같은 표로 점검해야 합니다."
    }
  },
  {
    id: "ai-chip-supply",
    label: "국내 NPU·GPU 수주전",
    aliases: ["hbm", "ai 반도체", "gpu", "npu", "칩", "가속기"],
    color: "#3563c8",
    pattern: /hbm|ai\s*(?:반도체|칩)|gpu|npu|칩셋|가속기|마이크론|리벨리온|퓨리오사|국산.*반도체/i,
    description: "추론 원가, GPU 조달, 국산 NPU 도입 가능성을 좌우하는 공급망·수주 신호입니다.",
    brief: {
      background: "HBM과 AI 칩 수급은 모델 성능보다 서비스 원가와 출시 속도에 직접 영향을 줍니다.",
      reaction: "대기업과 스타트업은 GPU 대체 옵션, 국산 NPU, 클라우드 조달 조건을 함께 검토하고 있습니다.",
      implication: "견적과 제안서에는 GPU/HBM 의존도, 대체 인프라, 비용 변동 시나리오를 미리 넣어야 합니다."
    }
  },
  {
    id: "vertical-slm-cost",
    label: "특화 SLM 도입 단가",
    aliases: ["slm", "소형언어모델", "특화 모델", "경량 모델", "도입 단가", "온프레미스"],
    color: "#7a5a26",
    pattern: /slm|소형언어모델|경량\s*모델|특화\s*(?:모델|llm)|산업\s*특화|온프레미스|도입\s*단가|추론\s*비용|비용\s*절감|프라이빗\s*ai/i,
    description: "범용 LLM API가 아니라 산업별 SLM·온프레미스 도입 단가가 구매 기준이 되는 신호입니다.",
    brief: {
      background: "기업 AI 도입은 범용 챗봇보다 부서·산업별 데이터에 맞춘 작고 저렴한 모델 요구로 이동하고 있습니다.",
      reaction: "고객사는 모델 성능보다 월 추론비, 온프레미스 가능성, 데이터 반출 리스크를 같이 비교합니다.",
      implication: "제안서에는 범용 API, 특화 SLM, 온프레미스 옵션의 월 단가와 보안 조건을 한 표로 넣어야 합니다."
    }
  },
  {
    id: "security-alliance",
    label: "AI 보안 인증·감사 로그",
    aliases: ["kisa", "보안", "글래스윙", "anthropic", "권한", "감사"],
    color: "#c54b40",
    pattern: /kisa|글래스윙|glasswing|앤트로픽|anthropic|보안|위협|권한|감사|통제|유출/i,
    description: "AI 도입 심사에서 권한, 감사 로그, 보안 검증이 전면에 올라오는 흐름입니다.",
    brief: {
      background: "AI가 업무 시스템에 연결되면서 보안 기관과 글로벌 모델사의 협력 신호가 커지고 있습니다.",
      reaction: "기업 고객은 기능 데모보다 권한 통제, 로그, 사고 대응 체계를 구매 조건으로 보기 시작했습니다.",
      implication: "B2B AI 제품은 보안 체크리스트, 관리자 승인 플로우, 감사 로그 화면을 영업 자료에 먼저 넣어야 합니다."
    }
  },
  {
    id: "finance-ax",
    label: "금융 AX PoC 단가",
    aliases: ["금융", "ax", "kt", "은행", "보험", "증권"],
    color: "#d68419",
    pattern: /금융|은행|보험|증권|카드|ax|인공지능\s*전환|kt/i,
    description: "금융권 AI 전환 교육, PoC 단가, 규제 대응 수요를 보여주는 B2B 영업 신호입니다.",
    brief: {
      background: "금융권은 보안과 규제가 강하지만 AX 예산과 내부 생산성 요구가 동시에 커지고 있습니다.",
      reaction: "통신·클라우드·솔루션 기업이 금융 특화 패키지와 실무자 교육을 앞세우고 있습니다.",
      implication: "금융 고객용 PoC는 규정 준수, 데이터 비식별, 업무별 ROI 지표를 한 장으로 정리해야 합니다."
    }
  },
  {
    id: "sovereign-procurement",
    label: "국산 파운데이션 모델 조달전",
    aliases: ["소버린", "공공", "정부", "과기정통부", "정책", "국산"],
    color: "#3f8f4f",
    pattern: /소버린|공공|정부|과기정통부|정책|국방|조달|국산|파운데이션\s*모델/i,
    description: "공공 조달, 독자 모델, 로컬 데이터 요구가 국내 AI 사업 기회로 연결되는 신호입니다.",
    brief: {
      background: "AI 인프라와 모델이 산업 정책으로 해석되며 공공·국산화 요구가 커지고 있습니다.",
      reaction: "국내 플랫폼, 통신사, 모델 스타트업은 공공 조달과 산업별 모델을 동시에 겨냥합니다.",
      implication: "사업자는 공공 레퍼런스, 국내 데이터 처리, 보안 인증 로드맵을 제안서 앞단에 둬야 합니다."
    }
  },
  {
    id: "enterprise-copilot",
    label: "사내 코파일럿 권한 설계",
    aliases: ["copilot", "업무 자동화", "office", "agent", "워크플로"],
    color: "#7a5a26",
    pattern: /copilot|코파일럿|업무\s*자동화|워크플로|office|teams|agent|에이전트/i,
    description: "단순 챗봇이 아니라 사내 권한·문서·업무 시스템에 붙는 운영형 AI 수요입니다.",
    brief: {
      background: "기업 AI 도입의 병목은 모델 성능보다 기존 업무 시스템과의 연결, 권한, 운영 관리로 이동했습니다.",
      reaction: "플랫폼 기업은 업무 도구와 코파일럿을 묶고, 고객사는 부서별 워크플로 적용 가능성을 비교합니다.",
      implication: "제품 로드맵에는 API 연결 범위, 승인 단계, 운영 로그, 부서별 템플릿을 함께 설계해야 합니다."
    }
  }
];

function fallbackKeywordLabel(term) {
  const labels = {
    agent: "업무 에이전트 권한·로그",
    mcp: "사내 시스템 연결 표준",
    "on-device": "온디바이스·NPU 도입",
    sovereign: "소버린·공공 AI 조달",
    evalops: "AI 보안·평가 운영",
    "ai-code": "AI 코딩 운영 자동화"
  };
  return labels[term.id] || term.label;
}

function buildSpecificKeywordData(articles, generatedAt, scoredTerms) {
  const businessKeywords = businessKeywordDefinitions
    .map((definition, index) => {
      const matches = articles
        .filter((article) => definition.pattern.test(`${article.title} ${article.summary} ${article.source}`))
        .map((article) => ({
          article,
          businessRelevance: businessRelevanceForArticle(article, generatedAt)
        }))
        .sort(
          (a, b) =>
            b.businessRelevance.score - a.businessRelevance.score ||
            b.article.publishedAt - a.article.publishedAt
        );
      const sourceCount = new Set(matches.map(({ article }) => article.source)).size;
      const topScore = matches[0]?.businessRelevance.score || 0;
      return {
        ...definition,
        matches,
        sourceCount,
        scoreValue: Math.min(98, Math.max(54, topScore + matches.length * 2 + sourceCount * 3 - index * 2))
      };
    })
    .filter((definition) => definition.matches.length)
    .sort((a, b) => b.scoreValue - a.scoreValue || b.sourceCount - a.sourceCount)
    .slice(0, 6)
    .map((definition) => ({
      id: definition.id,
      label: definition.label,
      score: definition.scoreValue,
      aliases: definition.aliases,
      keywords: [...new Set(definition.matches.slice(0, 4).flatMap(({ article }) => hashtagsForArticle(article)))],
      color: definition.color,
      description: definition.description,
      brief: definition.brief,
      signals: `${definition.matches.length}개 기사 신호 · ${definition.sourceCount || 1}개 소스`,
      timeline: definition.matches.slice(0, 4).map(({ article, businessRelevance }) => ({
        time: formatKst(article.publishedAt),
        title: article.title,
        type: article.source,
        source: article.source,
        url: article.link,
        summary: articleDetailSummary(article, businessRelevance),
        takeaway: articleActionBrief(article).nextStep
      }))
    }));

  const usedIds = new Set(businessKeywords.map((keyword) => keyword.id));
  const fallbacks = scoredTerms
    .filter((term) => !usedIds.has(term.id))
    .slice(0, Math.max(0, 6 - businessKeywords.length))
    .map((term, index) => {
      const score = Math.min(92, Math.max(52, term.score * 6 + 48 - index * 2));
      return {
        id: term.id,
        label: fallbackKeywordLabel(term),
        score,
        aliases: term.aliases,
        keywords: hashtagsForTerm(term, term.matches),
        color: term.color,
        description: term.description,
        brief: term.brief,
        signals: `${term.matches.length || 3}개 기사 신호 · ${term.sourceCount || 2}개 소스`,
        timeline: term.matches.slice(0, 4).map(({ article }) => ({
          time: formatKst(article.publishedAt),
          title: article.title,
          type: article.source,
          source: article.source,
          url: article.link,
          summary: articleDetailSummary(article, businessRelevanceForArticle(article, generatedAt)),
          takeaway: articleActionBrief(article).nextStep
        }))
      };
    });

  return [...businessKeywords, ...fallbacks].map((keyword) => {
    const timeline = [...keyword.timeline];
    while (timeline.length < 4) {
      timeline.push({
        time: formatKst(new Date(generatedAt.getTime() - timeline.length * 45 * 60 * 1000)),
        title: `${keyword.label} 관련 시장 신호 추적 업데이트`,
        type: "Radar",
        source: "Radar",
        url: ""
      });
    }
    return { ...keyword, timeline };
  });
}

function buildKeywordData(scoredTerms, generatedAt) {
  return scoredTerms.slice(0, 6).map((term, index) => {
    const score = Math.min(98, Math.max(52, term.score * 7 + 50 - index * 2));
    const timeline = term.matches.slice(0, 4).map(({ article }) => ({
      time: formatKst(article.publishedAt),
      title: article.title,
      type: article.source,
      source: article.source,
      url: article.link,
      summary: articleDetailSummary(article, businessRelevanceForArticle(article, generatedAt)),
      takeaway: articleActionBrief(article).nextStep
    }));

    while (timeline.length < 4) {
      timeline.push({
        time: formatKst(new Date(generatedAt.getTime() - timeline.length * 45 * 60 * 1000)),
        title: `${term.label} 관련 시장 신호 추적 업데이트`,
        type: "Radar",
        source: "Radar",
        url: ""
      });
    }

    return {
      id: term.id,
      label: term.label,
      score,
      aliases: term.aliases,
      keywords: hashtagsForTerm(term, term.matches),
      color: term.color,
      description: term.description,
      brief: term.brief,
      signals: `${term.matches.length || 3}개 기사 신호 · ${term.sourceCount || 2}개 소스`,
      timeline
    };
  });
}

function sourceSignalsFromArticles(articles) {
  const counts = new Map();
  for (const article of articles) counts.set(article.source, (counts.get(article.source) || 0) + 1);
  const ranked = [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 3);
  const max = ranked[0]?.[1] || 1;
  return ranked.map(([name, count]) => [name, widthPercent(count, max)]);
}

function soWhatForAgenda(agenda, index) {
  const haystack = `${agenda.title} ${agenda.summary} ${(agenda.hashtags || agenda.keywords || []).join(" ")}`.toLowerCase();
  if (/젠슨|엔비디아|nvidia|피지컬|로봇|크래프톤/.test(haystack)) {
    return {
      title: "파트너십",
      body: "피지컬 AI 파트너십 신호는 로봇, 게임, 제조 연동 기회입니다. 오늘 할 일: GPU 의존 기능과 국내 파트너 후보를 한 장으로 정리하세요.",
      color: "#0f8f82",
      action: "파트너 후보 점검"
    };
  }
  if (/hbm|반도체|gpu|npu|칩|가속기/.test(haystack)) {
    return {
      title: "원가·인프라",
      body: "국내 NPU·GPU 수주전은 추론 원가와 출시 속도 리스크입니다. 오늘 할 일: GPU/NPU 대체안, 클라우드 단가, SLA 가정을 업데이트하세요.",
      color: "#3563c8",
      action: "원가 시나리오 업데이트"
    };
  }
  if (/slm|소형|경량|특화|온프레미스|추론비|단가/.test(haystack)) {
    return {
      title: "도입 단가",
      body: "특화 SLM 신호는 범용 API 대체 가능성을 묻는 구매 질문입니다. 오늘 할 일: API형, SLM형, 온프레미스형 월 단가표를 만드세요.",
      color: "#7a5a26",
      action: "SLM 단가표 작성"
    };
  }
  if (/kisa|보안|글래스윙|권한|감사|통제|안전성|벤치마크|평가|세이프티/.test(haystack)) {
    return {
      title: "보안 심사",
      body: "KISA·AI 보안 협력은 구매 심사가 더 엄격해진다는 신호입니다. 오늘 할 일: 권한, 로그, 승인 플로우를 제안서 앞단에 넣으세요.",
      color: "#c54b40",
      action: "보안 체크리스트 보강"
    };
  }
  if (/금융|ax|kt|은행|보험|증권/.test(haystack)) {
    return {
      title: "세일즈",
      body: "금융 AX 신호는 규제 대응형 PoC 수요입니다. 오늘 할 일: 금융 업무 1개를 골라 ROI, 비식별, 감사 로그 패키지로 묶으세요.",
      color: "#d68419",
      action: "금융 PoC 패키지화"
    };
  }
  return {
    title: ["제품", "시장", "전략"][index % 3],
    body: `${agenda.title} 흐름은 제품 로드맵보다 구매 조건을 먼저 바꿀 수 있습니다. 오늘 할 일: 원문 1건을 읽고 영업·보안·인프라 영향만 분리하세요.`,
    color: colors[index % colors.length],
    action: "영향 분리"
  };
}

function buildImpactNotes(hotAgendas) {
  const notes = [];
  const seen = new Set();
  for (const agenda of hotAgendas) {
    const note = soWhatForAgenda(agenda, notes.length);
    const key = `${note.title}-${note.action}`;
    if (seen.has(key)) continue;
    seen.add(key);
    notes.push(note);
    if (notes.length >= 3) break;
  }
  const fallbackNotes = [
    {
      title: "원가·인프라",
      body: "국내 NPU·GPU 수주전은 조달과 단가 변동 리스크입니다. 오늘 할 일: GPU/NPU 대체안과 추론 단가 가정을 업데이트하세요.",
      color: "#3563c8",
      action: "원가 시나리오 업데이트"
    },
    {
      title: "도입 단가",
      body: "특화 SLM 신호는 범용 API 대체 가능성을 묻는 구매 질문입니다. 오늘 할 일: API형, SLM형, 온프레미스형 월 단가표를 만드세요.",
      color: "#7a5a26",
      action: "SLM 단가표 작성"
    },
    {
      title: "세일즈",
      body: "금융·제조 AX 신호는 규제 대응형 PoC 수요입니다. 오늘 할 일: 고객 업종 1개를 골라 ROI와 감사 로그 패키지로 묶으세요.",
      color: "#d68419",
      action: "PoC 패키지화"
    }
  ];
  for (const note of fallbackNotes) {
    if (notes.length >= 3) break;
    const key = `${note.title}-${note.action}`;
    if (seen.has(key)) continue;
    seen.add(key);
    notes.push(note);
  }
  return notes;
}

function buildData(articles, rawCount) {
  const generatedAt = new Date();
  const start = new Date(generatedAt.getTime() - 24 * 60 * 60 * 1000);
  const nextUpdate = nextKstMorning(generatedAt);
  const recent = articles.filter((article) => article.publishedAt >= start);
  const usableArticles = recent.length >= 12 ? recent : articles.slice(0, 80);
  const scoredTerms = scoreTerms(usableArticles);
  const hotAgendas = buildHotAgendas(scoredTerms, generatedAt, usableArticles);

  return {
    metadata: {
      snapshotDate: formatKstKey(generatedAt),
      generatedAt: `${formatKst(generatedAt)} KST`,
      baseDate: formatKstDate(generatedAt),
      windowLabel: `${formatKst(start)} - ${formatKst(generatedAt)} KST`,
      nextUpdate: `${formatKst(nextUpdate)} KST`
    },
    metrics: {
      articles: usableArticles.length,
      blogs: new Set(usableArticles.map((article) => article.source)).size,
      dedupeRate: `${Math.round((1 - usableArticles.length / Math.max(rawCount, usableArticles.length, 1)) * 100)}%`,
      newAgendas: `+${hotAgendas.length}`
    },
    sourceSignals: sourceSignalsFromArticles(usableArticles),
    monitoredSources: sources.map(({ name, region, kind, url, feed }) => ({ name, region, kind, url, feed })),
    collectionQueue: [
      [`${formatKst(nextUpdate)}`, "Domestic and global AI source sweep"],
      [`${formatKst(new Date(nextUpdate.getTime() + 15 * 60 * 1000))}`, "Agenda clustering and company signal scoring"],
      [`${formatKst(new Date(nextUpdate.getTime() + 30 * 60 * 1000))}`, "Dashboard data publish"]
    ],
    impactNotes: buildImpactNotes(hotAgendas),
    hotAgendas,
    companies: buildCompanies(scoredTerms, generatedAt, usableArticles),
    keywordData: buildSpecificKeywordData(usableArticles, generatedAt, scoredTerms)
  };
}

async function existingData() {
  try {
    const source = await readFile(jsOutputPath, "utf8");
    const match = source.match(/window\.TECH_AGENDA_DATA\s*=\s*([\s\S]*?);\s*$/);
    return match ? JSON.parse(match[1]) : null;
  } catch {
    return null;
  }
}

function compactSnapshot(data) {
  return {
    date: data.metadata?.snapshotDate || "",
    metadata: data.metadata,
    metrics: data.metrics,
    sourceSignals: data.sourceSignals,
    hotAgendas: data.hotAgendas,
    impactNotes: data.impactNotes,
    companies: data.companies,
    keywordData: data.keywordData
  };
}

async function writeSnapshotAndLoadRecent(latestData, limit = 3) {
  await mkdir(historyDir, { recursive: true });
  const snapshotDate = latestData.metadata.snapshotDate;
  const snapshotPath = resolve(historyDir, `${snapshotDate}.json`);
  await writeFile(snapshotPath, `${JSON.stringify(latestData, null, 2)}\n`);

  const files = (await readdir(historyDir))
    .filter((file) => /^\d{4}-\d{2}-\d{2}\.json$/.test(file))
    .sort()
    .reverse()
    .slice(0, limit);

  const snapshots = [];
  for (const file of files) {
    try {
      const snapshot = JSON.parse(await readFile(resolve(historyDir, file), "utf8"));
      snapshots.push(compactSnapshot(snapshot));
    } catch (error) {
      console.warn(`[warn] Could not read history/${file}: ${error.message}`);
    }
  }
  return snapshots;
}

function safeInlineScript(source) {
  return source.replace(/<\/script/gi, "<\\/script");
}

async function rebuildShareHtml() {
  let html = await readFile(indexPath, "utf8");
  const css = await readFile(cssPath, "utf8");
  const data = safeInlineScript(await readFile(jsOutputPath, "utf8"));
  const app = safeInlineScript(await readFile(appPath, "utf8"));

  html = html
    .replace(/<link rel="stylesheet" href="styles\.css(?:\?[^"]*)?" \/>/, `<style>\n${css}\n</style>`)
    .replace(/<script src="agenda-data\.js(?:\?[^"]*)?"><\/script>/, `<script>\n${data}\n</script>`)
    .replace(/<script src="app\.js(?:\?[^"]*)?" defer><\/script>/, `<script defer>\n${app}\n</script>`);

  await writeFile(shareHtmlPath, html);
  await writeFile(shareTextPath, html);
}

async function refreshHtmlAssetVersions(version) {
  for (const htmlPath of [indexPath, restoredHtmlPath]) {
    const html = await readFile(htmlPath, "utf8");
    const nextHtml = html
      .replace(/href="styles\.css(?:\?v=[^"]*)?"/, `href="styles.css?v=${version}"`)
      .replace(/src="agenda-data\.js(?:\?v=[^"]*)?"/, `src="agenda-data.js?v=${version}"`)
      .replace(/src="app\.js(?:\?v=[^"]*)?"/, `src="app.js?v=${version}"`);

    await writeFile(htmlPath, nextHtml);
  }
}

async function main() {
  const rawItems = (await Promise.all(sources.map(fetchSource))).flat();
  const articles = uniqByTitle(rawItems).sort((a, b) => b.publishedAt - a.publishedAt);

  if (!articles.length) {
    const previous = await existingData();
    if (previous) {
      console.warn("[warn] No fresh feed items. Keeping existing agenda-data.js.");
      return;
    }
    throw new Error("No feed items could be fetched, and no existing data file was found.");
  }

  const latestData = buildData(articles, rawItems.length);
  await enrichHotAgendaImages(latestData, articles);
  const days = await writeSnapshotAndLoadRecent(latestData, 3);
  const data = {
    ...latestData,
    days
  };
  const json = JSON.stringify(data, null, 2);
  await writeFile(jsOutputPath, `window.TECH_AGENDA_DATA = ${json};\n`);
  await writeFile(jsonOutputPath, `${json}\n`);
  await refreshHtmlAssetVersions(assetVersionFromGeneratedAt(data.metadata.generatedAt));
  await rebuildShareHtml();
  console.log(
    `[ok] Updated agenda data with ${data.metrics.articles} articles from ${data.metrics.blogs} sources. Main file keeps ${days.length} day snapshots. Share HTML rebuilt.`
  );
}

main().catch((error) => {
  console.error(`[error] ${error.message}`);
  process.exitCode = 1;
});
