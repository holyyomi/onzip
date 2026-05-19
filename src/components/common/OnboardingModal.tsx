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
        <h2 className="text-center text-2xl font-semibold text-[#222222]">중요한 것부터 챙겨요</h2>
        <p className="mt-2 text-center text-sm leading-relaxed text-[#6a6a6a]">
          들어올 돈, 나갈 돈, 중요한 날짜와 금고 메모를 한곳에 정리합니다.
        </p>
        <div className="mt-4 space-y-2">
          <Step number="1" title="오늘 중요한 것 확인" text="오늘 들어오고 나갈 돈, 일정, 중요 메모를 먼저 봅니다." />
          <Step number="2" title="흐름으로 돈 날짜 관리" text="월급, 부수입, 카드값, 자동결제를 날짜별로 정리합니다." />
          <Step number="3" title="금고에 중요한 내용 보관" text="계좌, 계약, 보험 같은 민감한 메모를 기기 안에 저장합니다." />
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
