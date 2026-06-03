import { useEffect, useState } from 'react'
import type { LifeRecord } from '../data/models'
import { appSettingsRepo } from '../data/repositories'

// 기존 사용자 설정을 유지하기 위해 localStorage 설정 키 이름은 그대로 둔다.
const HIDE_SECRET_KEY = 'hide_sensitive_records'
const VAULT_PRIVACY_EVENT = 'onzip_vault_privacy_changed'
const LEGACY_SECRET_TAGS = ['민감', '비밀', '숨김', 'private']

type SecretRecordInput = Pick<LifeRecord, 'tags'> & Partial<Pick<LifeRecord, 'content_is_secret'>>

function hasLegacySecretTag(record: Pick<LifeRecord, 'tags'>): boolean {
  return record.tags.some((tag) => {
    const normalized = tag.trim().toLowerCase()
    return LEGACY_SECRET_TAGS.includes(normalized) || LEGACY_SECRET_TAGS.includes(tag.trim())
  })
}

export function isSecretRecord(record: SecretRecordInput): boolean {
  if (typeof record.content_is_secret === 'boolean') return record.content_is_secret
  return hasLegacySecretTag(record)
}

export function isSensitiveRecord(record: SecretRecordInput): boolean {
  return isSecretRecord(record)
}

export function isSensitiveHidden(): boolean {
  return appSettingsRepo.get('default', HIDE_SECRET_KEY) === 'true'
}

export function setSensitiveHidden(hidden: boolean): void {
  appSettingsRepo.set('default', HIDE_SECRET_KEY, hidden ? 'true' : 'false')
  window.dispatchEvent(new Event(VAULT_PRIVACY_EVENT))
}

export function displayRecordTitle(record: Pick<LifeRecord, 'title'>, _hidden?: boolean): string {
  return record.title
}

export function displaySecretText(value: string, secret: boolean | undefined, hidden: boolean): string {
  return hidden && secret ? '비밀 내용 숨김이 켜져 있습니다.' : value
}

export function displayRecordContent(
  record: Pick<LifeRecord, 'content' | 'tags'> & Partial<Pick<LifeRecord, 'content_is_secret'>>,
  hidden: boolean,
): string {
  return displaySecretText(record.content, isSecretRecord(record), hidden)
}

export function useVaultPrivacy() {
  const [hidden, setHiddenState] = useState(isSensitiveHidden)

  useEffect(() => {
    function handleChange() {
      setHiddenState(isSensitiveHidden())
    }

    window.addEventListener(VAULT_PRIVACY_EVENT, handleChange)
    window.addEventListener('storage', handleChange)
    return () => {
      window.removeEventListener(VAULT_PRIVACY_EVENT, handleChange)
      window.removeEventListener('storage', handleChange)
    }
  }, [])

  function setHidden(next: boolean) {
    setSensitiveHidden(next)
    setHiddenState(next)
  }

  return { hidden, setHidden }
}
