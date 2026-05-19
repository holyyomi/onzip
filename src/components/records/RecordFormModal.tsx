import { useState } from 'react'
import FormModal, { Field, inputCls, FormActions } from '../common/FormModal'
import { lifeRecordRepo, memberRepo } from '../../data/repositories'
import { newId, now } from '../../data/repositories/base'
import { todayStr } from '../../utils/date'
import type { LifeRecord, RecordType } from '../../data/models'
import { trackEvent } from '../../utils/analytics'

interface Props {
  recordId: string | null
  defaultType: RecordType
  onSaved: () => void
  onClose: () => void
}

const RECORD_TYPES: { value: RecordType; label: string }[] = [
  { value: 'life', label: '중요 메모' },
  { value: 'spending_note', label: '돈 메모' },
  { value: 'family_meeting', label: '계약/정리' },
  { value: 'anniversary', label: '갱신/만료' },
  { value: 'home', label: '집/차량' },
]

const FAMILY_MEETING_TEMPLATE = `## 정리할 내용
-

## 꼭 기억할 것
-

## 다음 확인일
-`

export default function RecordFormModal({ recordId, defaultType, onSaved, onClose }: Props) {
  const existing = recordId ? lifeRecordRepo.getById(recordId) : undefined
  const members = memberRepo.getAll().filter((m) => m.is_active)
  const startsAsFamilyMeeting = !existing && defaultType === 'family_meeting'

  const [title, setTitle] = useState(existing?.title ?? (startsAsFamilyMeeting ? '계약/정리 메모' : ''))
  const [content, setContent] = useState(existing?.content ?? (startsAsFamilyMeeting ? FAMILY_MEETING_TEMPLATE : ''))
  const [recordType, setRecordType] = useState<RecordType>(existing?.record_type ?? defaultType)
  const [recordDate, setRecordDate] = useState(existing?.record_date ?? todayStr())
  const [memberId, setMemberId] = useState(existing?.member_id ?? 'shared')
  const [tagInput, setTagInput] = useState((existing?.tags ?? []).join(', '))
  const [relatedAmount, setRelatedAmount] = useState(
    existing?.related_amount?.toString() ?? '',
  )
  const [error, setError] = useState('')
  const [showDetails, setShowDetails] = useState(Boolean(recordId))

  function handleTypeChange(type: RecordType) {
    setRecordType(type)
    if (type === 'family_meeting' && !content) {
      setContent(FAMILY_MEETING_TEMPLATE)
    }
  }

  function parseTags(input: string): string[] {
    return input.split(',').map((t) => t.trim()).filter(Boolean)
  }

  function getSaveTitle() {
    const trimmedTitle = title.trim()
    if (trimmedTitle) return trimmedTitle

    const firstContentLine = content
      .split('\n')
      .map((line) => line.replace(/^[-#\s]+/, '').trim())
      .find(Boolean)

    if (firstContentLine) return firstContentLine.slice(0, 24)
    if (recordType === 'family_meeting') return '계약/정리 메모'
    return ''
  }

  function handleSave() {
    const saveTitle = getSaveTitle()
    if (!saveTitle) { setError('제목이나 내용을 입력해주세요'); return }

    if (recordId && existing) {
      lifeRecordRepo.update(recordId, {
        title: saveTitle, content, record_type: recordType,
        record_date: recordDate, member_id: memberId || null,
        tags: parseTags(tagInput),
        related_amount: relatedAmount ? Number(relatedAmount) : null,
      })
    } else {
      const record: LifeRecord = {
        id: newId(), household_id: 'default', title: saveTitle,
        content, record_type: recordType, record_date: recordDate,
        member_id: memberId || null, tags: parseTags(tagInput),
        related_amount: relatedAmount ? Number(relatedAmount) : null,
        related_event_id: null, created_at: now(), updated_at: now(),
      }
      lifeRecordRepo.create(record)
    }
    trackEvent('record_saved', { type: recordType, mode: recordId ? 'edit' : 'create' })
    onSaved()
  }

  function handleDelete() {
    if (!recordId) return
    if (!confirm('이 기록을 삭제할까요?')) return
    lifeRecordRepo.delete(recordId)
    onSaved()
  }

  return (
    <FormModal title={recordId ? '금고 수정' : '금고 메모'} onClose={onClose}>
      {/* 유형 선택 */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        {RECORD_TYPES.map((t) => (
          <button key={t.value} onClick={() => handleTypeChange(t.value)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
              recordType === t.value
                ? 'bg-[#ff385c] text-white border-[#ff385c]'
                : 'text-gray-500 border-gray-200'
            }`}>
            {t.label}
          </button>
        ))}
      </div>

      <Field label="제목">
        <input type="text" placeholder="비워두면 내용 첫 줄을 제목으로 사용합니다" value={title}
          onChange={(e) => { setTitle(e.target.value); setError('') }}
          onKeyDown={(e) => e.key === 'Enter' && (title.trim() || content.trim()) && handleSave()}
          className={inputCls}
          autoFocus />
        {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
      </Field>

      <Field label="내용">
        <textarea value={content} onChange={(e) => setContent(e.target.value)}
          placeholder="계좌 용도, 계약 내용, 보험, 갱신일처럼 꼭 필요한 내용을 기록하세요"
          rows={5}
          className={`${inputCls} resize-none`} />
      </Field>

      <button
        onClick={() => setShowDetails((value) => !value)}
        className="mb-3 min-h-[40px] text-sm font-semibold text-[#ff385c]"
      >
        {showDetails ? '자세히 닫기' : '날짜/태그/금액 자세히'}
      </button>

      {showDetails && (
        <div className="rounded-[20px] bg-[#f7f7f7] p-4 mb-4">
          <Field label="날짜">
            <input type="date" value={recordDate} onChange={(e) => setRecordDate(e.target.value)} className={inputCls} />
          </Field>

          <Field label="관련 사람">
            <select value={memberId} onChange={(e) => setMemberId(e.target.value)} className={inputCls}>
              {members.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
          </Field>

          <Field label="태그">
            <input type="text" placeholder="예) 중요, 계좌, 보험, 계약" value={tagInput}
              onChange={(e) => setTagInput(e.target.value)} className={inputCls} />
          </Field>

          <Field label="관련 금액">
            <input type="number" placeholder="0" value={relatedAmount}
              onChange={(e) => setRelatedAmount(e.target.value)} className={inputCls} inputMode="numeric" />
          </Field>
        </div>
      )}

      <FormActions onSave={handleSave} onDelete={recordId ? handleDelete : undefined}
        saveLabel={recordId ? '수정 완료' : '저장'} />
    </FormModal>
  )
}
