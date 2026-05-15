import { useState } from 'react'
import { formatAmount } from '../../utils/date'

type CalcMode = 'basic' | 'split' | 'subscription'

export default function CalculatorTab() {
  const [mode, setMode] = useState<CalcMode>('basic')

  return (
    <div className="p-4">
      {/* 모드 전환 */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-4">
        {([
          { value: 'basic', label: '기본' },
          { value: 'split', label: '분담' },
          { value: 'subscription', label: '구독' },
        ] as { value: CalcMode; label: string }[]).map((m) => (
          <button
            key={m.value}
            onClick={() => setMode(m.value)}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
              mode === m.value ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-400'
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>

      {mode === 'basic' && <BasicCalculator />}
      {mode === 'split' && <SplitCalculator />}
      {mode === 'subscription' && <SubscriptionAnnualCalculator />}
    </div>
  )
}

// ─────────────────────────────────
// 1. 일반 계산기
// ─────────────────────────────────
function BasicCalculator() {
  const [display, setDisplay] = useState('0')
  const [operand, setOperand] = useState<number | null>(null)
  const [operator, setOperator] = useState<string | null>(null)
  const [waiting, setWaiting] = useState(false)
  const [copied, setCopied] = useState(false)

  function calc(a: number, b: number, op: string): number {
    switch (op) {
      case '+': return a + b
      case '-': return a - b
      case '×': return a * b
      case '÷': return b !== 0 ? a / b : 0
      default: return b
    }
  }

  function fmt(n: number): string {
    const s = Number.isInteger(n) ? String(n) : n.toFixed(4).replace(/0+$/, '')
    return s.length > 12 ? n.toExponential(4) : s
  }

  function handleDigit(d: string) {
    if (display.length >= 12 && !waiting) return
    if (waiting) { setDisplay(d); setWaiting(false) }
    else setDisplay(display === '0' ? d : display + d)
  }

  function handleDot() {
    if (waiting) { setDisplay('0.'); setWaiting(false); return }
    if (!display.includes('.')) setDisplay(display + '.')
  }

  function handleOp(op: string) {
    const cur = parseFloat(display)
    if (operand !== null && !waiting) {
      const res = calc(operand, cur, operator!)
      setDisplay(fmt(res)); setOperand(res)
    } else {
      setOperand(cur)
    }
    setOperator(op); setWaiting(true)
  }

  function handleEquals() {
    if (operand === null || operator === null) return
    const cur = parseFloat(display)
    const res = calc(operand, cur, operator)
    setDisplay(fmt(res)); setOperand(null); setOperator(null); setWaiting(true)
  }

  function handleClear() {
    setDisplay('0'); setOperand(null); setOperator(null); setWaiting(false)
  }

  function handleBackspace() {
    if (waiting || display.length <= 1) { setDisplay('0'); return }
    setDisplay(display.slice(0, -1) || '0')
  }

  function handleCopy() {
    navigator.clipboard.writeText(display).then(() => {
      setCopied(true); setTimeout(() => setCopied(false), 1500)
    })
  }

  const BTNS = [
    ['C', '±', '%', '÷'],
    ['7', '8', '9', '×'],
    ['4', '5', '6', '-'],
    ['1', '2', '3', '+'],
    ['0', '.', '⌫', '='],
  ]

  return (
    <div className="bg-white rounded-2xl p-4">
      {/* 디스플레이 */}
      <div className="text-right mb-4 min-h-[60px]">
        {operator && (
          <p className="text-xs text-gray-400">{operand} {operator}</p>
        )}
        <p className="text-3xl font-light text-gray-800 break-all">{display}</p>
      </div>

      <button onClick={handleCopy} className="text-xs text-gray-400 border border-gray-200 rounded-lg px-2 py-1 mb-3">
        {copied ? '복사됨' : '결과 복사'}
      </button>

      {/* 버튼 그리드 */}
      <div className="grid grid-cols-4 gap-2">
        {BTNS.flat().map((btn, i) => {
          const isOp = ['÷', '×', '-', '+', '='].includes(btn)
          const isSpecial = ['C', '±', '%', '⌫'].includes(btn)
          const isZero = btn === '0'
          return (
            <button
              key={i}
              onClick={() => {
                if (btn === 'C') handleClear()
                else if (btn === '⌫') handleBackspace()
                else if (btn === '=') handleEquals()
                else if (btn === '.') handleDot()
                else if (['÷', '×', '-', '+'].includes(btn)) handleOp(btn)
                else if (btn === '±') setDisplay(String(-parseFloat(display)))
                else if (btn === '%') setDisplay(String(parseFloat(display) / 100))
                else handleDigit(btn)
              }}
              className={`py-3 rounded-xl text-lg font-medium transition-colors ${
                isZero ? '' : ''
              } ${
                isOp ? 'bg-blue-500 text-white' :
                isSpecial ? 'bg-gray-100 text-gray-600' :
                'bg-gray-50 text-gray-800'
              }`}
            >
              {btn}
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ─────────────────────────────────
// 2. 생활비 분담 계산기
// ─────────────────────────────────
function SplitCalculator() {
  const [total, setTotal] = useState('')
  const [ratio, setRatio] = useState<'5:5' | '6:4' | '7:3' | 'custom'>('5:5')
  const [myRatio, setMyRatio] = useState(50)

  const RATIOS = [
    { value: '5:5' as const, label: '5:5', my: 50 },
    { value: '6:4' as const, label: '6:4', my: 60 },
    { value: '7:3' as const, label: '7:3', my: 70 },
    { value: 'custom' as const, label: '직접' },
  ]

  const amt = Number(total.replace(/,/g, '')) || 0
  const spouseRatio = ratio === 'custom' ? 100 - myRatio : 100 - RATIOS.find(r => r.value === ratio)!.my!
  const myAmt = Math.round(amt * (ratio === 'custom' ? myRatio : RATIOS.find(r => r.value === ratio)!.my!) / 100)
  const spouseAmt = amt - myAmt

  return (
    <div className="bg-white rounded-2xl p-4 space-y-4">
      <div>
        <label className="text-xs text-gray-500 block mb-1">총 금액</label>
        <input type="number" placeholder="0" value={total}
          onChange={(e) => setTotal(e.target.value)}
          className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-lg font-medium focus:outline-none focus:border-blue-400"
          inputMode="numeric" />
      </div>

      <div>
        <label className="text-xs text-gray-500 block mb-2">분담 비율</label>
        <div className="flex gap-2">
          {RATIOS.map((r) => (
            <button key={r.value} onClick={() => { setRatio(r.value); if (r.my) setMyRatio(r.my) }}
              className={`flex-1 py-2 rounded-lg text-sm font-medium border ${
                ratio === r.value ? 'bg-blue-500 text-white border-blue-500' : 'text-gray-500 border-gray-200'
              }`}>
              {r.label}
            </button>
          ))}
        </div>
        {ratio === 'custom' && (
          <div className="mt-2">
            <p className="text-xs text-gray-500 mb-1">내 비율: {myRatio}%</p>
            <input type="range" min={0} max={100} value={myRatio}
              onChange={(e) => setMyRatio(Number(e.target.value))}
              className="w-full" />
          </div>
        )}
      </div>

      {amt > 0 && (
        <div className="bg-blue-50 rounded-xl p-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">나 ({ratio === 'custom' ? myRatio : RATIOS.find(r => r.value === ratio)!.my}%)</span>
            <span className="font-bold text-gray-800">{formatAmount(myAmt)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">배우자 ({ratio === 'custom' ? 100 - myRatio : spouseRatio}%)</span>
            <span className="font-bold text-gray-800">{formatAmount(spouseAmt)}</span>
          </div>
        </div>
      )}
    </div>
  )
}

// ─────────────────────────────────
// 3. 구독료 연간 계산기
// ─────────────────────────────────
function SubscriptionAnnualCalculator() {
  const [monthly, setMonthly] = useState('')

  const amt = Number(monthly.replace(/,/g, '')) || 0
  const annual = amt * 12
  const twoYear = amt * 24

  return (
    <div className="bg-white rounded-2xl p-4 space-y-4">
      <div>
        <label className="text-xs text-gray-500 block mb-1">월 구독료</label>
        <input type="number" placeholder="0" value={monthly}
          onChange={(e) => setMonthly(e.target.value)}
          className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-lg font-medium focus:outline-none focus:border-blue-400"
          inputMode="numeric" />
      </div>

      {amt > 0 && (
        <div className="space-y-2">
          <ResultRow label="연간 비용" value={annual} highlight />
          <ResultRow label="2년 비용" value={twoYear} />
          <ResultRow label="해지 시 연간 절약" value={annual} color="text-green-600" />
          <div className="bg-purple-50 rounded-xl p-3 mt-2">
            <p className="text-xs text-purple-500">
              하루 환산: {formatAmount(Math.round(amt / 30))}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

function ResultRow({ label, value, highlight, color }: {
  label: string; value: number; highlight?: boolean; color?: string
}) {
  return (
    <div className={`flex justify-between items-center p-3 rounded-xl ${highlight ? 'bg-gray-50' : ''}`}>
      <span className="text-sm text-gray-600">{label}</span>
      <span className={`text-sm font-bold ${color ?? 'text-gray-800'}`}>
        {formatAmount(value)}
      </span>
    </div>
  )
}
