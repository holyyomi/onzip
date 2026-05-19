import { useEffect, useState } from 'react'
import { appSettingsRepo } from '../data/repositories'
import { formatAmount } from './date'

const HIDE_AMOUNTS_KEY = 'hide_amounts'
const AMOUNT_PRIVACY_EVENT = 'onzip_amount_privacy_changed'

export function isAmountHidden(): boolean {
  return appSettingsRepo.get('default', HIDE_AMOUNTS_KEY) === 'true'
}

export function setAmountHidden(hidden: boolean): void {
  appSettingsRepo.set('default', HIDE_AMOUNTS_KEY, hidden ? 'true' : 'false')
  window.dispatchEvent(new Event(AMOUNT_PRIVACY_EVENT))
}

export function displayAmount(amount: number, hidden: boolean): string {
  return hidden ? '***원' : formatAmount(amount)
}

export function useAmountPrivacy() {
  const [hidden, setHiddenState] = useState(isAmountHidden)

  useEffect(() => {
    function handleChange() {
      setHiddenState(isAmountHidden())
    }

    window.addEventListener(AMOUNT_PRIVACY_EVENT, handleChange)
    window.addEventListener('storage', handleChange)
    return () => {
      window.removeEventListener(AMOUNT_PRIVACY_EVENT, handleChange)
      window.removeEventListener('storage', handleChange)
    }
  }, [])

  function setHidden(next: boolean) {
    setAmountHidden(next)
    setHiddenState(next)
  }

  return { hidden, setHidden }
}
