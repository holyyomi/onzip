import { useState } from 'react'
import { getTabMemo, setTabMemo, type MemoTab } from '../../utils/tabMemoStore'

interface Props {
  tab: MemoTab
  title?: string
  placeholder?: string
}

export default function TabMemoCard({
  tab,
  title = '메모장',
  placeholder = '여기에 적으면 자동으로 저장돼요.',
}: Props) {
  const [memo, setMemo] = useState(() => getTabMemo(tab))

  function handleChange(value: string) {
    setMemo(value)
    setTabMemo(tab, value)
  }

  return (
    <section className="oz-card p-5">
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-[13px] font-semibold text-[#ff385c]">바로 적기</p>
          <h2 className="text-lg font-semibold text-[#222222] mt-0.5">{title}</h2>
        </div>
        <span className="h-9 w-9 rounded-full bg-[#fff0f3] text-[#ff385c] flex items-center justify-center text-sm font-semibold">
          메
        </span>
      </div>
      <textarea
        value={memo}
        onChange={(e) => handleChange(e.target.value)}
        placeholder={placeholder}
        className="w-full min-h-[108px] resize-none rounded-[18px] border border-[#dddddd] bg-[#f7f7f7] px-4 py-3 text-base leading-relaxed text-[#222222] placeholder:text-[#8a8a8a] focus:outline-none focus:border-[#222222]"
      />
      <p className="mt-2 text-xs text-[#6a6a6a]">이 휴대폰에 자동 저장됩니다.</p>
    </section>
  )
}
