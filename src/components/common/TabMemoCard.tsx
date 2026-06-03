import { useState } from 'react'
import { getTabMemo, isTabMemoSecret, setTabMemo, setTabMemoSecret, type MemoTab } from '../../utils/tabMemoStore'
import { MEMO_ICON } from '../../utils/featureIcons'
import { useVaultPrivacy } from '../../utils/vaultPrivacy'
import SecretToggle from './SecretToggle'

interface Props {
  tab: MemoTab
  title?: string
  placeholder?: string
}

export default function TabMemoCard({
  tab,
  title = '메모장',
  placeholder = '필요한 내용을 기록하세요.',
}: Props) {
  const [memo, setMemo] = useState(() => getTabMemo(tab))
  const [secret, setSecret] = useState(() => isTabMemoSecret(tab))
  const { hidden: hideSecret } = useVaultPrivacy()

  function handleChange(value: string) {
    setMemo(value)
    setTabMemo(tab, value)
  }

  function handleSecretChange(nextSecret: boolean) {
    setSecret(nextSecret)
    setTabMemoSecret(tab, nextSecret)
  }

  return (
    <section className="oz-card p-4">
      <div className="flex items-center justify-between mb-2.5">
        <div>
          <p className="text-[13px] font-semibold text-[#ff385c]">빠른 메모</p>
          <h2 className="text-lg font-semibold text-[#222222] mt-0.5">{title}</h2>
        </div>
        <div className="flex flex-shrink-0 items-center gap-2">
          <SecretToggle secret={secret} onChange={handleSecretChange} />
          <img src={MEMO_ICON} alt="" className="h-9 w-9 rounded-[14px] object-contain" />
        </div>
      </div>
      {hideSecret && secret ? (
        <div className="flex min-h-[92px] items-center rounded-[18px] border border-[#dddddd] bg-[#f7f7f7] px-4 py-3 text-sm font-semibold text-[#8a8a8a]">
          비밀 내용 숨김이 켜져 있습니다.
        </div>
      ) : (
        <textarea
          value={memo}
          onChange={(e) => handleChange(e.target.value)}
          placeholder={placeholder}
          className="w-full min-h-[92px] resize-none rounded-[18px] border border-[#dddddd] bg-[#f7f7f7] px-4 py-3 text-base leading-relaxed text-[#222222] placeholder:text-[#8a8a8a] focus:outline-none focus:border-[#222222]"
        />
      )}
      <p className="mt-1.5 text-xs text-[#6a6a6a]">자동 저장됩니다.</p>
    </section>
  )
}
