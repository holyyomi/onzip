import { useMemo, useState } from 'react'
import { todayYear, todayMonth, prevMonth, nextMonth, formatMonthLabel, formatAmount } from '../../utils/date'
import type { QuickAddType } from '../common/QuickAddMenu'
import LedgerTab from '../money/LedgerTab'
import FixedExpenseTab from '../money/FixedExpenseTab'
import IncomeTab from '../money/IncomeTab'
import SubscriptionTab from '../money/SubscriptionTab'
import CalculatorTab from '../money/CalculatorTab'
import TabMemoCard from '../common/TabMemoCard'
import { QUICK_ADD_ICON } from '../../utils/featureIcons'
import { fixedExpenseRepo, incomeRepo, ledgerEntryRepo, subscriptionRepo } from '../../data/repositories'

type MoneySubTab = 'summary' | 'ledger' | 'manage' | 'calculator'
type MoneyManageSubTab = 'fixed' | 'income' | 'subscription'

interface Props {
  externalRefreshKey: number
  onQuickAdd: (type: QuickAddType) => void
}

const SUB_TABS: { value: MoneySubTab; label: string }[] = [
  { value: 'summary', label: '흐름' },
  { value: 'ledger', label: '기록' },
  { value: 'manage', label: '반복돈' },
  { value: 'calculator', label: '계산기' },
]

const MANAGE_TABS: { value: MoneyManageSubTab; label: string }[] = [
  { value: 'income', label: '들어올 돈' },
  { value: 'fixed', label: '나갈 돈' },
  { value: 'subscription', label: '자동결제' },
]

export default function MoneyPage({ externalRefreshKey, onQuickAdd }: Props) {
  const [activeTab, setActiveTab] = useState<MoneySubTab>('summary')
  const [manageTab, setManageTab] = useState<MoneyManageSubTab>('income')
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
          label="나갈 돈"
          sub="카드값, 정산, 생활비"
          onClick={() => onQuickAdd('expense')}
        />
        <MoneyQuickButton
          iconSrc={QUICK_ADD_ICON.income}
          label="들어올 돈"
          sub="월급, 부수입, 받을 돈"
          onClick={() => onQuickAdd('income')}
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
        <FlowSummary year={year} month={month} refreshKey={pageRefreshKey} />
      )}
      {activeTab === 'ledger' && (
        <LedgerTab year={year} month={month} refreshKey={pageRefreshKey} onRefresh={onRefresh} />
      )}
      {activeTab === 'manage' && (
        <>
          <div className="mx-4 mb-2 grid grid-cols-3 gap-2 rounded-[18px] bg-white p-1.5 border border-[#ebebeb]">
            {MANAGE_TABS.map((tab) => (
              <button
                key={tab.value}
                onClick={() => setManageTab(tab.value)}
                className={`min-h-[38px] rounded-[14px] text-sm font-semibold transition-colors ${
                  manageTab === tab.value ? 'bg-[#222222] text-white' : 'text-[#6a6a6a]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          {manageTab === 'fixed' && (
            <FixedExpenseTab refreshKey={pageRefreshKey} onRefresh={onRefresh} />
          )}
          {manageTab === 'income' && (
            <IncomeTab refreshKey={pageRefreshKey} onRefresh={onRefresh} />
          )}
          {manageTab === 'subscription' && (
            <SubscriptionTab refreshKey={pageRefreshKey} onRefresh={onRefresh} />
          )}
        </>
      )}
      {activeTab === 'calculator' && <CalculatorTab />}

      <div className="px-5 py-5">
        <TabMemoCard tab="money" title="흐름 메모" placeholder="받을 돈, 나갈 돈, 잔액 확인 내용을 기록하세요." />
      </div>
    </div>
  )
}

function FlowSummary({ year, month, refreshKey }: { year: number; month: number; refreshKey: number }) {
  const data = useMemo(() => {
    const entries = ledgerEntryRepo.getByMonth(year, month)
    const entryIncome = ledgerEntryRepo.sumByType(entries, 'income')
    const entryExpense = ledgerEntryRepo.sumByType(entries, 'expense')
    const incomes = incomeRepo.getAll().filter((income) => income.repeat_rule === 'monthly')
    const fixedExpenses = fixedExpenseRepo.getActive()
    const subscriptions = subscriptionRepo.getActive()
    const recurringIncome = incomes.reduce((sum, income) => sum + income.amount, 0)
    const fixedOut = fixedExpenses.reduce((sum, expense) => sum + expense.amount, 0)
    const subOut = subscriptions.reduce((sum, sub) => sum + sub.amount, 0)

    const timeline = [
      ...incomes.map((income) => ({
        id: `income_${income.id}`,
        day: income.income_day,
        type: 'in' as const,
        title: income.title,
        amount: income.amount,
      })),
      ...fixedExpenses.map((expense) => ({
        id: `fixed_${expense.id}`,
        day: expense.payment_day,
        type: 'out' as const,
        title: expense.title,
        amount: expense.amount,
      })),
      ...subscriptions.map((sub) => ({
        id: `sub_${sub.id}`,
        day: sub.payment_day,
        type: 'out' as const,
        title: sub.title,
        amount: sub.amount,
      })),
    ].sort((a, b) => a.day - b.day)

    return {
      inTotal: recurringIncome + entryIncome,
      outTotal: fixedOut + subOut + entryExpense,
      entryIncome,
      entryExpense,
      recurringIncome,
      fixedOut,
      subOut,
      timeline,
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [year, month, refreshKey])

  return (
    <div className="p-4 space-y-3">
      <div className="oz-card p-4">
        <p className="text-xs font-semibold text-[#8a8a8a]">이번 달 예상 흐름</p>
        <p className={`mt-1 text-2xl font-bold ${data.inTotal - data.outTotal >= 0 ? 'text-[#222222]' : 'text-red-500'}`}>
          {formatAmount(data.inTotal - data.outTotal)}
        </p>
        <p className="mt-1 text-xs text-[#8a8a8a]">
          들어올 돈 {formatAmount(data.inTotal)} - 나갈 돈 {formatAmount(data.outTotal)}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <FlowStat label="들어올 돈" value={formatAmount(data.inTotal)} tone="in" />
        <FlowStat label="나갈 돈" value={formatAmount(data.outTotal)} tone="out" />
      </div>

      <div className="oz-card p-4">
        <h3 className="text-base font-semibold text-[#222222]">날짜별 돈 흐름</h3>
        <div className="mt-3 divide-y divide-[#f0f0f0]">
          {data.timeline.length === 0 && (
            <p className="py-3 text-sm text-[#8a8a8a]">등록된 반복 수입이나 고정 지출이 없습니다.</p>
          )}
          {data.timeline.slice(0, 8).map((item) => (
            <div key={item.id} className="flex items-center justify-between gap-3 py-3">
              <span className="min-w-0">
                <span className="block text-sm font-semibold text-[#222222]">매월 {item.day}일</span>
                <span className="mt-0.5 block truncate text-xs text-[#8a8a8a]">{item.title}</span>
              </span>
              <span className={`flex-shrink-0 text-sm font-semibold ${item.type === 'in' ? 'text-blue-600' : 'text-red-500'}`}>
                {item.type === 'in' ? '+' : '-'}{formatAmount(item.amount)}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="oz-card p-4">
        <h3 className="text-base font-semibold text-[#222222]">구성</h3>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <MiniFlow label="반복 수입" value={formatAmount(data.recurringIncome)} />
          <MiniFlow label="기록 수입" value={formatAmount(data.entryIncome)} />
          <MiniFlow label="고정 지출" value={formatAmount(data.fixedOut)} />
          <MiniFlow label="구독/자동결제" value={formatAmount(data.subOut)} />
        </div>
      </div>
    </div>
  )
}

function FlowStat({ label, value, tone }: { label: string; value: string; tone: 'in' | 'out' }) {
  return (
    <div className="oz-card p-4">
      <p className="text-xs font-semibold text-[#8a8a8a]">{label}</p>
      <p className={`mt-1 truncate text-lg font-bold ${tone === 'in' ? 'text-blue-600' : 'text-red-500'}`}>
        {value}
      </p>
    </div>
  )
}

function MiniFlow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[16px] bg-[#f7f7f7] px-3 py-2">
      <p className="text-[11px] font-semibold text-[#8a8a8a]">{label}</p>
      <p className="mt-0.5 truncate text-sm font-semibold text-[#222222]">{value}</p>
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
