export type MemoTab = 'home' | 'calendar' | 'money' | 'life' | 'settings'

type TabMemoMap = Record<MemoTab, string>

const KEY = 'onzip_tab_memos'

const DEFAULT_MEMOS: TabMemoMap = {
  home: '',
  calendar: '',
  money: '',
  life: '',
  settings: '',
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

export function getTabMemo(tab: MemoTab): string {
  return readMemos()[tab]
}

export function setTabMemo(tab: MemoTab, memo: string) {
  const memos = readMemos()
  memos[tab] = memo
  writeMemos(memos)
}
