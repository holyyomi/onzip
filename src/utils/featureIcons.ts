import type { QuickAddType } from '../components/common/QuickAddMenu'
import type { TabId } from '../app/App'

const ICON_BASE = '/icons/features'

export const TAB_ICON: Partial<Record<TabId, string>> = {
  home: `${ICON_BASE}/home.png`,
  calendar: `${ICON_BASE}/calendar.png`,
  money: `${ICON_BASE}/money.png`,
  life: `${ICON_BASE}/life.png`,
  settings: `${ICON_BASE}/settings.png`,
}

export const QUICK_ADD_ICON: Record<QuickAddType, string> = {
  expense: `${ICON_BASE}/money.png`,
  shopping: `${ICON_BASE}/shopping.png`,
  schedule: `${ICON_BASE}/calendar.png`,
  checklist: `${ICON_BASE}/checklist.png`,
  fixed_expense: `${ICON_BASE}/bill.png`,
  subscription: `${ICON_BASE}/subscription.png`,
  record: `${ICON_BASE}/record.png`,
}

export const MEMO_ICON = `${ICON_BASE}/record.png`
