import { useState, useMemo } from 'react'
import FormModal, { Field, inputCls, FormActions } from '../common/FormModal'
import { memberRepo, householdRepo } from '../../data/repositories'
import { newId, now } from '../../data/repositories/base'
import { exportAllData } from '../../data/repositories'
import {
  getCategories,
  addCategory,
  removeCategory,
  isDefault,
  type CategoryType,
} from '../../utils/categoryStore'
import type { Member, MemberRole } from '../../data/models'

type SettingsSubTab = 'members' | 'categories' | 'backup'

const SUB_TABS: { value: SettingsSubTab; label: string }[] = [
  { value: 'members', label: '가족 구성원' },
  { value: 'categories', label: '카테고리' },
  { value: 'backup', label: '백업' },
]

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsSubTab>('members')
  const [refreshKey, setRefreshKey] = useState(0)
  const onRefresh = () => setRefreshKey((k) => k + 1)

  return (
    <div>
      <div className="flex bg-white border-b border-gray-100 px-2">
        {SUB_TABS.map((t) => (
          <button key={t.value} onClick={() => setActiveTab(t.value)}
            className={`flex-1 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === t.value ? 'text-blue-600 border-blue-600' : 'text-gray-400 border-transparent'
            }`}>
            {t.label}
          </button>
        ))}
      </div>

      {activeTab === 'members' && <MembersTab refreshKey={refreshKey} onRefresh={onRefresh} />}
      {activeTab === 'categories' && <CategoryTab />}
      {activeTab === 'backup' && <BackupTab />}
    </div>
  )
}

// ─────────────────────────────────
// 가족 구성원 (TASK-025)
// ─────────────────────────────────

const MEMBER_COLORS = [
  '#3B82F6', '#EC4899', '#10B981', '#F59E0B',
  '#8B5CF6', '#EF4444', '#06B6D4', '#84CC16',
]

function MembersTab({ refreshKey, onRefresh }: { refreshKey: number; onRefresh: () => void }) {
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  const members = useMemo(
    () => memberRepo.getAll(),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [refreshKey],
  )

  return (
    <div>
      <div className="px-4 py-3 bg-white border-b border-gray-100 flex justify-between items-center">
        <span className="text-sm font-semibold text-gray-700">가족 구성원</span>
        <button onClick={() => { setEditingId(null); setShowModal(true) }}
          className="text-sm text-blue-500 border border-blue-200 rounded-lg px-3 py-1.5">
          + 추가
        </button>
      </div>

      <div className="p-4 space-y-2">
        {members.map((m) => (
          <button key={m.id} onClick={() => { setEditingId(m.id); setShowModal(true) }}
            className={`w-full bg-white rounded-xl px-4 py-3 flex items-center gap-3 text-left ${!m.is_active ? 'opacity-40' : ''}`}>
            <span className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
              style={{ backgroundColor: m.color }}>
              {m.name[0]}
            </span>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-800">{m.name}</p>
              <p className="text-xs text-gray-400">{m.is_active ? '활성' : '비활성'}</p>
            </div>
            <span className="text-xs text-gray-300">수정 ›</span>
          </button>
        ))}
      </div>

      {showModal && (
        <MemberFormModal
          memberId={editingId}
          onSaved={() => { setShowModal(false); onRefresh() }}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  )
}

function MemberFormModal({ memberId, onSaved, onClose }: {
  memberId: string | null; onSaved: () => void; onClose: () => void
}) {
  const existing = memberId ? memberRepo.getById(memberId) : undefined
  const isDefaultMember = ['me', 'spouse', 'shared'].includes(memberId ?? '')

  const [name, setName] = useState(existing?.name ?? '')
  const [color, setColor] = useState(existing?.color ?? MEMBER_COLORS[0])
  const [isActive, setIsActive] = useState(existing?.is_active ?? true)
  const [error, setError] = useState('')

  function handleSave() {
    if (!name.trim()) { setError('이름을 입력해주세요'); return }
    if (memberId && existing) {
      memberRepo.update(memberId, { name: name.trim(), color, is_active: isActive })
    } else {
      const member: Member = {
        id: newId(), household_id: 'default', name: name.trim(),
        role: 'family' as MemberRole, color, is_active: true,
        created_at: now(), updated_at: now(),
      }
      memberRepo.create(member)
    }
    onSaved()
  }

  function handleDelete() {
    if (!memberId || isDefaultMember) return
    if (!confirm('이 구성원을 삭제할까요?')) return
    memberRepo.delete(memberId)
    onSaved()
  }

  return (
    <FormModal title={memberId ? '구성원 수정' : '구성원 추가'} onClose={onClose}>
      <Field label="이름 (필수)">
        <input type="text" placeholder="이름" value={name}
          onChange={(e) => { setName(e.target.value); setError('') }} className={inputCls} />
        {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
        {isDefaultMember && (
          <p className="text-xs text-gray-400 mt-1">기본 구성원은 이름과 색상만 변경 가능합니다.</p>
        )}
      </Field>

      <Field label="색상">
        <div className="flex flex-wrap gap-2 mt-1">
          {MEMBER_COLORS.map((c) => (
            <button key={c} onClick={() => setColor(c)}
              className={`w-9 h-9 rounded-full border-2 transition-all ${color === c ? 'border-gray-800 scale-110' : 'border-transparent'}`}
              style={{ backgroundColor: c }} />
          ))}
        </div>
      </Field>

      {!isDefaultMember && (
        <div className="flex items-center justify-between mb-4 py-2">
          <span className="text-sm text-gray-700">활성 상태</span>
          <button onClick={() => setIsActive((v) => !v)}
            className={`w-10 h-6 rounded-full transition-colors ${isActive ? 'bg-blue-500' : 'bg-gray-200'}`}>
            <span className={`block w-4 h-4 bg-white rounded-full shadow transition-transform mx-1 ${isActive ? 'translate-x-4' : 'translate-x-0'}`} />
          </button>
        </div>
      )}

      <FormActions onSave={handleSave}
        onDelete={memberId && !isDefaultMember ? handleDelete : undefined}
        saveLabel={memberId ? '수정 완료' : '저장'} />
    </FormModal>
  )
}

// ─────────────────────────────────
// 카테고리 관리 (TASK-026)
// ─────────────────────────────────

const CATEGORY_SECTIONS: { type: CategoryType; label: string }[] = [
  { type: 'expense', label: '지출 카테고리' },
  { type: 'income', label: '수입 카테고리' },
  { type: 'fixed_expense', label: '고정지출 카테고리' },
]

function CategoryTab() {
  const [localRefresh, setLocalRefresh] = useState(0)
  const [newInputs, setNewInputs] = useState<Record<CategoryType, string>>({
    expense: '',
    income: '',
    fixed_expense: '',
  })

  function handleAdd(type: CategoryType) {
    const name = newInputs[type].trim()
    if (!name) return
    addCategory(type, name)
    setNewInputs((prev) => ({ ...prev, [type]: '' }))
    setLocalRefresh((k) => k + 1)
  }

  function handleRemove(type: CategoryType, name: string) {
    if (!confirm(`"${name}" 카테고리를 삭제할까요?`)) return
    removeCategory(type, name)
    setLocalRefresh((k) => k + 1)
  }

  return (
    <div className="p-4 space-y-5">
      <p className="text-xs text-gray-400">
        기본 카테고리는 삭제할 수 없습니다. 직접 추가한 카테고리만 삭제 가능합니다.
      </p>

      {CATEGORY_SECTIONS.map(({ type, label }) => (
        <CategorySection
          key={`${type}_${localRefresh}`}
          type={type}
          label={label}
          inputValue={newInputs[type]}
          onInputChange={(v) => setNewInputs((prev) => ({ ...prev, [type]: v }))}
          onAdd={() => handleAdd(type)}
          onRemove={(name) => handleRemove(type, name)}
        />
      ))}
    </div>
  )
}

function CategorySection({
  type, label, inputValue, onInputChange, onAdd, onRemove,
}: {
  type: CategoryType
  label: string
  inputValue: string
  onInputChange: (v: string) => void
  onAdd: () => void
  onRemove: (name: string) => void
}) {
  const categories = getCategories(type)

  return (
    <div className="bg-white rounded-xl p-4">
      <p className="text-sm font-semibold text-gray-700 mb-3">{label}</p>

      <div className="flex flex-wrap gap-2 mb-3">
        {categories.map((cat) => {
          const def = isDefault(type, cat)
          return (
            <div key={cat}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs border ${
                def ? 'bg-gray-50 text-gray-600 border-gray-200' : 'bg-blue-50 text-blue-600 border-blue-200'
              }`}>
              <span>{cat}</span>
              {!def && (
                <button onClick={() => onRemove(cat)}
                  className="text-blue-400 hover:text-blue-600 ml-0.5 font-bold text-sm leading-none">
                  ×
                </button>
              )}
            </div>
          )
        })}
      </div>

      {/* 새 카테고리 추가 */}
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="새 카테고리 이름"
          value={inputValue}
          onChange={(e) => onInputChange(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && onAdd()}
          className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400"
        />
        <button onClick={onAdd}
          className="px-3 py-2 bg-blue-500 text-white text-sm rounded-lg font-medium">
          추가
        </button>
      </div>
    </div>
  )
}

// ─────────────────────────────────
// 백업 (TASK-028)
// ─────────────────────────────────

function BackupTab() {
  const [imported, setImported] = useState(false)

  function handleExportJSON() {
    const data = exportAllData()
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `onzip_backup_${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  function handleImportJSON(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        const json = JSON.parse(ev.target?.result as string)
        const keys = [
          'households', 'members', 'calendar_events', 'ledger_entries',
          'fixed_expenses', 'incomes', 'subscriptions', 'checklists',
          'checklist_items', 'shopping_items', 'household_supplies',
          'chores', 'records', 'templates', 'app_settings',
        ]
        keys.forEach((k) => {
          if (json[k]) localStorage.setItem(`onzip_${k}`, JSON.stringify(json[k]))
        })
        setImported(true)
        alert('가져오기 완료! 앱을 새로고침하세요.')
      } catch {
        alert('파일 형식이 올바르지 않습니다')
      }
    }
    reader.readAsText(file)
  }

  // 현재 앱 데이터 용량 계산
  const usedKB = useMemo(() => {
    let total = 0
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i) ?? ''
      if (key.startsWith('onzip_')) {
        total += (localStorage.getItem(key) ?? '').length
      }
    }
    return Math.round(total / 1024)
  }, [])

  const household = householdRepo.getDefault()

  return (
    <div className="p-4 space-y-3">
      {/* 사용량 */}
      <div className="bg-blue-50 rounded-xl p-4">
        <p className="text-xs text-blue-400 font-medium">현재 데이터 사용량</p>
        <p className="text-lg font-bold text-blue-700 mt-1">{usedKB} KB / 5,120 KB</p>
        <div className="h-1.5 bg-blue-100 rounded-full mt-2 overflow-hidden">
          <div className="h-full bg-blue-400 rounded-full" style={{ width: `${Math.min(usedKB / 51.2, 100)}%` }} />
        </div>
        <p className="text-xs text-blue-300 mt-1">집 이름: {household.name}</p>
      </div>

      <button onClick={handleExportJSON}
        className="w-full bg-white rounded-xl px-4 py-4 flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-800">JSON으로 내보내기</p>
          <p className="text-xs text-gray-400 mt-0.5">전체 데이터를 파일로 저장합니다</p>
        </div>
        <span className="text-blue-500 text-lg">↓</span>
      </button>

      <label className="block w-full bg-white rounded-xl px-4 py-4 cursor-pointer">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-800">JSON 가져오기</p>
            <p className="text-xs text-gray-400 mt-0.5">백업 파일에서 데이터를 복원합니다</p>
          </div>
          <span className="text-blue-500 text-lg">↑</span>
        </div>
        <input type="file" accept=".json" onChange={handleImportJSON} className="hidden" />
      </label>

      {imported && (
        <p className="text-xs text-green-500 text-center">가져오기 완료! 새로고침(F5)으로 적용하세요.</p>
      )}

      <div className="bg-yellow-50 rounded-xl p-3">
        <p className="text-xs text-yellow-600">
          주의: 가져오기는 기존 데이터를 덮어씁니다. 먼저 내보내기로 현재 데이터를 백업하세요.
        </p>
      </div>
    </div>
  )
}
