import { useMemo, useState } from 'react'
import { checklistItemRepo, checklistRepo } from '../../data/repositories'
import { newId, now } from '../../data/repositories/base'
import { getOrCreateSimpleChecklistId } from '../../utils/simpleChecklist'
import ChecklistItemFormModal from './ChecklistItemFormModal'

interface Props {
  refreshKey: number
  onRefresh: () => void
}

interface ChecklistRow {
  id: string
  content: string
  isDone: boolean
  createdAt: string
}

export default function ChecklistTab({ refreshKey, onRefresh }: Props) {
  const [newText, setNewText] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [localRefresh, setLocalRefresh] = useState(0)

  const rows = useMemo<ChecklistRow[]>(() => {
    const checklists = checklistRepo.getByHousehold('default')
    return checklists
      .flatMap((checklist) =>
        checklistItemRepo.getByChecklist(checklist.id).map((item) => ({
          id: item.id,
          content: item.content,
          isDone: item.is_done,
          createdAt: item.created_at,
        })),
      )
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshKey, localRefresh])

  const doneCount = rows.filter((row) => row.isDone).length
  const remainingCount = rows.length - doneCount

  function reload() {
    setLocalRefresh((key) => key + 1)
    onRefresh()
  }

  function addItem() {
    const content = newText.trim()
    if (!content) return

    const checklistId = getOrCreateSimpleChecklistId()
    const items = checklistItemRepo.getByChecklist(checklistId)
    checklistItemRepo.create({
      id: newId(),
      checklist_id: checklistId,
      content,
      is_done: false,
      sort_order: items.length,
      created_at: now(),
      updated_at: now(),
    })
    setNewText('')
    reload()
  }

  function toggleItem(itemId: string, isDone: boolean) {
    checklistItemRepo.update(itemId, { is_done: !isDone })
    reload()
  }

  function deleteItem(itemId: string) {
    checklistItemRepo.delete(itemId)
    reload()
  }

  return (
    <div className="px-4 py-3 lg:px-8 lg:py-5">
      <section className="oz-card p-4">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <h2 className="text-lg font-semibold text-[#222222]">체크리스트</h2>
            <p className="mt-0.5 text-xs text-[#8a8a8a]">
              남은 항목 {remainingCount}개
            </p>
          </div>
          <span className="rounded-full bg-[#f7f7f7] px-3 py-1.5 text-xs font-semibold text-[#6a6a6a]">
            완료 {doneCount}/{rows.length}
          </span>
        </div>

        <div className="mt-4 flex gap-2">
          <input
            type="text"
            placeholder="할 일을 입력하세요"
            value={newText}
            onChange={(event) => setNewText(event.target.value)}
            onKeyDown={(event) => event.key === 'Enter' && addItem()}
            className="min-h-[48px] min-w-0 flex-1 rounded-[16px] border border-[#dddddd] bg-white px-4 text-base text-[#222222] focus:border-[#222222] focus:outline-none"
          />
          <button
            onClick={addItem}
            className="min-h-[48px] flex-shrink-0 rounded-full bg-[#ff385c] px-5 text-sm font-semibold text-white active:bg-[#e00b41]"
          >
            추가
          </button>
        </div>
      </section>

      <section className="mt-3 overflow-hidden rounded-[22px] border border-[#ebebeb] bg-white">
        {rows.length === 0 ? (
          <div className="px-5 py-10 text-center">
            <p className="text-sm font-semibold text-[#222222]">아직 체크리스트가 없습니다</p>
            <p className="mt-1 text-xs text-[#8a8a8a]">위 입력창에 할 일을 하나씩 추가하세요.</p>
          </div>
        ) : (
          <div className="divide-y divide-[#f0f0f0]">
            {rows.map((row) => (
              <div key={row.id} className="flex items-center gap-3 px-4 py-3">
                <input
                  type="checkbox"
                  checked={row.isDone}
                  onChange={() => toggleItem(row.id, row.isDone)}
                  className="h-5 w-5 flex-shrink-0 accent-[#ff385c]"
                  aria-label={`${row.content} 완료 여부`}
                />
                <button
                  onClick={() => toggleItem(row.id, row.isDone)}
                  className={`min-w-0 flex-1 text-left text-sm font-medium ${
                    row.isDone ? 'text-[#b0b0b0] line-through' : 'text-[#222222]'
                  }`}
                >
                  <span className="block whitespace-pre-wrap break-words leading-relaxed">{row.content}</span>
                </button>
                <button
                  onClick={() => setEditingId(row.id)}
                  className="min-h-[34px] flex-shrink-0 rounded-full border border-[#dddddd] bg-white px-3 text-xs font-semibold text-[#6a6a6a]"
                >
                  수정
                </button>
                <button
                  onClick={() => deleteItem(row.id)}
                  className="min-h-[34px] flex-shrink-0 rounded-full border border-red-100 bg-white px-3 text-xs font-semibold text-red-500"
                >
                  삭제
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {editingId && (
        <ChecklistItemFormModal
          itemId={editingId}
          onSaved={() => {
            setEditingId(null)
            reload()
          }}
          onClose={() => setEditingId(null)}
        />
      )}
    </div>
  )
}
