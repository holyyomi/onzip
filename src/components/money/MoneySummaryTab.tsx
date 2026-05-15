import { useMemo } from 'react'
import {
  ledgerEntryRepo,
  fixedExpenseRepo,
  subscriptionRepo,
} from '../../data/repositories'
import { formatAmount } from '../../utils/date'

interface Props {
  year: number
  month: number
  refreshKey: number
}

export default function MoneySummaryTab({ year, month, refreshKey }: Props) {
  const data = useMemo(() => {
    const entries = ledgerEntryRepo.getByMonth(year, month)
    const income = ledgerEntryRepo.sumByType(entries, 'income')
    const expense = ledgerEntryRepo.sumByType(entries, 'expense')
    const fixedTotal = fixedExpenseRepo.monthlyTotal()
    const subTotal = subscriptionRepo.monthlyTotal()
    const balance = income - expense - fixedTotal

    // 이번 달 납부 현황
    const prefix = `${year}-${String(month).padStart(2, '0')}`
    const today = new Date()
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`

    const todayPayments = fixedExpenseRepo
      .getActive()
      .filter((fe) => {
        const day = String(fe.payment_day).padStart(2, '0')
        return `${prefix}-${day}` === todayStr
      })

    return { income, expense, fixedTotal, subTotal, balance, todayPayments }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [year, month, refreshKey])

  return (
    <div className="p-4 space-y-3">
      {/* 핵심 4개 카드 */}
      <div className="grid grid-cols-2 gap-3">
        <SummaryCard label="이번 달 수입" amount={data.income} color="text-blue-600" />
        <SummaryCard label="이번 달 지출" amount={data.expense} color="text-red-500" />
        <SummaryCard label="고정지출" amount={data.fixedTotal} color="text-orange-500" />
        <SummaryCard label="구독료" amount={data.subTotal} color="text-purple-500" />
      </div>

      {/* 남은 생활비 */}
      <div className="bg-white rounded-xl p-4">
        <p className="text-xs text-gray-400 mb-1">남은 생활비</p>
        <p
          className={`text-2xl font-bold ${
            data.balance >= 0 ? 'text-gray-800' : 'text-red-500'
          }`}
        >
          {data.balance < 0 ? '-' : ''}
          {formatAmount(Math.abs(data.balance))}
        </p>
        <p className="text-xs text-gray-400 mt-1">
          수입 {formatAmount(data.income)} − 지출 {formatAmount(data.expense)} − 고정지출{' '}
          {formatAmount(data.fixedTotal)}
        </p>
      </div>

      {/* 오늘 납부 */}
      {data.todayPayments.length > 0 && (
        <div className="bg-red-50 rounded-xl p-4">
          <p className="text-xs text-red-400 font-medium mb-2">오늘 납부 예정</p>
          {data.todayPayments.map((fe) => (
            <div key={fe.id} className="flex justify-between text-sm">
              <span className="text-gray-700">{fe.title}</span>
              <span className="text-red-500 font-medium">{formatAmount(fe.amount)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function SummaryCard({
  label,
  amount,
  color,
}: {
  label: string
  amount: number
  color: string
}) {
  return (
    <div className="bg-white rounded-xl p-3">
      <p className="text-xs text-gray-400">{label}</p>
      <p className={`text-base font-bold mt-1 ${color}`}>
        {formatAmount(amount)}
      </p>
    </div>
  )
}
