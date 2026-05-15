import { useState, useMemo } from 'react'
import { shoppingItemRepo } from '../../data/repositories'
import { formatAmount } from '../../utils/date'
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

  const allItems = useMemo(
    () => shoppingItemRepo.getAll(),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [refreshKey, localRefresh],
  )

  const pendingItems = allItems.filter((i) => !i.is_done)
  const favorites = allItems.filter((i) => i.is_favorite && !i.is_done)
  const doneItems = allItems.filter((i) => i.is_done)
  const expectedTotal = shoppingItemRepo.expectedTotal(pendingItems)

  function toggleDone(id: string, current: boolean) {
    shoppingItemRepo.update(id, { is_done: !current })
    setLocalRefresh((k) => k + 1)
  }

  function addFromFavorite(favName: string, category: string) {
    const alreadyPending = pendingItems.some((i) => i.name === favName)
    if (alreadyPending) return
    shoppingItemRepo.create({
      id: crypto.randomUUID(), household_id: 'default',
      name: favName, category, expected_amount: null, actual_amount: null,
      store: '', is_done: false, is_favorite: false, memo: '',
      created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
    })
    setLocalRefresh((k) => k + 1)
  }

  const displayItems = showFavorites ? favorites : pendingItems

  return (
    <div>
      {/* 상단 */}
      <div className="px-4 py-3 bg-white border-b border-gray-100 flex justify-between items-center">
        <div>
          <p className="text-xs text-gray-400">예상 총액</p>
          <p className="text-lg font-bold text-gray-800">{formatAmount(expectedTotal)}</p>
        </div>
        <button
          onClick={() => { setEditingId(null); setShowModal(true) }}
          className="text-sm text-blue-500 border border-blue-200 rounded-lg px-3 py-1.5"
        >
          + 추가
        </button>
      </div>

      {/* 보기 전환 */}
      <div className="flex gap-2 px-4 py-2 bg-white border-b border-gray-100">
        <button onClick={() => setShowFavorites(false)}
          className={`px-3 py-1 rounded-full text-xs font-medium ${!showFavorites ? 'bg-gray-800 text-white' : 'text-gray-400 border border-gray-200'}`}>
          장보기 목록
        </button>
        <button onClick={() => setShowFavorites(true)}
          className={`px-3 py-1 rounded-full text-xs font-medium ${showFavorites ? 'bg-gray-800 text-white' : 'text-gray-400 border border-gray-200'}`}>
          자주 사는 품목
        </button>
      </div>

      <div className="p-4 space-y-2">
        {displayItems.length === 0 && (
          <div className="text-center py-10 text-sm text-gray-300">
            {showFavorites ? '자주 사는 품목이 없습니다' : '장보기 목록이 비어있습니다'}
          </div>
        )}

        {displayItems.map((item) => (
          <div key={item.id} className="bg-white rounded-xl px-4 py-3 flex items-center gap-3">
            {/* 체크 버튼 */}
            {!showFavorites && (
              <button
                onClick={() => toggleDone(item.id, item.is_done)}
                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                  item.is_done ? 'bg-green-500 border-green-500 text-white' : 'border-gray-300'
                }`}
              >
                {item.is_done && <span className="text-xs">✓</span>}
              </button>
            )}

            <button
              onClick={() => { setEditingId(item.id); setShowModal(true) }}
              className="flex-1 text-left min-w-0"
            >
              <p className="text-sm font-medium text-gray-800 truncate">{item.name}</p>
              <p className="text-xs text-gray-400 mt-0.5">
                {item.category}{item.store ? ` · ${item.store}` : ''}
              </p>
            </button>

            <div className="flex items-center gap-2 flex-shrink-0">
              {item.expected_amount && (
                <span className="text-xs text-gray-500">{formatAmount(item.expected_amount)}</span>
              )}
              {showFavorites && (
                <button
                  onClick={() => addFromFavorite(item.name, item.category)}
                  className="text-xs text-blue-500 border border-blue-200 rounded px-2 py-1"
                >
                  추가
                </button>
              )}
            </div>
          </div>
        ))}

        {/* 구매 완료 영역 */}
        {!showFavorites && doneItems.length > 0 && (
          <div className="mt-4">
            <p className="text-xs text-gray-400 mb-2">구매 완료 ({doneItems.length}개)</p>
            {doneItems.map((item) => (
              <div key={item.id} className="bg-white rounded-xl px-4 py-3 flex items-center gap-3 opacity-50">
                <button
                  onClick={() => toggleDone(item.id, item.is_done)}
                  className="w-6 h-6 rounded-full bg-green-500 border-green-500 text-white flex items-center justify-center flex-shrink-0"
                >
                  <span className="text-xs">✓</span>
                </button>
                <span className="text-sm line-through text-gray-400">{item.name}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <ShoppingFormModal
          itemId={editingId}
          onSaved={() => { setShowModal(false); setLocalRefresh((k) => k + 1); onRefresh() }}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  )
}
