import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'

const root = process.cwd()
const failures = []
const allowedParamKeys = new Set(['type', 'mode', 'tab', 'platform', 'outcome', 'status'])

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

function documentedEvents() {
  const doc = readUtf8('docs/ANALYTICS.md')
  return new Set([...doc.matchAll(/\|\s*`([a-z0-9_]+)`\s*\|/g)].map((match) => match[1]))
}

function extractParamKeys(paramsText) {
  return [...paramsText.matchAll(/(?:^|[,{]\s*)([A-Za-z_$][\w$]*)\s*:/g)].map((match) => match[1])
}

const events = documentedEvents()
if (events.size > 0) {
  pass(`Loaded ${events.size} documented analytics event(s)`)
} else {
  fail('No documented analytics events found in docs/ANALYTICS.md')
}

let trackEventCalls = 0
for (const file of sourceFiles('src')) {
  const text = readUtf8(file)

  if (file !== 'src\\utils\\analytics.ts' && file !== 'src/utils/analytics.ts' && text.includes("gtag('event'")) {
    fail(`${file} calls gtag('event') directly; use trackEvent instead`)
  }

  for (const match of text.matchAll(/trackEvent\(\s*(['"`])([^'"`]+)\1\s*(?:,\s*({[^)]*?})\s*)?\)/g)) {
    trackEventCalls += 1
    const [, , eventName, paramsText] = match
    if (!events.has(eventName)) {
      fail(`${file} uses undocumented analytics event "${eventName}"`)
    }

    if (!paramsText) continue
    for (const key of extractParamKeys(paramsText)) {
      if (!allowedParamKeys.has(key)) {
        fail(`${file} sends disallowed analytics parameter "${key}" for "${eventName}"`)
      }
    }
  }
}

if (trackEventCalls > 0) {
  pass(`Checked ${trackEventCalls} trackEvent call(s)`)
} else {
  fail('No trackEvent calls found under src')
}

if (failures.length > 0) {
  console.error(`\nAnalytics privacy check failed with ${failures.length} issue(s).`)
  process.exit(1)
}

console.log('\nAnalytics privacy check passed.')
