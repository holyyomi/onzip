export default function Header() {
  return (
    <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between sticky top-0 z-10">
      <span className="text-lg font-bold text-gray-900">온집</span>
      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-400">우리집</span>
        <button
          className="w-8 h-8 bg-blue-500 text-white rounded-full text-xl font-light flex items-center justify-center leading-none"
          aria-label="빠른 추가"
        >
          +
        </button>
      </div>
    </header>
  )
}
