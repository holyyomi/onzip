import type { ReactNode } from 'react'
import type { TabId } from '../../app/App'
import Header from './Header'
import BottomTabBar from './BottomTabBar'
import { APP_NAME, APP_TAGLINE } from '../../utils/brand'
import { TAB_ICON } from '../../utils/featureIcons'

interface Props {
  children: ReactNode
  activeTab: TabId
  onTabChange: (tab: TabId) => void
  onOpenQuickAdd: () => void
}

const DESKTOP_TABS: { id: TabId; label: string }[] = [
  { id: 'home', label: '홈' },
  { id: 'money', label: '가계부' },
  { id: 'calendar', label: '일정' },
  { id: 'records', label: '메모장' },
  { id: 'life', label: '체크리스트' },
  { id: 'settings', label: '설정' },
]

export default function AppShell({ children, activeTab, onTabChange, onOpenQuickAdd }: Props) {
  return (
    <div className="flex h-[100dvh] min-h-screen w-full bg-[#f7f7f7]">
      <aside className="hidden w-[264px] flex-shrink-0 border-r border-[#ebebeb] bg-white px-4 py-5 lg:flex lg:flex-col">
        <button
          onClick={() => onTabChange('home')}
          className="flex items-center gap-3 rounded-[18px] px-2 py-2 text-left"
          aria-label="홈으로 이동"
        >
          <img src="/icons/icon-192.png" alt="" className="h-11 w-11 rounded-[16px]" />
          <span className="min-w-0">
            <span className="block text-xl font-semibold leading-none text-[#222222]">{APP_NAME}</span>
            <span className="mt-1 block truncate text-xs font-medium text-[#6a6a6a]">{APP_TAGLINE}</span>
          </span>
        </button>

        <button
          onClick={onOpenQuickAdd}
          className="mt-5 flex min-h-[48px] items-center justify-center rounded-full bg-[#ff385c] px-4 text-sm font-semibold text-white transition active:bg-[#e00b41]"
        >
          빠른 추가
        </button>

        <nav className="mt-6 space-y-1">
          {DESKTOP_TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex min-h-[48px] w-full items-center gap-3 rounded-[16px] px-3 text-left text-sm font-semibold transition-colors ${
                activeTab === tab.id
                  ? 'bg-[#fff0f3] text-[#222222]'
                  : 'text-[#6a6a6a] hover:bg-[#f7f7f7] hover:text-[#222222]'
              }`}
            >
              <img src={TAB_ICON[tab.id]} alt="" className="h-8 w-8 rounded-[12px] object-contain" />
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </aside>

      <div className="relative mx-auto flex h-full w-full max-w-lg flex-col overflow-hidden bg-[#f7f7f7] lg:max-w-none lg:flex-1">
        <Header activeTab={activeTab} onOpenQuickAdd={onOpenQuickAdd} onTabChange={onTabChange} />
        <main className="flex-1 overflow-y-auto pb-[calc(7rem+env(safe-area-inset-bottom))] scroll-smooth-mobile lg:pb-10">
          <div className="mx-auto w-full lg:max-w-[1180px] lg:px-6 xl:max-w-[1320px]">
            {children}
          </div>
        </main>
        <BottomTabBar activeTab={activeTab} onTabChange={onTabChange} />
      </div>
    </div>
  )
}
