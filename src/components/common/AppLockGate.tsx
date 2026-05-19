import { useEffect, useState } from 'react'
import { APP_LOCK_EVENT, hasAppPin, verifyAppPin } from '../../utils/appLock'

export default function AppLockGate() {
  const [locked, setLocked] = useState(false)
  const [pin, setPin] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    setLocked(hasAppPin())

    function handleLock() {
      if (hasAppPin()) {
        setPin('')
        setError('')
        setLocked(true)
      }
    }

    window.addEventListener(APP_LOCK_EVENT, handleLock)
    return () => window.removeEventListener(APP_LOCK_EVENT, handleLock)
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
      </div>
    </div>
  )
}
