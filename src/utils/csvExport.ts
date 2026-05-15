// CSV 내보내기 — Excel 한글 호환 (UTF-8 BOM 포함)

import type { LedgerEntry } from '../data/models'
import { PAYMENT_METHOD_LABEL } from './constants'

function escapeCell(value: string | number): string {
  const str = String(value)
  // 쉼표·따옴표·줄바꿈 포함 시 따옴표로 감쌈
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

function downloadCSV(filename: string, rows: string[][]): void {
  const header = rows[0]
  const body = rows.slice(1)
  const csv = [header, ...body].map((r) => r.map(escapeCell).join(',')).join('\n')
  // ﻿ = UTF-8 BOM — Excel이 한글을 올바르게 인식
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

// 가계부 CSV 내보내기
export function exportLedgerCSV(entries: LedgerEntry[], label = ''): void {
  const rows: string[][] = [
    ['날짜', '유형', '금액', '카테고리', '결제수단', '담당자', '메모'],
    ...entries
      .sort((a, b) => a.date.localeCompare(b.date))
      .map((e) => [
        e.date,
        e.entry_type === 'income' ? '수입' : '지출',
        String(e.amount),
        e.category,
        e.payment_method ? PAYMENT_METHOD_LABEL[e.payment_method] : '',
        e.member_id ?? '',
        e.memo,
      ]),
  ]
  const suffix = label ? `_${label}` : ''
  downloadCSV(`onzip_가계부${suffix}_${new Date().toISOString().slice(0, 10)}.csv`, rows)
}

// 쇼핑 목록 CSV
export function exportShoppingCSV(
  items: { name: string; category: string; expected_amount: number | null; actual_amount: number | null; store: string; is_done: boolean }[],
): void {
  const rows: string[][] = [
    ['품목명', '카테고리', '예상금액', '실제금액', '구매처', '구매완료'],
    ...items.map((i) => [
      i.name, i.category,
      i.expected_amount != null ? String(i.expected_amount) : '',
      i.actual_amount != null ? String(i.actual_amount) : '',
      i.store,
      i.is_done ? 'O' : '',
    ]),
  ]
  downloadCSV(`onzip_장보기_${new Date().toISOString().slice(0, 10)}.csv`, rows)
}
