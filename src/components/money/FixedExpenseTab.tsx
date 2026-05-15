import { useState, useMemo } from 'react'
import { fixedExpenseRepo } from '../../data/repositories'
import { formatAmount } from '../../utils/date'
import { PAYMENT_METHOD_LABEL } from '../../utils/constants'
import FixedExpenseFormModal from './FixedExpenseFormModal'

interface Props {
  refreshKey: number
  onRefresh: () => void
}

const STATUS_BADGE: Record<string, string> = {
  pending: 'bg-gray-100 text-gray-500',
  done: 'bg-green-100 text-green-600',
  overdue: 'bg-red-100 text-red-500',
}
const STATUS_LABEL: Record<string, string> = {
  pending: '예정',
  done: '완료',
  overdue: '미납',
}

export default function FixedExpenseTab({ refreshKey, onRefresh }: Props) {
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  const expenses = useMemo(
    () => fixedExpenseRepo.getActive().sort((a, b) => a.payment_day - b.payment_day),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [refreshKey],
  )

  const total = expenses.reduce((s, e) => s + e.amount, 0)

  function toggleStatus(id: string, current: string) {
    const next = current === 'done' ? 'pending' : 'done'
    fixedExpenseRepo.update(id, { status: next as 'pending' | 'done' })
    onRefresh()
  }

  return (
    <div>
      {/* 상단 요약 */}
      <div className="px-4 py-3 bg-white border-b border-gray-100 flex justify-between items-center">
        <div>
          <p className="text-xs text-gray-400">이번 달 고정지출 총액</p>
          <p className="text-lg font-bold text-gray-800">{formatAmount(total)}</p>
        </div>
        <button
          onClick={() => { setEditingId(null); setShowModal(true) }}
          className="text-sm text-blue-500 border border-blue-200 rounded-lg px-3 py-1.5"
        >
          + 추가
        </button>
      </div>

      <div className="p-4 space-y-2">
        {expenses.length === 0 && (
          <div className="text-center py-10 text-sm text-gray-300">
            고정지출 항목이 없습니다
          </div>
        )}
        {expenses.map((fe) => (
          <div key={fe.id} className="bg-white rounded-xl px-4 py-3 flex items-center gap-3">
            {/* 납부완료 체크 */}
            <button
              onClick={() => toggleStatus(fe.id, fe.status)}
              className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                fe.status === 'done'
                  ? 'bg-green-500 border-green-500 text-white'
                  : 'border-gray-300'
              }`}
            >
              {fe.status === 'done' && <span className="text-xs">✓</span>}
            </button>

            <button
              onClick={() => { setEditingId(fe.id); setShowModal(true) }}
              className="flex-1 text-left min-w-0"
            >
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium text-gray-800 truncate">{fe.title}</p>
                <span className={`text-xs px-1.5 py-0.5 rounded-full flex-shrink-0 ${STATUS_BADGE[fe.status]}`}>
                  {STATUS_LABEL[fe.status]}
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-0.5">
                매월 {fe.payment_day}일 · {PAYMENT_METHOD_LABEL[fe.payment_method]}
              </p>
            </button>

            <span className="text-sm font-semibold text-gray-800 flex-shrink-0">
              {formatAmount(fe.amount)}
            </span>
          </div>
        ))}
      </div>

      {showModal && (
        <FixedExpenseFormModal
          expenseId={editingId}
          onSaved={() => { setShowModal(false); onRefresh() }}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  )
}
