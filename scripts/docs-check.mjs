import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'

const root = process.cwd()
const failures = []
const packageJson = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'))
const packageScripts = new Set(Object.keys(packageJson.scripts ?? {}))

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

function markdownFiles(path) {
  const fullPath = join(root, path)
  if (!existsSync(fullPath)) return []
  const stat = statSync(fullPath)
  if (stat.isFile()) return path.endsWith('.md') ? [path] : []

  return readdirSync(fullPath).flatMap((entry) => markdownFiles(join(path, entry)))
}

const referencedDocs = new Set()
const referencedScripts = new Set()

for (const file of markdownFiles('docs')) {
  const text = readUtf8(file)

  for (const match of text.matchAll(/\bdocs\/[A-Za-z0-9_./-]+/g)) {
    const path = match[0]
    if (!path.includes('...')) {
      referencedDocs.add(path)
    }
  }

  for (const match of text.matchAll(/\bnpm run ([A-Za-z0-9:_-]+)/g)) {
    referencedScripts.add(match[1])
  }
}

for (const path of referencedDocs) {
  if (!existsSync(join(root, path))) {
    fail(`Missing referenced doc: ${path}`)
  }
}

for (const script of referencedScripts) {
  if (!packageScripts.has(script)) {
    fail(`Missing package script referenced in docs: npm run ${script}`)
  }
}

if (referencedDocs.size > 0) {
  pass(`Checked ${referencedDocs.size} referenced doc path(s)`)
} else {
  fail('No docs/ references found in docs')
}

if (referencedScripts.size > 0) {
  pass(`Checked ${referencedScripts.size} referenced npm script(s)`)
} else {
  fail('No npm run references found in docs')
}

if (failures.length > 0) {
  console.error(`\nDocs check failed with ${failures.length} issue(s).`)
  process.exit(1)
}

console.log('\nDocs check passed.')
