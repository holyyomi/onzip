import { useState, useMemo } from 'react'
import { incomeRepo } from '../../data/repositories'
import EmptyState from '../common/EmptyState'
import IncomeFormModal from './IncomeFormModal'
import { displayAmount, useAmountPrivacy } from '../../utils/amountPrivacy'
import { getIncomeMonthStatus, setIncomeMonthStatus } from '../../utils/incomeMonthStatus'

interface Props {
  year: number
  month: number
  refreshKey: number
  onRefresh: () => void
}

const INCOME_TYPE_LABEL: Record<string, string> = {
  fixed: '정기 수입',
  side: '부가 수입',
  one_time: '일회성 수입',
  other: '기타 수입',
}

const STATUS_BADGE: Record<string, string> = {
  pending: 'bg-gray-100 text-gray-500',
  received: 'bg-blue-100 text-blue-600',
}

const STATUS_LABEL: Record<string, string> = {
  pending: '입금 예정',
  received: '입금 완료',
}

export default function IncomeTab({ year, month, refreshKey, onRefresh }: Props) {
  const { hidden: hideAmounts } = useAmountPrivacy()
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  const incomes = useMemo(
    () => incomeRepo.getAll()
      .map((income) => ({
        ...income,
        monthStatus: getIncomeMonthStatus(income, year, month),
      }))
      .sort((a, b) => a.income_day - b.income_day),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [year, month, refreshKey],
  )

  const monthlyTotal = incomes
    .filter((i) => i.repeat_rule === 'monthly')
    .reduce((s, i) => s + i.amount, 0)
  const remainingTotal = incomes
    .filter((i) => i.repeat_rule === 'monthly' && i.monthStatus !== 'received')
    .reduce((s, i) => s + i.amount, 0)
  const receivedCount = incomes.filter((i) => i.repeat_rule === 'monthly' && i.monthStatus === 'received').length
  const monthlyCount = incomes.filter((i) => i.repeat_rule === 'monthly').length

  function toggleStatus(id: string, current: string) {
    setIncomeMonthStatus(id, year, month, current === 'received' ? 'pending' : 'received')
    onRefresh()
  }

  return (
    <div>
      <div className="px-4 py-3 bg-white border-b border-gray-100 flex justify-between items-center">
        <div>
          <p className="text-xs text-gray-400">이번 달 남은 수입</p>
          <p className="text-lg font-bold text-blue-600">{displayAmount(remainingTotal, hideAmounts)}</p>
          <p className="mt-0.5 text-xs text-gray-400">
            전체 {displayAmount(monthlyTotal, hideAmounts)} · 입금 완료 {receivedCount}/{monthlyCount}건
          </p>
        </div>
        <button
          onClick={() => { setEditingId(null); setShowModal(true) }}
          className="min-h-[36px] rounded-full border border-[#ffd1da] bg-white px-3 text-sm font-semibold text-[#ff385c]"
        >
          + 추가
        </button>
      </div>

      <div className="p-4 space-y-2">
        {incomes.length === 0 && (
          <EmptyState
            message="수입이 비어 있습니다"
            sub="월급, 부가 수입, 일회성 수입을 정리해보세요."
            actionLabel="수입 추가"
            onAction={() => { setEditingId(null); setShowModal(true) }}
          />
        )}
        {incomes.map((i) => (
          <div key={i.id} className="oz-card px-4 py-3 flex items-center gap-3">
            <button
              onClick={() => toggleStatus(i.id, i.monthStatus)}
              className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                i.monthStatus === 'received'
                  ? 'bg-blue-500 border-blue-500 text-white'
                  : 'border-gray-300'
              }`}
            >
              {i.monthStatus === 'received' && <span className="text-xs">✓</span>}
            </button>
            <button
              onClick={() => { setEditingId(i.id); setShowModal(true) }}
              className="flex-1 min-w-0 text-left"
            >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium text-gray-800 truncate">{i.title}</p>
                <span className={`text-xs px-1.5 py-0.5 rounded-full flex-shrink-0 ${STATUS_BADGE[i.monthStatus]}`}>
                  {STATUS_LABEL[i.monthStatus]}
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-0.5">
                {INCOME_TYPE_LABEL[i.income_type]} · 매월 {i.income_day}일
              </p>
            </div>
            </button>
            <span className="text-sm font-semibold text-blue-600 flex-shrink-0">
              {displayAmount(i.amount, hideAmounts)}
            </span>
            <span className="text-xs text-gray-300 flex-shrink-0">수정 ›</span>
          </div>
        ))}
      </div>

      {showModal && (
        <IncomeFormModal
          incomeId={editingId}
          onSaved={() => { setShowModal(false); onRefresh() }}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  )
}
