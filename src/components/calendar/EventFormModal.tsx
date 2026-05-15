import { useState, useEffect } from 'react'
import { calendarEventRepo, memberRepo } from '../../data/repositories'
import { newId, now } from '../../data/repositories/base'
import {} from '../../utils/date'
import type { CalendarEvent, RepeatRule } from '../../data/models'

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

    onSaved()
  }

  function handleDelete() {
    if (!isEdit || !eventId) return
    if (!confirm('이 일정을 삭제할까요?')) return
    calendarEventRepo.delete(eventId)
    onSaved()
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end bg-black/40">
      <div className="bg-white rounded-t-2xl p-5 max-h-[90vh] overflow-y-auto">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-semibold text-gray-900">
            {isEdit ? '일정 수정' : '일정 추가'}
          </h2>
          <button onClick={onClose} className="text-gray-400 text-lg">
            ✕
          </button>
        </div>

        {/* 유형 선택 */}
        <div className="flex gap-2 mb-4">
          {(['schedule', 'anniversary'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setEventType(t)}
              className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors ${
                eventType === t
                  ? 'bg-blue-500 text-white border-blue-500'
                  : 'bg-white text-gray-600 border-gray-200'
              }`}
            >
              {t === 'schedule' ? '일정' : '기념일'}
            </button>
          ))}
        </div>

        {/* 제목 */}
        <div className="mb-3">
          <input
            type="text"
            placeholder="제목 (필수)"
            value={title}
            onChange={(e) => { setTitle(e.target.value); setError('') }}
            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-blue-400"
          />
          {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
        </div>

        {/* 날짜 */}
        <div className="mb-3">
          <label className="text-xs text-gray-500 block mb-1">날짜</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-blue-400"
          />
        </div>

        {/* 시간 (일정만) */}
        {eventType === 'schedule' && (
          <div className="mb-3">
            <label className="text-xs text-gray-500 block mb-1">시간 (선택)</label>
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-blue-400"
            />
          </div>
        )}

        {/* 담당자 */}
        <div className="mb-3">
          <label className="text-xs text-gray-500 block mb-1">담당자</label>
          <select
            value={memberId}
            onChange={(e) => setMemberId(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-blue-400 bg-white"
          >
            {members.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
        </div>

        {/* 반복 */}
        <div className="mb-3">
          <label className="text-xs text-gray-500 block mb-1">반복</label>
          <select
            value={repeat}
            onChange={(e) => setRepeat(e.target.value as RepeatRule)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-blue-400 bg-white"
          >
            {REPEAT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>

        {/* 메모 */}
        <div className="mb-5">
          <label className="text-xs text-gray-500 block mb-1">메모 (선택)</label>
          <textarea
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            placeholder="메모를 입력하세요"
            rows={2}
            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-blue-400 resize-none"
          />
        </div>

        {/* 버튼 */}
        <div className="flex gap-2">
          {isEdit && (
            <button
              onClick={handleDelete}
              className="flex-1 py-3 border border-red-300 text-red-500 rounded-xl text-sm font-medium"
            >
              삭제
            </button>
          )}
          <button
            onClick={handleSave}
            className="flex-1 py-3 bg-blue-500 text-white rounded-xl text-sm font-semibold"
          >
            {isEdit ? '수정 완료' : '저장'}
          </button>
        </div>
      </div>
    </div>
  )
}
