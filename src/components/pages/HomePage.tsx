import { useMemo } from 'react'
import type { TabId } from '../../app/App'
import type { QuickAddType } from '../common/QuickAddMenu'
import {
  checklistItemRepo,
  checklistRepo,
  fixedExpenseRepo,
  ledgerEntryRepo,
  lifeRecordRepo,
  shoppingItemRepo,
  subscriptionRepo,
} from '../../data/repositories'
import { getTodayAggregated } from '../../utils/calendarAggregator'
import { formatAmount, todayMonth, todayStr, todayYear } from '../../utils/date'
import { QUICK_ADD_ICON } from '../../utils/featureIcons'

interface Props {
  refreshKey: number
  onQuickAdd: (type: QuickAddType) => void
  onTabChange: (tab: TabId) => void
}

export default function HomePage({ refreshKey, onQuickAdd, onTabChange }: Props) {
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
    const records = lifeRecordRepo.getAll()

    return {
      todayEvents,
      monthExpense,
      monthIncome,
      pendingShopping,
      dueChecklists,
      monthlyFixed,
      monthlySubs,
      records,
    }
  }, [refreshKey])

  const todayPayments = data.todayEvents.filter(
    (event) => event.type === 'fixed_expense' || event.type === 'subscription' || event.type === 'utility',
  )
  const todaySchedules = data.todayEvents.filter((event) => event.type === 'schedule')
  const hasNoTodayWork = todaySchedules.length === 0 && todayPayments.length === 0 && data.dueChecklists.length === 0
  const todayCount = todaySchedules.length + todayPayments.length + data.dueChecklists.length

  return (
    <div className="px-5 py-3 space-y-3">
      <section className="oz-card p-4 bg-white">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-xs font-semibold text-[#8a8a8a]">{todayStr().replace(/-/g, '.')}</p>
            <h2 className="mt-0.5 text-xl font-semibold text-[#222222]">
              {hasNoTodayWork ? '오늘 예정된 항목이 없습니다' : `오늘 ${todayCount}건 확인 필요`}
            </h2>
          </div>
          <button
            onClick={() => onTabChange('calendar')}
            className="min-h-[36px] rounded-full bg-[#fff0f3] px-3 text-sm font-semibold text-[#ff385c]"
          >
            일정 보기
          </button>
        </div>

        <div className="space-y-2">
          {hasNoTodayWork && <EmptyLine text="등록된 일정, 납부, 체크리스트가 없습니다" />}
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
            <HomeLine key={checklist.id} label="체크" text={`${checklist.title} · ${checklist.rate}%`} />
          ))}
        </div>
      </section>

      <section className="grid grid-cols-2 gap-2">
        <QuickButton iconSrc={QUICK_ADD_ICON.expense} label="돈 썼어요" onClick={() => onQuickAdd('expense')} />
        <QuickButton iconSrc={QUICK_ADD_ICON.shopping} label="살 것 추가" onClick={() => onQuickAdd('shopping')} />
        <QuickButton iconSrc={QUICK_ADD_ICON.schedule} label="일정 넣기" onClick={() => onQuickAdd('schedule')} />
        <QuickButton iconSrc={QUICK_ADD_ICON.record} label="메모 남기기" onClick={() => onQuickAdd('record')} />
      </section>

      <section className="oz-card p-4">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-[#222222]">월간 요약</h3>
          <button onClick={() => onTabChange('money')} className="min-h-[34px] px-2 text-sm font-semibold text-[#ff385c]">
            자세히
          </button>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <MiniStat label="지출" value={formatAmount(data.monthExpense)} />
          <MiniStat label="수입" value={formatAmount(data.monthIncome)} />
          <MiniStat label="고정비" value={formatAmount(data.monthlyFixed + data.monthlySubs)} />
        </div>
        <div className="mt-3 divide-y divide-[#f0f0f0]">
          <StatusRow
            label="장보기"
            value={`${data.pendingShopping.length}개 남음`}
            detail={data.pendingShopping.slice(0, 2).map((item) => item.name).join(', ') || '등록된 구매 항목이 없습니다'}
            onClick={() => onTabChange('life')}
          />
          <StatusRow
            label="메모"
            value={`${data.records.length}개`}
            detail="기억할 내용과 회의록 모아보기"
            onClick={() => onTabChange('records')}
          />
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

function HomeLine({ label, text }: { label: string; text: string }) {
  return (
    <div className="flex items-center gap-3 rounded-[18px] bg-[#f7f7f7] border border-[#ebebeb] px-3 py-3">
      <span className="text-xs font-semibold text-[#ff385c] bg-[#fff0f3] rounded-full px-2.5 py-1">{label}</span>
      <span className="text-sm text-[#222222] font-medium truncate">{text}</span>
    </div>
  )
}

function EmptyLine({ text }: { text: string }) {
  return (
    <div className="rounded-[18px] bg-[#f7f7f7] border border-[#ebebeb] px-3 py-4 text-sm text-[#6a6a6a] text-center">
      {text}
    </div>
  )
}
