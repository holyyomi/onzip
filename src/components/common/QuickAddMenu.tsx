// 헤더 "+" 버튼 → 빠른 추가 메뉴 (PRD 섹션 3-2)

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

const OPTIONS: { type: QuickAddType; label: string; sub: string; tint: string }[] = [
  { type: 'expense',       label: '돈 쓴 것 적기', sub: '금액만 적어도 돼요', tint: 'bg-[#fff0e6]' },
  { type: 'shopping',      label: '살 것 적기',    sub: '장보기 목록에 넣어요', tint: 'bg-[#f1f8ee]' },
  { type: 'schedule',      label: '일정 넣기',     sub: '가족 약속을 적어요', tint: 'bg-[#eef6ff]' },
  { type: 'checklist',     label: '할 일 만들기',  sub: '준비물과 집안일에 좋아요', tint: 'bg-[#fff8d7]' },
  { type: 'fixed_expense', label: '매달 나가는 돈', sub: '월세, 관리비 같은 돈', tint: 'bg-[#ffeceb]' },
  { type: 'subscription',  label: '구독 적기',     sub: '넷플릭스, 유튜브 같은 것', tint: 'bg-[#f4efff]' },
  { type: 'record',        label: '가족 메모',     sub: '회의록과 집 이야기를 남겨요', tint: 'bg-[#fdf0f6]' },
]

export default function QuickAddMenu({ onSelect, onClose }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end bg-black/30" onClick={onClose}>
      <div
        className="bg-[#fbfaf8] rounded-t-2xl pb-8 border-t border-[#e8e1d8]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 핸들 */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-10 h-1 bg-[#ddd4ca] rounded-full" />
        </div>

        <div className="px-5 pb-3">
          <p className="text-lg font-semibold text-[#2f2a25]">무엇을 적을까요?</p>
          <p className="text-sm text-[#8f857a] mt-1">자주 쓰는 것부터 크게 모아뒀어요.</p>
        </div>

        <div className="px-5 space-y-2">
        {OPTIONS.map((opt) => (
          <button
            key={opt.type}
            onClick={() => onSelect(opt.type)}
            className={`w-full px-4 py-4 rounded-xl border border-[#e8e1d8] ${opt.tint} active:scale-[0.99] transition-transform text-left`}
          >
            <span className="block text-base font-semibold text-[#2f2a25]">{opt.label}</span>
            <span className="block text-sm text-[#6f665d] mt-1">{opt.sub}</span>
          </button>
        ))}
        </div>
      </div>
    </div>
  )
}
