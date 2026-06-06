import { templateRepo } from '../data/repositories'
import { newId, now } from '../data/repositories/base'
import type { Template } from '../data/models'

const DEFAULT_TEMPLATES: Omit<Template, 'id' | 'created_at' | 'updated_at'>[] = [
  {
    title: '대청소',
    category: '집안일',
    description: '분기별 대청소 체크리스트',
    is_default: true,
    items: [
      { content: '냉장고 정리 및 청소', sort_order: 0 },
      { content: '욕실 청소 (변기·세면대·욕조)', sort_order: 1 },
      { content: '주방 레인지 후드 청소', sort_order: 2 },
      { content: '창문 청소', sort_order: 3 },
      { content: '에어컨 필터 청소', sort_order: 4 },
      { content: '베란다 청소', sort_order: 5 },
      { content: '침구류 세탁', sort_order: 6 },
    ],
  },
  {
    title: '이사 준비',
    category: '이사',
    description: '이사할 때 챙겨야 할 것들',
    is_default: true,
    items: [
      { content: '이사 업체 예약', sort_order: 0 },
      { content: '전입신고 예약', sort_order: 1 },
      { content: '인터넷·TV 이전 신청', sort_order: 2 },
      { content: '가스·전기·수도 명의 변경', sort_order: 3 },
      { content: '우편물 주소 변경', sort_order: 4 },
      { content: '불필요한 물건 처분', sort_order: 5 },
      { content: '박스 및 포장 재료 준비', sort_order: 6 },
      { content: '새 집 청소', sort_order: 7 },
    ],
  },
  {
    title: '여행 준비',
    category: '여행',
    description: '여행 전 챙길 것들',
    is_default: true,
    items: [
      { content: '여권·신분증 확인', sort_order: 0 },
      { content: '숙소 예약 확인', sort_order: 1 },
      { content: '교통편 예약 확인', sort_order: 2 },
      { content: '여행 보험 가입', sort_order: 3 },
      { content: '환전', sort_order: 4 },
      { content: '옷·세면도구 챙기기', sort_order: 5 },
      { content: '충전기·보조배터리', sort_order: 6 },
      { content: '반려동물·식물 맡기기', sort_order: 7 },
    ],
  },
  {
    title: '월말 정리',
    category: '가계부',
    description: '매월 말 재정 점검',
    is_default: true,
    items: [
      { content: '이번 달 지출 확인', sort_order: 0 },
      { content: '고정 지출 완료 여부 확인', sort_order: 1 },
      { content: '구독 서비스 점검 (안 쓰는 것 해지)', sort_order: 2 },
      { content: '다음 달 큰 지출 파악', sort_order: 3 },
      { content: '저축 목표 확인', sort_order: 4 },
      { content: '온집 앱 데이터 백업', sort_order: 5 },
    ],
  },
]

export function seedDefaultTemplates(): void {
  if (templateRepo.getAll().length > 0) return
  DEFAULT_TEMPLATES.forEach((tpl) => {
    templateRepo.create({
      id: newId(),
      ...tpl,
      created_at: now(),
      updated_at: now(),
    })
  })
}
