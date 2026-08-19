// command.mjs 测试：固定格式安装指令解析与插件源校验。
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { parseInstallCommand, validateSpecFormat } from '../.dsh-plugin/src/command.mjs'

test('合法指令：npm 包名 / scope 包 / github / 本地路径', () => {
  assert.deepEqual(parseInstallCommand('dsh plugin --profile web add picocolors'), {
    ok: true, profile: 'web', spec: 'picocolors',
  })
  assert.deepEqual(parseInstallCommand('dsh plugin --profile desktop add @scope/pkg-name'), {
    ok: true, profile: 'desktop', spec: '@scope/pkg-name',
  })
  assert.deepEqual(parseInstallCommand('dsh plugin --profile web add github:Ayase34/gal-view#main'), {
    ok: true, profile: 'web', spec: 'github:Ayase34/gal-view#main',
  })
  assert.deepEqual(parseInstallCommand('dsh plugin --profile web add C:/Users/me/plugin'), {
    ok: true, profile: 'web', spec: 'C:/Users/me/plugin',
  })
  assert.deepEqual(parseInstallCommand('dsh plugin --profile web add link:C:/Users/me/plugin'), {
    ok: true, profile: 'web', spec: 'link:C:/Users/me/plugin',
  })
})

test('合法指令：省略 --profile（回退当前 profile）', () => {
  assert.deepEqual(parseInstallCommand('dsh plugin add picocolors'), {
    ok: true, profile: null, spec: 'picocolors',
  })
  assert.deepEqual(parseInstallCommand('dsh plugin add github:Ayase34/gal-view#main'), {
    ok: true, profile: null, spec: 'github:Ayase34/gal-view#main',
  })
})

test('非法指令格式拒绝', () => {
  for (const cmd of [
    '',
    'pnpm add picocolors',
    'dsh --profile web add picocolors',
    'dsh plugin --profile web install picocolors',
    'dsh plugin --profile web add picocolors extra',
    'dsh plugin --profile Web add picocolors',
    'dsh plugin --profile node_modules add picocolors',
  ]) {
    const r = parseInstallCommand(cmd)
    assert.equal(r.ok, false, `应当拒绝: ${cmd}`)
  }
})

test('插件源格式白名单', () => {
  assert.equal(validateSpecFormat('picocolors'), null)
  assert.equal(validateSpecFormat('@deepseek-ai/dsh-base'), null)
  assert.equal(validateSpecFormat('github:user/repo#main'), null)
  assert.equal(validateSpecFormat('C:\\Users\\me\\plugin'), null)
  assert.equal(validateSpecFormat('file:C:/Users/me/plugin'), null)
  assert.equal(validateSpecFormat('link:/Users/me/plugin'), null)
  // 非法：空格/引号/shell 元字符/协议注入
  for (const bad of [
    'picocolors && rm -rf /',
    'picocolors; rm -rf /',
    '"picocolors"',
    "'picocolors'",
    'https://evil.com/x',
    'git+https://evil.com/x.git',
    'picocolors --save-dev',
    '$(whoami)',
    'a b',
    '..\\..\\etc',
    'npm:picocolors',
  ]) {
    assert.notEqual(validateSpecFormat(bad), null, `应当拒绝: ${bad}`)
  }
})

test('空/超长/控制字符', () => {
  assert.notEqual(validateSpecFormat(''), null)
  assert.notEqual(validateSpecFormat('   '), null)
  assert.notEqual(validateSpecFormat('a'.repeat(513)), null)
  assert.notEqual(validateSpecFormat('pico\x00colors'), null)
})
