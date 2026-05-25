import type { TabId } from '../../app/App'
import { TAB_ICON } from '../../utils/featureIcons'

interface Tab {
  id: TabId
  label: string
}

const TABS: Tab[] = [
  { id: 'home', label: '홈' },
  { id: 'money', label: '가계부' },
  { id: 'calendar', label: '일정' },
  { id: 'life', label: '체크리스트' },
  { id: 'records', label: '금고' },
]

interface Props {
  activeTab: TabId
  onTabChange: (tab: TabId) => void
}

export default function BottomTabBar({ activeTab, onTabChange }: Props) {
  return (
    <nav className="fixed bottom-0 left-1/2 z-40 w-full max-w-lg -translate-x-1/2 border-t border-[#ebebeb] bg-white/95 shadow-[0_-8px_24px_rgba(0,0,0,0.06)] backdrop-blur-xl safe-area-bottom lg:hidden">
      <div className="grid grid-cols-5 px-1 py-2">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className="flex h-[66px] min-w-0 flex-col items-center justify-center gap-1 rounded-[18px] text-xs font-semibold transition-colors"
            aria-label={`${tab.label} 탭으로 이동`}
          >
            <span
              className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-[14px] ${
                activeTab === tab.id ? 'bg-[#fff0f3]' : 'bg-[#f2f2f2]'
              }`}
            >
              <img src={TAB_ICON[tab.id]} alt="" className="h-8 w-8 object-contain" />
            </span>
            <span className={`leading-none ${activeTab === tab.id ? 'text-[#222222]' : 'text-[#6a6a6a]'}`}>
              {tab.label}
            </span>
          </button>
        ))}
      </div>
    </nav>
  )
}
