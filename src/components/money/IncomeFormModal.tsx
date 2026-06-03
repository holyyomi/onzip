import { useState } from 'react'
import FormModal, { Field, inputCls, FormActions } from '../common/FormModal'
import { incomeRepo, memberRepo } from '../../data/repositories'
import { newId, now } from '../../data/repositories/base'
import { DAYS_OPTIONS } from '../../utils/constants'
import type { Income, IncomeType, RepeatRule } from '../../data/models'
import SecretToggle from '../common/SecretToggle'

interface Props {
  incomeId: string | null
  onSaved: () => void
  onClose: () => void
}

const INCOME_TYPES: { value: IncomeType; label: string }[] = [
  { value: 'fixed', label: '정기 수입' },
  { value: 'side', label: '부가 수입' },
  { value: 'one_time', label: '일회성 수입' },
  { value: 'other', label: '기타 수입' },
]

const REPEAT_OPTIONS: { value: RepeatRule; label: string }[] = [
  { value: 'none', label: '반복 없음' },
  { value: 'monthly', label: '매월' },
  { value: 'yearly', label: '매년' },
]

export default function IncomeFormModal({ incomeId, onSaved, onClose }: Props) {
  const existing = incomeId ? incomeRepo.getById(incomeId) : undefined
  const members = memberRepo.getAll().filter((m) => m.is_active)

  const [title, setTitle] = useState(existing?.title ?? '')
  const [amount, setAmount] = useState(existing?.amount?.toString() ?? '')
  const [incomeDay, setIncomeDay] = useState(existing?.income_day ?? 25)
  const [incomeType, setIncomeType] = useState<IncomeType>(existing?.income_type ?? 'fixed')
  const [memberId, setMemberId] = useState(existing?.member_id ?? 'me')
  const [repeat, setRepeat] = useState<RepeatRule>(existing?.repeat_rule ?? 'monthly')
  const [memo, setMemo] = useState(existing?.memo ?? '')
  const [memoSecret, setMemoSecret] = useState(existing?.memo_is_secret ?? false)
  const [error, setError] = useState('')
  const [showDetails, setShowDetails] = useState(Boolean(incomeId))

  function handleSave() {
    if (!title.trim()) { setError('수입명을 입력해주세요'); return }
    const amt = Number(amount)
    if (!amt || amt <= 0) { setError('금액을 입력해주세요'); return }

    if (incomeId && existing) {
      incomeRepo.update(incomeId, {
        title: title.trim(), amount: amt, income_day: incomeDay,
        income_type: incomeType, member_id: memberId || null,
        repeat_rule: repeat, memo, memo_is_secret: memoSecret,
      })
    } else {
      const item: Income = {
        id: newId(), household_id: 'default', title: title.trim(),
        amount: amt, income_day: incomeDay, income_type: incomeType,
        member_id: memberId || null, repeat_rule: repeat, memo, memo_is_secret: memoSecret,
        created_at: now(), updated_at: now(),
      }
      incomeRepo.create(item)
    }
    onSaved()
  }

  function handleDelete() {
    if (!incomeId) return
    if (!confirm('이 수입을 삭제할까요?')) return
    incomeRepo.delete(incomeId)
    onSaved()
  }

  return (
    <FormModal title={incomeId ? '수입 수정' : '수입 추가'} onClose={onClose}>
      <Field label="수입명">
        <input type="text" placeholder="예) 월급" value={title}
          onChange={(e) => { setTitle(e.target.value); setError('') }}
          className={inputCls}
          autoFocus />
        {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
      </Field>

      <Field label="금액">
        <input type="number" placeholder="0" value={amount}
          onChange={(e) => { setAmount(e.target.value); setError('') }}
          onKeyDown={(e) => e.key === 'Enter' && handleSave()}
          className={inputCls} inputMode="numeric" />
      </Field>

      <Field label="수입 유형">
        <select value={incomeType} onChange={(e) => setIncomeType(e.target.value as IncomeType)} className={inputCls}>
          {INCOME_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
        </select>
      </Field>

      <button
        onClick={() => setShowDetails((value) => !value)}
        className="mb-3 min-h-[40px] text-sm font-semibold text-[#ff385c]"
      >
        {showDetails ? '자세히 닫기' : '입금일/반복 자세히'}
      </button>

      {showDetails && (
        <div className="rounded-[20px] bg-[#f7f7f7] p-4 mb-4">
          <Field label="입금일">
            <select value={incomeDay} onChange={(e) => setIncomeDay(Number(e.target.value))} className={inputCls}>
              {DAYS_OPTIONS.map((d) => <option key={d} value={d}>매월 {d}일</option>)}
            </select>
          </Field>

          <Field label="담당자">
            <select value={memberId} onChange={(e) => setMemberId(e.target.value)} className={inputCls}>
              {members.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
          </Field>

          <Field label="반복">
            <select value={repeat} onChange={(e) => setRepeat(e.target.value as RepeatRule)} className={inputCls}>
              {REPEAT_OPTIONS.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
            </select>
          </Field>

          <Field label="메모" action={<SecretToggle secret={memoSecret} onChange={setMemoSecret} />}>
            <input type="text" placeholder="예) 급여일, 입금 계좌" value={memo} onChange={(e) => setMemo(e.target.value)} className={inputCls} />
          </Field>
        </div>
      )}

      <FormActions onSave={handleSave} onDelete={incomeId ? handleDelete : undefined}
        saveLabel={incomeId ? '수정 완료' : '저장'} />
    </FormModal>
  )
}
