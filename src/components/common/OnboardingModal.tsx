import { useState } from 'react'
import { trackEvent } from '../../utils/analytics'

const ONBOARDING_KEY = 'onzip_onboarding_seen_v1'

export default function OnboardingModal() {
  const [visible, setVisible] = useState(() => localStorage.getItem(ONBOARDING_KEY) !== 'true')

  if (!visible) return null

  function handleClose() {
    localStorage.setItem(ONBOARDING_KEY, 'true')
    setVisible(false)
    trackEvent('onboarding_done')
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end bg-black/35">
      <div className="w-full max-w-lg rounded-t-[24px] bg-white p-5">
        <div className="flex justify-center pb-3">
          <img src="/icons/icon-192.png" alt="" className="h-14 w-14 rounded-[20px]" />
        </div>
        <h2 className="text-center text-2xl font-semibold text-[#222222]">오늘 필요한 것부터 시작해요</h2>
        <p className="mt-2 text-center text-sm leading-relaxed text-[#6a6a6a]">
          홈에서 자주 쓰는 일을 바로 추가하고, 자세한 관리는 각 탭에서 합니다.
        </p>
        <div className="mt-4 space-y-2">
          <Step number="1" title="홈에서 바로 추가" text="돈 쓴 일, 살 것, 일정, 메모를 빠르게 남깁니다." />
          <Step number="2" title="가계부와 장보기만 먼저" text="자주 쓰는 화면부터 쓰고, 고정비와 용품은 관리에서 정리합니다." />
          <Step number="3" title="설정에서 백업 확인" text="로그인 없이 사용하고, 필요할 때 데이터를 백업합니다." />
        </div>
        <button
          onClick={handleClose}
          className="mt-5 min-h-[52px] w-full rounded-full bg-[#ff385c] text-sm font-semibold text-white active:bg-[#e00b41]"
        >
          시작하기
        </button>
      </div>
    </div>
  )
}

function Step({ number, title, text }: { number: string; title: string; text: string }) {
  return (
    <div className="flex gap-3 rounded-[20px] bg-[#f7f7f7] p-3">
      <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-white text-sm font-semibold text-[#ff385c]">
        {number}
      </span>
      <span>
        <span className="block text-sm font-semibold text-[#222222]">{title}</span>
        <span className="mt-0.5 block text-xs leading-relaxed text-[#6a6a6a]">{text}</span>
      </span>
    </div>
  )
}
