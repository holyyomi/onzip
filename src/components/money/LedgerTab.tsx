import { useState, useMemo } from 'react'
import { ledgerEntryRepo, memberRepo } from '../../data/repositories'
import { PAYMENT_METHOD_LABEL } from '../../utils/constants'
import { exportLedgerCSV } from '../../utils/csvExport'
import type { LedgerEntryType } from '../../data/models'
import EmptyState from '../common/EmptyState'
import LedgerFormModal from './LedgerFormModal'
import { displayAmount, isAmountHidden, useAmountPrivacy } from '../../utils/amountPrivacy'

interface Props {
  year: number
  month: number
  refreshKey: number
  onRefresh: () => void
}

export default function LedgerTab({ year, month, refreshKey, onRefresh }: Props) {
  const { hidden: hideAmounts } = useAmountPrivacy()
  const [filter, setFilter] = useState<'all' | LedgerEntryType>('all')
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [defaultType, setDefaultType] = useState<LedgerEntryType>('expense')

  const entries = useMemo(() => {
    const all = ledgerEntryRepo.getByMonth(year, month)
    return filter === 'all' ? all : all.filter((e) => e.entry_type === filter)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [year, month, filter, refreshKey])

  const memberNames = useMemo(
    () =>
      memberRepo.getAll().reduce<Record<string, string>>((acc, m) => {
        acc[m.id] = m.name
        return acc
      }, {}),
    [],
  )

  const totalIncome = useMemo(
    () =>
      ledgerEntryRepo
        .getByMonth(year, month)
        .filter((e) => e.entry_type === 'income')
        .reduce((s, e) => s + e.amount, 0),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [year, month, refreshKey],
  )

  const totalExpense = useMemo(
    () =>
      ledgerEntryRepo
        .getByMonth(year, month)
        .filter((e) => e.entry_type === 'expense')
        .reduce((s, e) => s + e.amount, 0),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [year, month, refreshKey],
  )

  // 날짜 내림차순 그룹
  const grouped = useMemo(() => {
    const map: Record<string, typeof entries> = {}
    entries.forEach((e) => {
      if (!map[e.date]) map[e.date] = []
      map[e.date].push(e)
    })
    return Object.keys(map)
      .sort()
      .reverse()
      .map((date) => ({ date, items: map[date] }))
  }, [entries])

  function openAdd(type: LedgerEntryType) {
    setDefaultType(type)
    setEditingId(null)
    setShowModal(true)
  }

  function handleExportCSV() {
    if (
      isAmountHidden() &&
      !confirm('CSV 파일에는 실제 금액이 그대로 포함됩니다. 내려받을까요?')
    ) {
      return
    }

    exportLedgerCSV(ledgerEntryRepo.getByMonth(year, month), `${year}${String(month).padStart(2, '0')}`)
  }

  return (
    <div>
      {/* 월 합계 바 */}
      <div className="flex px-4 py-3 gap-3 bg-white border-b border-gray-100">
        <div className="flex-1 text-center">
          <p className="text-xs text-gray-400">수입</p>
          <p className="text-sm font-semibold text-blue-600">{displayAmount(totalIncome, hideAmounts)}</p>
        </div>
        <div className="w-px bg-gray-100" />
        <div className="flex-1 text-center">
          <p className="text-xs text-gray-400">지출</p>
          <p className="text-sm font-semibold text-red-500">{displayAmount(totalExpense, hideAmounts)}</p>
        </div>
        <div className="w-px bg-gray-100" />
        <div className="flex-1 text-center">
          <p className="text-xs text-gray-400">합계</p>
          <p
            className={`text-sm font-semibold ${
              totalIncome - totalExpense >= 0 ? 'text-gray-800' : 'text-red-500'
            }`}
          >
            {displayAmount(Math.abs(totalIncome - totalExpense), hideAmounts)}
          </p>
        </div>
      </div>

      {/* 필터 + 추가 버튼 */}
      <div className="flex items-center justify-between px-4 py-2 bg-white border-b border-gray-100">
        <div className="flex gap-1">
          {(['all', 'expense', 'income'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                filter === f
                  ? 'bg-gray-800 text-white'
                  : 'text-gray-400 border border-gray-200'
              }`}
            >
              {f === 'all' ? '전체' : f === 'expense' ? '지출' : '수입'}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleExportCSV}
            className="text-xs text-gray-400 border border-gray-200 rounded-lg px-2 py-1">
            CSV↓
          </button>
          <button onClick={() => openAdd('expense')} className="text-xs text-red-500 border border-red-200 rounded-lg px-2 py-1">
            + 지출
          </button>
          <button onClick={() => openAdd('income')} className="text-xs text-[#ff385c] border border-[#ffd1da] rounded-lg px-2 py-1">
            + 수입
          </button>
        </div>
      </div>

      {/* 항목 목록 */}
      <div className="p-4 space-y-4">
        {grouped.length === 0 && (
          <EmptyState
            message="이번 달 가계 내역이 비어 있습니다"
            sub="지출이나 수입을 기록하면 월간 흐름을 바로 확인할 수 있습니다."
            actionLabel="지출 기록 추가"
            onAction={() => openAdd('expense')}
          />
        )}

        {grouped.map(({ date, items }) => (
          <div key={date}>
            <p className="text-xs text-gray-400 mb-2">
              {date.replace(/-/g, '. ')}
            </p>
            <div className="space-y-2">
              {items.map((e) => (
                <button
                  key={e.id}
                  onClick={() => { setEditingId(e.id); setShowModal(true) }}
                  className="w-full oz-card px-4 py-3 flex items-center gap-3 text-left"
                >
                  <span
                    className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      e.entry_type === 'expense'
                        ? 'bg-red-50 text-red-500'
                        : 'bg-blue-50 text-blue-500'
                    }`}
                  >
                    {e.entry_type === 'expense' ? '지출' : '수입'}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">
                      {e.category}
                    </p>
                    <p className="text-xs text-gray-400 truncate">
                      {e.payment_method ? PAYMENT_METHOD_LABEL[e.payment_method] : ''}
                      {e.memo ? ` · ${e.memo}` : ''}
                      {e.member_id ? ` · ${memberNames[e.member_id] ?? ''}` : ''}
                    </p>
                  </div>
                  <span
                    className={`text-sm font-semibold flex-shrink-0 ${
                      e.entry_type === 'expense' ? 'text-gray-800' : 'text-blue-600'
                    }`}
                  >
                    {e.entry_type === 'income' ? '+' : '-'}
                    {displayAmount(e.amount, hideAmounts)}
                  </span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <LedgerFormModal
          entryId={editingId}
          defaultDate={`${year}-${String(month).padStart(2, '0')}-01`}
          defaultType={defaultType}
          onSaved={() => { setShowModal(false); onRefresh() }}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  )
}
