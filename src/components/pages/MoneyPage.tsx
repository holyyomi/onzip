import { useMemo, useState } from 'react'
import { todayYear, todayMonth, prevMonth, nextMonth, formatMonthLabel } from '../../utils/date'
import type { QuickAddType } from '../common/QuickAddMenu'
import LedgerTab from '../money/LedgerTab'
import FixedExpenseTab from '../money/FixedExpenseTab'
import IncomeTab from '../money/IncomeTab'
import SubscriptionTab from '../money/SubscriptionTab'
import CalculatorTab from '../money/CalculatorTab'
import TabMemoCard from '../common/TabMemoCard'
import { QUICK_ADD_ICON } from '../../utils/featureIcons'
import { fixedExpenseRepo, incomeRepo, ledgerEntryRepo, subscriptionRepo } from '../../data/repositories'
import { displayAmount, useAmountPrivacy } from '../../utils/amountPrivacy'

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
  const { hidden: hideAmounts } = useAmountPrivacy()
  const data = useMemo(() => {
    const isCurrentMonthView = year === todayYear() && month === todayMonth()
    const todayDay = new Date().getDate()
    const entries = ledgerEntryRepo.getByMonth(year, month)
    const entryIncome = ledgerEntryRepo.sumByType(entries, 'income')
    const entryExpense = ledgerEntryRepo.sumByType(entries, 'expense')
    const incomes = incomeRepo.getAll().filter((income) => income.repeat_rule === 'monthly')
    const fixedExpenses = fixedExpenseRepo.getActive()
    const subscriptions = subscriptionRepo.getActive()
    const recurringIncome = incomes.reduce((sum, income) => sum + income.amount, 0)
    const fixedOut = fixedExpenses.reduce((sum, expense) => sum + expense.amount, 0)
    const subOut = subscriptions.reduce((sum, sub) => sum + sub.amount, 0)
    const salaryIncome = incomes
      .filter((income) => income.income_type === 'fixed')
      .reduce((sum, income) => sum + income.amount, 0)
    const sideIncome = incomes
      .filter((income) => income.income_type === 'side')
      .reduce((sum, income) => sum + income.amount, 0)
    const otherRecurringIncome = Math.max(0, recurringIncome - salaryIncome - sideIncome)
    const cardOut = fixedExpenses
      .filter((expense) => expense.category === '카드')
      .reduce((sum, expense) => sum + expense.amount, 0)
    const fixedOtherOut = Math.max(0, fixedOut - cardOut)

    const timeline = [
      ...incomes.map((income) => ({
        id: `income_${income.id}`,
        day: income.income_day,
        type: 'in' as const,
        label: '받을 돈',
        title: income.title,
        amount: income.amount,
      })),
      ...fixedExpenses.map((expense) => ({
        id: `fixed_${expense.id}`,
        day: expense.payment_day,
        type: 'out' as const,
        label: expense.category === '카드' ? '카드값' : '줄 돈',
        title: expense.title,
        amount: expense.amount,
      })),
      ...subscriptions.map((sub) => ({
        id: `sub_${sub.id}`,
        day: sub.payment_day,
        type: 'out' as const,
        label: '자동결제',
        title: sub.title,
        amount: sub.amount,
      })),
    ].sort((a, b) => {
      if (!isCurrentMonthView) return a.day - b.day
      return getMoneyDayDistance(a.day, todayDay) - getMoneyDayDistance(b.day, todayDay)
    })

    return {
      isCurrentMonthView,
      todayDay,
      inTotal: recurringIncome + entryIncome,
      outTotal: fixedOut + subOut + entryExpense,
      entryIncome,
      entryExpense,
      salaryIncome,
      sideIncome,
      otherRecurringIncome,
      cardOut,
      fixedOtherOut,
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
          {displayAmount(data.inTotal - data.outTotal, hideAmounts)}
        </p>
        <p className="mt-1 text-xs text-[#8a8a8a]">
          들어올 돈 {displayAmount(data.inTotal, hideAmounts)} - 나갈 돈 {displayAmount(data.outTotal, hideAmounts)}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <FlowStat label="들어올 돈" value={displayAmount(data.inTotal, hideAmounts)} tone="in" />
        <FlowStat label="나갈 돈" value={displayAmount(data.outTotal, hideAmounts)} tone="out" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <FlowBreakdownCard
          title="받을 돈"
          tone="in"
          items={[
            { label: '월급/고정', value: data.salaryIncome },
            { label: '부수입', value: data.sideIncome },
            { label: '기타 반복', value: data.otherRecurringIncome },
            { label: '이번 달 기록', value: data.entryIncome },
          ]}
          hideAmounts={hideAmounts}
        />
        <FlowBreakdownCard
          title="줄 돈"
          tone="out"
          items={[
            { label: '카드값', value: data.cardOut },
            { label: '고정지출', value: data.fixedOtherOut },
            { label: '자동결제', value: data.subOut },
            { label: '이번 달 기록', value: data.entryExpense },
          ]}
          hideAmounts={hideAmounts}
        />
      </div>

      <div className="oz-card p-4">
        <div>
          <h3 className="text-base font-semibold text-[#222222]">날짜별 돈 흐름</h3>
          {data.isCurrentMonthView && (
            <p className="mt-0.5 text-xs text-[#8a8a8a]">오늘 이후 챙길 돈이 먼저 보입니다.</p>
          )}
        </div>
        <div className="mt-3 divide-y divide-[#f0f0f0]">
          {data.timeline.length === 0 && (
            <p className="py-3 text-sm text-[#8a8a8a]">등록된 반복 수입이나 고정 지출이 없습니다.</p>
          )}
          {data.timeline.slice(0, 8).map((item) => {
            const dayStatus = getMoneyDayStatus(item.day, data.isCurrentMonthView, data.todayDay)
            return (
              <div key={item.id} className="flex items-center justify-between gap-3 py-3">
                <span className="min-w-0">
                  <span className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-semibold text-[#222222]">매월 {item.day}일</span>
                    <span className={`rounded-full px-1.5 py-0.5 text-xs font-semibold ${
                      item.type === 'in' ? 'bg-blue-50 text-blue-600' : 'bg-[#fff0f3] text-[#ff385c]'
                    }`}>
                      {item.label}
                    </span>
                    {dayStatus && (
                      <span className={`rounded-full px-1.5 py-0.5 text-xs font-semibold ${dayStatus.cls}`}>
                        {dayStatus.label}
                      </span>
                    )}
                  </span>
                  <span className="mt-0.5 block truncate text-xs text-[#8a8a8a]">{item.title}</span>
                </span>
                <span className={`flex-shrink-0 text-sm font-semibold ${item.type === 'in' ? 'text-blue-600' : 'text-red-500'}`}>
                  {item.type === 'in' ? '+' : '-'}{displayAmount(item.amount, hideAmounts)}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function getMoneyDayDistance(day: number, todayDay: number): number {
  return day >= todayDay ? day - todayDay : day + 31 - todayDay
}

function getMoneyDayStatus(day: number, isCurrentMonthView: boolean, todayDay: number): { label: string; cls: string } | null {
  if (!isCurrentMonthView) return null
  if (day === todayDay) return { label: '오늘', cls: 'bg-[#222222] text-white' }
  if (day > todayDay) return { label: `D-${day - todayDay}`, cls: 'bg-gray-100 text-gray-600' }
  return { label: '지남', cls: 'bg-gray-50 text-gray-400' }
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

function FlowBreakdownCard({
  title,
  tone,
  items,
  hideAmounts,
}: {
  title: string
  tone: 'in' | 'out'
  items: { label: string; value: number }[]
  hideAmounts: boolean
}) {
  const visibleItems = items.filter((item) => item.value > 0)

  return (
    <div className="oz-card p-4">
      <p className={`text-sm font-semibold ${tone === 'in' ? 'text-blue-600' : 'text-red-500'}`}>{title}</p>
      <div className="mt-3 space-y-2">
        {visibleItems.length === 0 && (
          <p className="text-xs text-[#8a8a8a]">등록된 항목이 없습니다.</p>
        )}
        {visibleItems.map((item) => (
          <div key={item.label} className="flex items-center justify-between gap-2">
            <span className="truncate text-xs text-[#6a6a6a]">{item.label}</span>
            <span className="flex-shrink-0 text-xs font-semibold text-[#222222]">
              {displayAmount(item.value, hideAmounts)}
            </span>
          </div>
        ))}
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
