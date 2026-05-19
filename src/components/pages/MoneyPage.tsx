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
import {
  getFixedExpenseMonthStatus,
  isCurrentFixedExpenseMonth,
  setFixedExpenseMonthStatus,
} from '../../utils/fixedExpenseMonthStatus'

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
        <FlowSummary year={year} month={month} refreshKey={pageRefreshKey} onRefresh={onRefresh} />
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
            <FixedExpenseTab year={year} month={month} refreshKey={pageRefreshKey} onRefresh={onRefresh} />
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

function FlowSummary({
  year,
  month,
  refreshKey,
  onRefresh,
}: {
  year: number
  month: number
  refreshKey: number
  onRefresh: () => void
}) {
  const { hidden: hideAmounts } = useAmountPrivacy()
  const data = useMemo(() => {
    const isCurrentMonthView = year === todayYear() && month === todayMonth()
    const todayDay = new Date().getDate()
    const entries = ledgerEntryRepo.getByMonth(year, month)
    const entryIncome = ledgerEntryRepo.sumByType(entries, 'income')
    const entryExpense = ledgerEntryRepo.sumByType(entries, 'expense')
    const upcomingEntryIncome = isCurrentMonthView
      ? entries
          .filter((entry) => entry.entry_type === 'income' && Number(entry.date.slice(-2)) >= todayDay)
          .reduce((sum, entry) => sum + entry.amount, 0)
      : 0
    const upcomingEntryExpense = isCurrentMonthView
      ? entries
          .filter((entry) => entry.entry_type === 'expense' && Number(entry.date.slice(-2)) >= todayDay)
          .reduce((sum, entry) => sum + entry.amount, 0)
      : 0
    const incomes = incomeRepo.getAll().filter((income) => income.repeat_rule === 'monthly')
    const fixedExpenses = fixedExpenseRepo.getActive()
    const fixedExpensesWithStatus = fixedExpenses.map((expense) => ({
      ...expense,
      monthStatus: getFixedExpenseMonthStatus(expense, year, month),
    }))
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
    const overdueFixedExpenses = isCurrentMonthView
      ? fixedExpensesWithStatus.filter((expense) => expense.monthStatus !== 'done' && expense.payment_day < todayDay)
      : []
    const overdueFixedOut = overdueFixedExpenses.reduce((sum, expense) => sum + expense.amount, 0)
    const upcomingIncome = isCurrentMonthView
      ? incomes
          .filter((income) => income.income_day >= todayDay)
          .reduce((sum, income) => sum + income.amount, 0) + upcomingEntryIncome
      : 0
    const upcomingOut = isCurrentMonthView
      ? fixedExpensesWithStatus
          .filter((expense) => expense.monthStatus !== 'done')
          .reduce((sum, expense) => sum + expense.amount, 0) +
        subscriptions
          .filter((sub) => sub.payment_day >= todayDay)
          .reduce((sum, sub) => sum + sub.amount, 0) +
        upcomingEntryExpense
      : 0

    const timeline = [
      ...incomes.map((income) => ({
        id: `income_${income.id}`,
        day: income.income_day,
        type: 'in' as const,
        source: 'income' as const,
        sourceId: income.id,
        label: '받을 돈',
        paymentState: null,
        priority: getMoneyDayDistance(income.income_day, todayDay),
        title: income.title,
        amount: income.amount,
      })),
      ...fixedExpensesWithStatus.map((expense) => {
        const paymentState = getFixedPaymentState(expense.monthStatus, expense.payment_day, isCurrentMonthView, todayDay)
        return {
          id: `fixed_${expense.id}`,
          day: expense.payment_day,
          type: 'out' as const,
          source: 'fixed' as const,
          sourceId: expense.id,
          label: expense.category === '카드' ? '카드값' : '줄 돈',
          paymentState,
          priority: paymentState?.kind === 'overdue' ? -1 : getMoneyDayDistance(expense.payment_day, todayDay),
          title: expense.title,
          amount: expense.amount,
        }
      }),
      ...subscriptions.map((sub) => ({
        id: `sub_${sub.id}`,
        day: sub.payment_day,
        type: 'out' as const,
        source: 'subscription' as const,
        sourceId: sub.id,
        label: '자동결제',
        paymentState: null,
        priority: getMoneyDayDistance(sub.payment_day, todayDay),
        title: sub.title,
        amount: sub.amount,
      })),
    ].sort((a, b) => {
      if (!isCurrentMonthView) return a.day - b.day
      return a.priority - b.priority
    })

    return {
      isCurrentMonthView,
      todayDay,
      inTotal: recurringIncome + entryIncome,
      outTotal: fixedOut + subOut + entryExpense,
      entryIncome,
      entryExpense,
      upcomingIncome,
      upcomingOut,
      overdueFixedCount: overdueFixedExpenses.length,
      overdueFixedOut,
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

  function handleSetFixedStatus(id: string, done: boolean) {
    const status = done ? 'done' : 'pending'
    setFixedExpenseMonthStatus(id, year, month, status)
    if (isCurrentFixedExpenseMonth(year, month)) {
      fixedExpenseRepo.update(id, { status })
    }
    onRefresh()
  }

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
        {data.isCurrentMonthView && (
          <div className="mt-4 grid grid-cols-3 gap-2">
            <RemainingFlowPill label="남은 받을" value={displayAmount(data.upcomingIncome, hideAmounts)} />
            <RemainingFlowPill label="남은 나갈" value={displayAmount(data.upcomingOut, hideAmounts)} />
            <RemainingFlowPill
              label="남은 차이"
              value={displayAmount(data.upcomingIncome - data.upcomingOut, hideAmounts)}
              negative={data.upcomingIncome - data.upcomingOut < 0}
            />
          </div>
        )}
        {data.isCurrentMonthView && data.overdueFixedCount > 0 && (
          <p className="mt-3 rounded-[16px] bg-[#fff0f3] px-3 py-2 text-xs font-semibold text-[#ff385c]">
            아직 완료하지 않은 나갈 돈 {data.overdueFixedCount}건, {displayAmount(data.overdueFixedOut, hideAmounts)}이 있습니다.
          </p>
        )}
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
                    {item.paymentState && (
                      <span className={`rounded-full px-1.5 py-0.5 text-xs font-semibold ${item.paymentState.cls}`}>
                        {item.paymentState.label}
                      </span>
                    )}
                  </span>
                  <span className="mt-0.5 block truncate text-xs text-[#8a8a8a]">{item.title}</span>
                </span>
                <span className="flex flex-shrink-0 items-center gap-2">
                  <span className={`text-sm font-semibold ${item.type === 'in' ? 'text-blue-600' : 'text-red-500'}`}>
                    {item.type === 'in' ? '+' : '-'}{displayAmount(item.amount, hideAmounts)}
                  </span>
                  {item.source === 'fixed' && (
                    <button
                      onClick={() => handleSetFixedStatus(item.sourceId, item.paymentState?.kind !== 'done')}
                      className={`min-h-[30px] rounded-full border px-2 text-xs font-semibold ${
                        item.paymentState?.kind === 'done'
                          ? 'border-green-200 bg-green-50 text-green-700'
                          : 'border-[#dddddd] bg-white text-[#222222]'
                      }`}
                    >
                      {item.paymentState?.kind === 'done' ? '취소' : '완료'}
                    </button>
                  )}
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

function getFixedPaymentState(
  status: string,
  day: number,
  isCurrentMonthView: boolean,
  todayDay: number,
): { kind: 'done' | 'overdue'; label: string; cls: string } | null {
  if (status === 'done') return { kind: 'done', label: '완료', cls: 'bg-green-100 text-green-600' }
  if (isCurrentMonthView && day < todayDay) return { kind: 'overdue', label: '미납', cls: 'bg-red-100 text-red-500' }
  return null
}

function RemainingFlowPill({ label, value, negative = false }: { label: string; value: string; negative?: boolean }) {
  return (
    <div className="rounded-[16px] bg-[#f7f7f7] px-2.5 py-2">
      <p className="text-[11px] font-semibold text-[#8a8a8a]">{label}</p>
      <p className={`mt-0.5 truncate text-xs font-bold ${negative ? 'text-red-500' : 'text-[#222222]'}`}>{value}</p>
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
