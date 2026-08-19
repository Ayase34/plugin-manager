// patch.mjs 测试：启用/禁用覆盖的写入与清理。
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { mkdtempSync, writeFileSync, readFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { setDisabled, removeOverrides } from '../.dsh-plugin/src/patch.mjs'
import { parseEntries } from '../.dsh-plugin/src/yaml.mjs'

const HEADER = '# Your patch layer for this dsh profile\n# second line\n'

function makeProfile(text = HEADER + '[]\n') {
  const dir = mkdtempSync(join(tmpdir(), 'pm-patch-'))
  writeFileSync(join(dir, 'cordis.patch.yml'), text)
  return dir
}

test('禁用：追加 disabled 覆盖，保留头部', () => {
  const dir = makeProfile()
  const result = setDisabled(dir, 'whale-girl', true)
  assert.equal(result.action, 'disabled')
  const text = readFileSync(join(dir, 'cordis.patch.yml'), 'utf8')
  assert.equal(text, HEADER + '- id: whale-girl\n  disabled: true\n')
})

test('禁用→启用：移除覆盖回到 []，头部保留', () => {
  const dir = makeProfile()
  setDisabled(dir, 'whale-girl', true)
  setDisabled(dir, 'whale-girl', false)
  assert.equal(readFileSync(join(dir, 'cordis.patch.yml'), 'utf8'), HEADER + '[]\n')
})

test('多次禁用同一行：幂等单条覆盖', () => {
  const dir = makeProfile()
  setDisabled(dir, 'a', true)
  setDisabled(dir, 'a', true)
  const { entries } = parseEntries(readFileSync(join(dir, 'cordis.patch.yml'), 'utf8'))
  assert.equal(entries.length, 1)
})

test('互不影响：不同行的覆盖共存', () => {
  const dir = makeProfile()
  setDisabled(dir, 'a', true)
  setDisabled(dir, 'b', true)
  setDisabled(dir, 'a', false)
  const { entries } = parseEntries(readFileSync(join(dir, 'cordis.patch.yml'), 'utf8'))
  assert.deepEqual(entries, [{ id: 'b', disabled: true }])
})

test('保留同行的非 disabled 补丁（如 config 覆盖）', () => {
  const dir = makeProfile(HEADER + '- id: gal-view\n  config:\n    pollMs: 1000\n')
  setDisabled(dir, 'gal-view', true)
  const text = readFileSync(join(dir, 'cordis.patch.yml'), 'utf8')
  assert.match(text, /config:/)
  assert.match(text, /pollMs: 1000/)
  const { entries } = parseEntries(text)
  assert.equal(entries.length, 1)
  assert.equal(entries[0].disabled, true)
  // 再启用：config 覆盖仍在，disabled 移除
  setDisabled(dir, 'gal-view', false)
  const { entries: back } = parseEntries(readFileSync(join(dir, 'cordis.patch.yml'), 'utf8'))
  assert.equal(back.length, 1)
  assert.equal('disabled' in back[0], false)
})

test('复杂 YAML（!!js）拒绝编辑', () => {
  const dir = makeProfile('# x\n- id: a\n  expr: !!js Math.random()\n')
  assert.throws(() => setDisabled(dir, 'a', true), /无法解析/)
  // 文件未被破坏
  assert.match(readFileSync(join(dir, 'cordis.patch.yml'), 'utf8'), /!!js/)
})

test('removeOverrides：清理孤儿覆盖', () => {
  const dir = makeProfile()
  setDisabled(dir, 'gone', true)
  setDisabled(dir, 'keep', true)
  assert.equal(removeOverrides(dir, ['gone']), true)
  const { entries } = parseEntries(readFileSync(join(dir, 'cordis.patch.yml'), 'utf8'))
  assert.deepEqual(entries, [{ id: 'keep', disabled: true }])
  assert.equal(removeOverrides(dir, ['gone']), false)
})
