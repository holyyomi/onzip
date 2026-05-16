import { useState } from 'react'
import FormModal, { Field, inputCls, FormActions } from '../common/FormModal'
import { checklistRepo, memberRepo } from '../../data/repositories'
import { newId, now } from '../../data/repositories/base'
import type { Checklist, RepeatRule } from '../../data/models'
import { trackEvent } from '../../utils/analytics'

interface Props {
  checklistId: string | null
  onSaved: () => void
  onClose: () => void
}

const REPEAT_OPTIONS: { value: RepeatRule; label: string }[] = [
  { value: 'none', label: '반복 없음' },
  { value: 'daily', label: '매일' },
  { value: 'weekly', label: '매주' },
  { value: 'monthly', label: '매월' },
]

const TITLE_SUGGESTIONS = ['오늘 할 일', '이번 주 할 일', '여행 준비', '집안일']

export default function ChecklistFormModal({ checklistId, onSaved, onClose }: Props) {
  const existing = checklistId ? checklistRepo.getById(checklistId) : undefined
  const members = memberRepo.getAll().filter((m) => m.is_active)

  const [title, setTitle] = useState(existing?.title ?? '')
  const [category, setCategory] = useState(existing?.category ?? '생활')
  const [memberId, setMemberId] = useState(existing?.member_id ?? 'shared')
  const [dueDate, setDueDate] = useState(existing?.due_date ?? '')
  const [repeat, setRepeat] = useState<RepeatRule>(existing?.repeat_rule ?? 'none')
  const [calendarVisible, setCalendarVisible] = useState(existing?.calendar_visible ?? false)
  const [error, setError] = useState('')
  const [showDetails, setShowDetails] = useState(Boolean(checklistId))

  function handleSave() {
    if (!title.trim()) { setError('제목을 입력해주세요'); return }

    if (checklistId && existing) {
      checklistRepo.update(checklistId, {
        title: title.trim(), category, member_id: memberId || null,
        due_date: dueDate || null, repeat_rule: repeat, calendar_visible: calendarVisible,
      })
    } else {
      const cl: Checklist = {
        id: newId(), household_id: 'default', title: title.trim(),
        category, member_id: memberId || null, due_date: dueDate || null,
        repeat_rule: repeat, calendar_visible: calendarVisible,
        created_at: now(), updated_at: now(),
      }
      checklistRepo.create(cl)
    }
    trackEvent('checklist_saved', { mode: checklistId ? 'edit' : 'create' })
    onSaved()
  }

  function handleDelete() {
    if (!checklistId) return
    if (!confirm('이 체크리스트를 삭제할까요?')) return
    checklistRepo.delete(checklistId)
    onSaved()
  }

  return (
    <FormModal title={checklistId ? '체크리스트 수정' : '새 체크리스트'} onClose={onClose}>
      <Field label="제목 (필수)">
        <input type="text" placeholder="예) 이번 주 할 일" value={title}
          onChange={(e) => { setTitle(e.target.value); setError('') }}
          onKeyDown={(e) => e.key === 'Enter' && handleSave()}
          className={inputCls}
          autoFocus />
        {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
      </Field>

      {!checklistId && (
        <div className="mb-4 flex gap-2 overflow-x-auto hide-scrollbar">
          {TITLE_SUGGESTIONS.map((suggestion) => (
            <button
              key={suggestion}
              onClick={() => { setTitle(suggestion); setError('') }}
              className="flex-shrink-0 rounded-full border border-[#dddddd] bg-[#f7f7f7] px-3 py-2 text-sm font-semibold text-[#222222]"
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}

      <button
        onClick={() => setShowDetails((value) => !value)}
        className="mb-3 min-h-[40px] text-sm font-semibold text-[#ff385c]"
      >
        {showDetails ? '자세히 닫기' : '마감일/담당자 자세히'}
      </button>

      {showDetails && (
        <div className="rounded-[20px] bg-[#f7f7f7] p-4 mb-4">
          <Field label="카테고리">
            <input type="text" value={category} onChange={(e) => setCategory(e.target.value)} className={inputCls} />
          </Field>

          <Field label="담당자">
            <select value={memberId} onChange={(e) => setMemberId(e.target.value)} className={inputCls}>
              {members.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
          </Field>

          <Field label="마감일">
            <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className={inputCls} />
          </Field>

          <Field label="반복">
            <select value={repeat} onChange={(e) => setRepeat(e.target.value as RepeatRule)} className={inputCls}>
              {REPEAT_OPTIONS.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
            </select>
          </Field>

          <div className="flex items-center justify-between py-2">
            <span className="text-sm text-gray-700">캘린더에 표시</span>
            <button onClick={() => setCalendarVisible((v) => !v)}
              className={`w-11 h-7 rounded-full transition-colors ${calendarVisible ? 'bg-[#ff385c]' : 'bg-gray-200'}`}>
              <span className={`block w-4 h-4 bg-white rounded-full shadow transition-transform mx-1 ${calendarVisible ? 'translate-x-4' : 'translate-x-0'}`} />
            </button>
          </div>
        </div>
      )}

      <FormActions onSave={handleSave} onDelete={checklistId ? handleDelete : undefined}
        saveLabel={checklistId ? '수정 완료' : '저장'} />
    </FormModal>
  )
}
