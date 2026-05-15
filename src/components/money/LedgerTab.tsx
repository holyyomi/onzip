import { useState, useMemo } from 'react'
import { ledgerEntryRepo, memberRepo } from '../../data/repositories'
import { formatAmount } from '../../utils/date'
import { PAYMENT_METHOD_LABEL } from '../../utils/constants'
import type { LedgerEntryType } from '../../data/models'
import LedgerFormModal from './LedgerFormModal'

interface Props {
  year: number
  month: number
  refreshKey: number
  onRefresh: () => void
}

export default function LedgerTab({ year, month, refreshKey, onRefresh }: Props) {
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

  return (
    <div>
      {/* 월 합계 바 */}
      <div className="flex px-4 py-3 gap-3 bg-white border-b border-gray-100">
        <div className="flex-1 text-center">
          <p className="text-xs text-gray-400">수입</p>
          <p className="text-sm font-semibold text-blue-600">{formatAmount(totalIncome)}</p>
        </div>
        <div className="w-px bg-gray-100" />
        <div className="flex-1 text-center">
          <p className="text-xs text-gray-400">지출</p>
          <p className="text-sm font-semibold text-red-500">{formatAmount(totalExpense)}</p>
        </div>
        <div className="w-px bg-gray-100" />
        <div className="flex-1 text-center">
          <p className="text-xs text-gray-400">합계</p>
          <p
            className={`text-sm font-semibold ${
              totalIncome - totalExpense >= 0 ? 'text-gray-800' : 'text-red-500'
            }`}
          >
            {formatAmount(Math.abs(totalIncome - totalExpense))}
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
          <button onClick={() => openAdd('expense')} className="text-xs text-red-500 border border-red-200 rounded-lg px-2 py-1">
            + 지출
          </button>
          <button onClick={() => openAdd('income')} className="text-xs text-blue-500 border border-blue-200 rounded-lg px-2 py-1">
            + 수입
          </button>
        </div>
      </div>

      {/* 항목 목록 */}
      <div className="p-4 space-y-4">
        {grouped.length === 0 && (
          <div className="text-center py-10 text-sm text-gray-300">
            이번 달 내역이 없습니다
          </div>
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
                  className="w-full bg-white rounded-xl px-4 py-3 flex items-center gap-3 text-left"
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
                    {formatAmount(e.amount)}
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
