const UPDATE_NOTICE_KEY = 'onzip_update_notice_20260519_flow_vault'

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
            홈을 오늘의 주요 항목 중심으로 바꾸고, 흐름/일정/금고 구조로 정리했습니다.
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
