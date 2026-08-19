// purge.mjs 测试：卸载数据清除。
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { mkdtempSync, mkdirSync, writeFileSync, existsSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { purgePluginData, purgeSettingsNamespace } from '../.dsh-plugin/src/purge.mjs'

test('purgePluginData：删除 DSH_HOME 级与 profile 级数据目录', () => {
  const home = mkdtempSync(join(tmpdir(), 'pm-purge-'))
  const profileDir = join(home, 'profiles', 'web')
  mkdirSync(join(home, 'data', 'demo-plugin'), { recursive: true })
  mkdirSync(join(profileDir, 'data', 'demo-plugin'), { recursive: true })
  writeFileSync(join(home, 'data', 'demo-plugin', 'state.json'), '{}')
  // 无关目录不受影响
  mkdirSync(join(home, 'data', 'other-plugin'), { recursive: true })

  const removed = purgePluginData(home, profileDir, 'demo-plugin')
  assert.equal(removed.length, 2)
  assert.equal(existsSync(join(home, 'data', 'demo-plugin')), false)
  assert.equal(existsSync(join(profileDir, 'data', 'demo-plugin')), false)
  assert.equal(existsSync(join(home, 'data', 'other-plugin')), true)
})

test('purgePluginData：目录不存在时静默（不抛错）', () => {
  const home = mkdtempSync(join(tmpdir(), 'pm-purge-'))
  const removed = purgePluginData(home, join(home, 'profiles', 'web'), 'ghost')
  assert.deepEqual(removed, [])
})

test('purgeSettingsNamespace：匹配插件名/短名/loader 行 id 并清空', async () => {
  const registered = new Map()
  const settings = {
    describe: () => [
      { ns: 'demo-plugin' }, { ns: 'pet-thing' }, { ns: 'unrelated' },
    ],
    replace: async (ns, section) => { registered.set(ns, section) },
  }
  const cleared = await purgeSettingsNamespace(settings, '@scope/demo-plugin', ['pet-thing'])
  assert.deepEqual(cleared.sort(), ['demo-plugin', 'pet-thing'])
  assert.deepEqual([...registered.keys()].sort(), ['demo-plugin', 'pet-thing'])
  assert.deepEqual(registered.get('demo-plugin'), {}) // replace({}) 清空用户覆盖
  assert.equal(registered.has('unrelated'), false)
})

test('purgeSettingsNamespace：settings 缺失时安全返回', async () => {
  assert.deepEqual(await purgeSettingsNamespace(undefined, 'x', []), [])
  assert.deepEqual(await purgeSettingsNamespace({}, 'x', []), [])
})
