import { useMemo, useState } from 'react'
import type { TabId } from '../../app/App'
import type { QuickAddType } from '../common/QuickAddMenu'
import {
  checklistItemRepo,
  checklistRepo,
  choreRepo,
  fixedExpenseRepo,
  householdSupplyRepo,
  ledgerEntryRepo,
  lifeRecordRepo,
  shoppingItemRepo,
  subscriptionRepo,
} from '../../data/repositories'
import { newId, now } from '../../data/repositories/base'
import { getTodayAggregated } from '../../utils/calendarAggregator'
import { formatAmount, todayMonth, todayStr, todayYear } from '../../utils/date'
import { QUICK_ADD_ICON } from '../../utils/featureIcons'
import type { HouseholdSupply } from '../../data/models'

interface Props {
  refreshKey: number
  onQuickAdd: (type: QuickAddType) => void
  onTabChange: (tab: TabId) => void
}

const ROUTINE_PRESETS = ['분리수거', '음식물 쓰레기', '빨래', '청소기', '아이 준비물', '약 챙기기']

export default function HomePage({ refreshKey, onQuickAdd, onTabChange }: Props) {
  const [localRefresh, setLocalRefresh] = useState(0)
  const [notice, setNotice] = useState('')

  const data = useMemo(() => {
    const todayEvents = getTodayAggregated()
    const today = todayStr()
    const monthEntries = ledgerEntryRepo.getByMonth(todayYear(), todayMonth())
    const monthExpense = ledgerEntryRepo.sumByType(monthEntries, 'expense')
    const monthIncome = ledgerEntryRepo.sumByType(monthEntries, 'income')
    const pendingShopping = shoppingItemRepo.getAll().filter((item) => !item.is_done)
    const dueChores = choreRepo
      .getByHousehold('default')
      .filter((chore) => !chore.is_done && (!chore.due_date || chore.due_date <= today))
      .sort((a, b) => (a.due_date ?? today).localeCompare(b.due_date ?? today))
    const needBuySupplies = householdSupplyRepo
      .getAll()
      .filter((supply) => supply.status === 'need_buy')
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
      dueChores,
      needBuySupplies,
      dueChecklists,
      monthlyFixed,
      monthlySubs,
      records,
    }
  }, [refreshKey, localRefresh])

  const todayPayments = data.todayEvents.filter(
    (event) => event.type === 'fixed_expense' || event.type === 'subscription' || event.type === 'utility',
  )
  const todaySchedules = data.todayEvents.filter((event) => event.type === 'schedule')
  const todayCount =
    todaySchedules.length +
    todayPayments.length +
    data.dueChecklists.length +
    data.dueChores.length +
    data.needBuySupplies.length +
    data.pendingShopping.length

  function refreshHome(message?: string) {
    setLocalRefresh((key) => key + 1)
    if (message) setNotice(message)
  }

  function completeChore(choreId: string) {
    choreRepo.update(choreId, { is_done: true })
    refreshHome('오늘 할 일을 완료했어요.')
  }

  function addSupplyToShopping(supply: HouseholdSupply) {
    const alreadyAdded = shoppingItemRepo
      .getAll()
      .some((item) => item.name === supply.name && !item.is_done)

    if (alreadyAdded) {
      setNotice('이미 장보기 목록에 있어요.')
      return
    }

    shoppingItemRepo.create({
      id: newId(),
      household_id: 'default',
      name: supply.name,
      category: '생활용품',
      expected_amount: null,
      actual_amount: null,
      store: '',
      is_done: false,
      is_favorite: false,
      memo: '',
      created_at: now(),
      updated_at: now(),
    })
    refreshHome('장보기 목록에 추가했어요.')
  }

  function addRoutine(title: string) {
    const today = todayStr()
    const alreadyAdded = choreRepo
      .getByHousehold('default')
      .some((chore) => !chore.is_done && chore.title === title && chore.due_date === today)

    if (alreadyAdded) {
      setNotice('이미 오늘 할 일에 있어요.')
      return
    }

    choreRepo.create({
      id: newId(),
      household_id: 'default',
      title,
      repeat_rule: 'none',
      member_id: 'shared',
      due_date: today,
      calendar_visible: false,
      is_done: false,
      memo: '',
      created_at: now(),
      updated_at: now(),
    })
    refreshHome('오늘 할 일에 추가했어요.')
  }

  return (
    <div className="px-5 py-3 space-y-3">
      <section className="oz-card p-4 bg-white">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-xs font-semibold text-[#8a8a8a]">{todayStr().replace(/-/g, '.')}</p>
            <h2 className="mt-0.5 text-xl font-semibold text-[#222222]">
              {todayCount === 0 ? '오늘은 챙길 일이 없습니다' : `오늘 ${todayCount}개 챙기기`}
            </h2>
          </div>
          <button
            onClick={() => onTabChange('life')}
            className="min-h-[36px] rounded-full bg-[#fff0f3] px-3 text-sm font-semibold text-[#ff385c]"
          >
            장보기
          </button>
        </div>

        <div className="space-y-2">
          {todayCount === 0 && (
            <EmptyReminder
              onAddShopping={() => onQuickAdd('shopping')}
              onAddRoutine={() => addRoutine('분리수거')}
            />
          )}
          {data.dueChores.slice(0, 3).map((chore) => (
            <ReminderLine
              key={chore.id}
              label="할 일"
              text={chore.title}
              actionLabel="완료"
              onAction={() => completeChore(chore.id)}
            />
          ))}
          {data.pendingShopping.slice(0, 3).map((item) => (
            <ReminderLine
              key={item.id}
              label="살 것"
              text={item.name}
              actionLabel="보기"
              onAction={() => onTabChange('life')}
            />
          ))}
          {data.needBuySupplies.slice(0, 2).map((supply) => (
            <ReminderLine
              key={supply.id}
              label="부족"
              text={supply.name}
              actionLabel="담기"
              onAction={() => addSupplyToShopping(supply)}
            />
          ))}
          {todaySchedules.slice(0, 2).map((event) => (
            <ReminderLine key={event.id} label="일정" text={event.title} onAction={() => onTabChange('calendar')} actionLabel="보기" />
          ))}
          {todayPayments.slice(0, 2).map((event) => (
            <ReminderLine
              key={event.id}
              label="납부"
              text={`${event.title}${event.amount ? ` · ${formatAmount(event.amount)}` : ''}`}
              onAction={() => onTabChange('money')}
              actionLabel="보기"
            />
          ))}
          {data.dueChecklists.slice(0, 2).map((checklist) => (
            <ReminderLine
              key={checklist.id}
              label="체크"
              text={`${checklist.title} · ${checklist.rate}%`}
              onAction={() => onTabChange('life')}
              actionLabel="보기"
            />
          ))}
        </div>
      </section>

      <section className="oz-card p-4">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold text-[#222222]">자주 쓰는 알림</h3>
            <p className="mt-0.5 text-xs text-[#8a8a8a]">오늘 할 일로 바로 추가합니다</p>
          </div>
          {notice && <span className="text-xs font-semibold text-[#ff385c]">{notice}</span>}
        </div>
        <div className="grid grid-cols-3 gap-2">
          {ROUTINE_PRESETS.map((title) => (
            <button
              key={title}
              onClick={() => addRoutine(title)}
              className="min-h-[42px] rounded-full border border-[#ebebeb] bg-[#f7f7f7] px-2 text-xs font-semibold text-[#222222]"
            >
              {title}
            </button>
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

function ReminderLine({
  label,
  text,
  actionLabel,
  onAction,
}: {
  label: string
  text: string
  actionLabel: string
  onAction: () => void
}) {
  return (
    <div className="flex items-center gap-3 rounded-[18px] bg-[#f7f7f7] border border-[#ebebeb] px-3 py-3">
      <span className="text-xs font-semibold text-[#ff385c] bg-[#fff0f3] rounded-full px-2.5 py-1">{label}</span>
      <span className="min-w-0 flex-1 truncate text-sm font-medium text-[#222222]">{text}</span>
      <button
        onClick={onAction}
        className="min-h-[30px] flex-shrink-0 rounded-full bg-white px-3 text-xs font-semibold text-[#222222] border border-[#dddddd]"
      >
        {actionLabel}
      </button>
    </div>
  )
}

function EmptyReminder({
  onAddShopping,
  onAddRoutine,
}: {
  onAddShopping: () => void
  onAddRoutine: () => void
}) {
  return (
    <div className="rounded-[18px] bg-[#f7f7f7] border border-[#ebebeb] px-3 py-4 text-center">
      <p className="text-sm font-semibold text-[#222222]">지금 챙길 일은 비어 있어요</p>
      <p className="mt-1 text-xs text-[#8a8a8a]">살 것 또는 집안일을 하나 추가해보세요.</p>
      <div className="mt-3 flex justify-center gap-2">
        <button onClick={onAddShopping} className="min-h-[34px] rounded-full bg-white px-3 text-xs font-semibold text-[#ff385c] border border-[#ffd1da]">
          살 것 추가
        </button>
        <button onClick={onAddRoutine} className="min-h-[34px] rounded-full bg-white px-3 text-xs font-semibold text-[#222222] border border-[#dddddd]">
          분리수거 추가
        </button>
      </div>
    </div>
  )
}
