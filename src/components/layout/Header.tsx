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
    <header className="bg-[#fbfaf8]/95 backdrop-blur border-b border-[#e8e1d8] px-5 py-4 flex items-center justify-between sticky top-0 z-10">
      <div>
        <p className="text-xs text-[#8f857a]">{householdName}</p>
        <h1 className="text-xl font-semibold text-[#2f2a25] leading-tight">{TAB_TITLE[activeTab]}</h1>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={onOpenQuickAdd}
          className="h-11 px-4 bg-[#7c3aed] text-white rounded-lg text-sm font-medium flex items-center justify-center active:bg-[#6d28d9] transition-colors"
          aria-label="빠른 추가"
        >
          추가
        </button>
      </div>
    </header>
  )
}
