import { useState } from 'react'
import ChecklistTab from '../life/ChecklistTab'
import ShoppingTab from '../life/ShoppingTab'
import SuppliesTab from '../life/SuppliesTab'
import ChoreTab from '../life/ChoreTab'
import TemplateTab from '../life/TemplateTab'

type LifeSubTab = 'checklist' | 'shopping' | 'supplies' | 'chore' | 'template'

const LIFE_TABS: { value: LifeSubTab; label: string }[] = [
  { value: 'checklist', label: '체크리스트' },
  { value: 'shopping', label: '장보기' },
  { value: 'supplies', label: '생활용품' },
  { value: 'chore', label: '집안일' },
  { value: 'template', label: '템플릿' },
]

interface Props {
  externalRefreshKey: number
}

export default function LifePage({ externalRefreshKey }: Props) {
  const [activeTab, setActiveTab] = useState<LifeSubTab>('checklist')
  const [refreshKey, setRefreshKey] = useState(0)
  const onRefresh = () => setRefreshKey((key) => key + 1)
  const pageRefreshKey = refreshKey + externalRefreshKey

  return (
    <div>
      <div className="oz-tab-strip bg-[#f7f7f7] lg:px-8">
        {LIFE_TABS.map((t) => (
          <button
            key={t.value}
            onClick={() => setActiveTab(t.value)}
            className={`oz-sub-tab ${
              activeTab === t.value
                ? 'bg-[#222222] text-white border-[#222222]'
                : 'bg-white text-[#6a6a6a] border-[#dddddd]'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {activeTab === 'checklist' && (
        <ChecklistTab refreshKey={pageRefreshKey} onRefresh={onRefresh} />
      )}
      {activeTab === 'shopping' && (
        <ShoppingTab refreshKey={pageRefreshKey} onRefresh={onRefresh} />
      )}
      {activeTab === 'supplies' && (
        <SuppliesTab refreshKey={pageRefreshKey} onRefresh={onRefresh} />
      )}
      {activeTab === 'chore' && (
        <ChoreTab refreshKey={pageRefreshKey} onRefresh={onRefresh} />
      )}
      {activeTab === 'template' && (
        <TemplateTab onRefresh={onRefresh} />
      )}
    </div>
  )
}
