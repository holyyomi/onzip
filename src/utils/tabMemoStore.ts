export type MemoTab = 'home' | 'calendar' | 'money' | 'life' | 'settings'

type TabMemoMap = Record<MemoTab, string>
type TabMemoSecretMap = Record<MemoTab, boolean>

const KEY = 'onzip_tab_memos'
const SECRET_KEY = 'onzip_tab_memo_secrets'

const DEFAULT_MEMOS: TabMemoMap = {
  home: '',
  calendar: '',
  money: '',
  life: '',
  settings: '',
}

const DEFAULT_SECRETS: TabMemoSecretMap = {
  home: false,
  calendar: false,
  money: false,
  life: false,
  settings: false,
}

function readMemos(): TabMemoMap {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return { ...DEFAULT_MEMOS }
    return { ...DEFAULT_MEMOS, ...JSON.parse(raw) }
  } catch {
    return { ...DEFAULT_MEMOS }
  }
}

function writeMemos(memos: TabMemoMap) {
  localStorage.setItem(KEY, JSON.stringify(memos))
}

function readSecrets(): TabMemoSecretMap {
  try {
    const raw = localStorage.getItem(SECRET_KEY)
    if (!raw) return { ...DEFAULT_SECRETS }
    return { ...DEFAULT_SECRETS, ...JSON.parse(raw) }
  } catch {
    return { ...DEFAULT_SECRETS }
  }
}

function writeSecrets(secrets: TabMemoSecretMap) {
  localStorage.setItem(SECRET_KEY, JSON.stringify(secrets))
}

export function getTabMemo(tab: MemoTab): string {
  return readMemos()[tab]
}

export function setTabMemo(tab: MemoTab, memo: string) {
  const memos = readMemos()
  memos[tab] = memo
  writeMemos(memos)
}

export function isTabMemoSecret(tab: MemoTab): boolean {
  return readSecrets()[tab]
}

export function setTabMemoSecret(tab: MemoTab, secret: boolean) {
  const secrets = readSecrets()
  secrets[tab] = secret
  writeSecrets(secrets)
}
