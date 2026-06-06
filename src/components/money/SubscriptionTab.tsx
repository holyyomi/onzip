import { useState, useMemo } from 'react'
import { subscriptionRepo } from '../../data/repositories'
import { PAYMENT_METHOD_LABEL } from '../../utils/constants'
import EmptyState from '../common/EmptyState'
import SubscriptionFormModal from './SubscriptionFormModal'
import { displayAmount, useAmountPrivacy } from '../../utils/amountPrivacy'
import { getSubscriptionMonthStatus, setSubscriptionMonthStatus } from '../../utils/subscriptionMonthStatus'

interface Props {
  year: number
  month: number
  refreshKey: number
  onRefresh: () => void
}

const STATUS_BADGE: Record<string, string> = {
  active: 'bg-green-100 text-green-600',
  considering_cancel: 'bg-yellow-100 text-yellow-600',
  cancelled: 'bg-gray-100 text-gray-400',
}
const STATUS_LABEL: Record<string, string> = {
  active: '사용중',
  considering_cancel: '해지 고민',
  cancelled: '해지',
}

const PAYMENT_STATUS_BADGE: Record<string, string> = {
  pending: 'bg-gray-100 text-gray-500',
  paid: 'bg-purple-100 text-purple-600',
}

const PAYMENT_STATUS_LABEL: Record<string, string> = {
  pending: '예정',
  paid: '결제됨',
}

export default function SubscriptionTab({ year, month, refreshKey, onRefresh }: Props) {
  const { hidden: hideAmounts } = useAmountPrivacy()
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showAll, setShowAll] = useState(false)

  const subscriptions = useMemo(
    () => subscriptionRepo.getAll()
      .map((sub) => ({
        ...sub,
        monthStatus: getSubscriptionMonthStatus(sub, year, month),
      }))
      .sort((a, b) => a.payment_day - b.payment_day),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [year, month, refreshKey],
  )

  const visible = showAll ? subscriptions : subscriptions.filter((s) => s.status !== 'cancelled')
  const monthlyTotal = subscriptionRepo.monthlyTotal()
  const annualTotal = subscriptionRepo.annualTotal()
  const activeSubscriptions = subscriptions.filter((s) => s.status !== 'cancelled')
  const remainingTotal = activeSubscriptions
    .filter((s) => s.monthStatus !== 'paid')
    .reduce((sum, sub) => sum + sub.amount, 0)
  const paidCount = activeSubscriptions.filter((s) => s.monthStatus === 'paid').length

  function togglePaymentStatus(id: string, current: string) {
    setSubscriptionMonthStatus(id, year, month, current === 'paid' ? 'pending' : 'paid')
    onRefresh()
  }

  return (
    <div>
      {/* 상단 요약 */}
      <div className="px-4 py-3 bg-white border-b border-gray-100">
        <div className="flex justify-between items-start mb-1">
          <div>
            <p className="text-xs text-gray-400">이번 달 남은 자동결제</p>
            <p className="text-lg font-bold text-purple-600">{displayAmount(remainingTotal, hideAmounts)}</p>
          </div>
          <button
            onClick={() => { setEditingId(null); setShowModal(true) }}
            className="min-h-[36px] rounded-full border border-[#ffd1da] bg-white px-3 text-sm font-semibold text-[#ff385c]"
          >
            + 추가
          </button>
        </div>
        <p className="text-xs text-gray-400">
          전체 {displayAmount(monthlyTotal, hideAmounts)} · 결제됨 {paidCount}/{activeSubscriptions.length}건 · 연간 {displayAmount(annualTotal, hideAmounts)}
        </p>
      </div>

      {/* 해지 포함 토글 */}
      <div className="px-4 py-2 flex justify-end">
        <button onClick={() => setShowAll((v) => !v)}
          className="text-xs text-gray-400 border border-gray-200 rounded-full px-3 py-1">
          {showAll ? '사용중만 보기' : '해지 포함 보기'}
        </button>
      </div>

      <div className="px-4 pb-4 space-y-2">
        {visible.length === 0 && (
          <EmptyState
            message="구독 항목이 비어 있습니다"
            sub="매달 결제되는 서비스와 해지 고민 중인 항목을 관리해보세요."
            actionLabel="구독 추가"
            onAction={() => { setEditingId(null); setShowModal(true) }}
          />
        )}
        {visible.map((s) => (
          <div key={s.id} className="oz-card px-4 py-3 flex items-center gap-3">
            {s.status !== 'cancelled' && (
              <button
                onClick={() => togglePaymentStatus(s.id, s.monthStatus)}
                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                  s.monthStatus === 'paid'
                    ? 'bg-purple-500 border-purple-500 text-white'
                    : 'border-gray-300'
                }`}
              >
                {s.monthStatus === 'paid' && <span className="text-xs">✓</span>}
              </button>
            )}
            <button
              onClick={() => { setEditingId(s.id); setShowModal(true) }}
              className="flex-1 min-w-0 text-left"
            >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium text-gray-800 truncate">{s.title}</p>
                <span className={`text-xs px-1.5 py-0.5 rounded-full flex-shrink-0 ${STATUS_BADGE[s.status]}`}>
                  {STATUS_LABEL[s.status]}
                </span>
                {s.status !== 'cancelled' && (
                  <span className={`text-xs px-1.5 py-0.5 rounded-full flex-shrink-0 ${PAYMENT_STATUS_BADGE[s.monthStatus]}`}>
                    {PAYMENT_STATUS_LABEL[s.monthStatus]}
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-400 mt-0.5">
                매월 {s.payment_day}일 · {PAYMENT_METHOD_LABEL[s.payment_method]}
                {' · 연 '}{displayAmount(s.amount * 12, hideAmounts)}
              </p>
            </div>
            </button>
            <span className="text-sm font-semibold text-purple-600 flex-shrink-0">
              {displayAmount(s.amount, hideAmounts)}
            </span>
            <span className="text-xs text-gray-300 flex-shrink-0">수정 ›</span>
          </div>
        ))}
      </div>

      {showModal && (
        <SubscriptionFormModal
          subId={editingId}
          onSaved={() => { setShowModal(false); onRefresh() }}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  )
}
