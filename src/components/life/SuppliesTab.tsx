import { useState, useMemo } from 'react'
import FormModal, { Field, inputCls, FormActions } from '../common/FormModal'
import { householdSupplyRepo, shoppingItemRepo } from '../../data/repositories'
import { newId, now } from '../../data/repositories/base'
import type { HouseholdSupply, SupplyStatus } from '../../data/models'

interface Props {
  refreshKey: number
  onRefresh: () => void
}

const STATUS_CONFIG: Record<SupplyStatus, { label: string; cls: string }> = {
  enough: { label: '충분함', cls: 'bg-green-100 text-green-600' },
  low: { label: '부족함', cls: 'bg-yellow-100 text-yellow-600' },
  need_buy: { label: '구매필요', cls: 'bg-red-100 text-red-500' },
}
const STATUS_CYCLE: Record<SupplyStatus, SupplyStatus> = {
  enough: 'low',
  low: 'need_buy',
  need_buy: 'enough',
}

export default function SuppliesTab({ refreshKey, onRefresh }: Props) {
  const [filter, setFilter] = useState<'all' | 'need_buy'>('all')
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [localRefresh, setLocalRefresh] = useState(0)

  const supplies = useMemo(
    () => householdSupplyRepo.getAll(),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [refreshKey, localRefresh],
  )

  const displayed = filter === 'need_buy' ? supplies.filter((s) => s.status === 'need_buy') : supplies

  function cycleStatus(id: string, current: SupplyStatus) {
    householdSupplyRepo.update(id, { status: STATUS_CYCLE[current] })
    setLocalRefresh((k) => k + 1)
  }

  function sendToShopping(supply: HouseholdSupply) {
    const already = shoppingItemRepo
      .getAll()
      .some((i) => i.name === supply.name && !i.is_done)
    if (already) { alert('이미 장보기 목록에 있습니다'); return }
    shoppingItemRepo.create({
      id: newId(), household_id: 'default', name: supply.name,
      category: '생활용품', expected_amount: null, actual_amount: null,
      store: '', is_done: false, is_favorite: false, memo: '',
      created_at: now(), updated_at: now(),
    })
    alert(`"${supply.name}"을(를) 장보기에 추가했습니다`)
    onRefresh()
  }

  return (
    <div>
      <div className="px-4 py-3 bg-white border-b border-gray-100 flex justify-between items-center">
        <div className="flex gap-2">
          {(['all', 'need_buy'] as const).map((f) => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-1 rounded-full text-xs font-medium ${filter === f ? 'bg-gray-800 text-white' : 'text-gray-400 border border-gray-200'}`}>
              {f === 'all' ? '전체' : '구매필요'}
            </button>
          ))}
        </div>
        <button onClick={() => { setEditingId(null); setShowModal(true) }}
          className="text-sm text-blue-500 border border-blue-200 rounded-lg px-3 py-1.5">
          + 추가
        </button>
      </div>

      <div className="p-4 grid grid-cols-2 gap-3">
        {displayed.length === 0 && (
          <div className="col-span-2 text-center py-10 text-sm text-gray-300">
            생활용품이 없습니다
          </div>
        )}

        {displayed.map((s) => {
          const cfg = STATUS_CONFIG[s.status]
          return (
            <div key={s.id} className="bg-white rounded-xl p-3">
              <p className="text-sm font-medium text-gray-800 truncate mb-2">{s.name}</p>

              {/* 상태 탭 → 클릭으로 순환 */}
              <button onClick={() => cycleStatus(s.id, s.status)}
                className={`text-xs px-2 py-1 rounded-full font-medium ${cfg.cls}`}>
                {cfg.label}
              </button>

              <div className="flex gap-1 mt-2">
                <button onClick={() => { setEditingId(s.id); setShowModal(true) }}
                  className="flex-1 text-xs text-gray-400 border border-gray-200 rounded py-1">
                  수정
                </button>
                {s.status === 'need_buy' && (
                  <button onClick={() => sendToShopping(s)}
                    className="flex-1 text-xs text-blue-500 border border-blue-200 rounded py-1">
                    장보기↗
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {showModal && (
        <SupplyFormModal
          supplyId={editingId}
          onSaved={() => { setShowModal(false); setLocalRefresh((k) => k + 1) }}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  )
}

// ─── 인라인 폼 모달 ───

function SupplyFormModal({
  supplyId,
  onSaved,
  onClose,
}: {
  supplyId: string | null
  onSaved: () => void
  onClose: () => void
}) {
  const existing = supplyId ? householdSupplyRepo.getById(supplyId) : undefined

  const [name, setName] = useState(existing?.name ?? '')
  const [category, setCategory] = useState(existing?.category ?? '생활용품')
  const [status, setStatus] = useState<SupplyStatus>(existing?.status ?? 'enough')
  const [cycle, setCycle] = useState(existing?.repurchase_cycle_days?.toString() ?? '')
  const [purchaseMemo, setPurchaseMemo] = useState(existing?.purchase_link_memo ?? '')
  const [error, setError] = useState('')

  function handleSave() {
    if (!name.trim()) { setError('품목명을 입력해주세요'); return }
    if (supplyId && existing) {
      householdSupplyRepo.update(supplyId, {
        name: name.trim(), category, status,
        repurchase_cycle_days: cycle ? Number(cycle) : null,
        purchase_link_memo: purchaseMemo,
      })
    } else {
      const item: HouseholdSupply = {
        id: newId(), household_id: 'default', name: name.trim(), category,
        status, repurchase_cycle_days: cycle ? Number(cycle) : null,
        purchase_link_memo: purchaseMemo, member_id: null,
        created_at: now(), updated_at: now(),
      }
      householdSupplyRepo.create(item)
    }
    onSaved()
  }

  function handleDelete() {
    if (!supplyId) return
    if (!confirm('삭제할까요?')) return
    householdSupplyRepo.delete(supplyId)
    onSaved()
  }

  return (
    <FormModal title={supplyId ? '생활용품 수정' : '생활용품 추가'} onClose={onClose}>
      <Field label="품목명 (필수)">
        <input type="text" placeholder="예) 휴지" value={name}
          onChange={(e) => { setName(e.target.value); setError('') }} className={inputCls} />
        {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
      </Field>

      <Field label="카테고리">
        <input type="text" value={category} onChange={(e) => setCategory(e.target.value)} className={inputCls} />
      </Field>

      <Field label="현재 상태">
        <div className="flex gap-2">
          {(Object.entries(STATUS_CONFIG) as [SupplyStatus, { label: string; cls: string }][]).map(
            ([value, cfg]) => (
              <button key={value} onClick={() => setStatus(value)}
                className={`flex-1 py-2 rounded-lg text-xs font-medium border ${status === value ? 'bg-blue-500 text-white border-blue-500' : 'text-gray-500 border-gray-200'}`}>
                {cfg.label}
              </button>
            ),
          )}
        </div>
      </Field>

      <Field label="재구매 주기 (일, 선택)">
        <input type="number" placeholder="예) 30" value={cycle}
          onChange={(e) => setCycle(e.target.value)} className={inputCls} inputMode="numeric" />
      </Field>

      <Field label="구매 링크 / 메모 (선택)">
        <input type="text" placeholder="구매처 또는 링크" value={purchaseMemo}
          onChange={(e) => setPurchaseMemo(e.target.value)} className={inputCls} />
      </Field>

      <FormActions onSave={handleSave} onDelete={supplyId ? handleDelete : undefined}
        saveLabel={supplyId ? '수정 완료' : '저장'} />
    </FormModal>
  )
}
