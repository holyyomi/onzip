import type { TabId } from '../../app/App'

interface Tab {
  id: TabId
  label: string
  icon: string
}

const TABS: Tab[] = [
  { id: 'home', label: '홈', icon: '집' },
  { id: 'calendar', label: '일정', icon: '일' },
  { id: 'money', label: '돈', icon: '원' },
  { id: 'life', label: '생활', icon: '삶' },
  { id: 'settings', label: '설정', icon: '설' },
]

interface Props {
  activeTab: TabId
  onTabChange: (tab: TabId) => void
}

export default function BottomTabBar({ activeTab, onTabChange }: Props) {
  return (
    <nav className="absolute bottom-0 left-0 right-0 bg-white/88 backdrop-blur-xl border-t border-[#ebebeb] safe-area-bottom">
      <div className="grid grid-cols-5 px-2 py-2">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className="min-h-[58px] rounded-[18px] text-xs font-semibold transition-colors flex flex-col items-center justify-center gap-1"
          >
            <span
              className={`h-7 w-7 rounded-full flex items-center justify-center text-[11px] ${
                activeTab === tab.id ? 'bg-[#ff385c] text-white' : 'bg-[#f2f2f2] text-[#6a6a6a]'
              }`}
            >
              {tab.icon}
            </span>
            <span className={activeTab === tab.id ? 'text-[#222222]' : 'text-[#6a6a6a]'}>{tab.label}</span>
          </button>
        ))}
      </div>
    </nav>
  )
}
