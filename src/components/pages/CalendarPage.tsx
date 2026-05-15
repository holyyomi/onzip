import { useState, useMemo } from 'react'
import {
  todayStr,
  todayYear,
  todayMonth,
  prevMonth,
  nextMonth,
  formatDate,
} from '../../utils/date'
import { getAggregatedEvents } from '../../utils/calendarAggregator'
import type { QuickAddType } from '../common/QuickAddMenu'
import CalendarMonthView from '../calendar/CalendarMonthView'
import CalendarWeekView from '../calendar/CalendarWeekView'
import TodaySummaryCard from '../calendar/TodaySummaryCard'
import DayEventPanel from '../calendar/DayEventPanel'
import EventFormModal from '../calendar/EventFormModal'
import TabMemoCard from '../common/TabMemoCard'
import { QUICK_ADD_ICON } from '../../utils/featureIcons'

type ViewMode = 'month' | 'week'

interface Props {
  externalRefreshKey: number
  onQuickAdd: (type: QuickAddType) => void
}

function addDays(dateStr: string, days: number): string {
  const [y, m, d] = dateStr.split('-').map(Number)
  const result = new Date(y, m - 1, d + days)
  return formatDate(result)
}

export default function CalendarPage({ externalRefreshKey, onQuickAdd }: Props) {
  const [viewMode, setViewMode] = useState<ViewMode>('month')
  const [year, setYear] = useState(todayYear())
  const [month, setMonth] = useState(todayMonth())
  const [selectedDate, setSelectedDate] = useState(todayStr())
  const [showModal, setShowModal] = useState(false)
  const [editingEventId, setEditingEventId] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  const events = useMemo(
    () => getAggregatedEvents(year, month),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [year, month, refreshKey, externalRefreshKey],
  )

  const selectedDateEvents = events.filter((e) => e.date === selectedDate)

  function handlePrev() {
    if (viewMode === 'month') {
      const p = prevMonth(year, month); setYear(p.year); setMonth(p.month)
    } else {
      // 주간: 7일 이전
      const newDate = addDays(selectedDate, -7)
      setSelectedDate(newDate)
      const [y, m] = newDate.split('-').map(Number)
      setYear(y); setMonth(m)
    }
  }

  function handleNext() {
    if (viewMode === 'month') {
      const n = nextMonth(year, month); setYear(n.year); setMonth(n.month)
    } else {
      const newDate = addDays(selectedDate, 7)
      setSelectedDate(newDate)
      const [y, m] = newDate.split('-').map(Number)
      setYear(y); setMonth(m)
    }
  }

  function handleToday() {
    setYear(todayYear()); setMonth(todayMonth()); setSelectedDate(todayStr())
  }

  function handleSelectDate(date: string) {
    setSelectedDate(date)
    const [y, m] = date.split('-').map(Number)
    if (y !== year || m !== month) { setYear(y); setMonth(m) }
  }

  function handleAddEvent() { setEditingEventId(null); setShowModal(true) }

  function handleEditEvent(eventId: string) {
    const event = events.find((e) => e.id === eventId)
    if (event?.source_type) return
    // 반복 이벤트는 original_id로 원본 편집
    const targetId = event?.original_id ?? eventId
    setEditingEventId(targetId)
    setShowModal(true)
  }

  function handleSaved() { setShowModal(false); setRefreshKey((k) => k + 1) }

  return (
    <div>
      <TodaySummaryCard key={`${refreshKey}-${externalRefreshKey}`} />

      <div className="px-4 grid grid-cols-2 gap-3">
        <CalendarQuickButton
          iconSrc={QUICK_ADD_ICON.schedule}
          label="일정 추가"
          sub="약속, 병원, 학교"
          onClick={() => onQuickAdd('schedule')}
        />
        <CalendarQuickButton
          iconSrc={QUICK_ADD_ICON.checklist}
          label="할 일 추가"
          sub="오늘 챙길 것"
          onClick={() => onQuickAdd('checklist')}
        />
      </div>

      <div className="flex px-4 py-3 gap-2 bg-[#f7f7f7]">
        {(['month', 'week'] as const).map((mode) => (
          <button key={mode} onClick={() => setViewMode(mode)}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
              viewMode === mode ? 'bg-[#222222] text-white' : 'text-[#6a6a6a] border border-[#dddddd] bg-white'
            }`}>
            {mode === 'month' ? '한 달' : '한 주'}
          </button>
        ))}
        <button onClick={handleToday}
          className="ml-auto px-4 py-2 text-sm font-semibold text-[#ff385c] border border-[#ffd1da] bg-white rounded-full">
          오늘
        </button>
      </div>

      {viewMode === 'month' ? (
        <CalendarMonthView
          year={year} month={month} events={events}
          selectedDate={selectedDate}
          onPrev={handlePrev} onNext={handleNext} onToday={handleToday}
          onSelectDate={handleSelectDate}
        />
      ) : (
        <CalendarWeekView
          baseDate={selectedDate} events={events}
          selectedDate={selectedDate}
          onPrevWeek={handlePrev} onNextWeek={handleNext}
          onSelectDate={handleSelectDate}
        />
      )}

      <div className="h-2 bg-[#f7f7f7]" />

      <DayEventPanel
        date={selectedDate} events={selectedDateEvents}
        onAddEvent={handleAddEvent} onEditEvent={handleEditEvent}
      />

      <div className="px-5 py-5">
        <TabMemoCard tab="calendar" title="일정 메모" placeholder="가족 약속, 병원 예약, 준비물을 간단히 적어두세요." />
      </div>

      {showModal && (
        <EventFormModal
          eventId={editingEventId} defaultDate={selectedDate}
          onSaved={handleSaved} onClose={() => setShowModal(false)}
        />
      )}
    </div>
  )
}

function CalendarQuickButton({
  iconSrc,
  label,
  sub,
  onClick,
}: {
  iconSrc: string
  label: string
  sub: string
  onClick: () => void
}) {
  return (
    <button onClick={onClick} className="oz-card min-h-[82px] p-3 text-left active:scale-[0.98] transition flex items-center gap-3">
      <img src={iconSrc} alt="" className="h-10 w-10 rounded-[15px] object-contain flex-shrink-0" />
      <span className="min-w-0">
        <span className="block text-base font-semibold text-[#222222]">{label}</span>
        <span className="block text-xs text-[#6a6a6a] mt-1 leading-snug">{sub}</span>
      </span>
    </button>
  )
}
