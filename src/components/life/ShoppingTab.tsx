import { useState, useMemo } from 'react'
import { shoppingItemRepo } from '../../data/repositories'
import { formatAmount } from '../../utils/date'
import { newId, now } from '../../data/repositories/base'
import EmptyState from '../common/EmptyState'
import ShoppingFormModal from './ShoppingFormModal'

interface Props {
  refreshKey: number
  onRefresh: () => void
}

export default function ShoppingTab({ refreshKey, onRefresh }: Props) {
  const [showFavorites, setShowFavorites] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [localRefresh, setLocalRefresh] = useState(0)
  // 실제금액 입력 상태
  const [confirmingId, setConfirmingId] = useState<string | null>(null)
  const [actualInput, setActualInput] = useState('')

  const allItems = useMemo(
    () => shoppingItemRepo.getAll(),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [refreshKey, localRefresh],
  )

  const pendingItems = allItems.filter((i) => !i.is_done)
  const favorites = allItems.filter((i) => i.is_favorite && !i.is_done)
  const doneItems = allItems.filter((i) => i.is_done)
  const expectedTotal = shoppingItemRepo.expectedTotal(pendingItems)
  const actualTotal = doneItems.reduce((s, i) => s + (i.actual_amount ?? i.expected_amount ?? 0), 0)

  // 체크 클릭 → 실제금액 입력 모달 표시
  function handleCheckClick(id: string, expectedAmount: number | null) {
    setConfirmingId(id)
    setActualInput(expectedAmount != null ? String(expectedAmount) : '')
  }

  function confirmDone() {
    if (!confirmingId) return
    const actual = actualInput ? Number(actualInput) : null
    shoppingItemRepo.update(confirmingId, { is_done: true, actual_amount: actual })
    setConfirmingId(null)
    setActualInput('')
    setLocalRefresh((k) => k + 1)
  }

  function undoDone(id: string) {
    shoppingItemRepo.update(id, { is_done: false, actual_amount: null })
    setLocalRefresh((k) => k + 1)
  }

  function addFromFavorite(favName: string, category: string) {
    if (pendingItems.some((i) => i.name === favName)) return
    shoppingItemRepo.create({
      id: newId(), household_id: 'default',
      name: favName, category, expected_amount: null, actual_amount: null,
      store: '', is_done: false, is_favorite: false, memo: '',
      created_at: now(), updated_at: now(),
    })
    setLocalRefresh((k) => k + 1)
  }

  const displayItems = showFavorites ? favorites : pendingItems

  return (
    <div>
      {/* 상단 요약 */}
      <div className="px-4 py-3 bg-white border-b border-gray-100 flex justify-between items-center">
        <div>
          <div className="flex gap-3">
            <div>
              <p className="text-xs text-gray-400">예상</p>
              <p className="text-sm font-bold text-gray-600">{formatAmount(expectedTotal)}</p>
            </div>
            {actualTotal > 0 && (
              <div>
                <p className="text-xs text-gray-400">실제</p>
                <p className="text-sm font-bold text-blue-600">{formatAmount(actualTotal)}</p>
              </div>
            )}
          </div>
        </div>
        <button onClick={() => { setEditingId(null); setShowModal(true) }}
          className="min-h-[36px] rounded-full border border-[#ffd1da] bg-white px-3 text-sm font-semibold text-[#ff385c]">
          + 추가
        </button>
      </div>

      {/* 보기 전환 */}
      <div className="flex gap-2 px-4 py-2 bg-white border-b border-gray-100">
        {(['장보기 목록', '자주 사는 품목'] as const).map((label, i) => (
          <button key={label} onClick={() => setShowFavorites(i === 1)}
            className={`px-3 py-1 rounded-full text-xs font-medium ${
              showFavorites === (i === 1) ? 'bg-gray-800 text-white' : 'text-gray-400 border border-gray-200'
            }`}>
            {label}
          </button>
        ))}
      </div>

      <div className="p-4 space-y-2">
        {displayItems.length === 0 && (
          <EmptyState
            message={showFavorites ? '자주 사는 품목이 없습니다' : '구매 항목이 비어 있습니다'}
            sub={showFavorites ? '반복해서 사는 물건은 즐겨찾기로 보관할 수 있습니다.' : '필요한 물건을 바로 추가해보세요.'}
            actionLabel="구매 항목 추가"
            onAction={() => { setEditingId(null); setShowModal(true) }}
          />
        )}

        {displayItems.map((item) => (
          <div key={item.id} className="oz-card px-4 py-3 flex items-center gap-3">
            {!showFavorites && (
              <button
                onClick={() => handleCheckClick(item.id, item.expected_amount)}
                className="w-6 h-6 rounded-full border-2 border-gray-300 flex items-center justify-center flex-shrink-0 hover:border-[#ff385c] transition-colors"
              />
            )}
            <button onClick={() => { setEditingId(item.id); setShowModal(true) }}
              className="flex-1 text-left min-w-0">
              <p className="text-sm font-medium text-gray-800 truncate">{item.name}</p>
              <p className="text-xs text-gray-400 mt-0.5">
                {item.category}{item.store ? ` · ${item.store}` : ''}
              </p>
            </button>
            <div className="flex items-center gap-2 flex-shrink-0">
              {item.expected_amount && (
                <span className="text-xs text-gray-400">{formatAmount(item.expected_amount)}</span>
              )}
              {showFavorites && (
                <button onClick={() => addFromFavorite(item.name, item.category)}
                  className="rounded-full border border-[#ffd1da] px-2.5 py-1 text-xs font-semibold text-[#ff385c]">
                  추가
                </button>
              )}
            </div>
          </div>
        ))}

        {/* 구매 완료 목록 */}
        {!showFavorites && doneItems.length > 0 && (
          <div className="mt-4">
            <div className="flex justify-between items-center mb-2">
              <p className="text-xs text-gray-400">구매 완료 ({doneItems.length}개)</p>
              {actualTotal > 0 && (
                <p className="text-xs text-blue-500 font-medium">실제 {formatAmount(actualTotal)}</p>
              )}
            </div>
            {doneItems.map((item) => (
              <div key={item.id} className="oz-card px-4 py-3 flex items-center gap-3 opacity-60 mb-2">
                <button onClick={() => undoDone(item.id)}
                  className="w-6 h-6 rounded-full bg-green-500 text-white flex items-center justify-center flex-shrink-0 text-xs">
                  ✓
                </button>
                <span className="flex-1 text-sm line-through text-gray-400 truncate">{item.name}</span>
                {item.actual_amount != null && (
                  <span className="text-xs text-blue-500">{formatAmount(item.actual_amount)}</span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 실제금액 입력 미니 모달 */}
      {confirmingId && (
        <div className="fixed inset-0 z-50 flex items-end bg-black/30" onClick={() => setConfirmingId(null)}>
          <div className="w-full bg-white rounded-t-2xl p-5 max-w-lg mx-auto" onClick={(e) => e.stopPropagation()}>
            <p className="text-sm font-semibold text-gray-800 mb-3">실제 구매 금액</p>
            <div className="flex gap-2">
              <input
                type="number"
                placeholder="금액 (선택)"
                value={actualInput}
                onChange={(e) => setActualInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && confirmDone()}
                className="flex-1 border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#ff385c]"
                inputMode="numeric"
                autoFocus
              />
              <button onClick={confirmDone}
                className="rounded-full bg-[#ff385c] px-4 py-2.5 text-sm font-semibold text-white">
                완료
              </button>
            </div>
            <button onClick={() => { setActualInput(''); confirmDone() }}
              className="w-full mt-2 text-xs text-gray-400 text-center py-1">
              금액 없이 완료
            </button>
          </div>
        </div>
      )}

      {showModal && (
        <ShoppingFormModal itemId={editingId}
          onSaved={() => { setShowModal(false); setLocalRefresh((k) => k + 1); onRefresh() }}
          onClose={() => setShowModal(false)} />
      )}
    </div>
  )
}
