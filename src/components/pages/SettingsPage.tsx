import { useState, useMemo } from 'react'
import FormModal, { Field, inputCls, FormActions } from '../common/FormModal'
import { memberRepo, householdRepo } from '../../data/repositories'
import { newId, now } from '../../data/repositories/base'
import {
  getCategories,
  addCategory,
  removeCategory,
  isDefault,
  type CategoryType,
} from '../../utils/categoryStore'
import { ledgerEntryRepo, fixedExpenseRepo, subscriptionRepo } from '../../data/repositories'
import type { Member, MemberRole } from '../../data/models'
import { APP_NAME, APP_TAGLINE } from '../../utils/brand'
import TabMemoCard from '../common/TabMemoCard'
import StorageNoticeCard from '../common/StorageNoticeCard'
import ShareAndSupportCard from '../common/ShareAndSupportCard'
import UpdateNoticeCard from '../common/UpdateNoticeCard'
import PwaUpdateCard from '../common/PwaUpdateCard'
import InstallPromptCard from '../common/InstallPromptCard'
import { useAmountPrivacy } from '../../utils/amountPrivacy'
import { useVaultPrivacy } from '../../utils/vaultPrivacy'

type SettingsSubTab = 'home' | 'members' | 'categories'

const SUB_TABS: { value: SettingsSubTab; label: string }[] = [
  { value: 'home', label: '집 정보' },
  { value: 'members', label: '구성원' },
  { value: 'categories', label: '카테고리' },
]

interface SettingsPageProps {
  onAppRefresh: () => void
}

export default function SettingsPage({ onAppRefresh }: SettingsPageProps) {
  const [activeTab, setActiveTab] = useState<SettingsSubTab>('home')
  const [refreshKey, setRefreshKey] = useState(0)
  const onRefresh = () => setRefreshKey((k) => k + 1)

  return (
    <div>
      <div className="oz-tab-strip bg-[#f7f7f7]">
        {SUB_TABS.map((t) => (
          <button key={t.value} onClick={() => setActiveTab(t.value)}
            className={`oz-sub-tab ${
              activeTab === t.value ? 'bg-[#222222] text-white border-[#222222]' : 'bg-white text-[#6a6a6a] border-[#dddddd]'
            }`}>
            {t.label}
          </button>
        ))}
      </div>

      {activeTab === 'home' && <HomeInfoTab onRefresh={onRefresh} onAppRefresh={onAppRefresh} />}
      {activeTab === 'members' && <MembersTab refreshKey={refreshKey} onRefresh={onRefresh} />}
      {activeTab === 'categories' && <CategoryTab />}

      <div className="px-5 py-5">
        <TabMemoCard tab="settings" title="설정 메모" placeholder="변경할 설정이나 확인할 내용을 기록하세요." />
      </div>
    </div>
  )
}

// ─────────────────────────────────
// 집 정보 (이름 변경)
// ─────────────────────────────────

function HomeInfoTab({ onRefresh, onAppRefresh }: { onRefresh: () => void; onAppRefresh: () => void }) {
  const household = householdRepo.getDefault()
  const [name, setName] = useState(household.name)
  const [saved, setSaved] = useState(false)
  const { hidden: hideAmounts, setHidden: setHideAmounts } = useAmountPrivacy()
  const { hidden: hideSensitive, setHidden: setHideSensitive } = useVaultPrivacy()

  function handleSave() {
    householdRepo.update(household.id, { name: name.trim() || '우리집' })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
    onRefresh()
    onAppRefresh()
  }

  const totalEntries = ledgerEntryRepo.getAll().length
  const members = memberRepo.getAll().filter((m) => m.is_active).length

  function handleSensitiveToggle() {
    setHideSensitive(!hideSensitive)
  }

  return (
    <div className="p-4 space-y-4">
      <div className="oz-card p-4">
        <div className="flex items-center gap-3">
          <img src="/icons/icon-192.png" alt="" className="h-12 w-12 rounded-[18px]" />
          <div>
            <p className="text-xl font-semibold leading-none text-[#222222]">{APP_NAME}</p>
            <p className="mt-1 text-sm text-[#6a6a6a]">{APP_TAGLINE}</p>
          </div>
        </div>
      </div>

      <StorageNoticeCard />

      <InstallPromptCard />

      <div className="oz-card p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-base font-semibold text-[#222222]">금액 가리기</p>
            <p className="mt-1 text-sm leading-relaxed text-[#6a6a6a]">
              홈, 가계부, 일정, 메모장에서 금액을 ***원으로 표시합니다.
            </p>
          </div>
          <button
            onClick={() => setHideAmounts(!hideAmounts)}
            className={`h-8 w-14 flex-shrink-0 rounded-full p-1 transition-colors ${hideAmounts ? 'bg-[#ff385c]' : 'bg-gray-200'}`}
            aria-label="금액 가리기"
          >
            <span className={`block h-6 w-6 rounded-full bg-white shadow transition-transform ${hideAmounts ? 'translate-x-6' : 'translate-x-0'}`} />
          </button>
        </div>
      </div>

      <div className="oz-card p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-base font-semibold text-[#222222]">비밀 내용 숨김</p>
            <p className="mt-1 text-sm leading-relaxed text-[#6a6a6a]">
              각 입력칸의 비밀을 선택한 내용만 가립니다. 제목은 그대로 보입니다.
            </p>
          </div>
          <button
            onClick={handleSensitiveToggle}
            className={`h-8 w-14 flex-shrink-0 rounded-full p-1 transition-colors ${hideSensitive ? 'bg-[#ff385c]' : 'bg-gray-200'}`}
            aria-label="비밀 내용 숨김"
          >
            <span className={`block h-6 w-6 rounded-full bg-white shadow transition-transform ${hideSensitive ? 'translate-x-6' : 'translate-x-0'}`} />
          </button>
        </div>
      </div>

      <PwaUpdateCard />

      <UpdateNoticeCard />

      <ShareAndSupportCard />

      {/* 집 이름 편집 */}
      <div className="oz-card p-4">
        <p className="text-xs text-gray-400 font-medium mb-3">집 이름</p>
        <div className="flex gap-2">
          <input
            type="text"
            value={name}
            onChange={(e) => { setName(e.target.value); setSaved(false) }}
            onKeyDown={(e) => e.key === 'Enter' && handleSave()}
            className={inputCls}
            placeholder="우리집"
            maxLength={20}
          />
          <button onClick={handleSave}
            className={`px-4 py-2.5 rounded-full text-sm font-semibold transition-colors ${
              saved ? 'bg-[#0a7f52] text-white' : 'bg-[#ff385c] text-white'
            }`}>
            {saved ? '저장됨' : '저장'}
          </button>
        </div>
        <p className="text-xs text-gray-300 mt-1">헤더에 표시되는 이름입니다</p>
      </div>

      {/* 앱 현황 */}
      <div className="oz-card p-4">
        <p className="text-xs text-gray-400 font-medium mb-3">앱 현황</p>
        <div className="grid grid-cols-2 gap-3">
          <StatCard label="가계부 기록" value={`${totalEntries}건`} />
          <StatCard label="활성 구성원" value={`${members}명`} />
          <StatCard label="정기 지출" value={`${fixedExpenseRepo.getActive().length}개`} />
          <StatCard label="구독 서비스" value={`${subscriptionRepo.getActive().length}개`} />
        </div>
      </div>

      {/* 앱 버전 */}
      <div className="oz-card px-4 py-3 flex justify-between items-center">
        <span className="text-sm text-gray-600">앱 버전</span>
        <span className="text-sm text-gray-400">v1.0.0</span>
      </div>
    </div>
  )
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-[#f7f7f7] rounded-[18px] p-3 text-center">
      <p className="text-xs text-[#6a6a6a]">{label}</p>
      <p className="text-lg font-semibold text-[#222222] mt-0.5">{value}</p>
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
          className="text-sm text-[#ff385c] border border-[#ffd1da] rounded-full px-3 py-1.5 font-semibold">
          + 추가
        </button>
      </div>

      <div className="p-4 space-y-2">
        {members.map((m) => (
          <button key={m.id} onClick={() => { setEditingId(m.id); setShowModal(true) }}
            className={`w-full oz-card px-4 py-3 flex items-center gap-3 text-left ${!m.is_active ? 'opacity-40' : ''}`}>
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
            className={`w-10 h-6 rounded-full transition-colors ${isActive ? 'bg-[#ff385c]' : 'bg-gray-200'}`}>
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
  { type: 'fixed_expense', label: '정기 지출 카테고리' },
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
    <div className="oz-card p-4">
      <p className="text-sm font-semibold text-gray-700 mb-3">{label}</p>

      <div className="flex flex-wrap gap-2 mb-3">
        {categories.map((cat) => {
          const def = isDefault(type, cat)
          return (
            <div key={cat}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs border ${
                def ? 'bg-gray-50 text-gray-600 border-gray-200' : 'bg-[#fff0f3] text-[#ff385c] border-[#ffd1da]'
              }`}>
              <span>{cat}</span>
              {!def && (
                <button onClick={() => onRemove(cat)}
                  className="text-[#ff385c] ml-0.5 font-bold text-sm leading-none">
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
          className="flex-1 border border-gray-200 rounded-full px-4 py-2 text-sm focus:outline-none focus:border-[#222222]"
        />
        <button onClick={onAdd}
          className="px-4 py-2 bg-[#ff385c] text-white text-sm rounded-full font-semibold">
          추가
        </button>
      </div>
    </div>
  )
}
