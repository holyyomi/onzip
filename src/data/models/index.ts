// ═══════════════════════════════════════════════════════════
// 온집 데이터 모델 (PRD 섹션 10 기반)
// Step 1: localStorage 저장 구조와 맞춤
// Step 2 이후 Supabase 테이블 구조와 1:1 대응 예정
// ═══════════════════════════════════════════════════════════

// ─────────────────────────────────
// 공유 기본 타입
// ─────────────────────────────────

export type RepeatRule = 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly'

export type MemberRole = 'me' | 'spouse' | 'child' | 'parent' | 'family' | 'shared'

export type PaymentMethod =
  | 'card'
  | 'auto_transfer'
  | 'bank_transfer'
  | 'manual'
  | 'simple_pay'

// ─────────────────────────────────
// Household (집)
// ─────────────────────────────────

export interface Household {
  id: string
  name: string
  created_at: string
  updated_at: string
}

// ─────────────────────────────────
// Member (가족 구성원)
// ─────────────────────────────────

export interface Member {
  id: string
  household_id: string
  name: string
  role: MemberRole
  color: string       // hex code ex) "#3B82F6"
  is_active: boolean
  created_at: string
  updated_at: string
}

// ─────────────────────────────────
// CalendarEvent (캘린더 이벤트)
// ─────────────────────────────────

export type CalendarEventType =
  | 'schedule'        // 일반 일정
  | 'anniversary'     // 기념일
  | 'fixed_expense'   // 고정지출 → 자동 생성
  | 'subscription'    // 구독 → 자동 생성
  | 'utility'         // 공과금
  | 'checklist'       // 체크리스트 마감 → 자동 생성

export type CalendarEventSourceType =
  | 'fixed_expense'
  | 'subscription'
  | 'checklist'
  | 'chore'

export interface CalendarEvent {
  id: string
  household_id: string
  title: string
  event_type: CalendarEventType
  start_date: string                          // YYYY-MM-DD
  end_date: string | null                     // YYYY-MM-DD
  time: string | null                         // HH:mm
  amount: number | null
  member_id: string | null
  is_done: boolean
  repeat_rule: RepeatRule
  source_type: CalendarEventSourceType | null // null = 직접 추가
  source_id: string | null                    // 원본 데이터 ID
  memo: string
  created_at: string
  updated_at: string
}

// ─────────────────────────────────
// LedgerEntry (가계부)
// ─────────────────────────────────

export type LedgerEntryType = 'income' | 'expense'

export type ExpenseCategory =
  | '식비'
  | '카페/외식'
  | '생활용품'
  | '교통'
  | '병원'
  | '쇼핑'
  | '주거'
  | '공과금'
  | '구독'
  | '기타'

export type IncomeCategory =
  | '월급'
  | '부수입'
  | '보너스'
  | '제휴/광고수익'
  | '기타'

export interface LedgerEntry {
  id: string
  household_id: string
  entry_type: LedgerEntryType
  amount: number
  date: string                        // YYYY-MM-DD
  category: ExpenseCategory | IncomeCategory | string
  payment_method: PaymentMethod | null
  member_id: string | null
  memo: string
  created_at: string
  updated_at: string
}

// ─────────────────────────────────
// FixedExpense (고정지출)
// ─────────────────────────────────

export type FixedExpenseStatus = 'pending' | 'done' | 'overdue'

export type FixedExpenseCategory =
  | '주거'
  | '카드'
  | '보험'
  | '통신'
  | '공과금'
  | '대출/렌탈'
  | '저축/청약'
  | '기타'

export interface FixedExpense {
  id: string
  household_id: string
  title: string
  amount: number
  category: FixedExpenseCategory | string
  payment_day: number                 // 1~31
  payment_method: PaymentMethod
  member_id: string | null
  is_active: boolean
  calendar_visible: boolean
  status: FixedExpenseStatus
  memo: string
  created_at: string
  updated_at: string
}

// ─────────────────────────────────
// Income (수입)
// ─────────────────────────────────

export type IncomeType = 'fixed' | 'side' | 'one_time' | 'other'

export interface Income {
  id: string
  household_id: string
  title: string
  amount: number
  income_day: number                  // 1~31
  income_type: IncomeType
  member_id: string | null
  repeat_rule: RepeatRule
  memo: string
  created_at: string
  updated_at: string
}

// ─────────────────────────────────
// Subscription (구독)
// ─────────────────────────────────

export type SubscriptionStatus = 'active' | 'considering_cancel' | 'cancelled'

export interface Subscription {
  id: string
  household_id: string
  title: string
  amount: number
  payment_day: number                 // 1~31
  payment_method: PaymentMethod
  status: SubscriptionStatus
  member_id: string | null
  calendar_visible: boolean
  memo: string
  created_at: string
  updated_at: string
}

// ─────────────────────────────────
// Checklist (체크리스트)
// ─────────────────────────────────

export interface Checklist {
  id: string
  household_id: string
  title: string
  category: string
  member_id: string | null
  due_date: string | null             // YYYY-MM-DD
  repeat_rule: RepeatRule
  calendar_visible: boolean
  created_at: string
  updated_at: string
}

// ─────────────────────────────────
// ChecklistItem (체크리스트 항목)
// ─────────────────────────────────

export interface ChecklistItem {
  id: string
  checklist_id: string
  content: string
  is_done: boolean
  sort_order: number
  created_at: string
  updated_at: string
}

// ─────────────────────────────────
// ShoppingItem (장보기)
// ─────────────────────────────────

export type ShoppingCategory =
  | '식재료'
  | '냉동식품'
  | '간식'
  | '생활용품'
  | '마트'
  | '쿠팡'
  | '기타'

export interface ShoppingItem {
  id: string
  household_id: string
  name: string
  category: ShoppingCategory | string
  expected_amount: number | null
  actual_amount: number | null
  store: string
  is_done: boolean
  is_favorite: boolean
  memo: string
  created_at: string
  updated_at: string
}

// ─────────────────────────────────
// HouseholdSupply (생활용품)
// ─────────────────────────────────

export type SupplyStatus = 'enough' | 'low' | 'need_buy'

export interface HouseholdSupply {
  id: string
  household_id: string
  name: string
  category: string
  status: SupplyStatus
  repurchase_cycle_days: number | null
  purchase_link_memo: string
  member_id: string | null
  created_at: string
  updated_at: string
}

// ─────────────────────────────────
// Chore (집안일)
// ─────────────────────────────────

export interface Chore {
  id: string
  household_id: string
  title: string
  repeat_rule: RepeatRule
  member_id: string | null
  due_date: string | null             // YYYY-MM-DD
  calendar_visible: boolean
  is_done: boolean
  memo: string
  created_at: string
  updated_at: string
}

// ─────────────────────────────────
// LifeRecord (생활 기록)
// Note: Record라는 이름은 TypeScript 내장 유틸리티 타입과 충돌하므로 LifeRecord 사용
// ─────────────────────────────────

export type RecordType =
  | 'life'            // 생활 기록
  | 'spending_note'   // 소비 메모
  | 'family_meeting'  // 가족 회의록
  | 'anniversary'     // 기념일 기록
  | 'home'            // 집 관련 기록

export interface LifeRecord {
  id: string
  household_id: string
  title: string
  content: string
  record_type: RecordType
  record_date: string                 // YYYY-MM-DD
  member_id: string | null
  tags: string[]
  related_amount: number | null
  related_event_id: string | null
  created_at: string
  updated_at: string
}

// ─────────────────────────────────
// Template (템플릿)
// ─────────────────────────────────

export interface TemplateItem {
  content: string
  sort_order: number
}

export interface Template {
  id: string
  title: string
  category: string
  description: string
  items: TemplateItem[]   // PRD items_json을 TypeScript로 파싱한 구조
  is_default: boolean
  created_at: string
  updated_at: string
}

// ─────────────────────────────────
// AppSettings (앱 설정)
// ─────────────────────────────────

export type ThemeMode = 'light' | 'dark' | 'system'

export interface AppSettings {
  id: string
  household_id: string
  setting_key: string
  setting_value: string
  created_at: string
  updated_at: string
}

// 타입 안전한 설정 키 목록
export interface AppSettingsMap {
  theme: ThemeMode
  default_member_id: string
  currency: string            // 기본값: "KRW"
  household_name: string      // 기본값: "우리집"
}
