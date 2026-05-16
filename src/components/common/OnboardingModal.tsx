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
      <div className="w-full max-w-lg rounded-t-[28px] bg-white p-5">
        <div className="flex justify-center pb-4">
          <img src="/icons/icon-192.png" alt="" className="h-16 w-16 rounded-[22px]" />
        </div>
        <h2 className="text-center text-2xl font-semibold text-[#222222]">온집 시작하기</h2>
        <div className="mt-5 space-y-3">
          <Step number="1" title="앱으로 설치하기" text="홈 화면에 추가하면 일반 앱처럼 열 수 있어요." />
          <Step number="2" title="빠른 추가로 기록하기" text="돈, 장보기, 일정, 기록은 하단 + 버튼에서 바로 적어요." />
          <Step number="3" title="내 폰에만 저장돼요" text="로그인 없이 쓰는 대신, 데이터는 이 기기에만 보관됩니다." />
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
