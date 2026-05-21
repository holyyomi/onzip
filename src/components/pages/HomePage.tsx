import { useMemo, useState } from 'react'
import type { LifeInitialTab, TabId } from '../../app/App'
import type { QuickAddType } from '../common/QuickAddMenu'
import {
  fixedExpenseRepo,
  checklistItemRepo,
  checklistRepo,
  choreRepo,
  householdSupplyRepo,
  incomeRepo,
  ledgerEntryRepo,
  lifeRecordRepo,
  shoppingItemRepo,
  subscriptionRepo,
} from '../../data/repositories'
import { getAggregatedEvents } from '../../utils/calendarAggregator'
import { formatDate, getEffectiveMonthDay, todayMonth, todayStr, todayYear } from '../../utils/date'
import { QUICK_ADD_ICON } from '../../utils/featureIcons'
import { displayAmount, useAmountPrivacy } from '../../utils/amountPrivacy'
import { displayRecordTitle, useVaultPrivacy } from '../../utils/vaultPrivacy'
import { getVaultRecordBadge, isDatedVaultRecord, isImportantVaultRecord } from '../../utils/vaultRecords'
import { getFixedExpenseMonthStatus, setFixedExpenseMonthStatus } from '../../utils/fixedExpenseMonthStatus'
import { getIncomeMonthStatus, setIncomeMonthStatus } from '../../utils/incomeMonthStatus'
import { getSubscriptionMonthStatus, setSubscriptionMonthStatus } from '../../utils/subscriptionMonthStatus'

interface Props {
  refreshKey: number
  onQuickAdd: (type: QuickAddType) => void
  onTabChange: (tab: TabId) => void
  onOpenLife: (tab: LifeInitialTab) => void
}

interface ImportantItem {
  id: string
  label: string
  title: string
  detail: string
  tab: TabId
  actionLabel?: string
  onAction?: () => void
}

interface LifeItem {
  id: string
  label: string
  title: string
  detail: string
  initialTab: 'shopping' | 'checklist'
}

function addDays(dateStr: string, days: number): string {
  const [year, month, day] = dateStr.split('-').map(Number)
  return formatDate(new Date(year, month - 1, day + days))
}

function nextMonthOf(year: number, month: number): { year: number; month: number } {
  return month === 12 ? { year: year + 1, month: 1 } : { year, month: month + 1 }
}

function dateInMonth(year: number, month: number, day: number): string {
  return formatDate(new Date(year, month - 1, getEffectiveMonthDay(year, month, day)))
}

export default function HomePage({ refreshKey, onQuickAdd, onTabChange, onOpenLife }: Props) {
  const { hidden: hideAmounts } = useAmountPrivacy()
  const { hidden: hideSensitive } = useVaultPrivacy()
  const [localRefreshKey, setLocalRefreshKey] = useState(0)
  const data = useMemo(() => {
    const today = todayStr()
    const year = todayYear()
    const month = todayMonth()
    const todayDay = Number(today.slice(-2))
    const monthEntries = ledgerEntryRepo.getByMonth(year, month)
    const monthIncome = ledgerEntryRepo.sumByType(monthEntries, 'income')
    const monthExpense = ledgerEntryRepo.sumByType(monthEntries, 'expense')
    const upcomingEntryIncome = monthEntries
      .filter((entry) => entry.entry_type === 'income' && Number(entry.date.slice(-2)) >= todayDay)
      .reduce((sum, entry) => sum + entry.amount, 0)
    const upcomingEntryExpense = monthEntries
      .filter((entry) => entry.entry_type === 'expense' && Number(entry.date.slice(-2)) >= todayDay)
      .reduce((sum, entry) => sum + entry.amount, 0)
    const recurringIncome = incomeRepo.getAll().filter((income) => income.repeat_rule === 'monthly')
    const incomesWithStatus = recurringIncome.map((income) => ({
      ...income,
      monthStatus: getIncomeMonthStatus(income, year, month),
    }))
    const fixedExpenses = fixedExpenseRepo.getActive()
    const fixedExpensesWithStatus = fixedExpenses.map((expense) => ({
      ...expense,
      monthStatus: getFixedExpenseMonthStatus(expense, year, month),
    }))
    const subscriptions = subscriptionRepo.getActive()
    const subscriptionsWithStatus = subscriptions.map((sub) => ({
      ...sub,
      monthStatus: getSubscriptionMonthStatus(sub, year, month),
    }))
    const expectedIn = recurringIncome.reduce((sum, income) => sum + income.amount, 0) + monthIncome
    const expectedOut =
      fixedExpenses.reduce((sum, expense) => sum + expense.amount, 0) +
      subscriptions.reduce((sum, sub) => sum + sub.amount, 0) +
      monthExpense

    const overdueIncome = incomesWithStatus.filter((income) => income.monthStatus !== 'received' && getEffectiveMonthDay(year, month, income.income_day) < todayDay)
    const overdueFixed = fixedExpensesWithStatus.filter((expense) => expense.monthStatus !== 'done' && getEffectiveMonthDay(year, month, expense.payment_day) < todayDay)
    const overdueSubs = subscriptionsWithStatus.filter((sub) => sub.monthStatus !== 'paid' && getEffectiveMonthDay(year, month, sub.payment_day) < todayDay)
    const todayIncome = incomesWithStatus.filter((income) => income.monthStatus !== 'received' && getEffectiveMonthDay(year, month, income.income_day) === todayDay)
    const todayFixed = fixedExpensesWithStatus.filter((expense) => expense.monthStatus !== 'done' && getEffectiveMonthDay(year, month, expense.payment_day) === todayDay)
    const todaySubs = subscriptionsWithStatus.filter((sub) => sub.monthStatus !== 'paid' && getEffectiveMonthDay(year, month, sub.payment_day) === todayDay)
    const remainingIn =
      incomesWithStatus
        .filter((income) => income.monthStatus !== 'received')
        .reduce((sum, income) => sum + income.amount, 0) +
      upcomingEntryIncome
    const remainingOut =
      fixedExpensesWithStatus
        .filter((expense) => expense.monthStatus !== 'done')
        .reduce((sum, expense) => sum + expense.amount, 0) +
      subscriptionsWithStatus
        .filter((sub) => sub.monthStatus !== 'paid')
        .reduce((sum, sub) => sum + sub.amount, 0) +
      upcomingEntryExpense
    const todayEvents = getAggregatedEvents(year, month).filter((event) => event.date === today && event.type === 'schedule')
    const weekEnd = addDays(today, 7)
    const vaultDueEnd = addDays(today, 30)
    const targetMonths = weekEnd.slice(0, 7) === today.slice(0, 7)
      ? [{ year, month }]
      : [{ year, month }, nextMonthOf(year, month)]
    const upcomingMoneyItems = targetMonths.flatMap(({ year: targetYear, month: targetMonth }) => [
      ...recurringIncome.map((income) => ({
        id: `upcoming_income_${targetYear}_${targetMonth}_${income.id}`,
        label: '수입 예정',
        date: dateInMonth(targetYear, targetMonth, income.income_day),
        title: income.title,
        amount: income.amount,
        isDone: getIncomeMonthStatus(income, targetYear, targetMonth) === 'received',
      })),
      ...fixedExpenses.map((expense) => ({
        id: `upcoming_fixed_${targetYear}_${targetMonth}_${expense.id}`,
        label: expense.category === '카드' ? '카드 결제' : '지출 예정',
        date: dateInMonth(targetYear, targetMonth, expense.payment_day),
        title: expense.title,
        amount: expense.amount,
        isDone: getFixedExpenseMonthStatus(expense, targetYear, targetMonth) === 'done',
      })),
      ...subscriptions.map((sub) => ({
        id: `upcoming_sub_${targetYear}_${targetMonth}_${sub.id}`,
        label: '자동결제',
        date: dateInMonth(targetYear, targetMonth, sub.payment_day),
        title: sub.title,
        amount: sub.amount,
        isDone: getSubscriptionMonthStatus(sub, targetYear, targetMonth) === 'paid',
      })),
    ])
      .filter((item) => !item.isDone && item.date > today && item.date <= weekEnd)
      .sort((a, b) => a.date.localeCompare(b.date))
    const weekEvents = getAggregatedEvents(year, month)
      .filter((event) => event.date > today && event.date <= weekEnd && event.type !== 'fixed_expense' && event.type !== 'subscription')
      .sort((a, b) => a.date.localeCompare(b.date))
    const upcomingVaultRecords = lifeRecordRepo
      .getAll()
      .filter((record) => isDatedVaultRecord(record) && record.record_date >= today && record.record_date <= vaultDueEnd)
      .sort((a, b) => a.record_date.localeCompare(b.record_date))
    const upcomingVaultRecordIds = new Set(upcomingVaultRecords.map((record) => record.id))

    const importantRecords = lifeRecordRepo
      .getAll()
      .filter((record) => isImportantVaultRecord(record) && !upcomingVaultRecordIds.has(record.id))
      .sort((a, b) => b.updated_at.localeCompare(a.updated_at))
    const pendingShoppingItems = shoppingItemRepo.getPending('default').slice(0, 5)
    const activeChecklists = checklistRepo
      .getByHousehold('default')
      .map((checklist) => ({
        ...checklist,
        completionRate: checklistItemRepo.completionRate(checklist.id),
      }))
      .filter((checklist) => checklist.completionRate < 100)
      .sort((a, b) => {
        if (a.due_date && b.due_date) return a.due_date.localeCompare(b.due_date)
        if (a.due_date) return -1
        if (b.due_date) return 1
        return b.updated_at.localeCompare(a.updated_at)
      })
      .slice(0, 4)
    const suppliesToBuy = householdSupplyRepo.getNeedBuy('default').slice(0, 4)
    const pendingChores = choreRepo
      .getByHousehold('default')
      .filter((chore) => !chore.is_done)
      .sort((a, b) => {
        if (a.due_date && b.due_date) return a.due_date.localeCompare(b.due_date)
        if (a.due_date) return -1
        if (b.due_date) return 1
        return b.updated_at.localeCompare(a.updated_at)
      })
      .slice(0, 4)

    return {
      monthIncome,
      monthExpense,
      expectedIn,
      expectedOut,
      remainingIn,
      remainingOut,
      overdueIncome,
      overdueFixed,
      overdueSubs,
      todayIncome,
      todayFixed,
      todaySubs,
      todayEvents,
      upcomingMoneyItems,
      weekEvents,
      upcomingVaultRecords,
      importantRecords,
      pendingShoppingItems,
      activeChecklists,
      suppliesToBuy,
      pendingChores,
    }
  }, [refreshKey, localRefreshKey])

  function completeIncome(id: string) {
    setIncomeMonthStatus(id, todayYear(), todayMonth(), 'received')
    setLocalRefreshKey((key) => key + 1)
  }

  function completeFixedExpense(id: string) {
    setFixedExpenseMonthStatus(id, todayYear(), todayMonth(), 'done')
    setLocalRefreshKey((key) => key + 1)
  }

  function completeSubscription(id: string) {
    setSubscriptionMonthStatus(id, todayYear(), todayMonth(), 'paid')
    setLocalRefreshKey((key) => key + 1)
  }

  const todayItems: ImportantItem[] = [
    ...data.overdueIncome.map((income) => ({
      id: `overdue_income_${income.id}`,
      label: '입금 대기',
      title: income.title,
      detail: `${getEffectiveMonthDay(todayYear(), todayMonth(), income.income_day)}일 · ${displayAmount(income.amount, hideAmounts)}`,
      tab: 'money' as TabId,
      actionLabel: '입금',
      onAction: () => completeIncome(income.id),
    })),
    ...data.overdueFixed.map((expense) => ({
      id: `overdue_fixed_${expense.id}`,
      label: '미납',
      title: expense.title,
      detail: `${getEffectiveMonthDay(todayYear(), todayMonth(), expense.payment_day)}일 · ${displayAmount(expense.amount, hideAmounts)}`,
      tab: 'money' as TabId,
      actionLabel: '완료',
      onAction: () => completeFixedExpense(expense.id),
    })),
    ...data.overdueSubs.map((sub) => ({
      id: `overdue_sub_${sub.id}`,
      label: '확인필요',
      title: sub.title,
      detail: `${getEffectiveMonthDay(todayYear(), todayMonth(), sub.payment_day)}일 · ${displayAmount(sub.amount, hideAmounts)}`,
      tab: 'money' as TabId,
      actionLabel: '결제',
      onAction: () => completeSubscription(sub.id),
    })),
    ...data.todayIncome.map((income) => ({
      id: `income_${income.id}`,
      label: '수입 예정',
      title: income.title,
      detail: displayAmount(income.amount, hideAmounts),
      tab: 'money' as TabId,
      actionLabel: '입금',
      onAction: () => completeIncome(income.id),
    })),
    ...data.todayFixed.map((expense) => ({
      id: `fixed_${expense.id}`,
      label: '지출 예정',
      title: expense.title,
      detail: displayAmount(expense.amount, hideAmounts),
      tab: 'money' as TabId,
      actionLabel: '완료',
      onAction: () => completeFixedExpense(expense.id),
    })),
    ...data.todaySubs.map((sub) => ({
      id: `sub_${sub.id}`,
      label: '자동결제',
      title: sub.title,
      detail: displayAmount(sub.amount, hideAmounts),
      tab: 'money' as TabId,
      actionLabel: '결제',
      onAction: () => completeSubscription(sub.id),
    })),
    ...data.todayEvents.map((event) => ({
      id: `event_${event.id}`,
      label: '일정',
      title: event.title,
      detail: event.date.replace(/-/g, '.'),
      tab: 'calendar' as TabId,
    })),
  ]
  const hiddenTodayItemCount = Math.max(0, todayItems.length - 5)
  const lifeItems: LifeItem[] = [
    ...data.pendingShoppingItems.map((item) => ({
      id: `shopping_${item.id}`,
      label: '구매 항목',
      title: item.name,
      detail: item.category,
      initialTab: 'shopping' as const,
    })),
    ...data.activeChecklists.map((checklist) => ({
      id: `checklist_${checklist.id}`,
      label: '체크리스트',
      title: checklist.title,
      detail: checklist.due_date ? `${checklist.due_date.replace(/-/g, '.')} · ${checklist.completionRate}%` : `${checklist.completionRate}% 진행`,
      initialTab: 'checklist' as const,
    })),
    ...data.suppliesToBuy.map((supply) => ({
      id: `supply_${supply.id}`,
      label: '생활용품',
      title: supply.name,
      detail: '구매 필요',
      initialTab: 'shopping' as const,
    })),
    ...data.pendingChores.map((chore) => ({
      id: `chore_${chore.id}`,
      label: '집안일',
      title: chore.title,
      detail: chore.due_date ? chore.due_date.replace(/-/g, '.') : '미완료',
      initialTab: 'checklist' as const,
    })),
  ].slice(0, 6)

  return (
    <div className="px-5 py-3 space-y-3 lg:grid lg:grid-cols-[minmax(0,1.35fr)_minmax(340px,0.75fr)] lg:items-start lg:gap-4 lg:space-y-0 lg:px-8 lg:py-5">
      <section className="oz-card bg-white p-4 lg:col-start-1 lg:row-span-2">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-semibold text-[#8a8a8a]">{todayStr().replace(/-/g, '.')}</p>
            <h2 className="mt-0.5 text-xl font-semibold text-[#222222]">오늘의 주요 항목</h2>
          </div>
          <button
            onClick={() => onTabChange('money')}
            className="min-h-[36px] rounded-full bg-[#fff0f3] px-3 text-sm font-semibold text-[#ff385c]"
          >
            흐름 보기
          </button>
        </div>

        <div className="space-y-2">
          {todayItems.length === 0 && (
            <EmptyLine title="오늘 확인할 항목이 없습니다" text="입금 대기, 미납, 자동결제 확인이 필요하면 여기서 먼저 보입니다." />
          )}
          {todayItems.slice(0, 5).map((item) => (
            <ImportantLine
              key={item.id}
              label={item.label}
              title={item.title}
              detail={item.detail}
              onClick={() => onTabChange(item.tab)}
              actionLabel={item.actionLabel}
              onAction={item.onAction}
            />
          ))}
          {hiddenTodayItemCount > 0 && (
            <button
              onClick={() => onTabChange('money')}
              className="w-full rounded-[18px] border border-dashed border-[#ffd1da] bg-white px-3 py-3 text-sm font-semibold text-[#ff385c]"
            >
              숨겨진 항목 {hiddenTodayItemCount}건 더 보기
            </button>
          )}
        </div>
      </section>

      <section className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:col-start-2">
        <QuickButton iconSrc={QUICK_ADD_ICON.expense} label="지출 예정" onClick={() => onQuickAdd('expense')} />
        <QuickButton iconSrc={QUICK_ADD_ICON.income} label="수입 예정" onClick={() => onQuickAdd('income')} />
        <QuickButton iconSrc={QUICK_ADD_ICON.shopping} label="구매 항목" onClick={() => onQuickAdd('shopping')} />
        <QuickButton iconSrc={QUICK_ADD_ICON.checklist} label="체크리스트" onClick={() => onQuickAdd('checklist')} />
        <QuickButton iconSrc={QUICK_ADD_ICON.schedule} label="중요 일정" onClick={() => onQuickAdd('schedule')} />
        <QuickButton iconSrc={QUICK_ADD_ICON.record} label="보관 메모" onClick={() => onQuickAdd('record')} />
      </section>

      <section className="oz-card p-4 lg:col-start-2">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-[#222222]">생활 할 일</h3>
          <button onClick={() => onTabChange('life')} className="min-h-[34px] px-2 text-sm font-semibold text-[#ff385c]">
            생활
          </button>
        </div>
        <div className="divide-y divide-[#f0f0f0]">
          {lifeItems.length === 0 && (
            <p className="py-3 text-sm text-[#8a8a8a]">구매 항목, 체크리스트, 생활용품, 집안일이 없습니다.</p>
          )}
          {lifeItems.map((item) => (
            <StatusRow
              key={item.id}
              label={item.label}
              value={item.detail}
              detail={item.title}
              onClick={() => onOpenLife(item.initialTab)}
            />
          ))}
        </div>
      </section>

      <section className="oz-card p-4 lg:col-start-2">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-[#222222]">이번 달 흐름</h3>
          <button onClick={() => onTabChange('money')} className="min-h-[34px] px-2 text-sm font-semibold text-[#ff385c]">
            자세히
          </button>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <MiniStat label="남은 수입" value={displayAmount(data.remainingIn, hideAmounts)} />
          <MiniStat label="남은 지출" value={displayAmount(data.remainingOut, hideAmounts)} />
          <MiniStat label="예상 차액" value={displayAmount(data.remainingIn - data.remainingOut, hideAmounts)} />
        </div>
      </section>

      <section className="oz-card p-4 lg:col-span-2">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-[#222222]">다가오는 항목</h3>
          <button onClick={() => onTabChange('calendar')} className="min-h-[34px] px-2 text-sm font-semibold text-[#ff385c]">
            일정
          </button>
        </div>
        <div className="divide-y divide-[#f0f0f0]">
          {data.upcomingMoneyItems.length === 0 && data.weekEvents.length === 0 && data.upcomingVaultRecords.length === 0 && data.importantRecords.length === 0 && (
            <p className="py-3 text-sm text-[#8a8a8a]">다가오는 수입·지출, 일정, 보관 메모가 없습니다.</p>
          )}
          {data.upcomingMoneyItems.slice(0, 4).map((item) => (
            <StatusRow
              key={item.id}
              label={item.label}
              value={item.date.slice(5).replace('-', '.')}
              detail={`${item.title} · ${displayAmount(item.amount, hideAmounts)}`}
              onClick={() => onTabChange('money')}
            />
          ))}
          {data.weekEvents.slice(0, Math.max(0, 4 - data.upcomingMoneyItems.length)).map((event) => (
            <StatusRow
              key={event.id}
              label={event.type === 'anniversary' ? '기념일' : event.type === 'checklist' ? '체크리스트' : '일정'}
              value={event.date.slice(5).replace('-', '.')}
              detail={event.title}
              onClick={() => onTabChange('calendar')}
            />
          ))}
          {data.upcomingVaultRecords.slice(0, 3).map((record) => (
            <StatusRow
              key={record.id}
              label="금고"
              value={record.record_date.slice(5).replace('-', '.')}
              detail={`${getVaultRecordBadge(record)} · ${displayRecordTitle(record, hideSensitive)}`}
              onClick={() => onTabChange('records')}
            />
          ))}
          {data.importantRecords.slice(0, 2).map((record) => (
            <StatusRow
              key={record.id}
              label="금고"
              value={getVaultRecordBadge(record)}
              detail={displayRecordTitle(record, hideSensitive)}
              onClick={() => onTabChange('records')}
            />
          ))}
        </div>
      </section>
    </div>
  )
}

function QuickButton({ iconSrc, label, onClick }: { iconSrc: string; label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="min-h-[64px] rounded-[20px] border border-[#ebebeb] bg-white px-3 py-2.5 text-left active:scale-[0.98] transition flex items-center gap-3"
    >
      <img src={iconSrc} alt="" className="h-9 w-9 flex-shrink-0 rounded-[13px] object-contain" />
      <span className="block text-xs font-semibold text-[#222222] leading-tight">{label}</span>
    </button>
  )
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[16px] bg-[#f7f7f7] px-3 py-2">
      <p className="text-[11px] font-semibold text-[#8a8a8a]">{label}</p>
      <p className="mt-0.5 truncate text-sm font-semibold text-[#222222]">{value}</p>
    </div>
  )
}

function ImportantLine({
  label,
  title,
  detail,
  onClick,
  actionLabel,
  onAction,
}: {
  label: string
  title: string
  detail: string
  onClick: () => void
  actionLabel?: string
  onAction?: () => void
}) {
  return (
    <div className="flex w-full items-center gap-2 rounded-[18px] border border-[#ebebeb] bg-[#f7f7f7] px-3 py-3 text-left">
      <button onClick={onClick} className="flex min-w-0 flex-1 items-center gap-3 text-left">
        <span className="rounded-full bg-[#fff0f3] px-2.5 py-1 text-xs font-semibold text-[#ff385c]">{label}</span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-semibold text-[#222222]">{title}</span>
          <span className="mt-0.5 block truncate text-xs text-[#8a8a8a]">{detail}</span>
        </span>
      </button>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="min-h-[32px] flex-shrink-0 rounded-full border border-[#ffd1da] bg-white px-2.5 text-xs font-semibold text-[#ff385c]"
        >
          {actionLabel}
        </button>
      )}
    </div>
  )
}

function StatusRow({
  label,
  value,
  detail,
  onClick,
}: {
  label: string
  value: string
  detail: string
  onClick: () => void
}) {
  return (
    <button onClick={onClick} className="flex w-full items-center justify-between gap-3 py-3 text-left">
      <span className="min-w-0">
        <span className="block text-sm font-semibold text-[#222222]">{label}</span>
        <span className="mt-0.5 block truncate text-xs text-[#8a8a8a]">{detail}</span>
      </span>
      <span className="flex-shrink-0 text-sm font-semibold text-[#222222]">{value}</span>
    </button>
  )
}

function EmptyLine({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-[18px] border border-[#ebebeb] bg-[#f7f7f7] px-3 py-4 text-center">
      <p className="text-sm font-semibold text-[#222222]">{title}</p>
      <p className="mt-1 text-xs leading-relaxed text-[#8a8a8a]">{text}</p>
    </div>
  )
}
