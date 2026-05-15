import { useState, useMemo } from 'react'
import FormModal, { Field, inputCls, FormActions } from '../common/FormModal'
import {
  memberRepo,
  appSettingsRepo,
  householdRepo,
} from '../../data/repositories'
import { newId, now } from '../../data/repositories/base'
import { exportAllData } from '../../data/repositories'
import type { Member, MemberRole } from '../../data/models'

type SettingsSubTab = 'members' | 'theme' | 'backup'

const SUB_TABS: { value: SettingsSubTab; label: string }[] = [
  { value: 'members', label: '가족 구성원' },
  { value: 'theme', label: '테마' },
  { value: 'backup', label: '백업' },
]

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsSubTab>('members')
  const [refreshKey, setRefreshKey] = useState(0)
  const onRefresh = () => setRefreshKey((k) => k + 1)

  return (
    <div>
      <div className="flex overflow-x-auto bg-white border-b border-gray-100 px-2">
        {SUB_TABS.map((t) => (
          <button key={t.value} onClick={() => setActiveTab(t.value)}
            className={`flex-shrink-0 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === t.value
                ? 'text-blue-600 border-blue-600'
                : 'text-gray-400 border-transparent'
            }`}>
            {t.label}
          </button>
        ))}
      </div>

      {activeTab === 'members' && <MembersTab refreshKey={refreshKey} onRefresh={onRefresh} />}
      {activeTab === 'theme' && <ThemeTab />}
      {activeTab === 'backup' && <BackupTab />}
    </div>
  )
}

// ─────────────────────────────────
// TASK-025: 가족 구성원 설정
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
            <span className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
              style={{ backgroundColor: m.color }}>
              {m.name[0]}
            </span>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-800">{m.name}</p>
              <p className="text-xs text-gray-400">{m.is_active ? '활성' : '비활성'}</p>
            </div>
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
  const isDefault = ['me', 'spouse', 'shared'].includes(memberId ?? '')

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
    if (!memberId || isDefault) return
    if (!confirm('이 구성원을 삭제할까요?')) return
    memberRepo.delete(memberId)
    onSaved()
  }

  return (
    <FormModal title={memberId ? '구성원 수정' : '구성원 추가'} onClose={onClose}>
      <Field label="이름 (필수)">
        <input type="text" placeholder="이름" value={name}
          onChange={(e) => { setName(e.target.value); setError('') }} className={inputCls}
          readOnly={isDefault} />
        {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
        {isDefault && <p className="text-xs text-gray-400 mt-1">기본 구성원은 이름 변경 가능</p>}
      </Field>

      <Field label="색상">
        <div className="flex flex-wrap gap-2 mt-1">
          {MEMBER_COLORS.map((c) => (
            <button key={c} onClick={() => setColor(c)}
              className={`w-8 h-8 rounded-full border-2 transition-all ${color === c ? 'border-gray-800 scale-110' : 'border-transparent'}`}
              style={{ backgroundColor: c }} />
          ))}
        </div>
      </Field>

      {!isDefault && (
        <div className="flex items-center justify-between mb-4 py-2">
          <span className="text-sm text-gray-700">활성 상태</span>
          <button onClick={() => setIsActive((v) => !v)}
            className={`w-10 h-6 rounded-full transition-colors ${isActive ? 'bg-blue-500' : 'bg-gray-200'}`}>
            <span className={`block w-4 h-4 bg-white rounded-full shadow transition-transform mx-1 ${isActive ? 'translate-x-4' : 'translate-x-0'}`} />
          </button>
        </div>
      )}

      <FormActions onSave={handleSave}
        onDelete={memberId && !isDefault ? handleDelete : undefined}
        saveLabel={memberId ? '수정 완료' : '저장'} />
    </FormModal>
  )
}

// ─────────────────────────────────
// TASK-027: 테마 설정
// ─────────────────────────────────

function ThemeTab() {
  const hid = householdRepo.getDefault().id
  const [theme, setTheme] = useState(appSettingsRepo.get(hid, 'theme') ?? 'system')

  function handleTheme(t: string) {
    setTheme(t)
    appSettingsRepo.set(hid, 'theme', t)
    // 실제 다크모드 적용은 v2에서 TailwindCSS dark: 클래스로 구현
  }

  return (
    <div className="p-4 space-y-3">
      <p className="text-xs text-gray-400">현재는 밝은 모드만 지원합니다. 다크모드는 v2에서 추가됩니다.</p>
      {[
        { value: 'light', label: '밝은 모드' },
        { value: 'dark', label: '어두운 모드 (준비 중)' },
        { value: 'system', label: '시스템 설정 따르기' },
      ].map((t) => (
        <button key={t.value} onClick={() => handleTheme(t.value)}
          className={`w-full bg-white rounded-xl px-4 py-3 flex items-center justify-between ${t.value === 'dark' ? 'opacity-40' : ''}`}
          disabled={t.value === 'dark'}>
          <span className="text-sm text-gray-700">{t.label}</span>
          {theme === t.value && <span className="text-blue-500 text-sm">✓</span>}
        </button>
      ))}
    </div>
  )
}

// ─────────────────────────────────
// TASK-028: 데이터 백업
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
        // 각 도메인별로 import
        const keys = [
          'households', 'members', 'calendar_events', 'ledger_entries',
          'fixed_expenses', 'incomes', 'subscriptions', 'checklists',
          'checklist_items', 'shopping_items', 'household_supplies',
          'chores', 'records', 'templates', 'app_settings',
        ] as const
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

  return (
    <div className="p-4 space-y-3">
      <p className="text-xs text-gray-400">
        모든 데이터를 JSON 파일로 내보내거나 가져올 수 있습니다.
      </p>

      <button onClick={handleExportJSON}
        className="w-full bg-white rounded-xl px-4 py-4 flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-800">JSON으로 내보내기</p>
          <p className="text-xs text-gray-400 mt-0.5">전체 데이터를 파일로 저장합니다</p>
        </div>
        <span className="text-blue-500 text-sm">↓</span>
      </button>

      <label className="block w-full bg-white rounded-xl px-4 py-4 cursor-pointer">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-800">JSON 가져오기</p>
            <p className="text-xs text-gray-400 mt-0.5">백업 파일에서 데이터를 복원합니다</p>
          </div>
          <span className="text-blue-500 text-sm">↑</span>
        </div>
        <input type="file" accept=".json" onChange={handleImportJSON} className="hidden" />
      </label>

      {imported && (
        <p className="text-xs text-green-500 text-center">
          가져오기 완료! 새로고침(F5)으로 적용하세요.
        </p>
      )}

      <div className="bg-yellow-50 rounded-xl p-3 mt-4">
        <p className="text-xs text-yellow-600">
          주의: 가져오기는 기존 데이터를 덮어씁니다. 먼저 내보내기로 현재 데이터를 백업하세요.
        </p>
      </div>
    </div>
  )
}
