# AGENTS.md — 온집 (onzip)

## Project Goal
온집 — 우리 집 생활을 한곳에.
캘린더 중심으로 가족의 일정, 돈관리, 장보기, 체크리스트, 생활기록을 함께 관리하는 생활 OS.
신혼부부 → 3~4인 가족까지 확장 가능한 PWA 웹앱.

## Tech Stack
- Frontend: React + TypeScript + Vite
- Styling: Tailwind CSS v3
- State: React useState/Context (Zustand는 필요 시 추가)
- Storage: localStorage (Step 1 MVP) → Supabase (Step 2)
- Package Manager: npm
- Calendar: 직접 구현 (외부 라이브러리 없음)

## Repository Structure
```
src/
  app/          — App.tsx, routes, providers
  components/
    layout/     — AppShell, Header, BottomTabBar
    common/     — 공통 UI 컴포넌트
    pages/      — 5개 탭 페이지
    calendar/   — 캘린더 관련 컴포넌트
    money/      — 돈관리 관련 컴포넌트
    life/       — 생활 관련 컴포넌트
    records/    — 기록 관련 컴포넌트
    settings/   — 설정 관련 컴포넌트
  features/     — 도메인별 기능 로직
  data/
    models/     — TypeScript 타입 정의
    repositories/ — localStorage CRUD
    seed/       — 초기 데이터
  hooks/        — 커스텀 훅
  utils/        — 유틸 함수
  styles/       — CSS
docs/           — 문서
dist/           — 빌드 출력 (Git 제외)
```

## Run Commands
- `npm run dev` — 개발 서버 (localhost:3000)
- `npm run build` — 프로덕션 빌드
- `npm run preview` — 빌드 결과 미리보기
- `npm run typecheck` — 타입 체크

## Test / Lint / Build Commands
- Type check: `npm run typecheck` (npx tsc --noEmit)
- Build: `npm run build`
- (Lint: 아직 미설정 — ESLint 추가 시 갱신)
- (Test: 아직 미설정)

## Coding Rules
- 기존 파일 먼저 읽고 수정
- 새 파일 최소화
- 가장 작은 변경으로 문제 해결
- TypeScript strict 모드 사용
- Tailwind 클래스로 스타일 처리 (인라인 style 지양)
- 컴포넌트는 단일 책임 원칙

## Safety Rules
- `.env`, 비밀키, Supabase API Key는 절대 코드에 직접 작성 금지
- 파일 삭제는 승인 후
- localStorage 데이터 구조 변경 시 마이그레이션 고려
- dist/ 폴더는 Git에 포함하지 않음

## MVP 저장 방식 원칙
- Step 1 (현재): localStorage만 사용
- Supabase 연결은 7일 실사용 테스트 이후 결정
- 데이터 모델은 DB 테이블 구조와 미리 맞춰둠 (나중에 이전 쉽게)

## Plan-First Rule
- 모든 구현 전 Implementation Plan 제안
- 사용자 승인 후 코드 수정

## Verification Rule
- Type check: `npm run typecheck`
- Build: `npm run build`
- Local run: `npm run dev` → 브라우저 직접 확인
- 미검증 항목은 반드시 표시

## Compact Engineer Mode
- 짧고 명확하게
- 결정, 위험, 파일, 명령어, 검증 결과 위주

## Context Management Rule
- 작업 주제 변경 시 Context Check 보고
- 대화가 길어지면 /compact 제안

## Handoff Rule
- 큰 작업 완료 후 `docs/HANDOFF.md` 업데이트 제안

## Definition of Done (Phase 0 기준)
- `npm run dev` 정상 실행
- `npm run build` 통과
- 5개 탭 전환 가능
- 타입 오류 없음
