import type { ReactNode } from 'react'
import type { TabId } from '../../app/App'
import Header from './Header'
import BottomTabBar from './BottomTabBar'

interface Props {
  children: ReactNode
  activeTab: TabId
  onTabChange: (tab: TabId) => void
}

export default function AppShell({ children, activeTab, onTabChange }: Props) {
  return (
    // max-w-lg: 데스크톱에서 모바일 너비 유지
    // min-h-screen: 전체 높이 채움
    <div className="flex flex-col min-h-screen bg-gray-50 max-w-lg mx-auto relative shadow-xl">
      <Header />
      {/* pb-16: BottomTabBar 높이 + pb-safe: iOS 홈바 여백 */}
      <main className="flex-1 overflow-y-auto pb-16 pb-safe scroll-smooth-mobile">
        {children}
      </main>
      <BottomTabBar activeTab={activeTab} onTabChange={onTabChange} />
    </div>
  )
}
