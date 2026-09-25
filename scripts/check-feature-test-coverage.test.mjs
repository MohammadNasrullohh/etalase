import assert from 'node:assert/strict'
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import test from 'node:test'

import { checkFeatureTestCoverage, hasFeatureTest } from './check-feature-test-coverage.mjs'

async function write(root, path, content = '') {
  const target = join(root, path)
  await mkdir(join(target, '..'), { recursive: true })
  await writeFile(target, content, 'utf8')
}

async function withFixture(run) {
  const root = await mkdtemp(join(tmpdir(), 'feature-coverage-'))
  try {
    await run(root)
  } finally {
    await rm(root, { recursive: true, force: true })
  }
}

test('detects existing feature test in aliases or co-located directory', async () => {
  await withFixture(async (root) => {
    // Feature with co-located test
    await write(root, 'src/features/new-module/ui/comp.tsx', 'export const X = 1')
    await write(root, 'src/features/new-module/ui/comp.test.tsx', 'test')

    assert.equal(hasFeatureTest('new-module', root), true)
  })
})

test('flags missing test for a brand new feature', async () => {
  await withFixture(async (root) => {
    await write(root, 'src/features/untested-feature/lib/service.ts', 'export const S = 1')

    assert.equal(hasFeatureTest('untested-feature', root), false)
  })
})

test('coverage gate skips when base revision is missing or empty', () => {
  const result = checkFeatureTestCoverage({ baseRevision: '' })
  assert.equal(result.skipped, true)
})

test('coverage gate identifies new features and catches missing tests', async () => {
  await withFixture(async (root) => {
    await write(root, 'src/features/untested/index.ts', 'export const U = 1')

    const fakeGit = (cmd, ...args) => {
      if (cmd === 'diff') return ['src/features/untested/index.ts']
      if (cmd === 'ls-tree') return []
      return []
    }

    const result = checkFeatureTestCoverage({
      baseRevision: 'abc1234',
      root,
      gitFn: fakeGit,
    })

    assert.equal(result.skipped, false)
    assert.deepEqual(result.newFeatures, ['untested'])
    assert.deepEqual(result.missing, ['untested'])
  })
})
