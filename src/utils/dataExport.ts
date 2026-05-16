import {
  appSettingsRepo,
  calendarEventRepo,
  checklistItemRepo,
  checklistRepo,
  choreRepo,
  fixedExpenseRepo,
  householdRepo,
  householdSupplyRepo,
  incomeRepo,
  ledgerEntryRepo,
  lifeRecordRepo,
  memberRepo,
  shoppingItemRepo,
  subscriptionRepo,
  templateRepo,
} from '../data/repositories'
import { trackEvent } from './analytics'

function readCustomCategories() {
  try {
    return JSON.parse(localStorage.getItem('onzip_custom_categories') ?? '{}') as unknown
  } catch {
    return {}
  }
}

function readTabMemos() {
  try {
    return JSON.parse(localStorage.getItem('onzip_tab_memos') ?? '{}') as unknown
  } catch {
    return {}
  }
}

export function exportLocalData() {
  const exportedAt = new Date().toISOString()
  const payload = {
    app: 'onzip',
    version: 1,
    exported_at: exportedAt,
    note: '온집 로컬 저장 데이터 내보내기 파일입니다. 서버에는 저장되지 않습니다.',
    data: {
      households: householdRepo.getAll(),
      members: memberRepo.getAll(),
      calendar_events: calendarEventRepo.getAll(),
      ledger_entries: ledgerEntryRepo.getAll(),
      fixed_expenses: fixedExpenseRepo.getAll(),
      incomes: incomeRepo.getAll(),
      subscriptions: subscriptionRepo.getAll(),
      checklists: checklistRepo.getAll(),
      checklist_items: checklistItemRepo.getAll(),
      shopping_items: shoppingItemRepo.getAll(),
      household_supplies: householdSupplyRepo.getAll(),
      chores: choreRepo.getAll(),
      records: lifeRecordRepo.getAll(),
      templates: templateRepo.getAll(),
      app_settings: appSettingsRepo.getAll(),
      custom_categories: readCustomCategories(),
      tab_memos: readTabMemos(),
    },
  }

  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: 'application/json;charset=utf-8',
  })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `onzip_backup_${exportedAt.slice(0, 10)}.json`
  a.click()
  URL.revokeObjectURL(url)

  trackEvent('local_data_export')
}
