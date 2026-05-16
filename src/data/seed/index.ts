// ═══════════════════════════════════════════════════════════
// Seed Data — 앱 최초 실행 시 기본 구조만 준비
// 사용자가 입력하지 않은 생활 데이터는 만들지 않음
// ═══════════════════════════════════════════════════════════

import {
  householdRepo,
  memberRepo,
  templateRepo,
  appSettingsRepo,
} from '../repositories'
import { newId, now } from '../repositories/base'

const SEED_KEY = 'onzip_seed_done_v1'
const FULL_RESET_KEY = 'onzip_full_reset_done_20260516_v1'

export function resetLocalDataForFreshStart(): void {
  if (localStorage.getItem(FULL_RESET_KEY) === 'true') return

  const keysToRemove: string[] = []
  for (let i = 0; i < localStorage.length; i += 1) {
    const key = localStorage.key(i)
    if (key?.startsWith('onzip_')) {
      keysToRemove.push(key)
    }
  }

  keysToRemove.forEach((key) => localStorage.removeItem(key))
  localStorage.setItem(FULL_RESET_KEY, 'true')
}

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
