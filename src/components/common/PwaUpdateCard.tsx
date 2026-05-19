import { useEffect, useState } from 'react'
import {
  applyPwaUpdate,
  checkForPwaUpdate,
  initPwaUpdate,
  subscribePwaUpdate,
  getPwaUpdateState,
} from '../../utils/pwaUpdate'

export default function PwaUpdateCard() {
  const [updateState, setUpdateState] = useState(getPwaUpdateState)

  useEffect(() => {
    initPwaUpdate()
    return subscribePwaUpdate(setUpdateState)
  }, [])

  return (
    <section className="oz-card p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-base font-semibold text-[#222222]">앱 업데이트</p>
          <p className="mt-1 text-sm leading-relaxed text-[#6a6a6a]">
            새 버전이 있으면 기존 데이터는 유지하고 화면만 최신으로 바꿉니다.
          </p>
          {updateState.message && (
            <p className="mt-2 text-xs font-medium text-[#8a8a8a]">{updateState.message}</p>
          )}
        </div>
        {updateState.canUpdate ? (
          <button
            onClick={() => void applyPwaUpdate()}
            className="min-h-[40px] flex-shrink-0 rounded-full bg-[#ff385c] px-4 text-sm font-semibold text-white"
          >
            업데이트
          </button>
        ) : (
          <button
            onClick={() => void checkForPwaUpdate()}
            disabled={updateState.checking}
            className="min-h-[40px] flex-shrink-0 rounded-full border border-[#ffd1da] bg-white px-4 text-sm font-semibold text-[#ff385c] disabled:opacity-50"
          >
            {updateState.checking ? '확인 중' : '확인'}
          </button>
        )}
      </div>
    </section>
  )
}
