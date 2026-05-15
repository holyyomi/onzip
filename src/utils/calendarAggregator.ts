// 캘린더 이벤트 집계
// 원본 데이터(고정지출·구독·체크리스트·반복 일정)를 캘린더 표시용으로 변환

import type { CalendarEvent, CalendarEventType } from '../data/models'
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
  // null이면 직접 추가 일정 (수정 가능)
  source_type?: string | null
  source_id?: string | null
  // 반복 이벤트의 원본 ID
  original_id?: string
}

// ─────────────────────────────────
// 반복 이벤트 날짜 계산
// ─────────────────────────────────

function getRepeatDates(event: CalendarEvent, year: number, month: number): string[] {
  const [sy, sm, sd] = event.start_date.split('-').map(Number)
  const prefix = `${year}-${String(month).padStart(2, '0')}`
  const daysInMonth = getDaysInMonth(year, month)

  switch (event.repeat_rule) {
    case 'yearly': {
      // 매년 같은 월·일 (기념일)
      if (sm !== month) return []
      const d = String(sd).padStart(2, '0')
      const date = `${year}-${String(month).padStart(2, '0')}-${d}`
      return date >= event.start_date ? [date] : []
    }
    case 'monthly': {
      // 매월 같은 일
      if (sd > daysInMonth) return []
      const date = `${prefix}-${String(sd).padStart(2, '0')}`
      return date >= event.start_date ? [date] : []
    }
    case 'weekly': {
      // 매주 같은 요일
      const startDow = new Date(sy, sm - 1, sd).getDay()
      const dates: string[] = []
      for (let d = 1; d <= daysInMonth; d++) {
        if (new Date(year, month - 1, d).getDay() === startDow) {
          const dateStr = `${prefix}-${String(d).padStart(2, '0')}`
          if (dateStr >= event.start_date) dates.push(dateStr)
        }
      }
      return dates
    }
    case 'daily': {
      const dates: string[] = []
      for (let d = 1; d <= daysInMonth; d++) {
        const dateStr = `${prefix}-${String(d).padStart(2, '0')}`
        if (dateStr >= event.start_date) dates.push(dateStr)
      }
      return dates
    }
    default:
      return []
  }
}

function toAggregated(e: CalendarEvent, date: string, isRepeat = false): AggregatedEvent {
  return {
    id: isRepeat ? `${e.id}_${date}` : e.id,
    title: e.title,
    date,
    type: e.event_type,
    amount: e.amount ?? undefined,
    is_done: e.is_done,
    member_id: e.member_id,
    memo: e.memo,
    source_type: e.source_type,
    source_id: e.source_id,
    original_id: isRepeat ? e.id : undefined,
  }
}

// ─────────────────────────────────
// 월별 이벤트 집계 (TASK-008 핵심)
// ─────────────────────────────────

export function getAggregatedEvents(year: number, month: number): AggregatedEvent[] {
  const prefix = `${year}-${String(month).padStart(2, '0')}`
  const daysInMonth = getDaysInMonth(year, month)
  const events: AggregatedEvent[] = []

  // 1. 직접 생성한 캘린더 이벤트 (일정, 기념일)
  calendarEventRepo.getAll().forEach((e) => {
    if (e.repeat_rule === 'none') {
      // 비반복: 해당 월에만 표시
      if (e.start_date.startsWith(prefix)) {
        events.push(toAggregated(e, e.start_date))
      }
    } else {
      // 반복: 이번 달 해당 날짜 모두 생성
      const dates = getRepeatDates(e, year, month)
      dates.forEach((date) => {
        const isRepeat = date !== e.start_date
        events.push(toAggregated(e, date, isRepeat))
      })
    }
  })

  // 2. 고정지출 → 납부일 자동 생성
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

  // 3. 구독 → 결제일 자동 생성
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
