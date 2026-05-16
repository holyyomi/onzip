# HANDOFF.md — 온집 (onzip) 인수인계서

> 최종 업데이트: 2026-05-16
> 현재 방향: 로컬 전용 PWA. 가족공유, 서버 동기화, 서버 백업/복원은 제거함.
> 프로덕션 배포: https://onzip.vercel.app

---

## 1. 프로젝트 개요

온집은 가족/개인이 휴대폰에 설치해서 쓰는 생활관리 PWA다.

- 일정, 가계 관리, 장보기, 체크리스트, 생활용품, 집안일, 기록을 한 앱에서 관리
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
npm run typecheck
npm run build
```

작업 완료 기준:
- TypeScript 오류 0개
- 빌드 통과
- 문서 업데이트
- git commit

---

## 4. 현재 완료 상태

- 홈 탭: 오늘 확인, 빠른 등록, 월간 요약, 우리집 메모
- 일정 탭: 월간/주간 캘린더, 오늘 요약, 일정/기념일 CRUD, 일정 메모
- 돈 탭: 요약, 지출·수입, 고정 지출, 수입, 구독, 계산기, 가계 메모
- 생활 탭: 체크리스트, 장보기, 생활용품, 집안일, 템플릿, 생활 메모
- 기록 기능: 빠른 추가로 가족 기록 작성 가능, 홈의 가족 기록 카드에서 기록 목록 진입 가능
- 설정: 헤더 설정 아이콘에서 진입. 집 정보, 구성원, 카테고리, 설정 메모
- PWA: manifest, service worker, Vercel 설정
- 배포: Vercel 프로덕션 배포 완료 (`https://onzip.vercel.app`)
- 분석: Vercel Web Analytics 방문 분석 추가. GA4 측정 ID(`VITE_GA_MEASUREMENT_ID=G-3206HZH0BS`)로 익명 이벤트 분석 활성화
- 설치/저장 안내: 홈 하단과 설정에 앱 설치/로컬 저장 안내 표시
- 설치 UX: Android는 Chrome 설치를 권장하고, 삼성 인터넷에서는 자동 설치 팝업 대신 수동 설치 안내를 표시
- 공유 미리보기: `public/og-image.png`와 Open Graph/Twitter 메타 태그 설정 완료
- 공유/문의/백업: 설정 탭에서 앱 링크 공유, 문의 메일(`holyyomi@naver.com`), 로컬 JSON 파일 내보내기 가능. 앱 링크 공유와 내 데이터 백업은 별도 카드로 분리
- 온보딩/업데이트: 첫 실행 안내와 홈 최근 업데이트 카드 추가
- SEO 기본 파일: `public/robots.txt`, `public/sitemap.xml`
- 디자인: Airbnb + Apple 혼합 톤의 밝은 모바일 앱 UI
- 브랜드: imagegen으로 생성한 `assets/brand/onzip-logo.png` 원본에서 PWA 아이콘을 만들고, `온집` 이름을 헤더/홈/설정에 명확히 표시
- 기능 아이콘: imagegen으로 생성한 `assets/brand/onzip-feature-sprite.png`에서 12개 기능 PNG를 잘라 `public/icons/features/`에 저장. 홈 빠른버튼, 하단 탭, 빠른추가, 탭 메모에 문자 배지 대신 이미지 아이콘 사용
- 빠른 추가: 저장 후 홈/일정/돈/생활/기록 화면 즉시 갱신, 완료 알림 표시
- 첫 실행 데이터: 새 사용자는 예시 생활 데이터 없이 빈 앱으로 시작. 기본 구성원, 앱 설정, 체크리스트 템플릿만 준비
- 초기화 마이그레이션: `onzip_full_reset_done_20260516_v1` 키가 없으면 앱 시작 시 기존 `onzip_` 로컬 데이터를 한 번 전체 삭제하고 새 기본 세팅으로 재시작
- 모바일 사용성: 홈 첫 화면을 `오늘 확인 → 바로 기록 → 이번 달 상태` 흐름으로 정리. 설정은 헤더로 이동하고 기록은 하단 탭에 배치. 빠른추가는 자주 쓰는 4개와 보조 기능 3개를 분리. 바텀시트 폼은 `100dvh`/safe-area/큰 터치 영역/하단 고정 저장 버튼 기준으로 정리
- 탭 메모 사용성: 메모 카드 높이를 줄이고 앱 하단 여백을 늘려 바닥에서 잘려 보이지 않도록 수정
- 탭별 쉬운 진입: 일정/돈/생활/기록 탭 상단에 바로 추가 버튼을 배치해 하단 `+` 버튼을 찾지 않아도 핵심 입력을 바로 열 수 있음
- 입력 UX: 돈/장보기/일정 추가는 핵심 필드만 먼저 보이고 날짜/담당자/반복 등은 `자세히` 안에 배치
- 입력 폼 2차 단순화: 일정/장보기는 추천 버튼과 Enter 저장을 지원. 체크리스트/기록/고정지출/구독은 필수 입력만 먼저 보이고 마감일, 담당자, 결제수단, 태그, 메모 등은 `자세히` 안에 배치
- 문구 체계: `지출 기록`, `구매 항목`, `체크리스트`, `고정 지출`, `생활 기록`처럼 앱 전반의 버튼/알림 문구를 명확한 명사형으로 통일
- QA 보완: 기록 탭에서 가족 회의록을 바로 추가하면 회의록 제목과 기본 템플릿이 자동 삽입됨

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
    csvExport.ts
docs/
  ANALYTICS.md
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
  generate-icons.mjs
  generate-og-image.mjs
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
onzip_seed_done_v1
onzip_full_reset_done_20260516_v1
```

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

`src/utils/calendarAggregator.ts`에서 고정지출, 구독, 체크리스트를 캘린더 이벤트로 변환한다. 원본 데이터는 각 repository에만 저장한다.

### 탭 메모장

`TabMemoCard`는 `tabMemoStore.ts`를 통해 `onzip_tab_memos`에 자동 저장한다.

---

## 8. 다음 추천 작업

1. 모바일 실사용 흐름 다듬기
   - 버튼/문구를 더 쉬운 표현으로 정리
   - 기록/체크리스트/고정지출 입력도 핵심 입력 중심으로 정리

2. 기록 탭 접근성 추가 점검
   - 홈의 가족 기록 카드에서 기록 목록으로 진입 가능
   - 하단 탭에는 계속 숨겨져 있으므로 실사용 중 찾기 어려우면 생활 탭 안으로 흡수 검토

3. 휴대폰 PWA 설치 확인
   - `https://onzip.vercel.app` 접속 후 홈 화면 추가
   - 설치 후 앱 아이콘, 첫 로딩, localStorage 데이터 유지 확인

4. 사용성 QA
   - 7일 실사용 체크리스트 기준으로 입력 귀찮음, 화면 복잡도 점검

---

## 9. 운영 규칙

- 한국어로 간결하게 커뮤니케이션
- 다크 모드 추가 금지
- 서버 공유/로그인/백업 기능은 다시 넣지 않음
- 외부 라이브러리 추가는 꼭 필요한 경우만
- 변경 후 `npm run typecheck`와 `npm run build` 실행
- 분석 이벤트에는 사용자가 입력한 제목, 금액, 메모, 태그, 구성원 이름을 넣지 않음
