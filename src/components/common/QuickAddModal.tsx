// 빠른 추가 메뉴에서 선택한 타입에 맞는 form modal 렌더링

import type { QuickAddType } from './QuickAddMenu'
import { todayStr } from '../../utils/date'
import EventFormModal from '../calendar/EventFormModal'
import LedgerFormModal from '../money/LedgerFormModal'
import FixedExpenseFormModal from '../money/FixedExpenseFormModal'
import SubscriptionFormModal from '../money/SubscriptionFormModal'
import ShoppingFormModal from '../life/ShoppingFormModal'
import ChecklistItemFormModal from '../life/ChecklistItemFormModal'
import RecordFormModal from '../records/RecordFormModal'

interface Props {
  type: QuickAddType
  onSaved: () => void
  onClose: () => void
}

export default function QuickAddModal({ type, onSaved, onClose }: Props) {
  const today = todayStr()

  switch (type) {
    case 'schedule':
      return (
        <EventFormModal eventId={null} defaultDate={today} onSaved={onSaved} onClose={onClose} />
      )
    case 'expense':
      return (
        <LedgerFormModal
          entryId={null} defaultDate={today} defaultType="expense"
          onSaved={onSaved} onClose={onClose}
        />
      )
    case 'income':
      return (
        <LedgerFormModal
          entryId={null} defaultDate={today} defaultType="income"
          onSaved={onSaved} onClose={onClose}
        />
      )
    case 'fixed_expense':
      return <FixedExpenseFormModal expenseId={null} onSaved={onSaved} onClose={onClose} />
    case 'subscription':
      return <SubscriptionFormModal subId={null} onSaved={onSaved} onClose={onClose} />
    case 'shopping':
      return <ShoppingFormModal itemId={null} onSaved={onSaved} onClose={onClose} />
    case 'checklist':
      return <ChecklistItemFormModal itemId={null} onSaved={onSaved} onClose={onClose} />
    case 'record':
      return (
        <RecordFormModal recordId={null} defaultType="life" onSaved={onSaved} onClose={onClose} />
      )
  }
}
