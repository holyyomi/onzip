# 온집 데이터 모델

localStorage 기반 (Step 1 MVP). 키 구조는 Supabase 테이블 구조와 맞춤.

## 테이블 목록

| 테이블 | localStorage 키 | 설명 |
|---|---|---|
| households | `onzip_households` | 집 정보 |
| members | `onzip_members` | 가족 구성원 |
| calendar_events | `onzip_calendar_events` | 일정/기념일 |
| ledger_entries | `onzip_ledger_entries` | 가계부 (수입/지출) |
| fixed_expenses | `onzip_fixed_expenses` | 고정지출 |
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
2. 자동 생성 (고정지출, 구독, 체크리스트): source_type = "fixed_expense" | "subscription" | "checklist", source_id = 원본 ID

자동 생성 이벤트는 원본 데이터에서 실시간 계산 (저장하지 않음).
