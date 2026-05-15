import { householdRepo } from '../../data/repositories'
import type { TabId } from '../../app/App'

interface Props {
  activeTab: TabId
  onOpenQuickAdd: () => void
}

const TAB_TITLE: Record<TabId, string> = {
  home: '오늘',
  calendar: '일정',
  money: '돈',
  life: '생활',
  records: '기록',
  settings: '설정',
}

export default function Header({ activeTab, onOpenQuickAdd }: Props) {
  const householdName = householdRepo.getDefault().name

  return (
    <header className="bg-white/85 backdrop-blur-xl border-b border-[#ebebeb] px-5 py-4 flex items-center justify-between sticky top-0 z-10">
      <div>
        <p className="text-xs font-medium text-[#6a6a6a]">{householdName}</p>
        <h1 className="text-2xl font-semibold text-[#222222] leading-tight">{TAB_TITLE[activeTab]}</h1>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={onOpenQuickAdd}
          className="h-11 w-11 oz-pill-primary text-2xl leading-none flex items-center justify-center"
          aria-label="빠른 추가"
        >
          +
        </button>
      </div>
    </header>
  )
}
