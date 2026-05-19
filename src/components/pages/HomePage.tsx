import { useMemo } from 'react'
import type { TabId } from '../../app/App'
import type { QuickAddType } from '../common/QuickAddMenu'
import {
  fixedExpenseRepo,
  incomeRepo,
  ledgerEntryRepo,
  lifeRecordRepo,
  subscriptionRepo,
} from '../../data/repositories'
import { getAggregatedEvents } from '../../utils/calendarAggregator'
import { formatDate, todayMonth, todayStr, todayYear } from '../../utils/date'
import { QUICK_ADD_ICON } from '../../utils/featureIcons'
import { displayAmount, useAmountPrivacy } from '../../utils/amountPrivacy'
import { displayRecordTitle, useVaultPrivacy } from '../../utils/vaultPrivacy'

interface Props {
  refreshKey: number
  onQuickAdd: (type: QuickAddType) => void
  onTabChange: (tab: TabId) => void
}

interface ImportantItem {
  id: string
  label: string
  title: string
  detail: string
  tab: TabId
}

function addDays(dateStr: string, days: number): string {
  const [year, month, day] = dateStr.split('-').map(Number)
  return formatDate(new Date(year, month - 1, day + days))
}

export default function HomePage({ refreshKey, onQuickAdd, onTabChange }: Props) {
  const { hidden: hideAmounts } = useAmountPrivacy()
  const { hidden: hideSensitive } = useVaultPrivacy()
  const data = useMemo(() => {
    const today = todayStr()
    const year = todayYear()
    const month = todayMonth()
    const todayDay = Number(today.slice(-2))
    const monthEntries = ledgerEntryRepo.getByMonth(year, month)
    const monthIncome = ledgerEntryRepo.sumByType(monthEntries, 'income')
    const monthExpense = ledgerEntryRepo.sumByType(monthEntries, 'expense')
    const recurringIncome = incomeRepo.getAll().filter((income) => income.repeat_rule === 'monthly')
    const fixedExpenses = fixedExpenseRepo.getActive()
    const subscriptions = subscriptionRepo.getActive()
    const expectedIn = recurringIncome.reduce((sum, income) => sum + income.amount, 0) + monthIncome
    const expectedOut =
      fixedExpenses.reduce((sum, expense) => sum + expense.amount, 0) +
      subscriptions.reduce((sum, sub) => sum + sub.amount, 0) +
      monthExpense

    const todayIncome = recurringIncome.filter((income) => income.income_day === todayDay)
    const todayFixed = fixedExpenses.filter((expense) => expense.payment_day === todayDay)
    const todaySubs = subscriptions.filter((sub) => sub.payment_day === todayDay)
    const todayEvents = getAggregatedEvents(year, month).filter((event) => event.date === today && event.type === 'schedule')
    const weekEnd = addDays(today, 7)
    const weekEvents = getAggregatedEvents(year, month)
      .filter((event) => event.date > today && event.date <= weekEnd)
      .sort((a, b) => a.date.localeCompare(b.date))

    const importantRecords = lifeRecordRepo
      .getAll()
      .filter((record) => record.tags.some((tag) => ['중요', '계약', '계좌', '보험'].includes(tag)))
      .sort((a, b) => b.updated_at.localeCompare(a.updated_at))

    return {
      monthIncome,
      monthExpense,
      expectedIn,
      expectedOut,
      todayIncome,
      todayFixed,
      todaySubs,
      todayEvents,
      weekEvents,
      importantRecords,
    }
  }, [refreshKey])

  const todayItems: ImportantItem[] = [
    ...data.todayIncome.map((income) => ({
      id: `income_${income.id}`,
      label: '들어올 돈',
      title: income.title,
      detail: displayAmount(income.amount, hideAmounts),
      tab: 'money' as TabId,
    })),
    ...data.todayFixed.map((expense) => ({
      id: `fixed_${expense.id}`,
      label: '나갈 돈',
      title: expense.title,
      detail: displayAmount(expense.amount, hideAmounts),
      tab: 'money' as TabId,
    })),
    ...data.todaySubs.map((sub) => ({
      id: `sub_${sub.id}`,
      label: '자동결제',
      title: sub.title,
      detail: displayAmount(sub.amount, hideAmounts),
      tab: 'money' as TabId,
    })),
    ...data.todayEvents.map((event) => ({
      id: `event_${event.id}`,
      label: '일정',
      title: event.title,
      detail: event.date.replace(/-/g, '.'),
      tab: 'calendar' as TabId,
    })),
  ]

  return (
    <div className="px-5 py-3 space-y-3">
      <section className="oz-card bg-white p-4">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-semibold text-[#8a8a8a]">{todayStr().replace(/-/g, '.')}</p>
            <h2 className="mt-0.5 text-xl font-semibold text-[#222222]">오늘 중요한 것</h2>
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
            <EmptyLine title="오늘 예정된 돈과 일정이 없습니다" text="나갈 돈, 들어올 돈, 중요한 날짜를 추가해두면 여기서 바로 확인합니다." />
          )}
          {todayItems.slice(0, 5).map((item) => (
            <ImportantLine
              key={item.id}
              label={item.label}
              title={item.title}
              detail={item.detail}
              onClick={() => onTabChange(item.tab)}
            />
          ))}
        </div>
      </section>

      <section className="grid grid-cols-2 gap-2">
        <QuickButton iconSrc={QUICK_ADD_ICON.expense} label="나갈 돈" onClick={() => onQuickAdd('expense')} />
        <QuickButton iconSrc={QUICK_ADD_ICON.income} label="들어올 돈" onClick={() => onQuickAdd('income')} />
        <QuickButton iconSrc={QUICK_ADD_ICON.schedule} label="중요 날짜" onClick={() => onQuickAdd('schedule')} />
        <QuickButton iconSrc={QUICK_ADD_ICON.record} label="금고 메모" onClick={() => onQuickAdd('record')} />
      </section>

      <section className="oz-card p-4">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-[#222222]">이번 달 흐름</h3>
          <button onClick={() => onTabChange('money')} className="min-h-[34px] px-2 text-sm font-semibold text-[#ff385c]">
            자세히
          </button>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <MiniStat label="들어올 돈" value={displayAmount(data.expectedIn, hideAmounts)} />
          <MiniStat label="나갈 돈" value={displayAmount(data.expectedOut, hideAmounts)} />
          <MiniStat label="예상 차이" value={displayAmount(data.expectedIn - data.expectedOut, hideAmounts)} />
        </div>
      </section>

      <section className="oz-card p-4">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-[#222222]">곧 챙길 것</h3>
          <button onClick={() => onTabChange('calendar')} className="min-h-[34px] px-2 text-sm font-semibold text-[#ff385c]">
            일정
          </button>
        </div>
        <div className="divide-y divide-[#f0f0f0]">
          {data.weekEvents.length === 0 && (
            <p className="py-3 text-sm text-[#8a8a8a]">이번 주에 등록된 중요 날짜가 없습니다.</p>
          )}
          {data.weekEvents.slice(0, 4).map((event) => (
            <StatusRow
              key={event.id}
              label={event.type === 'schedule' ? '일정' : '돈'}
              value={event.date.slice(5).replace('-', '.')}
              detail={event.title}
              onClick={() => onTabChange(event.type === 'schedule' ? 'calendar' : 'money')}
            />
          ))}
          {data.importantRecords.slice(0, 2).map((record) => (
            <StatusRow
              key={record.id}
              label="금고"
              value="중요"
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
}: {
  label: string
  title: string
  detail: string
  onClick: () => void
}) {
  return (
    <button onClick={onClick} className="flex w-full items-center gap-3 rounded-[18px] border border-[#ebebeb] bg-[#f7f7f7] px-3 py-3 text-left">
      <span className="rounded-full bg-[#fff0f3] px-2.5 py-1 text-xs font-semibold text-[#ff385c]">{label}</span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-semibold text-[#222222]">{title}</span>
        <span className="mt-0.5 block truncate text-xs text-[#8a8a8a]">{detail}</span>
      </span>
    </button>
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
