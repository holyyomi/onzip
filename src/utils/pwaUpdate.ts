import { registerSW } from 'virtual:pwa-register'

interface PwaUpdateState {
  canUpdate: boolean
  checking: boolean
  message: string
}

type Listener = (state: PwaUpdateState) => void

const listeners = new Set<Listener>()
let initialized = false
let updateSW: ((reloadPage?: boolean) => Promise<void>) | null = null
let registration: ServiceWorkerRegistration | null = null

let state: PwaUpdateState = {
  canUpdate: false,
  checking: false,
  message: '',
}

function emit(next: Partial<PwaUpdateState>) {
  state = { ...state, ...next }
  listeners.forEach((listener) => listener(state))
}

export function getPwaUpdateState(): PwaUpdateState {
  return state
}

export function subscribePwaUpdate(listener: Listener): () => void {
  listeners.add(listener)
  listener(state)
  return () => listeners.delete(listener)
}

export function initPwaUpdate(): void {
  if (initialized || !('serviceWorker' in navigator)) return
  initialized = true

  updateSW = registerSW({
    immediate: true,
    onNeedRefresh() {
      emit({
        canUpdate: true,
        checking: false,
        message: '새 버전이 준비됐어요.',
      })
    },
    onOfflineReady() {
      emit({ message: '오프라인에서도 사용할 준비가 끝났어요.' })
    },
    onRegisteredSW(_, swRegistration) {
      registration = swRegistration ?? null
    },
    onRegisterError() {
      emit({
        checking: false,
        message: '업데이트 확인에 실패했습니다.',
      })
    },
  })
}

export async function checkForPwaUpdate(): Promise<void> {
  if (!('serviceWorker' in navigator)) {
    emit({ message: '현재 브라우저에서는 앱 업데이트 확인을 지원하지 않습니다.' })
    return
  }

  emit({ checking: true, message: '업데이트를 확인하고 있습니다.' })

  try {
    const swRegistration = registration ?? await navigator.serviceWorker.getRegistration()
    if (!swRegistration) {
      emit({ checking: false, message: '앱 업데이트 준비가 아직 완료되지 않았습니다.' })
      return
    }

    await swRegistration.update()
    window.setTimeout(() => {
      if (!state.canUpdate) {
        emit({ checking: false, message: '최신 버전을 사용 중입니다.' })
      }
    }, 900)
  } catch {
    emit({ checking: false, message: '업데이트 확인에 실패했습니다.' })
  }
}

export async function applyPwaUpdate(): Promise<void> {
  if (!updateSW) {
    window.location.reload()
    return
  }

  await updateSW(true)
}
