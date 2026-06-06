import { useState, useMemo } from 'react'
import { ledgerEntryRepo, memberRepo } from '../../data/repositories'
import { PAYMENT_METHOD_LABEL } from '../../utils/constants'
import type { LedgerEntryType } from '../../data/models'
import EmptyState from '../common/EmptyState'
import LedgerFormModal from './LedgerFormModal'
import { displayAmount, useAmountPrivacy } from '../../utils/amountPrivacy'
import { displaySecretText, useVaultPrivacy } from '../../utils/vaultPrivacy'
import { todayStr, todayYear, todayMonth } from '../../utils/date'

interface CategoryBar {
  category: string
  amount: number
  percent: number
}

interface Props {
  year: number
  month: number
  refreshKey: number
  onRefresh: () => void
}

export default function LedgerTab({ year, month, refreshKey, onRefresh }: Props) {
  const { hidden: hideAmounts } = useAmountPrivacy()
  const { hidden: hideSecret } = useVaultPrivacy()
  const [filter, setFilter] = useState<'all' | LedgerEntryType>('all')
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [defaultType, setDefaultType] = useState<LedgerEntryType>('expense')

  const monthEntries = useMemo(
    () => ledgerEntryRepo.getByMonth(year, month),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [year, month, refreshKey],
  )

  const entries = useMemo(() => {
    return filter === 'all' ? monthEntries : monthEntries.filter((e) => e.entry_type === filter)
  }, [filter, monthEntries])

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
      monthEntries
        .filter((entry) => entry.entry_type === 'income')
        .reduce((sum, entry) => sum + entry.amount, 0),
    [monthEntries],
  )

  const totalExpense = useMemo(
    () =>
      monthEntries
        .filter((entry) => entry.entry_type === 'expense')
        .reduce((sum, entry) => sum + entry.amount, 0),
    [monthEntries],
  )

  const categoryChart = useMemo(
    () => ({
      expense: buildCategoryBars(monthEntries, 'expense'),
      income: buildCategoryBars(monthEntries, 'income'),
    }),
    [monthEntries],
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

  const addDefaultDate =
    year === todayYear() && month === todayMonth()
      ? todayStr()
      : `${year}-${String(month).padStart(2, '0')}-01`

  function openAdd(type: LedgerEntryType) {
    setDefaultType(type)
    setEditingId(null)
    setShowModal(true)
  }

  return (
    <div>
      {/* 월 합계 바 */}
      <div className="flex items-center px-4 py-3 gap-3 bg-white border-b border-gray-100">
        <div className="flex-1 text-center">
          <p className="text-xs text-gray-400">수입</p>
          <p className="text-sm font-semibold text-blue-600">{displayAmount(totalIncome, hideAmounts)}</p>
        </div>
        <div className="w-px self-stretch bg-gray-100" />
        <div className="flex-1 text-center">
          <p className="text-xs text-gray-400">지출</p>
          <p className="text-sm font-semibold text-red-500">{displayAmount(totalExpense, hideAmounts)}</p>
        </div>
        <div className="w-px self-stretch bg-gray-100" />
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
        <div className="w-px self-stretch bg-gray-100" />
        <div className="flex flex-col gap-1.5">
          <button
            onClick={() => openAdd('income')}
            className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600"
          >
            + 수입
          </button>
          <button
            onClick={() => openAdd('expense')}
            className="rounded-full border border-[#ffd1da] bg-[#fff0f3] px-3 py-1 text-xs font-semibold text-[#ff385c]"
          >
            + 지출
          </button>
        </div>
      </div>

      <LedgerCategoryChart
        expenseBars={categoryChart.expense}
        incomeBars={categoryChart.income}
        hideAmounts={hideAmounts}
      />

      {/* 필터 */}
      <div className="flex items-center px-4 py-2 bg-white border-b border-gray-100">
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
      </div>

      {/* 항목 목록 */}
      <div className="p-4 space-y-4">
        {grouped.length === 0 && (
          <EmptyState
            message="이번 달 가계 내역이 비어 있습니다"
            sub="지출이나 수입을 기록하면 월간 가계부를 바로 확인할 수 있습니다."
            actionLabel="지출 추가"
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
                    className={`text-xs font-medium px-2 py-0.5 rounded-full flex-shrink-0 ${
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
                      {e.memo ? ` · ${displaySecretText(e.memo, e.memo_is_secret, hideSecret)}` : ''}
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
                  <span className="text-xs text-gray-300 flex-shrink-0">수정 ›</span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <LedgerFormModal
          entryId={editingId}
          defaultDate={addDefaultDate}
          defaultType={defaultType}
          onSaved={() => { setShowModal(false); onRefresh() }}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  )
}

function buildCategoryBars(entries: ReturnType<typeof ledgerEntryRepo.getByMonth>, type: LedgerEntryType): CategoryBar[] {
  const totals = entries
    .filter((entry) => entry.entry_type === type)
    .reduce<Record<string, number>>((acc, entry) => {
      const category = entry.category || '기타'
      acc[category] = (acc[category] ?? 0) + entry.amount
      return acc
    }, {})

  const rows = Object.entries(totals)
    .map(([category, amount]) => ({ category, amount }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 6)
  const maxAmount = rows[0]?.amount ?? 0

  return rows.map((row) => ({
    ...row,
    percent: maxAmount > 0 ? Math.max(8, Math.round((row.amount / maxAmount) * 100)) : 0,
  }))
}

function LedgerCategoryChart({
  expenseBars,
  incomeBars,
  hideAmounts,
}: {
  expenseBars: CategoryBar[]
  incomeBars: CategoryBar[]
  hideAmounts: boolean
}) {
  return (
    <section className="border-b border-gray-100 bg-white px-4 py-4">
      <div className="mb-3 flex items-end justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-base font-semibold text-[#222222]">카테고리 한눈에</h3>
          <p className="mt-0.5 text-xs text-[#8a8a8a]">이번 달 상세내역 상위 항목</p>
        </div>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <CategoryBarGroup
          title="지출"
          bars={expenseBars}
          hideAmounts={hideAmounts}
          tone="expense"
        />
        <CategoryBarGroup
          title="수입"
          bars={incomeBars}
          hideAmounts={hideAmounts}
          tone="income"
        />
      </div>
    </section>
  )
}

function CategoryBarGroup({
  title,
  bars,
  hideAmounts,
  tone,
}: {
  title: string
  bars: CategoryBar[]
  hideAmounts: boolean
  tone: LedgerEntryType
}) {
  const barColor = tone === 'expense' ? 'bg-[#ff385c]' : 'bg-blue-500'
  const titleColor = tone === 'expense' ? 'text-[#ff385c]' : 'text-blue-600'

  return (
    <div>
      <p className={`text-sm font-semibold ${titleColor}`}>{title}</p>
      <div className="mt-3 space-y-3">
        {bars.length === 0 && (
          <p className="rounded-lg bg-[#f7f7f7] px-3 py-3 text-xs text-[#8a8a8a]">등록된 항목이 없습니다.</p>
        )}
        {bars.map((bar) => (
          <div key={bar.category}>
            <div className="flex items-center justify-between gap-2">
              <span className="min-w-0 truncate text-sm font-medium text-[#222222]">{bar.category}</span>
              <span className="flex-shrink-0 text-xs font-semibold text-[#6a6a6a]">
                {displayAmount(bar.amount, hideAmounts)}
              </span>
            </div>
            <div className="mt-1.5 h-2.5 overflow-hidden rounded-full bg-[#f2f2f2]">
              <div className={`h-full rounded-full ${barColor}`} style={{ width: `${bar.percent}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
