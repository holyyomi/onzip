import { useState, useMemo, useEffect } from 'react'
import FormModal, { Field, inputCls, FormActions } from '../common/FormModal'
import { choreRepo, memberRepo } from '../../data/repositories'
import { newId, now } from '../../data/repositories/base'
import type { Chore, RepeatRule } from '../../data/models'
import EmptyState from '../common/EmptyState'
import SecretToggle from '../common/SecretToggle'
import { todayStr } from '../../utils/date'

interface Props {
  refreshKey: number
  onRefresh: () => void
}

const REPEAT_LABEL: Record<RepeatRule, string> = {
  none: '반복없음', daily: '매일', weekly: '매주', monthly: '매월', yearly: '매년',
}

function shouldAutoReset(chore: Chore): boolean {
  if (!chore.is_done || chore.repeat_rule === 'none') return false
  const today = todayStr()
  const doneDate = chore.updated_at.slice(0, 10)
  if (chore.repeat_rule === 'daily') return doneDate < today
  if (chore.repeat_rule === 'weekly') {
    const diffMs = new Date(today).getTime() - new Date(doneDate).getTime()
    return diffMs >= 7 * 86400000
  }
  if (chore.repeat_rule === 'monthly') return doneDate.slice(0, 7) < today.slice(0, 7)
  if (chore.repeat_rule === 'yearly') return doneDate.slice(0, 4) < today.slice(0, 4)
  return false
}

export default function ChoreTab({ refreshKey, onRefresh }: Props) {
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [localRefresh, setLocalRefresh] = useState(0)

  // 반복 주기가 지난 완료 항목 자동 리셋
  useEffect(() => {
    const all = choreRepo.getByHousehold('default')
    const needReset = all.filter(shouldAutoReset)
    if (needReset.length > 0) {
      needReset.forEach((c) => choreRepo.update(c.id, { is_done: false }))
      setLocalRefresh((k) => k + 1)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const chores = useMemo(
    () => choreRepo.getByHousehold('default'),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [refreshKey, localRefresh],
  )

  const members = useMemo(
    () =>
      memberRepo.getAll().reduce<Record<string, string>>((acc, m) => {
        acc[m.id] = m.name; return acc
      }, {}),
    [],
  )

  function toggleDone(id: string, current: boolean) {
    choreRepo.update(id, { is_done: !current })
    setLocalRefresh((k) => k + 1)
  }

  const pending = chores.filter((c) => !c.is_done)
  const done = chores.filter((c) => c.is_done)

  return (
    <div>
      <div className="px-4 py-3 bg-white border-b border-gray-100 flex justify-between items-center">
        <span className="text-sm font-semibold text-gray-700">
          집안일 ({pending.length}개 남음)
        </span>
        <button onClick={() => { setEditingId(null); setShowModal(true) }}
          className="min-h-[36px] rounded-full border border-[#ffd1da] bg-white px-3 text-sm font-semibold text-[#ff385c]">
          + 추가
        </button>
      </div>

      <div className="p-4 space-y-2">
        {chores.length === 0 && (
          <EmptyState
            message="집안일이 비어 있습니다"
            sub="반복되는 집안일과 담당자를 정리해두세요."
            actionLabel="집안일 추가"
            onAction={() => { setEditingId(null); setShowModal(true) }}
          />
        )}

        {pending.map((c) => (
          <ChoreRow key={c.id} chore={c} memberNames={members}
            onToggle={() => toggleDone(c.id, c.is_done)}
            onEdit={() => { setEditingId(c.id); setShowModal(true) }} />
        ))}

        {done.length > 0 && (
          <>
            <p className="text-xs text-gray-400 pt-2">완료 ({done.length}개)</p>
            {done.map((c) => (
              <ChoreRow key={c.id} chore={c} memberNames={members}
                onToggle={() => toggleDone(c.id, c.is_done)}
                onEdit={() => { setEditingId(c.id); setShowModal(true) }} />
            ))}
          </>
        )}
      </div>

      {showModal && (
        <ChoreFormModal
          choreId={editingId}
          onSaved={() => { setShowModal(false); setLocalRefresh((k) => k + 1); onRefresh() }}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  )
}

function ChoreRow({
  chore, memberNames, onToggle, onEdit,
}: {
  chore: Chore
  memberNames: Record<string, string>
  onToggle: () => void
  onEdit: () => void
}) {
  return (
    <div className={`oz-card px-4 py-3 flex items-center gap-3 ${chore.is_done ? 'opacity-50' : ''}`}>
      <button onClick={onToggle}
        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
          chore.is_done ? 'bg-green-500 border-green-500 text-white' : 'border-gray-300'
        }`}>
        {chore.is_done && <span className="text-xs">✓</span>}
      </button>

      <button onClick={onEdit} className="flex-1 text-left min-w-0">
        <p className={`text-sm font-medium ${chore.is_done ? 'line-through text-gray-400' : 'text-gray-800'}`}>
          {chore.title}
        </p>
        <p className="text-xs text-gray-400 mt-0.5">
          {REPEAT_LABEL[chore.repeat_rule]}
          {chore.member_id ? ` · ${memberNames[chore.member_id] ?? ''}` : ''}
        </p>
      </button>
    </div>
  )
}

// ─── 집안일 폼 모달 ───

function ChoreFormModal({
  choreId, onSaved, onClose,
}: {
  choreId: string | null
  onSaved: () => void
  onClose: () => void
}) {
  const existing = choreId ? choreRepo.getById(choreId) : undefined
  const members = memberRepo.getAll().filter((m) => m.is_active)

  const [title, setTitle] = useState(existing?.title ?? '')
  const [repeat, setRepeat] = useState<RepeatRule>(existing?.repeat_rule ?? 'weekly')
  const [memberId, setMemberId] = useState(existing?.member_id ?? 'shared')
  const [dueDate, setDueDate] = useState(existing?.due_date ?? '')
  const [calendarVisible, setCalendarVisible] = useState(existing?.calendar_visible ?? false)
  const [memo, setMemo] = useState(existing?.memo ?? '')
  const [memoSecret, setMemoSecret] = useState(existing?.memo_is_secret ?? false)
  const [error, setError] = useState('')

  const REPEAT_OPTIONS: { value: RepeatRule; label: string }[] = [
    { value: 'daily', label: '매일' },
    { value: 'weekly', label: '매주' },
    { value: 'monthly', label: '매월' },
    { value: 'none', label: '반복없음' },
  ]

  function handleSave() {
    if (!title.trim()) { setError('집안일 이름을 입력해주세요'); return }
    if (choreId && existing) {
      choreRepo.update(choreId, {
        title: title.trim(), repeat_rule: repeat,
        member_id: memberId || null, due_date: dueDate || null,
        calendar_visible: calendarVisible, memo, memo_is_secret: memoSecret,
      })
    } else {
      const chore: Chore = {
        id: newId(), household_id: 'default', title: title.trim(),
        repeat_rule: repeat, member_id: memberId || null,
        due_date: dueDate || null, calendar_visible: calendarVisible,
        is_done: false, memo, memo_is_secret: memoSecret, created_at: now(), updated_at: now(),
      }
      choreRepo.create(chore)
    }
    onSaved()
  }

  function handleDelete() {
    if (!choreId) return
    if (!confirm('삭제할까요?')) return
    choreRepo.delete(choreId)
    onSaved()
  }

  return (
    <FormModal title={choreId ? '집안일 수정' : '집안일 추가'} onClose={onClose}>
      <Field label="이름 (필수)">
        <input type="text" placeholder="예) 분리수거" value={title}
          onChange={(e) => { setTitle(e.target.value); setError('') }} className={inputCls} />
        {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
      </Field>

      <Field label="반복 주기">
        <select value={repeat} onChange={(e) => setRepeat(e.target.value as RepeatRule)} className={inputCls}>
          {REPEAT_OPTIONS.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
        </select>
      </Field>

      <Field label="담당자">
        <select value={memberId} onChange={(e) => setMemberId(e.target.value)} className={inputCls}>
          {members.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
        </select>
      </Field>

      <Field label="마감일 (선택)">
        <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className={inputCls} />
      </Field>

      <div className="flex items-center justify-between mb-4 py-2">
        <span className="text-sm text-gray-700">캘린더에 표시</span>
        <button onClick={() => setCalendarVisible((v) => !v)}
          className={`w-10 h-6 rounded-full transition-colors ${calendarVisible ? 'bg-[#ff385c]' : 'bg-gray-200'}`}>
          <span className={`block w-4 h-4 bg-white rounded-full shadow transition-transform mx-1 ${calendarVisible ? 'translate-x-4' : 'translate-x-0'}`} />
        </button>
      </div>

      <Field label="메모 (선택)" action={<SecretToggle secret={memoSecret} onChange={setMemoSecret} />}>
        <input type="text" placeholder="메모" value={memo} onChange={(e) => setMemo(e.target.value)} className={inputCls} />
      </Field>

      <FormActions onSave={handleSave} onDelete={choreId ? handleDelete : undefined}
        saveLabel={choreId ? '수정 완료' : '저장'} />
    </FormModal>
  )
}
