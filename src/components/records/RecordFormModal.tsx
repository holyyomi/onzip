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

interface VaultTemplate {
  label: string
  title: string
  type: RecordType
  tags: string
  content: string
}

const VAULT_TEMPLATES: VaultTemplate[] = [
  {
    label: '계좌 잔액',
    title: '계좌 잔액 메모',
    type: 'spending_note',
    tags: '민감, 계좌, 돈',
    content: `## 은행/계좌
-

## 현재 잔액
-

## 계좌 용도
-

## 자동이체/주의할 점
-

## 마지막 확인일
-`,
  },
  {
    label: '주식/코인',
    title: '투자 현황 메모',
    type: 'spending_note',
    tags: '민감, 투자, 돈',
    content: `## 증권사/거래소
-

## 보유 종목
-

## 평가 금액
-

## 매수 이유
-

## 다시 볼 날짜
-`,
  },
  {
    label: '보험/계약',
    title: '보험/계약 메모',
    type: 'family_meeting',
    tags: '보험, 계약, 중요',
    content: `## 보험사/계약처
-

## 계약 내용
-

## 납입 금액
-

## 만기/갱신일
-

## 문의처/담당자
-`,
  },
  {
    label: '대출/카드',
    title: '대출/카드 메모',
    type: 'spending_note',
    tags: '민감, 대출, 카드',
    content: `## 금융사
-

## 남은 금액/한도
-

## 결제일/상환일
-

## 이자/수수료
-

## 주의할 점
-`,
  },
  {
    label: '갱신/만료',
    title: '갱신/만료 메모',
    type: 'anniversary',
    tags: '갱신, 만료, 중요',
    content: `## 항목
-

## 갱신/만료일
-

## 금액
-

## 미리 할 일
-

## 확인한 내용
-`,
  },
  {
    label: '비상정보',
    title: '비상정보 메모',
    type: 'life',
    tags: '민감, 비상, 중요',
    content: `## 필요한 상황
-

## 연락처/위치
-

## 꼭 기억할 내용
-

## 관련 서류/장소
-`,
  },
]

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

  function hasDraft() {
    return Boolean(title.trim() || content.trim() || tagInput.trim() || relatedAmount.trim())
  }

  function handleTemplateSelect(template: VaultTemplate) {
    if (hasDraft() && !confirm('입력 중인 내용을 이 템플릿으로 바꿀까요?')) return

    setTitle(template.title)
    setContent(template.content)
    setRecordType(template.type)
    setTagInput(template.tags)
    setRelatedAmount('')
    setShowDetails(true)
    setError('')
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

      {!recordId && (
        <div className="mb-4 rounded-[20px] bg-[#f7f7f7] p-3">
          <p className="mb-2 text-xs font-semibold text-[#6a6a6a]">무엇을 보관할까요?</p>
          <div className="flex flex-wrap gap-2">
            {VAULT_TEMPLATES.map((template) => (
              <button
                key={template.label}
                onClick={() => handleTemplateSelect(template)}
                className="min-h-[34px] rounded-full border border-[#dddddd] bg-white px-3 text-xs font-semibold text-[#222222]"
              >
                {template.label}
              </button>
            ))}
          </div>
        </div>
      )}

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
          <Field label={recordType === 'anniversary' ? '갱신/만료일' : '날짜'}>
            <input type="date" value={recordDate} onChange={(e) => setRecordDate(e.target.value)} className={inputCls} />
            {recordType === 'anniversary' && (
              <p className="mt-1 text-xs text-gray-400">
                이 날짜가 가까워지면 홈의 곧 챙길 것에 표시됩니다.
              </p>
            )}
          </Field>

          <Field label="관련 사람">
            <select value={memberId} onChange={(e) => setMemberId(e.target.value)} className={inputCls}>
              {members.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
          </Field>

          <Field label="태그">
            <input type="text" placeholder="예) 중요, 계좌, 보험, 계약" value={tagInput}
              onChange={(e) => setTagInput(e.target.value)} className={inputCls} />
            <p className="mt-1 text-xs text-gray-400">
              민감하게 숨기려면 태그에 민감 또는 비밀을 추가하세요.
            </p>
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
