// 날짜 유틸리티 — 외부 라이브러리 없이 직접 구현

export const DAYS_KO = ['일', '월', '화', '수', '목', '금', '토'] as const

export function formatDate(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function todayStr(): string {
  return formatDate(new Date())
}

export function todayYear(): number {
  return new Date().getFullYear()
}

export function todayMonth(): number {
  return new Date().getMonth() + 1
}

// 42셀(6행×7열) 그리드 반환 — month는 1-based
export function getMonthGrid(year: number, month: number): Date[] {
  const firstDay = new Date(year, month - 1, 1)
  const startDow = firstDay.getDay() // 0=일, 6=토

  const grid: Date[] = []

  // 이전 달 채우기
  for (let i = startDow; i > 0; i--) {
    grid.push(new Date(year, month - 1, 1 - i))
  }

  // 현재 달
  const daysInMonth = getDaysInMonth(year, month)
  for (let d = 1; d <= daysInMonth; d++) {
    grid.push(new Date(year, month - 1, d))
  }

  // 다음 달 채우기 → 42셀 완성
  let nextDay = 1
  while (grid.length < 42) {
    grid.push(new Date(year, month, nextDay++))
  }

  return grid
}

export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate()
}

export function getEffectiveMonthDay(year: number, month: number, day: number): number {
  return Math.min(day, getDaysInMonth(year, month))
}

export function isCurrentMonth(date: Date, year: number, month: number): boolean {
  return date.getFullYear() === year && date.getMonth() + 1 === month
}

export function isTodayDate(date: Date): boolean {
  const t = new Date()
  return (
    date.getFullYear() === t.getFullYear() &&
    date.getMonth() === t.getMonth() &&
    date.getDate() === t.getDate()
  )
}

export function formatMonthLabel(year: number, month: number): string {
  return `${year}년 ${month}월`
}

export function prevMonth(year: number, month: number): { year: number; month: number } {
  return month === 1 ? { year: year - 1, month: 12 } : { year, month: month - 1 }
}

export function nextMonth(year: number, month: number): { year: number; month: number } {
  return month === 12 ? { year: year + 1, month: 1 } : { year, month: month + 1 }
}

export function formatAmount(amount: number): string {
  return amount.toLocaleString('ko-KR') + '원'
}

export function formatDateLabel(dateStr: string): string {
  const [y, m, d] = dateStr.split('-')
  return `${y}년 ${Number(m)}월 ${Number(d)}일`
}
