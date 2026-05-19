import type { LifeRecord } from '../data/models'

const IMPORTANT_TAGS = ['중요', '계약', '계좌', '보험', '투자', '대출', '카드', '갱신', '만료', '비상']

function normalizeTag(tag: string): string {
  return tag.trim().toLowerCase()
}

export function isImportantVaultRecord(record: Pick<LifeRecord, 'record_type' | 'tags'>): boolean {
  if (record.record_type === 'anniversary') return true
  return record.tags.some((tag) => IMPORTANT_TAGS.includes(normalizeTag(tag)) || IMPORTANT_TAGS.includes(tag.trim()))
}

export function getVaultRecordBadge(record: Pick<LifeRecord, 'record_type' | 'tags'>): string {
  const normalizedTags = record.tags.map(normalizeTag)
  if (normalizedTags.includes('갱신') || normalizedTags.includes('만료') || record.record_type === 'anniversary') return '갱신'
  if (normalizedTags.includes('계좌') || normalizedTags.includes('투자') || normalizedTags.includes('대출') || normalizedTags.includes('카드')) return '돈'
  if (normalizedTags.includes('계약') || normalizedTags.includes('보험')) return '계약'
  if (normalizedTags.includes('비상')) return '비상'
  return '중요'
}
