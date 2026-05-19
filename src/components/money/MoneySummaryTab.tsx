import { useMemo } from 'react'
import {
  ledgerEntryRepo,
  fixedExpenseRepo,
  subscriptionRepo,
} from '../../data/repositories'
import { displayAmount, useAmountPrivacy } from '../../utils/amountPrivacy'
import PaymentProgressCard from './PaymentProgressCard'

interface Props {
  year: number
  month: number
  refreshKey: number
}

// 최근 N개월 지출 트렌드
function getMonthlyTrend(currentYear: number, currentMonth: number, months: number) {
  const result: { label: string; expense: number; income: number }[] = []
  for (let i = months - 1; i >= 0; i--) {
    let y = currentYear
    let m = currentMonth - i
    while (m <= 0) { m += 12; y-- }
    const entries = ledgerEntryRepo.getByMonth(y, m)
    result.push({
      label: `${m}월`,
      expense: ledgerEntryRepo.sumByType(entries, 'expense'),
      income: ledgerEntryRepo.sumByType(entries, 'income'),
    })
  }
  return result
}

export default function MoneySummaryTab({ year, month, refreshKey }: Props) {
  const { hidden: hideAmounts } = useAmountPrivacy()
  const data = useMemo(() => {
    const entries = ledgerEntryRepo.getByMonth(year, month)
    const income = ledgerEntryRepo.sumByType(entries, 'income')
    const expense = ledgerEntryRepo.sumByType(entries, 'expense')
    const fixedTotal = fixedExpenseRepo.monthlyTotal()
    const subTotal = subscriptionRepo.monthlyTotal()
    const balance = income - expense - fixedTotal

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

  const trend = useMemo(
    () => getMonthlyTrend(year, month, 3),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [year, month, refreshKey],
  )

  const maxTrend = Math.max(...trend.map((t) => Math.max(t.expense, t.income)), 1)

  return (
    <div className="p-4 space-y-3">
      {/* 핵심 4개 카드 */}
      <div className="grid grid-cols-2 gap-3">
        <SummaryCard label="이번 달 수입" amount={data.income} hidden={hideAmounts} color="text-blue-600" />
        <SummaryCard label="이번 달 지출" amount={data.expense} hidden={hideAmounts} color="text-red-500" />
        <SummaryCard label="고정지출 합계" amount={data.fixedTotal} hidden={hideAmounts} color="text-orange-500" />
        <SummaryCard label="구독료 합계" amount={data.subTotal} hidden={hideAmounts} color="text-purple-500" />
      </div>

      {/* 남은 생활비 */}
      <div className="bg-white rounded-xl p-4">
        <p className="text-xs text-gray-400 mb-1">남은 생활비</p>
        <p className={`text-2xl font-bold ${data.balance >= 0 ? 'text-gray-800' : 'text-red-500'}`}>
          {data.balance < 0 ? '-' : ''}
          {displayAmount(Math.abs(data.balance), hideAmounts)}
        </p>
        <p className="text-xs text-gray-400 mt-1">
          수입 {displayAmount(data.income, hideAmounts)} − 지출 {displayAmount(data.expense, hideAmounts)} − 고정 {displayAmount(data.fixedTotal, hideAmounts)}
        </p>
      </div>

      {/* 최근 3개월 트렌드 */}
      <div className="bg-white rounded-xl p-4">
        <p className="text-xs text-gray-400 font-medium mb-3">최근 3개월 트렌드</p>
        <div className="space-y-3">
          {trend.map((t) => (
            <div key={t.label}>
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span className="font-medium">{t.label}</span>
                <span>
                  <span className="text-blue-500">{displayAmount(t.income, hideAmounts)}</span>
                  {' / '}
                  <span className="text-red-500">{displayAmount(t.expense, hideAmounts)}</span>
                </span>
              </div>
              {/* 수입 바 */}
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden mb-1">
                <div
                  className="h-full bg-blue-300 rounded-full"
                  style={{ width: `${(t.income / maxTrend) * 100}%` }}
                />
              </div>
              {/* 지출 바 */}
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-red-300 rounded-full"
                  style={{ width: `${(t.expense / maxTrend) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
        <div className="flex gap-4 mt-2">
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-blue-300" />
            <span className="text-xs text-gray-400">수입</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-red-300" />
            <span className="text-xs text-gray-400">지출</span>
          </div>
        </div>
      </div>

      {/* 납부 진행 현황 */}
      <PaymentProgressCard />

      {/* 오늘 납부 */}
      {data.todayPayments.length > 0 && (
        <div className="bg-red-50 rounded-xl p-4">
          <p className="text-xs text-red-400 font-medium mb-2">오늘 납부 예정</p>
          {data.todayPayments.map((fe) => (
            <div key={fe.id} className="flex justify-between text-sm">
              <span className="text-gray-700">{fe.title}</span>
              <span className="text-red-500 font-medium">{displayAmount(fe.amount, hideAmounts)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function SummaryCard({ label, amount, hidden, color }: { label: string; amount: number; hidden: boolean; color: string }) {
  return (
    <div className="bg-white rounded-xl p-3">
      <p className="text-xs text-gray-400">{label}</p>
      <p className={`text-base font-bold mt-1 ${color}`}>{displayAmount(amount, hidden)}</p>
    </div>
  )
}
