import { useState } from 'react'
import FormModal, { Field, inputCls, FormActions } from '../common/FormModal'
import { fixedExpenseRepo, memberRepo } from '../../data/repositories'
import { newId, now } from '../../data/repositories/base'
import { PAYMENT_METHODS, DAYS_OPTIONS } from '../../utils/constants'
import { getCategories } from '../../utils/categoryStore'
import type { FixedExpense, PaymentMethod } from '../../data/models'
import { trackEvent } from '../../utils/analytics'

interface Props {
  expenseId: string | null
  onSaved: () => void
  onClose: () => void
}

const FIXED_TITLE_SUGGESTIONS = ['월세', '관리비', '보험료', '통신비']
const AMOUNT_SUGGESTIONS = [50000, 100000, 300000, 500000]

export default function FixedExpenseFormModal({ expenseId, onSaved, onClose }: Props) {
  const existing = expenseId ? fixedExpenseRepo.getById(expenseId) : undefined
  const members = memberRepo.getAll().filter((m) => m.is_active)

  const [title, setTitle] = useState(existing?.title ?? '')
  const [amount, setAmount] = useState(existing?.amount?.toString() ?? '')
  const [category, setCategory] = useState<string>(existing?.category ?? '주거')
  const [paymentDay, setPaymentDay] = useState(existing?.payment_day ?? 1)
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(
    existing?.payment_method ?? 'auto_transfer',
  )
  const [memberId, setMemberId] = useState(existing?.member_id ?? 'shared')
  const [calendarVisible, setCalendarVisible] = useState(
    existing?.calendar_visible ?? true,
  )
  const [memo, setMemo] = useState(existing?.memo ?? '')
  const [error, setError] = useState('')
  const [showDetails, setShowDetails] = useState(Boolean(expenseId))

  function handleSave() {
    if (!title.trim()) { setError('이름을 입력해주세요'); return }
    const amt = Number(amount)
    if (!amt || amt <= 0) { setError('금액을 입력해주세요'); return }

    if (expenseId && existing) {
      fixedExpenseRepo.update(expenseId, {
        title: title.trim(),
        amount: amt,
        category,
        payment_day: paymentDay,
        payment_method: paymentMethod,
        member_id: memberId || null,
        calendar_visible: calendarVisible,
        memo,
      })
    } else {
      const fe: FixedExpense = {
        id: newId(),
        household_id: 'default',
        title: title.trim(),
        amount: amt,
        category,
        payment_day: paymentDay,
        payment_method: paymentMethod,
        member_id: memberId || null,
        is_active: true,
        calendar_visible: calendarVisible,
        status: 'pending',
        memo,
        created_at: now(),
        updated_at: now(),
      }
      fixedExpenseRepo.create(fe)
    }
    trackEvent('fixed_expense_saved', { mode: expenseId ? 'edit' : 'create' })
    onSaved()
  }

  function handleDelete() {
    if (!expenseId) return
    if (!confirm('이 고정지출을 삭제할까요?')) return
    fixedExpenseRepo.delete(expenseId)
    onSaved()
  }

  return (
    <FormModal title={expenseId ? '고정지출 수정' : '고정지출 추가'} onClose={onClose}>
      <Field label="이름 (필수)">
        <input type="text" placeholder="예) 월세" value={title}
          onChange={(e) => { setTitle(e.target.value); setError('') }}
          className={inputCls}
          autoFocus />
        {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
      </Field>

      {!expenseId && (
        <div className="mb-4 flex gap-2 overflow-x-auto hide-scrollbar">
          {FIXED_TITLE_SUGGESTIONS.map((suggestion) => (
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

      <Field label="금액 (필수)">
        <input type="number" placeholder="0" value={amount}
          onChange={(e) => { setAmount(e.target.value); setError('') }}
          onKeyDown={(e) => e.key === 'Enter' && handleSave()}
          className={inputCls} inputMode="numeric" />
      </Field>

      <div className="grid grid-cols-4 gap-2 mb-4">
        {AMOUNT_SUGGESTIONS.map((value) => (
          <button
            key={value}
            onClick={() => setAmount(String(value))}
            className="rounded-full border border-[#dddddd] bg-[#f7f7f7] py-2 text-xs font-semibold text-[#222222]"
          >
            {value / 10000}만
          </button>
        ))}
      </div>

      <button
        onClick={() => setShowDetails((value) => !value)}
        className="mb-3 min-h-[40px] text-sm font-semibold text-[#ff385c]"
      >
        {showDetails ? '자세히 닫기' : '납부일/결제수단 자세히'}
      </button>

      {showDetails && (
        <div className="rounded-[20px] bg-[#f7f7f7] p-4 mb-4">
          <Field label="카테고리">
            <select value={category} onChange={(e) => setCategory(e.target.value)} className={inputCls}>
              {getCategories('fixed_expense').map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </Field>

          <Field label="납부일">
            <select value={paymentDay} onChange={(e) => setPaymentDay(Number(e.target.value))} className={inputCls}>
              {DAYS_OPTIONS.map((d) => <option key={d} value={d}>매월 {d}일</option>)}
            </select>
          </Field>

          <Field label="결제방식">
            <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)} className={inputCls}>
              {PAYMENT_METHODS.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
            </select>
          </Field>

          <Field label="담당자">
            <select value={memberId} onChange={(e) => setMemberId(e.target.value)} className={inputCls}>
              {members.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
          </Field>

          <div className="flex items-center justify-between mb-3 py-2">
            <span className="text-sm text-gray-700">캘린더에 표시</span>
            <button
              onClick={() => setCalendarVisible((v) => !v)}
              className={`w-11 h-7 rounded-full transition-colors ${calendarVisible ? 'bg-[#ff385c]' : 'bg-gray-200'}`}
            >
              <span className={`block w-4 h-4 bg-white rounded-full shadow transition-transform mx-1 ${calendarVisible ? 'translate-x-4' : 'translate-x-0'}`} />
            </button>
          </div>

          <Field label="메모">
            <input type="text" placeholder="메모" value={memo} onChange={(e) => setMemo(e.target.value)} className={inputCls} />
          </Field>
        </div>
      )}

      <FormActions onSave={handleSave} onDelete={expenseId ? handleDelete : undefined}
        saveLabel={expenseId ? '수정 완료' : '저장'} />
    </FormModal>
  )
}
