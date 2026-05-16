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
import { APP_NAME, APP_TAGLINE } from '../../utils/brand'
import { QUICK_ADD_ICON } from '../../utils/featureIcons'
import TabMemoCard from '../common/TabMemoCard'
import InstallPromptCard from '../common/InstallPromptCard'
import StorageNoticeCard from '../common/StorageNoticeCard'
import UpdateNoticeCard from '../common/UpdateNoticeCard'

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

    return {
      todayEvents,
      monthExpense,
      monthIncome,
      pendingShopping,
      dueChecklists,
      monthlyFixed,
      monthlySubs,
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
      <section className="oz-card p-4">
        <div className="flex items-center gap-3">
          <img
            src="/icons/icon-192.png"
            alt=""
            className="h-11 w-11 rounded-[16px]"
          />
          <div className="min-w-0 flex-1">
            <p className="text-xl font-semibold leading-none text-[#222222]">{APP_NAME}</p>
            <p className="mt-1 truncate text-xs text-[#6a6a6a]">{APP_TAGLINE}</p>
          </div>
          <button
            onClick={() => onTabChange('calendar')}
            className="min-h-[36px] rounded-full bg-[#222222] px-3 text-sm font-semibold text-white"
          >
            오늘 {todayCount}
          </button>
        </div>
        <div className="mt-3 grid grid-cols-3 gap-2">
          <MiniStat label="쓴 돈" value={formatAmount(data.monthExpense)} />
          <MiniStat label="장보기" value={`${data.pendingShopping.length}개`} />
          <MiniStat label="매달" value={formatAmount(data.monthlyFixed + data.monthlySubs)} />
        </div>
      </section>

      <section className="oz-card p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-[#222222]">오늘 확인</h3>
          <button onClick={() => onTabChange('calendar')} className="text-sm text-[#ff385c] font-semibold min-h-[36px] px-2">
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
        <QuickButton iconSrc={QUICK_ADD_ICON.expense} label="돈 쓴 것" onClick={() => onQuickAdd('expense')} />
        <QuickButton iconSrc={QUICK_ADD_ICON.shopping} label="살 것" onClick={() => onQuickAdd('shopping')} />
        <QuickButton iconSrc={QUICK_ADD_ICON.schedule} label="일정" onClick={() => onQuickAdd('schedule')} />
        <QuickButton iconSrc={QUICK_ADD_ICON.record} label="가족 기록" onClick={() => onQuickAdd('record')} />
      </section>

      <section className="grid grid-cols-2 gap-3">
        <InfoCard
          tint="bg-white"
          label="이번 달 쓴 돈"
          value={formatAmount(data.monthExpense)}
          note={`들어온 돈 ${formatAmount(data.monthIncome)}`}
          onClick={() => onTabChange('money')}
        />
        <InfoCard
          tint="bg-white"
          label="장보기 남은 것"
          value={`${data.pendingShopping.length}개`}
          note={data.pendingShopping.slice(0, 2).map((item) => item.name).join(', ') || '목록이 비었어요'}
          onClick={() => onTabChange('life')}
        />
      </section>

      <section className="grid grid-cols-2 gap-3">
        <InfoCard
          tint="bg-white"
          label="매달 나가는 돈"
          value={formatAmount(data.monthlyFixed + data.monthlySubs)}
          note="고정지출과 구독"
          onClick={() => onTabChange('money')}
        />
        <InfoCard
          tint="bg-white"
          label="가족 기록"
          value="모아보기"
          note="회의록, 집 이야기"
          onClick={() => onTabChange('records')}
        />
      </section>

      <TabMemoCard
        tab="home"
        title="우리집 메모"
        placeholder="오늘 가족에게 알려줄 말, 잊으면 안 되는 일을 적어두세요."
      />

      <InstallPromptCard />

      <StorageNoticeCard dismissible />

      <UpdateNoticeCard />
    </div>
  )
}

function QuickButton({ iconSrc, label, onClick }: { iconSrc: string; label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="min-h-[88px] oz-card px-3 py-3 text-left active:scale-[0.98] transition"
    >
      <img src={iconSrc} alt="" className="h-9 w-9 rounded-[14px] mb-2 object-contain" />
      <span className="text-base font-semibold text-[#222222] leading-tight">{label}</span>
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
    <button onClick={onClick} className={`${tint} oz-card p-3 text-left min-h-[92px] active:scale-[0.99] transition`}>
      <p className="text-sm text-[#6a6a6a] font-semibold">{label}</p>
      <p className="text-lg font-semibold text-[#222222] mt-1.5 leading-tight">{value}</p>
      <p className="text-xs text-[#6a6a6a] mt-1.5 line-clamp-2">{note}</p>
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
