// inventory.mjs 测试：清单构建与启用状态推断。
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { inventoryFor } from '../.dsh-plugin/src/inventory.mjs'

function addPackage(dir, name, manifest) {
  const pkgDir = join(dir, 'node_modules', name)
  mkdirSync(pkgDir, { recursive: true })
  writeFileSync(join(pkgDir, 'package.json'), JSON.stringify(manifest, null, 2) + '\n')
  if (typeof manifest.dsh?.bundle?.patch === 'string') {
    writeFileSync(join(pkgDir, manifest.dsh.bundle.patch), '- insert:\n    - id: ' + name + '\n      name: ' + name + '\n')
  }
}

/** 系统 bundle 放官方模块回退目录（profiles/node_modules）。 */
function addSystemBundle(profileDir, name, manifest) {
  const pkgDir = join(profileDir, '..', 'node_modules', name)
  mkdirSync(pkgDir, { recursive: true })
  writeFileSync(join(pkgDir, 'package.json'), JSON.stringify(manifest, null, 2) + '\n')
  if (typeof manifest.dsh?.bundle?.patch === 'string') {
    writeFileSync(join(pkgDir, manifest.dsh.bundle.patch), '- insert:\n    - id: ' + name + '\n      name: ' + name + '\n')
  }
}

function makeProfile({ deps, bundles, patchText }) {
  const dir = mkdtempSync(join(tmpdir(), 'pm-inv-'))
  const manifest = { name: 'dsh-profile-test', private: true, dependencies: deps, dsh: { profile: { bundles } } }
  writeFileSync(join(dir, 'package.json'), JSON.stringify(manifest, null, 2) + '\n')
  writeFileSync(join(dir, 'cordis.patch.yml'), patchText ?? '# patch\n[]\n')
  mkdirSync(join(dir, 'node_modules'), { recursive: true })
  return dir
}

test('清单：bundle 优先、系统/依赖/自插件标记、启用状态', () => {
  const dir = makeProfile({
    deps: {
      'gal-view': 'github:Ayase34/gal-view#main',
      'whale-girl': 'github:vlln/whale-girl#main',
      'plain-lib': '^1.0.0',
    },
    bundles: ['@deepseek-ai/dsh-base', 'whale-girl', 'gal-view'],
    patchText: '# patch\n- id: whale-girl\n  disabled: true\n',
  })
  addPackage(dir, 'gal-view', { name: 'gal-view', version: '0.3.3', description: 'GAL', dsh: { bundle: { patch: './cordis.patch.yml' }, client: { platform: 'web' } } })
  addPackage(dir, 'whale-girl', { name: 'whale-girl', version: '0.1.0', description: '宠物', dsh: { bundle: { patch: './cordis.patch.yml' }, client: { platform: 'web' } } })
  addPackage(dir, 'plain-lib', { name: 'plain-lib', version: '1.2.3' })
  addSystemBundle(dir, '@deepseek-ai/dsh-base', { name: '@deepseek-ai/dsh-base', version: '0.1.0', dsh: { bundle: { patch: './cordis.patch.yml' }, client: { platform: 'web' } } })

  const { profile, plugins } = inventoryFor(dir)
  assert.equal(profile.bundles.length, 3)
  assert.equal(plugins.length, 4)
  // bundle 层在前，按 bundles 顺序
  assert.deepEqual(plugins.map(p => p.name), ['@deepseek-ai/dsh-base', 'whale-girl', 'gal-view', 'plain-lib'])
  const base = plugins[0]
  assert.equal(base.isSystem, true)
  assert.equal(base.isBundle, true)
  assert.equal(base.enabled, true)
  const whale = plugins[1]
  assert.equal(whale.enabled, false)
  assert.equal(whale.rowIds[0], 'whale-girl')
  assert.equal(whale.spec, 'github:vlln/whale-girl#main')
  assert.equal(whale.dshClient, true)
  assert.equal(whale.clientPlatform, 'web')
  const plain = plugins[3]
  assert.equal(plain.isBundle, false)
  assert.equal(plain.isSystem, false)
  assert.equal(plain.dshBundle, false)
  assert.equal(plain.isSelf, false)
})

test('自插件标记', () => {
  const dir = makeProfile({ deps: { 'plugin-manager': 'link:../pm' }, bundles: ['plugin-manager'] })
  addPackage(dir, 'plugin-manager', { name: 'plugin-manager', version: '0.1.0', dsh: { bundle: { patch: './cordis.patch.yml' }, client: { platform: 'web' } } })
  const { plugins } = inventoryFor(dir, 'plugin-manager')
  assert.equal(plugins[0].isSelf, true)
})

test('补丁解析失败：patchError 上报、启用状态按猜测', () => {
  const dir = makeProfile({
    deps: { gal: '1.0.0' },
    bundles: ['gal'],
    patchText: '# patch\n- id: gal\n  expr: !!js x\n',
  })
  addPackage(dir, 'gal', { name: 'gal', version: '1.0.0', dsh: { bundle: { patch: './cordis.patch.yml' }, client: { platform: 'web' } } })
  const { profile, plugins } = inventoryFor(dir)
  assert.notEqual(profile.patchError, null)
  assert.equal(plugins[0].enabledGuess, false)
  assert.equal(plugins[0].enabled, true)
})

test('依赖存在但未安装：跳过（异常态不崩清单）', () => {
  const dir = makeProfile({ deps: { ghost: '1.0.0' }, bundles: [] })
  const { plugins } = inventoryFor(dir)
  assert.equal(plugins.length, 0)
})
