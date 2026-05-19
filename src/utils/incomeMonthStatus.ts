import type { Income } from '../data/models'

export const INCOME_MONTH_STATUS_KEY = 'onzip_income_month_status'

export type IncomeMonthStatus = 'pending' | 'received'
type IncomeMonthStatusMap = Record<string, IncomeMonthStatus>

function makeMonthKey(id: string, year: number, month: number): string {
  return `${id}_${year}-${String(month).padStart(2, '0')}`
}

function readStatusMap(): IncomeMonthStatusMap {
  try {
    const value = JSON.parse(localStorage.getItem(INCOME_MONTH_STATUS_KEY) ?? '{}') as unknown
    if (typeof value !== 'object' || value === null || Array.isArray(value)) return {}

    return Object.entries(value).reduce<IncomeMonthStatusMap>((acc, [key, status]) => {
      if (status === 'pending' || status === 'received') acc[key] = status
      return acc
    }, {})
  } catch {
    return {}
  }
}

function writeStatusMap(map: IncomeMonthStatusMap) {
  localStorage.setItem(INCOME_MONTH_STATUS_KEY, JSON.stringify(map))
}

export function getIncomeMonthStatus(income: Pick<Income, 'id'>, year: number, month: number): IncomeMonthStatus {
  return readStatusMap()[makeMonthKey(income.id, year, month)] ?? 'pending'
}

export function setIncomeMonthStatus(id: string, year: number, month: number, status: IncomeMonthStatus) {
  const map = readStatusMap()
  map[makeMonthKey(id, year, month)] = status
  writeStatusMap(map)
}

export function readIncomeMonthStatusBackup(): IncomeMonthStatusMap {
  return readStatusMap()
}

export function writeIncomeMonthStatusBackup(value: unknown) {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    writeStatusMap({})
    return
  }

  const next = Object.entries(value).reduce<IncomeMonthStatusMap>((acc, [key, status]) => {
    if (status === 'pending' || status === 'received') acc[key] = status
    return acc
  }, {})
  writeStatusMap(next)
}
