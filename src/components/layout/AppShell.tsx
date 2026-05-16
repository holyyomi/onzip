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
    <div className="flex h-[100dvh] min-h-screen flex-col bg-[#f7f7f7] max-w-lg mx-auto relative overflow-hidden">
      <Header activeTab={activeTab} onOpenQuickAdd={onOpenQuickAdd} />
      <main className="flex-1 overflow-y-auto pb-[calc(9rem+env(safe-area-inset-bottom))] scroll-smooth-mobile">
        {children}
      </main>
      <BottomTabBar activeTab={activeTab} onTabChange={onTabChange} />
    </div>
  )
}
