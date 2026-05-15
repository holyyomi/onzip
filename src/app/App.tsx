import { useState } from 'react'
import AppShell from '../components/layout/AppShell'
import CalendarPage from '../components/pages/CalendarPage'
import MoneyPage from '../components/pages/MoneyPage'
import LifePage from '../components/pages/LifePage'
import RecordsPage from '../components/pages/RecordsPage'
import SettingsPage from '../components/pages/SettingsPage'
import QuickAddMenu, { type QuickAddType } from '../components/common/QuickAddMenu'
import QuickAddModal from '../components/common/QuickAddModal'

export type TabId = 'calendar' | 'money' | 'life' | 'records' | 'settings'

export default function App() {
  const [activeTab, setActiveTab] = useState<TabId>('calendar')
  const [showQuickMenu, setShowQuickMenu] = useState(false)
  const [quickAddType, setQuickAddType] = useState<QuickAddType | null>(null)

  function handleQuickSelect(type: QuickAddType) {
    setShowQuickMenu(false)
    setQuickAddType(type)
  }

  function handleQuickSaved() {
    setQuickAddType(null)
  }

  const renderPage = () => {
    switch (activeTab) {
      case 'calendar': return <CalendarPage />
      case 'money':    return <MoneyPage />
      case 'life':     return <LifePage />
      case 'records':  return <RecordsPage />
      case 'settings': return <SettingsPage />
    }
  }

  return (
    <>
      <AppShell
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onOpenQuickAdd={() => setShowQuickMenu(true)}
      >
        {renderPage()}
      </AppShell>

      {/* 빠른 추가 메뉴 */}
      {showQuickMenu && (
        <QuickAddMenu
          onSelect={handleQuickSelect}
          onClose={() => setShowQuickMenu(false)}
        />
      )}

      {/* 빠른 추가 폼 모달 */}
      {quickAddType && (
        <QuickAddModal
          type={quickAddType}
          onSaved={handleQuickSaved}
          onClose={() => setQuickAddType(null)}
        />
      )}
    </>
  )
}
