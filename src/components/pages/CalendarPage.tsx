import { useState, useMemo } from 'react'
import {
  todayStr,
  todayYear,
  todayMonth,
  prevMonth,
  nextMonth,
} from '../../utils/date'
import { getAggregatedEvents } from '../../utils/calendarAggregator'
import CalendarMonthView from '../calendar/CalendarMonthView'
import TodaySummaryCard from '../calendar/TodaySummaryCard'
import DayEventPanel from '../calendar/DayEventPanel'
import EventFormModal from '../calendar/EventFormModal'

export default function CalendarPage() {
  const [year, setYear] = useState(todayYear())
  const [month, setMonth] = useState(todayMonth())
  const [selectedDate, setSelectedDate] = useState(todayStr())
  const [showModal, setShowModal] = useState(false)
  const [editingEventId, setEditingEventId] = useState<string | null>(null)
  // refreshKey: 저장/삭제 후 캘린더 재계산 트리거
  const [refreshKey, setRefreshKey] = useState(0)

  const events = useMemo(
    () => getAggregatedEvents(year, month),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [year, month, refreshKey],
  )

  const selectedDateEvents = events.filter((e) => e.date === selectedDate)

  function handlePrev() {
    const p = prevMonth(year, month)
    setYear(p.year)
    setMonth(p.month)
  }

  function handleNext() {
    const n = nextMonth(year, month)
    setYear(n.year)
    setMonth(n.month)
  }

  function handleToday() {
    setYear(todayYear())
    setMonth(todayMonth())
    setSelectedDate(todayStr())
  }

  function handleSelectDate(date: string) {
    setSelectedDate(date)
    // 다른 달 날짜 클릭 시 해당 달로 이동
    const [y, m] = date.split('-').map(Number)
    if (y !== year || m !== month) {
      setYear(y)
      setMonth(m)
    }
  }

  function handleAddEvent() {
    setEditingEventId(null)
    setShowModal(true)
  }

  function handleEditEvent(eventId: string) {
    // auto-generated 이벤트는 수정 불가 (source_type 있음)
    const event = events.find((e) => e.id === eventId)
    if (event?.source_type) return
    setEditingEventId(eventId)
    setShowModal(true)
  }

  function handleSaved() {
    setShowModal(false)
    setRefreshKey((k) => k + 1)
  }

  return (
    <div>
      {/* 오늘 요약 카드 */}
      <TodaySummaryCard key={refreshKey} />

      {/* 월간 캘린더 */}
      <CalendarMonthView
        year={year}
        month={month}
        events={events}
        selectedDate={selectedDate}
        onPrev={handlePrev}
        onNext={handleNext}
        onToday={handleToday}
        onSelectDate={handleSelectDate}
      />

      {/* 구분선 */}
      <div className="h-2 bg-gray-100" />

      {/* 선택 날짜 이벤트 패널 */}
      <DayEventPanel
        date={selectedDate}
        events={selectedDateEvents}
        onAddEvent={handleAddEvent}
        onEditEvent={handleEditEvent}
      />

      {/* 일정 추가/수정 모달 */}
      {showModal && (
        <EventFormModal
          eventId={editingEventId}
          defaultDate={selectedDate}
          onSaved={handleSaved}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  )
}
