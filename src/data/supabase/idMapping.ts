import type { Member } from '../models'

const MAP_KEY = 'onzip_supabase_id_map'
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

export type DefaultMemberAlias = 'me' | 'spouse' | 'shared'

export interface SupabaseIdMap {
  householdIds: Record<string, string>
  memberIds: Record<string, string>
}

export interface IdMapInput {
  households: { id: string }[]
  members: Member[]
}

export function isUuid(value: string): boolean {
  return UUID_RE.test(value)
}

export function isDefaultMemberAlias(value: string | null | undefined): value is DefaultMemberAlias {
  return value === 'me' || value === 'spouse' || value === 'shared'
}

export function getMemberLocalAlias(member: Member): DefaultMemberAlias | null {
  return isDefaultMemberAlias(member.id) ? member.id : null
}

export function loadSupabaseIdMap(): SupabaseIdMap {
  try {
    const raw = localStorage.getItem(MAP_KEY)
    if (!raw) return { householdIds: {}, memberIds: {} }
    const parsed = JSON.parse(raw) as Partial<SupabaseIdMap>
    return {
      householdIds: parsed.householdIds ?? {},
      memberIds: parsed.memberIds ?? {},
    }
  } catch {
    return { householdIds: {}, memberIds: {} }
  }
}

export function saveSupabaseIdMap(map: SupabaseIdMap): void {
  localStorage.setItem(MAP_KEY, JSON.stringify(map))
}

export function createSupabaseIdMap(input: IdMapInput): SupabaseIdMap {
  const map = loadSupabaseIdMap()

  input.households.forEach((household) => {
    if (!map.householdIds[household.id]) {
      map.householdIds[household.id] = isUuid(household.id) ? household.id : crypto.randomUUID()
    }
  })

  input.members.forEach((member) => {
    if (!map.memberIds[member.id]) {
      map.memberIds[member.id] = isUuid(member.id) ? member.id : crypto.randomUUID()
    }
  })

  saveSupabaseIdMap(map)
  return map
}

export function mapHouseholdId(localId: string, map: SupabaseIdMap): string {
  return map.householdIds[localId] ?? localId
}

export function mapMemberId(localId: string | null, map: SupabaseIdMap): string | null {
  if (!localId) return null
  return map.memberIds[localId] ?? localId
}
