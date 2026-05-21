import { useState, useEffect } from 'react'
import { calendarEventRepo, memberRepo } from '../../data/repositories'
import { newId, now } from '../../data/repositories/base'
import type { CalendarEvent, RepeatRule } from '../../data/models'
import { trackEvent } from '../../utils/analytics'

interface Props {
  eventId: string | null    // null = 신규 추가
  defaultDate: string
  onSaved: () => void
  onClose: () => void
}

const REPEAT_OPTIONS: { value: RepeatRule; label: string }[] = [
  { value: 'none', label: '반복 없음' },
  { value: 'daily', label: '매일' },
  { value: 'weekly', label: '매주' },
  { value: 'monthly', label: '매월' },
  { value: 'yearly', label: '매년' },
]

const SCHEDULE_SUGGESTIONS = ['병원 예약', '학교 일정', '가족 약속', '기념일']

export default function EventFormModal({
  eventId,
  defaultDate,
  onSaved,
  onClose,
}: Props) {
  const isEdit = eventId !== null
  const existing = isEdit ? calendarEventRepo.getById(eventId) : undefined

  const [title, setTitle] = useState(existing?.title ?? '')
  const [date, setDate] = useState(existing?.start_date ?? defaultDate)
  const [time, setTime] = useState(existing?.time ?? '')
  const [eventType, setEventType] = useState<'schedule' | 'anniversary'>(
    existing?.event_type === 'anniversary' ? 'anniversary' : 'schedule',
  )
  const [repeat, setRepeat] = useState<RepeatRule>(existing?.repeat_rule ?? 'none')
  const [memberId, setMemberId] = useState<string>(existing?.member_id ?? 'shared')
  const [memo, setMemo] = useState(existing?.memo ?? '')
  const [error, setError] = useState('')
  const [showDetails, setShowDetails] = useState(isEdit)

  const members = memberRepo.getAll().filter((m) => m.is_active)

  // anniversary는 매년 반복 기본값
  useEffect(() => {
    if (eventType === 'anniversary' && repeat === 'none') {
      setRepeat('yearly')
    }
  }, [eventType, repeat])

  function handleSave() {
    if (!title.trim()) {
      setError('제목을 입력해주세요')
      return
    }
    if (!date) {
      setError('날짜를 선택해주세요')
      return
    }

    const household = 'default'

    if (isEdit && existing) {
      calendarEventRepo.update(eventId, {
        title: title.trim(),
        start_date: date,
        end_date: null,
        time: time || null,
        event_type: eventType,
        repeat_rule: repeat,
        member_id: memberId || null,
        memo,
      })
    } else {
      const newEvent: CalendarEvent = {
        id: newId(),
        household_id: household,
        title: title.trim(),
        event_type: eventType,
        start_date: date,
        end_date: null,
        time: time || null,
        amount: null,
        member_id: memberId || null,
        is_done: false,
        repeat_rule: repeat,
        source_type: null,
        source_id: null,
        memo,
        created_at: now(),
        updated_at: now(),
      }
      calendarEventRepo.create(newEvent)
    }

    trackEvent('calendar_event_saved', { type: eventType, mode: isEdit ? 'edit' : 'create' })
    onSaved()
  }

  function handleDelete() {
    if (!isEdit || !eventId) return
    if (!confirm('이 일정을 삭제할까요?')) return
    calendarEventRepo.delete(eventId)
    onSaved()
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end bg-black/40 lg:items-center lg:justify-center lg:p-6">
      <div className="bg-white rounded-t-[28px] px-5 pt-4 pb-3 max-h-[92dvh] overflow-y-auto scroll-smooth-mobile lg:w-full lg:max-w-2xl lg:rounded-[24px] lg:p-6">
        <div className="flex items-center justify-between mb-5 sticky top-0 z-10 bg-white pb-2">
          <h2 className="text-xl font-semibold text-[#222222]">
            {isEdit ? '일정 수정' : '중요 일정 추가'}
          </h2>
          <button
            onClick={onClose}
            className="h-11 w-11 rounded-full bg-[#f2f2f2] text-[#6a6a6a] text-lg flex items-center justify-center"
            aria-label="닫기"
          >
            ✕
          </button>
        </div>

        <div className="flex gap-2 mb-4">
          {(['schedule', 'anniversary'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setEventType(t)}
              className={`flex-1 py-3 rounded-full text-sm font-semibold border transition-colors ${
                eventType === t
                  ? 'bg-[#222222] text-white border-[#222222]'
                  : 'bg-white text-[#6a6a6a] border-[#dddddd]'
              }`}
            >
              {t === 'schedule' ? '일정' : '기념일'}
            </button>
          ))}
        </div>

        <div className="mb-3">
          <label className="text-sm font-semibold text-[#6a6a6a] block mb-1.5">일정명</label>
          <input
            type="text"
            placeholder="예) 병원 예약, 결혼기념일"
            value={title}
            onChange={(e) => { setTitle(e.target.value); setError('') }}
            onKeyDown={(e) => e.key === 'Enter' && handleSave()}
            className="w-full min-h-[52px] border border-[#dddddd] rounded-[18px] px-4 py-3 text-base focus:outline-none focus:border-[#222222]"
            autoFocus
          />
          {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
        </div>

        {!isEdit && (
          <div className="mb-4 flex gap-2 overflow-x-auto hide-scrollbar">
            {SCHEDULE_SUGGESTIONS.map((suggestion) => (
              <button
                key={suggestion}
                onClick={() => {
                  setTitle(suggestion)
                  setEventType(suggestion === '기념일' ? 'anniversary' : 'schedule')
                  setError('')
                }}
                className="flex-shrink-0 rounded-full border border-[#dddddd] bg-[#f7f7f7] px-3 py-2 text-sm font-semibold text-[#222222]"
              >
                {suggestion}
              </button>
            ))}
          </div>
        )}

        <div className="mb-3">
          <label className="text-sm font-semibold text-[#6a6a6a] block mb-1.5">언제인가요?</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full min-h-[52px] border border-[#dddddd] rounded-[18px] px-4 py-3 text-base focus:outline-none focus:border-[#222222]"
          />
        </div>

        {eventType === 'schedule' && (
          <div className="mb-3">
            <label className="text-sm font-semibold text-[#6a6a6a] block mb-1.5">시간</label>
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full min-h-[52px] border border-[#dddddd] rounded-[18px] px-4 py-3 text-base focus:outline-none focus:border-[#222222]"
            />
          </div>
        )}

        <button
          onClick={() => setShowDetails((value) => !value)}
          className="mb-3 text-sm font-semibold text-[#ff385c]"
        >
          {showDetails ? '자세히 닫기' : '반복/담당자 자세히'}
        </button>

        {showDetails && (
          <div className="rounded-[20px] bg-[#f7f7f7] p-4 mb-4">
            <div className="mb-3">
              <label className="text-sm font-semibold text-[#6a6a6a] block mb-1.5">담당자</label>
              <select
                value={memberId}
                onChange={(e) => setMemberId(e.target.value)}
                className="w-full min-h-[52px] border border-[#dddddd] rounded-[18px] px-4 py-3 text-base focus:outline-none focus:border-[#222222] bg-white"
              >
                {members.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-3">
              <label className="text-sm font-semibold text-[#6a6a6a] block mb-1.5">반복</label>
              <select
                value={repeat}
                onChange={(e) => setRepeat(e.target.value as RepeatRule)}
                className="w-full min-h-[52px] border border-[#dddddd] rounded-[18px] px-4 py-3 text-base focus:outline-none focus:border-[#222222] bg-white"
              >
                {REPEAT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-semibold text-[#6a6a6a] block mb-1.5">메모</label>
              <textarea
                value={memo}
                onChange={(e) => setMemo(e.target.value)}
                placeholder="장소, 준비물, 참고 사항을 기록하세요"
                rows={2}
                className="w-full border border-[#dddddd] rounded-[18px] px-4 py-3 text-base focus:outline-none focus:border-[#222222] resize-none bg-white"
              />
            </div>
          </div>
        )}

        <div className="sticky bottom-0 -mx-5 flex gap-2 bg-white px-5 pt-3 pb-[calc(env(safe-area-inset-bottom)+12px)]">
          {isEdit && (
            <button
              onClick={handleDelete}
              className="flex-1 min-h-[52px] border border-red-200 text-red-500 rounded-full text-sm font-semibold"
            >
              삭제
            </button>
          )}
          <button
            onClick={handleSave}
            className="flex-1 min-h-[52px] bg-[#ff385c] text-white rounded-full text-sm font-semibold active:bg-[#e00b41]"
          >
            {isEdit ? '수정 완료' : '저장'}
          </button>
        </div>
      </div>
    </div>
  )
}
