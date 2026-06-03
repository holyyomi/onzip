interface Props {
  secret: boolean
  onChange: (secret: boolean) => void
}

export default function SecretToggle({ secret, onChange }: Props) {
  return (
    <button
      type="button"
      aria-pressed={secret}
      onClick={() => onChange(!secret)}
      className={`min-h-[30px] flex-shrink-0 rounded-full border px-2.5 text-xs font-semibold transition-colors ${
        secret
          ? 'border-[#222222] bg-[#222222] text-white'
          : 'border-[#dddddd] bg-white text-[#8a8a8a]'
      }`}
    >
      {secret ? '비밀' : '공개'}
    </button>
  )
}
