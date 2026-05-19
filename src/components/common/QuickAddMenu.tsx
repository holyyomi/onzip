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

const OPTIONS: { type: QuickAddType; label: string; sub: string; primary?: boolean }[] = [
  { type: 'expense',       label: '돈 썼어요', sub: '금액만 빠르게 기록', primary: true },
  { type: 'shopping',      label: '살 것 추가', sub: '장보기 목록에 넣기', primary: true },
  { type: 'schedule',      label: '일정 넣기', sub: '가족 약속과 할 일', primary: true },
  { type: 'record',        label: '메모 남기기', sub: '기억할 내용 보관', primary: true },
  { type: 'checklist',     label: '할 일 목록', sub: '준비물과 진행 항목' },
  { type: 'fixed_expense', label: '고정비 넣기',  sub: '월세, 관리비, 보험' },
  { type: 'subscription',  label: '구독 넣기', sub: '정기 결제 서비스' },
]

const primaryOptions = OPTIONS.filter((option) => option.primary)
const secondaryOptions = OPTIONS.filter((option) => !option.primary)

export default function QuickAddMenu({ onSelect, onClose }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end bg-black/30" onClick={onClose}>
      <div
        className="bg-white rounded-t-[28px] border-t border-[#ebebeb] max-h-[88dvh] overflow-y-auto pb-[calc(env(safe-area-inset-bottom)+24px)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-10 h-1 bg-[#dddddd] rounded-full" />
        </div>

        <div className="px-5 pb-3">
          <p className="text-2xl font-semibold text-[#222222]">무엇을 할까요?</p>
          <p className="text-sm text-[#6a6a6a] mt-1">지금 하려는 일을 고르세요.</p>
        </div>

        <div className="px-5 grid grid-cols-2 gap-3">
          {primaryOptions.map((opt) => (
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

        <div className="px-5 mt-4 space-y-2">
          {secondaryOptions.map((opt) => (
            <button
              key={opt.type}
              onClick={() => onSelect(opt.type)}
              className="w-full min-h-[64px] rounded-[20px] border border-[#ebebeb] bg-white px-3 text-left active:scale-[0.99] transition flex items-center gap-3"
            >
              <img src={QUICK_ADD_ICON[opt.type]} alt="" className="h-10 w-10 rounded-[14px] object-contain flex-shrink-0" />
              <span className="min-w-0">
                <span className="block text-base font-semibold text-[#222222]">{opt.label}</span>
                <span className="block text-xs text-[#6a6a6a] mt-0.5 truncate">{opt.sub}</span>
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
