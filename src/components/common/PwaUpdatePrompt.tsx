import { useEffect, useState } from 'react'
import {
  applyPwaUpdate,
  initPwaUpdate,
  subscribePwaUpdate,
  getPwaUpdateState,
} from '../../utils/pwaUpdate'

export default function PwaUpdatePrompt() {
  const [updateState, setUpdateState] = useState(getPwaUpdateState)

  useEffect(() => {
    initPwaUpdate()
    return subscribePwaUpdate(setUpdateState)
  }, [])

  if (!updateState.canUpdate) return null

  return (
    <div className="fixed left-4 right-4 bottom-24 z-50 mx-auto max-w-lg rounded-[22px] border border-[#ebebeb] bg-white p-3 shadow-lg">
      <div className="flex items-center gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-[#222222]">새 버전이 준비됐어요</p>
          <p className="mt-0.5 text-xs text-[#6a6a6a]">업데이트하면 최신 화면으로 다시 열립니다.</p>
        </div>
        <button
          onClick={() => void applyPwaUpdate()}
          className="min-h-[42px] flex-shrink-0 rounded-full bg-[#ff385c] px-4 text-sm font-semibold text-white"
        >
          업데이트
        </button>
      </div>
    </div>
  )
}
