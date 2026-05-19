const UPDATE_NOTICE_KEY = 'onzip_update_notice_20260519_ux_update'

import { useState } from 'react'

export default function UpdateNoticeCard() {
  const [dismissed, setDismissed] = useState(() => localStorage.getItem(UPDATE_NOTICE_KEY) === 'true')
  if (dismissed) return null

  function handleDismiss() {
    localStorage.setItem(UPDATE_NOTICE_KEY, 'true')
    setDismissed(true)
  }

  return (
    <section className="oz-card p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-base font-semibold text-[#222222]">최근 업데이트</p>
          <p className="mt-1 text-sm leading-relaxed text-[#6a6a6a]">
            홈을 단순화하고, 가계부/장보기/메모 탭과 업데이트 확인 기능을 정리했습니다.
          </p>
        </div>
        <button
          onClick={handleDismiss}
          className="h-9 w-9 flex-shrink-0 rounded-full bg-[#f2f2f2] text-lg text-[#6a6a6a]"
          aria-label="업데이트 안내 닫기"
        >
          ×
        </button>
      </div>
    </section>
  )
}
