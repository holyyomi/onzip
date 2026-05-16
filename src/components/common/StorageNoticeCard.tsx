import { useState } from 'react'
import { trackEvent } from '../../utils/analytics'

const STORAGE_NOTICE_KEY = 'onzip_storage_notice_seen_v1'

interface Props {
  dismissible?: boolean
}

export default function StorageNoticeCard({ dismissible = false }: Props) {
  const [hidden, setHidden] = useState(() => (
    dismissible && localStorage.getItem(STORAGE_NOTICE_KEY) === 'true'
  ))

  if (hidden) return null

  function handleDismiss() {
    localStorage.setItem(STORAGE_NOTICE_KEY, 'true')
    setHidden(true)
    trackEvent('storage_notice_dismiss')
  }

  return (
    <section className="oz-card border-[#ffd1da] bg-[#fff7f8] p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-base font-semibold text-[#222222]">데이터는 이 폰에만 저장돼요</p>
          <p className="mt-1 text-sm leading-relaxed text-[#6a6a6a]">
            온집은 아직 로그인/동기화 없이 사용합니다. 휴대폰 변경, 브라우저 데이터 삭제,
            앱 데이터 삭제 시 기록이 사라질 수 있어요.
          </p>
        </div>
        {dismissible && (
          <button
            onClick={handleDismiss}
            className="h-9 w-9 flex-shrink-0 rounded-full bg-white text-[#6a6a6a] text-lg"
            aria-label="데이터 저장 안내 닫기"
          >
            ×
          </button>
        )}
      </div>
    </section>
  )
}
