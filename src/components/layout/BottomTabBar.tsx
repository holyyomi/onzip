import type { TabId } from '../../app/App'
import { TAB_ICON } from '../../utils/featureIcons'

interface Tab {
  id: TabId
  label: string
}

const TABS: Tab[] = [
  { id: 'home', label: '홈' },
  { id: 'money', label: '흐름' },
  { id: 'calendar', label: '일정' },
  { id: 'life', label: '생활' },
  { id: 'records', label: '금고' },
]

interface Props {
  activeTab: TabId
  onTabChange: (tab: TabId) => void
}

export default function BottomTabBar({ activeTab, onTabChange }: Props) {
  return (
    <nav className="absolute bottom-0 left-0 right-0 bg-white/88 backdrop-blur-xl border-t border-[#ebebeb] safe-area-bottom lg:hidden">
      <div className="grid grid-cols-5 px-1 py-2">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className="min-h-[62px] rounded-[18px] text-xs font-semibold transition-colors flex flex-col items-center justify-center gap-1"
          >
            <span
              className={`h-9 w-9 rounded-[14px] flex items-center justify-center overflow-hidden ${
                activeTab === tab.id ? 'bg-[#fff0f3]' : 'bg-[#f2f2f2]'
              }`}
            >
              <img src={TAB_ICON[tab.id]} alt="" className="h-8 w-8 object-contain" />
            </span>
            <span className={activeTab === tab.id ? 'text-[#222222]' : 'text-[#6a6a6a]'}>{tab.label}</span>
          </button>
        ))}
      </div>
    </nav>
  )
}
