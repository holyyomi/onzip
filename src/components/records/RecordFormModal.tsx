import { useState } from 'react'
import FormModal, { Field, inputCls, FormActions } from '../common/FormModal'
import { lifeRecordRepo, memberRepo } from '../../data/repositories'
import { newId, now } from '../../data/repositories/base'
import { todayStr } from '../../utils/date'
import type { LifeRecord, RecordType } from '../../data/models'

interface Props {
  recordId: string | null
  defaultType: RecordType
  onSaved: () => void
  onClose: () => void
}

const RECORD_TYPES: { value: RecordType; label: string }[] = [
  { value: 'life', label: '생활 기록' },
  { value: 'spending_note', label: '소비 메모' },
  { value: 'family_meeting', label: '가족 회의록' },
  { value: 'anniversary', label: '기념일 기록' },
  { value: 'home', label: '집 관련' },
]

const FAMILY_MEETING_TEMPLATE = `## 오늘 회의 주제
-

## 결정한 것
-

## 다음에 할 것
-`

export default function RecordFormModal({ recordId, defaultType, onSaved, onClose }: Props) {
  const existing = recordId ? lifeRecordRepo.getById(recordId) : undefined
  const members = memberRepo.getAll().filter((m) => m.is_active)

  const [title, setTitle] = useState(existing?.title ?? '')
  const [content, setContent] = useState(existing?.content ?? '')
  const [recordType, setRecordType] = useState<RecordType>(existing?.record_type ?? defaultType)
  const [recordDate, setRecordDate] = useState(existing?.record_date ?? todayStr())
  const [memberId, setMemberId] = useState(existing?.member_id ?? 'shared')
  const [tagInput, setTagInput] = useState((existing?.tags ?? []).join(', '))
  const [relatedAmount, setRelatedAmount] = useState(
    existing?.related_amount?.toString() ?? '',
  )
  const [error, setError] = useState('')

  function handleTypeChange(type: RecordType) {
    setRecordType(type)
    if (type === 'family_meeting' && !content) {
      setContent(FAMILY_MEETING_TEMPLATE)
    }
  }

  function parseTags(input: string): string[] {
    return input.split(',').map((t) => t.trim()).filter(Boolean)
  }

  function handleSave() {
    if (!title.trim()) { setError('제목을 입력해주세요'); return }

    if (recordId && existing) {
      lifeRecordRepo.update(recordId, {
        title: title.trim(), content, record_type: recordType,
        record_date: recordDate, member_id: memberId || null,
        tags: parseTags(tagInput),
        related_amount: relatedAmount ? Number(relatedAmount) : null,
      })
    } else {
      const record: LifeRecord = {
        id: newId(), household_id: 'default', title: title.trim(),
        content, record_type: recordType, record_date: recordDate,
        member_id: memberId || null, tags: parseTags(tagInput),
        related_amount: relatedAmount ? Number(relatedAmount) : null,
        related_event_id: null, created_at: now(), updated_at: now(),
      }
      lifeRecordRepo.create(record)
    }
    onSaved()
  }

  function handleDelete() {
    if (!recordId) return
    if (!confirm('이 기록을 삭제할까요?')) return
    lifeRecordRepo.delete(recordId)
    onSaved()
  }

  return (
    <FormModal title={recordId ? '기록 수정' : '기록 작성'} onClose={onClose}>
      {/* 유형 선택 */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        {RECORD_TYPES.map((t) => (
          <button key={t.value} onClick={() => handleTypeChange(t.value)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
              recordType === t.value
                ? 'bg-blue-500 text-white border-blue-500'
                : 'text-gray-500 border-gray-200'
            }`}>
            {t.label}
          </button>
        ))}
      </div>

      <Field label="제목 (필수)">
        <input type="text" placeholder="제목을 입력하세요" value={title}
          onChange={(e) => { setTitle(e.target.value); setError('') }} className={inputCls} />
        {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
      </Field>

      <Field label="내용">
        <textarea value={content} onChange={(e) => setContent(e.target.value)}
          placeholder="내용을 입력하세요"
          rows={6}
          className={`${inputCls} resize-none`} />
      </Field>

      <Field label="날짜">
        <input type="date" value={recordDate} onChange={(e) => setRecordDate(e.target.value)} className={inputCls} />
      </Field>

      <Field label="작성자">
        <select value={memberId} onChange={(e) => setMemberId(e.target.value)} className={inputCls}>
          {members.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
        </select>
      </Field>

      <Field label="태그 (쉼표로 구분)">
        <input type="text" placeholder="예) 여행, 쇼핑, 결정" value={tagInput}
          onChange={(e) => setTagInput(e.target.value)} className={inputCls} />
      </Field>

      <Field label="관련 금액 (선택)">
        <input type="number" placeholder="0" value={relatedAmount}
          onChange={(e) => setRelatedAmount(e.target.value)} className={inputCls} inputMode="numeric" />
      </Field>

      <FormActions onSave={handleSave} onDelete={recordId ? handleDelete : undefined}
        saveLabel={recordId ? '수정 완료' : '저장'} />
    </FormModal>
  )
}
