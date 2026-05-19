import { useState, useMemo } from 'react'
import { lifeRecordRepo } from '../../data/repositories'
import type { QuickAddType } from '../common/QuickAddMenu'
import type { RecordType } from '../../data/models'
import RecordFormModal from './RecordFormModal'
import { QUICK_ADD_ICON } from '../../utils/featureIcons'
import EmptyState from '../common/EmptyState'
import { displayAmount, useAmountPrivacy } from '../../utils/amountPrivacy'
import { displayRecordContent, displayRecordTitle, isSensitiveRecord, useVaultPrivacy } from '../../utils/vaultPrivacy'

const RECORD_TYPE_CONFIG: Record<
  RecordType,
  { label: string; dot: string }
> = {
  life: { label: '중요 메모', dot: 'bg-blue-400' },
  spending_note: { label: '돈 메모', dot: 'bg-orange-400' },
  family_meeting: { label: '계약/정리', dot: 'bg-purple-400' },
  anniversary: { label: '갱신/만료', dot: 'bg-pink-400' },
  home: { label: '집/차량', dot: 'bg-green-400' },
}

type FilterType = 'all' | RecordType

interface Props {
  externalRefreshKey: number
  onQuickAdd: (type: QuickAddType) => void
}

export default function RecordsPage({ externalRefreshKey, onQuickAdd }: Props) {
  const { hidden: hideAmounts } = useAmountPrivacy()
  const { hidden: hideSensitive } = useVaultPrivacy()
  const [filter, setFilter] = useState<FilterType>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [defaultType, setDefaultType] = useState<RecordType>('life')
  const [refreshKey, setRefreshKey] = useState(0)

  const records = useMemo(() => {
    let list = lifeRecordRepo.getAll()

    if (filter !== 'all') {
      list = list.filter((r) => r.record_type === filter)
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      list = list.filter(
        (r) =>
          r.title.toLowerCase().includes(q) ||
          r.content.toLowerCase().includes(q) ||
          r.tags.some((t) => t.toLowerCase().includes(q)),
      )
    }

    return list.sort((a, b) => b.record_date.localeCompare(a.record_date))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter, searchQuery, refreshKey, externalRefreshKey])

  function handleAdd(type: RecordType) {
    setDefaultType(type)
    setEditingId(null)
    setShowModal(true)
  }

  // 날짜 그룹
  const grouped = useMemo(() => {
    const map: Record<string, typeof records> = {}
    records.forEach((r) => {
      if (!map[r.record_date]) map[r.record_date] = []
      map[r.record_date].push(r)
    })
    return Object.keys(map)
      .sort()
      .reverse()
      .map((date) => ({ date, items: map[date] }))
  }, [records])

  return (
    <div>
      <div className="px-4 pt-3">
        <button
          onClick={() => onQuickAdd('record')}
          className="w-full oz-card min-h-[88px] p-4 text-left active:scale-[0.99] transition flex items-center gap-3"
        >
          <img src={QUICK_ADD_ICON.record} alt="" className="h-12 w-12 rounded-[18px] object-contain flex-shrink-0" />
          <span className="min-w-0">
          <span className="block text-lg font-semibold text-[#222222]">금고 메모 남기기</span>
          <span className="block text-sm text-[#6a6a6a] mt-1">계좌, 계약, 보험, 중요한 내용을 보관합니다</span>
          </span>
        </button>
      </div>

      {/* 검색 */}
      <div className="px-4 py-3 bg-white border-b border-gray-100">
        <input
          type="text"
          placeholder="계좌, 계약, 보험, 태그 검색..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#ff385c]"
        />
      </div>

      {/* 유형 필터 */}
      <div className="flex overflow-x-auto gap-2 px-4 py-2 bg-white border-b border-gray-100">
        <FilterChip value="all" label="전체" active={filter === 'all'} onClick={() => setFilter('all')} />
        {(Object.entries(RECORD_TYPE_CONFIG) as [RecordType, { label: string; dot: string }][]).map(
          ([type, cfg]) => (
            <FilterChip key={type} value={type} label={cfg.label}
              active={filter === type} onClick={() => setFilter(type)} />
          ),
        )}
      </div>

      {/* 빠른 추가 버튼 */}
      <div className="flex gap-2 px-4 py-3 overflow-x-auto">
        {(Object.entries(RECORD_TYPE_CONFIG) as [RecordType, { label: string; dot: string }][]).map(
          ([type, cfg]) => (
            <button key={type} onClick={() => handleAdd(type)}
              className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 rounded-full text-xs text-gray-600">
              <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
              {cfg.label}
            </button>
          ),
        )}
      </div>

      {/* 기록 목록 */}
      <div className="px-4 pb-6 space-y-4">
        {grouped.length === 0 && (
          <EmptyState
            message="금고가 비어 있습니다"
            sub="남에게 보이기 싫지만 꼭 필요한 내용을 보관하세요."
            actionLabel="금고 메모 남기기"
            onAction={() => onQuickAdd('record')}
          />
        )}

        {grouped.map(({ date, items }) => (
          <div key={date}>
            <p className="text-xs text-gray-400 mb-2">{date.replace(/-/g, '. ')}</p>
            <div className="space-y-2">
              {items.map((r) => {
                const cfg = RECORD_TYPE_CONFIG[r.record_type]
                return (
                  <button
                    key={r.id}
                    onClick={() => { setEditingId(r.id); setShowModal(true) }}
                    className="w-full oz-card px-4 py-3 text-left"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`w-2 h-2 rounded-full flex-shrink-0 ${cfg.dot}`} />
                      <span className="text-xs text-gray-400">{cfg.label}</span>
                      {isSensitiveRecord(r) && (
                        <span className="rounded-full bg-gray-100 px-1.5 py-0.5 text-xs font-semibold text-gray-500">
                          민감
                        </span>
                      )}
                      {r.related_amount && (
                        <span className="text-xs text-gray-400 ml-auto">
                          {displayAmount(r.related_amount, hideAmounts)}
                        </span>
                      )}
                    </div>
                    <p className="text-sm font-semibold text-gray-800 truncate">
                      {displayRecordTitle(r, hideSensitive)}
                    </p>
                    {r.content && (
                      <p className="text-xs text-gray-400 mt-1 line-clamp-2 leading-relaxed">
                        {displayRecordContent(r, hideSensitive)}
                      </p>
                    )}
                    {r.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {r.tags.map((tag) => (
                          <span key={tag} className="text-xs bg-gray-100 text-gray-500 rounded-full px-2 py-0.5">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <RecordFormModal
          recordId={editingId}
          defaultType={defaultType}
          onSaved={() => { setShowModal(false); setRefreshKey((k) => k + 1) }}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  )
}

function FilterChip({
  label, active, onClick,
}: {
  value: string; label: string; active: boolean; onClick: () => void
}) {
  return (
    <button onClick={onClick}
      className={`flex-shrink-0 px-3 py-1 rounded-full text-xs font-medium ${
        active ? 'bg-gray-800 text-white' : 'text-gray-400 border border-gray-200'
      }`}>
      {label}
    </button>
  )
}
