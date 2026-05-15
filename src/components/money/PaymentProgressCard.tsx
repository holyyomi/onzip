// 이번 달 고정지출 납부 현황 카드 — MoneySummaryTab에서 사용
import { fixedExpenseRepo } from '../../data/repositories'
import { formatAmount } from '../../utils/date'

export default function PaymentProgressCard() {
  const all = fixedExpenseRepo.getActive()
  const done = all.filter((fe) => fe.status === 'done')
  const pending = all.filter((fe) => fe.status === 'pending')
  const overdue = all.filter((fe) => fe.status === 'overdue')

  const doneAmount = done.reduce((s, fe) => s + fe.amount, 0)
  const totalAmount = all.reduce((s, fe) => s + fe.amount, 0)
  const rate = all.length ? Math.round((done.length / all.length) * 100) : 0

  if (all.length === 0) return null

  return (
    <div className="bg-white rounded-xl p-4">
      <div className="flex justify-between items-center mb-2">
        <p className="text-xs text-gray-400 font-medium">이번 달 납부 현황</p>
        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
          rate === 100 ? 'bg-green-100 text-green-600' :
          overdue.length > 0 ? 'bg-red-100 text-red-500' :
          'bg-gray-100 text-gray-500'
        }`}>
          {done.length}/{all.length} 완료
        </span>
      </div>

      {/* 진행률 바 */}
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden mb-3">
        <div
          className={`h-full rounded-full transition-all ${rate === 100 ? 'bg-green-400' : 'bg-blue-400'}`}
          style={{ width: `${rate}%` }}
        />
      </div>

      {/* 금액 요약 */}
      <div className="flex justify-between text-xs text-gray-500">
        <span>납부 완료 <span className="font-semibold text-green-600">{formatAmount(doneAmount)}</span></span>
        <span>남은 납부 <span className="font-semibold text-red-500">{formatAmount(totalAmount - doneAmount)}</span></span>
      </div>

      {/* 미납 경고 */}
      {overdue.length > 0 && (
        <div className="mt-2 bg-red-50 rounded-lg px-3 py-2">
          <p className="text-xs text-red-500 font-medium">
            미납 {overdue.length}건: {overdue.map((fe) => fe.title).join(', ')}
          </p>
        </div>
      )}

      {/* 미결제 목록 (납부 예정) */}
      {pending.length > 0 && (
        <div className="mt-2 space-y-1">
          {pending.slice(0, 3).map((fe) => (
            <div key={fe.id} className="flex justify-between text-xs">
              <span className="text-gray-600">{fe.title}</span>
              <span className="text-gray-500">{fe.payment_day}일 · {formatAmount(fe.amount)}</span>
            </div>
          ))}
          {pending.length > 3 && (
            <p className="text-xs text-gray-400 text-right">외 {pending.length - 3}건</p>
          )}
        </div>
      )}
    </div>
  )
}
