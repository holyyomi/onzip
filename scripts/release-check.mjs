import { execFileSync } from 'node:child_process'

const failures = []

function pass(message) {
  console.log(`[pass] ${message}`)
}

function fail(message) {
  failures.push(message)
  console.error(`[fail] ${message}`)
}

function git(args) {
  return execFileSync('git', args, { encoding: 'utf8' }).trim()
}

const status = git(['status', '--short'])
if (status) {
  fail(`Working tree is not clean:\n${status}`)
} else {
  pass('Working tree is clean')
}

try {
  const head = git(['rev-parse', '--verify', 'HEAD'])
  pass(`HEAD exists: ${head.slice(0, 7)}`)
} catch {
  fail('HEAD commit does not exist')
}

try {
  const branch = git(['branch', '--show-current'])
  if (branch) {
    pass(`Current branch is ${branch}`)
  } else {
    fail('Could not determine current branch')
  }
} catch {
  fail('Could not determine current branch')
}

if (failures.length > 0) {
  console.error(`\nRelease check failed with ${failures.length} issue(s).`)
  process.exit(1)
}

console.log('\nRelease check passed.')
