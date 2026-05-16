interface Props {
  message: string
  sub?: string
  actionLabel?: string
  onAction?: () => void
  className?: string
}

export default function EmptyState({ message, sub, actionLabel, onAction, className = '' }: Props) {
  return (
    <div className={`oz-card flex flex-col items-center justify-center px-6 py-9 text-center ${className}`}>
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#fff0f3]">
        <span className="text-2xl font-light leading-none text-[#ff385c]">+</span>
      </div>
      <p className="text-sm font-semibold text-[#222222]">{message}</p>
      {sub && <p className="mt-1 text-xs leading-relaxed text-[#8a8a8a]">{sub}</p>}
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="mt-5 min-h-[44px] rounded-full bg-[#ff385c] px-5 text-sm font-semibold text-white active:bg-[#e00b41]"
        >
          {actionLabel}
        </button>
      )}
    </div>
  )
}
