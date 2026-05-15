# HANDOFF.md — 온집 (onzip) 인수인계서

> **작성일**: 2026-05-15  
> **작성자**: Claude Sonnet 4.6 (Claude Code)  
> **인수자**: Codex CLI  
> **목적**: 5시간 한도 소진으로 인한 에이전트 교체 인수인계
> **Codex 점검**: 2026-05-15 — TASK_LIST 상태 정리 및 Supabase 연동 계획서 추가

---

## 0. 즉시 확인할 것 (Codex 시작 시 반드시 실행)

```bash
cd C:\Users\user\Desktop\자동화\onzip

# 1. 현재 상태 확인
git log --oneline        # 커밋 이력 확인
npm run typecheck        # 타입 오류 없음 확인
npm run build            # 빌드 통과 확인

# 2. 개발 서버 실행
npm run dev              # localhost:3000
```

**현재 빌드 상태**: ✅ 타입 오류 0개, PWA 빌드 통과 (294kB precache)

---

## 1. 프로젝트 개요

**온집** — 우리 집 생활을 한곳에.  
신혼부부부터 4인 가족까지 사용하는 **가족 생활관리 PWA 웹앱**.

- 캘린더 중심으로 일정·돈관리·장보기·체크리스트·기록을 한 앱에서 관리
- 현재: **localStorage 기반 로컬 MVP** (1기기, 싱글 유저)
- 다음 단계: **Supabase 연동** → 멀티 디바이스 공유 (부부 실시간 동기화)

---

## 2. 기술 스택

| 항목 | 기술 |
|---|---|
| Frontend | React 18 + TypeScript (strict) |
| 빌드 도구 | Vite 5 |
| 스타일 | Tailwind CSS v3 |
| 상태 관리 | React useState/useMemo (Zustand 미사용) |
| 저장소 | localStorage (BaseRepository<T> 패턴) |
| PWA | vite-plugin-pwa (서비스워커 자동 생성) |
| 배포 대상 | Vercel (vercel.json 설정 완료) |
| 패키지 매니저 | npm |

---

## 3. 완료된 작업 (전체 이력)

### Phase 0 — 프로젝트 세팅
- Vite + React + TypeScript + Tailwind 세팅
- AppShell, Header(+버튼), BottomTabBar (5탭)
- 모바일 UX: safe-area-bottom, iOS 줌 방지, hide-scrollbar

### Phase 1 — 데이터 레이어
- **15개 TypeScript 모델** (`src/data/models/index.ts`)
- **15개 localStorage 레포지토리** (`src/data/repositories/`)
- **Seed 데이터** — 최초 실행 시 예시 데이터 자동 삽입

### Phase 2 — 캘린더 탭
- 월간 6×7 그리드 (외부 라이브러리 없음, 직접 구현)
- **주간 보기** — 현재 주 7일 보기 + 월간/주간 전환 버튼
- **이벤트 집계** — 고정지출·구독·체크리스트 캘린더 자동 표시
- **반복 이벤트** — yearly/monthly/weekly/daily 반복 지원
- **오늘 요약 카드** — 일정/납부/체크리스트 카운트 + 기념일 D-Day (14일 이내)
- 일정/기념일 추가·수정·삭제 모달

### Phase 3 — 돈관리 탭 (6개 서브탭)
- **요약**: 수입·지출·고정지출·구독 카드, 최근 3개월 트렌드 바 차트, 납부 진행 현황
- **가계부**: 날짜 그룹, 수입·지출 CRUD, 카테고리·날짜 필터, **CSV 내보내기**
- **고정지출**: 납부완료 체크, 캘린더 자동 표시, 공과금은 주황 dot으로 구분
- **수입**: 고정·부수입 관리
- **구독**: 상태 배지, 연간 비용 자동 계산
- **계산기**: 일반 계산기, 생활비 분담(5:5·6:4·7:3·직접), 구독 연간 계산기

### Phase 4 — 생활 탭 (5개 서브탭)
- **체크리스트**: 펼침/접기, 인라인 항목 추가(Enter), 진행률 바
- **장보기**: 자주 사는 품목 빠른 추가, **체크 시 실제금액 입력 미니 모달**, 예상·실제 합계 비교
- **생활용품**: 2열 그리드, 상태 순환(충분→부족→구매필요), 장보기로 보내기
- **집안일**: 반복 라벨, 완료 체크, 담당자
- **템플릿**: 4개 기본 템플릿, 미리보기, 내 체크리스트로 복사

### Phase 5 — 기록 탭
- 5가지 유형(생활/소비메모/가족회의록/기념일/집관련)
- 날짜 그룹, 유형 필터, 전문 검색(제목+내용+태그), 태그 배지
- 가족 회의록 타입 선택 시 기본 템플릿 자동 삽입

### Phase 6 — 설정 탭 (4개 서브탭)
- **집 정보**: 집 이름 편집 → 헤더 즉시 반영, 앱 현황 통계
- **가족 구성원**: 추가·수정·색상·활성상태, 기본 구성원(나/배우자/공동) 보호
- **카테고리**: 지출·수입·고정지출 카테고리 추가·삭제 (기본 카테고리 삭제 불가)
- **백업**: JSON 전체 내보내기/가져오기, 가계부 CSV 내보내기, 사용량 표시

### Phase 7 — PWA + QA
- vite-plugin-pwa: manifest(한국어), 서비스워커, 아이콘 3종
- vercel.json: SPA 라우팅 + 보안 헤더 + SW 캐시 설정
- docs/TEST_CHECKLIST.md: 8개 골든패스 시나리오
- EmptyState 공통 컴포넌트

### v2 추가 기능
- **헤더 "+" 빠른 추가 메뉴**: 7가지 항목 (QuickAddMenu + QuickAddModal)
- **카테고리 커스터마이징**: categoryStore.ts, 설정 탭 연동
- **반복 이벤트 캘린더 표시**: calendarAggregator 개선
- **기념일 D-Day**: TodaySummaryCard에 14일 이내 기념일 배지
- **월별 트렌드 차트**: 최근 3개월 수입/지출 이중 바 차트
- **납부 진행 현황 카드**: 완료율 + 미납 경고
- **공과금 → utility 색상**: 주황 dot 구분
- **장보기 실제금액**: 체크 시 미니 모달
- **CSV 내보내기**: 가계부 + 설정 탭 백업
- **Supabase SQL 스키마**: docs/SUPABASE_SCHEMA.sql 작성 완료

---

## 4. 전체 파일 구조

```
onzip/
├── .gitattributes          # LF line endings
├── .gitignore
├── .env.example            # Supabase 환경변수 예시 (실제 .env는 커밋 금지)
├── AGENTS.md               # ★ 운영 규칙 (반드시 읽을 것)
├── vercel.json             # SPA 라우팅 + 보안 헤더
├── index.html              # PWA meta tags, viewport-fit=cover
├── package.json            # React 18, Vite 5, Tailwind 3, vite-plugin-pwa
├── tsconfig.json           # strict: true, jsx: react-jsx
├── tsconfig.node.json
├── vite.config.ts          # VitePWA 설정 포함
├── tailwind.config.ts
├── postcss.config.js
├── scripts/
│   └── generate-icons.mjs  # 아이콘 PNG 생성 스크립트
├── public/
│   └── icons/              # icon-192.png, icon-512.png, icon-512-maskable.png
├── docs/
│   ├── HANDOFF.md          # 이 파일
│   ├── TASK_LIST.md        # TASK-001~032 전체 현황
│   ├── DATA_MODEL.md       # localStorage 키 규칙
│   ├── README_WORKFLOW.md  # 개발 운영 규칙
│   ├── TEST_CHECKLIST.md   # 8개 골든패스 테스트
│   ├── SUPABASE_SCHEMA.sql # ★ 다음 단계: Supabase 연동 SQL
│   └── SUPABASE_INTEGRATION_PLAN.md # Supabase 전환 설계 기준
└── src/
    ├── main.tsx            # runSeed() 호출 포함
    ├── styles/index.css    # Tailwind + 모바일 UX 유틸리티
    ├── app/
    │   └── App.tsx         # 탭 라우팅 + QuickAdd 상태 관리
    ├── components/
    │   ├── common/
    │   │   ├── FormModal.tsx      # ★ 재사용 바텀시트 (Field, inputCls, FormActions)
    │   │   ├── EmptyState.tsx     # 빈 상태 컴포넌트
    │   │   ├── QuickAddMenu.tsx   # 헤더 + 바텀시트 메뉴 (7가지)
    │   │   └── QuickAddModal.tsx  # QuickAddType → 해당 Form 라우팅
    │   ├── layout/
    │   │   ├── AppShell.tsx       # safe-area, max-w-lg
    │   │   ├── Header.tsx         # 집 이름(householdRepo), + 버튼
    │   │   └── BottomTabBar.tsx   # 5탭, 44px 터치 영역
    │   ├── pages/
    │   │   ├── CalendarPage.tsx   # 월간/주간 전환, EventFormModal
    │   │   ├── MoneyPage.tsx      # 6 서브탭, 월 네비게이션
    │   │   ├── LifePage.tsx       # 5 서브탭
    │   │   ├── RecordsPage.tsx    # → records/RecordsPage 재내보내기
    │   │   └── SettingsPage.tsx   # 4 서브탭 (집정보/구성원/카테고리/백업)
    │   ├── calendar/
    │   │   ├── CalendarMonthView.tsx  # 6×7 그리드
    │   │   ├── CalendarWeekView.tsx   # 7일 주간 보기
    │   │   ├── CalendarDayCell.tsx    # 날짜 셀 + 이벤트 dot
    │   │   ├── TodaySummaryCard.tsx   # 오늘 요약 + D-Day
    │   │   ├── DayEventPanel.tsx      # 선택 날짜 이벤트 목록
    │   │   └── EventFormModal.tsx     # 일정/기념일 CRUD
    │   ├── money/
    │   │   ├── MoneySummaryTab.tsx        # 요약 카드 + 트렌드 차트
    │   │   ├── PaymentProgressCard.tsx    # 납부 진행 현황
    │   │   ├── LedgerTab.tsx              # 가계부 목록 + CSV
    │   │   ├── LedgerFormModal.tsx        # 수입/지출 CRUD
    │   │   ├── FixedExpenseTab.tsx        # 고정지출 + 납부 체크
    │   │   ├── FixedExpenseFormModal.tsx
    │   │   ├── IncomeTab.tsx
    │   │   ├── IncomeFormModal.tsx
    │   │   ├── SubscriptionTab.tsx        # 구독 + 연간 계산
    │   │   ├── SubscriptionFormModal.tsx
    │   │   └── CalculatorTab.tsx          # 계산기 3종
    │   ├── life/
    │   │   ├── ChecklistTab.tsx           # 인라인 항목 관리
    │   │   ├── ChecklistFormModal.tsx
    │   │   ├── ShoppingTab.tsx            # 실제금액 미니 모달
    │   │   ├── ShoppingFormModal.tsx
    │   │   ├── SuppliesTab.tsx            # 상태 순환 + 장보기 연동
    │   │   ├── ChoreTab.tsx               # 집안일 + 인라인 폼
    │   │   └── TemplateTab.tsx            # 템플릿 → 체크리스트 복사
    │   └── records/
    │       ├── RecordsPage.tsx            # 기록 목록 + 검색 + 필터
    │       └── RecordFormModal.tsx        # 5가지 유형 CRUD
    ├── data/
    │   ├── models/
    │   │   └── index.ts        # ★ 15개 TypeScript 타입 정의
    │   ├── repositories/
    │   │   ├── base.ts         # BaseRepository<T>, newId(), now()
    │   │   └── index.ts        # ★ 15개 repo 싱글톤 + exportAllData()
    │   ├── supabase/
    │   │   ├── client.ts       # lazy Supabase client + 연결 확인 헬퍼
    │   │   ├── idMapping.ts    # localStorage ID → Supabase uuid 매핑
    │   │   └── migration.ts    # localStorage 데이터 Supabase row 변환/업서트
    │   └── seed/
    │       └── index.ts        # runSeed() — onzip_seed_done_v1 키로 1회 실행
    └── utils/
        ├── date.ts             # 날짜 유틸 (외부 라이브러리 없음)
        ├── calendarAggregator.ts  # ★ 이벤트 집계 (고정지출·구독 실시간 변환)
        ├── constants.ts        # 카테고리·결제수단·납부일 옵션
        ├── categoryStore.ts    # 커스텀 카테고리 저장소
        └── csvExport.ts        # CSV 내보내기 (UTF-8 BOM)
```

---

## 5. ★ 핵심 설계 패턴 (반드시 숙지)

### 패턴 1: FormModal 재사용
모든 form modal은 `src/components/common/FormModal.tsx`의 컴포넌트를 재사용.
```tsx
import FormModal, { Field, inputCls, FormActions } from '../common/FormModal'

// 사용 예시
<FormModal title="고정지출 추가" onClose={onClose}>
  <Field label="이름 (필수)">
    <input className={inputCls} ... />
  </Field>
  <FormActions onSave={handleSave} onDelete={handleDelete} saveLabel="저장" />
</FormModal>
```

### 패턴 2: refreshKey + useMemo
저장/삭제 후 화면 재계산 트리거 패턴.
```tsx
const [refreshKey, setRefreshKey] = useState(0)
const onRefresh = () => setRefreshKey(k => k + 1)

const data = useMemo(
  () => repo.getAll(),
  // eslint-disable-next-line react-hooks/exhaustive-deps
  [refreshKey]
)

// 저장 후
function handleSaved() {
  setShowModal(false)
  setRefreshKey(k => k + 1)  // 또는 onRefresh()
}
```

### 패턴 3: calendarAggregator
고정지출·구독·체크리스트를 캘린더에 실시간 변환. **원본 데이터는 각 repository에만 저장**.
```typescript
// 캘린더 화면에서만 조합:
import { getAggregatedEvents, AggregatedEvent } from '../../utils/calendarAggregator'
const events = getAggregatedEvents(year, month) // 고정지출+구독+체크리스트 통합
```

### 패턴 4: 수정 가능 이벤트 판단
```typescript
// source_type === null → 직접 추가한 일정 → 수정 가능
// source_type !== null → 자동 생성 (고정지출·구독) → 수정 불가
const isEditable = !event.source_type
```

### 패턴 5: 반복 이벤트
CalendarEvent에 `repeat_rule` 설정 시 `calendarAggregator.getRepeatDates()`가 해당 월에 맞는 날짜를 자동 생성.
반복 이벤트의 id: `${originalId}_${date}` (수정 시 `original_id`로 원본 접근).

### 패턴 6: localStorage 키 규칙
모든 키는 `onzip_*` 접두사 사용 (15개):
```
onzip_households, onzip_members, onzip_calendar_events,
onzip_ledger_entries, onzip_fixed_expenses, onzip_incomes,
onzip_subscriptions, onzip_checklists, onzip_checklist_items,
onzip_shopping_items, onzip_household_supplies, onzip_chores,
onzip_records, onzip_templates, onzip_app_settings,
onzip_custom_categories (카테고리 커스터마이징),
onzip_supabase_id_map (Supabase 마이그레이션 ID 매핑),
onzip_seed_done_v1 (Seed 실행 플래그)
```

### 패턴 7: 기본 멤버 ID
```
"me"     = 나
"spouse" = 배우자
"shared" = 공동
```
이 3개는 삭제 불가. 새 멤버는 `newId()` (crypto.randomUUID) 사용.

### 패턴 8: LifeRecord 이름
TypeScript 내장 `Record<K,V>` 충돌 방지로 모델명 `LifeRecord` 사용.
Supabase 테이블명은 `records` 유지.

### 패턴 9: 서브탭 공통 구조
```tsx
// MoneyPage, LifePage, SettingsPage 모두 동일 패턴
<div className="flex overflow-x-auto bg-white border-b border-gray-100 px-2 hide-scrollbar">
  {SUB_TABS.map(t => (
    <button className={`flex-shrink-0 px-3 py-3 text-sm font-medium border-b-2 ${
      activeTab === t.value ? 'text-blue-600 border-blue-600' : 'text-gray-400 border-transparent'
    }`}>
```

---

## 6. 데이터 모델 요약

`src/data/models/index.ts`에 15개 TypeScript 인터페이스 정의.
`src/data/repositories/index.ts`에 15개 싱글톤 repo + `exportAllData()`.

**주요 타입:**
```typescript
type RepeatRule = 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly'
type MemberRole = 'me' | 'spouse' | 'child' | 'parent' | 'family' | 'shared'
type PaymentMethod = 'card' | 'auto_transfer' | 'bank_transfer' | 'manual' | 'simple_pay'
type SupplyStatus = 'enough' | 'low' | 'need_buy'
type SubscriptionStatus = 'active' | 'considering_cancel' | 'cancelled'
type FixedExpenseStatus = 'pending' | 'done' | 'overdue'
type RecordType = 'life' | 'spending_note' | 'family_meeting' | 'anniversary' | 'home'
```

---

## 7. 앞으로 할 일 (우선순위 순)

### 🔴 HIGH: Supabase 연동 (멀티 디바이스 공유)

**배경**: SQL 스키마 `docs/SUPABASE_SCHEMA.sql` 이미 완성.  
**사전 계획**: `docs/SUPABASE_INTEGRATION_PLAN.md` 참고.  
**목표**: 부부가 각자 기기에서 같은 데이터를 공유.

**중요 설계 메모**:
- 현재 앱은 기본 멤버 ID로 `"me"`, `"spouse"`, `"shared"` 문자열을 사용한다.
- Supabase SQL은 `members.id`와 `households.id`를 uuid로 정의한다.
- `SUPABASE_SCHEMA.sql`은 로컬 ID 마이그레이션을 위해 `households.local_alias`, `members.local_alias`, `household_users`를 포함한다.
- Supabase 클라이언트는 `src/data/supabase/client.ts`에 lazy helper로 준비되어 있으며, env가 없으면 앱 시작 시점에는 실패하지 않는다.
- 로컬 데이터 마이그레이션 유틸은 `src/data/supabase/migration.ts`에 있으며, 실제 실행은 Supabase SQL 적용과 `.env` 설정 후 수동으로 해야 한다.
- 바로 BaseRepository를 Supabase CRUD로 교체하면 동기식 화면 코드가 깨질 수 있다.
- 권장 전략은 uuid 유지 + 마이그레이션 매핑 + localStorage 기반 sync 계층을 먼저 붙이는 방식이다.

**작업 순서**:
1. Supabase 프로젝트 생성 (사용자가 직접)
   - https://supabase.com → New Project
   - SQL Editor에서 `docs/SUPABASE_SCHEMA.sql` 실행
   - Project URL과 anon key 복사
   
2. 환경변수 설정
   ```
   .env 파일 생성:
   VITE_SUPABASE_URL=https://xxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJI...
   ```

3. Supabase 클라이언트 설치 및 설정
   ```bash
   npm install @supabase/supabase-js
   ```
   `src/data/supabase/client.ts` 생성:
   ```typescript
   import { createClient } from '@supabase/supabase-js'
   export const supabase = createClient(
     import.meta.env.VITE_SUPABASE_URL,
     import.meta.env.VITE_SUPABASE_ANON_KEY
   )
   ```

4. BaseRepository를 Supabase로 교체
   - 현재: `src/data/repositories/base.ts` (localStorage)
   - 교체: Supabase CRUD로 변환
   - 전략: localStorage → Supabase 어댑터 패턴

5. 인증 추가 (Supabase Auth)
   - 이메일/소셜 로그인
   - household_id로 데이터 분리
   - RLS (Row Level Security) 활성화

**예상 소요**: Medium → Large (인증 포함 시 Large)

---

### 🟡 MEDIUM: PWA 푸시 알림

**목표**: 고정지출 납부일 전날 브라우저 알림.

**작업**:
1. Service Worker에 알림 로직 추가
2. Notification API 권한 요청
3. 납부일 기준 알림 스케줄링

```typescript
// 납부일 D-1 알림 예시
Notification.requestPermission().then(perm => {
  if (perm === 'granted') {
    new Notification('온집 납부 알림', {
      body: `내일 ${title} ${amount}원 납부 예정`,
    })
  }
})
```

**예상 소요**: Medium

---

### 🟡 MEDIUM: 월별 통계 상세

**목표**: 돈관리 탭에 카테고리별 파이 차트 또는 상세 분석.

**작업**:
- 카테고리별 지출 합계 계산
- CSS 기반 도넛 차트 또는 바 차트 (외부 라이브러리 없이)
- 전월 대비 증감 표시

---

### 🟢 LOW: 반복 이벤트 완성도 개선

**현재 문제**: 반복 이벤트를 캘린더에서 "완료" 처리하면 모든 미래 반복에도 영향을 줌.  
**해결 방향**: 해당 날짜의 completion만 별도 저장 (exception 패턴).

---

### 🟢 LOW: Vercel 실제 배포

**작업**:
```bash
npm install -g vercel
vercel login
vercel --prod
```
`vercel.json` 이미 설정 완료. GitHub 연결 시 main 브랜치 push → 자동 배포.

---

### 🔵 v3 이후: 기능 확장

- 아이 성장 기록 (3인 가족 확장)
- 관리비·공과금 자동 입력 (OCR 또는 수동)
- 가족 채팅 / 알림 공유
- 복잡한 통계 대시보드
- 다국어 지원

---

## 8. 현재 알려진 제한사항 및 미해결 이슈

| 항목 | 내용 | 우선순위 |
|---|---|---|
| localStorage 5MB 제한 | 데이터 많아지면 IndexedDB 전환 필요 | Medium |
| esbuild 취약점 (moderate) | 개발 서버 전용, 프로덕션 무관 | Low |
| 반복 이벤트 완료 처리 | 특정 날짜만 완료 처리 불가 | Medium |
| 다크 모드 | 사용자 요청으로 제거됨, 밝은 모드만 유지 | N/A |
| iOS PWA 아이콘 | PNG 필요 (SVG → PNG 변환 스크립트 있음) | Low |
| TASK-026 카테고리 설정 | 커스텀 카테고리는 지원, 기본 카테고리 수정 불가 | Low |

---

## 9. 개발 운영 규칙 (YOMI Codex Bootstrap 프로토콜)

### 작업 순서 (반드시 준수)
```
1. HANDOFF.md 확인 (지금 이 파일)
2. 계획 수립 → 사용자 승인
3. 구현
4. npm run typecheck → npm run build
5. HANDOFF.md 업데이트
6. git commit
```

### 커밋 메시지 규칙
```
feat: implement [feature name]
fix: resolve [bug description]
docs: update [document name]
refactor: [what changed]
```

### 절대 금지
- 타입 오류 있는 상태로 커밋
- 사용자 승인 없이 .env 수정
- 외부 API Key를 코드에 직접 작성
- npm audit fix --force 실행 (breaking change 위험)

### Plan-First 규칙
- 모든 신규 기능/버그 수정 전 계획 먼저 제안
- 사용자 승인 후 구현 시작

---

## 10. 실행 명령어 참조

```bash
# 개발
npm run dev           # localhost:3000

# 검증
npm run typecheck     # tsc --noEmit (오류 0개 확인)
npm run build         # dist/ 생성 + PWA SW 생성

# 미리보기
npm run preview       # dist/ 로컬 미리보기

# 아이콘 재생성 (canvas 설치 후)
node scripts/generate-icons.mjs

# Vercel 배포
vercel --prod
```

---

## 11. Git 이력

```
a774044 feat: house name edit, CSV export, utility color, shopping actual amount, Supabase schema
01a6ada feat: weekly calendar view, payment progress card, UI polish
bc8e4d1 feat: quick-add menu, anniversary D-day, monthly expense trend
a761381 feat: v2 improvements - remove dark mode, category management, repeat events
49fa9a0 docs: final HANDOFF update - MVP v1 complete
2ba0bf9 feat: Phase 7 QA + PWA deployment
48a59ba docs: HANDOFF + TASK_LIST update
c698987 feat: Phase 5-6 Records & Settings tab
71274f1 feat: Phase 4 Life tab
6be31fe feat: initialize onzip project (Phase 0-3)
```

---

## 12. Codex에게 전하는 메모

1. **이 프로젝트의 사용자는 개발자가 아닙니다.** 항상 한국어로 소통하고, 기술적 설명은 쉽게 풀어서 전달하세요.

2. **작은 변경으로 시작하세요.** 큰 리팩토링보다 기능 추가 우선. 기존 FormModal, BaseRepository 패턴을 재사용하면 코드가 일관성이 있습니다.

3. **Supabase 연동이 다음 핵심 과제입니다.** `docs/SUPABASE_SCHEMA.sql`이 이미 준비되어 있으니 SQL 실행 후 바로 연동 작업 시작 가능합니다.

4. **TypeScript strict 모드입니다.** `noUnusedLocals: true`가 활성화되어 있어 미사용 import도 오류입니다. useMemo deps에 eslint-disable 주석 필요한 경우 이미 패턴으로 사용 중입니다.

5. **매 작업 후 반드시**: `npm run typecheck` → `npm run build` → `git commit`

6. **사용자 선호사항**: 다크 모드 싫어함. 밝은 모드만 유지. 간결한 커뮤니케이션 선호.

---

*이 문서는 2026-05-15 Claude Sonnet 4.6이 작성했습니다.*  
*다음 인수인계 시 이 문서를 업데이트해 주세요.*
