// 生成器：.dsh-plugin/client/index.mjs → .dsh-plugin/client.js（bundle 产物，随插件分发）。
// 契约：--check 模式在内存生成后与已提交 .dsh-plugin/client.js 逐字节比对，不一致非零退出——
// 手改生成物禁止（改 client/index.mjs，勿改 client.js）。
// esbuild 经 .bin CLI 调用（解析顺序：本地 node_modules/.bin → DSH_CHECKOUT →
// 已安装兄弟插件（gal-view 自带 esbuild）→ npm 全局）；'react' 保持 external
// （运行时经 __ModuleLoader__ 模块表解析），JSX 用经典转换（React.createElement）。
import { spawnSync } from 'node:child_process'
import { mkdtempSync, readFileSync, writeFileSync, statSync, existsSync, readdirSync } from 'node:fs'
import { tmpdir, homedir } from 'node:os'
import { join, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'

const ROOT = resolve(import.meta.dirname, '..')
const ENTRY = '.dsh-plugin/client/index.mjs'
const OUTPUT = join(ROOT, '.dsh-plugin', 'client.js')

function resolveEsbuildBin() {
  const candidates = [
    join(ROOT, 'node_modules/.bin/esbuild'),
    ...(process.env.DSH_CHECKOUT ? [join(process.env.DSH_CHECKOUT, 'node_modules/.bin/esbuild')] : []),
    // 已安装的兄弟插件自带 esbuild（gal-view devDeps）——开发机便利候选。
    ...scanSiblingPlugins(),
    // npm 全局（AppData/Roaming/npm 下可能以版本目录形式存在）。
    join(homedir(), 'AppData/Roaming/npm/esbuild.cmd'),
  ]
  for (const p of candidates) {
    try {
      if (p !== null && statSync(p).isFile()) return p
    } catch {
      // 下一个候选
    }
  }
  return null
}

/** 扫描 ~/.dsh/profiles 下各 profile 插件自带的 esbuild（gal-view 等自带 devDeps）。 */
function scanSiblingPlugins() {
  const out = []
  const home = process.env.DSH_HOME ?? join(homedir(), '.dsh')
  const profiles = join(home, 'profiles')
  try {
    for (const profile of readdirSafe(profiles)) {
      const modules = join(profiles, profile, 'node_modules')
      for (const pkg of readdirSafe(modules)) {
        const cand = join(modules, pkg, 'node_modules', '.bin', 'esbuild')
        if (existsSync(cand)) out.push(cand)
      }
    }
  } catch {
    // 扫描失败不影响其余候选
  }
  return out
}

function readdirSafe(dir) {
  try { return readdirSync(dir) } catch { return [] }
}

/** esbuild 是否可用（自证测试据此决定跳过）。 */
export function esbuildAvailable() {
  return resolveEsbuildBin() !== null
}

/**
 * 生成 client.js（官方 `__ModuleLoader__.load` 契约：factory 返回 { name, inject, apply }）。
 * @param {{ check?: boolean, root?: string }} opts
 * @returns {{ ok: boolean, errors?: string[], skipped?: string }}
 */
export function generate({ check = false, root = ROOT } = {}) {
  const esbuildBin = resolveEsbuildBin()
  if (esbuildBin === null) {
    return { ok: true, skipped: 'esbuild 不可用：项目内 pnpm install 安装 devDependencies，或设置 DSH_CHECKOUT 指向 dsh checkout' }
  }
  const tmpDir = mkdtempSync(join(tmpdir(), 'plugin-manager-'))
  const tmpOut = join(tmpDir, 'client.js')
  const res = spawnSync(
    esbuildBin,
    [
      ENTRY,
      '--bundle',
      '--format=cjs',
      '--platform=browser',
      '--target=es2020',
      '--external:react',
      '--jsx=transform',
      '--jsx-factory=React.createElement',
      '--jsx-fragment=React.Fragment',
      `--outfile=${tmpOut}`,
    ],
    // Windows 上 esbuild 命中 .cmd shim 时需 shell 执行（CVE-2024-27980 硬化后 spawn 拒绝）。
    { cwd: root, encoding: 'utf8', shell: process.platform === 'win32' },
  )
  if (res.status !== 0) {
    const detail = (res.error !== undefined ? String(res.error?.message ?? res.error) + '\n' : '')
      + String(res.stderr ?? '')
    return { ok: false, errors: [`esbuild 失败（exit ${res.status}）：${detail.trim()}`] }
  }
  const body = readFileSync(tmpOut, 'utf8')
  const code = Buffer.from(
    `window.__ModuleLoader__.load({\n`
    + `\tid: "plugin-manager",\n`
    + `\tfactory: (require) => {\n`
    + `\t\tvar module = { exports: {} };\n`
    + `\t\tvar exports = module.exports;\n`
    + body.replace(/\n$/, '')
    + `\n\t\treturn module.exports;\n`
    + `\t}\n`
    + `});\n`,
  )
  const outputPath = join(root, '.dsh-plugin', 'client.js')
  if (!check) {
    writeFileSync(outputPath, code)
    return { ok: true }
  }
  let committed = null
  try {
    committed = readFileSync(outputPath)
  } catch {
    return { ok: false, errors: [`${outputPath} 不存在：运行 node scripts/build-client.mjs 生成`] }
  }
  if (Buffer.compare(committed, code) !== 0) {
    return { ok: false, errors: ['client.js 与生成器输出不一致：运行 node scripts/build-client.mjs 重新生成（手改生成物禁止）'] }
  }
  return { ok: true }
}

// CLI 入口（被 import 时不执行）。
if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const check = process.argv.includes('--check')
  const result = generate({ check })
  if (result.skipped !== undefined) {
    console.log(`[build-client] SKIP：${result.skipped}`)
    process.exit(0)
  }
  if (!result.ok) {
    for (const e of result.errors ?? []) console.error(`[build-client] ${e}`)
    process.exit(1)
  }
  console.log(check ? '[build-client] client.js 新鲜（--check OK）' : '[build-client] client.js 已生成')
}
