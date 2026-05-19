import type { FixedExpense, FixedExpenseStatus } from '../data/models'

export const FIXED_EXPENSE_MONTH_STATUS_KEY = 'onzip_fixed_expense_month_status'

type StoredFixedExpenseStatus = Extract<FixedExpenseStatus, 'pending' | 'done'>
type FixedExpenseMonthStatusMap = Record<string, StoredFixedExpenseStatus>

function makeMonthKey(id: string, year: number, month: number): string {
  return `${id}_${year}-${String(month).padStart(2, '0')}`
}

function readStatusMap(): FixedExpenseMonthStatusMap {
  try {
    const value = JSON.parse(localStorage.getItem(FIXED_EXPENSE_MONTH_STATUS_KEY) ?? '{}') as unknown
    if (typeof value !== 'object' || value === null || Array.isArray(value)) return {}

    return Object.entries(value).reduce<FixedExpenseMonthStatusMap>((acc, [key, status]) => {
      if (status === 'pending' || status === 'done') acc[key] = status
      return acc
    }, {})
  } catch {
    return {}
  }
}

function writeStatusMap(map: FixedExpenseMonthStatusMap) {
  localStorage.setItem(FIXED_EXPENSE_MONTH_STATUS_KEY, JSON.stringify(map))
}

export function isCurrentFixedExpenseMonth(year: number, month: number): boolean {
  const now = new Date()
  return year === now.getFullYear() && month === now.getMonth() + 1
}

export function getFixedExpenseMonthStatus(
  expense: Pick<FixedExpense, 'id' | 'status'>,
  year: number,
  month: number,
): FixedExpenseStatus {
  const stored = readStatusMap()[makeMonthKey(expense.id, year, month)]
  if (stored) return stored

  return isCurrentFixedExpenseMonth(year, month) ? expense.status : 'pending'
}

export function setFixedExpenseMonthStatus(
  id: string,
  year: number,
  month: number,
  status: StoredFixedExpenseStatus,
) {
  const map = readStatusMap()
  map[makeMonthKey(id, year, month)] = status
  writeStatusMap(map)
}

export function readFixedExpenseMonthStatusBackup(): FixedExpenseMonthStatusMap {
  return readStatusMap()
}

export function writeFixedExpenseMonthStatusBackup(value: unknown) {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    writeStatusMap({})
    return
  }

  const next = Object.entries(value).reduce<FixedExpenseMonthStatusMap>((acc, [key, status]) => {
    if (status === 'pending' || status === 'done') acc[key] = status
    return acc
  }, {})
  writeStatusMap(next)
}
