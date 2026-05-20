import { useRef, useState, type ChangeEvent } from 'react'
import { trackEvent } from '../../utils/analytics'
import { exportLocalData, getLastBackupAt, importLocalDataFromFile } from '../../utils/dataExport'

const APP_URL = 'https://onzip.vercel.app'
const CONTACT_EMAIL = 'holyyomi@naver.com'

const SHARE_TEXT = `온집
수입 예정, 지출 예정, 중요한 일정과 보관 메모를 한곳에서 정리하는 개인 생활 앱입니다.

설치 방법:
1. ${APP_URL} 접속
2. 홈 화면에 추가
3. 온집 아이콘으로 실행

참고: 입력한 데이터는 서버가 아니라 본인 기기에 저장됩니다.`

function getBackupStatus(lastBackupAt: string | null) {
  if (!lastBackupAt) {
    return {
      label: '아직 백업 없음',
      tone: 'warn',
      detail: '금고나 흐름 기록을 쓰기 시작했다면 한 번 내려받아 두는 게 좋습니다.',
    }
  }

  const savedAt = new Date(lastBackupAt)
  if (!Number.isFinite(savedAt.getTime())) {
    return {
      label: '백업 확인 필요',
      tone: 'warn',
      detail: '최근 백업 시간을 확인할 수 없습니다. 새 백업 파일을 내려받아 두세요.',
    }
  }

  const diffMs = Date.now() - savedAt.getTime()
  const diffDays = Math.max(0, Math.floor(diffMs / 86_400_000))
  const dateLabel = savedAt.toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' })

  if (diffDays === 0) {
    return {
      label: '오늘 백업함',
      tone: 'ok',
      detail: `${dateLabel}에 백업 파일을 내려받았습니다.`,
    }
  }

  return {
    label: `${diffDays}일 전 백업`,
    tone: diffDays >= 14 ? 'warn' : 'ok',
    detail: `${dateLabel} 이후 새로 적은 내용은 다시 백업해야 안전합니다.`,
  }
}

export default function ShareAndSupportCard() {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [lastBackupAt, setLastBackupAt] = useState(getLastBackupAt)
  const backupStatus = getBackupStatus(lastBackupAt)

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
    setLastBackupAt(exportLocalData())
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
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-base font-semibold text-[#222222]">내 데이터 백업</p>
            <p className="mt-1 text-sm leading-relaxed text-[#6a6a6a]">
              이 기기에 저장된 온집 데이터를 파일로 보관하거나, 이전에 받은 백업 파일로 복원합니다.
            </p>
          </div>
          <span className={`flex-shrink-0 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ${
            backupStatus.tone === 'ok' ? 'bg-[#eefaf5] text-[#0a7f52]' : 'bg-[#fff0f3] text-[#ff385c]'
          }`}>
            {backupStatus.label}
          </span>
        </div>
        <p className="mt-1 text-sm leading-relaxed text-[#6a6a6a]">
          {backupStatus.detail}
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
