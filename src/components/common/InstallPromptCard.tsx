import { useEffect, useState } from 'react'
import { getLaunchMode, trackEvent } from '../../utils/analytics'

const INSTALL_CARD_HIDDEN_KEY = 'onzip_install_card_hidden_v1'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>
}

function isIosSafariLike() {
  const ua = navigator.userAgent.toLowerCase()
  return /iphone|ipad|ipod/.test(ua)
}

export default function InstallPromptCard() {
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null)
  const [showGuide, setShowGuide] = useState(false)
  const [hidden, setHidden] = useState(() => (
    getLaunchMode() === 'standalone' || localStorage.getItem(INSTALL_CARD_HIDDEN_KEY) === 'true'
  ))

  useEffect(() => {
    function handleBeforeInstallPrompt(event: Event) {
      event.preventDefault()
      setInstallEvent(event as BeforeInstallPromptEvent)
      trackEvent('install_prompt_available')
    }

    function handleInstalled() {
      localStorage.setItem(INSTALL_CARD_HIDDEN_KEY, 'true')
      setHidden(true)
      trackEvent('install_success')
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleInstalled)
    }
  }, [])

  if (hidden) return null

  async function handleInstall() {
    trackEvent('install_cta_click', {
      platform: isIosSafariLike() ? 'ios' : installEvent ? 'prompt' : 'manual',
    })

    if (!installEvent) {
      setShowGuide(true)
      trackEvent('install_guide_open', { platform: isIosSafariLike() ? 'ios' : 'manual' })
      return
    }

    await installEvent.prompt()
    const choice = await installEvent.userChoice
    trackEvent('install_prompt_result', { outcome: choice.outcome })
    setInstallEvent(null)
  }

  function handleHide() {
    localStorage.setItem(INSTALL_CARD_HIDDEN_KEY, 'true')
    setHidden(true)
    trackEvent('install_card_hide')
  }

  return (
    <>
      <section className="oz-card p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-base font-semibold text-[#222222]">앱으로 설치하기</p>
            <p className="mt-1 text-sm leading-relaxed text-[#6a6a6a]">
              홈 화면에 추가하면 주소창 없이 열리고, iPhone에서도 설치한 앱 저장소가 더 안정적으로 유지돼요.
            </p>
          </div>
          <button
            onClick={handleHide}
            className="h-9 w-9 flex-shrink-0 rounded-full bg-[#f2f2f2] text-[#6a6a6a] text-lg"
            aria-label="앱 설치 안내 닫기"
          >
            ×
          </button>
        </div>
        <button
          onClick={handleInstall}
          className="mt-3 min-h-[48px] w-full rounded-full bg-[#ff385c] text-sm font-semibold text-white active:bg-[#e00b41]"
        >
          앱으로 설치하기
        </button>
      </section>

      {showGuide && (
        <div className="fixed inset-0 z-50 flex items-end bg-black/30" onClick={() => setShowGuide(false)}>
          <div className="w-full max-w-lg rounded-t-[28px] bg-white p-5" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-[#222222]">홈 화면에 추가</h2>
              <button
                onClick={() => setShowGuide(false)}
                className="h-11 w-11 rounded-full bg-[#f2f2f2] text-[#6a6a6a] text-xl leading-none"
                aria-label="닫기"
              >
                ×
              </button>
            </div>
            <ol className="mt-4 space-y-3 text-sm leading-relaxed text-[#444444]">
              <li>1. 브라우저의 공유 또는 메뉴 버튼을 누르세요.</li>
              <li>2. <strong>홈 화면에 추가</strong> 또는 <strong>앱 설치</strong>를 선택하세요.</li>
              <li>3. 생성된 온집 아이콘으로 실행하면 앱처럼 사용할 수 있어요.</li>
            </ol>
          </div>
        </div>
      )}
    </>
  )
}
