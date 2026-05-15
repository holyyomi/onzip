import { QUICK_ADD_ICON } from '../../utils/featureIcons'

export type QuickAddType =
  | 'schedule'
  | 'expense'
  | 'fixed_expense'
  | 'subscription'
  | 'shopping'
  | 'checklist'
  | 'record'

interface Props {
  onSelect: (type: QuickAddType) => void
  onClose: () => void
}

const OPTIONS: { type: QuickAddType; label: string; sub: string }[] = [
  { type: 'expense',       label: '돈 쓴 것', sub: '금액만 적어도 돼요' },
  { type: 'shopping',      label: '살 것',    sub: '장보기 목록에 넣어요' },
  { type: 'schedule',      label: '일정',     sub: '가족 약속을 적어요' },
  { type: 'checklist',     label: '할 일',    sub: '준비물과 집안일에 좋아요' },
  { type: 'fixed_expense', label: '매달 돈',  sub: '월세, 관리비 같은 돈' },
  { type: 'subscription',  label: '구독',     sub: '넷플릭스, 유튜브 같은 것' },
  { type: 'record',        label: '가족 기록', sub: '회의록과 집 이야기를 남겨요' },
]

export default function QuickAddMenu({ onSelect, onClose }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end bg-black/30" onClick={onClose}>
      <div
        className="bg-white rounded-t-[28px] pb-8 border-t border-[#ebebeb]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-10 h-1 bg-[#dddddd] rounded-full" />
        </div>

        <div className="px-5 pb-3">
          <p className="text-2xl font-semibold text-[#222222]">무엇을 적을까요?</p>
          <p className="text-sm text-[#6a6a6a] mt-1">많이 쓰는 기능을 크게 모아뒀어요.</p>
        </div>

        <div className="px-5 grid grid-cols-2 gap-3">
        {OPTIONS.map((opt) => (
          <button
            key={opt.type}
            onClick={() => onSelect(opt.type)}
            className="w-full min-h-[118px] px-4 py-4 rounded-[22px] border border-[#ebebeb] bg-[#f7f7f7] active:scale-[0.98] transition text-left"
          >
            <img src={QUICK_ADD_ICON[opt.type]} alt="" className="h-12 w-12 rounded-[18px] mb-3 object-contain" />
            <span className="block text-base font-semibold text-[#222222]">{opt.label}</span>
            <span className="block text-xs text-[#6a6a6a] mt-1 leading-snug">{opt.sub}</span>
          </button>
        ))}
        </div>
      </div>
    </div>
  )
}
