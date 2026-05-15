// 캘린더 이벤트 집계
// 원본 데이터(고정지출·구독·체크리스트)를 캘린더 표시용으로 변환
// 원본은 각 repository에만 저장 — 여기서는 읽기만 함

import type { CalendarEventType } from '../data/models'
import {
  calendarEventRepo,
  fixedExpenseRepo,
  subscriptionRepo,
  checklistRepo,
} from '../data/repositories'
import { getDaysInMonth, todayStr, todayMonth, todayYear } from './date'

export interface AggregatedEvent {
  id: string
  title: string
  date: string               // YYYY-MM-DD
  type: CalendarEventType
  amount?: number
  is_done: boolean
  member_id?: string | null
  memo?: string
  // source 정보 — null이면 직접 생성한 일정(수정 가능)
  source_type?: string | null
  source_id?: string | null
}

// ─────────────────────────────────
// 월별 이벤트 집계 (TASK-008 핵심)
// ─────────────────────────────────

export function getAggregatedEvents(year: number, month: number): AggregatedEvent[] {
  const prefix = `${year}-${String(month).padStart(2, '0')}`
  const daysInMonth = getDaysInMonth(year, month)
  const events: AggregatedEvent[] = []

  // 1. 직접 생성한 캘린더 이벤트 (일정, 기념일)
  calendarEventRepo
    .getAll()
    .filter((e) => e.start_date.startsWith(prefix))
    .forEach((e) => {
      events.push({
        id: e.id,
        title: e.title,
        date: e.start_date,
        type: e.event_type,
        amount: e.amount ?? undefined,
        is_done: e.is_done,
        member_id: e.member_id,
        memo: e.memo,
        source_type: e.source_type,
        source_id: e.source_id,
      })
    })

  // 2. 고정지출 → 납부일 기준 자동 생성
  fixedExpenseRepo
    .getActive()
    .filter((fe) => fe.calendar_visible && fe.payment_day <= daysInMonth)
    .forEach((fe) => {
      const day = String(fe.payment_day).padStart(2, '0')
      events.push({
        id: `fe_${fe.id}`,
        title: fe.title,
        date: `${prefix}-${day}`,
        type: 'fixed_expense',
        amount: fe.amount,
        is_done: fe.status === 'done',
        member_id: fe.member_id,
        memo: fe.memo,
        source_type: 'fixed_expense',
        source_id: fe.id,
      })
    })

  // 3. 구독 → 결제일 기준 자동 생성
  subscriptionRepo
    .getActive()
    .filter((s) => s.calendar_visible && s.payment_day <= daysInMonth)
    .forEach((s) => {
      const day = String(s.payment_day).padStart(2, '0')
      events.push({
        id: `sub_${s.id}`,
        title: s.title,
        date: `${prefix}-${day}`,
        type: 'subscription',
        amount: s.amount,
        is_done: false,
        member_id: s.member_id,
        memo: s.memo,
        source_type: 'subscription',
        source_id: s.id,
      })
    })

  // 4. 체크리스트 마감일 → 자동 생성
  checklistRepo
    .getAll()
    .filter((cl) => cl.due_date?.startsWith(prefix) && cl.calendar_visible)
    .forEach((cl) => {
      events.push({
        id: `cl_${cl.id}`,
        title: cl.title,
        date: cl.due_date!,
        type: 'checklist',
        is_done: false,
        member_id: cl.member_id,
        source_type: 'checklist',
        source_id: cl.id,
      })
    })

  return events
}

// 오늘 기준 집계 (TodaySummaryCard용)
export function getTodayAggregated(): AggregatedEvent[] {
  return getAggregatedEvents(todayYear(), todayMonth()).filter(
    (e) => e.date === todayStr(),
  )
}

// 이벤트 타입별 Tailwind dot 색상
export const EVENT_TYPE_DOT: Record<CalendarEventType, string> = {
  schedule: 'bg-blue-400',
  anniversary: 'bg-pink-400',
  fixed_expense: 'bg-red-400',
  subscription: 'bg-purple-400',
  utility: 'bg-orange-400',
  checklist: 'bg-green-400',
}

// 이벤트 타입 한글 라벨
export const EVENT_TYPE_LABEL: Record<CalendarEventType, string> = {
  schedule: '일정',
  anniversary: '기념일',
  fixed_expense: '고정지출',
  subscription: '구독',
  utility: '공과금',
  checklist: '체크리스트',
}
