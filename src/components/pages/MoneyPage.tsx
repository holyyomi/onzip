import { useState } from 'react'
import { todayYear, todayMonth, prevMonth, nextMonth, formatMonthLabel } from '../../utils/date'
import MoneySummaryTab from '../money/MoneySummaryTab'
import LedgerTab from '../money/LedgerTab'
import FixedExpenseTab from '../money/FixedExpenseTab'
import IncomeTab from '../money/IncomeTab'
import SubscriptionTab from '../money/SubscriptionTab'
import CalculatorTab from '../money/CalculatorTab'
import TabMemoCard from '../common/TabMemoCard'

type MoneySubTab = 'summary' | 'ledger' | 'fixed' | 'income' | 'subscription' | 'calculator'

interface Props {
  externalRefreshKey: number
}

const SUB_TABS: { value: MoneySubTab; label: string }[] = [
  { value: 'summary', label: '한눈에' },
  { value: 'ledger', label: '쓴 돈' },
  { value: 'fixed', label: '매달 돈' },
  { value: 'income', label: '수입' },
  { value: 'subscription', label: '구독' },
  { value: 'calculator', label: '계산기' },
]

export default function MoneyPage({ externalRefreshKey }: Props) {
  const [activeTab, setActiveTab] = useState<MoneySubTab>('summary')
  const [year, setYear] = useState(todayYear())
  const [month, setMonth] = useState(todayMonth())
  const [refreshKey, setRefreshKey] = useState(0)

  const onRefresh = () => setRefreshKey((k) => k + 1)
  const showMonthNav = activeTab === 'summary' || activeTab === 'ledger'
  const pageRefreshKey = refreshKey + externalRefreshKey

  function handlePrev() {
    const p = prevMonth(year, month)
    setYear(p.year)
    setMonth(p.month)
  }

  function handleNext() {
    const n = nextMonth(year, month)
    setYear(n.year)
    setMonth(n.month)
  }

  return (
    <div>
      <div className="oz-tab-strip bg-[#f7f7f7]">
        {SUB_TABS.map((t) => (
          <button
            key={t.value}
            onClick={() => setActiveTab(t.value)}
            className={`oz-sub-tab ${
              activeTab === t.value
                ? 'bg-[#222222] text-white border-[#222222]'
                : 'bg-white text-[#6a6a6a] border-[#dddddd]'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {showMonthNav && (
        <div className="flex items-center justify-between mx-4 mb-2 px-4 py-3 bg-white border border-[#ebebeb] rounded-full">
          <button onClick={handlePrev} className="w-9 h-9 flex items-center justify-center text-[#222222] rounded-full bg-[#f2f2f2]">
            ‹
          </button>
          <span className="text-base font-semibold text-[#222222]">
            {formatMonthLabel(year, month)}
          </span>
          <button onClick={handleNext} className="w-9 h-9 flex items-center justify-center text-[#222222] rounded-full bg-[#f2f2f2]">
            ›
          </button>
        </div>
      )}

      {activeTab === 'summary' && (
        <MoneySummaryTab year={year} month={month} refreshKey={pageRefreshKey} />
      )}
      {activeTab === 'ledger' && (
        <LedgerTab year={year} month={month} refreshKey={pageRefreshKey} onRefresh={onRefresh} />
      )}
      {activeTab === 'fixed' && (
        <FixedExpenseTab refreshKey={pageRefreshKey} onRefresh={onRefresh} />
      )}
      {activeTab === 'income' && (
        <IncomeTab refreshKey={pageRefreshKey} onRefresh={onRefresh} />
      )}
      {activeTab === 'subscription' && (
        <SubscriptionTab refreshKey={pageRefreshKey} onRefresh={onRefresh} />
      )}
      {activeTab === 'calculator' && <CalculatorTab />}

      <div className="px-5 py-5">
        <TabMemoCard tab="money" title="돈 메모" placeholder="이번 달 예산, 카드값, 가족과 나눌 돈 이야기를 적어두세요." />
      </div>
    </div>
  )
}
