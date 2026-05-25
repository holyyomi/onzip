// 주간 보기 — 현재 주 7일의 이벤트를 날짜 컬럼으로 표시

import { DAYS_KO, formatDate, formatDateLabel, todayStr } from '../../utils/date'
import type { AggregatedEvent } from '../../utils/calendarAggregator'
import { EVENT_TYPE_DOT, EVENT_TYPE_LABEL } from '../../utils/calendarAggregator'

interface Props {
  baseDate: string                    // YYYY-MM-DD (현재 선택 날짜 기준)
  events: AggregatedEvent[]
  selectedDate: string
  onSelectDate: (date: string) => void
  onPrevWeek: () => void
  onNextWeek: () => void
}

function getWeekDays(base: string): Date[] {
  const [y, m, d] = base.split('-').map(Number)
  const anchor = new Date(y, m - 1, d)
  const dow = anchor.getDay() // 0=Sun
  const sunday = new Date(y, m - 1, d - dow)
  return Array.from({ length: 7 }, (_, i) => new Date(sunday.getFullYear(), sunday.getMonth(), sunday.getDate() + i))
}

function weekLabel(days: Date[]): string {
  const first = days[0]
  const last = days[6]
  if (first.getMonth() === last.getMonth()) {
    return `${first.getFullYear()}년 ${first.getMonth() + 1}월 ${first.getDate()}일 — ${last.getDate()}일`
  }
  return `${first.getMonth() + 1}월 ${first.getDate()}일 — ${last.getMonth() + 1}월 ${last.getDate()}일`
}

export default function CalendarWeekView({
  baseDate, events, selectedDate, onSelectDate, onPrevWeek, onNextWeek,
}: Props) {
  const days = getWeekDays(baseDate)
  const today = todayStr()

  const eventMap = new Map<string, AggregatedEvent[]>()
  events.forEach((e) => {
    const list = eventMap.get(e.date) ?? []
    list.push(e)
    eventMap.set(e.date, list)
  })

  return (
    <div className="bg-white">
      {/* 주 헤더 */}
      <div className="flex items-center justify-between px-4 py-3">
        <button onClick={onPrevWeek}
          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-600">
          ‹
        </button>
        <span className="text-sm font-semibold text-gray-700">{weekLabel(days)}</span>
        <button onClick={onNextWeek}
          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-600">
          ›
        </button>
      </div>

      {/* 요일 + 날짜 헤더 */}
      <div className="grid grid-cols-7 border-t border-gray-100 px-1">
        {days.map((day, i) => {
          const dateStr = formatDate(day)
          const isToday = dateStr === today
          const isSelected = dateStr === selectedDate
          const dayEvents = eventMap.get(dateStr) ?? []

          return (
            <button key={dateStr} onClick={() => onSelectDate(dateStr)}
              className={`flex min-h-[104px] flex-col items-center rounded-lg px-1.5 py-2 transition-colors ${isSelected ? 'bg-[#fff7f9]' : 'hover:bg-gray-50'}`}>
              <span className={`text-xs mb-1 font-medium ${
                i === 0 ? 'text-red-400' : i === 6 ? 'text-blue-400' : 'text-gray-400'
              }`}>
                {DAYS_KO[i]}
              </span>
              <span className={`w-7 h-7 flex items-center justify-center text-sm rounded-full font-medium ${
                isToday ? 'bg-blue-500 text-white' :
                isSelected ? 'text-blue-600' :
                i === 0 ? 'text-red-500' : i === 6 ? 'text-blue-500' : 'text-gray-800'
              }`}>
                {day.getDate()}
              </span>
              <div className="mt-2 flex w-full min-w-0 flex-col gap-0.5">
                {dayEvents.slice(0, 2).map((e) => (
                  <span key={e.id} className="truncate rounded-[6px] bg-blue-50 px-1.5 py-0.5 text-left text-[10px] font-semibold leading-tight text-blue-600">
                    {e.title}
                  </span>
                ))}
                {dayEvents.length > 2 && (
                  <span className="truncate px-1.5 text-left text-[10px] font-semibold leading-tight text-[#8a8a8a]">
                    +{dayEvents.length - 2}개
                  </span>
                )}
              </div>
            </button>
          )
        })}
      </div>

      {/* 선택 날짜 이벤트 요약 */}
      {(() => {
        const selectedEvents = eventMap.get(selectedDate) ?? []
        if (selectedEvents.length === 0) return null
        return (
          <div className="border-t border-gray-100 px-4 py-2 space-y-1.5 bg-gray-50">
            <p className="text-xs text-gray-400">{formatDateLabel(selectedDate)}</p>
            {selectedEvents.slice(0, 4).map((e) => (
              <div key={e.id} className="flex items-center gap-2 text-sm">
                <span className={`w-2 h-2 rounded-full flex-shrink-0 ${EVENT_TYPE_DOT[e.type]}`} />
                <span className="text-gray-700 truncate">{e.title}</span>
                <span className="text-xs text-gray-400 flex-shrink-0">{EVENT_TYPE_LABEL[e.type]}</span>
              </div>
            ))}
            {selectedEvents.length > 4 && (
              <p className="text-xs text-gray-400">외 {selectedEvents.length - 4}개</p>
            )}
          </div>
        )
      })()}
    </div>
  )
}
