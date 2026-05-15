import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

let client: SupabaseClient | null = null

export function isSupabaseConfigured(): boolean {
  return Boolean(supabaseUrl && supabaseAnonKey)
}

export function getSupabaseClient(): SupabaseClient {
  if (!isSupabaseConfigured()) {
    throw new Error(
      'Supabase 환경변수가 설정되지 않았습니다. .env에 VITE_SUPABASE_URL과 VITE_SUPABASE_ANON_KEY를 추가하세요.',
    )
  }

  if (!client) {
    client = createClient(supabaseUrl!, supabaseAnonKey!)
  }

  return client
}

export async function checkSupabaseConnection(): Promise<boolean> {
  if (!isSupabaseConfigured()) return false

  const { error } = await getSupabaseClient()
    .from('households')
    .select('id')
    .limit(1)

  return !error
}
