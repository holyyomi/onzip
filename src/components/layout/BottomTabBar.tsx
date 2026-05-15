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
    /* fixed → absolute (AppShell 기준) + safe-area-bottom for iOS home bar */
    <nav className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 safe-area-bottom">
      <div className="flex">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            /* 최소 44px 터치 영역 보장 */
            className={`flex-1 py-3 min-h-[44px] text-xs font-medium transition-colors border-t-2 ${
              activeTab === tab.id
                ? 'text-blue-600 border-blue-600'
                : 'text-gray-400 border-transparent'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </nav>
  )
}
