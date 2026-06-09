const colors = ["#3f5f8f", "#5a4f8f", "#b66b35", "#a6535c", "#52616b"];
const appData = window.TECH_AGENDA_DATA || {};
const publicShareUrl = String(window.AI_MONITORING_DESK_PUBLIC_URL || "").trim();
const asArray = (value, fallback = []) => (Array.isArray(value) ? value : fallback);
let metadata = appData.metadata || {
  generatedAt: "2026.05.26 09:20 KST",
  baseDate: "2026.05.26 Tue",
  windowLabel: "2026.05.25 09:20 - 2026.05.26 09:20 KST",
  nextUpdate: "2026.05.26 10:00 KST"
};
let metrics = appData.metrics || {
  articles: 386,
  blogs: 42,
  dedupeRate: "91%",
  newAgendas: "+18"
};
let sourceSignals = asArray(appData.sourceSignals, [
  ["The Verge", "84%"],
  ["OpenAI Blog", "73%"],
  ["Hacker News", "66%"]
]);
const monitoredSources = asArray(appData.monitoredSources, [
  { name: "AI Times", region: "KR", kind: "RSS", url: "https://www.aitimes.com/", feed: "https://cdn.aitimes.com/rss/gn_rss_allArticle.xml" },
  { name: "The Verge AI", region: "Global", kind: "RSS", url: "https://www.theverge.com/ai-artificial-intelligence" },
  { name: "TechCrunch AI", region: "Global", kind: "RSS", url: "https://techcrunch.com/category/artificial-intelligence/" },
  { name: "Naver IT", region: "KR", kind: "Portal", url: "https://news.naver.com/section/105" }
]);
const collectionQueue = asArray(appData.collectionQueue, [
  ["2026.05.26 10:00", "AI infra earnings call transcript sweep"],
  ["2026.05.26 10:15", "GitHub trending repos delta scan"],
  ["2026.05.26 10:30", "Korean portal tech desk refresh"]
]);
let impactNotes = asArray(appData.impactNotes, [
  ["제품", "에이전트 기능은 단일 기능 출시보다 권한, 로그, 실패 복구 UX를 포함한 운영 경험으로 평가됩니다.", "#3f5f8f"],
  ["시장", "모델 성능 경쟁은 여전히 중요하지만 연결성, 로컬 추론, 지역 규제가 구매 논리를 빠르게 바꾸고 있습니다.", "#b66b35"],
  ["전략", "파트너십 우선순위는 모델 공급자보다 데이터 소스, 업무 시스템, 보안 벤더까지 넓어져야 합니다.", "#5a4f8f"]
]);
const snapshots = asArray(appData.days, []);
let activeSnapshotDate = metadata.snapshotDate || snapshots[0]?.date || "";

let hotAgendas = asArray(appData.hotAgendas, [
  {
    id: "mcp-expansion",
    collectedAt: "2026.05.26 09:18 KST",
    title: "Anthropic의 MCP 생태계 확장 가속화와 오픈소스 서버 라인업 확대",
    summary: "Claude Code, Desktop Agent, 외부 툴 연결이 하나의 개발자 운영면으로 묶이는 흐름입니다.",
    mentions: 126,
    sources: 34,
    momentum: "+42%",
    signals: "MCP 서버 18건, 개발자 도구 11건, 파트너십 5건",
    brief: {
      background: "AI 앱이 단일 챗봇을 넘어 업무 도구와 직접 연결되면서 표준화된 컨텍스트 프로토콜 수요가 급증했습니다.",
      reaction: "개발자 커뮤니티는 서버 템플릿과 보안 권한 모델을 빠르게 검증하고 있으며, 빅테크도 호환 레이어를 탐색 중입니다.",
      implication: "엔터프라이즈 AI 제품은 모델 성능보다 연결 가능한 업무 시스템 범위와 권한 통제가 차별화 포인트가 됩니다."
    }
  },
  {
    id: "agent-security",
    collectedAt: "2026.05.26 09:12 KST",
    title: "빅테크 기업들의 자율형 AI Agent 보안 가이드라인 공동 수립 움직임",
    summary: "에이전트가 이메일, 코드, 결제 흐름까지 실행하기 시작하며 안전한 실행 경계가 핵심 의제로 떠올랐습니다.",
    mentions: 103,
    sources: 29,
    momentum: "+35%",
    signals: "보안 권고 9건, 정책 초안 4건, 레드팀 사례 7건",
    brief: {
      background: "AI Agent가 조회를 넘어 쓰기, 구매, 배포 같은 실제 행위를 수행하면서 오작동 비용이 커졌습니다.",
      reaction: "시장에서는 샌드박스, 승인 게이트, 감사 로그를 기본 요구사항으로 보기 시작했고 보안 벤더의 포지셔닝이 빨라졌습니다.",
      implication: "Agent 플랫폼 경쟁은 워크플로 자동화 속도와 함께 책임 추적, 권한 위임, 롤백 체계의 완성도로 갈립니다."
    }
  },
  {
    id: "on-device",
    collectedAt: "2026.05.26 08:55 KST",
    title: "온디바이스 AI 경쟁이 NPU, 개인정보, 지연시간 중심으로 재편",
    summary: "모바일과 PC 제조사가 모델 경량화와 로컬 추론 UX를 동시에 전면 배치하고 있습니다.",
    mentions: 89,
    sources: 24,
    momentum: "+28%",
    signals: "칩셋 발표 6건, SDK 업데이트 8건, 개인정보 메시지 10건",
    brief: {
      background: "클라우드 추론 비용과 개인정보 규제가 맞물리며 일부 AI 기능을 기기 내부에서 처리하려는 압력이 커졌습니다.",
      reaction: "소비자 기기 업체는 배터리, 지연시간, 프라이버시를 묶어 마케팅하고 개발자에게 로컬 모델 API를 열고 있습니다.",
      implication: "서비스 사업자는 클라우드 모델 하나가 아니라 로컬, 엣지, 서버 모델을 라우팅하는 제품 설계가 필요합니다."
    }
  },
  {
    id: "sovereign-ai",
    collectedAt: "2026.05.26 08:30 KST",
    title: "국가별 Sovereign AI 투자 확대와 로컬 클라우드 연합 전략 부상",
    summary: "정부, 통신사, 클라우드 사업자가 데이터 주권과 자체 모델 확보를 같은 프레임으로 다루고 있습니다.",
    mentions: 74,
    sources: 21,
    momentum: "+19%",
    signals: "정부 예산 5건, 클라우드 리전 7건, 로컬 LLM 6건",
    brief: {
      background: "AI 인프라가 산업 경쟁력과 안보 이슈로 해석되면서 데이터와 컴퓨트를 국내 통제권 안에 두려는 요구가 강해졌습니다.",
      reaction: "클라우드 사업자는 현지 파트너십을 늘리고, 각국 기업은 산업별 특화 모델과 공공 조달 채널을 동시에 노립니다.",
      implication: "글로벌 AI 기업은 단일 SaaS 확장보다 지역별 규제, 데이터 거버넌스, 로컬 파트너 번들 전략을 정교화해야 합니다."
    }
  },
  {
    id: "ai-code",
    collectedAt: "2026.05.26 08:05 KST",
    title: "AI 코딩 도구가 IDE 보조를 넘어 저장소 운영과 배포 검증으로 확장",
    summary: "코드 생성보다 이슈 triage, 테스트 수정, PR 리뷰 자동화가 새 관심사로 이동하고 있습니다.",
    mentions: 68,
    sources: 19,
    momentum: "+16%",
    signals: "IDE 플러그인 12건, CI 자동화 5건, 코드 리뷰 사례 9건",
    brief: {
      background: "개발자가 생성형 코딩에 익숙해지면서 병목이 코드 작성에서 검증, 리뷰, 배포 신뢰성으로 이동했습니다.",
      reaction: "툴 업체들은 터미널, GitHub, CI를 연결한 장시간 작업 에이전트를 내세우며 팀 단위 생산성 지표를 강조합니다.",
      implication: "기업 도입 판단은 라인 수 증가보다 실패 복구, 테스트 통과율, 보안 리뷰 누락 감소 같은 운영 지표로 옮겨갑니다."
    }
  }
]);

const briefFromHot = (index) => (hotAgendas[index] || hotAgendas[0] || {}).brief;

let companies = asArray(appData.companies, [
  {
    id: "anthropic",
    name: "Anthropic",
    sector: "Model Provider",
    color: "#3f5f8f",
    short: "AN",
    focus: "MCP와 에이전트 개발면",
    updatedAt: "2026.05.26 09:10 KST",
    keywords: [
      { label: "MCP", weight: 96, color: "#3f5f8f" },
      { label: "Claude Code", weight: 84, color: "#5a4f8f" },
      { label: "Desktop Agent", weight: 70, color: "#b66b35" },
      { label: "Tool Use", weight: 64, color: "#52616b" },
      { label: "Safety Eval", weight: 48, color: "#a6535c" }
    ],
    stack: [
      ["MCP 서버 확장", "외부 업무 시스템을 Claude 안으로 끌어오는 개발자 생태계 전략이 뚜렷합니다.", "96", "2026.05.26 09:10"],
      ["Claude Code 운영화", "코딩 보조에서 리포지토리 단위 작업 수행으로 제품 메시지가 이동했습니다.", "84", "2026.05.26 08:45"],
      ["데스크톱 권한 모델", "개인 업무 환경 접근성이 커지는 만큼 승인과 감사 로그가 동반 의제로 부상했습니다.", "70", "2026.05.25 22:15"]
    ],
    heat: ["MCP", "Code", "Agent", "Eval", "Server", "IDE", "Logs", "Policy", "Tool", "Shell", "Docs", "Team"]
  },
  {
    id: "openai",
    name: "OpenAI",
    sector: "Model Platform",
    color: "#5a4f8f",
    short: "OA",
    focus: "에이전트 플랫폼과 멀티모달",
    updatedAt: "2026.05.26 09:05 KST",
    keywords: [
      { label: "Agents SDK", weight: 90, color: "#5a4f8f" },
      { label: "Realtime", weight: 76, color: "#3f5f8f" },
      { label: "Responses API", weight: 72, color: "#b66b35" },
      { label: "EvalOps", weight: 58, color: "#a6535c" },
      { label: "Video Gen", weight: 51, color: "#52616b" }
    ],
    stack: [
      ["Agents SDK", "모델 호출보다 상태, 툴, 핸드오프를 관리하는 앱 프레임워크로 무게가 실립니다.", "90", "2026.05.26 09:05"],
      ["Realtime UX", "음성, 화면, 이벤트 입력을 묶어 에이전트 인터페이스를 더 연속적으로 만들고 있습니다.", "76", "2026.05.26 08:20"],
      ["평가 자동화", "엔터프라이즈 도입의 병목인 신뢰성 검증을 플랫폼 내부 기능으로 흡수합니다.", "58", "2026.05.25 18:40"]
    ],
    heat: ["SDK", "Voice", "Eval", "API", "Video", "Store", "Tool", "Safety", "Router", "Fine-tune", "Trace", "Apps"]
  },
  {
    id: "google",
    name: "Google",
    sector: "Cloud & Search",
    color: "#b66b35",
    short: "GO",
    focus: "검색 재구성과 온디바이스",
    updatedAt: "2026.05.26 08:50 KST",
    keywords: [
      { label: "Gemini", weight: 91, color: "#b66b35" },
      { label: "AI Overviews", weight: 79, color: "#5a4f8f" },
      { label: "On-Device", weight: 74, color: "#3f5f8f" },
      { label: "TPU", weight: 61, color: "#a6535c" },
      { label: "Workspace AI", weight: 49, color: "#52616b" }
    ],
    stack: [
      ["검색 AI 재편", "검색 결과 페이지가 답변, 쇼핑, 광고 경험을 동시에 바꾸는 압력 지점입니다.", "91", "2026.05.26 08:50"],
      ["로컬 Gemini", "Android와 Chrome 생태계에서 지연시간과 개인정보 메시지를 선점하려는 움직임입니다.", "74", "2026.05.26 07:55"],
      ["TPU 스택", "모델 경쟁을 클라우드 원가와 인프라 락인 전략까지 연결합니다.", "61", "2026.05.25 23:10"]
    ],
    heat: ["Search", "Gemini", "Ads", "TPU", "Android", "Chrome", "Cloud", "Workspace", "NPU", "Maps", "YouTube", "Vertex"]
  },
  {
    id: "naver",
    name: "Naver",
    sector: "Korea Platform",
    color: "#52616b",
    short: "NV",
    focus: "소버린 AI와 검색 커머스",
    updatedAt: "2026.05.26 08:35 KST",
    keywords: [
      { label: "HyperCLOVA X", weight: 88, color: "#52616b" },
      { label: "Sovereign AI", weight: 80, color: "#3f5f8f" },
      { label: "Search Commerce", weight: 66, color: "#b66b35" },
      { label: "Public Cloud", weight: 55, color: "#5a4f8f" },
      { label: "Korean Data", weight: 50, color: "#a6535c" }
    ],
    stack: [
      ["소버린 AI", "국내 데이터와 공공 클라우드 요구를 묶어 로컬 AI 인프라 사업성을 강화합니다.", "80", "2026.05.26 08:35"],
      ["검색 커머스 AI", "광고, 쇼핑, 콘텐츠 추천을 생성형 검색 경험 안에서 재배치하려는 흐름입니다.", "66", "2026.05.26 07:30"],
      ["한국어 데이터 우위", "범용 모델 경쟁보다 로컬 언어와 산업 문맥의 정밀도를 차별화합니다.", "50", "2026.05.25 20:25"]
    ],
    heat: ["Korean", "Search", "Cloud", "Gov", "Commerce", "Data", "LLM", "Maps", "Creator", "Ad", "Public", "B2B"]
  },
  {
    id: "microsoft",
    name: "Microsoft",
    sector: "Enterprise Stack",
    color: "#a6535c",
    short: "MS",
    focus: "Copilot 운영면과 보안",
    updatedAt: "2026.05.26 09:00 KST",
    keywords: [
      { label: "Copilot", weight: 94, color: "#a6535c" },
      { label: "Graph Grounding", weight: 78, color: "#5a4f8f" },
      { label: "Agent Builder", weight: 72, color: "#3f5f8f" },
      { label: "Security Copilot", weight: 62, color: "#b66b35" },
      { label: "Azure AI", weight: 54, color: "#52616b" }
    ],
    stack: [
      ["Copilot 확장", "업무 데이터와 Office UX를 한데 묶어 AI를 기본 업무 레이어로 밀고 있습니다.", "94", "2026.05.26 09:00"],
      ["Graph Grounding", "기업 내부 문맥을 모델 응답 품질과 권한 통제의 핵심 자산으로 활용합니다.", "78", "2026.05.26 08:05"],
      ["보안 Copilot", "보안 운영 자동화가 에이전트 도입의 초기 지불 의사가 높은 영역으로 부상했습니다.", "62", "2026.05.25 21:45"]
    ],
    heat: ["Copilot", "Graph", "Azure", "Defender", "Teams", "Office", "Agent", "Identity", "SOC", "Data", "Fabric", "Dev"]
  }
]);

let keywordData = asArray(appData.keywordData, [
  {
    id: "agent",
    label: "Agent",
    score: 98,
    color: "#3f5f8f",
    description: "툴 실행, 장시간 작업, 승인 게이트가 함께 언급됩니다.",
    brief: briefFromHot(1),
    signals: "에이전트 SDK 14건, 보안 정책 9건, 업무 자동화 사례 17건",
    timeline: [
      ["2026.05.26 09:10", "OpenAI와 Microsoft 파트너사가 엔터프라이즈 에이전트 템플릿을 확대", "플랫폼"],
      ["2026.05.26 08:35", "보안 업계가 브라우저 조작형 에이전트의 승인 로그 표준을 제안", "보안"],
      ["2026.05.26 07:50", "개발자 커뮤니티에서 장시간 코딩 에이전트의 비용 제어 방식 논의 증가", "개발자"],
      ["2026.05.25 23:20", "클라우드 사업자가 에이전트 런타임 과금 단위를 세분화", "인프라"]
    ]
  },
  {
    id: "mcp",
    label: "MCP",
    score: 93,
    color: "#5a4f8f",
    description: "외부 시스템 연결 표준으로 빠르게 제품 메시지화되고 있습니다.",
    brief: briefFromHot(0),
    signals: "서버 템플릿 18건, IDE 통합 7건, 보안 권한 논의 6건",
    timeline: [
      ["2026.05.26 09:25", "Anthropic 생태계 문서와 커뮤니티 서버 목록 업데이트가 동시 확산", "프로토콜"],
      ["2026.05.26 08:40", "오픈소스 저장소에서 MCP 서버 스타터가 인기 저장소로 상승", "오픈소스"],
      ["2026.05.26 07:30", "기업 내부 데이터 연결 시 권한 범위를 좁히는 패턴 논의 증가", "보안"],
      ["2026.05.25 21:55", "개발 툴 벤더들이 MCP 지원 여부를 로드맵에 반영", "파트너"]
    ]
  },
  {
    id: "on-device",
    label: "On-Device",
    score: 86,
    color: "#b66b35",
    description: "모바일, PC, 브라우저에서 로컬 추론 메시지가 강화됩니다.",
    brief: briefFromHot(2),
    signals: "NPU 벤치마크 8건, 프라이버시 메시지 10건, SDK 릴리스 5건",
    timeline: [
      ["2026.05.26 09:05", "PC 제조사가 로컬 AI 기능을 배터리 효율 지표와 함께 발표", "디바이스"],
      ["2026.05.26 08:10", "모바일 OS 업데이트에서 개인화 추론의 온디바이스 처리 비중 확대", "모바일"],
      ["2026.05.26 07:10", "브라우저 내 경량 모델 API 논의가 개발자 포럼에서 재점화", "웹"],
      ["2026.05.25 22:40", "칩셋 업체가 NPU 최적화 모델 카탈로그를 공개", "반도체"]
    ]
  },
  {
    id: "sovereign",
    label: "Sovereign AI",
    score: 79,
    color: "#52616b",
    description: "정부, 통신, 클라우드가 로컬 데이터 주권을 사업화합니다.",
    brief: briefFromHot(3),
    signals: "공공 조달 5건, 로컬 클라우드 7건, 국가 AI 펀드 4건",
    timeline: [
      ["2026.05.26 09:00", "아시아권 정부가 공공 AI 인프라 조달 기준에 데이터 주권 항목 추가", "정책"],
      ["2026.05.26 08:15", "통신사와 클라우드사가 산업 특화 LLM 공동 영업을 확대", "파트너십"],
      ["2026.05.26 06:45", "로컬 언어 데이터셋 품질 평가가 국가 AI 프로젝트의 핵심 KPI로 부상", "데이터"],
      ["2026.05.25 20:50", "글로벌 모델 사업자의 현지 리전 투자 발표가 이어짐", "클라우드"]
    ]
  },
  {
    id: "evalops",
    label: "EvalOps",
    score: 72,
    color: "#a6535c",
    description: "모델 도입 이후의 품질 추적과 회귀 테스트가 중요해집니다.",
    brief: {
      background: "AI 기능이 프로덕션 워크플로에 들어가며 프롬프트 변경, 모델 교체, 툴 추가가 모두 품질 리스크가 됐습니다.",
      reaction: "플랫폼과 스타트업은 평가 데이터셋, 추적, 실패 재현 기능을 묶어 LLMOps의 다음 계층으로 포지셔닝합니다.",
      implication: "AI 제품팀은 출시 전 데모보다 운영 중 회귀 감지와 부서별 품질 기준 관리 능력을 먼저 설계해야 합니다."
    },
    signals: "평가 프레임워크 6건, 추적 도구 8건, 고객 사례 5건",
    timeline: [
      ["2026.05.26 09:15", "AI 플랫폼이 프롬프트 변경 전후 회귀 리포트를 기본 기능으로 추가", "품질"],
      ["2026.05.26 08:05", "금융권 사례에서 모델 답변 감사 로그가 구매 조건으로 언급", "엔터프라이즈"],
      ["2026.05.26 07:20", "오픈소스 평가 하네스가 멀티턴 시나리오 지원을 확대", "오픈소스"],
      ["2026.05.25 22:35", "모니터링 업체가 hallucination rate와 task success를 결합한 지표 공개", "운영"]
    ]
  },
  {
    id: "ai-code",
    label: "AI Code",
    score: 69,
    color: "#8a6846",
    description: "코드 생성에서 저장소 운영과 검증 자동화로 관심이 이동합니다.",
    brief: briefFromHot(4),
    signals: "PR 자동화 7건, CI 수정 5건, IDE 확장 12건",
    timeline: [
      ["2026.05.26 09:30", "개발 툴 업체가 이슈 분석부터 테스트 수정까지 이어지는 에이전트 플로우를 공개", "개발툴"],
      ["2026.05.26 08:45", "기업 사례에서 AI 코드 리뷰의 보안 누락 감소 효과가 언급", "보안"],
      ["2026.05.26 07:15", "오픈소스 프로젝트가 자동 PR triage 봇의 운영 규칙을 정비", "커뮤니티"],
      ["2026.05.25 21:00", "CI 로그를 읽고 실패 테스트를 수정하는 기능이 주요 비교 항목으로 등장", "운영"]
    ]
  }
]);

let activeCompanyId = companies[0]?.id || "naver";
let activeKeywordId = keywordData[0]?.id || "agent";
let activeSignalQuery = "";
let signalSearchMatches = [];
let currentCardNewsItems = [];
let lastFocus = null;
const savedQueryStorageKey = "marketSignal.savedQueries";
const themeStorageKey = "marketSignal.theme";

const byId = (id) => document.getElementById(id);
const activeCompany = () => companies.find((company) => company.id === activeCompanyId);
const activeKeyword = () => keywordData.find((keyword) => keyword.id === activeKeywordId) || keywordData[0];
const currentTheme = () => (document.documentElement.dataset.theme === "dark" ? "dark" : "light");
const escapeHtml = (value = "") =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
const truncateText = (value = "", max = 42) => {
  const text = String(value).trim();
  return text.length > max ? `${text.slice(0, max).trim()}...` : text;
};
const normalizeTimelineItem = (entry) => {
  if (Array.isArray(entry)) {
    return {
      time: entry[0],
      title: entry[1],
      type: entry[2],
      url: entry[3] || "",
      source: entry[4] || entry[2] || "Source",
      summary: entry[5] || "",
      takeaway: entry[6] || ""
    };
  }
  return {
    time: entry.time,
    title: entry.title,
    type: entry.type || entry.source,
    url: entry.url || "",
    source: entry.source || entry.type || "Source",
    summary: entry.summary || entry.context || "",
    takeaway: entry.takeaway || entry.action || ""
  };
};
const normalizeTag = (value = "") =>
  String(value)
    .replace(/^#/, "")
    .toLowerCase()
    .replace(/[^a-z0-9가-힣]/g, "");
const displayTag = (value = "") => {
  const tag = String(value).trim();
  return tag.startsWith("#") ? tag : `#${tag}`;
};
const genericTags = new Set(["news", "ai", "인공지능", "tech", "기술"]);
const tagRules = [
  { type: "action", tag: "#투자", pattern: /투자|유치|펀딩|출자|인수|m&a/i },
  { type: "action", tag: "#출시", pattern: /출시|공개|런칭|업데이트|발표/i },
  { type: "action", tag: "#협력", pattern: /협력|파트너|제휴|연합|생태계/i },
  { type: "company", tag: "#NVIDIA", pattern: /엔비디아|nvidia|젠슨|jensen|huang/i },
  { type: "risk", tag: "#규제", pattern: /규제|정부|정책|개인정보|보호|전장|자율무기|저작권/i },
  { type: "risk", tag: "#보안", pattern: /보안|위협|위험|유출|권한|감사|통제/i },
  { type: "tech", tag: "#피지컬AI", pattern: /피지컬\s*ai|physical ai|로보틱스|로봇|자율주행|스마트팩토리/i },
  { type: "tech", tag: "#Agent", pattern: /agent|에이전트|자동화|비서|상담/i },
  { type: "tech", tag: "#OnDevice", pattern: /온디바이스|on-device|npu|모바일|갤럭시/i },
  { type: "tech", tag: "#AI반도체", pattern: /hbm|반도체|gpu|nvidia|엔비디아|칩|가속기|데이터센터/i },
  { type: "topic", tag: "#소버린AI", pattern: /소버린|sovereign|국산|로컬|공공|금융/i }
];
const companyTagNames = [
  "Naver",
  "네이버",
  "Kakao",
  "카카오",
  "SKT",
  "SK Telecom",
  "Samsung",
  "삼성",
  "LG",
  "KT",
  "Upstage",
  "업스테이지",
  "Fasoo",
  "파수",
  "NVIDIA",
  "엔비디아",
  "OpenAI",
  "Anthropic",
  "Google",
  "Microsoft"
];
const getAgendaSources = (agenda) => {
  if (!agenda) return [];
  if (Array.isArray(agenda.sources)) {
    return agenda.sources
      .map((source) => ({
        title: source.title || source.media || "원문 기사",
        url: source.url || source.link || "",
        media: source.media || source.source || "Source",
        time: source.time || source.publishedAt || ""
      }))
      .filter((source) => source.url);
  }
  return (agenda.articles || [])
    .map((article) => ({
      title: article.title || "원문 기사",
      url: article.url || article.link || "",
      media: article.media || article.source || "Source",
      time: article.time || article.publishedAt || ""
    }))
    .filter((source) => source.url);
};
const getAgendaSourceCount = (agenda) => {
  if (!agenda) return 0;
  if (typeof agenda.sourceCount === "number") return agenda.sourceCount;
  if (Array.isArray(agenda.sources)) return agenda.sources.length;
  if (typeof agenda.sources === "number") return agenda.sources;
  return getAgendaSources(agenda).length;
};
const getAgendaKeywords = (agenda) => {
  const values = agenda?.keywords || agenda?.hashtags || [];
  const haystack = `${agenda?.title || ""} ${agenda?.summary || ""} ${agenda?.reason || ""} ${agenda?.whyHot || ""}`;
  const inferred = tagRules.filter((rule) => rule.pattern.test(haystack)).map((rule) => rule.tag);
  const companyTags = companyTagNames
    .filter((name) => haystack.toLowerCase().includes(name.toLowerCase()))
    .map((name) => `#${name.replace(/\s+/g, "")}`);
  const explicit = values
    .map(displayTag)
    .filter((tag) => !genericTags.has(normalizeTag(tag)));
  return [...new Set([...inferred, ...companyTags, ...explicit])].slice(0, 4);
};
const tagType = (tag) => {
  const normalized = normalizeTag(tag);
  if (/투자|출시|협력|인수|m&a|공략|제휴/.test(normalized)) return "action";
  if (/규제|보안|개인정보|위험|통제|리스크|저작권/.test(normalized)) return "risk";
  if (/agent|mcp|ondevice|온디바이스|반도체|hbm|gpu|칩|llm|소버린/.test(normalized)) return "tech";
  if (companyTagNames.some((name) => normalizeTag(name) === normalized)) return "company";
  return "topic";
};
const sparklineBars = (keyword, index) => {
  const base = Math.max(24, Math.min(92, Math.round(keyword.weight || 40)));
  return Array.from({ length: 8 }, (_, barIndex) => {
    const drift = ((barIndex * 13 + keyword.label.length * 7 + index * 11) % 31) - 10;
    const lift = Math.round(barIndex * 2.2);
    const height = Math.max(18, Math.min(96, base - 22 + drift + lift));
    return `<i style="height:${height}%"></i>`;
  }).join("");
};
const calmSignalColor = (index) => ["#3f5f8f", "#5a4f8f", "#b66b35", "#52616b"][index % 4];
const parseKstDate = (value = "") => {
  const match = String(value).match(/(\d{4})\.(\d{2})\.(\d{2})\s+(\d{2}):(\d{2})/);
  if (!match) return null;
  const [, year, month, day, hour, minute] = match.map(Number);
  return new Date(Date.UTC(year, month - 1, day, hour - 9, minute));
};
const freshnessLabel = () => {
  const generatedAt = parseKstDate(metadata.generatedAt);
  if (!generatedAt) return `Updated ${metadata.generatedAt}`;
  const minutes = Math.max(0, Math.round((Date.now() - generatedAt.getTime()) / 60000));
  if (minutes < 1) return "Updated just now";
  if (minutes < 60) return `Updated ${minutes} mins ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `Updated ${hours}h ago`;
  return `Updated ${metadata.generatedAt}`;
};
const getAgendaReason = (agenda) =>
  agenda?.reason ||
  agenda?.whyHot ||
  agenda?.signals ||
  "최근 기사 신호와 키워드 언급량이 함께 상승했습니다.";
const getShareUrl = () => publicShareUrl || window.location.href.split("#")[0];
const getAgendaScore = (agenda) =>
  typeof agenda?.score === "number" ? agenda.score : Math.min(100, Math.max(40, Math.round((agenda?.mentions || 60) / 1.4)));
const getHotnessBreakdown = (agenda) => {
  if (Array.isArray(agenda?.hotness?.reasons) && agenda.hotness.reasons.length) return agenda.hotness.reasons;
  const sourceCount = getAgendaSourceCount(agenda);
  const articleCount = getAgendaSources(agenda).length || Math.min(sourceCount, 4);
  const mentions = agenda?.mentions || getAgendaScore(agenda);
  const companyCount = Array.isArray(agenda?.related_companies) ? agenda.related_companies.length : 0;
  return [
    {
      label: "매체 분산",
      value: `${sourceCount}개`,
      detail: "서로 다른 매체에서 같은 의제가 반복 감지됐습니다."
    },
    {
      label: "기사 신호",
      value: `${articleCount}건`,
      detail: "최근 수집 기사 중 직접 관련성이 높은 원문입니다."
    },
    {
      label: "언급 밀도",
      value: `${mentions}회`,
      detail: "제목과 요약에서 핵심 키워드가 가중치 있게 반복됐습니다."
    },
    {
      label: "기업 연결",
      value: companyCount ? `${companyCount}곳` : "추적 중",
      detail: "주요 기업의 제품, 정책, 인프라 움직임과 연결됩니다."
    }
  ];
};

const queryText = (value = "") =>
  String(value)
    .toLowerCase()
    .replace(/[#·,()]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
const queryTokens = (query = "") =>
  queryText(query)
    .split(" ")
    .map((token) => token.trim())
    .filter((token) => token.length >= 2);
const uniqueBy = (items, keyFn) => {
  const seen = new Set();
  return items.filter((item) => {
    const key = keyFn(item);
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

function getSavedQueries() {
  try {
    return JSON.parse(localStorage.getItem(savedQueryStorageKey) || "[]").filter(Boolean).slice(0, 8);
  } catch {
    return [];
  }
}

function setSavedQueries(values) {
  localStorage.setItem(savedQueryStorageKey, JSON.stringify(values.slice(0, 8)));
}

function applyTheme(theme, persist = true) {
  const nextTheme = theme === "dark" ? "dark" : "light";
  document.documentElement.dataset.theme = nextTheme;
  if (persist) localStorage.setItem(themeStorageKey, nextTheme);
  document.querySelectorAll("[data-theme-option]").forEach((button) => {
    const selected = button.dataset.themeOption === nextTheme;
    button.setAttribute("aria-pressed", String(selected));
  });
}

function flattenSignalItems() {
  const items = [];

  hotAgendas.forEach((agenda) => {
    const keywords = getAgendaKeywords(agenda);
    const companiesForAgenda = asArray(agenda.related_companies);
    getAgendaSources(agenda).forEach((source) => {
      items.push({
        title: source.title || agenda.title,
        url: source.url,
        media: source.media,
        time: source.time || agenda.collectedAt || metadata.generatedAt,
        summary: agenda.summary || getAgendaReason(agenda),
        takeaway: agenda.actionBrief?.nextStep || agenda.brief?.implication || getAgendaReason(agenda),
        agenda: agenda.title,
        keywords,
        companies: companiesForAgenda,
        sourceType: "Hot News",
        brief: agenda.brief
      });
    });
  });

  companies.forEach((company) => {
    asArray(company.keywords).forEach((keyword) => {
      asArray(keyword.sources).forEach((source) => {
        items.push({
          title: source.title || keyword.label,
          url: source.url,
          media: source.media || company.name,
          time: source.time || company.updatedAt || metadata.generatedAt,
          summary: source.summary || keyword.description || company.focus,
          takeaway: source.takeaway || keyword.takeaway || company.focus,
          agenda: `${company.name} · ${keyword.label}`,
          keywords: [keyword.label, ...(keyword.keywords || [])].map(displayTag),
          companies: [company.name],
          sourceType: "Company Radar",
          brief: {
            background: source.summary || keyword.description || `${company.name} 관련 신호입니다.`,
            reaction: source.evidence || keyword.sourceSummary || company.focus,
            implication: source.takeaway || keyword.takeaway || "영업, 제품, 파트너십 관점에서 후속 확인이 필요합니다."
          }
        });
      });
    });
  });

  keywordData.forEach((keyword) => {
    asArray(keyword.timeline).map(normalizeTimelineItem).forEach((item) => {
      items.push({
        title: item.title,
        url: item.url,
        media: item.source || item.type || "Timeline",
        time: item.time,
        summary: item.summary || keyword.description,
        takeaway: item.takeaway || keyword.brief?.implication || keyword.description,
        agenda: keyword.label,
        keywords: [keyword.label, ...(keyword.keywords || [])].map(displayTag),
        companies: companies.filter((company) => queryText(`${item.title} ${item.summary}`).includes(queryText(company.name))).map((company) => company.name),
        sourceType: "Keyword Timeline",
        brief: keyword.brief
      });
    });
  });

  return uniqueBy(
    items.filter((item) => item.title && (item.url || item.summary)),
    (item) => `${item.url || ""}-${queryText(item.title).slice(0, 80)}`
  );
}

function scoreSignalItem(item, query) {
  const tokens = queryTokens(query);
  if (!tokens.length) return 0;
  const haystack = queryText([
    item.title,
    item.summary,
    item.takeaway,
    item.agenda,
    item.media,
    ...(item.keywords || []),
    ...(item.companies || [])
  ].join(" "));
  let score = haystack.includes(queryText(query)) ? 42 : 0;
  tokens.forEach((token) => {
    if (haystack.includes(token)) score += 14;
    if (queryText(item.title).includes(token)) score += 10;
    if ((item.keywords || []).some((keyword) => queryText(keyword).includes(token))) score += 8;
    if ((item.companies || []).some((company) => queryText(company).includes(token))) score += 8;
  });
  return score;
}

function searchSignals(query) {
  const matches = flattenSignalItems()
    .map((item) => ({ ...item, score: scoreSignalItem(item, query) }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score || String(b.time).localeCompare(String(a.time)));
  return uniqueBy(matches, (item) => item.url || queryText(item.title)).slice(0, 8);
}

function topValues(matches, field, limit = 4) {
  const counts = new Map();
  matches.forEach((item) => {
    asArray(item[field]).forEach((value) => {
      const label = String(value).replace(/^#/, "").trim();
      if (!label || genericTags.has(normalizeTag(label))) return;
      counts.set(label, (counts.get(label) || 0) + 1);
    });
  });
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, limit)
    .map(([label]) => label);
}

function signalInsightForQuery(query, matches) {
  const haystack = queryText(`${query} ${matches.map((item) => `${item.title} ${item.summary} ${item.takeaway}`).join(" ")}`);
  const companiesForQuery = topValues(matches, "companies", 3);
  const keywordsForQuery = topValues(matches, "keywords", 3);
  const companyText = companiesForQuery.length ? companiesForQuery.join(", ") : "관련 기업";
  const keywordText = keywordsForQuery.length ? keywordsForQuery.join(", ") : query;
  const top = matches[0];

  if (/젠슨|엔비디아|nvidia|gpu|npu|반도체|hbm|팩토리|데이터센터/.test(haystack)) {
    return {
      issue: `${query}는 AI 인프라 조달, 파트너십, 원가 구조가 함께 움직이는 신호입니다.`,
      lens: `${companyText}의 움직임을 GPU/NPU 확보, 클라우드 단가, 공동 PoC 가능성으로 나눠 보세요.`,
      action: top?.takeaway || "서비스별 추론비, 대체 인프라, 파트너 후보를 같은 표에서 업데이트하세요."
    };
  }
  if (/보안|권한|감사|통제|개인정보|kisa|복원력/.test(haystack)) {
    return {
      issue: `${query}는 AI 도입 심사가 기능보다 통제와 책임 범위로 이동하는 신호입니다.`,
      lens: `${keywordText} 관련 원문에서 권한, 감사 로그, 데이터 반출 조건이 구매 조건인지 확인하세요.`,
      action: top?.takeaway || "제안서 앞단에 보안 통제 화면과 운영 책임 범위를 배치하세요."
    };
  }
  if (/네이버|naver|카카오|kakao|skt|삼성|lg|kt|업스테이지|리벨리온|퓨리오사/.test(haystack)) {
    return {
      issue: `${query}는 국내 AI 기업의 포지셔닝과 파트너십 우선순위를 읽는 검색입니다.`,
      lens: `${companyText}의 기사에서 고객군, 상품화 방식, 인프라 조건이 실제 매출 기회인지 분리하세요.`,
      action: top?.takeaway || "경쟁/협력/고객 제안 중 어디에 걸리는 신호인지 담당자별로 나누세요."
    };
  }
  return {
    issue: `${query} 관련 수집 신호 ${matches.length}건이 잡혔습니다.`,
    lens: `${keywordText} 관점에서 기사 제목보다 적용 산업, 발표 주체, 후속 일정이 있는지를 먼저 보세요.`,
    action: top?.takeaway || "원문 2건을 확인하고 제품, 영업, 파트너십 영향만 분리하세요."
  };
}

function suggestedQueries() {
  const fromHot = hotAgendas.flatMap((agenda) => getAgendaKeywords(agenda)).slice(0, 4);
  const fromCompanies = companies.slice(0, 3).map((company) => company.name);
  return [...new Set([...fromHot.map((tag) => tag.replace(/^#/, "")), ...fromCompanies])].slice(0, 6);
}

function renderSavedQueries() {
  const row = byId("savedQueryRow");
  if (!row) return;
  const saved = getSavedQueries();
  const chips = saved.length ? saved : suggestedQueries();
  row.innerHTML = `
    <span>${saved.length ? "내 추적 키워드" : "추천 키워드"}</span>
    ${chips
      .map(
        (query) => `<button class="query-chip" type="button" data-signal-query="${escapeHtml(query)}">${escapeHtml(query)}</button>`
      )
      .join("")}
  `;
}

function renderSignalSearch(query = activeSignalQuery) {
  const container = byId("signalSearchResult");
  if (!container) return;
  activeSignalQuery = String(query || "").trim();
  byId("signalSearchCount").textContent = activeSignalQuery ? "검색 결과" : "수집 데이터 기반";
  renderSavedQueries();

  if (!activeSignalQuery) {
    signalSearchMatches = [];
    container.innerHTML = `
      <div class="search-empty">
        <b>최근 신호를 바로 파고들 수 있습니다.</b>
        <span>${suggestedQueries().slice(0, 3).join(" · ")}</span>
      </div>
    `;
    return;
  }

  signalSearchMatches = searchSignals(activeSignalQuery);
  if (!signalSearchMatches.length) {
    container.innerHTML = `
      <div class="search-empty">
        <b>${escapeHtml(activeSignalQuery)} 관련 수집 신호가 아직 없습니다.</b>
        <span>관심 키워드로 저장하면 다음 수집 대상에 넣어 추적하기 좋습니다.</span>
      </div>
    `;
    return;
  }

  const insight = signalInsightForQuery(activeSignalQuery, signalSearchMatches);
  const companiesForQuery = topValues(signalSearchMatches, "companies", 4);
  const keywordsForQuery = topValues(signalSearchMatches, "keywords", 5);
  byId("signalSearchCount").textContent = `${signalSearchMatches.length}개 원문`;
  container.innerHTML = `
    <div class="search-insight-grid">
      <div>
        <span>핵심 신호</span>
        <b>${escapeHtml(insight.issue)}</b>
      </div>
      <div>
        <span>사업 렌즈</span>
        <b>${escapeHtml(insight.lens)}</b>
      </div>
      <div>
        <span>다음 액션</span>
        <b>${escapeHtml(insight.action)}</b>
      </div>
    </div>
    <div class="search-facets">
      ${companiesForQuery.map((company) => `<em>${escapeHtml(company)}</em>`).join("")}
      ${keywordsForQuery.map((keyword) => `<em>#${escapeHtml(keyword.replace(/^#/, ""))}</em>`).join("")}
    </div>
    <div class="search-result-list">
      ${signalSearchMatches
        .map(
          (item, index) => `
            <article class="search-result-item">
              <a href="${escapeHtml(item.url || "#")}" ${item.url ? 'target="_blank" rel="noopener noreferrer"' : ""}>
                <span>${escapeHtml(item.media || item.sourceType)} · ${escapeHtml(item.time || metadata.generatedAt)}</span>
                <b>${escapeHtml(item.title)}</b>
                <p>${escapeHtml(item.summary || item.agenda || "")}</p>
              </a>
              <button class="small-action search-brief-button" type="button" data-search-brief-index="${index}">Insight</button>
            </article>
          `
        )
        .join("")}
    </div>
  `;
}

function buildCardNewsItems() {
  const topAgendas = hotAgendas.slice(0, 3);
  const topTags = [...new Set(topAgendas.flatMap((agenda) => getAgendaKeywords(agenda)).map((tag) => tag.replace(/^#/, "")))].slice(0, 5);
  const leadAgenda = topAgendas[0];
  const actionBrief = leadAgenda?.actionBrief || {};
  const actionQuestion = actionBrief.question || actionBrief.decision || "오늘 사업 판단에 영향을 줄 신호를 확인하세요.";
  const actionTask = actionBrief.task || actionBrief.nextStep || "원문 2건을 읽고 제품, 영업, 파트너십 영향만 분리하세요.";

  return [
    {
      type: "cover",
      kicker: metadata.baseDate,
      title: "오늘의 AI 사업 신호",
      headMessage: `${metrics.articles}개 기사와 ${metrics.blogs}개 소스에서 감지한 오늘의 핵심 AI 이슈입니다.`,
      body: "핫뉴스, 근거, 오늘 확인할 질문을 회의 공유용 카드로 압축했습니다.",
      note: metadata.windowLabel,
      tags: topTags
    },
    ...topAgendas.map((agenda, index) => {
      const source = getAgendaSources(agenda)[0];
      const reason = getAgendaReason(agenda);
      const summary = agenda.summary && queryText(agenda.summary) !== queryText(agenda.title) ? agenda.summary : reason;
      return {
        type: "news",
        kicker: `핫뉴스 ${index + 1}`,
        title: agenda.title,
        headMessage: summary,
        body: reason,
        note: source?.title || `${source?.media || "원문"} 근거를 확인하세요.`,
        media: source?.media || "Source",
        score: `${getAgendaScore(agenda)}점`,
        imageUrl: agenda.imageUrl || "",
        imageAlt: agenda.imageAlt || `${agenda.title} 관련 이미지`,
        tags: getAgendaKeywords(agenda).map((tag) => tag.replace(/^#/, "")).slice(0, 3)
      };
    }),
    {
      type: "action",
      kicker: "So What",
      title: "오늘 바로 확인할 질문",
      headMessage: actionQuestion,
      body: actionTask,
      note: "내부 제품, 영업, 제휴 의사결정으로 연결할 항목만 남겨보세요.",
      tags: [actionBrief.owner || "전략", "원문 확인", "사업 액션"]
    }
  ];
}

function cardNewsText(items = currentCardNewsItems) {
  return items
    .map((item, index) => {
      const tags = item.tags?.length ? `\n태그: ${item.tags.map((tag) => `#${tag}`).join(" ")}` : "";
      const note = item.note ? `\n포인트: ${item.note}` : "";
      return `[${index + 1}/${items.length}] ${item.kicker}\n제목: ${item.title}\n헤드메시지: ${item.headMessage || item.body}\n본문 포인트: ${item.body}${note}${tags}`;
    })
    .join("\n\n");
}

function renderCardNewsDeck(forceBuild = false) {
  const workspace = byId("cardNewsWorkspace");
  const copyButton = byId("copyCardNewsButton");
  if (!workspace) return;

  if (forceBuild || currentCardNewsItems.length) {
    currentCardNewsItems = buildCardNewsItems();
    if (copyButton) copyButton.disabled = false;
    workspace.innerHTML = `
      <div class="card-news-deck">
        ${currentCardNewsItems
          .map(
            (item, index) => `
              <article class="card-news-card ${item.type}" style="--card-index:${index + 1}">
                <div class="card-news-copy">
                  <span>${escapeHtml(item.kicker)}</span>
                  <h3>${escapeHtml(item.title)}</h3>
                  <div class="card-news-head">
                    <small>헤드메시지</small>
                    <strong>${escapeHtml(item.headMessage || item.body)}</strong>
                  </div>
                  <p>${escapeHtml(item.body)}</p>
                  ${item.note ? `<em>${escapeHtml(item.note)}</em>` : ""}
                </div>
                ${
                  item.imageUrl
                    ? `<img src="${escapeHtml(item.imageUrl)}" alt="${escapeHtml(item.imageAlt || item.title)}" loading="lazy" />`
                    : ""
                }
                <div class="card-news-footer">
                  <b>${index + 1}/${currentCardNewsItems.length}</b>
                  <span>${(item.tags || []).map((tag) => `<i>#${escapeHtml(tag)}</i>`).join("")}</span>
                </div>
              </article>
            `
          )
          .join("")}
      </div>
    `;
    return;
  }

  if (copyButton) copyButton.disabled = true;
  workspace.innerHTML = `
    <div class="card-news-empty">
      <b>오늘 수집된 뉴스를 카드뉴스 형태로 정리할 수 있습니다.</b>
      <span>핫뉴스 3장, 핵심 질문 1장, 커버 1장으로 구성됩니다.</span>
    </div>
  `;
}

async function copyCardNews(button) {
  if (!currentCardNewsItems.length) renderCardNewsDeck(true);
  const text = cardNewsText();
  try {
    await navigator.clipboard.writeText(text);
    const previous = button.textContent;
    button.textContent = "복사됨";
    window.setTimeout(() => {
      button.textContent = previous;
    }, 1400);
  } catch {
    window.prompt("카드뉴스 텍스트", text);
  }
}

function renderMeta() {
  byId("syncTime").textContent = `${metadata.generatedAt} 수집`;
  const freshnessChip = byId("freshnessChip");
  if (freshnessChip) freshnessChip.textContent = freshnessLabel();
  const historyButtons = snapshots
    .map(
      (snapshot) => `
        <button class="history-chip ${snapshot.date === activeSnapshotDate ? "active" : ""}" type="button" data-snapshot-date="${escapeHtml(snapshot.date)}">
          ${escapeHtml(snapshot.date)}
        </button>
      `
    )
    .join("");
  byId("dateStrip").innerHTML = [
    [
      "기준일",
      metadata.baseDate,
      historyButtons
        ? `<span class="history-picker" aria-label="과거 스냅샷 선택"><span class="calendar-label" aria-hidden="true">▦ 아카이브</span>${historyButtons}</span>`
        : ""
    ],
    ["분석 기간", metadata.windowLabel],
    ["다음 갱신", metadata.nextUpdate]
  ]
    .map(
      ([label, value, extra = ""]) => `
        <div>
          <span class="date-label">${label}</span>
          <b>${value}</b>
          ${extra}
        </div>
      `
    )
    .join("");
}

function renderShareLink() {
  const strip = byId("shareStrip");
  if (!strip) return;
  strip.hidden = !publicShareUrl;
  if (!publicShareUrl) return;

  const link = byId("publicShareLink");
  link.href = publicShareUrl;
  link.textContent = publicShareUrl.replace(/^https?:\/\//, "");
}

function renderMetrics() {
  byId("metricGrid").innerHTML = [
    [metrics.articles, "기사"],
    [metrics.blogs, "소스"],
    [metrics.dedupeRate, "중복 제거"],
    [metrics.newAgendas, "신규"]
  ]
    .map(
      ([value, label]) => `
        <div class="metric-card">
          <span class="metric-value">${value}</span>
          <span class="metric-label">${label}</span>
        </div>
      `
    )
    .join("");

  byId("sourceStack").innerHTML = sourceSignals
    .map(
      ([name, width]) => `
        <div class="source-row">
          <span>${name}</span>
          <b style="--w: ${width}"></b>
        </div>
      `
    )
    .join("");
}

function renderActionBoard() {
  const agenda = hotAgendas[0];
  const sources = getAgendaSources(agenda);
  const primarySource = sources.find((source) => !String(source.title).includes("수집 대기"));
  const relatedCompany = companies.find((company) => (agenda?.related_companies || []).includes(company.name)) || companies[0];
  const companySignal = relatedCompany?.keywords?.[0];
  const agendaTitle = agenda?.title || "오늘의 핵심 의제";
  const agendaTags = getAgendaKeywords(agenda).slice(0, 2).join(" ");
  const actionBrief = agenda?.actionBrief || {
    topic: agendaTags || "핵심 AI 신호",
    why: getAgendaReason(agenda),
    owner: "전략",
    question: `${truncateText(agendaTitle, 46)} 이슈가 우리 제품, 고객 제안, 파트너십 우선순위를 바꾸나요?`,
    task: "원문에서 발표 주체, 적용 산업, 후속 계약 가능성을 확인하고 담당 액션을 정하세요.",
    sourceCheck: "기사 제목만 보지 말고 협력 범위, 적용 산업, 후속 일정이 있는지 확인하세요.",
    evidenceChecklist: "발표 주체, 적용 산업, 후속 계약 가능성"
  };
  const owner = actionBrief.owner || "전략";
  const question = actionBrief.question || actionBrief.decision || `${agendaTitle} 이슈를 오늘 판단하세요.`;
  const task = actionBrief.task || actionBrief.nextStep || "원문을 읽고 후속 액션을 정하세요.";
  const checklist = actionBrief.evidenceChecklist || actionBrief.sourceCheck || "발표 주체, 협력 범위, 적용 산업, 후속 일정";

  byId("actionBoard").innerHTML = [
    {
      label: "판단 질문",
      body: question,
      next: task,
      context: owner,
      why: actionBrief.why
    },
    {
      label: "원문 체크",
      body: primarySource
        ? `${primarySource.media} 원문에서 ${checklist} 항목을 확인하세요.`
        : "오늘 수집분에서 직접 원문이 부족합니다. 뉴스 모달의 판단 근거와 수집 링크를 먼저 확인하세요.",
      next: primarySource ? truncateText(primarySource.title, 64) : "원문 확보 후 다시 판단",
      href: primarySource?.url,
      context: primarySource?.media || "근거"
    },
    {
      label: "사업 연결",
      body: companySignal
        ? `${relatedCompany.name}의 ${companySignal.label} 신호와 연결해 고객 제안, 파트너십, 원가 영향 중 어디에 걸리는지 비교하세요.`
        : "회사별 근거 레이더에서 직접 원문이 붙은 신호를 우선 확인합니다.",
      next: companySignal?.takeaway || task,
      context: relatedCompany?.name || "회사 영향"
    }
  ]
    .map(
      (item) => `
        <div class="action-item">
          <span class="action-label">
            <b>${escapeHtml(item.label)}</b>
            <em>${escapeHtml(item.context || "체크")}</em>
          </span>
          ${item.why ? `<span class="action-why">${escapeHtml(item.why)}</span>` : ""}
          <p>${escapeHtml(item.body)}</p>
          ${item.next ? `<span class="action-next"><b>오늘 할 일</b><em>${escapeHtml(item.next)}</em></span>` : ""}
          ${item.href ? `<a href="${escapeHtml(item.href)}" target="_blank" rel="noopener noreferrer">원문 열기</a>` : ""}
        </div>
      `
    )
    .join("");
}

function renderSourceLinks() {
  const regionOrder = ["KR", "Global"];
  byId("sourceLinks").innerHTML = monitoredSources
    .slice()
    .sort((a, b) => regionOrder.indexOf(a.region) - regionOrder.indexOf(b.region) || a.name.localeCompare(b.name))
    .map(
      (source) => `
        <a class="source-link" href="${escapeHtml(source.url || source.feed)}" target="_blank" rel="noopener noreferrer">
          <span>
            <b>${escapeHtml(source.name)}</b>
            <em>${escapeHtml(source.region)} · ${escapeHtml(source.kind || "Link")}</em>
          </span>
          <strong>원문</strong>
        </a>
      `
    )
    .join("");
}

function renderHotList() {
  byId("hotList").innerHTML = hotAgendas
    .slice(0, 4)
    .map((agenda, index) => {
      const hashtags = getAgendaKeywords(agenda);
      const sourceCount = getAgendaSourceCount(agenda);
      const score = getAgendaScore(agenda);
      const metric = agenda.metric || agenda.momentum || `${sourceCount}개 매체`;
      const imageUrl = agenda.imageUrl || agenda.thumbnail || "";
      const imageAlt = agenda.imageAlt || `${agenda.title} 관련 이미지`;
      const imageCredit = agenda.imageCredit || getAgendaSources(agenda)[0]?.media || "관련 이미지";
      return `
        <li>
          <article class="hot-item ${imageUrl ? "" : "no-thumb"}" tabindex="0" role="button" data-agenda-id="${agenda.id}" aria-label="${escapeHtml(`${agenda.title} 브리핑 열기`)}" style="--agenda-color:${colors[index % colors.length]}">
            <span class="rank-badge">${index + 1}</span>
            <span class="hot-copy">
              <span class="hot-kicker">
                ${agenda.pinned ? `<span class="pin-badge">Pinned Hot</span>` : ""}
                <span>${escapeHtml(getAgendaSources(agenda)[0]?.media || "Source")}</span>
                <span class="date-badge">${escapeHtml(agenda.collectedAt || metadata.generatedAt)}</span>
              </span>
              <h3>${escapeHtml(agenda.title)}</h3>
              <p>${escapeHtml(agenda.summary || "")}</p>
              <span class="hot-reason">
                <b>왜 중요한가</b>
                <span>${escapeHtml(getAgendaReason(agenda))}</span>
              </span>
              <span class="hot-tags" aria-label="관련 해시태그">
                ${(hashtags.length ? hashtags : ["#확인필요"])
                  .slice(0, 2)
                  .map(
                    (tag) =>
                      `<button class="hot-tag" type="button" data-hot-tag="${escapeHtml(tag)}" data-tag-type="${tagType(tag)}">${escapeHtml(tag)}</button>`
                  )
                  .join("")}
              </span>
              <span class="hot-meta">
                <span>${sourceCount}개 매체 · ${escapeHtml(agenda.mentions || score)}회 신호</span>
              </span>
            </span>
            ${
              imageUrl
                ? `<span class="hot-thumb">
              <img src="${escapeHtml(imageUrl)}" alt="${escapeHtml(imageAlt)}" loading="lazy" />
              <em>${escapeHtml(imageCredit)}</em>
            </span>`
                : ""
            }
            <span class="hot-metrics">
              <span class="signal-badge">${escapeHtml(metric)}</span>
              <span class="score-badge">${score}점</span>
            </span>
          </article>
        </li>
      `;
    })
    .join("");
}

function signalSources(signal = {}) {
  return asArray(signal.sources).filter((source) => source?.url || source?.title);
}

function signalEvidenceLabel(sourceCount = 0) {
  if (sourceCount >= 3) return "근거 충분";
  if (sourceCount >= 1) return "추적 필요";
  return "원문 대기";
}

function compactSignalTime(value = "") {
  const text = String(value || "").replace(/\s*KST$/, "");
  const time = text.match(/(\d{1,2}:\d{2})/);
  if (time) return `${time[1]} 갱신`;
  return text ? "최근 갱신" : "갱신 대기";
}

function companyImpactScope(company) {
  return ["openai", "anthropic", "google", "microsoft"].includes(company.id) ? "벤치마크 영향" : "한국 사업 직접";
}

function companySignalMeta(company, signal = {}) {
  const sources = signalSources(signal);
  const latestSource = sources[0];
  return {
    judgement: signalEvidenceLabel(sources.length),
    sourceLabel: sources.length ? `원문 ${sources.length}건` : "직접 원문 대기",
    updatedLabel: compactSignalTime(latestSource?.time || latestSource?.date || company.updatedAt),
    scope: companyImpactScope(company),
    sourceSummary: signal?.sourceSummary || (sources.length ? `${sources[0].media || "원문"} 기반` : "직접 원문 수집 대기")
  };
}

function renderCompanyCards() {
  byId("companyCards").innerHTML = companies
    .map((company) => {
      const topSignal = company.keywords?.[0];
      const meta = companySignalMeta(company, topSignal);
      const reason = topSignal?.description || company.focus || "오늘 확인할 사업 신호를 수집 중입니다.";
      return `
        <button class="company-card ${company.id === activeCompanyId ? "active" : ""}" type="button" data-company-id="${company.id}" style="--company-color:${company.color}">
          <span class="company-card-head">
            <span class="company-logo">${company.short}</span>
            <span>
              <b>${escapeHtml(company.name)}</b>
              <em>${escapeHtml(company.sector)}</em>
            </span>
          </span>
          <span class="company-focus">${escapeHtml(company.focus)}</span>
          <span class="company-card-foot">
            <span>
              <em>오늘 볼 이유</em>
              <strong>${escapeHtml(topSignal?.label || "아젠다 수집 중")}</strong>
            </span>
            <em class="company-verdict">${escapeHtml(meta.judgement)}</em>
          </span>
          <span class="company-reason">${escapeHtml(reason)}</span>
          <span class="company-evidence-row">
            <em>${escapeHtml(meta.sourceLabel)}</em>
            <em>${escapeHtml(meta.updatedLabel)}</em>
            <em>${escapeHtml(meta.scope)}</em>
          </span>
          <span class="company-proof"><b>근거</b><em>${escapeHtml(meta.sourceSummary)}</em></span>
        </button>
      `;
    })
    .join("");
}

function companyKeywordDescription(company, keyword) {
  const matchingKeyword = keywordData.find(
    (item) => normalizeTag(item.label) === normalizeTag(keyword.label) || item.id === keyword.termId
  );
  const matchingStack = company.stack.find((entry) => {
    const title = Array.isArray(entry) ? entry[0] : entry.title;
    return normalizeTag(title).includes(normalizeTag(keyword.label));
  });
  const matchingStackBody = Array.isArray(matchingStack) ? matchingStack?.[1] : matchingStack?.body;
  return (
    keyword.description ||
    matchingKeyword?.description ||
    matchingStackBody ||
    `${company.name}의 제품 메시지와 기사 신호에서 반복적으로 잡히는 추진 키워드입니다.`
  );
}

function normalizeCompanyStackItem(entry, company) {
  if (Array.isArray(entry)) {
    return {
      title: entry[0],
      body: entry[1],
      score: entry[2],
      date: entry[3],
      sourceSummary: "근거 원문 수집 대기",
      takeaway: `${company.name}의 제품, 파트너십, 리스크 관점에서 후속 확인이 필요합니다.`,
      sources: []
    };
  }
  return {
    title: entry.title,
    body: entry.body,
    score: entry.score,
    date: entry.date,
    termId: entry.termId,
    sourceSummary: entry.sourceSummary || "근거 원문 수집 대기",
    takeaway: entry.takeaway || `${company.name}의 제품, 파트너십, 리스크 관점에서 후속 확인이 필요합니다.`,
    sources: entry.sources || []
  };
}

function collectCompanySources(company) {
  const rows = [];
  company.keywords.forEach((keyword) => {
    asArray(keyword.sources).forEach((source) => {
      rows.push({
        keyword: keyword.label,
        takeaway: keyword.takeaway,
        title: source.title || "회사 관련 원문",
        media: source.media || source.source || "Source",
        time: source.time || source.date || company.updatedAt,
        url: source.url || source.link || "",
        evidence: source.evidence || keyword.sourceSummary || "회사 최신 원문 신호",
        summary: source.summary || source.context || "",
        takeaway: source.takeaway || keyword.takeaway || ""
      });
    });
  });

  company.stack.forEach((entry) => {
    const item = normalizeCompanyStackItem(entry, company);
    asArray(item.sources).forEach((source) => {
      rows.push({
        keyword: item.title,
        takeaway: item.takeaway,
        title: source.title || "회사 관련 원문",
        media: source.media || source.source || "Source",
        time: source.time || source.date || item.date || company.updatedAt,
        url: source.url || source.link || "",
        evidence: source.evidence || item.sourceSummary,
        summary: source.summary || source.context || "",
        takeaway: source.takeaway || item.takeaway || ""
      });
    });
  });

  const seen = new Set();
  return rows
    .filter((row) => {
      const key = row.url || `${row.title}-${row.media}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return row.url || row.title;
    })
    .slice(0, 5);
}

function renderCompanyView() {
  const company = activeCompany();
  byId("companyName").textContent = company.name;
  byId("companySector").textContent = company.sector;
  byId("companyUpdated").textContent = `업데이트 ${company.updatedAt}`;

  byId("wordCloud").innerHTML = company.keywords
      .map((keyword, index) => {
      const description = companyKeywordDescription(company, keyword);
      const meta = companySignalMeta(company, keyword);
      const signalColor = calmSignalColor(index);
      return `
        <button class="business-signal-card" type="button" data-keyword-label="${escapeHtml(keyword.label)}" style="--signal-color:${signalColor}">
          <span class="signal-main">
            <span class="signal-title">
              <b>${escapeHtml(keyword.label)}</b>
              <em>${escapeHtml(meta.judgement)}</em>
            </span>
            <span class="signal-desc">${escapeHtml(description)}</span>
          </span>
          <span class="signal-proof-block">
            <b>어디서 나왔나</b>
            <em>${escapeHtml(keyword.sourceSummary || "원문 수집 대기")}</em>
          </span>
          <span class="signal-proof-block action">
            <b>활용 포인트</b>
            <em>${escapeHtml(keyword.takeaway || "제품, 영업, 파트너십 관점에서 후속 확인이 필요합니다.")}</em>
          </span>
        </button>
      `;
    })
    .join("");

  const companySources = collectCompanySources(company);
  byId("companyNewsList").innerHTML = `
    <div class="company-news-heading">
      <b>최근 원문</b>
      <span>${escapeHtml(company.name)} 전략 신호의 원문 요약과 활용 포인트</span>
    </div>
    <div class="company-news-items">
      ${
        companySources.length
          ? companySources
              .map(
                (source) => `
                  <a class="company-news-item" href="${escapeHtml(source.url)}" target="_blank" rel="noopener noreferrer">
                    <span class="news-meta">
                      <b>${escapeHtml(source.media)}</b>
                      <em>${escapeHtml(source.time)}</em>
                    </span>
                    <strong>${escapeHtml(source.title)}</strong>
                    <span class="news-context"><b>기사 내용</b>${escapeHtml(source.summary || `${source.keyword} · ${source.evidence || "근거 원문"}`)}</span>
                    <span class="news-context action"><b>활용</b>${escapeHtml(source.takeaway || source.evidence || "회사 전략과 연결해 후속 확인")}</span>
                  </a>
                `
              )
              .join("")
          : `<span class="empty-news">아직 직접 원문이 부족합니다. 수집 링크에서 회사명을 기준으로 재확인하세요.</span>`
      }
    </div>
  `;

  byId("agendaStack").innerHTML = company.stack
    .map((entry, index) => {
      const item = normalizeCompanyStackItem(entry, company);
      const sourceCount = item.sources.length;
      return `
        <button class="stack-item" type="button" data-stack-index="${index}">
          <span class="stack-top">
            <h3>${escapeHtml(item.title)}</h3>
            <span class="tag-pill">${escapeHtml(signalEvidenceLabel(sourceCount))}</span>
          </span>
          <span class="stack-date">${escapeHtml(item.date)} KST</span>
          <span class="stack-source">
            <b>근거</b>
            <em>${escapeHtml(item.sourceSummary)}</em>
            <strong>${sourceCount ? `원문 ${sourceCount}건` : "원문 대기"}</strong>
          </span>
          <p>${escapeHtml(item.body)}</p>
          <span class="stack-action">
            <b>활용 포인트</b>
            <em>${escapeHtml(item.takeaway)}</em>
          </span>
        </button>
      `;
    })
    .join("");
}

function renderKeywordMap() {
  byId("keywordMap").innerHTML = keywordData
    .map((keyword) => {
      const size = 18 + keyword.score / 9;
      return `
        <button class="keyword-bubble ${keyword.id === activeKeywordId ? "active" : ""}" type="button" data-keyword-id="${keyword.id}" style="--keyword-color:${keyword.color}; --bubble-size:${size}px">
          <b>${keyword.label}</b>
          <span>${keyword.description}</span>
          <strong class="keyword-score">${keyword.score}</strong>
        </button>
      `;
    })
    .join("");
}

function renderTimeline() {
  const keyword = activeKeyword();
  byId("timelineEyebrow").textContent = keyword.label;
  const firstItem = normalizeTimelineItem(keyword.timeline[0]);
  byId("timelineWindow").textContent = `${firstItem.time} KST 기준 최신순`;
  byId("timeline").innerHTML = keyword.timeline
    .map((entry, index) => {
      const item = normalizeTimelineItem(entry);
      const sourceLabel = item.source || item.type || "Source";
      const summaryText = item.summary || `${keyword.label} 관련 신호가 시장 내러티브와 기업 액션으로 연결되고 있습니다.`;
      const cardBody = `
            <span class="timeline-meta">
              <span class="date-badge">${escapeHtml(item.time)} KST</span>
              <span>${escapeHtml(sourceLabel)}</span>
            </span>
            <h3>${escapeHtml(item.title)}</h3>
            <p>${escapeHtml(summaryText)}</p>
            ${item.takeaway ? `<span class="timeline-takeaway">${escapeHtml(item.takeaway)}</span>` : ""}
            <span class="origin-label">${item.url ? "원문 열기" : "브리핑 보기"}</span>
      `;

      return `
        <div class="timeline-item" style="--timeline-color:${keyword.color}">
          ${
            item.url
              ? `<a class="timeline-link" href="${escapeHtml(item.url)}" target="_blank" rel="noopener noreferrer" data-timeline-index="${index}">${cardBody}</a>`
              : `<button class="timeline-link" type="button" data-timeline-brief-index="${index}">${cardBody}</button>`
          }
          <button class="timeline-brief" type="button" data-timeline-brief-index="${index}">AI Briefing ⚡</button>
        </div>
      `;
    })
    .join("");
}

function renderImpact() {
  byId("impactCopy").innerHTML = impactNotes
    .map((note) => {
      const title = Array.isArray(note) ? note[0] : note.title;
      const body = Array.isArray(note) ? note[1] : note.body;
      const color = Array.isArray(note) ? note[2] : note.color;
      const action = Array.isArray(note) ? "" : note.action;
      return `
        <div style="--accent:${escapeHtml(color || "#3f5f8f")}">
          <span class="impact-action">${escapeHtml(action || "오늘 할 일")}</span>
          <b>${escapeHtml(title || "So What")}</b>
          <p>${escapeHtml(body || "")}</p>
        </div>
      `;
    })
    .join("");
}

function renderQueue() {
  byId("queueList").innerHTML = collectionQueue
    .map(([time, label]) => `<div><span>${time}</span><b>${label}</b></div>`)
    .join("");
}

function renderModalSources(sources = []) {
  const container = byId("modalSourceLinks");
  const links = sources.slice(0, 5);
  container.hidden = !links.length;
  container.innerHTML = links.length
    ? `
      <span class="footer-label">대표 원문</span>
      <div>
        ${links
          .map(
            (source) => `
              <a href="${escapeHtml(source.url)}" target="_blank" rel="noopener noreferrer">
                <b>${escapeHtml(source.media || "Source")}</b>
                <span>${escapeHtml(source.title || "원문 보기")}</span>
              </a>
            `
          )
          .join("")}
      </div>
    `
    : "";
}

function renderModalHotness(hotness = []) {
  const container = byId("modalHotness");
  const reasons = hotness.slice(0, 4);
  container.hidden = !reasons.length;
  container.innerHTML = reasons.length
    ? `
      <span class="footer-label">중요도 판단 근거</span>
      <div>
        ${reasons
          .map(
            (item) => `
              <span>
                <b>${escapeHtml(item.label)}</b>
                <strong>${escapeHtml(item.value)}</strong>
                <em>${escapeHtml(item.detail || "")}</em>
              </span>
            `
          )
          .join("")}
      </div>
    `
    : "";
}

function openBrief({
  title,
  eyebrow = "Deep Dive",
  brief,
  signals,
  date = "2026.05.26 09:20 KST",
  sources = [],
  hotness = []
}) {
  const safeBrief = brief || {
    background: "관련 기사 신호를 기준으로 아젠다 맥락을 재구성했습니다.",
    reaction: "시장 반응은 소스 수, 기업 언급, 키워드 밀도의 결합으로 추정했습니다.",
    implication: "원문 확인과 함께 제품, 투자, 파트너십 관점의 후속 검토가 필요합니다."
  };
  lastFocus = document.activeElement;
  byId("modalEyebrow").textContent = eyebrow;
  byId("modalTitle").textContent = title;
  byId("modalDate").textContent = date;
  byId("modalSignals").textContent = signals;
  byId("briefLines").innerHTML = [
    ["발생 배경", safeBrief.background, "#3f5f8f"],
    ["시장의 반응", safeBrief.reaction, "#b66b35"],
    ["전략적 시사점", safeBrief.implication, "#5a4f8f"]
  ]
    .map(
      ([label, body, color]) => `
        <div class="brief-line" style="--accent:${color}">
          <b>${label}</b>
          <p>${body}</p>
        </div>
      `
    )
    .join("");
  renderModalHotness(hotness);
  renderModalSources(sources);
  byId("modalBackdrop").hidden = false;
  byId("closeModal").focus();
}

function closeBrief() {
  byId("modalBackdrop").hidden = true;
  if (lastFocus) lastFocus.focus();
}

function setView(view) {
  document.querySelectorAll(".segment").forEach((button) => {
    const active = button.dataset.view === view;
    button.classList.toggle("active", active);
    button.setAttribute("aria-selected", String(active));
  });
  byId("companyView").classList.toggle("active", view === "company");
  byId("keywordView").classList.toggle("active", view === "keyword");
}

function findKeywordByTag(tag) {
  const target = normalizeTag(tag);
  const tagKeywordMap = {
    투자: "sovereign-procurement",
    출시: "enterprise-copilot",
    협력: "nvidia-korea",
    규제: "security-alliance",
    보안: "security-alliance",
    ai반도체: "ai-chip-supply",
    소버린ai: "sovereign-procurement",
    nvidia: "nvidia-korea",
    엔비디아: "nvidia-korea",
    피지컬ai: "nvidia-korea",
    kt: "finance-ax",
    금융: "finance-ax",
    ondevice: "ai-chip-supply"
  };
  if (tagKeywordMap[target]) return keywordData.find((keyword) => keyword.id === tagKeywordMap[target]);
  return keywordData.find((keyword) => {
    const candidates = [keyword.id, keyword.label, ...(keyword.aliases || []), ...(keyword.keywords || [])].map(normalizeTag);
    return candidates.some((candidate) => candidate === target || candidate.includes(target) || target.includes(candidate));
  });
}

function focusKeywordFromTag(tag) {
  const matched = findKeywordByTag(tag);
  setView("keyword");
  if (matched) activeKeywordId = matched.id;
  renderKeywordMap();
  renderTimeline();

  document.querySelector(".workspace-section").scrollIntoView({ behavior: "smooth", block: "start" });
  window.requestAnimationFrame(() => {
    const bubble = [...byId("keywordMap").querySelectorAll("[data-keyword-id]")].find(
      (button) => button.dataset.keywordId === activeKeywordId
    );
    if (!bubble) return;
    bubble.classList.add("hash-focus");
    bubble.focus({ preventScroll: true });
    window.setTimeout(() => bubble.classList.remove("hash-focus"), 1400);
  });
}

function renderDashboard() {
  if (!companies.find((company) => company.id === activeCompanyId)) activeCompanyId = companies[0]?.id || "";
  if (!keywordData.find((keyword) => keyword.id === activeKeywordId)) activeKeywordId = keywordData[0]?.id || "";
  renderMeta();
  renderShareLink();
  renderMetrics();
  renderActionBoard();
  renderHotList();
  renderSignalSearch();
  renderCardNewsDeck();
  renderCompanyCards();
  renderCompanyView();
  renderKeywordMap();
  renderTimeline();
  renderImpact();
  renderQueue();
  renderSourceLinks();
}

function applySnapshot(date) {
  const snapshot = snapshots.find((item) => item.date === date);
  if (!snapshot) return;
  activeSnapshotDate = snapshot.date;
  metadata = snapshot.metadata || metadata;
  metrics = snapshot.metrics || metrics;
  sourceSignals = snapshot.sourceSignals || sourceSignals;
  hotAgendas = asArray(snapshot.hotAgendas, hotAgendas);
  companies = asArray(snapshot.companies, companies);
  keywordData = asArray(snapshot.keywordData, keywordData);
  impactNotes = asArray(snapshot.impactNotes, impactNotes);
  renderDashboard();
}

async function copyShareLink(button, label = "링크 복사됨") {
  const url = getShareUrl();
  try {
    await navigator.clipboard.writeText(url);
    if (button) {
      const previous = button.textContent;
      button.textContent = label;
      window.setTimeout(() => {
        button.textContent = previous;
      }, 1400);
    }
  } catch {
    window.prompt("공유 링크", url);
  }
}

function applyDefaultMobileCollapse() {
  if (!window.matchMedia("(max-width: 760px)").matches) return;
  ["stream-panel", "source-link-panel", "keyword-map-panel"].forEach((className) => {
    const panel = document.querySelector(`.${className}`);
    const button = document.querySelector(`[data-collapse-panel="${className}"]`);
    if (!panel || panel.classList.contains("is-collapsed")) return;
    panel.classList.add("is-collapsed");
    if (button) button.textContent = "펼치기";
  });
}

function formatKst(date) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Seoul"
  }).formatToParts(date);
  const value = (type) => parts.find((part) => part.type === type).value;
  return `${value("year")}.${value("month")}.${value("day")} ${value("hour")}:${value("minute")}`;
}

function bindEvents() {
  byId("hotList").addEventListener("click", (event) => {
    const tag = event.target.closest("[data-hot-tag]");
    if (tag) {
      event.stopPropagation();
      focusKeywordFromTag(tag.dataset.hotTag);
      return;
    }
    const item = event.target.closest("[data-agenda-id]");
    if (!item) return;
    const agenda = hotAgendas.find((candidate) => candidate.id === item.dataset.agendaId);
    openBrief({
      title: agenda.title,
      eyebrow: "Hot Agenda",
      brief: agenda.brief,
      signals: getAgendaReason(agenda),
      date: agenda.collectedAt,
      sources: getAgendaSources(agenda),
      hotness: getHotnessBreakdown(agenda)
    });
  });
  byId("hotList").addEventListener("keydown", (event) => {
    if (!["Enter", " "].includes(event.key)) return;
    if (event.target.closest("[data-hot-tag]")) return;
    const item = event.target.closest("[data-agenda-id]");
    if (!item) return;
    event.preventDefault();
    const agenda = hotAgendas.find((candidate) => candidate.id === item.dataset.agendaId);
    openBrief({
      title: agenda.title,
      eyebrow: "Hot Agenda",
      brief: agenda.brief,
      signals: getAgendaReason(agenda),
      date: agenda.collectedAt,
      sources: getAgendaSources(agenda),
      hotness: getHotnessBreakdown(agenda)
    });
  });

  byId("dateStrip").addEventListener("click", (event) => {
    const button = event.target.closest("[data-snapshot-date]");
    if (!button) return;
    applySnapshot(button.dataset.snapshotDate);
  });

  byId("shareButton").addEventListener("click", (event) => copyShareLink(event.currentTarget));
  byId("shareTextButton").addEventListener("click", (event) => copyShareLink(event.currentTarget, "복사됨"));
  byId("copyPublicShareButton").addEventListener("click", (event) => copyShareLink(event.currentTarget, "복사됨"));

  document.querySelectorAll("[data-theme-option]").forEach((button) => {
    button.addEventListener("click", () => applyTheme(button.dataset.themeOption));
  });

  byId("signalSearchForm").addEventListener("submit", (event) => {
    event.preventDefault();
    const query = byId("signalSearchInput").value.trim();
    renderSignalSearch(query);
  });

  byId("saveQueryButton").addEventListener("click", (event) => {
    const query = byId("signalSearchInput").value.trim() || activeSignalQuery;
    if (!query) return;
    const saved = getSavedQueries().filter((item) => queryText(item) !== queryText(query));
    setSavedQueries([query, ...saved]);
    renderSavedQueries();
    const previous = event.currentTarget.textContent;
    event.currentTarget.textContent = "저장됨";
    window.setTimeout(() => {
      event.currentTarget.textContent = previous;
    }, 1200);
  });

  byId("savedQueryRow").addEventListener("click", (event) => {
    const button = event.target.closest("[data-signal-query]");
    if (!button) return;
    byId("signalSearchInput").value = button.dataset.signalQuery;
    renderSignalSearch(button.dataset.signalQuery);
  });

  byId("buildCardNewsButton").addEventListener("click", () => {
    renderCardNewsDeck(true);
  });

  byId("copyCardNewsButton").addEventListener("click", (event) => copyCardNews(event.currentTarget));

  byId("signalSearchResult").addEventListener("click", (event) => {
    const button = event.target.closest("[data-search-brief-index]");
    if (!button) return;
    const item = signalSearchMatches[Number(button.dataset.searchBriefIndex)];
    if (!item) return;
    openBrief({
      title: item.title,
      eyebrow: `${activeSignalQuery} Insight`,
      brief: item.brief || {
        background: item.summary || `${activeSignalQuery} 관련 수집 신호입니다.`,
        reaction: item.agenda || item.sourceType || "관련 원문에서 신호가 잡혔습니다.",
        implication: item.takeaway || "사업 영향과 후속 액션을 분리해 확인하세요."
      },
      signals: item.takeaway || item.agenda || activeSignalQuery,
      date: item.time || metadata.generatedAt,
      sources: item.url ? [{ title: item.title, url: item.url, media: item.media }] : []
    });
  });

  document.querySelectorAll(".collapse-toggle").forEach((button) => {
    button.addEventListener("click", () => {
      const panel = document.querySelector(`.${button.dataset.collapsePanel}`);
      if (!panel) return;
      panel.classList.toggle("is-collapsed");
      button.textContent = panel.classList.contains("is-collapsed") ? "펼치기" : "접기";
    });
  });

  byId("companyCards").addEventListener("click", (event) => {
    const card = event.target.closest("[data-company-id]");
    if (!card) return;
    activeCompanyId = card.dataset.companyId;
    renderCompanyCards();
    renderCompanyView();
  });

  byId("wordCloud").addEventListener("click", (event) => {
    const word = event.target.closest("[data-keyword-label]");
    if (!word) return;
    const company = activeCompany();
    const keyword = company.keywords.find((item) => item.label === word.dataset.keywordLabel);
    const relatedKeyword = keywordData.find((item) => item.id === keyword?.termId);
    openBrief({
      title: `${company.name}: ${word.dataset.keywordLabel}`,
      eyebrow: "Company Agenda",
      brief: {
        background: keyword?.description || relatedKeyword?.description || `${company.name} 관련 추진 의제입니다.`,
        reaction: keyword?.sourceSummary
          ? `${keyword.sourceSummary}에서 이 방향의 신호가 잡혔습니다.`
          : relatedKeyword?.signals || "관련 시장 신호를 추적 중입니다.",
        implication: keyword?.takeaway || relatedKeyword?.brief?.implication || "제품, 파트너십, 리스크 관점의 후속 확인이 필요합니다."
      },
      signals: keyword?.sourceSummary || `${company.name} 관련 키워드 가중치 상위권 · ${company.stack.length}개 강한 추진 신호`,
      date: company.updatedAt,
      sources: keyword?.sources || []
    });
  });

  byId("agendaStack").addEventListener("click", (event) => {
    const target = event.target.closest("[data-stack-index]");
    if (!target) return;
    const company = activeCompany();
    const item = normalizeCompanyStackItem(company.stack[Number(target.dataset.stackIndex)], company);
    const relatedKeyword = keywordData.find((keyword) => keyword.id === item.termId);
    openBrief({
      title: `${company.name} · ${item.title}`,
      eyebrow: "Agenda Stack",
      brief: {
        background: item.body,
        reaction: `${item.sourceSummary}에서 확인된 신호를 바탕으로 한 회사별 해석입니다.`,
        implication: item.takeaway || relatedKeyword?.brief?.implication || "제품, 파트너십, 리스크 관점의 후속 확인이 필요합니다."
      },
      signals: item.sourceSummary,
      date: `${item.date} KST`,
      sources: item.sources
    });
  });

  document.querySelectorAll(".segment").forEach((button) => {
    button.addEventListener("click", () => setView(button.dataset.view));
  });

  byId("keywordMap").addEventListener("click", (event) => {
    const bubble = event.target.closest("[data-keyword-id]");
    if (!bubble) return;
    activeKeywordId = bubble.dataset.keywordId;
    renderKeywordMap();
    renderTimeline();
  });

  byId("timeline").addEventListener("click", (event) => {
    const item = event.target.closest("[data-timeline-brief-index]");
    if (!item) return;
    const keyword = activeKeyword();
    const timelineItem = normalizeTimelineItem(keyword.timeline[Number(item.dataset.timelineBriefIndex)]);
    openBrief({
      title: timelineItem.title,
      eyebrow: `${keyword.label} Timeline`,
      brief: keyword.brief,
      signals: keyword.signals,
      date: `${timelineItem.time} KST`,
      sources: timelineItem.url
        ? [{ title: timelineItem.title, url: timelineItem.url, media: timelineItem.source || timelineItem.type }]
        : []
    });
  });

  byId("companyBriefButton").addEventListener("click", () => {
    const company = activeCompany();
    openBrief({
      title: `${company.name}의 현재 아젠다`,
      eyebrow: "Company Deep Dive",
      brief: hotAgendas[0].brief,
      signals: `${company.keywords.map((keyword) => keyword.label).join(", ")}`,
      date: company.updatedAt
    });
  });

  byId("keywordBriefButton").addEventListener("click", () => {
    const keyword = activeKeyword();
    const timelineItem = normalizeTimelineItem(keyword.timeline[0]);
    openBrief({
      title: `${keyword.label} 시장 브리핑`,
      eyebrow: "Keyword Deep Dive",
      brief: keyword.brief,
      signals: keyword.signals,
      date: `${timelineItem.time} KST`
    });
  });

  byId("closeModal").addEventListener("click", closeBrief);
  byId("modalBackdrop").addEventListener("click", (event) => {
    if (event.target.id === "modalBackdrop") closeBrief();
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !byId("modalBackdrop").hidden) closeBrief();
  });

  byId("refreshButton").addEventListener("click", () => {
    byId("syncTime").textContent = `${formatKst(new Date())} KST 데이터 확인`;
    const dot = document.querySelector(".pulse-dot");
    dot.classList.remove("flash");
    window.requestAnimationFrame(() => dot.classList.add("flash"));
    window.setTimeout(() => window.location.reload(), 260);
  });

  byId("saveBriefButton").addEventListener("click", () => {
    byId("saveBriefButton").textContent = "저장됨";
    window.setTimeout(() => {
      byId("saveBriefButton").textContent = "브리핑 저장";
    }, 1200);
  });

  byId("shareBriefButton").addEventListener("click", (event) => copyShareLink(event.currentTarget, "복사됨"));
}

function init() {
  applyTheme(currentTheme(), false);
  renderDashboard();
  applyDefaultMobileCollapse();
  bindEvents();
}

init();
