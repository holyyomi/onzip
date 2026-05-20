import { useState, useMemo } from 'react'
import { checklistRepo, checklistItemRepo } from '../../data/repositories'
import { newId, now } from '../../data/repositories/base'
import EmptyState from '../common/EmptyState'
import ChecklistFormModal from './ChecklistFormModal'

interface Props {
  refreshKey: number
  onRefresh: () => void
}

export default function ChecklistTab({ refreshKey, onRefresh }: Props) {
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [newItemTexts, setNewItemTexts] = useState<Record<string, string>>({})
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [localRefresh, setLocalRefresh] = useState(0)

  const checklists = useMemo(
    () => checklistRepo.getByHousehold('default'),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [refreshKey, localRefresh],
  )

  function localReload() { setLocalRefresh((k) => k + 1) }

  function toggleItem(itemId: string, current: boolean) {
    checklistItemRepo.update(itemId, { is_done: !current })
    localReload()
  }

  function addItem(checklistId: string) {
    const text = (newItemTexts[checklistId] ?? '').trim()
    if (!text) return
    const items = checklistItemRepo.getByChecklist(checklistId)
    checklistItemRepo.create({
      id: newId(), checklist_id: checklistId, content: text,
      is_done: false, sort_order: items.length,
      created_at: now(), updated_at: now(),
    })
    setNewItemTexts((prev) => ({ ...prev, [checklistId]: '' }))
    localReload()
  }

  function deleteItem(itemId: string) {
    checklistItemRepo.delete(itemId)
    localReload()
  }

  return (
    <div>
      <div className="px-4 py-3 flex justify-between items-center bg-white border-b border-gray-100">
        <span className="text-sm font-semibold text-gray-700">체크리스트</span>
        <button
          onClick={() => { setEditingId(null); setShowModal(true) }}
          className="min-h-[36px] rounded-full border border-[#ffd1da] bg-white px-3 text-sm font-semibold text-[#ff385c]"
        >
          + 새 목록
        </button>
      </div>

      <div className="p-4 space-y-3">
        {checklists.length === 0 && (
          <EmptyState
            message="체크리스트가 비어 있습니다"
            sub="여행 준비, 이사 준비, 가족 체크리스트를 목록으로 정리해보세요."
            actionLabel="체크리스트 만들기"
            onAction={() => { setEditingId(null); setShowModal(true) }}
          />
        )}

        {checklists.map((cl) => {
          const items = checklistItemRepo.getByChecklist(cl.id)
          const doneCount = items.filter((i) => i.is_done).length
          const rate = items.length ? Math.round((doneCount / items.length) * 100) : 0
          const isExpanded = expandedId === cl.id

          return (
            <div key={cl.id} className="oz-card overflow-hidden">
              {/* 헤더 */}
              <div className="px-4 py-3">
                <div className="flex items-center justify-between mb-2">
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : cl.id)}
                    className="flex-1 text-left"
                  >
                    <p className="text-sm font-semibold text-gray-800">{cl.title}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {doneCount}/{items.length} 완료
                      {cl.due_date ? ` · 마감 ${cl.due_date}` : ''}
                    </p>
                  </button>
                  <button
                    onClick={() => { setEditingId(cl.id); setShowModal(true) }}
                    className="text-xs text-gray-400 border border-gray-200 rounded px-2 py-1 ml-2"
                  >
                    수정
                  </button>
                </div>

                {/* 진행률 바 */}
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#ff385c] rounded-full transition-all"
                    style={{ width: `${rate}%` }}
                  />
                </div>
              </div>

              {/* 항목 (펼침) */}
              {isExpanded && (
                <div className="border-t border-gray-100">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-3 px-4 py-2.5 border-b border-gray-50"
                    >
                      <button
                        onClick={() => toggleItem(item.id, item.is_done)}
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                          item.is_done
                            ? 'bg-[#ff385c] border-[#ff385c] text-white'
                            : 'border-gray-300'
                        }`}
                      >
                        {item.is_done && <span className="text-xs leading-none">✓</span>}
                      </button>
                      <span
                        className={`flex-1 text-sm ${
                          item.is_done ? 'line-through text-gray-300' : 'text-gray-700'
                        }`}
                      >
                        {item.content}
                      </span>
                      <button
                        onClick={() => deleteItem(item.id)}
                        className="text-gray-300 text-sm px-1"
                      >
                        ×
                      </button>
                    </div>
                  ))}

                  {/* 항목 추가 인라인 */}
                  <div className="flex items-center gap-2 px-4 py-2">
                    <input
                      type="text"
                      placeholder="항목 추가..."
                      value={newItemTexts[cl.id] ?? ''}
                      onChange={(e) =>
                        setNewItemTexts((prev) => ({ ...prev, [cl.id]: e.target.value }))
                      }
                      onKeyDown={(e) => e.key === 'Enter' && addItem(cl.id)}
                      className="flex-1 text-sm text-gray-700 focus:outline-none placeholder-gray-300"
                    />
                    <button
                      onClick={() => addItem(cl.id)}
                      className="text-xs font-semibold text-[#ff385c]"
                    >
                      추가
                    </button>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {showModal && (
        <ChecklistFormModal
          checklistId={editingId}
          onSaved={() => { setShowModal(false); localReload(); onRefresh() }}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  )
}
