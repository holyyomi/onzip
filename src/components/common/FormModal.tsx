import type { ReactNode } from 'react'

interface Props {
  title: string
  onClose: () => void
  children: ReactNode
}

// 공통 바텀시트 모달 — 모든 form modal에서 재사용
export default function FormModal({ title, onClose, children }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end bg-black/40">
      <div className="bg-white rounded-t-[28px] p-5 max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-semibold text-[#222222]">{title}</h2>
          <button onClick={onClose} className="h-9 w-9 rounded-full bg-[#f2f2f2] text-[#6a6a6a] text-xl leading-none">
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
  'w-full border border-[#dddddd] rounded-[18px] px-4 py-3 text-base focus:outline-none focus:border-[#222222] bg-white text-[#222222]'

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
    <div className="flex gap-2 mt-5">
      {onDelete && (
        <button
          onClick={onDelete}
          className="flex-1 py-3.5 border border-red-200 text-red-500 rounded-full text-sm font-semibold"
        >
          삭제
        </button>
      )}
      <button
        onClick={onSave}
        className="flex-1 py-3.5 bg-[#ff385c] text-white rounded-full text-sm font-semibold active:bg-[#e00b41]"
      >
        {saveLabel}
      </button>
    </div>
  )
}
