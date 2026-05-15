import { useState } from 'react'
import FormModal, { Field, inputCls, FormActions } from '../common/FormModal'
import { checklistRepo, memberRepo } from '../../data/repositories'
import { newId, now } from '../../data/repositories/base'
import type { Checklist, RepeatRule } from '../../data/models'

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
          onChange={(e) => { setTitle(e.target.value); setError('') }} className={inputCls} />
        {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
      </Field>

      <Field label="카테고리">
        <input type="text" value={category} onChange={(e) => setCategory(e.target.value)} className={inputCls} />
      </Field>

      <Field label="담당자">
        <select value={memberId} onChange={(e) => setMemberId(e.target.value)} className={inputCls}>
          {members.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
        </select>
      </Field>

      <Field label="마감일 (선택)">
        <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className={inputCls} />
      </Field>

      <Field label="반복">
        <select value={repeat} onChange={(e) => setRepeat(e.target.value as RepeatRule)} className={inputCls}>
          {REPEAT_OPTIONS.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
        </select>
      </Field>

      <div className="flex items-center justify-between mb-4 py-2">
        <span className="text-sm text-gray-700">캘린더에 표시</span>
        <button onClick={() => setCalendarVisible((v) => !v)}
          className={`w-10 h-6 rounded-full transition-colors ${calendarVisible ? 'bg-blue-500' : 'bg-gray-200'}`}>
          <span className={`block w-4 h-4 bg-white rounded-full shadow transition-transform mx-1 ${calendarVisible ? 'translate-x-4' : 'translate-x-0'}`} />
        </button>
      </div>

      <FormActions onSave={handleSave} onDelete={checklistId ? handleDelete : undefined}
        saveLabel={checklistId ? '수정 완료' : '저장'} />
    </FormModal>
  )
}
