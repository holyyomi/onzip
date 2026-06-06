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
import DayEventPanel from '../calendar/DayEventPanel'
import EventFormModal from '../calendar/EventFormModal'

type ViewMode = 'month' | 'week'

interface Props {
  externalRefreshKey: number
}

function addDays(dateStr: string, days: number): string {
  const [y, m, d] = dateStr.split('-').map(Number)
  const result = new Date(y, m - 1, d + days)
  return formatDate(result)
}

export default function CalendarPage({ externalRefreshKey }: Props) {
  const [viewMode, setViewMode] = useState<ViewMode>('month')
  const [year, setYear] = useState(todayYear())
  const [month, setMonth] = useState(todayMonth())
  const [selectedDate, setSelectedDate] = useState(todayStr())
  const [showModal, setShowModal] = useState(false)
  const [editingEventId, setEditingEventId] = useState<string | null>(null)
  const [editingOccurrenceDate, setEditingOccurrenceDate] = useState<string | undefined>(undefined)
  const [refreshKey, setRefreshKey] = useState(0)
  const [toastMessage, setToastMessage] = useState('')

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

  function showToast(msg: string) {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(''), 2500)
  }

  function handleEditEvent(eventId: string) {
    const event = events.find((e) => e.id === eventId)
    if (event?.source_type) {
      const label =
        event.source_type === 'fixed_expense' ? '가계부 › 입출금 탭에서 수정하세요' :
        event.source_type === 'subscription' ? '가계부 › 자동결제 탭에서 수정하세요' :
        event.source_type === 'checklist' ? '생활 › 체크리스트 탭에서 수정하세요' :
        '해당 탭에서 수정하세요'
      showToast(label)
      return
    }
    // 반복 이벤트: 원본 ID로 편집, occurrence 날짜 전달
    const targetId = event?.original_id ?? eventId
    setEditingEventId(targetId)
    setEditingOccurrenceDate(event?.original_id ? event.date : undefined)
    setShowModal(true)
  }

  function handleSaved() {
    setShowModal(false)
    setEditingOccurrenceDate(undefined)
    setRefreshKey((k) => k + 1)
  }

  return (
    <div>
      <div className="flex flex-wrap px-4 py-3 gap-2 bg-[#f7f7f7] lg:px-8 lg:pt-5">
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
        <button onClick={handleAddEvent}
          className="px-4 py-2 text-sm font-semibold text-white bg-[#ff385c] rounded-full">
          일정 추가
        </button>
      </div>

      <div className="lg:px-8">
        <div>
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
        </div>

        <div>
          <div className="h-2 bg-[#f7f7f7] lg:hidden" />

          <DayEventPanel
            date={selectedDate} events={selectedDateEvents}
            onAddEvent={handleAddEvent} onEditEvent={handleEditEvent}
          />
        </div>
      </div>

      {showModal && (
        <EventFormModal
          eventId={editingEventId} defaultDate={selectedDate}
          occurrenceDate={editingOccurrenceDate}
          onSaved={handleSaved}
          onClose={() => { setShowModal(false); setEditingOccurrenceDate(undefined) }}
        />
      )}

      {toastMessage && (
        <div className="fixed left-1/2 bottom-28 z-50 -translate-x-1/2 rounded-full bg-[#222222] px-5 py-3 text-sm font-semibold text-white shadow-lg">
          {toastMessage}
        </div>
      )}
    </div>
  )
}
