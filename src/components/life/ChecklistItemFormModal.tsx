import { useState } from 'react'
import FormModal, { Field, FormActions, inputCls } from '../common/FormModal'
import { checklistItemRepo } from '../../data/repositories'
import { newId, now } from '../../data/repositories/base'
import { getOrCreateSimpleChecklistId } from '../../utils/simpleChecklist'
import { trackEvent } from '../../utils/analytics'

interface Props {
  itemId: string | null
  onSaved: () => void
  onClose: () => void
}

export default function ChecklistItemFormModal({ itemId, onSaved, onClose }: Props) {
  const existing = itemId ? checklistItemRepo.getById(itemId) : undefined
  const [content, setContent] = useState(existing?.content ?? '')
  const [error, setError] = useState('')

  function handleSave() {
    const trimmed = content.trim()
    if (!trimmed) {
      setError('내용을 입력해주세요')
      return
    }

    if (itemId && existing) {
      checklistItemRepo.update(itemId, { content: trimmed })
    } else {
      const checklistId = getOrCreateSimpleChecklistId()
      const items = checklistItemRepo.getByChecklist(checklistId)
      checklistItemRepo.create({
        id: newId(),
        checklist_id: checklistId,
        content: trimmed,
        is_done: false,
        sort_order: items.length,
        created_at: now(),
        updated_at: now(),
      })
    }

    trackEvent('checklist_saved', { mode: itemId ? 'edit' : 'create' })
    onSaved()
  }

  function handleDelete() {
    if (!itemId) return
    checklistItemRepo.delete(itemId)
    trackEvent('checklist_saved', { mode: 'delete' })
    onSaved()
  }

  return (
    <FormModal title={itemId ? '항목 수정' : '체크리스트 추가'} onClose={onClose}>
      <Field label="내용">
        <input
          type="text"
          placeholder="예) 관리비 납부 확인"
          value={content}
          onChange={(event) => {
            setContent(event.target.value)
            setError('')
          }}
          onKeyDown={(event) => event.key === 'Enter' && handleSave()}
          className={inputCls}
          autoFocus
        />
        {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
      </Field>

      <FormActions
        onSave={handleSave}
        onDelete={itemId ? handleDelete : undefined}
        saveLabel={itemId ? '수정 완료' : '추가'}
      />
    </FormModal>
  )
}
