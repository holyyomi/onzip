import { useState } from 'react'
import { todayYear, todayMonth, prevMonth, nextMonth, formatMonthLabel } from '../../utils/date'
import type { QuickAddType } from '../common/QuickAddMenu'
import MoneySummaryTab from '../money/MoneySummaryTab'
import LedgerTab from '../money/LedgerTab'
import FixedExpenseTab from '../money/FixedExpenseTab'
import IncomeTab from '../money/IncomeTab'
import SubscriptionTab from '../money/SubscriptionTab'
import CalculatorTab from '../money/CalculatorTab'
import TabMemoCard from '../common/TabMemoCard'
import { QUICK_ADD_ICON } from '../../utils/featureIcons'

type MoneySubTab = 'summary' | 'ledger' | 'fixed' | 'income' | 'subscription' | 'calculator'

interface Props {
  externalRefreshKey: number
  onQuickAdd: (type: QuickAddType) => void
}

const SUB_TABS: { value: MoneySubTab; label: string }[] = [
  { value: 'summary', label: '한눈에' },
  { value: 'ledger', label: '지출·수입' },
  { value: 'fixed', label: '고정 지출' },
  { value: 'income', label: '수입' },
  { value: 'subscription', label: '구독' },
  { value: 'calculator', label: '계산기' },
]

export default function MoneyPage({ externalRefreshKey, onQuickAdd }: Props) {
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
      <div className="px-4 pt-3 grid grid-cols-2 gap-3">
        <MoneyQuickButton
          iconSrc={QUICK_ADD_ICON.expense}
          label="지출 기록"
          sub="금액과 분류 입력"
          onClick={() => onQuickAdd('expense')}
        />
        <MoneyQuickButton
          iconSrc={QUICK_ADD_ICON.fixed_expense}
          label="고정 지출"
          sub="월세, 관리비, 보험료"
          onClick={() => onQuickAdd('fixed_expense')}
        />
      </div>

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
        <TabMemoCard tab="money" title="가계 메모" placeholder="예산, 카드값, 정산할 내용을 기록하세요." />
      </div>
    </div>
  )
}

function MoneyQuickButton({
  iconSrc,
  label,
  sub,
  onClick,
}: {
  iconSrc: string
  label: string
  sub: string
  onClick: () => void
}) {
  return (
    <button onClick={onClick} className="oz-card min-h-[86px] p-3 text-left active:scale-[0.98] transition flex items-center gap-3">
      <img src={iconSrc} alt="" className="h-11 w-11 rounded-[16px] object-contain flex-shrink-0" />
      <span className="min-w-0">
        <span className="block text-base font-semibold text-[#222222]">{label}</span>
        <span className="block text-xs text-[#6a6a6a] mt-1 leading-snug">{sub}</span>
      </span>
    </button>
  )
}
