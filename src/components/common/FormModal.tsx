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
      <div className="bg-white rounded-t-2xl p-5 max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-semibold text-gray-900">{title}</h2>
          <button onClick={onClose} className="text-gray-400 text-xl leading-none">
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
      <label className="text-xs text-gray-500 block mb-1">{label}</label>
      {children}
    </div>
  )
}

// 공통 input 클래스
export const inputCls =
  'w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-blue-400 bg-white'

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
          className="flex-1 py-3 border border-red-300 text-red-500 rounded-xl text-sm font-medium"
        >
          삭제
        </button>
      )}
      <button
        onClick={onSave}
        className="flex-1 py-3 bg-blue-500 text-white rounded-xl text-sm font-semibold"
      >
        {saveLabel}
      </button>
    </div>
  )
}
