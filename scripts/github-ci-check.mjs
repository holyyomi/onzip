import { existsSync, readFileSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
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

function git(args) {
  try {
    return execFileSync('git', args, {
      cwd: root,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim()
  } catch {
    return ''
  }
}

const workflowPath = '.github/workflows/verify.yml'
const fullWorkflowPath = join(root, workflowPath)

if (existsSync(fullWorkflowPath)) {
  pass(`Found ${workflowPath}`)
  const workflow = readFileSync(fullWorkflowPath, 'utf8')
  if (workflow.includes('npm run verify')) {
    pass('Verify workflow runs npm run verify')
  } else {
    fail('Verify workflow should run npm run verify')
  }
} else {
  fail(`Missing ${workflowPath}`)
}

const branch = git(['branch', '--show-current'])
if (branch) {
  pass(`Current branch is ${branch}`)
} else {
  fail('No current git branch found')
}

const originUrl = git(['remote', 'get-url', 'origin'])
if (originUrl) {
  pass(`origin remote is ${originUrl}`)
} else {
  fail('origin remote is not configured')
}

if (branch) {
  const upstream = git(['rev-parse', '--abbrev-ref', '--symbolic-full-name', '@{u}'])
  if (upstream) {
    pass(`Current branch tracks ${upstream}`)
  } else if (originUrl) {
    fail(`Current branch ${branch} has no upstream; run git push -u origin ${branch}`)
  }
}

if (failures.length > 0) {
  console.error(`\nGitHub CI check failed with ${failures.length} issue(s).`)
  process.exit(1)
}

console.log('\nGitHub CI check passed.')
