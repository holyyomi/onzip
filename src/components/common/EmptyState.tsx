interface Props {
  message: string
  sub?: string
  actionLabel?: string
  onAction?: () => void
}

// 재사용 빈 상태 컴포넌트 — 각 탭에서 데이터 없을 때 사용
export default function EmptyState({ message, sub, actionLabel, onAction }: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
        <span className="text-2xl text-gray-300">○</span>
      </div>
      <p className="text-sm font-medium text-gray-400">{message}</p>
      {sub && <p className="text-xs text-gray-300 mt-1">{sub}</p>}
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="mt-4 px-5 py-2 bg-blue-500 text-white text-sm font-medium rounded-xl"
        >
          {actionLabel}
        </button>
      )}
    </div>
  )
}
