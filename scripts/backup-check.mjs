import { readFileSync } from 'node:fs'
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

function extractObjectBlock(text, marker) {
  const markerIndex = text.indexOf(marker)
  if (markerIndex === -1) {
    fail(`Missing object marker: ${marker}`)
    return ''
  }

  const openIndex = text.indexOf('{', markerIndex)
  if (openIndex === -1) {
    fail(`Missing opening brace for marker: ${marker}`)
    return ''
  }

  let depth = 0
  for (let i = openIndex; i < text.length; i += 1) {
    const char = text[i]
    if (char === '{') depth += 1
    if (char === '}') depth -= 1
    if (depth === 0) return text.slice(openIndex + 1, i)
  }

  fail(`Missing closing brace for marker: ${marker}`)
  return ''
}

function sorted(values) {
  return [...values].sort((a, b) => a.localeCompare(b))
}

const dataExport = readUtf8('src/utils/dataExport.ts')
const dataModel = readUtf8('docs/DATA_MODEL.md')
const backupDataBlock = extractObjectBlock(dataExport, 'data: {')

const exportedKeys = new Set(
  [...backupDataBlock.matchAll(/^\s+([a-z_]+):/gm)].map((match) => match[1]),
)

const importedKeys = new Set([
  ...[...dataExport.matchAll(/importCollection\(data,\s*['"`]([a-z_]+)['"`]/g)].map((match) => match[1]),
  ...[...dataExport.matchAll(/\bdata\.([a-z_]+)/g)].map((match) => match[1]),
])

const documentedBackupKeys = new Set(
  [...dataModel.matchAll(/\|\s*([a-z_]+)\s*\|\s*`onzip_[a-z0-9_]+`/g)].map((match) => match[1]),
)

for (const key of exportedKeys) {
  if (!importedKeys.has(key)) {
    fail(`Backup export key is not imported: ${key}`)
  }
  if (!documentedBackupKeys.has(key)) {
    fail(`Backup export key is not documented in docs/DATA_MODEL.md: ${key}`)
  }
}

for (const key of importedKeys) {
  if (!exportedKeys.has(key)) {
    fail(`Backup import key is not exported: ${key}`)
  }
}

if (exportedKeys.size > 0) {
  pass(`Checked ${exportedKeys.size} backup export key(s): ${sorted(exportedKeys).join(', ')}`)
} else {
  fail('No backup export keys found in src/utils/dataExport.ts')
}

if (importedKeys.size > 0) {
  pass(`Checked ${importedKeys.size} backup import key(s)`)
} else {
  fail('No backup import keys found in src/utils/dataExport.ts')
}

if (failures.length > 0) {
  console.error(`\nBackup check failed with ${failures.length} issue(s).`)
  process.exit(1)
}

console.log('\nBackup check passed.')
