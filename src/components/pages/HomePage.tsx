import { useMemo } from 'react'
import type { TabId } from '../../app/App'
import type { QuickAddType } from '../common/QuickAddMenu'
import {
  checklistItemRepo,
  checklistRepo,
  fixedExpenseRepo,
  ledgerEntryRepo,
  shoppingItemRepo,
  subscriptionRepo,
} from '../../data/repositories'
import { getTodayAggregated } from '../../utils/calendarAggregator'
import { formatAmount, todayMonth, todayStr, todayYear } from '../../utils/date'

interface Props {
  onQuickAdd: (type: QuickAddType) => void
  onTabChange: (tab: TabId) => void
}

export default function HomePage({ onQuickAdd, onTabChange }: Props) {
  const data = useMemo(() => {
    const todayEvents = getTodayAggregated()
    const today = todayStr()
    const monthEntries = ledgerEntryRepo.getByMonth(todayYear(), todayMonth())
    const monthExpense = ledgerEntryRepo.sumByType(monthEntries, 'expense')
    const monthIncome = ledgerEntryRepo.sumByType(monthEntries, 'income')
    const pendingShopping = shoppingItemRepo.getAll().filter((item) => !item.is_done)
    const dueChecklists = checklistRepo
      .getAll()
      .filter((checklist) => checklist.due_date === today)
      .map((checklist) => ({
        ...checklist,
        rate: checklistItemRepo.completionRate(checklist.id),
      }))
    const monthlyFixed = fixedExpenseRepo.monthlyTotal()
    const monthlySubs = subscriptionRepo.monthlyTotal()

    return {
      todayEvents,
      monthExpense,
      monthIncome,
      pendingShopping,
      dueChecklists,
      monthlyFixed,
      monthlySubs,
    }
  }, [])

  const todayPayments = data.todayEvents.filter(
    (event) => event.type === 'fixed_expense' || event.type === 'subscription' || event.type === 'utility',
  )
  const todaySchedules = data.todayEvents.filter((event) => event.type === 'schedule')
  const hasNoTodayWork = todaySchedules.length === 0 && todayPayments.length === 0 && data.dueChecklists.length === 0

  return (
    <div className="px-5 py-5 space-y-4">
      <section className="bg-[#fff3b0] rounded-xl border border-[#eadf9a] p-5">
        <p className="text-sm text-[#7a5f12] font-medium">오늘 할 일</p>
        <h2 className="text-2xl font-semibold text-[#2f2a25] mt-1 leading-snug">
          {hasNoTodayWork ? '오늘은 여유로워요' : `${todaySchedules.length + todayPayments.length + data.dueChecklists.length}가지만 확인하면 돼요`}
        </h2>
        <p className="text-sm text-[#7a5f12] mt-2">
          일정, 납부, 장보기를 한곳에서 가볍게 챙겨요.
        </p>
      </section>

      <section className="grid grid-cols-3 gap-2">
        <QuickButton label="지출 적기" onClick={() => onQuickAdd('expense')} />
        <QuickButton label="장보기" onClick={() => onQuickAdd('shopping')} />
        <QuickButton label="일정 넣기" onClick={() => onQuickAdd('schedule')} />
      </section>

      <section className="grid grid-cols-2 gap-3">
        <InfoCard
          tint="bg-[#eef6ff]"
          label="이번 달 쓴 돈"
          value={formatAmount(data.monthExpense)}
          note={`들어온 돈 ${formatAmount(data.monthIncome)}`}
          onClick={() => onTabChange('money')}
        />
        <InfoCard
          tint="bg-[#f1f8ee]"
          label="장보기 남은 것"
          value={`${data.pendingShopping.length}개`}
          note={data.pendingShopping.slice(0, 2).map((item) => item.name).join(', ') || '목록이 비었어요'}
          onClick={() => onTabChange('life')}
        />
      </section>

      <section className="bg-white rounded-xl border border-[#e8e1d8] p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-semibold text-[#2f2a25]">오늘 확인</h3>
          <button onClick={() => onTabChange('calendar')} className="text-sm text-[#7c3aed] font-medium">
            전체 보기
          </button>
        </div>

        <div className="space-y-2">
          {hasNoTodayWork && <EmptyLine text="오늘 일정은 아직 없어요" />}
          {todaySchedules.slice(0, 2).map((event) => (
            <HomeLine key={event.id} label="일정" text={event.title} />
          ))}
          {todayPayments.slice(0, 2).map((event) => (
            <HomeLine
              key={event.id}
              label="납부"
              text={`${event.title}${event.amount ? ` · ${formatAmount(event.amount)}` : ''}`}
            />
          ))}
          {data.dueChecklists.slice(0, 2).map((checklist) => (
            <HomeLine key={checklist.id} label="할 일" text={`${checklist.title} · ${checklist.rate}%`} />
          ))}
        </div>
      </section>

      <section className="grid grid-cols-2 gap-3">
        <InfoCard
          tint="bg-[#fff0e6]"
          label="매달 나가는 돈"
          value={formatAmount(data.monthlyFixed + data.monthlySubs)}
          note="고정지출과 구독"
          onClick={() => onTabChange('money')}
        />
        <InfoCard
          tint="bg-[#f4efff]"
          label="가족 기록"
          value="메모하기"
          note="회의록, 집 이야기"
          onClick={() => onQuickAdd('record')}
        />
      </section>
    </div>
  )
}

function QuickButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="min-h-[64px] bg-[#2f2a25] text-white rounded-lg px-3 text-sm font-semibold leading-tight"
    >
      {label}
    </button>
  )
}

function InfoCard({
  tint,
  label,
  value,
  note,
  onClick,
}: {
  tint: string
  label: string
  value: string
  note: string
  onClick: () => void
}) {
  return (
    <button onClick={onClick} className={`${tint} rounded-xl border border-[#e8e1d8] p-4 text-left min-h-[118px]`}>
      <p className="text-sm text-[#6f665d] font-medium">{label}</p>
      <p className="text-xl font-semibold text-[#2f2a25] mt-2 leading-tight">{value}</p>
      <p className="text-xs text-[#8f857a] mt-2 line-clamp-2">{note}</p>
    </button>
  )
}

function HomeLine({ label, text }: { label: string; text: string }) {
  return (
    <div className="flex items-center gap-3 rounded-lg bg-[#fbfaf8] border border-[#eee7de] px-3 py-3">
      <span className="text-xs font-semibold text-[#7c3aed] bg-[#f4efff] rounded px-2 py-1">{label}</span>
      <span className="text-sm text-[#3b342d] font-medium truncate">{text}</span>
    </div>
  )
}

function EmptyLine({ text }: { text: string }) {
  return (
    <div className="rounded-lg bg-[#fbfaf8] border border-[#eee7de] px-3 py-4 text-sm text-[#8f857a] text-center">
      {text}
    </div>
  )
}
