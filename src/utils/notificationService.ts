import { fixedExpenseRepo, incomeRepo, subscriptionRepo, appSettingsRepo } from '../data/repositories'
import { getEffectiveMonthDay, todayYear, todayMonth } from './date'
import { getFixedExpenseMonthStatus } from './fixedExpenseMonthStatus'
import { getIncomeMonthStatus } from './incomeMonthStatus'
import { getSubscriptionMonthStatus } from './subscriptionMonthStatus'

const NOTIF_ENABLED_KEY = 'notif_enabled'
const NOTIF_LAST_CHECK_KEY = 'onzip_notif_last_check'

export function isNotificationEnabled(): boolean {
  return appSettingsRepo.get('default', NOTIF_ENABLED_KEY) === 'true'
}

export function setNotificationEnabled(enabled: boolean): void {
  appSettingsRepo.set('default', NOTIF_ENABLED_KEY, enabled ? 'true' : 'false')
}

export function getNotificationPermission(): NotificationPermission | 'unsupported' {
  if (!('Notification' in window)) return 'unsupported'
  return Notification.permission
}

export async function requestAndEnable(): Promise<'granted' | 'denied' | 'unsupported'> {
  if (!('Notification' in window)) return 'unsupported'
  if (Notification.permission === 'granted') {
    setNotificationEnabled(true)
    return 'granted'
  }
  if (Notification.permission === 'denied') return 'denied'
  const result = await Notification.requestPermission()
  if (result === 'granted') {
    setNotificationEnabled(true)
    return 'granted'
  }
  return 'denied'
}

function shouldRunCheck(): boolean {
  const last = localStorage.getItem(NOTIF_LAST_CHECK_KEY)
  if (!last) return true
  // 4시간마다 한 번만 체크
  return Date.now() - Number(last) > 4 * 60 * 60 * 1000
}

function daysFromToday(year: number, month: number, day: number): number {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const target = new Date(year, month - 1, day)
  return Math.round((target.getTime() - today.getTime()) / 86400000)
}

export function checkAndNotify(): void {
  if (!('Notification' in window) || Notification.permission !== 'granted') return
  if (!isNotificationEnabled()) return
  if (!shouldRunCheck()) return

  localStorage.setItem(NOTIF_LAST_CHECK_KEY, String(Date.now()))

  const year = todayYear()
  const month = todayMonth()
  const lines: string[] = []

  fixedExpenseRepo.getActive().forEach((fe) => {
    if (getFixedExpenseMonthStatus(fe, year, month) === 'done') return
    const day = getEffectiveMonthDay(year, month, fe.payment_day)
    const diff = daysFromToday(year, month, day)
    if (diff === 0) lines.push(`${fe.title} — 오늘 납부일`)
    else if (diff === 1) lines.push(`${fe.title} — 내일 납부일`)
    else if (diff === 2) lines.push(`${fe.title} — 2일 후 납부일`)
  })

  incomeRepo.getAll()
    .filter((i) => i.repeat_rule === 'monthly')
    .forEach((income) => {
      if (getIncomeMonthStatus(income, year, month) === 'received') return
      const day = getEffectiveMonthDay(year, month, income.income_day)
      const diff = daysFromToday(year, month, day)
      if (diff === 0) lines.push(`${income.title} — 오늘 입금 예정`)
      else if (diff === 1) lines.push(`${income.title} — 내일 입금 예정`)
    })

  subscriptionRepo.getActive().forEach((sub) => {
    if (getSubscriptionMonthStatus(sub, year, month) === 'paid') return
    const day = getEffectiveMonthDay(year, month, sub.payment_day)
    const diff = daysFromToday(year, month, day)
    if (diff === 0) lines.push(`${sub.title} — 오늘 자동결제`)
    else if (diff === 1) lines.push(`${sub.title} — 내일 자동결제`)
  })

  if (lines.length === 0) return

  new Notification('온집 납부 알림', {
    body: lines.slice(0, 5).join('\n'),
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-192.png',
    tag: 'onzip-payment',
  })
}
