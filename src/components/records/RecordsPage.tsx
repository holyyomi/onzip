import { useState, useMemo } from 'react'
import { lifeRecordRepo } from '../../data/repositories'
import type { QuickAddType } from '../common/QuickAddMenu'
import type { RecordType } from '../../data/models'
import RecordFormModal from './RecordFormModal'
import { QUICK_ADD_ICON } from '../../utils/featureIcons'
import EmptyState from '../common/EmptyState'
import { displayAmount, useAmountPrivacy } from '../../utils/amountPrivacy'
import { displayRecordContent, displayRecordTitle, isSecretRecord, useVaultPrivacy } from '../../utils/vaultPrivacy'
import { getVaultRecordBadge, isImportantVaultRecord } from '../../utils/vaultRecords'
import { hasAppPin, verifyAppPin } from '../../utils/appLock'
import type { LifeRecord } from '../../data/models'

const RECORD_TYPE_CONFIG: Record<
  RecordType,
  { label: string; dot: string }
> = {
  life: { label: '중요 메모', dot: 'bg-blue-400' },
  spending_note: { label: '재정 메모', dot: 'bg-orange-400' },
  investment_note: { label: '투자 메모', dot: 'bg-emerald-400' },
  family_meeting: { label: '계약/정리', dot: 'bg-purple-400' },
  anniversary: { label: '갱신/만료', dot: 'bg-pink-400' },
  home: { label: '집/차량', dot: 'bg-green-400' },
}

interface Props {
  externalRefreshKey: number
  onQuickAdd: (type: QuickAddType) => void
}

export default function RecordsPage({ externalRefreshKey, onQuickAdd }: Props) {
  const { hidden: hideAmounts } = useAmountPrivacy()
  const { hidden: hideSensitive } = useVaultPrivacy()
  const [searchQuery, setSearchQuery] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [defaultType, setDefaultType] = useState<RecordType>('life')
  const [refreshKey, setRefreshKey] = useState(0)
  const [unlockRecord, setUnlockRecord] = useState<LifeRecord | null>(null)

  const records = useMemo(() => {
    let list = lifeRecordRepo.getAll()

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
  }, [searchQuery, refreshKey, externalRefreshKey])

  function handleAdd(type: RecordType) {
    setDefaultType(type)
    setEditingId(null)
    setShowModal(true)
  }

  function openRecord(record: LifeRecord) {
    if (hideSensitive && isSecretRecord(record)) {
      setUnlockRecord(record)
      return
    }

    setEditingId(record.id)
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
  const hasSearch = Boolean(searchQuery.trim())

  return (
    <div>
      <div className="px-4 pt-3">
        <button
          onClick={() => onQuickAdd('record')}
          className="w-full oz-card min-h-[88px] p-4 text-left active:scale-[0.99] transition flex items-center gap-3"
        >
          <img src={QUICK_ADD_ICON.record} alt="" className="h-12 w-12 rounded-[18px] object-contain flex-shrink-0" />
          <span className="min-w-0">
          <span className="block text-lg font-semibold text-[#222222]">메모 남기기</span>
          <span className="block text-sm text-[#6a6a6a] mt-1">계좌, 계약, 보험, 중요한 내용을 메모합니다</span>
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

      {/* 빠른 추가 버튼 */}
      <div className="flex gap-2 px-4 py-3 overflow-x-auto bg-white border-b border-gray-100">
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
            message={hasSearch ? '조건에 맞는 메모가 없습니다' : '메모장이 비어 있습니다'}
            sub={hasSearch ? '검색어를 바꿔보세요.' : '꼭 필요한 내용을 간단히 메모하세요.'}
            actionLabel="메모 남기기"
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
                    onClick={() => openRecord(r)}
                    className="w-full oz-card px-4 py-3 text-left"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`w-2 h-2 rounded-full flex-shrink-0 ${cfg.dot}`} />
                      <span className="text-xs text-gray-400">{cfg.label}</span>
                      {isSecretRecord(r) && (
                        <span className="rounded-full bg-gray-100 px-1.5 py-0.5 text-xs font-semibold text-gray-500">
                          비밀
                        </span>
                      )}
                      {isImportantVaultRecord(r) && (
                        <span className="rounded-full bg-[#fff0f3] px-1.5 py-0.5 text-xs font-semibold text-[#ff385c]">
                          {getVaultRecordBadge(r)}
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

      {unlockRecord && (
        <SensitiveUnlockSheet
          record={unlockRecord}
          onClose={() => setUnlockRecord(null)}
          onUnlocked={() => {
            setEditingId(unlockRecord.id)
            setUnlockRecord(null)
            setShowModal(true)
          }}
        />
      )}
    </div>
  )
}

function SensitiveUnlockSheet({
  record,
  onClose,
  onUnlocked,
}: {
  record: LifeRecord
  onClose: () => void
  onUnlocked: () => void
}) {
  const [pin, setPin] = useState('')
  const [error, setError] = useState('')
  const hasPin = hasAppPin()

  function cleanPin(value: string) {
    return value.replace(/\D/g, '').slice(0, 4)
  }

  async function handleUnlock() {
    const ok = await verifyAppPin(pin)
    if (!ok) {
      setError('PIN이 맞지 않습니다.')
      setPin('')
      return
    }

    onUnlocked()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end bg-black/35" onClick={onClose}>
      <div className="w-full max-w-lg rounded-t-[28px] bg-white p-5" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-lg font-semibold text-[#222222]">비밀 메모</p>
            <p className="mt-1 text-sm leading-relaxed text-[#6a6a6a]">
              {record.record_date.replace(/-/g, '. ')} · 4자리 PIN으로 한 번 확인합니다.
            </p>
          </div>
          <button
            onClick={onClose}
            className="h-10 w-10 flex-shrink-0 rounded-full bg-[#f2f2f2] text-lg text-[#6a6a6a]"
            aria-label="닫기"
          >
            ×
          </button>
        </div>

        {hasPin ? (
          <>
            <input
              type="password"
              inputMode="numeric"
              autoFocus
              placeholder="PIN"
              value={pin}
              onChange={(e) => { setPin(cleanPin(e.target.value)); setError('') }}
              onKeyDown={(e) => e.key === 'Enter' && pin.length === 4 && void handleUnlock()}
              className="mt-4 w-full min-h-[52px] rounded-[18px] border border-[#dddddd] bg-white px-4 py-3 text-base text-[#222222] focus:border-[#222222] focus:outline-none"
            />
            {error && <p className="mt-2 text-xs font-semibold text-[#ff385c]">{error}</p>}
            <button
              onClick={() => void handleUnlock()}
              disabled={pin.length !== 4}
              className="mt-4 min-h-[50px] w-full rounded-full bg-[#ff385c] text-sm font-semibold text-white disabled:opacity-40"
            >
              열람하기
            </button>
          </>
        ) : (
          <div className="mt-4 rounded-[18px] bg-[#f7f7f7] p-4">
            <p className="text-sm leading-relaxed text-[#6a6a6a]">
              아직 PIN이 없습니다. 설정에서 비밀 메모 PIN을 정하면 이 메모를 열 수 있습니다.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
