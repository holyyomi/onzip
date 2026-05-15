# HANDOFF.md — 온집 (onzip)

## 날짜
2026-05-15

## 현재 상태
**MVP v1 완성. TASK-001~032 전부 완료.**
7일 실사용 테스트 대기 중.

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
| 7 | TASK-029~032 | ✅ QA + PWA 배포 |

## Git 커밋 이력

```
2ba0bf9 feat: Phase 7 QA + PWA (TASK-029~032)
48a59ba docs: HANDOFF + TASK_LIST update
c698987 feat: Phase 5-6 Records & Settings
71274f1 feat: Phase 4 Life tab
6be31fe feat: Phase 0-3 initialize project
```

## 최종 빌드 결과
- Type check: ✅ 통과 (strict)
- Build: ✅ 통과 (232kB JS, gzip 66kB)
- PWA: ✅ Service Worker 생성 (dist/sw.js), 12개 파일 precache
- Vercel: ✅ vercel.json 설정 완료

## 전체 파일 구조

```
onzip/
├─ AGENTS.md
├─ vercel.json
├─ index.html             (PWA meta tags 포함)
├─ vite.config.ts         (VitePWA 설정)
├─ scripts/
│  └─ generate-icons.mjs
├─ public/
│  └─ icons/              (icon-192.png, icon-512.png, icon-512-maskable.png)
├─ src/
│  ├─ app/App.tsx
│  ├─ components/
│  │  ├─ common/
│  │  │  ├─ FormModal.tsx    ← 재사용 바텀시트
│  │  │  └─ EmptyState.tsx   ← 빈 상태 컴포넌트
│  │  ├─ layout/             ← AppShell(safe-area), Header, BottomTabBar(44px touch)
│  │  ├─ pages/              ← 5개 탭 라우터
│  │  ├─ calendar/           ← 5개 컴포넌트
│  │  ├─ money/              ← 8개 컴포넌트
│  │  ├─ life/               ← 7개 컴포넌트
│  │  ├─ records/            ← 2개 컴포넌트
│  │  └─ (settings in pages/SettingsPage.tsx)
│  ├─ data/
│  │  ├─ models/index.ts     ← 15개 TypeScript 타입
│  │  ├─ repositories/       ← 15개 repo + exportAllData
│  │  └─ seed/               ← 최초 실행 예시 데이터
│  ├─ styles/index.css       ← Tailwind + 모바일 UX 유틸리티
│  └─ utils/
│     ├─ date.ts
│     ├─ calendarAggregator.ts
│     └─ constants.ts
└─ docs/
   ├─ HANDOFF.md
   ├─ TASK_LIST.md
   ├─ DATA_MODEL.md
   ├─ README_WORKFLOW.md
   └─ TEST_CHECKLIST.md      ← 8개 골든패스 시나리오
```

## Vercel 배포 방법

```bash
# 1. Vercel CLI 설치
npm install -g vercel

# 2. 로그인
vercel login

# 3. 배포 (프로젝트 루트에서)
vercel --prod

# 4. 자동 설정: Framework = Vite, Output = dist/
```

또는 GitHub 연결 후 main 브랜치 push 시 자동 배포.

## 로컬 실행

```bash
cd C:\Users\user\Desktop\자동화\onzip
npm run dev        # localhost:3000 (개발)
npm run build      # dist/ 생성 (프로덕션)
npm run preview    # dist/ 로컬 미리보기
npm run typecheck  # 타입 체크
```

## 7일 실사용 테스트 후 다음 단계 (v2 후보)

1. **Supabase 연동** — 멀티 디바이스 공유, 부부 실시간 동기화
2. **다크 모드** — ThemeProvider + Tailwind dark: 클래스
3. **카테고리 커스터마이징** — 설정 탭 확장 (TASK-026 미구현)
4. **PWA 푸시 알림** — 고정지출 납부일 알림
5. **반복 일정 자동 생성** — repeat_rule 기반 자동 event 생성
6. **아이 성장 기록** — 3~4인 가족 확장

## Codex 인수인계 핵심 패턴

1. `FormModal + Field + FormActions` — 모든 form modal 공통 패턴
2. `refreshKey + useMemo` — 저장 후 재계산 트리거
3. `calendarAggregator.getAggregatedEvents()` — 고정지출·구독 실시간 캘린더 변환
4. `source_type === null` — 직접 추가 일정만 수정 가능
5. `onzip_*` localStorage 키 (15개)
6. `LifeRecord` (TypeScript 내장 Record 충돌 방지)
7. `onzip_seed_done_v1` — Seed 중복 방지 플래그
