# AGENTS.md — 온집 (onzip)
> 최종 업데이트: 2026-05-15

## Project Goal
온집 — 우리 집 생활을 한곳에.  
캘린더 중심으로 가족의 일정·돈관리·장보기·체크리스트·생활기록을 함께 관리하는 생활 OS.  
신혼부부 → 3~4인 가족까지 확장 가능한 PWA 웹앱.

## Tech Stack
- Frontend: React 18 + TypeScript (strict) + Vite 5
- Styling: Tailwind CSS v3 (다크 모드 없음 — 사용자 요청)
- Storage: localStorage BaseRepository<T> → Supabase 전환 예정
- PWA: vite-plugin-pwa
- Package Manager: npm

## Current Status
MVP v1 완성 + v2 기능 추가 완료.  
다음 단계: Supabase 연동 (멀티 디바이스 공유).  
SQL 스키마 준비됨: `docs/SUPABASE_SCHEMA.sql`

## Repository Structure
```
src/
  app/App.tsx               — 탭 라우팅 + QuickAdd 상태
  components/
    common/                 — FormModal, EmptyState, QuickAddMenu, QuickAddModal
    layout/                 — AppShell, Header, BottomTabBar
    pages/                  — 5탭 페이지 (Calendar, Money, Life, Records, Settings)
    calendar/               — 6개 컴포넌트 (Month/Week View, DayCell, Summary, Panel, Modal)
    money/                  — 11개 컴포넌트 (Summary, Payment, Ledger, Fixed, Income, Sub, Calc)
    life/                   — 7개 컴포넌트 (Checklist, Shopping, Supplies, Chore, Template)
    records/                — 2개 컴포넌트
  data/
    models/index.ts         — 15개 TypeScript 타입
    repositories/base.ts    — BaseRepository<T>, newId(), now()
    repositories/index.ts   — 15개 repo 싱글톤 + exportAllData()
    seed/index.ts           — 최초 실행 예시 데이터
  utils/
    date.ts                 — 날짜 유틸 (외부 라이브러리 없음)
    calendarAggregator.ts   — 이벤트 집계 + 반복 이벤트 생성
    constants.ts            — 카테고리·결제수단 공통 상수
    categoryStore.ts        — 커스텀 카테고리 localStorage
    csvExport.ts            — CSV 내보내기 (UTF-8 BOM)
docs/
  HANDOFF.md                — ★ 완전한 인수인계서
  SUPABASE_SCHEMA.sql       — ★ 다음 단계 SQL
  TASK_LIST.md              — TASK-001~032 완료 현황
  TEST_CHECKLIST.md         — 실사용 테스트 체크리스트
```

## Run Commands
- `npm run dev` — localhost:3000 개발 서버
- `npm run build` — 프로덕션 빌드 (PWA SW 포함)
- `npm run typecheck` — 타입 오류 확인 (0개 유지 필수)
- `npm run preview` — dist/ 로컬 미리보기
- `vercel --prod` — Vercel 배포

## Key Patterns (반드시 재사용)

### FormModal 패턴
```tsx
import FormModal, { Field, inputCls, FormActions } from '../common/FormModal'
<FormModal title="제목" onClose={onClose}>
  <Field label="필드명"><input className={inputCls} /></Field>
  <FormActions onSave={handleSave} onDelete={handleDelete} saveLabel="저장" />
</FormModal>
```

### refreshKey 패턴
```tsx
const [refreshKey, setRefreshKey] = useState(0)
const data = useMemo(() => repo.getAll(), [refreshKey]) // eslint-disable-next-line
function handleSaved() { setShowModal(false); setRefreshKey(k => k + 1) }
```

### 캘린더 이벤트 집계
```typescript
import { getAggregatedEvents } from '../../utils/calendarAggregator'
// 고정지출+구독+체크리스트를 실시간으로 캘린더 이벤트로 변환
```

## localStorage 키 목록
```
onzip_households, onzip_members, onzip_calendar_events,
onzip_ledger_entries, onzip_fixed_expenses, onzip_incomes,
onzip_subscriptions, onzip_checklists, onzip_checklist_items,
onzip_shopping_items, onzip_household_supplies, onzip_chores,
onzip_records, onzip_templates, onzip_app_settings,
onzip_custom_categories, onzip_seed_done_v1
```

## Safety Rules
- `.env`, API Key는 절대 코드에 직접 작성 금지
- 파일 삭제/DB 스키마 변경은 사용자 승인 후
- `npm audit fix --force` 금지 (breaking change)
- Supabase anon key는 .env에만 저장, .gitignore 확인 필수

## Plan-First Rule
- 모든 신규 기능·버그 수정 전 계획 먼저 제안
- 사용자 승인 후 구현

## Coding Rules
- TypeScript strict 유지 (noUnusedLocals, noUnusedParameters)
- 기존 FormModal, BaseRepository 패턴 재사용 우선
- 외부 라이브러리 최소화 (캘린더 직접 구현이 원칙)
- 다크 모드 추가 금지 (사용자 요청)

## Verification Rule (매 작업 후 필수)
1. `npm run typecheck` → 오류 0개
2. `npm run build` → 통과
3. `git commit`

## Definition of Done
- TypeScript 오류 없음
- 빌드 통과
- HANDOFF.md 업데이트
- git commit 완료

## 사용자 선호사항
- 다크 모드 싫어함 → 밝은 모드만 유지
- 한국어로 커뮤니케이션
- 간결하고 명확한 응답 선호
- 계획 먼저, 승인 후 구현
