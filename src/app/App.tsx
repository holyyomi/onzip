import { useState } from 'react'
import AppShell from '../components/layout/AppShell'
import CalendarPage from '../components/pages/CalendarPage'
import MoneyPage from '../components/pages/MoneyPage'
import LifePage from '../components/pages/LifePage'
import RecordsPage from '../components/pages/RecordsPage'
import SettingsPage from '../components/pages/SettingsPage'

export type TabId = 'calendar' | 'money' | 'life' | 'records' | 'settings'

export default function App() {
  const [activeTab, setActiveTab] = useState<TabId>('calendar')

  const renderPage = () => {
    switch (activeTab) {
      case 'calendar': return <CalendarPage />
      case 'money': return <MoneyPage />
      case 'life': return <LifePage />
      case 'records': return <RecordsPage />
      case 'settings': return <SettingsPage />
    }
  }

  return (
    <AppShell activeTab={activeTab} onTabChange={setActiveTab}>
      {renderPage()}
    </AppShell>
  )
}
