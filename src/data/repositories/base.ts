// ═══════════════════════════════════════════════════════════
// BaseRepository: localStorage 기반 범용 CRUD
// 모든 도메인 repository가 이 클래스를 extends해서 사용
// ═══════════════════════════════════════════════════════════

export function now(): string {
  return new Date().toISOString()
}

export function newId(): string {
  return crypto.randomUUID()
}

export class BaseRepository<T extends { id: string; updated_at: string }> {
  constructor(private readonly key: string) {}

  private read(): T[] {
    try {
      const raw = localStorage.getItem(this.key)
      return raw ? (JSON.parse(raw) as T[]) : []
    } catch {
      return []
    }
  }

  private write(items: T[]): void {
    localStorage.setItem(this.key, JSON.stringify(items))
  }

  getAll(): T[] {
    return this.read()
  }

  getById(id: string): T | undefined {
    return this.read().find((item) => item.id === id)
  }

  create(item: T): T {
    const items = this.read()
    items.push(item)
    this.write(items)
    return item
  }

  update(id: string, patch: Partial<T>): T | null {
    const items = this.read()
    const index = items.findIndex((item) => item.id === id)
    if (index === -1) return null
    items[index] = { ...items[index], ...patch, updated_at: now() }
    this.write(items)
    return items[index]
  }

  delete(id: string): boolean {
    const items = this.read()
    const filtered = items.filter((item) => item.id !== id)
    if (filtered.length === items.length) return false
    this.write(filtered)
    return true
  }

  deleteAll(): void {
    this.write([])
  }

  exportAll(): string {
    return JSON.stringify(this.read(), null, 2)
  }

  importAll(json: string): void {
    try {
      const items = JSON.parse(json) as T[]
      this.write(items)
    } catch {
      throw new Error(`${this.key}: import 데이터 파싱 실패`)
    }
  }
}
