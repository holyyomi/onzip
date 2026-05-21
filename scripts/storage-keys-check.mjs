import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'

const root = process.cwd()
const failures = []

function pass(message) {
  console.log(`[pass] ${message}`)
}

function fail(message) {
  failures.push(message)
  console.error(`[fail] ${message}`)
}

function readUtf8(path) {
  return readFileSync(join(root, path), 'utf8')
}

function sourceFiles(path) {
  const fullPath = join(root, path)
  if (!existsSync(fullPath)) return []
  const stat = statSync(fullPath)
  if (stat.isFile()) return [path]

  return readdirSync(fullPath)
    .flatMap((entry) => sourceFiles(join(path, entry)))
    .filter((entry) => entry.endsWith('.ts') || entry.endsWith('.tsx'))
}

function extractStorageKeysFromSource() {
  const keys = new Set()

  for (const file of sourceFiles('src')) {
    const text = readUtf8(file)
    const constants = new Map()

    for (const match of text.matchAll(/(?:const|export const)\s+([A-Z0-9_]+)\s*=\s*['"`](onzip_[a-z0-9_]+)['"`]/g)) {
      constants.set(match[1], match[2])
    }

    for (const match of text.matchAll(/\bsuper\(\s*['"`](onzip_[a-z0-9_]+)['"`]\s*\)/g)) {
      keys.add(match[1])
    }

    for (const match of text.matchAll(/\blocalStorage\.(?:getItem|setItem|removeItem)\(\s*['"`](onzip_[a-z0-9_]+)['"`]/g)) {
      keys.add(match[1])
    }

    for (const [name, value] of constants) {
      const localStoragePattern = new RegExp(`\\blocalStorage\\.(?:getItem|setItem|removeItem)\\(\\s*${name}\\b`)
      const repositoryPattern = new RegExp(`\\bsuper\\(\\s*${name}\\b`)
      if (localStoragePattern.test(text) || repositoryPattern.test(text)) {
        keys.add(value)
      }
    }
  }

  return keys
}

const sourceKeys = extractStorageKeysFromSource()
const handoff = readUtf8('docs/HANDOFF.md')
const documentedKeys = new Set([...handoff.matchAll(/\bonzip_[a-z0-9_]+\b/g)].map((match) => match[0]))

for (const key of sourceKeys) {
  if (!documentedKeys.has(key)) {
    fail(`Missing localStorage key in docs/HANDOFF.md: ${key}`)
  }
}

if (sourceKeys.size > 0) {
  pass(`Checked ${sourceKeys.size} source localStorage key(s)`)
} else {
  fail('No localStorage keys found under src')
}

if (documentedKeys.size > 0) {
  pass(`Loaded ${documentedKeys.size} documented onzip key(s) from docs/HANDOFF.md`)
} else {
  fail('No onzip keys found in docs/HANDOFF.md')
}

if (failures.length > 0) {
  console.error(`\nStorage keys check failed with ${failures.length} issue(s).`)
  process.exit(1)
}

console.log('\nStorage keys check passed.')
