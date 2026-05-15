import { useState } from 'react'
import ChecklistTab from '../life/ChecklistTab'
import ShoppingTab from '../life/ShoppingTab'
import SuppliesTab from '../life/SuppliesTab'
import ChoreTab from '../life/ChoreTab'
import TemplateTab from '../life/TemplateTab'
import TabMemoCard from '../common/TabMemoCard'

type LifeSubTab = 'checklist' | 'shopping' | 'supplies' | 'chore' | 'template'

const SUB_TABS: { value: LifeSubTab; label: string }[] = [
  { value: 'checklist', label: '할 일' },
  { value: 'shopping', label: '장보기' },
  { value: 'supplies', label: '용품' },
  { value: 'chore', label: '집안일' },
  { value: 'template', label: '템플릿' },
]

export default function LifePage() {
  const [activeTab, setActiveTab] = useState<LifeSubTab>('checklist')
  const [refreshKey, setRefreshKey] = useState(0)

  const onRefresh = () => setRefreshKey((k) => k + 1)

  return (
    <div>
      <div className="oz-tab-strip bg-[#f7f7f7]">
        {SUB_TABS.map((t) => (
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

      <div className="px-5 py-5">
        <TabMemoCard tab="life" title="생활 메모" placeholder="살 것, 챙길 것, 집안일 메모를 편하게 적어두세요." />
      </div>
    </div>
  )
}
