import { useRef, type ChangeEvent } from 'react'
import { trackEvent } from '../../utils/analytics'
import { exportLocalData, importLocalDataFromFile } from '../../utils/dataExport'

const APP_URL = 'https://onzip.vercel.app'
const CONTACT_EMAIL = 'holyyomi@naver.com'

const SHARE_TEXT = `온집
들어올 돈, 나갈 돈, 중요한 날짜와 금고 메모를 한곳에서 챙기는 개인 생활 앱입니다.

설치 방법:
1. ${APP_URL} 접속
2. 홈 화면에 추가
3. 온집 아이콘으로 실행

참고: 입력한 데이터는 서버가 아니라 본인 기기에 저장됩니다.`

export default function ShareAndSupportCard() {
  const fileInputRef = useRef<HTMLInputElement>(null)

  async function handleShare() {
    trackEvent('share_app_click')

    if (navigator.share) {
      try {
        await navigator.share({
          title: '온집',
          text: SHARE_TEXT,
          url: APP_URL,
        })
        trackEvent('share_app_success')
        return
      } catch {
        trackEvent('share_app_cancel')
      }
    }

    await navigator.clipboard.writeText(`${SHARE_TEXT}\n${APP_URL}`)
    alert('공유 문구와 링크를 복사했습니다.')
    trackEvent('share_app_copy')
  }

  function handleContact() {
    trackEvent('contact_click')
    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent('[온집 문의]')}`
  }

  function handleExport() {
    if (!confirm('이 기기에 저장된 온집 데이터를 JSON 파일로 내려받겠습니까?')) return
    exportLocalData()
  }

  function handleImportClick() {
    fileInputRef.current?.click()
  }

  async function handleImportFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    if (!confirm('현재 이 기기의 온집 데이터를 백업 파일 내용으로 교체합니다. 계속할까요?')) return

    try {
      await importLocalDataFromFile(file)
      alert('백업 파일을 불러왔습니다. 앱을 새로고침합니다.')
      window.location.reload()
    } catch {
      alert('백업 파일을 확인할 수 없습니다.')
    }
  }

  return (
    <>
      <section className="oz-card p-4">
        <p className="text-base font-semibold text-[#222222]">앱 링크 공유</p>
        <p className="mt-1 text-sm leading-relaxed text-[#6a6a6a]">
          온집 설치 링크만 전달합니다. 내 돈, 일정, 금고 데이터는 함께 전송되지 않습니다.
        </p>
        <button
          onClick={handleShare}
          className="mt-4 min-h-[48px] w-full rounded-full bg-[#ff385c] px-4 text-sm font-semibold text-white active:bg-[#e00b41]"
        >
          앱 링크 공유하기
        </button>
      </section>

      <section className="oz-card p-4">
        <p className="text-base font-semibold text-[#222222]">내 데이터 백업</p>
        <p className="mt-1 text-sm leading-relaxed text-[#6a6a6a]">
          이 기기에 저장된 온집 데이터를 파일로 보관하거나, 이전에 받은 백업 파일로 복원합니다.
        </p>
        <input
          ref={fileInputRef}
          type="file"
          accept="application/json,.json"
          className="hidden"
          onChange={handleImportFile}
        />
        <button
          onClick={handleExport}
          className="mt-4 min-h-[48px] w-full rounded-full border border-[#dddddd] bg-white px-4 text-sm font-semibold text-[#222222]"
        >
          백업 파일 내려받기
        </button>
        <button
          onClick={handleImportClick}
          className="mt-2 min-h-[48px] w-full rounded-full bg-[#222222] px-4 text-sm font-semibold text-white"
        >
          백업 파일 불러오기
        </button>
      </section>

      <section className="oz-card p-4">
        <p className="text-base font-semibold text-[#222222]">문의</p>
        <p className="mt-1 text-sm leading-relaxed text-[#6a6a6a]">
          오류나 개선 의견은 메일로 보내주세요.
        </p>
        <button
          onClick={handleContact}
          className="mt-4 min-h-[48px] w-full rounded-full border border-[#dddddd] bg-white px-4 text-sm font-semibold text-[#222222]"
        >
          문의하기
        </button>

        <p className="mt-3 text-xs leading-relaxed text-[#8a8a8a]">
          {CONTACT_EMAIL}
        </p>
      </section>
    </>
  )
}
