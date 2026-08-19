// yaml.mjs 子集解析/序列化测试。
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { parseEntries, serializeEntries, parseScalar, serializeScalar } from '../.dsh-plugin/src/yaml.mjs'

test('空文件/纯注释', () => {
  const { header, entries } = parseEntries('# 注释\n\n# 第二行\n')
  assert.deepEqual(header, ['# 注释', '', '# 第二行'])
  assert.deepEqual(entries, [])
  assert.equal(serializeEntries(header, []), '# 注释\n\n# 第二行\n[]\n')
})

test('空列表标记 []', () => {
  const { header, entries } = parseEntries('# Your patch layer\n[]\n')
  assert.deepEqual(header, ['# Your patch layer'])
  assert.deepEqual(entries, [])
})

test('简单条目 parse/serialize 往返', () => {
  const text = '# 头\n- id: whale-girl\n  disabled: true\n- id: foo\n'
  const { header, entries } = parseEntries(text)
  assert.deepEqual(header, ['# 头'])
  assert.deepEqual(entries, [{ id: 'whale-girl', disabled: true }, { id: 'foo' }])
  assert.equal(serializeEntries(header, entries), text)
})

test('嵌套 map 与 list', () => {
  const text = [
    '- id: demo',
    '  config:',
    '    pollMs: 3000',
    '    enabled: false',
    '    note: 你好 world',
    '    list:',
    '      - a',
    '      - 2',
  ].join('\n') + '\n'
  const { entries } = parseEntries(text)
  assert.deepEqual(entries, [{
    id: 'demo',
    config: { pollMs: 3000, enabled: false, note: '你好 world', list: ['a', 2] },
  }])
  assert.equal(serializeEntries([], entries), text)
})

test('引号字符串与特殊字符', () => {
  assert.equal(parseScalar("'it''s'"), "it's")
  assert.equal(parseScalar('"quoted"'), 'quoted')
  assert.equal(parseScalar('true'), true)
  assert.equal(parseScalar('null'), null)
  assert.equal(parseScalar('~'), null)
  assert.equal(parseScalar('3.14'), 3.14)
  assert.equal(parseScalar('github:Ayase34/gal-view#main'), 'github:Ayase34/gal-view#main')
  assert.equal(parseScalar('abc # 注释'), 'abc')
  assert.equal(serializeScalar('github:Ayase34/gal-view#main'), 'github:Ayase34/gal-view#main')
  assert.equal(serializeScalar('你好 world'), '你好 world')
  assert.equal(serializeScalar('a: b'), "'a: b'")
  assert.equal(serializeScalar("it's"), "'it''s'")
  assert.equal(serializeScalar(42), '42')
  assert.equal(serializeScalar(null), 'null')
})

test('行尾注释剥离', () => {
  const { entries } = parseEntries('- id: a # 行尾注释\n')
  assert.deepEqual(entries, [{ id: 'a' }])
})

test('复杂语法拒绝（!!js / 流式集合 / 未知结构）', () => {
  assert.throws(() => parseEntries('- id: a\n  x: !!js foo\n'), /无法解析/)
  assert.throws(() => parseEntries('- id: a\n  x: {a: 1}\n'), /无法解析/)
  assert.throws(() => parseEntries('a: b\n'), /顶层条目必须以/)
})

test('数组条目序列化（insert 结构）', () => {
  const entries = [{ insert: [{ id: 'plugin-manager', name: 'plugin-manager' }] }]
  const text = serializeEntries(['# head'], entries)
  assert.equal(text, '# head\n- insert:\n    - id: plugin-manager\n      name: plugin-manager\n')
  const { entries: back } = parseEntries(text)
  assert.deepEqual(back, entries)
})
