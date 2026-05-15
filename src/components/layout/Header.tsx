import { householdRepo } from '../../data/repositories'

interface Props {
  onOpenQuickAdd: () => void
}

export default function Header({ onOpenQuickAdd }: Props) {
  const householdName = householdRepo.getDefault().name

  return (
    <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between sticky top-0 z-10">
      <span className="text-lg font-bold text-gray-900">온집</span>
      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-400">{householdName}</span>
        <button
          onClick={onOpenQuickAdd}
          className="w-8 h-8 bg-blue-500 text-white rounded-full text-xl font-light flex items-center justify-center leading-none active:bg-blue-600 transition-colors"
          aria-label="빠른 추가"
        >
          +
        </button>
      </div>
    </header>
  )
}
