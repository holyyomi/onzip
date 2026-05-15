import { useState } from 'react'
import ChecklistTab from '../life/ChecklistTab'
import ShoppingTab from '../life/ShoppingTab'
import SuppliesTab from '../life/SuppliesTab'
import ChoreTab from '../life/ChoreTab'
import TemplateTab from '../life/TemplateTab'

type LifeSubTab = 'checklist' | 'shopping' | 'supplies' | 'chore' | 'template'

const SUB_TABS: { value: LifeSubTab; label: string }[] = [
  { value: 'checklist', label: '체크리스트' },
  { value: 'shopping', label: '장보기' },
  { value: 'supplies', label: '생활용품' },
  { value: 'chore', label: '집안일' },
  { value: 'template', label: '템플릿' },
]

export default function LifePage() {
  const [activeTab, setActiveTab] = useState<LifeSubTab>('checklist')
  const [refreshKey, setRefreshKey] = useState(0)

  const onRefresh = () => setRefreshKey((k) => k + 1)

  return (
    <div>
      {/* 서브탭 */}
      <div className="flex overflow-x-auto bg-white border-b border-gray-100 px-2">
        {SUB_TABS.map((t) => (
          <button
            key={t.value}
            onClick={() => setActiveTab(t.value)}
            className={`flex-shrink-0 px-3 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === t.value
                ? 'text-blue-600 border-blue-600'
                : 'text-gray-400 border-transparent'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {activeTab === 'checklist' && (
        <ChecklistTab refreshKey={refreshKey} onRefresh={onRefresh} />
      )}
      {activeTab === 'shopping' && (
        <ShoppingTab refreshKey={refreshKey} onRefresh={onRefresh} />
      )}
      {activeTab === 'supplies' && (
        <SuppliesTab refreshKey={refreshKey} onRefresh={onRefresh} />
      )}
      {activeTab === 'chore' && (
        <ChoreTab refreshKey={refreshKey} onRefresh={onRefresh} />
      )}
      {activeTab === 'template' && <TemplateTab onRefresh={onRefresh} />}
    </div>
  )
}
