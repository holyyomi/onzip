// 카테고리 커스터마이징 저장소 (TASK-026)
// 기본 카테고리 + 사용자 추가 카테고리를 합쳐서 반환
// 기본 카테고리는 삭제 불가, 사용자 카테고리만 삭제 가능

const KEY = 'onzip_custom_categories'

interface CategoryStore {
  expense: string[]
  income: string[]
  fixed_expense: string[]
}

const DEFAULTS = {
  expense: ['식비', '카페/외식', '생활용품', '교통', '병원', '쇼핑', '주거', '공과금', '적금', '구독', '매장용품', '기타'],
  income: ['월급', '부가 수입', '보너스', '제휴/광고수익', '기타'],
  fixed_expense: ['주거', '카드', '보험', '통신', '공과금', '대출/렌탈', '저축/청약', '기타'],
}

function load(): CategoryStore {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? (JSON.parse(raw) as CategoryStore) : { expense: [], income: [], fixed_expense: [] }
  } catch {
    return { expense: [], income: [], fixed_expense: [] }
  }
}

function save(store: CategoryStore): void {
  localStorage.setItem(KEY, JSON.stringify(store))
}

export type CategoryType = keyof CategoryStore

export function getCategories(type: CategoryType): string[] {
  const custom = load()[type]
  const all = [...DEFAULTS[type]]
  custom.forEach((c) => { if (!all.includes(c)) all.push(c) })
  return all
}

export function isDefault(type: CategoryType, name: string): boolean {
  return DEFAULTS[type].includes(name)
}

export function addCategory(type: CategoryType, name: string): void {
  const trimmed = name.trim()
  if (!trimmed) return
  const store = load()
  if (!store[type].includes(trimmed) && !DEFAULTS[type].includes(trimmed)) {
    store[type].push(trimmed)
    save(store)
  }
}

export function removeCategory(type: CategoryType, name: string): void {
  if (isDefault(type, name)) return // 기본 카테고리 삭제 불가
  const store = load()
  store[type] = store[type].filter((c) => c !== name)
  save(store)
}

export { DEFAULTS as DEFAULT_CATEGORIES }
