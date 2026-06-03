interface Props {
  secret: boolean
  onChange: (secret: boolean) => void
}

export default function SecretToggle({ secret, onChange }: Props) {
  return (
    <div className="flex min-h-[32px] flex-shrink-0 overflow-hidden rounded-full border border-[#dddddd] bg-white p-0.5">
      <button
        type="button"
        aria-pressed={!secret}
        onClick={() => onChange(false)}
        className={`min-w-[48px] rounded-full px-2.5 text-xs font-semibold transition-colors ${
          !secret ? 'bg-[#222222] text-white' : 'text-[#8a8a8a]'
        }`}
      >
        공개
      </button>
      <button
        type="button"
        aria-pressed={secret}
        onClick={() => onChange(true)}
        className={`min-w-[48px] rounded-full px-2.5 text-xs font-semibold transition-colors ${
          secret ? 'bg-[#222222] text-white' : 'text-[#8a8a8a]'
        }`}
      >
        비밀
      </button>
    </div>
  )
}
