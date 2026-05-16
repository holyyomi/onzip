import { useState, useMemo } from 'react'
import { templateRepo, checklistRepo, checklistItemRepo } from '../../data/repositories'
import { newId, now } from '../../data/repositories/base'
import { trackEvent } from '../../utils/analytics'
import EmptyState from '../common/EmptyState'

interface Props {
  onRefresh: () => void
}

export default function TemplateTab({ onRefresh }: Props) {
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const templates = useMemo(() => templateRepo.getAll(), [])

  function applyTemplate(templateId: string) {
    const tpl = templateRepo.getById(templateId)
    if (!tpl) return

    const checklistId = newId()
    checklistRepo.create({
      id: checklistId, household_id: 'default',
      title: tpl.title, category: tpl.category,
      member_id: null, due_date: null, repeat_rule: 'none',
      calendar_visible: false, created_at: now(), updated_at: now(),
    })

    tpl.items.forEach((item) => {
      checklistItemRepo.create({
        id: newId(), checklist_id: checklistId,
        content: item.content, is_done: false,
        sort_order: item.sort_order, created_at: now(), updated_at: now(),
      })
    })

    alert(`"${tpl.title}" 체크리스트가 생성되었습니다.\n체크리스트 탭에서 확인하세요.`)
    trackEvent('template_copied')
    onRefresh()
  }

  return (
    <div className="p-4 space-y-3">
      <p className="text-xs text-gray-400">
        템플릿을 복사하면 내 체크리스트로 바로 사용할 수 있습니다.
      </p>

      {templates.length === 0 && (
        <EmptyState
          message="템플릿이 비어 있습니다"
          sub="기본 체크리스트 템플릿이 준비되면 이곳에서 복사할 수 있습니다."
        />
      )}

      {templates.map((tpl) => {
        const isExpanded = expandedId === tpl.id
        return (
          <div key={tpl.id} className="oz-card overflow-hidden">
            <div className="px-4 py-3">
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setExpandedId(isExpanded ? null : tpl.id)}
                  className="flex-1 text-left"
                >
                  <p className="text-sm font-semibold text-gray-800">{tpl.title}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {tpl.category} · {tpl.items.length}개 항목
                  </p>
                </button>
                <button
                  onClick={() => applyTemplate(tpl.id)}
                  className="ml-2 flex-shrink-0 rounded-full border border-[#ffd1da] px-3 py-1.5 text-xs font-semibold text-[#ff385c]"
                >
                  복사하기
                </button>
              </div>

              {tpl.description && (
                <p className="text-xs text-gray-400 mt-1">{tpl.description}</p>
              )}
            </div>

            {/* 항목 미리보기 */}
            {isExpanded && (
              <div className="border-t border-gray-100 px-4 py-3 space-y-2">
                {tpl.items.map((item, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="w-4 h-4 rounded-full border-2 border-gray-200 flex-shrink-0" />
                    <span className="text-sm text-gray-600">{item.content}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
