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
        <h2 className="text-center text-2xl font-semibold text-[#222222]">처음부터 정리합니다</h2>
        <p className="mt-2 text-center text-sm leading-relaxed text-[#6a6a6a]">
          예시 데이터 없이 필요한 항목만 등록합니다.
        </p>
        <div className="mt-4 space-y-2">
          <Step number="1" title="+ 버튼으로 빠른 등록" text="지출, 구매 항목, 일정, 생활 기록을 바로 추가합니다." />
          <Step number="2" title="홈에서 핵심 요약 확인" text="오늘 일정과 월간 요약을 한 화면에서 확인합니다." />
          <Step number="3" title="기기 내 저장" text="로그인 없이 사용하고, 필요할 때 설정에서 백업합니다." />
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
