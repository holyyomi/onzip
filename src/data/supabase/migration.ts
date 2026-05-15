import type { SupabaseClient } from '@supabase/supabase-js'
import {
  appSettingsRepo,
  calendarEventRepo,
  checklistItemRepo,
  checklistRepo,
  choreRepo,
  fixedExpenseRepo,
  householdRepo,
  householdSupplyRepo,
  incomeRepo,
  ledgerEntryRepo,
  lifeRecordRepo,
  memberRepo,
  shoppingItemRepo,
  subscriptionRepo,
  templateRepo,
} from '../repositories'
import type {
  AppSettings,
  CalendarEvent,
  Checklist,
  Chore,
  FixedExpense,
  Household,
  HouseholdSupply,
  Income,
  LedgerEntry,
  LifeRecord,
  Member,
  ShoppingItem,
  Subscription,
  Template,
} from '../models'
import { getSupabaseClient } from './client'
import {
  createSupabaseIdMap,
  getMemberLocalAlias,
  mapHouseholdId,
  mapMemberId,
  type SupabaseIdMap,
} from './idMapping'

type DbRow = object

type MigrationTable =
  | 'households'
  | 'members'
  | 'calendar_events'
  | 'ledger_entries'
  | 'fixed_expenses'
  | 'incomes'
  | 'subscriptions'
  | 'checklists'
  | 'checklist_items'
  | 'shopping_items'
  | 'household_supplies'
  | 'chores'
  | 'records'
  | 'templates'
  | 'app_settings'

export interface LocalMigrationData {
  households: Household[]
  members: Member[]
  calendar_events: CalendarEvent[]
  ledger_entries: LedgerEntry[]
  fixed_expenses: FixedExpense[]
  incomes: Income[]
  subscriptions: Subscription[]
  checklists: Checklist[]
  checklist_items: ReturnType<typeof checklistItemRepo.getAll>
  shopping_items: ShoppingItem[]
  household_supplies: HouseholdSupply[]
  chores: Chore[]
  records: LifeRecord[]
  templates: Template[]
  app_settings: AppSettings[]
}

export interface MigrationPayload extends Record<MigrationTable, DbRow[]> {}

export interface MigrationBuildResult {
  idMap: SupabaseIdMap
  payload: MigrationPayload
}

export interface MigrationResult {
  householdId: string | null
  inserted: Record<MigrationTable, number>
}

export function getLocalMigrationData(): LocalMigrationData {
  return {
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
  }
}

export function buildMigrationPayload(data = getLocalMigrationData()): MigrationBuildResult {
  const idMap = createSupabaseIdMap({
    households: data.households,
    members: data.members,
  })

  const mapHouseholdRow = <T extends { household_id: string; member_id?: string | null }>(
    row: T,
  ) => ({
    ...row,
    household_id: mapHouseholdId(row.household_id, idMap),
    member_id: mapMemberId(row.member_id ?? null, idMap),
  })

  const payload: MigrationPayload = {
    households: data.households.map((household) => ({
      ...household,
      id: mapHouseholdId(household.id, idMap),
      local_alias: household.id === 'default' ? 'default' : null,
    })),
    members: data.members.map((member) => ({
      ...member,
      id: mapMemberId(member.id, idMap),
      household_id: mapHouseholdId(member.household_id, idMap),
      local_alias: getMemberLocalAlias(member),
    })),
    calendar_events: data.calendar_events.map(mapHouseholdRow),
    ledger_entries: data.ledger_entries.map(mapHouseholdRow),
    fixed_expenses: data.fixed_expenses.map(mapHouseholdRow),
    incomes: data.incomes.map(mapHouseholdRow),
    subscriptions: data.subscriptions.map(mapHouseholdRow),
    checklists: data.checklists.map(mapHouseholdRow),
    checklist_items: data.checklist_items,
    shopping_items: data.shopping_items.map((item) => ({
      ...item,
      household_id: mapHouseholdId(item.household_id, idMap),
    })),
    household_supplies: data.household_supplies.map(mapHouseholdRow),
    chores: data.chores.map(mapHouseholdRow),
    records: data.records.map(mapHouseholdRow),
    templates: data.templates.map(({ items, ...template }) => ({
      ...template,
      items_json: items,
    })),
    app_settings: data.app_settings.map((setting) => ({
      ...setting,
      household_id: mapHouseholdId(setting.household_id, idMap),
      setting_value:
        setting.setting_key === 'default_member_id'
          ? mapMemberId(setting.setting_value, idMap) ?? setting.setting_value
          : setting.setting_value,
    })),
  }

  return { idMap, payload }
}

export async function migrateLocalDataToSupabase(
  client: SupabaseClient = getSupabaseClient(),
): Promise<MigrationResult> {
  const { idMap, payload } = buildMigrationPayload()
  const inserted = {} as Record<MigrationTable, number>

  const order: MigrationTable[] = [
    'households',
    'members',
    'calendar_events',
    'ledger_entries',
    'fixed_expenses',
    'incomes',
    'subscriptions',
    'checklists',
    'checklist_items',
    'shopping_items',
    'household_supplies',
    'chores',
    'records',
    'templates',
    'app_settings',
  ]

  for (const table of order) {
    inserted[table] = await upsertRows(client, table, payload[table])
  }

  const firstHousehold = Object.values(idMap.householdIds)[0] ?? null
  return { householdId: firstHousehold, inserted }
}

async function upsertRows(
  client: SupabaseClient,
  table: MigrationTable,
  rows: DbRow[],
): Promise<number> {
  if (rows.length === 0) return 0

  const { error } = await client
    .from(table)
    .upsert(rows, { onConflict: 'id' })

  if (error) {
    throw new Error(`${table} 마이그레이션 실패: ${error.message}`)
  }

  return rows.length
}
