import { useState } from 'react'
import FormModal, { Field, inputCls, FormActions } from '../common/FormModal'
import { ledgerEntryRepo, memberRepo } from '../../data/repositories'
import { newId, now } from '../../data/repositories/base'
import { PAYMENT_METHODS } from '../../utils/constants'
import { getCategories } from '../../utils/categoryStore'
import type { LedgerEntry, LedgerEntryType, PaymentMethod } from '../../data/models'
import { trackEvent } from '../../utils/analytics'

interface Props {
  entryId: string | null
  defaultDate: string
  defaultType: LedgerEntryType
  onSaved: () => void
  onClose: () => void
}

export default function LedgerFormModal({
  entryId,
  defaultDate,
  defaultType,
  onSaved,
  onClose,
}: Props) {
  const existing = entryId ? ledgerEntryRepo.getById(entryId) : undefined
  const members = memberRepo.getAll().filter((m) => m.is_active)

  const [entryType, setEntryType] = useState<LedgerEntryType>(
    existing?.entry_type ?? defaultType,
  )
  const [amount, setAmount] = useState(existing?.amount?.toString() ?? '')
  const [date, setDate] = useState(existing?.date ?? defaultDate)
  const [category, setCategory] = useState(
    existing?.category ?? (defaultType === 'expense' ? '식비' : '월급'),
  )
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(
    existing?.payment_method ?? 'card',
  )
  const [memberId, setMemberId] = useState(existing?.member_id ?? 'shared')
  const [memo, setMemo] = useState(existing?.memo ?? '')
  const [error, setError] = useState('')
  const [showDetails, setShowDetails] = useState(Boolean(entryId))

  const categories = entryType === 'expense' ? getCategories('expense') : getCategories('income')

  function handleSave() {
    const amt = Number(amount.replace(/,/g, ''))
    if (!amount || isNaN(amt) || amt <= 0) {
      setError('금액을 입력해주세요')
      return
    }

    if (entryId && existing) {
      ledgerEntryRepo.update(entryId, {
        entry_type: entryType,
        amount: amt,
        date,
        category,
        payment_method: entryType === 'expense' ? paymentMethod : null,
        member_id: memberId || null,
        memo,
      })
    } else {
      const entry: LedgerEntry = {
        id: newId(),
        household_id: 'default',
        entry_type: entryType,
        amount: amt,
        date,
        category,
        payment_method: entryType === 'expense' ? paymentMethod : null,
        member_id: memberId || null,
        memo,
        created_at: now(),
        updated_at: now(),
      }
      ledgerEntryRepo.create(entry)
    }
    trackEvent('ledger_saved', { type: entryType, mode: entryId ? 'edit' : 'create' })
    onSaved()
  }

  function handleDelete() {
    if (!entryId) return
    if (!confirm('이 항목을 삭제할까요?')) return
    ledgerEntryRepo.delete(entryId)
    onSaved()
  }

  return (
    <FormModal title={entryId ? '돈 기록 수정' : defaultType === 'income' ? '돈 들어온 것' : '돈 쓴 것'} onClose={onClose}>
      <div className="flex gap-2 mb-4">
        {(['expense', 'income'] as const).map((t) => (
          <button
            key={t}
            onClick={() => {
              setEntryType(t)
              setCategory(t === 'expense' ? '식비' : '월급')
            }}
            className={`flex-1 py-3 rounded-full text-sm font-semibold border transition-colors ${
              entryType === t
                ? t === 'expense'
                  ? 'bg-[#ff385c] text-white border-[#ff385c]'
                  : 'bg-[#222222] text-white border-[#222222]'
                : 'bg-white text-[#6a6a6a] border-[#dddddd]'
            }`}
          >
            {t === 'expense' ? '쓴 돈' : '들어온 돈'}
          </button>
        ))}
      </div>

      <Field label="얼마인가요?">
        <input
          type="number"
          placeholder="예) 12000"
          value={amount}
          onChange={(e) => { setAmount(e.target.value); setError('') }}
          className={inputCls}
          inputMode="numeric"
          autoFocus
        />
        {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
      </Field>

      <div className="grid grid-cols-4 gap-2 mb-3">
        {[5000, 10000, 20000, 50000].map((value) => (
          <button
            key={value}
            onClick={() => setAmount(String(value))}
            className="rounded-full border border-[#dddddd] bg-[#f7f7f7] py-2 text-xs font-semibold text-[#222222]"
          >
            {value / 10000 >= 1 ? `${value / 10000}만` : `${value / 1000}천`}
          </button>
        ))}
      </div>

      <Field label="어디에 썼나요?">
        <select value={category} onChange={(e) => setCategory(e.target.value)} className={inputCls}>
          {categories.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </Field>

      <Field label="간단 메모">
        <input type="text" placeholder="예) 점심, 마트, 택시" value={memo} onChange={(e) => setMemo(e.target.value)} className={inputCls} />
      </Field>

      <button
        onClick={() => setShowDetails((value) => !value)}
        className="mb-3 text-sm font-semibold text-[#ff385c]"
      >
        {showDetails ? '자세히 닫기' : '날짜/결제수단 자세히'}
      </button>

      {showDetails && (
        <div className="rounded-[20px] bg-[#f7f7f7] p-4 mb-4">
          <Field label="날짜">
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={inputCls} />
          </Field>

          {entryType === 'expense' && (
            <Field label="결제수단">
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                className={inputCls}
              >
                {PAYMENT_METHODS.map((m) => (
                  <option key={m.value} value={m.value}>{m.label}</option>
                ))}
              </select>
            </Field>
          )}

          <Field label="담당자">
            <select value={memberId} onChange={(e) => setMemberId(e.target.value)} className={inputCls}>
              {members.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
          </Field>
        </div>
      )}

      <FormActions
        onSave={handleSave}
        onDelete={entryId ? handleDelete : undefined}
        saveLabel={entryId ? '수정 완료' : '저장'}
      />
    </FormModal>
  )
}
