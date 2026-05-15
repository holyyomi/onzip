import { useMemo } from 'react'
import { getTodayAggregated } from '../../utils/calendarAggregator'
import { formatDateLabel, todayStr } from '../../utils/date'
import { calendarEventRepo } from '../../data/repositories'

// 앞으로 N일 이내 기념일 계산
function getUpcomingAnniversaries(withinDays: number) {
  const today = new Date()
  const result: { title: string; dday: number }[] = []

  calendarEventRepo
    .getAll()
    .filter((e) => e.event_type === 'anniversary' && e.repeat_rule === 'yearly')
    .forEach((e) => {
      const [, sm, sd] = e.start_date.split('-').map(Number)

      for (const yearOffset of [0, 1]) {
        const occurrence = new Date(today.getFullYear() + yearOffset, sm - 1, sd)
        const diff = Math.ceil(
          (occurrence.setHours(0, 0, 0, 0) - new Date().setHours(0, 0, 0, 0)) /
            (1000 * 60 * 60 * 24),
        )
        if (diff >= 0 && diff <= withinDays) {
          result.push({ title: e.title, dday: diff })
          break
        }
      }
    })

  return result.sort((a, b) => a.dday - b.dday).slice(0, 2)
}

export default function TodaySummaryCard() {
  const events = useMemo(() => getTodayAggregated(), [])
  const upcoming = useMemo(() => getUpcomingAnniversaries(14), [])

  const scheduleCount = events.filter((e) => e.type === 'schedule').length
  const paymentCount = events.filter(
    (e) => e.type === 'fixed_expense' || e.type === 'subscription',
  ).length
  const checklistCount = events.filter((e) => e.type === 'checklist').length
  const totalAmount = events
    .filter((e) => e.type === 'fixed_expense' || e.type === 'subscription')
    .reduce((sum, e) => sum + (e.amount ?? 0), 0)

  return (
    <div className="mx-4 my-3 space-y-2">
      {/* 오늘 요약 카드 */}
      <div className="bg-blue-50 rounded-xl p-4">
        <p className="text-xs text-blue-400 font-medium mb-2">
          {formatDateLabel(todayStr())} 요약
        </p>

        <div className="grid grid-cols-3 gap-2">
          <SummaryItem label="일정" value={scheduleCount} unit="개" />
          <SummaryItem
            label="납부"
            value={paymentCount}
            unit="건"
            sub={paymentCount > 0 ? totalAmount.toLocaleString('ko-KR') + '원' : undefined}
          />
          <SummaryItem label="체크리스트" value={checklistCount} unit="개" />
        </div>

        {events.length === 0 && (
          <p className="text-xs text-blue-300 text-center mt-2">오늘 예정된 항목이 없습니다</p>
        )}
      </div>

      {/* 다가오는 기념일 D-day */}
      {upcoming.length > 0 && (
        <div className="bg-pink-50 rounded-xl px-4 py-3">
          <p className="text-xs text-pink-400 font-medium mb-2">다가오는 기념일</p>
          <div className="space-y-1.5">
            {upcoming.map((a, i) => (
              <div key={i} className="flex justify-between items-center">
                <span className="text-sm text-gray-700">{a.title}</span>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                  a.dday === 0
                    ? 'bg-pink-500 text-white'
                    : 'bg-pink-100 text-pink-600'
                }`}>
                  {a.dday === 0 ? 'D-Day' : `D-${a.dday}`}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function SummaryItem({
  label, value, unit, sub,
}: {
  label: string; value: number; unit: string; sub?: string
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
