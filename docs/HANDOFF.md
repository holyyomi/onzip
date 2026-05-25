# HANDOFF.md — 온집 (onzip) 인수인계서

> 최종 업데이트: 2026-05-25
> 현재 방향: 로컬 전용 PWA. 가족공유, 서버 동기화, 서버 백업/복원은 제거함.
> 프로덕션 배포: https://onzip.vercel.app

---

## 1. 프로젝트 개요

온집은 개인이 휴대폰에 설치해서 쓰는 생활 중요정보 관리 PWA다.

- 수입 예정, 지출 예정, 중요한 일정, 단순 체크리스트, 메모장을 한 앱에서 관리
- 장보기/생활용품/집안일/템플릿 기능 코드는 유지하되 전면 탭에서는 제외
- 저장소는 `localStorage`
- 로그인, 서버 공유, 자동 동기화 없음
- 다크 모드 없음

---

## 2. 기술 스택

| 항목 | 기술 |
|---|---|
| Frontend | React 18 + TypeScript strict |
| Build | Vite 5 |
| Styling | Tailwind CSS v3 |
| Storage | localStorage + BaseRepository<T> |
| PWA | vite-plugin-pwa |
| Package Manager | npm |

---

## 3. 실행 및 검증

```bash
npm run dev
npm run env:check
npm run docs:check
npm run storage:check
npm run backup:check
npm run typecheck
npm run build
npm run smoke
npm run smoke:prod
npm run verify
npm run release:check
npm run ops:check
npm run deploy:prod
npm run release:prod
```

작업 완료 기준:
- TypeScript 오류 0개
- 빌드 통과
- 스모크 QA 통과
- 문서 업데이트
- git commit

---

## 4. 현재 완료 상태

- 홈 탭: 오늘의 주요 항목, 빠른 추가, 체크리스트, 이번 달 가계부, 다가오는 일정/메모
- 일정 탭: 월간/주간 캘린더, 날짜별 일정 제목 미리보기, 일정/기념일 CRUD
- 가계부 탭: 수입, 지출, 날짜별 반복 수입/지출, 상세내역, 입출금, 계산기
- 메모장 탭: 중요 메모, 재정 메모, 계약/정리, 갱신/만료, 집/차량 기록
- 체크리스트 탭: 하단 탭에 노출. 한 화면에서 체크, 줄긋기, 추가, 수정, 삭제만 제공
- 설정: 헤더 설정 아이콘에서 진입. 집 정보, 구성원, 카테고리, 설정 메모
- 헤더: 좌측 로고/앱 이름 영역을 누르면 홈 탭으로 이동
- PWA: manifest, service worker, Vercel 설정
- 배포: Vercel 프로덕션 배포 완료 (`https://onzip.vercel.app`)
- 분석: Vercel Web Analytics 방문 분석 추가. GA4 측정 ID(`VITE_GA_MEASUREMENT_ID=G-3206HZH0BS`)로 익명 이벤트 분석 활성화
- 분석 문서: `docs/ANALYTICS.md`에 실제 전송 이벤트 목록과 개인정보 금지 파라미터 기준을 정리
- 저장 안내: 설정에 로컬 저장 안내 표시
- 설치 UX: Android는 Chrome 설치를 권장하고, 삼성 인터넷에서는 자동 설치 팝업 대신 수동 설치 안내를 표시
- 설치 안내 닫기: 사용자가 설치 안내를 닫아도 영구 숨김이 아니라 7일 동안만 숨김. 실제 설치가 완료된 경우에는 다시 표시하지 않음
- 공유 미리보기: `public/og-image.png`와 Open Graph/Twitter 메타 태그 설정 완료
- 공유/문의/백업: 설정 탭에서 앱 링크 공유, 문의 메일(`holyyomi@naver.com`), 로컬 JSON 파일 내보내기 가능. 앱 링크 공유와 내 데이터 백업은 별도 카드로 분리하고, 최근 백업 상태를 표시
- 백업 복원: 설정 탭에서 온집 JSON 백업 파일로 현재 기기의 로컬 데이터를 교체할 수 있음. 불러오기는 합치기가 아니라 교체임을 카드와 확인창에 명확히 표시
- 온보딩/업데이트: 첫 실행 안내, 설정의 최근 업데이트 카드, 새 버전 확인/적용 버튼 추가
- PWA 설치 안내: 설정 화면에 설치 안내 카드를 연결해 Android/iPhone 홈 화면 추가 방법을 확인할 수 있음
- PWA/공유 문구: manifest와 meta description도 `가계부`, `일정`, `체크리스트`, `메모장` 기준의 단순한 표현으로 통일
- SEO 기본 파일: `public/robots.txt`, `public/sitemap.xml`
- 디자인: Airbnb + Apple 혼합 톤의 밝은 모바일 앱 UI
- 브랜드: imagegen으로 생성한 `assets/brand/onzip-logo.png` 원본에서 PWA 아이콘을 만들고, `온집` 이름을 헤더/홈/설정에 명확히 표시
- 기능 아이콘: imagegen으로 생성한 `assets/brand/onzip-feature-sprite.png`에서 12개 기능 PNG를 잘라 `public/icons/features/`에 저장. 홈 빠른버튼, 하단 탭, 빠른추가, 탭 메모에 문자 배지 대신 이미지 아이콘 사용
- 빠른 추가: 저장 후 홈/가계부/일정/체크리스트/메모장 화면 즉시 갱신, 완료 알림 표시
- 첫 실행 데이터: 새 사용자는 예시 생활 데이터 없이 빈 앱으로 시작. 기본 구성원, 앱 설정, 체크리스트 템플릿만 준비
- 데이터 보존: 앱 시작 시 기존 `onzip_` 로컬 데이터를 삭제하는 초기화 마이그레이션 제거. 업데이트는 UI/앱 셸만 교체하고 사용자 데이터는 유지
- PWA 업데이트: 새 서비스워커가 준비되면 하단 업데이트 안내를 표시하고, 설정의 앱 업데이트 카드에서 수동 확인/적용 가능
- 금액 보호: 설정에서 `금액 가리기`를 켜면 홈, 가계부, 일정, 메모장, 분담/구독 계산 결과의 주요 금액이 `***원`으로 표시됨. CSV 내보내기는 실제 금액 포함 안내 후 진행
- 민감 메모 PIN: 앱 전체 잠금은 사용하지 않음. 설정에서 4자리 PIN을 정하면 `민감`, `비밀`, `숨김`, `private` 태그가 붙은 메모를 열 때만 한 번 확인함. PIN은 새 4자리로 간단히 바꾸거나 끌 수 있음
- 메모장 보호: 설정에서 `민감 메모 숨김`을 켜면 `민감`, `비밀`, `숨김`, `private` 태그가 붙은 메모의 제목/내용을 가림
- 민감 메모 열람: 민감 메모 숨김이 켜져 있고 PIN이 설정된 경우, 메모장 목록에서 민감 항목을 열 때 4자리 PIN을 확인
- 민감 메모 PIN 안내: PIN 없이 `민감 메모 숨김`을 켜면 설정 화면에서 PIN 안내를 표시하고 민감 메모 PIN 설정 영역을 자동으로 열어 이어서 설정할 수 있음
- 메모장 템플릿: 새 메모 작성 시 계좌 잔액, 주식/코인, 보험/계약, 대출/카드, 갱신/만료, 비상정보 템플릿으로 제목/내용/유형/태그를 빠르게 채울 수 있음
- 메모장 찾기: 메모장 목록에 `중요만`, `민감만` 빠른 필터를 추가하고, 홈의 중요 메모 노출 기준을 계좌/보험/계약/투자/대출/카드/갱신/만료/비상 태그까지 확장
- 메모장 날짜: 갱신/만료 유형 또는 갱신/만료 태그가 붙은 메모는 앞으로 30일 안에 해당하면 홈의 `다가오는 항목`에 날짜와 함께 표시
- 가계부 요약: 가계부 탭에서 수입을 월급/정기, 부가 수입, 기타 반복, 이번 달 상세내역으로 나누고 지출을 카드 결제, 정기 지출, 자동결제, 이번 달 상세내역으로 분리 표시
- 가계부 일정: 현재 달의 날짜별 입출금은 오늘 이후 항목이 먼저 보이고 `오늘`, `D-n`, `지남` 상태 배지를 표시
- 가계부 일정 초과 항목: 날짜별 입출금이 8건을 넘으면 숨겨진 건수를 표시하고 `더 보기/접기`로 전체 입출금 흐름을 확인 가능
- 남은 가계부: 현재 달 가계부 카드에 오늘 이후 남은 수입, 남은 지출, 예상 차액을 별도 표시
- 입출금 월 이동: `입출금` 탭에서도 월 이동 바를 표시해 수입 예정/지출 예정/자동결제의 월별 상태를 어느 달 기준으로 처리하는지 명확히 함
- 입출금 상태 요약: 수입 예정/지출 예정/자동결제 관리 탭 상단은 전체 금액이 아니라 선택한 달의 남은 금액을 주 숫자로 표시하고, 전체 금액과 처리 건수를 보조 문구로 표시
- 수입 예정 확인: 월급/부가 수입 같은 반복 수입은 월별로 `입금/취소` 처리할 수 있고, 날짜가 지난 입금 대기 항목은 가계부 카드에 경고로 표시
- 미납 반영: 완료 처리된 정기 지출은 남은 지출에서 제외하고, 날짜가 지난 미완료 정기 지출은 미납 경고와 날짜별 입출금 상단에 표시. 날짜별 입출금에서 정기 지출을 바로 완료/취소 처리 가능
- 정기 지출 완료: 정기 지출 완료/취소 상태는 월별로 저장해 이번 달 완료 처리가 다음 달까지 완료로 남지 않음. 기존 현재 달 상태는 보존
- 자동결제 확인: 구독/자동결제는 월별 `결제됨/취소` 처리와 결제 확인 필요 경고를 지원. 완료된 자동결제는 남은 지출에서 제외
- 캘린더 완료 표시: 정기 지출과 자동결제 자동 일정의 완료 표시는 원본 반복 항목이 아니라 선택 월의 월별 처리 상태를 기준으로 계산
- 홈 가계부 경고: 홈의 `오늘의 주요 항목`은 월별 상태를 읽어 입금 대기, 미납, 자동결제 확인 필요 항목을 오늘 예정 항목보다 먼저 표시
- 홈 가계부 요약: 홈의 `이번 달 가계부`는 전체 예상액이 아니라 월별 상태를 반영한 남은 수입, 남은 지출, 예상 차액으로 표시
- 홈 즉시 처리: 홈의 가계부 항목에서 `입금`, `완료`, `결제` 버튼으로 가계부 탭 이동 없이 월별 상태를 바로 처리 가능
- 다가오는 항목: 홈의 `다가오는 항목`은 앞으로 7일 안의 미처리 수입 예정, 지출 예정, 자동결제를 월별 상태 기준으로 먼저 표시. 월말에는 다음 달 초 입출금 항목도 함께 계산
- 홈 초과 항목: `오늘의 주요 항목`이 5건을 넘으면 숨겨진 건수를 표시하고 가계부 탭으로 이동할 수 있는 버튼을 제공
- 월말 날짜 보정: 매월 29~31일 정기 항목은 해당 월에 그 날짜가 없으면 월 마지막 날로 계산. 홈, 가계부 탭, 캘린더 자동 집계가 같은 기준을 사용
- 모바일 사용성: 홈 첫 화면을 `오늘의 주요 항목 → 빠른 추가 → 체크리스트 → 이번 달 가계부 → 다가오는 항목` 흐름으로 정리. 빠른추가는 `지출 예정`, `수입 예정`, `체크리스트`, `중요 일정`을 우선 노출하고 `메모장`, `정기 지출`, `구독/자동결제`를 함께 제공
- 모바일 하단 탭: 하단 5개 탭을 화면에 고정하고 아이콘 박스의 강제 클리핑을 제거해 모바일/PWA 뷰포트에서 아이콘이 잘려 보이지 않도록 수정
- 탭 메모 사용성: 메모 카드 높이를 줄이고 앱 하단 여백을 늘려 바닥에서 잘려 보이지 않도록 수정
- 탭별 쉬운 진입: 가계부/일정/메모장 탭 상단에 바로 추가 버튼을 배치해 하단 `+` 버튼을 찾지 않아도 핵심 입력을 바로 열 수 있음
- 입력 UX: 가계부/일정/메모장 추가는 핵심 필드만 먼저 보이고 날짜/담당자/반복 등은 `자세히` 안에 배치
- 입력 폼 2차 단순화: 일정은 추천 버튼과 Enter 저장을 지원. 체크리스트/기록/정기 지출/구독은 필수 입력만 먼저 보이고 마감일, 담당자, 결제수단, 태그, 메모 등은 `자세히` 안에 배치
- 입력 폼 3차 정리: 정기 수입 폼도 핵심 입력을 먼저 보이고 입금일, 담당자, 반복, 메모는 `자세히` 안에 배치. 정기 지출, 일정 폼 문구는 새 용어 체계에 맞춰 정리
- 문구 4차 정리: 화면 라벨과 상태 배지를 `부가 수입`, `입금`, `입금 대기`, `정기 지출` 기준으로 정리
- 로컬 스모크 QA: 2026-05-20 기준 개발 서버 `http://127.0.0.1:3000` 응답 200, 아이콘 응답 200, 빌드 산출물 `manifest.webmanifest`와 `dist/index.html`의 PWA/OG 메타 확인 완료. Browser 자동화 인터페이스는 현재 세션에 노출되지 않아 DOM 기반 화면 조작 QA는 미실행
- 환경 검증 명령: `npm run env:check`로 `.env.example` 키, 실제 값 미포함, `.env`/`.env.local` git 제외 상태를 확인
- 문서 검증 명령: `npm run docs:check`로 문서에 적힌 `docs/...` 경로와 `npm run ...` 명령이 실제로 존재하는지 확인
- 저장 키 검증 명령: `npm run storage:check`로 소스에서 쓰는 `onzip_` localStorage 키가 이 문서에 기록되어 있는지 확인
- 백업 검증 명령: `npm run backup:check`로 `exportLocalData`의 백업 data 키와 `importLocalDataFromFile`의 불러오기 키, `docs/DATA_MODEL.md` 문서 키가 일치하는지 확인
- 분석 개인정보 검증: `npm run analytics:check`로 코드의 `trackEvent` 호출이 `docs/ANALYTICS.md`에 문서화된 이벤트명과 허용 파라미터만 쓰는지 확인
- 반복 QA 명령: `npm run smoke`로 빌드 산출물, 빌드 asset 연결, PWA manifest, 필수 아이콘, OG 메타, 이전 용어 잔여 여부를 자동 확인. `npm run verify`는 env:check, docs:check, storage:check, backup:check, analytics:check, typecheck, build, smoke를 순서대로 실행
- 배포 QA 명령: `npm run smoke:prod`로 `https://onzip.vercel.app`의 HTML, 빌드 asset 응답, manifest, service worker, 아이콘, OG/SEO 파일 응답을 확인. 다른 URL은 `ONZIP_PROD_URL` 환경변수나 명령 인자로 지정 가능
- 운영 점검 명령: `npm run ops:check`로 배포 없이 `release:check`와 운영 스모크를 함께 실행
- PWA 설치 QA 보강: 로컬/운영 스모크에서 manifest의 `scope`, `orientation`, `theme_color`, `background_color`, 192/512/maskable 아이콘 구성을 함께 확인
- 배포 전 검사: `npm run release:check`는 작업트리가 깨끗하고 HEAD 커밋이 있는지 확인. `npm run release:prod`는 `verify`, `release:check`, 프로덕션 배포, 운영 스모크를 순서대로 실행
- 배포 명령: `npm run deploy:prod`는 Vercel 프로덕션 배포만 실행
- 릴리즈 문서: 프로덕션 배포 순서와 실패 시 처리 기준은 `docs/RELEASE.md`에 정리
- 프로덕션 재배포: 2026-05-21 `npm run release:prod`로 최신 앱 변경 배포 완료. alias `https://onzip.vercel.app`, `npm run smoke:prod` 통과
- 운영 PWA 스모크: 2026-05-21 `npm run smoke:prod`로 `https://onzip.vercel.app`의 HTML, 빌드 asset, manifest, service worker, 아이콘, OG/SEO 파일 응답과 PWA 설치용 manifest 필드 확인 통과
- 운영 상태 재점검: 2026-05-21 `npm run release:check`와 `npm run smoke:prod` 재실행 통과. 작업트리 clean, HEAD `75b3f51`, 운영 URL/PWA asset 응답 정상
- CI 검증: `.github/workflows/verify.yml`에서 push/PR 시 Node 20, `npm ci`, `npm run verify`를 실행
- GitHub 연결: 2026-05-21 `origin`을 `https://github.com/holyyomi/onzip.git`으로 연결하고 `master`를 `origin/master`로 push 완료. `npm run github:check` 통과
- 검증 자동화: `npm run verify`가 환경, 문서 참조, localStorage 키 문서화, 백업 키 일치, Analytics 개인정보 파라미터, TypeScript, 빌드, 로컬 스모크를 한 번에 확인
- 최신 동기화: 2026-05-21 GitHub `master`와 Vercel 프로덕션을 최신 커밋 기준으로 맞춤. 배포는 `npm run release:prod` 기준으로 실행
- 반응형 레이아웃 1차: PC에서는 좌측 사이드바와 넓은 콘텐츠 영역을 사용하고, 모바일에서는 기존 하단 탭 PWA 레이아웃 유지. 홈/가계부/일정 주요 화면은 데스크톱 그리드로 확장
- 생활 기능 단순화: 하단 `생활` 탭을 `체크리스트`로 변경하고 홈에는 체크리스트 미완료 항목만 노출
- 문구 체계: 하단 탭은 `홈`, `가계부`, `일정`, `체크리스트`, `메모장`으로 정리하고, 주요 추가 버튼은 가계부/체크리스트/일정/메모장 중심으로 조정
- 빈 상태/목록 UI: 주요 체크리스트·가계부·기록 화면의 빈 상태, 추가 버튼, 목록 카드를 앱 톤에 맞게 통일
- QA 보완: 기록 탭에서 가족 회의록을 바로 추가하면 회의록 제목과 기본 템플릿이 자동 삽입됨
- 실사용 테스트 체크리스트: `docs/TEST_CHECKLIST.md`를 현재 홈/가계부/일정/체크리스트/메모장 구조, 민감 메모 PIN, 백업 교체, 설치 안내 흐름 기준으로 최신화
- 설정 저장 갱신: 설정에서 집 이름을 저장하면 헤더의 집 이름도 탭 이동 없이 즉시 갱신됨
- 체크리스트 저장 이동: 빠른 추가에서 체크리스트를 저장하면 체크리스트 화면으로 바로 이동
- 빠른 추가 이동: 빠른 추가 저장 후 수입/지출/정기 지출/자동결제는 가계부 탭, 일정은 일정 탭, 메모는 메모장 탭, 체크리스트는 체크리스트 화면으로 이동해 저장 결과를 바로 확인할 수 있음
- 가계부 입력 개선: 지출/수입 금액 입력에서 Enter 저장을 지원하고, 수입 입력 시 월급/부가 수입에 맞는 큰 금액 추천 버튼을 표시
- 문구 고급화: 사용자 노출 문구는 쉬운 표현을 유지하되 `나갈 돈/들어올 돈/살 것/중요 보관` 대신 `지출 예정/수입 예정/체크리스트/메모`를 기본 용어로 사용
- 사용성 단순화: 2026-05-25 피드백 반영. 하단 `흐름` 탭을 `가계부`로, `생활` 탭을 `체크리스트`로 변경하고 가계부 내부 `정기 항목`은 `입출금`으로 변경
- 일정 단순화: 일정 탭의 상단 요약/빠른 카드와 하단 일정 메모를 제거하고, 월간/주간 달력 날짜 칸에 일정 제목 미리보기를 표시하도록 변경
- 체크리스트 단순화: 장보기/생활용품/집안일/템플릿 진입을 체크리스트 탭에서 제거하고, 체크박스, 줄긋기, 추가, 수정, 삭제만 남긴 단일 목록 UI로 변경
- 메모장 단순화: 메모장 검색창 아래는 유형별 빠른 추가 한 줄만 남기고 `전체/중요만/민감만` 필터 줄을 제거해 화면을 더 단순하게 정리

제거 완료:
- 가족공유
- 서버 동기화
- 서버 JSON 백업/복원
- 관련 환경변수 예시 및 서버 연동 문서

---

## 5. 주요 파일 구조

```text
src/
  app/App.tsx
  components/
    common/
      FormModal.tsx
      EmptyState.tsx
      QuickAddMenu.tsx
      QuickAddModal.tsx
      TabMemoCard.tsx
    layout/
      AppShell.tsx
      Header.tsx
      BottomTabBar.tsx
    pages/
      HomePage.tsx
      CalendarPage.tsx
      MoneyPage.tsx
      LifePage.tsx
      RecordsPage.tsx
      SettingsPage.tsx
    calendar/
    money/
    life/
    records/
  data/
    models/index.ts
    repositories/base.ts
    repositories/index.ts
    seed/index.ts
  utils/
    analytics.ts
    brand.ts
    date.ts
    calendarAggregator.ts
    constants.ts
    categoryStore.ts
    dataExport.ts
    tabMemoStore.ts
    featureIcons.ts
    fixedExpenseMonthStatus.ts
    incomeMonthStatus.ts
    subscriptionMonthStatus.ts
    vaultRecords.ts
    csvExport.ts
docs/
  ANALYTICS.md
  DEVICE_QA.md
  GITHUB_CI.md
  OPERATIONS_MONITORING.md
  RELEASE.md
  USAGE_QA_7D.md
assets/
  brand/
    onzip-logo.png
    onzip-feature-sprite.png
public/
  og-image.png
  robots.txt
  sitemap.xml
  icons/
    icon-192.png
    icon-512.png
    icon-512-maskable.png
    icon.svg
    features/
      home.png, calendar.png, money.png, life.png, settings.png
      shopping.png, checklist.png, record.png
      bill.png, subscription.png, supplies.png, chore.png
scripts/
  analytics-privacy-check.mjs
  backup-check.mjs
  docs-check.mjs
  generate-icons.mjs
  generate-og-image.mjs
  github-ci-check.mjs
  storage-keys-check.mjs
```

---

## 6. localStorage 키

```text
onzip_households
onzip_members
onzip_calendar_events
onzip_ledger_entries
onzip_fixed_expenses
onzip_incomes
onzip_subscriptions
onzip_checklists
onzip_checklist_items
onzip_shopping_items
onzip_household_supplies
onzip_chores
onzip_records
onzip_templates
onzip_app_settings
onzip_custom_categories
onzip_tab_memos
onzip_fixed_expense_month_status
onzip_income_month_status
onzip_subscription_month_status
onzip_seed_done_v1
onzip_full_reset_done_20260516_v1
onzip_install_card_hidden_v1
onzip_onboarding_seen_v1
onzip_storage_notice_seen_v1
onzip_update_notice_20260519_flow_vault
```

`onzip_app_settings` 주요 설정:
- `hide_amounts`: `true`이면 주요 금액을 `***원`으로 표시
- `app_lock_pin_hash`: 민감 메모 PIN 해시
- `app_lock_pin_salt`: 민감 메모 PIN salt
- `hide_sensitive_records`: `true`이면 민감 태그 메모 제목/내용 숨김
- `last_backup_at`: 사용자가 마지막으로 로컬 JSON 백업 파일을 내려받은 ISO 시각

---

## 7. 핵심 패턴

### FormModal

```tsx
import FormModal, { Field, inputCls, FormActions } from '../common/FormModal'
```

입력/수정 모달은 기존 `FormModal`, `Field`, `FormActions`를 재사용한다.

### refreshKey

```tsx
const [refreshKey, setRefreshKey] = useState(0)
const onRefresh = () => setRefreshKey((k) => k + 1)
```

저장/삭제 후 화면 재계산 트리거로 사용한다.
`App.tsx`에는 빠른 추가 저장 후 전체 주요 화면을 갱신하는 `appRefreshKey`가 있다.

### 캘린더 집계

`src/utils/calendarAggregator.ts`에서 정기 지출, 구독, 체크리스트를 캘린더 이벤트로 변환한다. 원본 데이터는 각 repository에만 저장한다.

### 탭 메모장

`TabMemoCard`는 `tabMemoStore.ts`를 통해 `onzip_tab_memos`에 자동 저장한다.

---

## 8. 다음 추천 작업

1. GitHub remote 연결
   - 완료: `origin` remote와 `master -> origin/master` upstream 연결 완료
   - GitHub Actions의 `Verify` 워크플로 첫 실행 결과 확인

2. 실기기 QA
   - `docs/DEVICE_QA.md` 기준으로 `https://onzip.vercel.app`을 Android Chrome과 iPhone Safari에서 각각 열어 홈 화면 추가 확인
   - 설치 후 기존 localStorage 데이터 유지, 아이콘, 첫 로딩, 업데이트 안내 동작 확인
   - PC 브라우저, 태블릿 가로/세로, 모바일에서 레이아웃 폭과 탭 위치 확인

3. 7일 실사용 관찰
   - `docs/USAGE_QA_7D.md`의 매일 기록표와 우선순위 기준, `docs/TEST_CHECKLIST.md` 기준으로 입력 귀찮음, 화면 복잡도, 백업/설치 이해도 확인
   - 특히 `지출 예정`, `수입 예정`, `메모`, `백업 파일로 교체하기`, `민감 메모 PIN` 흐름을 실제 사용자에게 설명 없이 맡겨보기

4. 운영 관찰
   - `docs/OPERATIONS_MONITORING.md` 기준으로 Vercel Analytics와 GA4에서 방문 수, 설치 안내 클릭, 빠른 추가 저장 이벤트를 확인
   - 분석 이벤트에는 제목, 금액, 메모, 태그, 구성원 이름 같은 사용자 입력값을 넣지 않음

---

## 9. 운영 규칙

- 한국어로 간결하게 커뮤니케이션
- 다크 모드 추가 금지
- 서버 공유/로그인/백업 기능은 다시 넣지 않음
- 외부 라이브러리 추가는 꼭 필요한 경우만
- 변경 후 `npm run verify` 실행
- 분석 이벤트에는 사용자가 입력한 제목, 금액, 메모, 태그, 구성원 이름을 넣지 않음
- 기존 사용자 데이터 초기화 로직 추가 금지. 필요한 경우 명시적 백업/복원 또는 사용자 확인이 있는 삭제 기능으로만 처리
