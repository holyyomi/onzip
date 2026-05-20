import { useEffect, useState } from 'react'
import type { LifeRecord } from '../data/models'
import { appSettingsRepo } from '../data/repositories'

const HIDE_SENSITIVE_KEY = 'hide_sensitive_records'
const VAULT_PRIVACY_EVENT = 'onzip_vault_privacy_changed'
const SENSITIVE_TAGS = ['민감', '비밀', '숨김', 'private']

export function isSensitiveRecord(record: Pick<LifeRecord, 'tags'>): boolean {
  return record.tags.some((tag) => SENSITIVE_TAGS.includes(tag.toLowerCase()) || SENSITIVE_TAGS.includes(tag))
}

export function isSensitiveHidden(): boolean {
  return appSettingsRepo.get('default', HIDE_SENSITIVE_KEY) === 'true'
}

export function setSensitiveHidden(hidden: boolean): void {
  appSettingsRepo.set('default', HIDE_SENSITIVE_KEY, hidden ? 'true' : 'false')
  window.dispatchEvent(new Event(VAULT_PRIVACY_EVENT))
}

export function displayRecordTitle(record: Pick<LifeRecord, 'title' | 'tags'>, hidden: boolean): string {
  return hidden && isSensitiveRecord(record) ? '민감 보관 메모' : record.title
}

export function displayRecordContent(record: Pick<LifeRecord, 'content' | 'tags'>, hidden: boolean): string {
  return hidden && isSensitiveRecord(record) ? '민감 메모 숨김이 켜져 있습니다. 열람하려면 PIN 확인이 필요합니다.' : record.content
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
