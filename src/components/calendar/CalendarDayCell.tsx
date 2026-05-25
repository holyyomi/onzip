import type { AggregatedEvent } from '../../utils/calendarAggregator'
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
  const visibleEvents = events.slice(0, 2)
  const hiddenCount = Math.max(0, events.length - visibleEvents.length)

  return (
    <button
      onClick={onSelect}
      className={`flex min-h-[82px] w-full flex-col items-stretch bg-white p-1.5 text-left transition-colors lg:min-h-[112px] ${
        isSelected ? 'bg-[#fff7f9]' : 'hover:bg-gray-50'
      }`}
      aria-label={`${date.getDate()}일${events.length ? `, 일정 ${events.length}개` : ''}`}
    >
      {/* 날짜 숫자 */}
      <span
        className={`flex h-7 w-7 items-center justify-center rounded-full text-sm font-semibold ${
          isToday
            ? 'bg-[#ff385c] text-white'
            : isSelected
              ? 'text-[#ff385c]'
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

      <span className="mt-1 flex min-h-[38px] flex-col gap-0.5">
        {visibleEvents.map((event) => (
          <span
            key={event.id}
            className={`truncate rounded-[6px] px-1.5 py-0.5 text-[10px] font-semibold leading-tight ${
              inMonth ? getPreviewClass(event.type) : 'bg-gray-50 text-gray-300'
            }`}
          >
            {event.title}
          </span>
        ))}
        {hiddenCount > 0 && (
          <span className="truncate px-1.5 text-[10px] font-semibold leading-tight text-[#8a8a8a]">
            +{hiddenCount}개
          </span>
        )}
      </span>
    </button>
  )
}

function getPreviewClass(type: AggregatedEvent['type']): string {
  switch (type) {
    case 'anniversary':
      return 'bg-pink-50 text-pink-600'
    case 'fixed_expense':
      return 'bg-red-50 text-red-500'
    case 'subscription':
      return 'bg-purple-50 text-purple-600'
    case 'utility':
      return 'bg-orange-50 text-orange-600'
    case 'checklist':
      return 'bg-green-50 text-green-600'
    default:
      return 'bg-blue-50 text-blue-600'
  }
}
