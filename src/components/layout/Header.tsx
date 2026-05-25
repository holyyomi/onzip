import { householdRepo } from '../../data/repositories'
import type { TabId } from '../../app/App'
import { APP_NAME } from '../../utils/brand'
import { TAB_ICON } from '../../utils/featureIcons'

interface Props {
  activeTab: TabId
  onOpenQuickAdd: () => void
  onTabChange: (tab: TabId) => void
}

const TAB_TITLE: Record<TabId, string> = {
  home: '오늘',
  calendar: '일정',
  money: '가계부',
  life: '체크리스트',
  records: '금고',
  settings: '설정',
}

export default function Header({ activeTab, onOpenQuickAdd, onTabChange }: Props) {
  const householdName = householdRepo.getDefault().name

  return (
    <header className="bg-white/88 backdrop-blur-xl border-b border-[#ebebeb] px-5 py-2.5 flex items-center justify-between gap-3 sticky top-0 z-10 lg:px-8 lg:py-4">
      <button
        onClick={() => onTabChange('home')}
        className="flex min-w-0 flex-1 items-center gap-3 text-left active:scale-[0.99] transition lg:pointer-events-none"
        aria-label="홈으로 이동"
      >
        <img
          src="/icons/icon-192.png"
          alt=""
          className="h-10 w-10 rounded-[14px] flex-shrink-0 lg:hidden"
        />
        <div className="min-w-0">
          <p className="text-[22px] font-semibold text-[#222222] leading-none lg:text-2xl">{activeTab === 'home' ? APP_NAME : TAB_TITLE[activeTab]}</p>
          <p className="text-xs font-medium text-[#6a6a6a] truncate mt-1">
            {householdName} · {activeTab === 'home' ? TAB_TITLE[activeTab] : APP_NAME}
          </p>
        </div>
      </button>
      <div className="flex flex-shrink-0 items-center gap-2">
        <button
          onClick={() => onTabChange('settings')}
          className={`h-11 w-11 rounded-full flex items-center justify-center transition-colors lg:hidden ${
            activeTab === 'settings' ? 'bg-[#fff0f3]' : 'bg-[#f2f2f2]'
          }`}
          aria-label="설정"
        >
          <img src={TAB_ICON.settings} alt="" className="h-8 w-8 object-contain" />
        </button>
        <button
          onClick={onOpenQuickAdd}
          className="h-11 w-11 oz-pill-primary text-2xl leading-none flex items-center justify-center lg:hidden"
          aria-label="빠른 추가"
        >
          +
        </button>
      </div>
    </header>
  )
}
