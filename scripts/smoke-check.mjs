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

function requireFile(path) {
  if (!existsSync(join(root, path))) {
    fail(`Missing required file: ${path}`)
    return false
  }
  pass(`Found ${path}`)
  return true
}

function readUtf8(path) {
  return readFileSync(join(root, path), 'utf8')
}

function requireIncludes(label, text, values) {
  for (const value of values) {
    if (text.includes(value)) {
      pass(`${label} includes "${value}"`)
    } else {
      fail(`${label} is missing "${value}"`)
    }
  }
}

const requiredFiles = [
  'index.html',
  'dist/index.html',
  'dist/manifest.webmanifest',
  'dist/sw.js',
  'public/og-image.png',
  'public/robots.txt',
  'public/sitemap.xml',
  'public/icons/icon-192.png',
  'public/icons/icon-512.png',
  'public/icons/icon-512-maskable.png',
]

for (const path of requiredFiles) {
  requireFile(path)
}

if (existsSync(join(root, 'dist/manifest.webmanifest'))) {
  const manifest = JSON.parse(readUtf8('dist/manifest.webmanifest'))
  const expected = {
    name: '온집',
    short_name: '온집',
    display: 'standalone',
    lang: 'ko',
    start_url: '/',
  }

  for (const [key, value] of Object.entries(expected)) {
    if (manifest[key] === value) {
      pass(`manifest.${key} is ${value}`)
    } else {
      fail(`manifest.${key} expected ${value}, got ${manifest[key]}`)
    }
  }

  requireIncludes('manifest.description', manifest.description ?? '', [
    '흐름',
    '구매 항목',
    '보관 메모',
  ])

  if (Array.isArray(manifest.icons) && manifest.icons.length >= 3) {
    pass('manifest has at least 3 icons')
  } else {
    fail('manifest should include at least 3 icons')
  }
}

for (const path of ['index.html', 'dist/index.html']) {
  if (!existsSync(join(root, path))) continue
  const html = readUtf8(path)
  requireIncludes(path, html, [
    '<html lang="ko">',
    '온집',
    '우리 집 생활을 한곳에',
    '구매 항목',
    '보관 메모',
    'og-image.png',
  ])
}

const featureIcons = [
  'home',
  'calendar',
  'money',
  'life',
  'settings',
  'shopping',
  'checklist',
  'record',
  'bill',
  'subscription',
  'supplies',
  'chore',
]

for (const icon of featureIcons) {
  requireFile(`public/icons/features/${icon}.png`)
}

const sourceChecks = [
  'src/components',
  'src/utils/constants.ts',
  'src/utils/categoryStore.ts',
  'src/utils/csvExport.ts',
]
const oldTerms = [
  '품목명',
  '수입 추가',
  '수입 항목',
  '고정수입',
  '부수입',
  '미수령',
  '날짜/결제수단',
]

function sourceFiles(path) {
  const fullPath = join(root, path)
  if (!existsSync(fullPath)) return []
  const stat = statSync(fullPath)
  if (stat.isFile()) return [path]

  return readdirSync(fullPath)
    .flatMap((entry) => sourceFiles(join(path, entry)))
    .filter((entry) => entry.endsWith('.ts') || entry.endsWith('.tsx'))
}

for (const path of sourceChecks) {
  const matches = []
  for (const file of sourceFiles(path)) {
    const text = readUtf8(file)
    for (const term of oldTerms) {
      if (text.includes(term)) {
        matches.push(`${file}: "${term}"`)
      }
    }
  }

  if (matches.length > 0) {
    fail(`Old wording remains under ${path}:\n${matches.join('\n')}`)
  } else {
    pass(`No old wording found under ${path}`)
  }
}

if (failures.length > 0) {
  console.error(`\nSmoke check failed with ${failures.length} issue(s).`)
  process.exit(1)
}

console.log('\nSmoke check passed.')
