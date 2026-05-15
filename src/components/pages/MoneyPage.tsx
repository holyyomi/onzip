import { useState } from 'react'
import { todayYear, todayMonth, prevMonth, nextMonth, formatMonthLabel } from '../../utils/date'
import MoneySummaryTab from '../money/MoneySummaryTab'
import LedgerTab from '../money/LedgerTab'
import FixedExpenseTab from '../money/FixedExpenseTab'
import IncomeTab from '../money/IncomeTab'
import SubscriptionTab from '../money/SubscriptionTab'
import CalculatorTab from '../money/CalculatorTab'

type MoneySubTab = 'summary' | 'ledger' | 'fixed' | 'income' | 'subscription' | 'calculator'

const SUB_TABS: { value: MoneySubTab; label: string }[] = [
  { value: 'summary', label: '요약' },
  { value: 'ledger', label: '가계부' },
  { value: 'fixed', label: '고정지출' },
  { value: 'income', label: '수입' },
  { value: 'subscription', label: '구독' },
  { value: 'calculator', label: '계산기' },
]

export default function MoneyPage() {
  const [activeTab, setActiveTab] = useState<MoneySubTab>('summary')
  const [year, setYear] = useState(todayYear())
  const [month, setMonth] = useState(todayMonth())
  const [refreshKey, setRefreshKey] = useState(0)

  const onRefresh = () => setRefreshKey((k) => k + 1)
  const showMonthNav = activeTab === 'summary' || activeTab === 'ledger'

  function handlePrev() {
    const p = prevMonth(year, month)
    setYear(p.year); setMonth(p.month)
  }
  function handleNext() {
    const n = nextMonth(year, month)
    setYear(n.year); setMonth(n.month)
  }

  return (
    <div>
      {/* 서브탭 */}
      <div className="flex overflow-x-auto bg-white border-b border-gray-100 px-2 hide-scrollbar">
        {SUB_TABS.map((t) => (
          <button
            key={t.value}
            onClick={() => setActiveTab(t.value)}
            className={`flex-shrink-0 px-3 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === t.value
                ? 'text-blue-600 border-blue-600'
                : 'text-gray-400 border-transparent'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* 월 네비게이션 (요약 / 가계부 탭) */}
      {showMonthNav && (
        <div className="flex items-center justify-between px-4 py-2 bg-white border-b border-gray-100">
          <button onClick={handlePrev} className="w-8 h-8 flex items-center justify-center text-gray-500 rounded-full hover:bg-gray-100">
            ‹
          </button>
          <span className="text-sm font-semibold text-gray-700">
            {formatMonthLabel(year, month)}
          </span>
          <button onClick={handleNext} className="w-8 h-8 flex items-center justify-center text-gray-500 rounded-full hover:bg-gray-100">
            ›
          </button>
        </div>
      )}

      {/* 탭 컨텐츠 */}
      {activeTab === 'summary' && (
        <MoneySummaryTab year={year} month={month} refreshKey={refreshKey} />
      )}
      {activeTab === 'ledger' && (
        <LedgerTab year={year} month={month} refreshKey={refreshKey} onRefresh={onRefresh} />
      )}
      {activeTab === 'fixed' && (
        <FixedExpenseTab refreshKey={refreshKey} onRefresh={onRefresh} />
      )}
      {activeTab === 'income' && (
        <IncomeTab refreshKey={refreshKey} onRefresh={onRefresh} />
      )}
      {activeTab === 'subscription' && (
        <SubscriptionTab refreshKey={refreshKey} onRefresh={onRefresh} />
      )}
      {activeTab === 'calculator' && <CalculatorTab />}
    </div>
  )
}
