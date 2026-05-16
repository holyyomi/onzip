import { useEffect, useRef, useState } from 'react'
import { Analytics } from '@vercel/analytics/react'
import AppShell from '../components/layout/AppShell'
import HomePage from '../components/pages/HomePage'
import CalendarPage from '../components/pages/CalendarPage'
import MoneyPage from '../components/pages/MoneyPage'
import LifePage from '../components/pages/LifePage'
import RecordsPage from '../components/pages/RecordsPage'
import SettingsPage from '../components/pages/SettingsPage'
import QuickAddMenu, { type QuickAddType } from '../components/common/QuickAddMenu'
import QuickAddModal from '../components/common/QuickAddModal'
import { getLaunchMode, initGoogleAnalytics, trackEvent } from '../utils/analytics'

export type TabId = 'home' | 'calendar' | 'money' | 'life' | 'records' | 'settings'

export default function App() {
  const [activeTab, setActiveTab] = useState<TabId>('home')
  const [showQuickMenu, setShowQuickMenu] = useState(false)
  const [quickAddType, setQuickAddType] = useState<QuickAddType | null>(null)
  const [appRefreshKey, setAppRefreshKey] = useState(0)
  const [savedMessage, setSavedMessage] = useState('')
  const savedTimerRef = useRef<number | null>(null)

  useEffect(() => {
    initGoogleAnalytics()
    trackEvent('app_open', { mode: getLaunchMode() })
  }, [])

  useEffect(() => {
    trackEvent('tab_open', { tab: activeTab, mode: getLaunchMode() })
  }, [activeTab])

  function handleQuickSelect(type: QuickAddType) {
    trackEvent('quick_add_select', { type })
    setShowQuickMenu(false)
    setQuickAddType(type)
  }

  function handleQuickSaved() {
    const message = quickAddType ? getSavedMessage(quickAddType) : '저장됐어요'
    const savedType = quickAddType
    setQuickAddType(null)
    setAppRefreshKey((key) => key + 1)
    setSavedMessage(message)
    if (savedType) {
      trackEvent('quick_add_saved', { type: savedType })
    }

    if (savedType === 'record') {
      setActiveTab('records')
    }

    if (savedTimerRef.current) {
      window.clearTimeout(savedTimerRef.current)
    }
    savedTimerRef.current = window.setTimeout(() => setSavedMessage(''), 1800)
  }

  const renderPage = () => {
    switch (activeTab) {
      case 'home':
        return <HomePage refreshKey={appRefreshKey} onQuickAdd={handleQuickSelect} onTabChange={setActiveTab} />
      case 'calendar': return <CalendarPage externalRefreshKey={appRefreshKey} onQuickAdd={handleQuickSelect} />
      case 'money':    return <MoneyPage externalRefreshKey={appRefreshKey} onQuickAdd={handleQuickSelect} />
      case 'life':     return <LifePage externalRefreshKey={appRefreshKey} onQuickAdd={handleQuickSelect} />
      case 'records':  return <RecordsPage externalRefreshKey={appRefreshKey} onQuickAdd={handleQuickSelect} />
      case 'settings': return <SettingsPage />
    }
  }

  return (
    <>
      <AppShell
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onOpenQuickAdd={() => {
          trackEvent('quick_add_open')
          setShowQuickMenu(true)
        }}
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

      {savedMessage && (
        <div className="fixed left-1/2 bottom-24 z-50 -translate-x-1/2 rounded-full bg-[#222222] px-5 py-3 text-sm font-semibold text-white shadow-lg">
          {savedMessage}
        </div>
      )}

      <Analytics />
    </>
  )
}

function getSavedMessage(type: QuickAddType): string {
  switch (type) {
    case 'schedule':
      return '일정이 저장됐어요'
    case 'expense':
      return '돈 기록이 저장됐어요'
    case 'fixed_expense':
      return '매달 돈이 저장됐어요'
    case 'subscription':
      return '구독이 저장됐어요'
    case 'shopping':
      return '살 것이 저장됐어요'
    case 'checklist':
      return '할 일이 저장됐어요'
    case 'record':
      return '기록이 저장됐어요'
  }
}
