// ═══════════════════════════════════════════════════════════
// 도메인별 Repository
// localStorage 키 → onzip_* 접두사로 통일
// ═══════════════════════════════════════════════════════════

import { BaseRepository, newId, now } from './base'
import type {
  Household,
  Member,
  CalendarEvent,
  LedgerEntry,
  FixedExpense,
  Income,
  Subscription,
  Checklist,
  ChecklistItem,
  ShoppingItem,
  HouseholdSupply,
  Chore,
  LifeRecord,
  Template,
  AppSettings,
} from '../models'

// ─────────────────────────────────
// Household
// ─────────────────────────────────

class HouseholdRepository extends BaseRepository<Household> {
  constructor() {
    super('onzip_households')
  }

  getDefault(): Household {
    const all = this.getAll()
    if (all.length > 0) return all[0]
    const defaultHousehold: Household = {
      id: 'default',
      name: '우리집',
      created_at: now(),
      updated_at: now(),
    }
    return this.create(defaultHousehold)
  }
}

// ─────────────────────────────────
// Member
// ─────────────────────────────────

class MemberRepository extends BaseRepository<Member> {
  constructor() {
    super('onzip_members')
  }

  getByHousehold(householdId: string): Member[] {
    return this.getAll().filter((m) => m.household_id === householdId && m.is_active)
  }
}

// ─────────────────────────────────
// CalendarEvent
// ─────────────────────────────────

class CalendarEventRepository extends BaseRepository<CalendarEvent> {
  constructor() {
    super('onzip_calendar_events')
  }

  getByDateRange(startDate: string, endDate: string): CalendarEvent[] {
    return this.getAll().filter(
      (e) => e.start_date >= startDate && e.start_date <= endDate,
    )
  }

  getByDate(date: string): CalendarEvent[] {
    return this.getAll().filter((e) => e.start_date === date)
  }
}

// ─────────────────────────────────
// LedgerEntry (가계부)
// ─────────────────────────────────

class LedgerEntryRepository extends BaseRepository<LedgerEntry> {
  constructor() {
    super('onzip_ledger_entries')
  }

  getByMonth(year: number, month: number): LedgerEntry[] {
    const prefix = `${year}-${String(month).padStart(2, '0')}`
    return this.getAll().filter((e) => e.date.startsWith(prefix))
  }

  sumByType(entries: LedgerEntry[], type: 'income' | 'expense'): number {
    return entries
      .filter((e) => e.entry_type === type)
      .reduce((sum, e) => sum + e.amount, 0)
  }
}

// ─────────────────────────────────
// FixedExpense (고정지출)
// ─────────────────────────────────

class FixedExpenseRepository extends BaseRepository<FixedExpense> {
  constructor() {
    super('onzip_fixed_expenses')
  }

  getActive(): FixedExpense[] {
    return this.getAll().filter((e) => e.is_active)
  }

  monthlyTotal(): number {
    return this.getActive().reduce((sum, e) => sum + e.amount, 0)
  }
}

// ─────────────────────────────────
// Income (수입)
// ─────────────────────────────────

class IncomeRepository extends BaseRepository<Income> {
  constructor() {
    super('onzip_incomes')
  }

  getByHousehold(householdId: string): Income[] {
    return this.getAll().filter((i) => i.household_id === householdId)
  }
}

// ─────────────────────────────────
// Subscription (구독)
// ─────────────────────────────────

class SubscriptionRepository extends BaseRepository<Subscription> {
  constructor() {
    super('onzip_subscriptions')
  }

  getActive(): Subscription[] {
    return this.getAll().filter((s) => s.status === 'active')
  }

  monthlyTotal(): number {
    return this.getActive().reduce((sum, s) => sum + s.amount, 0)
  }

  annualTotal(): number {
    return this.monthlyTotal() * 12
  }
}

// ─────────────────────────────────
// Checklist
// ─────────────────────────────────

class ChecklistRepository extends BaseRepository<Checklist> {
  constructor() {
    super('onzip_checklists')
  }

  getByHousehold(householdId: string): Checklist[] {
    return this.getAll().filter((c) => c.household_id === householdId)
  }
}

// ─────────────────────────────────
// ChecklistItem
// ─────────────────────────────────

class ChecklistItemRepository extends BaseRepository<ChecklistItem> {
  constructor() {
    super('onzip_checklist_items')
  }

  getByChecklist(checklistId: string): ChecklistItem[] {
    return this.getAll()
      .filter((i) => i.checklist_id === checklistId)
      .sort((a, b) => a.sort_order - b.sort_order)
  }

  deleteByChecklist(checklistId: string): void {
    const items = this.getAll().filter((i) => i.checklist_id !== checklistId)
    this.importAll(JSON.stringify(items))
  }

  completionRate(checklistId: string): number {
    const items = this.getByChecklist(checklistId)
    if (items.length === 0) return 0
    const done = items.filter((i) => i.is_done).length
    return Math.round((done / items.length) * 100)
  }
}

// ─────────────────────────────────
// ShoppingItem (장보기)
// ─────────────────────────────────

class ShoppingItemRepository extends BaseRepository<ShoppingItem> {
  constructor() {
    super('onzip_shopping_items')
  }

  getPending(householdId: string): ShoppingItem[] {
    return this.getAll().filter(
      (i) => i.household_id === householdId && !i.is_done,
    )
  }

  getFavorites(householdId: string): ShoppingItem[] {
    return this.getAll().filter(
      (i) => i.household_id === householdId && i.is_favorite,
    )
  }

  expectedTotal(items: ShoppingItem[]): number {
    return items.reduce((sum, i) => sum + (i.expected_amount ?? 0), 0)
  }
}

// ─────────────────────────────────
// HouseholdSupply (생활용품)
// ─────────────────────────────────

class HouseholdSupplyRepository extends BaseRepository<HouseholdSupply> {
  constructor() {
    super('onzip_household_supplies')
  }

  getNeedBuy(householdId: string): HouseholdSupply[] {
    return this.getAll().filter(
      (s) => s.household_id === householdId && s.status === 'need_buy',
    )
  }
}

// ─────────────────────────────────
// Chore (집안일)
// ─────────────────────────────────

class ChoreRepository extends BaseRepository<Chore> {
  constructor() {
    super('onzip_chores')
  }

  getByHousehold(householdId: string): Chore[] {
    return this.getAll().filter((c) => c.household_id === householdId)
  }
}

// ─────────────────────────────────
// LifeRecord (생활 기록)
// ─────────────────────────────────

class LifeRecordRepository extends BaseRepository<LifeRecord> {
  constructor() {
    super('onzip_records')
  }

  getByType(type: LifeRecord['record_type']): LifeRecord[] {
    return this.getAll().filter((r) => r.record_type === type)
  }

  searchByTag(tag: string): LifeRecord[] {
    return this.getAll().filter((r) => r.tags.includes(tag))
  }

  searchByKeyword(keyword: string): LifeRecord[] {
    const lower = keyword.toLowerCase()
    return this.getAll().filter(
      (r) =>
        r.title.toLowerCase().includes(lower) ||
        r.content.toLowerCase().includes(lower),
    )
  }
}

// ─────────────────────────────────
// Template
// ─────────────────────────────────

class TemplateRepository extends BaseRepository<Template> {
  constructor() {
    super('onzip_templates')
  }

  getDefaults(): Template[] {
    return this.getAll().filter((t) => t.is_default)
  }
}

// ─────────────────────────────────
// AppSettings
// ─────────────────────────────────

class AppSettingsRepository extends BaseRepository<AppSettings> {
  constructor() {
    super('onzip_app_settings')
  }

  get(householdId: string, key: string): string | null {
    const setting = this.getAll().find(
      (s) => s.household_id === householdId && s.setting_key === key,
    )
    return setting?.setting_value ?? null
  }

  set(householdId: string, key: string, value: string): void {
    const existing = this.getAll().find(
      (s) => s.household_id === householdId && s.setting_key === key,
    )
    if (existing) {
      this.update(existing.id, { setting_value: value })
    } else {
      this.create({
        id: newId(),
        household_id: householdId,
        setting_key: key,
        setting_value: value,
        created_at: now(),
        updated_at: now(),
      })
    }
  }
}

// ─────────────────────────────────
// 싱글톤 인스턴스 export
// ─────────────────────────────────

export const householdRepo = new HouseholdRepository()
export const memberRepo = new MemberRepository()
export const calendarEventRepo = new CalendarEventRepository()
export const ledgerEntryRepo = new LedgerEntryRepository()
export const fixedExpenseRepo = new FixedExpenseRepository()
export const incomeRepo = new IncomeRepository()
export const subscriptionRepo = new SubscriptionRepository()
export const checklistRepo = new ChecklistRepository()
export const checklistItemRepo = new ChecklistItemRepository()
export const shoppingItemRepo = new ShoppingItemRepository()
export const householdSupplyRepo = new HouseholdSupplyRepository()
export const choreRepo = new ChoreRepository()
export const lifeRecordRepo = new LifeRecordRepository()
export const templateRepo = new TemplateRepository()
export const appSettingsRepo = new AppSettingsRepository()

// ─────────────────────────────────
// 전체 데이터 export/import (백업용)
// ─────────────────────────────────

export function exportAllData(): string {
  return JSON.stringify(
    {
      households: householdRepo.getAll(),
      members: memberRepo.getAll(),
      calendar_events: calendarEventRepo.getAll(),
      ledger_entries: ledgerEntryRepo.getAll(),
      fixed_expenses: fixedExpenseRepo.getAll(),
      incomes: incomeRepo.getAll(),
      subscriptions: subscriptionRepo.getAll(),
      checklists: checklistRepo.getAll(),
      checklist_items: checklistItemRepo.getAll(),
      shopping_items: shoppingItemRepo.getAll(),
      household_supplies: householdSupplyRepo.getAll(),
      chores: choreRepo.getAll(),
      records: lifeRecordRepo.getAll(),
      templates: templateRepo.getAll(),
      app_settings: appSettingsRepo.getAll(),
      tab_memos: JSON.parse(localStorage.getItem('onzip_tab_memos') ?? '{}'),
    },
    null,
    2,
  )
}
