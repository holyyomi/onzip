import { useState } from 'react'
import FormModal, { Field, inputCls, FormActions } from '../common/FormModal'
import { subscriptionRepo, memberRepo } from '../../data/repositories'
import { newId, now } from '../../data/repositories/base'
import { PAYMENT_METHODS, DAYS_OPTIONS } from '../../utils/constants'
import type { Subscription, SubscriptionStatus, PaymentMethod } from '../../data/models'

interface Props {
  subId: string | null
  onSaved: () => void
  onClose: () => void
}

const STATUS_OPTIONS: { value: SubscriptionStatus; label: string }[] = [
  { value: 'active', label: '사용중' },
  { value: 'considering_cancel', label: '해지 고민' },
  { value: 'cancelled', label: '해지 완료' },
]

export default function SubscriptionFormModal({ subId, onSaved, onClose }: Props) {
  const existing = subId ? subscriptionRepo.getById(subId) : undefined
  const members = memberRepo.getAll().filter((m) => m.is_active)

  const [title, setTitle] = useState(existing?.title ?? '')
  const [amount, setAmount] = useState(existing?.amount?.toString() ?? '')
  const [paymentDay, setPaymentDay] = useState(existing?.payment_day ?? 1)
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(
    existing?.payment_method ?? 'card',
  )
  const [status, setStatus] = useState<SubscriptionStatus>(existing?.status ?? 'active')
  const [memberId, setMemberId] = useState(existing?.member_id ?? 'shared')
  const [calendarVisible, setCalendarVisible] = useState(existing?.calendar_visible ?? true)
  const [memo, setMemo] = useState(existing?.memo ?? '')
  const [error, setError] = useState('')

  function handleSave() {
    if (!title.trim()) { setError('구독명을 입력해주세요'); return }
    const amt = Number(amount)
    if (!amt || amt <= 0) { setError('금액을 입력해주세요'); return }

    if (subId && existing) {
      subscriptionRepo.update(subId, {
        title: title.trim(), amount: amt, payment_day: paymentDay,
        payment_method: paymentMethod, status, member_id: memberId || null,
        calendar_visible: calendarVisible, memo,
      })
    } else {
      const sub: Subscription = {
        id: newId(), household_id: 'default', title: title.trim(),
        amount: amt, payment_day: paymentDay, payment_method: paymentMethod,
        status, member_id: memberId || null, calendar_visible: calendarVisible,
        memo, created_at: now(), updated_at: now(),
      }
      subscriptionRepo.create(sub)
    }
    onSaved()
  }

  function handleDelete() {
    if (!subId) return
    if (!confirm('이 구독을 삭제할까요?')) return
    subscriptionRepo.delete(subId)
    onSaved()
  }

  return (
    <FormModal title={subId ? '구독 수정' : '구독 추가'} onClose={onClose}>
      <Field label="구독명 (필수)">
        <input type="text" placeholder="예) 넷플릭스" value={title}
          onChange={(e) => { setTitle(e.target.value); setError('') }} className={inputCls} />
        {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
      </Field>

      <Field label="월 결제금액 (필수)">
        <input type="number" placeholder="0" value={amount}
          onChange={(e) => { setAmount(e.target.value); setError('') }}
          className={inputCls} inputMode="numeric" />
      </Field>

      <Field label="결제일">
        <select value={paymentDay} onChange={(e) => setPaymentDay(Number(e.target.value))} className={inputCls}>
          {DAYS_OPTIONS.map((d) => <option key={d} value={d}>매월 {d}일</option>)}
        </select>
      </Field>

      <Field label="결제수단">
        <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)} className={inputCls}>
          {PAYMENT_METHODS.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
        </select>
      </Field>

      <Field label="상태">
        <div className="flex gap-2">
          {STATUS_OPTIONS.map((s) => (
            <button key={s.value} onClick={() => setStatus(s.value)}
              className={`flex-1 py-2 rounded-lg text-xs font-medium border transition-colors ${
                status === s.value ? 'bg-blue-500 text-white border-blue-500' : 'text-gray-500 border-gray-200'
              }`}>
              {s.label}
            </button>
          ))}
        </div>
      </Field>

      <Field label="담당자">
        <select value={memberId} onChange={(e) => setMemberId(e.target.value)} className={inputCls}>
          {members.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
        </select>
      </Field>

      <div className="flex items-center justify-between mb-3 py-2">
        <span className="text-sm text-gray-700">캘린더에 표시</span>
        <button onClick={() => setCalendarVisible((v) => !v)}
          className={`w-10 h-6 rounded-full transition-colors ${calendarVisible ? 'bg-blue-500' : 'bg-gray-200'}`}>
          <span className={`block w-4 h-4 bg-white rounded-full shadow transition-transform mx-1 ${calendarVisible ? 'translate-x-4' : 'translate-x-0'}`} />
        </button>
      </div>

      <Field label="메모 (선택)">
        <input type="text" placeholder="메모" value={memo} onChange={(e) => setMemo(e.target.value)} className={inputCls} />
      </Field>

      <FormActions onSave={handleSave} onDelete={subId ? handleDelete : undefined}
        saveLabel={subId ? '수정 완료' : '저장'} />
    </FormModal>
  )
}
