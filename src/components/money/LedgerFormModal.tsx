import { useState } from 'react'
import FormModal, { Field, inputCls, FormActions } from '../common/FormModal'
import { ledgerEntryRepo, memberRepo } from '../../data/repositories'
import { newId, now } from '../../data/repositories/base'
import { PAYMENT_METHODS } from '../../utils/constants'
import { getCategories } from '../../utils/categoryStore'
import type { LedgerEntry, LedgerEntryType, PaymentMethod } from '../../data/models'

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
    onSaved()
  }

  function handleDelete() {
    if (!entryId) return
    if (!confirm('이 항목을 삭제할까요?')) return
    ledgerEntryRepo.delete(entryId)
    onSaved()
  }

  return (
    <FormModal title={entryId ? '내역 수정' : '내역 추가'} onClose={onClose}>
      {/* 수입 / 지출 토글 */}
      <div className="flex gap-2 mb-4">
        {(['expense', 'income'] as const).map((t) => (
          <button
            key={t}
            onClick={() => {
              setEntryType(t)
              setCategory(t === 'expense' ? '식비' : '월급')
            }}
            className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors ${
              entryType === t
                ? t === 'expense'
                  ? 'bg-red-500 text-white border-red-500'
                  : 'bg-blue-500 text-white border-blue-500'
                : 'bg-white text-gray-500 border-gray-200'
            }`}
          >
            {t === 'expense' ? '지출' : '수입'}
          </button>
        ))}
      </div>

      <Field label="금액 (필수)">
        <input
          type="number"
          placeholder="0"
          value={amount}
          onChange={(e) => { setAmount(e.target.value); setError('') }}
          className={inputCls}
          inputMode="numeric"
        />
        {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
      </Field>

      <Field label="날짜">
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={inputCls} />
      </Field>

      <Field label="카테고리">
        <select value={category} onChange={(e) => setCategory(e.target.value)} className={inputCls}>
          {categories.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
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

      <Field label="메모 (선택)">
        <input type="text" placeholder="메모" value={memo} onChange={(e) => setMemo(e.target.value)} className={inputCls} />
      </Field>

      <FormActions
        onSave={handleSave}
        onDelete={entryId ? handleDelete : undefined}
        saveLabel={entryId ? '수정 완료' : '저장'}
      />
    </FormModal>
  )
}
