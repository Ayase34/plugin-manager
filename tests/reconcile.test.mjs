// reconcile.mjs 测试：bundle 层自动维护。
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { reconcileBundles, readManifest } from '../.dsh-plugin/src/reconcile.mjs'

function makeProfile({ deps = {}, bundles = [], patch = true }) {
  const dir = mkdtempSync(join(tmpdir(), 'pm-reconcile-'))
  const manifest = {
    name: 'dsh-profile-test',
    private: true,
    dependencies: deps,
    dsh: { profile: { bundles } },
  }
  writeFileSync(join(dir, 'package.json'), JSON.stringify(manifest, null, 2) + '\n')
  if (patch) writeFileSync(join(dir, 'cordis.patch.yml'), '# patch\n[]\n')
  mkdirSync(join(dir, 'node_modules'), { recursive: true })
  return dir
}

function addPackage(dir, name, { bundle = false } = {}) {
  const pkgDir = join(dir, 'node_modules', name)
  mkdirSync(pkgDir, { recursive: true })
  const manifest = { name, version: '1.0.0', private: true, type: 'module' }
  if (bundle) {
    manifest.main = './.dsh-plugin/index.mjs'
    manifest.dsh = { bundle: { patch: './cordis.patch.yml' }, client: { platform: 'web' } }
    writeFileSync(join(pkgDir, 'cordis.patch.yml'), '- insert:\n    - id: ' + name + '\n      name: ' + name + '\n')
  }
  writeFileSync(join(pkgDir, 'package.json'), JSON.stringify(manifest, null, 2) + '\n')
}

test('新增 bundle 依赖 → 追加进 bundles', () => {
  const dir = makeProfile({ deps: { 'plain-lib': '1.0.0' } })
  addPackage(dir, 'plain-lib')
  addPackage(dir, 'new-bundle', { bundle: true })
  // 直接改 manifest 模拟 pnpm add 后的状态
  const manifest = readManifest(dir)
  manifest.dependencies['new-bundle'] = 'link:../new-bundle'
  writeFileSync(join(dir, 'package.json'), JSON.stringify(manifest, null, 2) + '\n')

  const result = reconcileBundles(dir)
  assert.equal(result.changed, true)
  assert.deepEqual(result.added, ['new-bundle'])
  assert.equal(readManifest(dir).dsh.profile.bundles.includes('new-bundle'), true)
})

test('无 bundle 声明的依赖不进入 bundles', () => {
  const dir = makeProfile({ deps: { 'plain-lib': '1.0.0' } })
  addPackage(dir, 'plain-lib')
  const result = reconcileBundles(dir)
  assert.equal(result.changed, false)
  assert.deepEqual(readManifest(dir).dsh.profile.bundles, [])
})

test('依赖被移除的 bundle → 从 bundles 剔除', () => {
  const dir = makeProfile({ deps: { 'old-bundle': '1.0.0' }, bundles: ['old-bundle'] })
  addPackage(dir, 'old-bundle', { bundle: true })
  const manifest = readManifest(dir)
  delete manifest.dependencies['old-bundle']
  writeFileSync(join(dir, 'package.json'), JSON.stringify(manifest, null, 2) + '\n')
  // pnpm remove 会同时删掉 node_modules 中的包目录
  rmSync(join(dir, 'node_modules', 'old-bundle'), { recursive: true, force: true })

  // 模拟 pnpm remove 后的 reconcile：操作前依赖含 old-bundle
  const result = reconcileBundles(dir, ['old-bundle'])
  assert.equal(result.changed, true)
  assert.deepEqual(result.removed, ['old-bundle'])
  assert.deepEqual(readManifest(dir).dsh.profile.bundles, [])
})

test('模板 bundle（非依赖）永不剔除', () => {
  const dir = makeProfile({
    deps: { gal: 'github:x/gal#main' },
    bundles: ['@deepseek-ai/dsh-base', 'gal'],
  })
  addPackage(dir, 'gal', { bundle: true })
  const result = reconcileBundles(dir)
  assert.equal(result.changed, false)
  assert.deepEqual(readManifest(dir).dsh.profile.bundles, ['@deepseek-ai/dsh-base', 'gal'])
})

test('幂等：重复 reconcile 不变化', () => {
  const dir = makeProfile({ deps: { 'new-bundle': '1.0.0' }, bundles: ['new-bundle'] })
  addPackage(dir, 'new-bundle', { bundle: true })
  assert.equal(reconcileBundles(dir).changed, false)
  assert.equal(reconcileBundles(dir).changed, false)
})
