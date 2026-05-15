# Supabase Integration Plan

> 작성일: 2026-05-15  
> 목적: localStorage 기반 온집 MVP를 멀티 디바이스 공유 가능한 Supabase 저장소로 전환하기 전 설계 기준 정리

## 현재 상태

- 앱 UI와 도메인 로직은 `src/data/repositories/*`의 동기식 localStorage API에 의존한다.
- 모든 화면은 `repo.getAll()`, `repo.create()`, `repo.update()`, `repo.delete()`를 직접 호출한다.
- `docs/SUPABASE_SCHEMA.sql`은 준비되어 있지만, 앱 모델과 완전히 1:1로 바로 붙이기 전 확인할 차이가 있다.
- `.env`는 `.gitignore`에 포함되어 있어 Supabase URL/anon key를 저장할 준비가 되어 있다.
- `SUPABASE_SCHEMA.sql`은 uuid 기본키를 유지하되 로컬 `"default"`, `"me"`, `"spouse"`, `"shared"` 값을 매핑할 수 있도록 `local_alias` 필드를 포함한다.
- 로컬→Supabase ID 매핑은 `onzip_supabase_id_map`에 저장해 같은 마이그레이션을 재실행해도 동일한 원격 uuid를 사용한다.

## 먼저 결정해야 할 설계 이슈

### 1. 기본 멤버 ID

현재 로컬 앱은 기본 구성원을 문자열 ID로 고정한다.

```text
me
spouse
shared
```

하지만 `SUPABASE_SCHEMA.sql`의 `members.id`는 `uuid` 타입이다. 이 상태로는 seed 데이터와 외래키가 바로 맞지 않는다.

권장안:
- Supabase에서는 `members.id`를 uuid로 유지한다.
- 앱에서 쓰는 `me`, `spouse`, `shared`는 `members.local_alias`로 매핑한다.
- 마이그레이션 시 로컬 `member_id` 값을 Supabase에 생성된 실제 uuid로 치환한다.

대안:
- `members.id`를 text로 바꿔 로컬 ID를 그대로 쓴다.
- 구현은 단순하지만 Supabase Auth/RLS와 장기 확장성에서 불리하다.

결론: uuid 유지 + 마이그레이션 매핑을 기본 전략으로 한다.

### 2. Repository 동기/비동기 전환

현재 repository는 모두 동기식이다. Supabase CRUD는 비동기이므로 `BaseRepository`를 단순 교체하면 대부분의 화면이 동시에 깨진다.

권장안:
- 1단계: localStorage를 계속 주 저장소로 두고 Supabase 동기화 계층을 추가한다.
- 2단계: 앱 시작 시 Supabase 데이터를 localStorage로 hydrate한다.
- 3단계: 저장/수정/삭제 시 localStorage 업데이트 후 Supabase에 push한다.
- 4단계: 안정화 후 필요한 화면부터 async repository로 점진 전환한다.

이 방식은 기존 화면 코드를 크게 흔들지 않으면서 멀티 디바이스 공유를 단계적으로 붙일 수 있다.

### 3. household_id 전환

현재 로컬 기본 household는 문자열 `"default"`를 사용한다. Supabase `households.id`는 uuid다.

권장안:
- 최초 연결 시 Supabase household를 생성하거나 선택한다.
- 로컬 `"default"`는 `households.local_alias = 'default'` 힌트를 남기고, 실제 Supabase household uuid로 마이그레이션한다.
- 마이그레이션 후 localStorage에도 uuid 기반 `household_id`를 저장해 다음 동기화부터 같은 기준을 쓴다.

### 4. 인증과 RLS 순서

처음부터 Auth/RLS까지 모두 붙이면 변경 범위가 커진다.

권장 순서:
1. 개발용 Supabase 프로젝트에 SQL 적용
2. env/client 연결
3. 인증 없이 단일 household 동기화 검증
4. 마이그레이션 도구 구현
5. Supabase Auth 추가
6. `household_users` 기반 사용자 연결/초대 정책 확정
7. RLS 활성화

## 구현 단계

### TASK-034: Supabase SQL 스키마 최종 보강

완료 기준:
- `households.local_alias` 추가
- `members.local_alias` 추가
- `household_users` 추가
- RLS 정책 초안이 `household_users` 기준으로 정리됨

### TASK-035: Supabase 프로젝트 생성 및 SQL 적용

사용자가 Supabase 프로젝트를 만들고 `docs/SUPABASE_SCHEMA.sql`을 SQL Editor에서 실행한다.

필요 값:

```text
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
```

주의:
- anon key는 코드에 직접 넣지 않는다.
- `.env` 파일은 커밋하지 않는다.

### TASK-036: Supabase 클라이언트/env 설정

완료 기준:
- `@supabase/supabase-js` 설치
- `.env.example` 추가
- `src/data/supabase/client.ts` 추가
- Supabase env가 없을 때 앱 시작이 깨지지 않는 lazy client 패턴 적용

예상 변경:

```text
package.json
package-lock.json
.env.example
src/data/supabase/client.ts
```

작업:
- `@supabase/supabase-js` 설치
- `client.ts`에서 env 누락 시 명확한 에러 처리
- 연결 확인용 헬퍼 추가

### TASK-037: 로컬 데이터 마이그레이션 전략 구현

완료 기준:
- `src/data/supabase/idMapping.ts` 추가
- `src/data/supabase/migration.ts` 추가
- localStorage 데이터를 Supabase row payload로 변환
- `default`, `me`, `spouse`, `shared`를 uuid로 매핑
- `templates.items`를 Supabase `items_json`으로 변환
- 실제 실행은 `.env`와 Supabase SQL 적용 후 수동 호출로 제한

예상 변경:

```text
src/data/supabase/migration.ts
src/data/supabase/idMapping.ts
```

작업:
- `default` household를 Supabase uuid로 매핑
- `me`, `spouse`, `shared`를 Supabase member uuid로 매핑
- 각 테이블의 `household_id`, `member_id`, 관련 외래키 변환
- 마이그레이션 전 JSON 백업 안내

### TASK-038: 원격 동기화 저장소 계층 구현

완료 기준:
- `src/data/supabase/sync.ts` 추가
- localStorage → Supabase push 함수 제공
- Supabase → localStorage pull 함수 제공
- 기존 앱 실행 흐름에는 자동 연결하지 않음
- 실제 검증은 Supabase SQL 적용과 `.env` 설정 후 진행

예상 변경:

```text
src/data/supabase/sync.ts
src/data/repositories/base.ts
```

작업:
- 기존 localStorage CRUD 유지
- create/update/delete 이후 Supabase push
- 앱 시작 시 Supabase pull 후 localStorage hydrate
- 충돌 정책은 일단 `updated_at` 최신값 우선

현재 구현:
- `pushLocalDataToSupabase()`는 마이그레이션 payload를 Supabase에 upsert한다.
- `pullSupabaseDataToLocalStorage()`는 원격 데이터를 localStorage 키에 hydrate한다.
- 아직 BaseRepository 자동 push나 앱 시작 자동 pull은 연결하지 않았다. Supabase 연결 검증 후 설정 화면에서 수동 동기화 버튼으로 붙이는 것이 다음 안전한 단계다.

### TASK-039: 인증/Auth 및 RLS 정책 적용

예상 변경:

```text
src/components/pages/SettingsPage.tsx
src/data/supabase/auth.ts
docs/SUPABASE_SCHEMA.sql
```

작업:
- 이메일 로그인 또는 매직링크 선택
- household 초대/참여 방식 결정
- RLS 정책 실제 적용

## 우선 구현하지 않을 것

- 은행/카드 자동 연동
- 실시간 presence/chat
- 복잡한 충돌 해결 UI
- 전체 화면을 한 번에 async repository로 변경
- API key 하드코딩

## 다음 액션

1. 사용자가 Supabase 프로젝트를 생성한다.
2. `docs/SUPABASE_SCHEMA.sql`을 SQL Editor에서 실행한다.
3. Supabase 값이 준비되면 `.env.example`을 기준으로 로컬 `.env`를 만든다.
4. `migrateLocalDataToSupabase()`는 Supabase SQL 적용과 `.env` 설정 후 수동 실행한다.
5. 다음 구현은 Supabase 프로젝트/env 준비 후 설정 화면에 수동 연결 확인/동기화 UI를 붙이는 작업이다.
