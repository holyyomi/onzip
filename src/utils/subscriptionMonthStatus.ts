import type { Subscription } from '../data/models'

export const SUBSCRIPTION_MONTH_STATUS_KEY = 'onzip_subscription_month_status'

export type SubscriptionMonthStatus = 'pending' | 'paid'
type SubscriptionMonthStatusMap = Record<string, SubscriptionMonthStatus>

function makeMonthKey(id: string, year: number, month: number): string {
  return `${id}_${year}-${String(month).padStart(2, '0')}`
}

function readStatusMap(): SubscriptionMonthStatusMap {
  try {
    const value = JSON.parse(localStorage.getItem(SUBSCRIPTION_MONTH_STATUS_KEY) ?? '{}') as unknown
    if (typeof value !== 'object' || value === null || Array.isArray(value)) return {}

    return Object.entries(value).reduce<SubscriptionMonthStatusMap>((acc, [key, status]) => {
      if (status === 'pending' || status === 'paid') acc[key] = status
      return acc
    }, {})
  } catch {
    return {}
  }
}

function writeStatusMap(map: SubscriptionMonthStatusMap) {
  localStorage.setItem(SUBSCRIPTION_MONTH_STATUS_KEY, JSON.stringify(map))
}

export function getSubscriptionMonthStatus(
  subscription: Pick<Subscription, 'id'>,
  year: number,
  month: number,
): SubscriptionMonthStatus {
  return readStatusMap()[makeMonthKey(subscription.id, year, month)] ?? 'pending'
}

export function setSubscriptionMonthStatus(
  id: string,
  year: number,
  month: number,
  status: SubscriptionMonthStatus,
) {
  const map = readStatusMap()
  map[makeMonthKey(id, year, month)] = status
  writeStatusMap(map)
}

export function readSubscriptionMonthStatusBackup(): SubscriptionMonthStatusMap {
  return readStatusMap()
}

export function writeSubscriptionMonthStatusBackup(value: unknown) {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    writeStatusMap({})
    return
  }

  const next = Object.entries(value).reduce<SubscriptionMonthStatusMap>((acc, [key, status]) => {
    if (status === 'pending' || status === 'paid') acc[key] = status
    return acc
  }, {})
  writeStatusMap(next)
}
