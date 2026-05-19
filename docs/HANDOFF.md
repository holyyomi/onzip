# HANDOFF.md — 온집 (onzip) 인수인계서

> 최종 업데이트: 2026-05-19
> 현재 방향: 로컬 전용 PWA. 가족공유, 서버 동기화, 서버 백업/복원은 제거함.
> 프로덕션 배포: https://onzip.vercel.app

---

## 1. 프로젝트 개요

온집은 개인이 휴대폰에 설치해서 쓰는 생활 중요정보 관리 PWA다.

- 들어올 돈, 나갈 돈, 중요한 날짜, 금고 메모를 한 앱에서 관리
- 장보기/체크리스트/생활용품/집안일 기능은 유지하되 전면 탭에서는 제외
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

- 홈 탭: 오늘 중요한 것, 이번 달 돈 흐름, 곧 챙길 날짜/금고 메모
- 일정 탭: 월간/주간 캘린더, 오늘 요약, 일정/기념일 CRUD, 일정 메모
- 흐름 탭: 들어올 돈, 나갈 돈, 날짜별 반복 수입/지출, 기록, 반복돈, 계산기
- 금고 탭: 중요 메모, 돈 메모, 계약/정리, 갱신/만료, 집/차량 기록
- 생활 탭: 장보기, 할 일, 용품, 집안일, 템플릿 기능은 유지하되 하단 탭에서는 숨김
- 설정: 헤더 설정 아이콘에서 진입. 집 정보, 구성원, 카테고리, 설정 메모
- 헤더: 좌측 로고/앱 이름 영역을 누르면 홈 탭으로 이동
- PWA: manifest, service worker, Vercel 설정
- 배포: Vercel 프로덕션 배포 완료 (`https://onzip.vercel.app`)
- 분석: Vercel Web Analytics 방문 분석 추가. GA4 측정 ID(`VITE_GA_MEASUREMENT_ID=G-3206HZH0BS`)로 익명 이벤트 분석 활성화
- 저장 안내: 설정에 로컬 저장 안내 표시
- 설치 UX: Android는 Chrome 설치를 권장하고, 삼성 인터넷에서는 자동 설치 팝업 대신 수동 설치 안내를 표시
- 공유 미리보기: `public/og-image.png`와 Open Graph/Twitter 메타 태그 설정 완료
- 공유/문의/백업: 설정 탭에서 앱 링크 공유, 문의 메일(`holyyomi@naver.com`), 로컬 JSON 파일 내보내기 가능. 앱 링크 공유와 내 데이터 백업은 별도 카드로 분리하고, 최근 백업 상태를 표시
- 백업 복원: 설정 탭에서 온집 JSON 백업 파일을 불러와 현재 기기의 로컬 데이터를 교체할 수 있음
- 온보딩/업데이트: 첫 실행 안내, 설정의 최근 업데이트 카드, 새 버전 확인/적용 버튼 추가
- SEO 기본 파일: `public/robots.txt`, `public/sitemap.xml`
- 디자인: Airbnb + Apple 혼합 톤의 밝은 모바일 앱 UI
- 브랜드: imagegen으로 생성한 `assets/brand/onzip-logo.png` 원본에서 PWA 아이콘을 만들고, `온집` 이름을 헤더/홈/설정에 명확히 표시
- 기능 아이콘: imagegen으로 생성한 `assets/brand/onzip-feature-sprite.png`에서 12개 기능 PNG를 잘라 `public/icons/features/`에 저장. 홈 빠른버튼, 하단 탭, 빠른추가, 탭 메모에 문자 배지 대신 이미지 아이콘 사용
- 빠른 추가: 저장 후 홈/흐름/일정/금고 화면 즉시 갱신, 완료 알림 표시
- 첫 실행 데이터: 새 사용자는 예시 생활 데이터 없이 빈 앱으로 시작. 기본 구성원, 앱 설정, 체크리스트 템플릿만 준비
- 데이터 보존: 앱 시작 시 기존 `onzip_` 로컬 데이터를 삭제하는 초기화 마이그레이션 제거. 업데이트는 UI/앱 셸만 교체하고 사용자 데이터는 유지
- PWA 업데이트: 새 서비스워커가 준비되면 하단 업데이트 안내를 표시하고, 설정의 앱 업데이트 카드에서 수동 확인/적용 가능
- 금액 보호: 설정에서 `금액 가리기`를 켜면 홈, 흐름, 일정, 금고, 분담/구독 계산 결과의 주요 금액이 `***원`으로 표시됨. CSV 내보내기는 실제 금액 포함 안내 후 진행
- 앱 잠금: 설정에서 숫자 4~6자리 PIN을 설정하면 앱 시작 시 잠금 화면 표시. PIN 원문은 저장하지 않고 salt+SHA-256 해시만 저장. 5분 미사용 또는 1분 이상 백그라운드 후 복귀 시 자동 재잠금. 기본적으로 접힌 선택/고급 옵션으로 표시해 매일 사용 흐름에서는 금액 가리기와 민감 메모 숨김이 먼저 보이도록 정리
- 금고 보호: 설정에서 `민감 메모 숨김`을 켜면 `민감`, `비밀`, `숨김`, `private` 태그가 붙은 금고 메모의 제목/내용을 가림
- 금고 템플릿: 새 금고 메모 작성 시 계좌 잔액, 주식/코인, 보험/계약, 대출/카드, 갱신/만료, 비상정보 템플릿으로 제목/내용/유형/태그를 빠르게 채울 수 있음
- 금고 찾기: 금고 목록에 `중요만`, `민감만` 빠른 필터를 추가하고, 홈의 중요 금고 노출 기준을 계좌/보험/계약/투자/대출/카드/갱신/만료/비상 태그까지 확장
- 금고 날짜: 갱신/만료 유형 또는 갱신/만료 태그가 붙은 금고 메모는 앞으로 30일 안에 해당하면 홈의 `곧 챙길 것`에 날짜와 함께 표시
- 모바일 사용성: 홈 첫 화면을 `오늘 중요한 것 → 빠른 추가 → 이번 달 흐름 → 곧 챙길 것` 흐름으로 정리. 빠른추가는 `나갈 돈`, `들어올 돈`, `중요 날짜`, `금고 메모` 중심으로 정리
- 탭 메모 사용성: 메모 카드 높이를 줄이고 앱 하단 여백을 늘려 바닥에서 잘려 보이지 않도록 수정
- 탭별 쉬운 진입: 흐름/일정/금고 탭 상단에 바로 추가 버튼을 배치해 하단 `+` 버튼을 찾지 않아도 핵심 입력을 바로 열 수 있음
- 입력 UX: 돈/일정/금고 추가는 핵심 필드만 먼저 보이고 날짜/담당자/반복 등은 `자세히` 안에 배치
- 입력 폼 2차 단순화: 일정/장보기는 추천 버튼과 Enter 저장을 지원. 체크리스트/기록/고정지출/구독은 필수 입력만 먼저 보이고 마감일, 담당자, 결제수단, 태그, 메모 등은 `자세히` 안에 배치
- 문구 체계: 하단 탭은 `홈`, `흐름`, `일정`, `금고`로 정리하고, 주요 추가 버튼은 돈/날짜/중요 메모 중심으로 통일
- 빈 상태/목록 UI: 주요 생활·돈·기록 화면의 빈 상태, 추가 버튼, 목록 카드를 앱 톤에 맞게 통일
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
    vaultRecords.ts
    csvExport.ts
docs/
  ANALYTICS.md
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
onzip_update_notice_20260519_flow_vault
```

`onzip_app_settings` 주요 설정:
- `hide_amounts`: `true`이면 주요 금액을 `***원`으로 표시
- `app_lock_pin_hash`: 앱 잠금 PIN 해시
- `app_lock_pin_salt`: 앱 잠금 PIN salt
- `hide_sensitive_records`: `true`이면 민감 태그 금고 메모 제목/내용 숨김
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

`src/utils/calendarAggregator.ts`에서 고정지출, 구독, 체크리스트를 캘린더 이벤트로 변환한다. 원본 데이터는 각 repository에만 저장한다.

### 탭 메모장

`TabMemoCard`는 `tabMemoStore.ts`를 통해 `onzip_tab_memos`에 자동 저장한다.

---

## 8. 다음 추천 작업

1. 모바일 실사용 흐름 다듬기
   - 변경된 오늘/흐름/일정/금고 구조를 실제 사용자에게 다시 테스트
   - 사용자가 `받을 돈`, `줄 돈`, `갱신일`, `금고 메모`를 막힘없이 추가하는지 확인

2. 금고 보안성 보완
   - 앱 전체 잠금보다 금고/민감 메모 중심 보호가 더 자연스러운지 실사용 테스트
   - 필요하면 민감 메모 열람 시에만 PIN 확인하는 방식 검토

3. 휴대폰 PWA 설치 확인
   - `https://onzip.vercel.app` 접속 후 홈 화면 추가
   - 설치 후 앱 아이콘, 첫 로딩, localStorage 데이터 유지 확인

4. 사용성 QA
   - `docs/USAGE_QA_7D.md` 기준으로 입력 귀찮음, 화면 복잡도 점검

---

## 9. 운영 규칙

- 한국어로 간결하게 커뮤니케이션
- 다크 모드 추가 금지
- 서버 공유/로그인/백업 기능은 다시 넣지 않음
- 외부 라이브러리 추가는 꼭 필요한 경우만
- 변경 후 `npm run typecheck`와 `npm run build` 실행
- 분석 이벤트에는 사용자가 입력한 제목, 금액, 메모, 태그, 구성원 이름을 넣지 않음
- 기존 사용자 데이터 초기화 로직 추가 금지. 필요한 경우 명시적 백업/복원 또는 사용자 확인이 있는 삭제 기능으로만 처리
