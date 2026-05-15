import { useState, useMemo } from 'react'
import { subscriptionRepo } from '../../data/repositories'
import { formatAmount } from '../../utils/date'
import { PAYMENT_METHOD_LABEL } from '../../utils/constants'
import SubscriptionFormModal from './SubscriptionFormModal'

interface Props {
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

export default function SubscriptionTab({ refreshKey, onRefresh }: Props) {
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showAll, setShowAll] = useState(false)

  const subscriptions = useMemo(
    () => subscriptionRepo.getAll().sort((a, b) => a.payment_day - b.payment_day),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [refreshKey],
  )

  const visible = showAll ? subscriptions : subscriptions.filter((s) => s.status !== 'cancelled')
  const monthlyTotal = subscriptionRepo.monthlyTotal()
  const annualTotal = subscriptionRepo.annualTotal()

  return (
    <div>
      {/* 상단 요약 */}
      <div className="px-4 py-3 bg-white border-b border-gray-100">
        <div className="flex justify-between items-start mb-1">
          <div>
            <p className="text-xs text-gray-400">월 구독료 합계</p>
            <p className="text-lg font-bold text-purple-600">{formatAmount(monthlyTotal)}</p>
          </div>
          <button
            onClick={() => { setEditingId(null); setShowModal(true) }}
            className="text-sm text-blue-500 border border-blue-200 rounded-lg px-3 py-1.5"
          >
            + 추가
          </button>
        </div>
        <p className="text-xs text-gray-400">
          연간 {formatAmount(annualTotal)} · 해지 시 절약 가능
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
          <div className="text-center py-10 text-sm text-gray-300">구독 항목이 없습니다</div>
        )}
        {visible.map((s) => (
          <button
            key={s.id}
            onClick={() => { setEditingId(s.id); setShowModal(true) }}
            className="w-full bg-white rounded-xl px-4 py-3 flex items-center gap-3 text-left"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium text-gray-800 truncate">{s.title}</p>
                <span className={`text-xs px-1.5 py-0.5 rounded-full flex-shrink-0 ${STATUS_BADGE[s.status]}`}>
                  {STATUS_LABEL[s.status]}
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-0.5">
                매월 {s.payment_day}일 · {PAYMENT_METHOD_LABEL[s.payment_method]}
                {' · 연 '}{formatAmount(s.amount * 12)}
              </p>
            </div>
            <span className="text-sm font-semibold text-purple-600 flex-shrink-0">
              {formatAmount(s.amount)}
            </span>
          </button>
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
