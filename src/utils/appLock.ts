import { appSettingsRepo } from '../data/repositories'

const PIN_HASH_KEY = 'app_lock_pin_hash'
const PIN_SALT_KEY = 'app_lock_pin_salt'

function makeSalt(): string {
  const bytes = new Uint8Array(16)
  crypto.getRandomValues(bytes)
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('')
}

async function sha256(text: string): Promise<string> {
  if (!crypto.subtle) return btoa(text)
  const bytes = new TextEncoder().encode(text)
  const digest = await crypto.subtle.digest('SHA-256', bytes)
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('')
}

function isValidPin(pin: string): boolean {
  return /^\d{4}$/.test(pin)
}

export function hasAppPin(): boolean {
  return Boolean(appSettingsRepo.get('default', PIN_HASH_KEY))
}

export async function setAppPin(pin: string): Promise<{ ok: boolean; message: string }> {
  if (!isValidPin(pin)) {
    return { ok: false, message: 'PIN은 숫자 4자리로 입력해주세요.' }
  }

  const salt = makeSalt()
  const hash = await sha256(`${salt}:${pin}`)
  appSettingsRepo.set('default', PIN_SALT_KEY, salt)
  appSettingsRepo.set('default', PIN_HASH_KEY, hash)
  return { ok: true, message: '비밀 메모 PIN을 저장했습니다.' }
}

export async function verifyAppPin(pin: string): Promise<boolean> {
  const salt = appSettingsRepo.get('default', PIN_SALT_KEY)
  const savedHash = appSettingsRepo.get('default', PIN_HASH_KEY)
  if (!salt || !savedHash) return true

  const hash = await sha256(`${salt}:${pin}`)
  return hash === savedHash
}

export function clearAppPin(): void {
  appSettingsRepo.set('default', PIN_SALT_KEY, '')
  appSettingsRepo.set('default', PIN_HASH_KEY, '')
}
