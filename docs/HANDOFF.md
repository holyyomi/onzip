# HANDOFF.md — 온집 (onzip)

## 날짜
2026-05-15

## 현재 상태
Phase 0~3 완료. TASK-001~016 완료.
다음: Phase 4 TASK-017 (생활 탭 — 체크리스트, 장보기, 생활용품, 집안일, 템플릿).

## 완료한 TASK

| Phase | TASK | 내용 | 상태 |
|---|---|---|---|
| 0 | TASK-001~003 | Vite+React 세팅, 레이아웃 | ✅ |
| 1 | TASK-004~006 | 데이터 모델, 저장소, Seed | ✅ |
| 2 | TASK-007~010 | 캘린더 전체 | ✅ |
| 3 | TASK-011~016 | 돈관리 전체 | ✅ |

## 주요 파일 구조 (현재)

```
src/
├─ app/App.tsx
├─ components/
│  ├─ common/
│  │  └─ FormModal.tsx       ← 재사용 바텀시트 + Field + FormActions
│  ├─ layout/                ← AppShell, Header, BottomTabBar
│  ├─ pages/
│  │  ├─ CalendarPage.tsx    ✅
│  │  ├─ MoneyPage.tsx       ✅
│  │  ├─ LifePage.tsx        ← placeholder (TASK-017~021)
│  │  ├─ RecordsPage.tsx     ← placeholder (TASK-022~024)
│  │  └─ SettingsPage.tsx    ← placeholder (TASK-025~028)
│  ├─ calendar/              ✅ (5개 컴포넌트)
│  └─ money/                 ✅ (8개 컴포넌트)
├─ data/
│  ├─ models/index.ts
│  ├─ repositories/base.ts, index.ts
│  └─ seed/index.ts
└─ utils/
   ├─ date.ts
   ├─ calendarAggregator.ts
   └─ constants.ts           ← 카테고리, 결제수단 등 공통 상수
```

## 검증 결과
- Type check: ✅ 통과
- Build: ✅ 통과 (197kB JS, 1.23s)

## 핵심 패턴 (Codex 인수인계 시 중요)

1. **FormModal 재사용 패턴**: 모든 form modal은 `src/components/common/FormModal.tsx`의
   `FormModal`, `Field`, `inputCls`, `FormActions`를 재사용.

2. **refreshKey 패턴**: 저장/삭제 후 `onRefresh()` → 부모의 `setRefreshKey(k=>k+1)` →
   useMemo deps에 refreshKey 포함 → 자동 재계산.

3. **useMemo + eslint-disable**: 각 탭에서 useMemo deps에 refreshKey를 포함하면서
   eslint-disable-next-line react-hooks/exhaustive-deps 주석 필요.

4. **공통 상수**: `src/utils/constants.ts`에 카테고리, 결제수단, 납부일 옵션 정의.

5. **서브탭 구조**: MoneyPage처럼 overflow-x-auto + flex-shrink-0으로 가로 스크롤 구현.

## 남은 위험
- esbuild 취약점 (moderate) — 개발 전용
- localStorage 5MB 제한 — 나중에 IndexedDB 전환

## 다음 작업 — Phase 4: 생활 탭 (TASK-017~021)

**TASK-017**: 체크리스트 (`src/components/life/ChecklistTab.tsx`)
**TASK-018**: 장보기 (`src/components/life/ShoppingTab.tsx`)
**TASK-019**: 생활용품 (`src/components/life/SuppliesTab.tsx`)
**TASK-020**: 집안일 (`src/components/life/ChoreTab.tsx`)
**TASK-021**: 템플릿 센터 (`src/components/life/TemplateTab.tsx`)

생성 위치: `src/components/life/`
MoneyPage와 동일한 서브탭 구조 사용.
FormModal 재사용.

## 재개 명령어
```bash
cd C:\Users\user\Desktop\자동화\onzip
npm run dev
npm run typecheck
npm run build
```
