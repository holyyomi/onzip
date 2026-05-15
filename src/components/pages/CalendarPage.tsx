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
import CalendarMonthView from '../calendar/CalendarMonthView'
import CalendarWeekView from '../calendar/CalendarWeekView'
import TodaySummaryCard from '../calendar/TodaySummaryCard'
import DayEventPanel from '../calendar/DayEventPanel'
import EventFormModal from '../calendar/EventFormModal'

type ViewMode = 'month' | 'week'

function addDays(dateStr: string, days: number): string {
  const [y, m, d] = dateStr.split('-').map(Number)
  const result = new Date(y, m - 1, d + days)
  return formatDate(result)
}

export default function CalendarPage() {
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
    [year, month, refreshKey],
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
      {/* 오늘 요약 카드 */}
      <TodaySummaryCard key={refreshKey} />

      {/* 보기 전환 탭 */}
      <div className="flex px-4 py-2 gap-2 bg-white border-b border-gray-100">
        {(['month', 'week'] as const).map((mode) => (
          <button key={mode} onClick={() => setViewMode(mode)}
            className={`px-4 py-1.5 rounded-full text-xs font-medium transition-colors ${
              viewMode === mode ? 'bg-blue-500 text-white' : 'text-gray-400 border border-gray-200'
            }`}>
            {mode === 'month' ? '월간' : '주간'}
          </button>
        ))}
        <button onClick={handleToday}
          className="ml-auto px-3 py-1.5 text-xs text-blue-500 border border-blue-200 rounded-full">
          오늘
        </button>
      </div>

      {/* 캘린더 뷰 */}
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

      <div className="h-2 bg-gray-100" />

      {/* 선택 날짜 이벤트 패널 */}
      <DayEventPanel
        date={selectedDate} events={selectedDateEvents}
        onAddEvent={handleAddEvent} onEditEvent={handleEditEvent}
      />

      {showModal && (
        <EventFormModal
          eventId={editingEventId} defaultDate={selectedDate}
          onSaved={handleSaved} onClose={() => setShowModal(false)}
        />
      )}
    </div>
  )
}
