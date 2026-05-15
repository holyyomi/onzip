import type { TabId } from '../../app/App'

interface Tab {
  id: TabId
  label: string
}

const TABS: Tab[] = [
  { id: 'calendar', label: '캘린더' },
  { id: 'money', label: '돈관리' },
  { id: 'life', label: '생활' },
  { id: 'records', label: '기록' },
  { id: 'settings', label: '설정' },
]

interface Props {
  activeTab: TabId
  onTabChange: (tab: TabId) => void
}

export default function BottomTabBar({ activeTab, onTabChange }: Props) {
  return (
    <nav className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200">
      <div className="flex">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex-1 py-3 text-xs font-medium transition-colors ${
              activeTab === tab.id
                ? 'text-blue-600 border-t-2 border-blue-600'
                : 'text-gray-400 border-t-2 border-transparent'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </nav>
  )
}
