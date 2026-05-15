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

const OPTIONS: { type: QuickAddType; label: string; sub: string; dot: string }[] = [
  { type: 'schedule',      label: '일정 추가',     sub: '캘린더',  dot: 'bg-blue-400' },
  { type: 'expense',       label: '지출 추가',     sub: '가계부',  dot: 'bg-red-400' },
  { type: 'fixed_expense', label: '고정지출 추가', sub: '돈관리',  dot: 'bg-orange-400' },
  { type: 'subscription',  label: '구독 추가',     sub: '돈관리',  dot: 'bg-purple-400' },
  { type: 'shopping',      label: '장보기 추가',   sub: '생활',    dot: 'bg-green-400' },
  { type: 'checklist',     label: '체크리스트 추가', sub: '생활',  dot: 'bg-teal-400' },
  { type: 'record',        label: '기록 추가',     sub: '기록',    dot: 'bg-pink-400' },
]

export default function QuickAddMenu({ onSelect, onClose }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end bg-black/40" onClick={onClose}>
      <div
        className="bg-white rounded-t-2xl pb-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 핸들 */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-10 h-1 bg-gray-200 rounded-full" />
        </div>

        <p className="text-xs font-semibold text-gray-400 px-5 pb-2">빠른 추가</p>

        {OPTIONS.map((opt) => (
          <button
            key={opt.type}
            onClick={() => onSelect(opt.type)}
            className="w-full flex items-center gap-4 px-5 py-3.5 hover:bg-gray-50 active:bg-gray-100 transition-colors"
          >
            <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${opt.dot}`} />
            <span className="text-sm font-medium text-gray-800 flex-1 text-left">{opt.label}</span>
            <span className="text-xs text-gray-400">{opt.sub}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
