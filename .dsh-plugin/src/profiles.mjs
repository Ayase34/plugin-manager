// 多 profile 管理：列出/新建 profile（浏览各 profile 的插件与 bundle 层）。
// 扫描 DSH_HOME/profiles/*，排除官方模块回退目录（profiles/node_modules）。
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { readUserPatch } from './inventory.mjs'

/** profile 名约束：小写字母开头、kebab-case（与官方 settings namespace 风格一致）。 */
export const PROFILE_NAME_PATTERN = /^[a-z][a-z0-9-]*$/

/** 官方模板 bundle（web/desktop 等 profile 的默认层栈）。 */
export const DEFAULT_BUNDLES = ['@deepseek-ai/dsh-base', '@deepseek-ai/dsh-web-app']

/** 新建 profile 的默认用户层头部（与 patch.mjs 一致）。 */
const DEFAULT_HEADER = [
  '# Your patch layer for this dsh profile, applied after every bundle layer:',
  '# a top-level YAML array of loader patch entries (id-targeted config',
  '# overrides, disables, and insert lists; `!!js` expressions allowed).',
]

/**
 * 列出全部 profile（当前 profile 排最前）。
 * @param {string} dshHome - DSH_HOME。
 * @param {string} currentDir - 当前 profile 目录（用于 isCurrent 标记）。
 * @returns {object[]}
 */
export function listProfiles(dshHome, currentDir) {
  const profilesDir = join(dshHome, 'profiles')
  const out = []
  let names = []
  try { names = readdirSync(profilesDir) } catch { return [] }
  for (const name of names) {
    if (name === 'node_modules') continue // 官方模块回退目录，不是 profile
    const dir = join(profilesDir, name)
    if (!existsSync(join(dir, 'package.json'))) continue
    let manifest = null
    try { manifest = JSON.parse(readFileSync(join(dir, 'package.json'), 'utf8')) } catch { /* 保持 null */ }
    out.push({
      name,
      dir,
      manifestName: manifest?.name ?? null,
      bundles: manifest?.dsh?.profile?.bundles ?? [],
      depCount: Object.keys(manifest?.dependencies ?? {}).length,
      isCurrent: dir === currentDir,
      patchError: readUserPatch(dir).error,
    })
  }
  out.sort((a, b) => {
    if (a.isCurrent !== b.isCurrent) return a.isCurrent ? -1 : 1
    return a.name.localeCompare(b.name)
  })
  return out
}

/**
 * 新建 profile：目录 + package.json（模板 bundles）+ 用户层 + pnpm-workspace.yaml。
 * @param {string} dshHome - DSH_HOME。
 * @param {string} name - profile 名。
 * @returns {{ name: string, dir: string }}
 * @throws {Error} 名称非法/保留名/已存在。
 */
export function createProfile(dshHome, name) {
  if (name === 'node_modules') throw new Error('node_modules 是保留名')
  if (typeof name !== 'string' || !PROFILE_NAME_PATTERN.test(name)) {
    throw new Error('profile 名须为小写字母开头的 kebab-case（字母/数字/连字符）')
  }
  const dir = join(dshHome, 'profiles', name)
  if (existsSync(dir)) throw new Error(`profile ${name} 已存在`)
  mkdirSync(dir, { recursive: true })
  const manifest = {
    name: `dsh-profile-${name}`,
    private: true,
    dependencies: {},
    dsh: { profile: { bundles: [...DEFAULT_BUNDLES] } },
  }
  writeFileSync(join(dir, 'package.json'), JSON.stringify(manifest, undefined, 2) + '\n')
  writeFileSync(join(dir, 'cordis.patch.yml'), DEFAULT_HEADER.join('\n') + '\n[]\n')
  writeFileSync(join(dir, 'pnpm-workspace.yaml'), 'packages:\n  - .\n\nnodeLinker: hoisted\nautoInstallPeers: false\n')
  return { name, dir }
}
