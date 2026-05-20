import { existsSync, readFileSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import { join } from 'node:path'

const root = process.cwd()
const failures = []
const requiredExampleKeys = ['VITE_GA_MEASUREMENT_ID']
const ignoredEnvFiles = ['.env', '.env.local']

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

function gitOutput(args) {
  return execFileSync('git', args, { cwd: root, encoding: 'utf8' }).trim()
}

if (!existsSync(join(root, '.env.example'))) {
  fail('Missing .env.example')
} else {
  const example = readUtf8('.env.example')
  for (const key of requiredExampleKeys) {
    if (new RegExp(`^${key}=`, 'm').test(example)) {
      pass(`.env.example includes ${key}`)
    } else {
      fail(`.env.example is missing ${key}`)
    }
  }

  const assignedSecrets = example
    .split(/\r?\n/)
    .filter((line) => line.trim() && !line.trim().startsWith('#'))
    .filter((line) => {
      const [, value = ''] = line.split('=')
      return value.trim().length > 0
    })

  if (assignedSecrets.length === 0) {
    pass('.env.example does not contain concrete values')
  } else {
    fail(`.env.example should not contain concrete values:\n${assignedSecrets.join('\n')}`)
  }
}

const gitIgnore = existsSync(join(root, '.gitignore')) ? readUtf8('.gitignore') : ''
for (const path of ignoredEnvFiles) {
  if (gitIgnore.split(/\r?\n/).includes(path)) {
    pass(`${path} is listed in .gitignore`)
  } else {
    fail(`${path} should be listed in .gitignore`)
  }

  const tracked = gitOutput(['ls-files', path])
  if (!tracked) {
    pass(`${path} is not tracked by git`)
  } else {
    fail(`${path} is tracked by git`)
  }
}

if (failures.length > 0) {
  console.error(`\nEnvironment check failed with ${failures.length} issue(s).`)
  process.exit(1)
}

console.log('\nEnvironment check passed.')
