import { QUICK_ADD_ICON } from '../../utils/featureIcons'

export type QuickAddType =
  | 'schedule'
  | 'expense'
  | 'income'
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
  { type: 'expense',       label: '지출 예정', sub: '카드 결제, 생활비, 정산', primary: true },
  { type: 'shopping',      label: '구매 항목', sub: '필요한 물품을 간단히', primary: true },
  { type: 'checklist',     label: '체크리스트', sub: '준비 항목 정리', primary: true },
  { type: 'schedule',      label: '중요 일정', sub: '예약, 납부, 갱신일', primary: true },
  { type: 'income',        label: '수입 예정', sub: '월급, 부가 수입, 받을 금액' },
  { type: 'record',        label: '보관 메모', sub: '계좌, 계약, 중요 정보' },
  { type: 'fixed_expense', label: '정기 지출',  sub: '월세, 보험, 관리비' },
  { type: 'subscription',  label: '구독/자동결제', sub: '정기 결제 서비스' },
]

const primaryOptions = OPTIONS.filter((option) => option.primary)
const secondaryOptions = OPTIONS.filter((option) => !option.primary)

export default function QuickAddMenu({ onSelect, onClose }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end bg-black/30 lg:items-center lg:justify-center lg:p-6" onClick={onClose}>
      <div
        className="bg-white rounded-t-[28px] border-t border-[#ebebeb] max-h-[88dvh] overflow-y-auto pb-[calc(env(safe-area-inset-bottom)+24px)] lg:w-full lg:max-w-3xl lg:rounded-[24px] lg:border lg:pb-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-10 h-1 bg-[#dddddd] rounded-full" />
        </div>

        <div className="px-5 pb-3">
          <p className="text-2xl font-semibold text-[#222222]">무엇을 기록할까요?</p>
          <p className="text-sm text-[#6a6a6a] mt-1">돈 흐름, 구매 항목, 체크리스트, 일정을 빠르게 남기세요.</p>
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
