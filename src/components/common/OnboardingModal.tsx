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
        <h2 className="text-center text-2xl font-semibold text-[#222222]">빈 집으로 시작해요</h2>
        <p className="mt-2 text-center text-sm leading-relaxed text-[#6a6a6a]">
          예시 기록 없이, 필요한 것만 직접 채워 넣는 방식입니다.
        </p>
        <div className="mt-4 space-y-2">
          <Step number="1" title="하단 + 버튼으로 바로 적기" text="돈, 장보기, 일정, 기록을 빠르게 남길 수 있어요." />
          <Step number="2" title="홈에서 오늘과 이번 달 확인" text="기록한 내용이 홈에 자연스럽게 모입니다." />
          <Step number="3" title="내 기기에 저장" text="로그인 없이 가볍게 쓰고, 필요할 때 설정에서 백업하세요." />
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
