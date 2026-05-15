import { getTodayAggregated } from '../../utils/calendarAggregator'
import { formatDateLabel, todayStr } from '../../utils/date'

export default function TodaySummaryCard() {
  const events = getTodayAggregated()

  const scheduleCount = events.filter((e) => e.type === 'schedule').length
  const paymentCount = events.filter(
    (e) => e.type === 'fixed_expense' || e.type === 'subscription',
  ).length
  const checklistCount = events.filter((e) => e.type === 'checklist').length
  const totalAmount = events
    .filter((e) => e.type === 'fixed_expense' || e.type === 'subscription')
    .reduce((sum, e) => sum + (e.amount ?? 0), 0)

  return (
    <div className="mx-4 my-3 bg-blue-50 rounded-xl p-4">
      <p className="text-xs text-blue-400 font-medium mb-2">
        {formatDateLabel(todayStr())} 요약
      </p>

      <div className="grid grid-cols-3 gap-2">
        <SummaryItem label="일정" value={scheduleCount} unit="개" />
        <SummaryItem
          label="납부"
          value={paymentCount}
          unit="건"
          sub={
            paymentCount > 0
              ? totalAmount.toLocaleString('ko-KR') + '원'
              : undefined
          }
        />
        <SummaryItem label="체크리스트" value={checklistCount} unit="개" />
      </div>

      {events.length === 0 && (
        <p className="text-xs text-blue-300 text-center mt-1">
          오늘 예정된 항목이 없습니다
        </p>
      )}
    </div>
  )
}

function SummaryItem({
  label,
  value,
  unit,
  sub,
}: {
  label: string
  value: number
  unit: string
  sub?: string
}) {
  return (
    <div className="bg-white rounded-lg p-2 text-center">
      <p className="text-xs text-gray-400">{label}</p>
      <p className="text-lg font-bold text-gray-800">
        {value}
        <span className="text-xs font-normal text-gray-400 ml-0.5">{unit}</span>
      </p>
      {sub && <p className="text-xs text-red-400">{sub}</p>}
    </div>
  )
}
