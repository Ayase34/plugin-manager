// profiles.mjs 测试：列表与新建。
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, existsSync, utimesSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { createProfile, listProfiles } from '../.dsh-plugin/src/profiles.mjs'
import { pickCurrentProfile } from '../.dsh-plugin/index.mjs'

function makeHome() {
  const home = mkdtempSync(join(tmpdir(), 'pm-profiles-'))
  mkdirSync(join(home, 'profiles'), { recursive: true })
  return home
}

function addProfile(home, name, { bundles = ['@deepseek-ai/dsh-base'], deps = {} } = {}) {
  const dir = join(home, 'profiles', name)
  mkdirSync(dir, { recursive: true })
  writeFileSync(join(dir, 'package.json'), JSON.stringify({
    name: `dsh-profile-${name}`,
    private: true,
    dependencies: deps,
    dsh: { profile: { bundles } },
  }, null, 2) + '\n')
  writeFileSync(join(dir, 'cordis.patch.yml'), '# patch\n[]\n')
  writeFileSync(join(dir, 'cordis.yml'), '[]\n') // boot 时被重写的根配置（mtime 判定依据）
  return dir
}

test('listProfiles：列出全部、排除 node_modules 回退、当前 profile 置顶', () => {
  const home = makeHome()
  const web = addProfile(home, 'web', { bundles: ['@deepseek-ai/dsh-base', 'gal'], deps: { gal: '1.0.0' } })
  addProfile(home, 'desktop', { bundles: ['@deepseek-ai/dsh-base'] })
  mkdirSync(join(home, 'profiles', 'node_modules'), { recursive: true }) // 回退目录
  writeFileSync(join(home, 'profiles', 'node_modules', 'junk.json'), '{}')

  const list = listProfiles(home, web)
  assert.equal(list.length, 2)
  assert.equal(list[0].isCurrent, true)
  assert.equal(list[0].name, 'web')
  assert.equal(list[0].depCount, 1)
  assert.equal(list[0].bundles.includes('gal'), true)
  assert.equal(list.some(p => p.name === 'node_modules'), false)
  assert.equal(list[1].name, 'desktop')
})

test('createProfile：创建完整骨架', () => {
  const home = makeHome()
  const created = createProfile(home, 'testbed')
  assert.equal(created.name, 'testbed')
  assert.equal(existsSync(join(created.dir, 'package.json')), true)
  assert.equal(existsSync(join(created.dir, 'cordis.patch.yml')), true)
  assert.equal(existsSync(join(created.dir, 'pnpm-workspace.yaml')), true)
  const manifest = JSON.parse(readFileSync(join(created.dir, 'package.json'), 'utf8'))
  assert.deepEqual(manifest.dsh.profile.bundles, ['@deepseek-ai/dsh-base', '@deepseek-ai/dsh-web-app'])
  assert.deepEqual(manifest.dependencies, {})
  // 出现在列表中
  const list = listProfiles(home, created.dir)
  assert.equal(list.length, 1)
  assert.equal(list[0].name, 'testbed')
})

test('createProfile：非法名/保留名/重名拒绝', () => {
  const home = makeHome()
  assert.throws(() => createProfile(home, 'Node_modules'), /kebab-case/)
  assert.throws(() => createProfile(home, 'node_modules'), /保留名/)
  assert.throws(() => createProfile(home, 'My Profile'), /kebab-case/)
  createProfile(home, 'dup')
  assert.throws(() => createProfile(home, 'dup'), /已存在/)
})

test('pickCurrentProfile：cordis.yml mtime 最新者为当前运行 profile', () => {
  const home = makeHome()
  const a = addProfile(home, 'alpha', { bundles: ['@deepseek-ai/dsh-base'] })
  const b = addProfile(home, 'beta', { bundles: ['@deepseek-ai/dsh-base'] })
  const future = new Date(Date.now() + 60000)
  const past = new Date(Date.now() - 60000)
  // beta 最近被 boot（cordis.yml 更新）
  utimesSync(join(b, 'cordis.yml'), past, future)
  utimesSync(join(a, 'cordis.yml'), past, past)
  assert.equal(pickCurrentProfile([a, b]), b)
  // alpha 最近被 boot
  utimesSync(join(a, 'cordis.yml'), past, future)
  utimesSync(join(b, 'cordis.yml'), past, past)
  assert.equal(pickCurrentProfile([a, b]), a)
  // 空候选
  assert.equal(pickCurrentProfile([]), null)
})
