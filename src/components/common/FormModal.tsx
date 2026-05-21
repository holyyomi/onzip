import type { ReactNode } from 'react'

interface Props {
  title: string
  onClose: () => void
  children: ReactNode
}

// 공통 바텀시트 모달 — 모든 form modal에서 재사용
export default function FormModal({ title, onClose, children }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end bg-black/40 lg:items-center lg:justify-center lg:p-6">
      <div className="bg-white rounded-t-[28px] px-5 pt-4 pb-3 max-h-[92dvh] overflow-y-auto scroll-smooth-mobile lg:w-full lg:max-w-2xl lg:rounded-[24px] lg:p-6">
        <div className="flex items-center justify-between mb-5 sticky top-0 z-10 bg-white pb-2">
          <h2 className="text-xl font-semibold text-[#222222]">{title}</h2>
          <button
            onClick={onClose}
            className="h-11 w-11 rounded-full bg-[#f2f2f2] text-[#6a6a6a] text-xl leading-none flex items-center justify-center"
            aria-label="닫기"
          >
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

// 재사용 form 필드 래퍼
export function Field({
  label,
  children,
}: {
  label: string
  children: ReactNode
}) {
  return (
    <div className="mb-3">
      <label className="text-sm font-semibold text-[#6a6a6a] block mb-1.5">{label}</label>
      {children}
    </div>
  )
}

// 공통 input 클래스
export const inputCls =
  'w-full min-h-[52px] border border-[#dddddd] rounded-[18px] px-4 py-3 text-base focus:outline-none focus:border-[#222222] bg-white text-[#222222]'

// 저장/삭제 버튼 영역
export function FormActions({
  onSave,
  onDelete,
  saveLabel = '저장',
}: {
  onSave: () => void
  onDelete?: () => void
  saveLabel?: string
}) {
  return (
    <div className="sticky bottom-0 -mx-5 mt-5 flex gap-2 bg-white px-5 pt-3 pb-[calc(env(safe-area-inset-bottom)+12px)]">
      {onDelete && (
        <button
          onClick={onDelete}
          className="flex-1 min-h-[52px] border border-red-200 text-red-500 rounded-full text-sm font-semibold"
        >
          삭제
        </button>
      )}
      <button
        onClick={onSave}
        className="flex-1 min-h-[52px] bg-[#ff385c] text-white rounded-full text-sm font-semibold active:bg-[#e00b41]"
      >
        {saveLabel}
      </button>
    </div>
  )
}
