// ═══════════════════════════════════════════════════════════
// Seed Data — 앱 최초 실행 시 예시 데이터 삽입
// 이미 데이터가 있으면 실행하지 않음
// ═══════════════════════════════════════════════════════════

import {
  householdRepo,
  memberRepo,
  fixedExpenseRepo,
  subscriptionRepo,
  checklistRepo,
  checklistItemRepo,
  shoppingItemRepo,
  householdSupplyRepo,
  choreRepo,
  templateRepo,
  appSettingsRepo,
} from '../repositories'
import { newId, now } from '../repositories/base'

const SEED_KEY = 'onzip_seed_done_v1'

export function isSeedDone(): boolean {
  return localStorage.getItem(SEED_KEY) === 'true'
}

export function runSeed(): void {
  if (isSeedDone()) return

  // ── 기본 household ──
  const household = householdRepo.getDefault()
  const hid = household.id

  // ── 가족 구성원 ──
  const memberMe = memberRepo.create({
    id: 'me',
    household_id: hid,
    name: '나',
    role: 'me',
    color: '#3B82F6',
    is_active: true,
    created_at: now(),
    updated_at: now(),
  })

  const memberSpouse = memberRepo.create({
    id: 'spouse',
    household_id: hid,
    name: '배우자',
    role: 'spouse',
    color: '#EC4899',
    is_active: true,
    created_at: now(),
    updated_at: now(),
  })

  memberRepo.create({
    id: 'shared',
    household_id: hid,
    name: '공동',
    role: 'shared',
    color: '#10B981',
    is_active: true,
    created_at: now(),
    updated_at: now(),
  })

  void memberMe
  void memberSpouse

  // ── 고정지출 ──
  const today = new Date()
  const currentMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`
  void currentMonth

  fixedExpenseRepo.create({
    id: newId(),
    household_id: hid,
    title: '월세',
    amount: 800000,
    category: '주거',
    payment_day: 25,
    payment_method: 'auto_transfer',
    member_id: 'shared',
    is_active: true,
    calendar_visible: true,
    status: 'pending',
    memo: '',
    created_at: now(),
    updated_at: now(),
  })

  fixedExpenseRepo.create({
    id: newId(),
    household_id: hid,
    title: '관리비',
    amount: 120000,
    category: '공과금',
    payment_day: 10,
    payment_method: 'auto_transfer',
    member_id: 'shared',
    is_active: true,
    calendar_visible: true,
    status: 'pending',
    memo: '',
    created_at: now(),
    updated_at: now(),
  })

  fixedExpenseRepo.create({
    id: newId(),
    household_id: hid,
    title: '인터넷',
    amount: 30000,
    category: '통신',
    payment_day: 15,
    payment_method: 'auto_transfer',
    member_id: 'me',
    is_active: true,
    calendar_visible: true,
    status: 'pending',
    memo: '',
    created_at: now(),
    updated_at: now(),
  })

  // ── 구독 ──
  subscriptionRepo.create({
    id: newId(),
    household_id: hid,
    title: '넷플릭스',
    amount: 17000,
    payment_day: 8,
    payment_method: 'card',
    status: 'active',
    member_id: 'shared',
    calendar_visible: true,
    memo: '',
    created_at: now(),
    updated_at: now(),
  })

  subscriptionRepo.create({
    id: newId(),
    household_id: hid,
    title: '유튜브 프리미엄',
    amount: 14900,
    payment_day: 20,
    payment_method: 'card',
    status: 'active',
    member_id: 'me',
    calendar_visible: true,
    memo: '',
    created_at: now(),
    updated_at: now(),
  })

  subscriptionRepo.create({
    id: newId(),
    household_id: hid,
    title: '밀리의 서재',
    amount: 9900,
    payment_day: 5,
    payment_method: 'card',
    status: 'considering_cancel',
    member_id: 'spouse',
    calendar_visible: false,
    memo: '잘 안 씀',
    created_at: now(),
    updated_at: now(),
  })

  // ── 체크리스트 ──
  const checklistId = newId()
  checklistRepo.create({
    id: checklistId,
    household_id: hid,
    title: '이번 주 해야 할 일',
    category: '생활',
    member_id: 'shared',
    due_date: null,
    repeat_rule: 'weekly',
    calendar_visible: false,
    created_at: now(),
    updated_at: now(),
  })

  const items = ['분리수거 내놓기', '청소기 돌리기', '화장실 청소', '냉장고 정리']
  items.forEach((content, i) => {
    checklistItemRepo.create({
      id: newId(),
      checklist_id: checklistId,
      content,
      is_done: false,
      sort_order: i,
      created_at: now(),
      updated_at: now(),
    })
  })

  // ── 장보기 ──
  const shoppingItems = [
    { name: '계란', category: '식재료', expected_amount: 8000 },
    { name: '우유', category: '식재료', expected_amount: 3000 },
    { name: '세제', category: '생활용품', expected_amount: 12000 },
    { name: '휴지', category: '생활용품', expected_amount: 15000 },
  ]

  shoppingItems.forEach(({ name, category, expected_amount }) => {
    shoppingItemRepo.create({
      id: newId(),
      household_id: hid,
      name,
      category,
      expected_amount,
      actual_amount: null,
      store: '',
      is_done: false,
      is_favorite: true,
      memo: '',
      created_at: now(),
      updated_at: now(),
    })
  })

  // ── 생활용품 ──
  const supplies = [
    { name: '휴지', status: 'enough' as const },
    { name: '세제', status: 'low' as const },
    { name: '샴푸', status: 'enough' as const },
    { name: '치약', status: 'need_buy' as const },
    { name: '종량제봉투', status: 'need_buy' as const },
  ]

  supplies.forEach(({ name, status }) => {
    householdSupplyRepo.create({
      id: newId(),
      household_id: hid,
      name,
      category: '생활용품',
      status,
      repurchase_cycle_days: 30,
      purchase_link_memo: '',
      member_id: null,
      created_at: now(),
      updated_at: now(),
    })
  })

  // ── 집안일 ──
  const chores = [
    { title: '분리수거', repeat_rule: 'weekly' as const },
    { title: '음식물쓰레기', repeat_rule: 'daily' as const },
    { title: '빨래', repeat_rule: 'weekly' as const },
    { title: '청소기', repeat_rule: 'weekly' as const },
  ]

  chores.forEach(({ title, repeat_rule }) => {
    choreRepo.create({
      id: newId(),
      household_id: hid,
      title,
      repeat_rule,
      member_id: 'shared',
      due_date: null,
      calendar_visible: false,
      is_done: false,
      memo: '',
      created_at: now(),
      updated_at: now(),
    })
  })

  // ── 기본 템플릿 ──
  const defaultTemplates = [
    {
      title: '신혼집 첫 세팅 체크리스트',
      category: '이사/세팅',
      description: '처음 신혼집을 꾸밀 때 필요한 기본 체크리스트',
      items: [
        '가구 배치 계획 세우기',
        '필수 가전 목록 작성',
        '생활용품 구매 리스트',
        '인터넷/TV 신청',
        '관리실 입주 신고',
        '주변 마트/병원/약국 파악',
      ],
    },
    {
      title: '월말 정산 체크리스트',
      category: '돈관리',
      description: '매월 말 생활비 정산 체크리스트',
      items: [
        '이번 달 지출 합계 확인',
        '고정지출 납부 완료 확인',
        '구독 서비스 점검',
        '다음 달 예산 설정',
        '저축 이체 확인',
        '카드값 확인',
      ],
    },
    {
      title: '이사 준비 체크리스트',
      category: '이사/세팅',
      description: '이사 전후 준비 체크리스트',
      items: [
        '이사 업체 예약',
        '전입신고 준비',
        '인터넷/가스/전기 이전 신청',
        '주소 변경 (은행/카드/보험)',
        '짐 정리 및 포장',
        '청소 업체 예약',
      ],
    },
    {
      title: '여행 준비 체크리스트',
      category: '여행',
      description: '여행 전 준비 체크리스트',
      items: [
        '항공권 예약',
        '숙소 예약',
        '여행자 보험 가입',
        '환전',
        '여행 일정 정리',
        '짐 싸기',
        '반려동물/식물 돌봄 부탁',
      ],
    },
  ]

  defaultTemplates.forEach(({ title, category, description, items }) => {
    templateRepo.create({
      id: newId(),
      title,
      category,
      description,
      items: items.map((content, i) => ({ content, sort_order: i })),
      is_default: true,
      created_at: now(),
      updated_at: now(),
    })
  })

  // ── 기본 앱 설정 ──
  appSettingsRepo.set(hid, 'theme', 'system')
  appSettingsRepo.set(hid, 'currency', 'KRW')
  appSettingsRepo.set(hid, 'household_name', '우리집')

  localStorage.setItem(SEED_KEY, 'true')
}
