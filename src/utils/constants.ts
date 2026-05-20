import type { PaymentMethod } from '../data/models'

export const EXPENSE_CATEGORIES = [
  '식비', '카페/외식', '생활용품', '교통', '병원',
  '쇼핑', '주거', '공과금', '구독', '기타',
] as const

export const INCOME_CATEGORIES = [
  '월급', '부가 수입', '보너스', '제휴/광고수익', '기타',
] as const

export const FIXED_EXPENSE_CATEGORIES = [
  '주거', '카드', '보험', '통신', '공과금', '대출/렌탈', '저축/청약', '기타',
] as const

export const PAYMENT_METHODS: { value: PaymentMethod; label: string }[] = [
  { value: 'card', label: '카드' },
  { value: 'auto_transfer', label: '자동이체' },
  { value: 'bank_transfer', label: '계좌이체' },
  { value: 'manual', label: '직접납부' },
  { value: 'simple_pay', label: '간편결제' },
]

export const PAYMENT_METHOD_LABEL: Record<PaymentMethod, string> = {
  card: '카드',
  auto_transfer: '자동이체',
  bank_transfer: '계좌이체',
  manual: '직접납부',
  simple_pay: '간편결제',
}

export const DAYS_OPTIONS = Array.from({ length: 31 }, (_, i) => i + 1)
