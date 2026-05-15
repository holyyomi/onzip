import {
  DAYS_KO,
  formatDate,
  formatMonthLabel,
  getMonthGrid,
  todayYear,
  todayMonth,
} from '../../utils/date'
import type { AggregatedEvent } from '../../utils/calendarAggregator'
import CalendarDayCell from './CalendarDayCell'

interface Props {
  year: number
  month: number
  events: AggregatedEvent[]
  selectedDate: string
  onPrev: () => void
  onNext: () => void
  onToday: () => void
  onSelectDate: (date: string) => void
}

export default function CalendarMonthView({
  year,
  month,
  events,
  selectedDate,
  onPrev,
  onNext,
  onToday,
  onSelectDate,
}: Props) {
  const grid = getMonthGrid(year, month)
  const isThisMonth = year === todayYear() && month === todayMonth()

  // 날짜별 이벤트 맵
  const eventMap = new Map<string, AggregatedEvent[]>()
  events.forEach((e) => {
    const list = eventMap.get(e.date) ?? []
    list.push(e)
    eventMap.set(e.date, list)
  })

  return (
    <div className="bg-white">
      {/* 월 헤더 */}
      <div className="flex items-center justify-between px-4 py-3">
        <button
          onClick={onPrev}
          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-600"
          aria-label="이전 달"
        >
          ‹
        </button>

        <div className="flex items-center gap-2">
          <span className="text-base font-semibold text-gray-900">
            {formatMonthLabel(year, month)}
          </span>
          {!isThisMonth && (
            <button
              onClick={onToday}
              className="text-xs text-blue-500 border border-blue-300 rounded px-2 py-0.5"
            >
              오늘
            </button>
          )}
        </div>

        <button
          onClick={onNext}
          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-600"
          aria-label="다음 달"
        >
          ›
        </button>
      </div>

      {/* 요일 헤더 */}
      <div className="grid grid-cols-7 border-t border-gray-100">
        {DAYS_KO.map((day, i) => (
          <div
            key={day}
            className={`text-center text-xs py-2 font-medium ${
              i === 0 ? 'text-red-400' : i === 6 ? 'text-blue-400' : 'text-gray-400'
            }`}
          >
            {day}
          </div>
        ))}
      </div>

      {/* 날짜 그리드 */}
      <div className="grid grid-cols-7 border-t border-gray-100 px-1 pb-2">
        {grid.map((date) => {
          const dateStr = formatDate(date)
          return (
            <CalendarDayCell
              key={dateStr}
              date={date}
              year={year}
              month={month}
              isSelected={selectedDate === dateStr}
              events={eventMap.get(dateStr) ?? []}
              onSelect={() => onSelectDate(dateStr)}
            />
          )
        })}
      </div>
    </div>
  )
}
