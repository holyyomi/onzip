import type { ReactNode } from 'react'
import type { TabId } from '../../app/App'
import Header from './Header'
import BottomTabBar from './BottomTabBar'

interface Props {
  children: ReactNode
  activeTab: TabId
  onTabChange: (tab: TabId) => void
  onOpenQuickAdd: () => void
}

export default function AppShell({ children, activeTab, onTabChange, onOpenQuickAdd }: Props) {
  return (
    <div className="flex flex-col min-h-screen bg-[#f7f7f7] max-w-lg mx-auto relative">
      <Header activeTab={activeTab} onOpenQuickAdd={onOpenQuickAdd} />
      <main className="flex-1 overflow-y-auto pb-24 pb-safe scroll-smooth-mobile">
        {children}
      </main>
      <BottomTabBar activeTab={activeTab} onTabChange={onTabChange} />
    </div>
  )
}
