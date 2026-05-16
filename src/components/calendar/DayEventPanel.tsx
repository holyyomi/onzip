import type { AggregatedEvent } from '../../utils/calendarAggregator'
import { EVENT_TYPE_DOT, EVENT_TYPE_LABEL } from '../../utils/calendarAggregator'
import { formatAmount, formatDateLabel } from '../../utils/date'
import EmptyState from '../common/EmptyState'

interface Props {
  date: string
  events: AggregatedEvent[]
  onAddEvent: () => void
  onEditEvent: (eventId: string) => void
}

export default function DayEventPanel({
  date,
  events,
  onAddEvent,
  onEditEvent,
}: Props) {
  return (
    <div className="mx-4 mb-4">
      {/* 날짜 헤더 */}
      <div className="flex items-center justify-between py-3">
        <span className="text-sm font-semibold text-gray-700">
          {formatDateLabel(date)}
        </span>
        <button
          onClick={onAddEvent}
          className="text-sm font-semibold text-[#ff385c]"
        >
          + 일정 추가
        </button>
      </div>

      {/* 이벤트 목록 */}
      {events.length === 0 ? (
        <EmptyState
          message="이 날 예정된 항목이 없습니다"
          sub="일정, 기념일, 납부일을 등록하면 캘린더에서 함께 볼 수 있습니다."
          actionLabel="일정 등록"
          onAction={onAddEvent}
        />
      ) : (
        <div className="flex flex-col gap-2">
          {events.map((e) => (
            <EventCard
              key={e.id}
              event={e}
              onEdit={() => onEditEvent(e.id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function EventCard({
  event,
  onEdit,
}: {
  event: AggregatedEvent
  onEdit: () => void
}) {
  const isEditable = !event.source_type // 직접 생성한 일정만 수정 가능

  return (
    <div className="oz-card px-4 py-3 flex items-center gap-3">
      {/* type dot */}
      <span
        className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${EVENT_TYPE_DOT[event.type]}`}
      />

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400">
            {EVENT_TYPE_LABEL[event.type]}
          </span>
          {event.is_done && (
            <span className="text-xs text-green-500">완료</span>
          )}
        </div>
        <p className="text-sm font-medium text-gray-800 truncate">{event.title}</p>
        {event.amount !== undefined && (
          <p className="text-xs text-gray-500 mt-0.5">
            {formatAmount(event.amount)}
          </p>
        )}
      </div>

      {isEditable && (
        <button
          onClick={onEdit}
          className="text-xs text-gray-400 border border-gray-200 rounded px-2 py-1 flex-shrink-0"
        >
          수정
        </button>
      )}
    </div>
  )
}
