import { checklistRepo } from '../data/repositories'
import { newId, now } from '../data/repositories/base'

const SIMPLE_CHECKLIST_TITLE = '체크리스트'

export function getOrCreateSimpleChecklistId(): string {
  const existing = checklistRepo
    .getByHousehold('default')
    .find((checklist) => checklist.title === SIMPLE_CHECKLIST_TITLE)

  if (existing) return existing.id

  const id = newId()
  checklistRepo.create({
    id,
    household_id: 'default',
    title: SIMPLE_CHECKLIST_TITLE,
    category: '기본',
    member_id: null,
    due_date: null,
    repeat_rule: 'none',
    calendar_visible: false,
    created_at: now(),
    updated_at: now(),
  })

  return id
}
