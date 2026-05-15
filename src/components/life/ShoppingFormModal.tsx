import { useState } from 'react'
import FormModal, { Field, inputCls, FormActions } from '../common/FormModal'
import { shoppingItemRepo } from '../../data/repositories'
import { newId, now } from '../../data/repositories/base'
import type { ShoppingItem } from '../../data/models'

interface Props {
  itemId: string | null
  onSaved: () => void
  onClose: () => void
}

const SHOPPING_CATEGORIES = ['식재료', '냉동식품', '간식', '생활용품', '마트', '쿠팡', '기타']

export default function ShoppingFormModal({ itemId, onSaved, onClose }: Props) {
  const existing = itemId ? shoppingItemRepo.getById(itemId) : undefined

  const [name, setName] = useState(existing?.name ?? '')
  const [category, setCategory] = useState(existing?.category ?? '식재료')
  const [expectedAmount, setExpectedAmount] = useState(
    existing?.expected_amount?.toString() ?? '',
  )
  const [store, setStore] = useState(existing?.store ?? '')
  const [isFavorite, setIsFavorite] = useState(existing?.is_favorite ?? false)
  const [memo, setMemo] = useState(existing?.memo ?? '')
  const [error, setError] = useState('')
  const [showDetails, setShowDetails] = useState(Boolean(itemId))

  function handleSave() {
    if (!name.trim()) { setError('품목명을 입력해주세요'); return }

    if (itemId && existing) {
      shoppingItemRepo.update(itemId, {
        name: name.trim(), category,
        expected_amount: expectedAmount ? Number(expectedAmount) : null,
        store, is_favorite: isFavorite, memo,
      })
    } else {
      const item: ShoppingItem = {
        id: newId(), household_id: 'default', name: name.trim(), category,
        expected_amount: expectedAmount ? Number(expectedAmount) : null,
        actual_amount: null, store, is_done: false, is_favorite: isFavorite,
        memo, created_at: now(), updated_at: now(),
      }
      shoppingItemRepo.create(item)
    }
    onSaved()
  }

  function handleDelete() {
    if (!itemId) return
    if (!confirm('이 항목을 삭제할까요?')) return
    shoppingItemRepo.delete(itemId)
    onSaved()
  }

  return (
    <FormModal title={itemId ? '살 것 수정' : '살 것 추가'} onClose={onClose}>
      <Field label="무엇을 살까요?">
        <input type="text" placeholder="예) 계란, 우유, 휴지" value={name}
          onChange={(e) => { setName(e.target.value); setError('') }} className={inputCls} autoFocus />
        {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
      </Field>

      <Field label="예상 금액">
        <input type="number" placeholder="0" value={expectedAmount}
          onChange={(e) => setExpectedAmount(e.target.value)} className={inputCls} inputMode="numeric" />
      </Field>

      <div className="flex items-center justify-between mb-4 py-2">
        <span className="text-sm font-semibold text-[#222222]">자주 사는 품목</span>
        <button onClick={() => setIsFavorite((v) => !v)}
          className={`w-11 h-7 rounded-full transition-colors ${isFavorite ? 'bg-[#ff385c]' : 'bg-gray-200'}`}>
          <span className={`block w-4 h-4 bg-white rounded-full shadow transition-transform mx-1 ${isFavorite ? 'translate-x-4' : 'translate-x-0'}`} />
        </button>
      </div>

      <button
        onClick={() => setShowDetails((value) => !value)}
        className="mb-3 text-sm font-semibold text-[#ff385c]"
      >
        {showDetails ? '자세히 닫기' : '분류/구매처 자세히'}
      </button>

      {showDetails && (
        <div className="rounded-[20px] bg-[#f7f7f7] p-4 mb-4">
          <Field label="분류">
            <select value={category} onChange={(e) => setCategory(e.target.value)} className={inputCls}>
              {SHOPPING_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </Field>

          <Field label="구매처">
            <input type="text" placeholder="예) 이마트" value={store}
              onChange={(e) => setStore(e.target.value)} className={inputCls} />
          </Field>

          <Field label="메모">
            <input type="text" placeholder="예) 세일하면 2개" value={memo} onChange={(e) => setMemo(e.target.value)} className={inputCls} />
          </Field>
        </div>
      )}

      <FormActions onSave={handleSave} onDelete={itemId ? handleDelete : undefined}
        saveLabel={itemId ? '수정 완료' : '저장'} />
    </FormModal>
  )
}
