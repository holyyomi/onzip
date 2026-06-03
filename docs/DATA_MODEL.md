# 온집 데이터 모델

localStorage 기반 로컬 전용 데이터 구조.
`npm run backup:check`는 백업 data 키가 아래 테이블 목록과 불러오기 로직에 맞는지 확인한다.

## 테이블 목록

| 테이블 | localStorage 키 | 설명 |
|---|---|---|
| households | `onzip_households` | 집 정보 |
| members | `onzip_members` | 가족 구성원 |
| calendar_events | `onzip_calendar_events` | 일정/기념일 |
| ledger_entries | `onzip_ledger_entries` | 가계부 (수입/지출) |
| fixed_expenses | `onzip_fixed_expenses` | 정기 지출 |
| incomes | `onzip_incomes` | 수입 |
| subscriptions | `onzip_subscriptions` | 구독 서비스 |
| checklists | `onzip_checklists` | 체크리스트 |
| checklist_items | `onzip_checklist_items` | 체크리스트 항목 |
| shopping_items | `onzip_shopping_items` | 장보기 항목 |
| household_supplies | `onzip_household_supplies` | 생활용품 |
| chores | `onzip_chores` | 집안일 |
| records | `onzip_records` | 생활 기록 |
| templates | `onzip_templates` | 템플릿 |
| app_settings | `onzip_app_settings` | 앱 설정 |
| custom_categories | `onzip_custom_categories` | 사용자 추가 카테고리 |
| tab_memos | `onzip_tab_memos` | 홈/일정/돈/생활/설정 탭별 메모 |
| tab_memo_secrets | `onzip_tab_memo_secrets` | 탭별 빠른 메모 비밀 여부 |
| fixed_expense_month_status | `onzip_fixed_expense_month_status` | 정기 지출 월별 완료 상태 |
| income_month_status | `onzip_income_month_status` | 정기 수입 월별 입금 상태 |
| subscription_month_status | `onzip_subscription_month_status` | 구독/자동결제 월별 결제 상태 |

## 보조 localStorage 키

| 키 | 설명 |
|---|---|
| `onzip_seed_done_v1` | 최초 기본 구조 준비 완료 여부 |
| `onzip_full_reset_done_20260516_v1` | 과거 초기화 마이그레이션 재실행 방지 |
| `onzip_install_card_hidden_v1` | 설치 안내 7일 숨김 또는 설치 완료 상태 |
| `onzip_onboarding_seen_v1` | 첫 실행 안내 완료 여부 |
| `onzip_storage_notice_seen_v1` | 로컬 저장 안내 닫기 여부 |
| `onzip_update_notice_20260519_flow_vault` | 최근 업데이트 안내 닫기 여부 |

## 주요 필드 규칙

- `id`: UUID (crypto.randomUUID())
- `household_id`: 기본값 `"default"` (Step 1 로컬)
- `created_at`, `updated_at`: ISO 8601 문자열
- `member_id`: `"me"` / `"spouse"` / `"shared"` / 커스텀 UUID
- `repeat_rule`: `"none"` / `"daily"` / `"weekly"` / `"monthly"` / `"yearly"`

## 상태값 정의

### fixed_expenses 납부 상태
- `pending` — 예정
- `done` — 완료
- `overdue` — 미납

### subscriptions 상태
- `active` — 사용중
- `considering_cancel` — 해지 고민
- `cancelled` — 해지 완료

### household_supplies 상태
- `enough` — 충분함
- `low` — 부족함
- `need_buy` — 구매필요

## 캘린더 이벤트 source 규칙

calendar_events는 두 종류:
1. 직접 추가 (일정, 기념일): source_type = null
2. 자동 생성 (정기 지출, 구독, 체크리스트): source_type = "fixed_expense" | "subscription" | "checklist", source_id = 원본 ID

자동 생성 이벤트는 원본 데이터에서 실시간 계산 (저장하지 않음).
