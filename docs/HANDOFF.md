# HANDOFF.md — 온집 (onzip)

## 날짜
2026-05-15

## 현재 상태
**Phase 0~6 완료. TASK-001~028 완료.**
5개 탭 모두 기능 구현 완료.
다음: Phase 7 QA — TASK-029 모바일 UX, TASK-030 빈 상태, TASK-031 실사용 테스트, TASK-032 PWA 배포.

## 완료 현황

| Phase | 범위 | 상태 |
|---|---|---|
| 0 | TASK-001~003 | ✅ Vite + React + 레이아웃 |
| 1 | TASK-004~006 | ✅ 데이터 모델 + 저장소 + Seed |
| 2 | TASK-007~010 | ✅ 캘린더 전체 |
| 3 | TASK-011~016 | ✅ 돈관리 전체 |
| 4 | TASK-017~021 | ✅ 생활 탭 전체 |
| 5 | TASK-022~024 | ✅ 기록 탭 |
| 6 | TASK-025~028 | ✅ 설정 탭 |
| 7 | TASK-029~032 | ⏳ QA + PWA 배포 |

## 전체 파일 구조

```
src/
├─ app/App.tsx
├─ components/
│  ├─ common/FormModal.tsx
│  ├─ layout/{AppShell, Header, BottomTabBar}.tsx
│  ├─ pages/{Calendar, Money, Life, Records, Settings}Page.tsx
│  ├─ calendar/  5개 (MonthView, DayCell, TodaySummary, DayEventPanel, EventFormModal)
│  ├─ money/     8개 (Summary, Ledger, FixedExpense, Income, Subscription, Calculator + forms)
│  ├─ life/      7개 (Checklist, Shopping, Supplies, Chore, Template + forms)
│  └─ records/   2개 (RecordsPage, RecordFormModal)
├─ data/
│  ├─ models/index.ts        (15개 타입)
│  ├─ repositories/base.ts, index.ts (15개 repo + exportAllData)
│  └─ seed/index.ts
└─ utils/
   ├─ date.ts
   ├─ calendarAggregator.ts
   └─ constants.ts
```

## Git 커밋 이력

```
c698987 feat: Phase 5-6 Records & Settings (TASK-022~028)
71274f1 feat: Phase 4 Life tab (TASK-017~021)
6be31fe feat: Phase 0-3 initialize project
```

## 검증 결과
- Type check: ✅ 통과 (strict 모드)
- Build: ✅ 통과 (232kB JS gzip 66kB)
- Dev server: `npm run dev` → localhost:3000

## 핵심 패턴 (Codex 인수인계)

1. **FormModal 재사용**: `src/components/common/FormModal.tsx` — Field, inputCls, FormActions
2. **refreshKey 패턴**: 저장 후 `setRefreshKey(k=>k+1)` → useMemo 재계산
3. **calendarAggregator**: 고정지출·구독 → 캘린더 실시간 변환 (저장 안 함)
4. **수정 가능 판단**: `source_type === null` 인 CalendarEvent만 수정 가능
5. **localStorage 키**: `onzip_*` 접두사 (15개)
6. **Seed 방지**: `onzip_seed_done_v1` 키 확인 후 1회만 실행
7. **LifeRecord 이름**: TypeScript 내장 `Record<K,V>` 충돌 방지로 LifeRecord 사용
8. **서브탭 공통**: overflow-x-auto + flex-shrink-0 + border-b-2 패턴

## 다음 작업 — Phase 7 QA (TASK-029~032)

**TASK-029**: 모바일 UX 개선
- 입력 폼 하단 고정 버튼 확인
- 터치 영역 최소 44px
- 긴 목록 스크롤 최적화

**TASK-030**: 빈 상태 화면
- EmptyState 공통 컴포넌트 생성
- 각 탭 빈 상태 문구 + 추가 버튼

**TASK-031**: 7일 실사용 테스트
- 시나리오: 일정 추가 → 지출 입력 → 장보기 → 기록 → 생활용품 확인

**TASK-032**: PWA + Vercel 배포
- vite-plugin-pwa 설치
- manifest.json (앱명, 아이콘)
- Vercel CLI 배포

## 재개 명령어
```bash
cd C:\Users\user\Desktop\자동화\onzip
npm run dev       # localhost:3000 확인
npm run typecheck
npm run build
git log --oneline
```
