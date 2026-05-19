import { useEffect, useRef, useState } from 'react'
import { APP_LOCK_EVENT, hasAppPin, verifyAppPin } from '../../utils/appLock'

const IDLE_LOCK_MS = 5 * 60 * 1000
const BACKGROUND_LOCK_MS = 60 * 1000

export default function AppLockGate() {
  const [locked, setLocked] = useState(false)
  const [pin, setPin] = useState('')
  const [error, setError] = useState('')
  const [showHelp, setShowHelp] = useState(false)
  const idleTimerRef = useRef<number | null>(null)
  const backgroundStartedAtRef = useRef<number | null>(null)

  useEffect(() => {
    setLocked(hasAppPin())

    function handleLock() {
      if (hasAppPin()) {
        setPin('')
        setError('')
        setLocked(true)
      }
    }

    function clearIdleTimer() {
      if (idleTimerRef.current) {
        window.clearTimeout(idleTimerRef.current)
        idleTimerRef.current = null
      }
    }

    function scheduleIdleLock() {
      clearIdleTimer()
      if (!hasAppPin()) return
      idleTimerRef.current = window.setTimeout(handleLock, IDLE_LOCK_MS)
    }

    function handleActivity() {
      if (document.visibilityState === 'visible') {
        scheduleIdleLock()
      }
    }

    function handleVisibilityChange() {
      if (!hasAppPin()) return

      if (document.visibilityState === 'hidden') {
        backgroundStartedAtRef.current = Date.now()
        clearIdleTimer()
        return
      }

      const backgroundStartedAt = backgroundStartedAtRef.current
      backgroundStartedAtRef.current = null
      if (backgroundStartedAt && Date.now() - backgroundStartedAt >= BACKGROUND_LOCK_MS) {
        handleLock()
        return
      }

      scheduleIdleLock()
    }

    const activityEvents = ['pointerdown', 'keydown', 'touchstart', 'scroll'] as const

    window.addEventListener(APP_LOCK_EVENT, handleLock)
    document.addEventListener('visibilitychange', handleVisibilityChange)
    activityEvents.forEach((eventName) => window.addEventListener(eventName, handleActivity, { passive: true }))
    scheduleIdleLock()

    return () => {
      clearIdleTimer()
      window.removeEventListener(APP_LOCK_EVENT, handleLock)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      activityEvents.forEach((eventName) => window.removeEventListener(eventName, handleActivity))
    }
  }, [])

  if (!locked) return null

  async function handleUnlock() {
    const ok = await verifyAppPin(pin)
    if (!ok) {
      setError('PIN이 맞지 않습니다.')
      setPin('')
      return
    }

    setLocked(false)
    setPin('')
    setError('')
  }

  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center bg-[#f7f7f7]">
      <div className="w-full max-w-lg rounded-t-[28px] bg-white p-5 shadow-lg">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-[20px] bg-[#fff0f3]">
          <span className="text-2xl font-semibold text-[#ff385c]">잠금</span>
        </div>
        <h2 className="text-center text-2xl font-semibold text-[#222222]">온집 잠금</h2>
        <p className="mt-2 text-center text-sm leading-relaxed text-[#6a6a6a]">
          돈 흐름과 금고 메모를 보려면 PIN을 입력하세요.
        </p>

        <input
          type="password"
          inputMode="numeric"
          value={pin}
          onChange={(e) => {
            setPin(e.target.value.replace(/\D/g, '').slice(0, 6))
            setError('')
          }}
          onKeyDown={(e) => e.key === 'Enter' && pin.length >= 4 && void handleUnlock()}
          className="mt-5 h-[56px] w-full rounded-[18px] border border-[#dddddd] bg-white px-4 text-center text-2xl tracking-[0.35em] text-[#222222] focus:border-[#222222] focus:outline-none"
          autoFocus
        />
        {error && <p className="mt-2 text-center text-xs font-semibold text-red-500">{error}</p>}

        <button
          onClick={() => void handleUnlock()}
          disabled={pin.length < 4}
          className="mt-5 min-h-[52px] w-full rounded-full bg-[#ff385c] text-sm font-semibold text-white disabled:opacity-40"
        >
          열기
        </button>

        <button
          onClick={() => setShowHelp((value) => !value)}
          className="mt-4 w-full text-center text-xs font-semibold text-[#6a6a6a]"
        >
          PIN을 잊었나요?
        </button>
        {showHelp && (
          <div className="mt-3 rounded-[18px] bg-[#f7f7f7] p-3 text-xs leading-relaxed text-[#6a6a6a]">
            <p>
              온집은 PIN을 우회해서 열 수 없습니다. 백업 파일이 있다면 브라우저 저장 데이터를 삭제한 뒤 백업 파일로 복원하세요.
            </p>
            <p className="mt-1">
              백업이 없으면 이 기기에 저장된 데이터도 함께 잃을 수 있습니다.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
