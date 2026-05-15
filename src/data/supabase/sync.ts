import type { SupabaseClient } from '@supabase/supabase-js'
import { getSupabaseClient } from './client'
import {
  MIGRATION_TABLE_ORDER,
  migrateLocalDataToSupabase,
  type DbRow,
  type MigrationResult,
  type MigrationTable,
} from './migration'

const STORAGE_KEYS: Record<MigrationTable, string> = {
  households: 'onzip_households',
  members: 'onzip_members',
  calendar_events: 'onzip_calendar_events',
  ledger_entries: 'onzip_ledger_entries',
  fixed_expenses: 'onzip_fixed_expenses',
  incomes: 'onzip_incomes',
  subscriptions: 'onzip_subscriptions',
  checklists: 'onzip_checklists',
  checklist_items: 'onzip_checklist_items',
  shopping_items: 'onzip_shopping_items',
  household_supplies: 'onzip_household_supplies',
  chores: 'onzip_chores',
  records: 'onzip_records',
  templates: 'onzip_templates',
  app_settings: 'onzip_app_settings',
}

const HOUSEHOLD_TABLES: MigrationTable[] = [
  'members',
  'calendar_events',
  'ledger_entries',
  'fixed_expenses',
  'incomes',
  'subscriptions',
  'checklists',
  'shopping_items',
  'household_supplies',
  'chores',
  'records',
  'app_settings',
]

export interface PullOptions {
  client?: SupabaseClient
  householdId?: string
}

export interface PullResult {
  householdIds: string[]
  pulled: Record<MigrationTable, number>
}

export async function pushLocalDataToSupabase(
  client: SupabaseClient = getSupabaseClient(),
): Promise<MigrationResult> {
  return migrateLocalDataToSupabase(client)
}

export async function pullSupabaseDataToLocalStorage(
  options: PullOptions = {},
): Promise<PullResult> {
  const client = options.client ?? getSupabaseClient()
  const pulled = {} as Record<MigrationTable, number>

  const households = options.householdId
    ? await selectById(client, 'households', options.householdId)
    : await selectAll(client, 'households')
  const householdIds = households.map((row) => getRowId(row))

  writeTable('households', households.map(stripLocalAlias))
  pulled.households = households.length

  for (const table of HOUSEHOLD_TABLES) {
    const rows = householdIds.length > 0
      ? await selectByHouseholds(client, table, householdIds)
      : []
    const normalized = table === 'members' ? rows.map(stripLocalAlias) : rows
    writeTable(table, normalized)
    pulled[table] = normalized.length
  }

  const checklists = readTable('checklists')
  const checklistIds = checklists.map((row) => getRowId(row))
  const checklistItems = checklistIds.length > 0
    ? await selectIn(client, 'checklist_items', 'checklist_id', checklistIds)
    : []
  writeTable('checklist_items', checklistItems)
  pulled.checklist_items = checklistItems.length

  const templates = await selectAll(client, 'templates')
  const normalizedTemplates = templates.map(normalizeTemplate)
  writeTable('templates', normalizedTemplates)
  pulled.templates = normalizedTemplates.length

  MIGRATION_TABLE_ORDER.forEach((table) => {
    pulled[table] = pulled[table] ?? 0
  })

  return { householdIds, pulled }
}

async function selectAll(client: SupabaseClient, table: MigrationTable): Promise<DbRow[]> {
  const { data, error } = await client.from(table).select('*')
  if (error) throw new Error(`${table} 조회 실패: ${error.message}`)
  return data ?? []
}

async function selectById(
  client: SupabaseClient,
  table: MigrationTable,
  id: string,
): Promise<DbRow[]> {
  const { data, error } = await client.from(table).select('*').eq('id', id)
  if (error) throw new Error(`${table} 조회 실패: ${error.message}`)
  return data ?? []
}

async function selectByHouseholds(
  client: SupabaseClient,
  table: MigrationTable,
  householdIds: string[],
): Promise<DbRow[]> {
  const { data, error } = await client
    .from(table)
    .select('*')
    .in('household_id', householdIds)
  if (error) throw new Error(`${table} 조회 실패: ${error.message}`)
  return data ?? []
}

async function selectIn(
  client: SupabaseClient,
  table: MigrationTable,
  column: string,
  values: string[],
): Promise<DbRow[]> {
  const { data, error } = await client.from(table).select('*').in(column, values)
  if (error) throw new Error(`${table} 조회 실패: ${error.message}`)
  return data ?? []
}

function writeTable(table: MigrationTable, rows: DbRow[]): void {
  localStorage.setItem(STORAGE_KEYS[table], JSON.stringify(rows))
}

function readTable(table: MigrationTable): DbRow[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS[table])
    return raw ? (JSON.parse(raw) as DbRow[]) : []
  } catch {
    return []
  }
}

function stripLocalAlias(row: DbRow): DbRow {
  const { local_alias: _localAlias, ...rest } = row as DbRow & { local_alias?: string | null }
  return rest
}

function normalizeTemplate(row: DbRow): DbRow {
  const {
    items_json: itemsJson,
    ...rest
  } = row as DbRow & { items_json?: unknown }
  return {
    ...rest,
    items: Array.isArray(itemsJson) ? itemsJson : [],
  }
}

function getRowId(row: DbRow): string {
  return String((row as { id: unknown }).id)
}
