import assert from 'node:assert/strict'
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import test from 'node:test'

import { inspectRepository } from './check-repository-isolation.mjs'

async function write(root, path, content) {
  const target = join(root, path)
  await mkdir(join(target, '..'), { recursive: true })
  await writeFile(target, content, 'utf8')
}

async function withFixture(run) {
  const root = await mkdtemp(join(tmpdir(), 'repository-isolation-'))
  try {
    await run(root)
  } finally {
    await rm(root, { recursive: true, force: true })
  }
}

test('allows internal imports and HTTP integration strings', async () => {
  await withFixture(async (root) => {
    await write(root, 'package.json', JSON.stringify({
      dependencies: { internal: 'file:./packages/internal' },
    }))
    await write(root, 'src/nested/allowed.ts', [
      "im" + "port schema fr" + "om '../../drizzle/schema'",
      "im" + "port { user } fr" + "om '@/features/lawet-auth'",
      "fetch(process.env.LAWET_API_URL + '/api/v1/auth/me')",
    ].join('\n'))
    await write(root, 'backend/allowed.py', 'from app.features.jurnal_alas import service\n')

    const result = await inspectRepository({
      root,
      sourceRoots: ['src', 'backend'],
      forbiddenPackages: ['lawet-hub', '@lawet', 'lawethub', 'lawet_hub'],
    })

    assert.deepEqual(result.violations, [])
  })
})

test('rejects peer packages and dependencies that escape the repository', async () => {
  await withFixture(async (root) => {
    await write(root, 'package.json', JSON.stringify({
      dependencies: {
        'peer-app': '^1.0.0',
        'peer-local': 'file:../Peer App',
      },
    }))
    await write(root, 'src/bad.ts', [
      "im" + "port peer fr" + "om 'peer-app/sdk'",
      "const external = im" + "port('../../Peer App/src/index.js')",
    ].join('\n'))
    await write(root, 'backend/bad.py', 'from peer_app.client import Client\n')
    await write(root, 'requirements-dev.txt', 'peer-app @ git+https://example.invalid/peer-app.git\n')

    const result = await inspectRepository({
      root,
      sourceRoots: ['src', 'backend'],
      forbiddenPackages: ['peer-app', 'peer_app', '@peer'],
    })
    const codes = new Set(result.violations.map((violation) => violation.code))

    assert.ok(codes.has('forbidden-import'))
    assert.ok(codes.has('external-import'))
    assert.ok(codes.has('forbidden-dependency'))
    assert.ok(codes.has('external-dependency'))
    assert.ok(codes.has('forbidden-requirement'))
  })
})
