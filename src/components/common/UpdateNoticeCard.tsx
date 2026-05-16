const UPDATE_NOTICE_KEY = 'onzip_update_notice_v1'

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
            홈 구조, 하단 탭, 문구 체계, 로컬 저장 안내를 정리했습니다.
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
