import type { TabId } from '../../app/App'

interface Tab {
  id: TabId
  label: string
}

const TABS: Tab[] = [
  { id: 'home', label: '홈' },
  { id: 'calendar', label: '일정' },
  { id: 'money', label: '돈' },
  { id: 'life', label: '생활' },
  { id: 'settings', label: '설정' },
]

interface Props {
  activeTab: TabId
  onTabChange: (tab: TabId) => void
}

export default function BottomTabBar({ activeTab, onTabChange }: Props) {
  return (
    <nav className="absolute bottom-0 left-0 right-0 bg-[#fbfaf8]/95 backdrop-blur border-t border-[#e8e1d8] safe-area-bottom">
      <div className="grid grid-cols-5 px-2 py-2">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`min-h-[48px] rounded-lg text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-[#2f2a25] text-white'
                : 'text-[#8f857a]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </nav>
  )
}
