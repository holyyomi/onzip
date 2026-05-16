import { trackEvent } from '../../utils/analytics'
import { exportLocalData } from '../../utils/dataExport'

const APP_URL = 'https://onzip.vercel.app'
const CONTACT_EMAIL = 'holyyomi@naver.com'

const SHARE_TEXT = `온집 써봐!
우리집 일정, 돈관리, 장보기, 체크리스트, 기록을 폰에 설치해서 가볍게 관리하는 앱이야.

설치 방법:
1. ${APP_URL} 접속
2. 홈 화면에 추가
3. 온집 아이콘으로 실행

주의: 데이터는 서버가 아니라 본인 폰에만 저장돼.`

export default function ShareAndSupportCard() {
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
    alert('공유 문구와 링크를 복사했어요.')
    trackEvent('share_app_copy')
  }

  function handleContact() {
    trackEvent('contact_click')
    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent('[온집 문의]')}`
  }

  function handleExport() {
    if (!confirm('이 기기에 저장된 온집 데이터를 JSON 파일로 내려받을까요?')) return
    exportLocalData()
  }

  return (
    <>
      <section className="oz-card p-4">
        <p className="text-base font-semibold text-[#222222]">앱 링크 공유</p>
        <p className="mt-1 text-sm leading-relaxed text-[#6a6a6a]">
          온집 설치 링크만 전달합니다. 내 일정, 지출, 메모 데이터는 함께 보내지지 않아요.
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
          이 기기에 저장된 온집 데이터를 파일로 내려받습니다.
        </p>
        <button
          onClick={handleExport}
          className="mt-4 min-h-[48px] w-full rounded-full border border-[#dddddd] bg-white px-4 text-sm font-semibold text-[#222222]"
        >
          백업 파일 내려받기
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
