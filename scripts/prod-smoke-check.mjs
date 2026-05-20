const baseUrl = normalizeBaseUrl(process.env.ONZIP_PROD_URL ?? process.argv[2] ?? 'https://onzip.vercel.app')
const failures = []

function normalizeBaseUrl(value) {
  return value.replace(/\/+$/, '')
}

function pass(message) {
  console.log(`[pass] ${message}`)
}

function fail(message) {
  failures.push(message)
  console.error(`[fail] ${message}`)
}

async function fetchText(path) {
  const url = `${baseUrl}${path}`
  const response = await fetch(url, {
    headers: {
      'user-agent': 'onzip-prod-smoke-check/1.0',
    },
  })

  if (!response.ok) {
    fail(`${url} returned ${response.status}`)
    return null
  }

  pass(`${url} returned ${response.status}`)
  return response.text()
}

async function fetchHead(path) {
  const url = `${baseUrl}${path}`
  const response = await fetch(url, {
    method: 'HEAD',
    headers: {
      'user-agent': 'onzip-prod-smoke-check/1.0',
    },
  })

  if (!response.ok) {
    fail(`${url} returned ${response.status}`)
    return
  }

  pass(`${url} returned ${response.status}`)
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

function extractAssetPaths(html) {
  const paths = new Set()
  for (const match of html.matchAll(/\b(?:href|src)="([^"]+)"/g)) {
    const value = match[1]
    if (value.startsWith('/assets/')) {
      paths.add(value)
    }
  }
  return [...paths]
}

console.log(`Production smoke check: ${baseUrl}`)

const html = await fetchText('/')
if (html) {
  requireIncludes('homepage HTML', html, [
    '<html lang="ko">',
    '온집',
    '우리 집 생활을 한곳에',
    '구매 항목',
    '보관 메모',
    'manifest.webmanifest',
    'og-image.png',
  ])

  const assets = extractAssetPaths(html)
  if (assets.length === 0) {
    fail('homepage HTML does not reference built assets')
  } else {
    pass(`homepage HTML references ${assets.length} built asset(s)`)
    await Promise.all(assets.map((path) => fetchHead(path)))
  }
}

const manifestText = await fetchText('/manifest.webmanifest')
if (manifestText) {
  try {
    const manifest = JSON.parse(manifestText)
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
  } catch (error) {
    fail(`manifest.webmanifest is not valid JSON: ${error.message}`)
  }
}

const serviceWorker = await fetchText('/sw.js')
if (serviceWorker) {
  requireIncludes('service worker', serviceWorker, ['precache'])
}

await Promise.all([
  fetchHead('/icons/icon-192.png'),
  fetchHead('/icons/icon-512.png'),
  fetchHead('/icons/icon-512-maskable.png'),
  fetchHead('/og-image.png'),
  fetchHead('/robots.txt'),
  fetchHead('/sitemap.xml'),
])

if (failures.length > 0) {
  console.error(`\nProduction smoke check failed with ${failures.length} issue(s).`)
  process.exit(1)
}

console.log('\nProduction smoke check passed.')
