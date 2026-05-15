import type { AggregatedEvent } from '../../utils/calendarAggregator'
import { EVENT_TYPE_DOT } from '../../utils/calendarAggregator'
import { isCurrentMonth, isTodayDate } from '../../utils/date'

interface Props {
  date: Date
  year: number
  month: number
  isSelected: boolean
  events: AggregatedEvent[]
  onSelect: () => void
}

export default function CalendarDayCell({
  date,
  year,
  month,
  isSelected,
  events,
  onSelect,
}: Props) {
  const inMonth = isCurrentMonth(date, year, month)
  const isToday = isTodayDate(date)
  const dots = events.slice(0, 3)

  return (
    <button
      onClick={onSelect}
      className={`flex flex-col items-center py-1 rounded-lg transition-colors w-full ${
        isSelected ? 'bg-blue-50' : 'hover:bg-gray-50'
      }`}
    >
      {/* 날짜 숫자 */}
      <span
        className={`w-7 h-7 flex items-center justify-center text-sm rounded-full font-medium ${
          isToday
            ? 'bg-blue-500 text-white'
            : isSelected
              ? 'text-blue-600'
              : inMonth
                ? date.getDay() === 0
                  ? 'text-red-500'
                  : date.getDay() === 6
                    ? 'text-blue-500'
                    : 'text-gray-800'
                : 'text-gray-300'
        }`}
      >
        {date.getDate()}
      </span>

      {/* 이벤트 dot */}
      <div className="flex gap-0.5 mt-0.5 h-2 items-center">
        {dots.map((e) => (
          <span
            key={e.id}
            className={`w-1.5 h-1.5 rounded-full ${EVENT_TYPE_DOT[e.type]}`}
          />
        ))}
      </div>
    </button>
  )
}
