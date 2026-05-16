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

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function importCollection(data: Record<string, unknown>, key: string, repo: { importAll: (json: string) => void }) {
  const value = data[key]
  repo.importAll(JSON.stringify(Array.isArray(value) ? value : []))
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

export async function importLocalDataFromFile(file: File) {
  let payload: unknown

  try {
    payload = JSON.parse(await file.text())
  } catch {
    throw new Error('백업 파일을 읽을 수 없습니다.')
  }

  if (!isRecord(payload) || payload.app !== 'onzip' || !isRecord(payload.data)) {
    throw new Error('온집 백업 파일 형식이 아닙니다.')
  }

  const data = payload.data

  importCollection(data, 'households', householdRepo)
  importCollection(data, 'members', memberRepo)
  importCollection(data, 'calendar_events', calendarEventRepo)
  importCollection(data, 'ledger_entries', ledgerEntryRepo)
  importCollection(data, 'fixed_expenses', fixedExpenseRepo)
  importCollection(data, 'incomes', incomeRepo)
  importCollection(data, 'subscriptions', subscriptionRepo)
  importCollection(data, 'checklists', checklistRepo)
  importCollection(data, 'checklist_items', checklistItemRepo)
  importCollection(data, 'shopping_items', shoppingItemRepo)
  importCollection(data, 'household_supplies', householdSupplyRepo)
  importCollection(data, 'chores', choreRepo)
  importCollection(data, 'records', lifeRecordRepo)
  importCollection(data, 'templates', templateRepo)
  importCollection(data, 'app_settings', appSettingsRepo)

  localStorage.setItem(
    'onzip_custom_categories',
    JSON.stringify(isRecord(data.custom_categories) ? data.custom_categories : {}),
  )
  localStorage.setItem(
    'onzip_tab_memos',
    JSON.stringify(isRecord(data.tab_memos) ? data.tab_memos : {}),
  )
  localStorage.setItem('onzip_seed_done_v1', 'true')
  localStorage.setItem('onzip_full_reset_done_20260516_v1', 'true')

  trackEvent('local_data_import')
}
