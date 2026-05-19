import { useState } from 'react'
import type { QuickAddType } from '../common/QuickAddMenu'
import ChecklistTab from '../life/ChecklistTab'
import ShoppingTab from '../life/ShoppingTab'
import SuppliesTab from '../life/SuppliesTab'
import ChoreTab from '../life/ChoreTab'
import TemplateTab from '../life/TemplateTab'
import TabMemoCard from '../common/TabMemoCard'
import { QUICK_ADD_ICON } from '../../utils/featureIcons'

type LifeSubTab = 'shopping' | 'checklist' | 'manage'
type LifeManageSubTab = 'supplies' | 'chore' | 'template'

interface Props {
  externalRefreshKey: number
  onQuickAdd: (type: QuickAddType) => void
}

const SUB_TABS: { value: LifeSubTab; label: string }[] = [
  { value: 'shopping', label: '장보기' },
  { value: 'checklist', label: '할 일' },
  { value: 'manage', label: '관리' },
]

const MANAGE_TABS: { value: LifeManageSubTab; label: string }[] = [
  { value: 'supplies', label: '용품' },
  { value: 'chore', label: '집안일' },
  { value: 'template', label: '템플릿' },
]

export default function LifePage({ externalRefreshKey, onQuickAdd }: Props) {
  const [activeTab, setActiveTab] = useState<LifeSubTab>('shopping')
  const [manageTab, setManageTab] = useState<LifeManageSubTab>('supplies')
  const [refreshKey, setRefreshKey] = useState(0)

  const onRefresh = () => setRefreshKey((k) => k + 1)
  const pageRefreshKey = refreshKey + externalRefreshKey

  return (
    <div>
      <div className="px-4 pt-3 grid grid-cols-2 gap-3">
        <LifeQuickButton
          iconSrc={QUICK_ADD_ICON.shopping}
          label="살 것 추가"
          sub="장보기 목록에 넣기"
          onClick={() => onQuickAdd('shopping')}
        />
        <LifeQuickButton
          iconSrc={QUICK_ADD_ICON.checklist}
          label="할 일 목록"
          sub="준비물과 진행 항목"
          onClick={() => onQuickAdd('checklist')}
        />
      </div>

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
        <ChecklistTab refreshKey={pageRefreshKey} onRefresh={onRefresh} />
      )}
      {activeTab === 'shopping' && (
        <ShoppingTab refreshKey={pageRefreshKey} onRefresh={onRefresh} />
      )}
      {activeTab === 'manage' && (
        <>
          <div className="mx-4 mb-2 grid grid-cols-3 gap-2 rounded-[18px] bg-white p-1.5 border border-[#ebebeb]">
            {MANAGE_TABS.map((tab) => (
              <button
                key={tab.value}
                onClick={() => setManageTab(tab.value)}
                className={`min-h-[38px] rounded-[14px] text-sm font-semibold transition-colors ${
                  manageTab === tab.value ? 'bg-[#222222] text-white' : 'text-[#6a6a6a]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          {manageTab === 'supplies' && (
            <SuppliesTab refreshKey={pageRefreshKey} onRefresh={onRefresh} />
          )}
          {manageTab === 'chore' && (
            <ChoreTab refreshKey={pageRefreshKey} onRefresh={onRefresh} />
          )}
          {manageTab === 'template' && <TemplateTab onRefresh={onRefresh} />}
        </>
      )}

      <div className="px-5 py-5">
        <TabMemoCard tab="life" title="생활 메모" placeholder="구매 항목, 준비물, 집안일 관련 내용을 기록하세요." />
      </div>
    </div>
  )
}

function LifeQuickButton({
  iconSrc,
  label,
  sub,
  onClick,
}: {
  iconSrc: string
  label: string
  sub: string
  onClick: () => void
}) {
  return (
    <button onClick={onClick} className="oz-card min-h-[86px] p-3 text-left active:scale-[0.98] transition flex items-center gap-3">
      <img src={iconSrc} alt="" className="h-11 w-11 rounded-[16px] object-contain flex-shrink-0" />
      <span className="min-w-0">
        <span className="block text-base font-semibold text-[#222222]">{label}</span>
        <span className="block text-xs text-[#6a6a6a] mt-1 leading-snug">{sub}</span>
      </span>
    </button>
  )
}
