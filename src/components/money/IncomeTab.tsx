import { useState, useMemo } from 'react'
import { incomeRepo } from '../../data/repositories'
import { formatAmount } from '../../utils/date'
import EmptyState from '../common/EmptyState'
import IncomeFormModal from './IncomeFormModal'

interface Props {
  refreshKey: number
  onRefresh: () => void
}

const INCOME_TYPE_LABEL: Record<string, string> = {
  fixed: '고정수입',
  side: '부수입',
  one_time: '일회성',
  other: '기타',
}

export default function IncomeTab({ refreshKey, onRefresh }: Props) {
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  const incomes = useMemo(
    () => incomeRepo.getAll().sort((a, b) => a.income_day - b.income_day),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [refreshKey],
  )

  const monthlyTotal = incomes
    .filter((i) => i.repeat_rule === 'monthly')
    .reduce((s, i) => s + i.amount, 0)

  return (
    <div>
      <div className="px-4 py-3 bg-white border-b border-gray-100 flex justify-between items-center">
        <div>
          <p className="text-xs text-gray-400">월 고정수입 합계</p>
          <p className="text-lg font-bold text-blue-600">{formatAmount(monthlyTotal)}</p>
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
            message="수입 항목이 비어 있습니다"
            sub="월급, 부수입, 일회성 수입을 정리해보세요."
            actionLabel="수입 추가"
            onAction={() => { setEditingId(null); setShowModal(true) }}
          />
        )}
        {incomes.map((i) => (
          <button
            key={i.id}
            onClick={() => { setEditingId(i.id); setShowModal(true) }}
            className="w-full oz-card px-4 py-3 flex items-center gap-3 text-left"
          >
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-800 truncate">{i.title}</p>
              <p className="text-xs text-gray-400 mt-0.5">
                {INCOME_TYPE_LABEL[i.income_type]} · 매월 {i.income_day}일
              </p>
            </div>
            <span className="text-sm font-semibold text-blue-600 flex-shrink-0">
              {formatAmount(i.amount)}
            </span>
          </button>
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
