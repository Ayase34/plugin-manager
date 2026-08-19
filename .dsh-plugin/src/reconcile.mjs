// bundle 层 reconcile：安装/卸载/更新后，让 `dsh.profile.bundles` 与已安装依赖保持一致。
// 与官方 apps/cli/src/plugin.ts 的 reconcilePlugins 同语义：
// - 依赖中解析出 `dsh.bundle` 声明的包 → 追加进 bundles（按依赖序）；
// - bundles 中「依赖管理」的条目若依赖被移除或包失去 bundle 声明 → 剔除；
// - 模板 bundle（@deepseek-ai/dsh-base 等，不在 dependencies 中）永不触碰。
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

/** 读取 profile manifest（package.json）。 */
export function readManifest(dir) {
  return JSON.parse(readFileSync(join(dir, 'package.json'), 'utf8'))
}

/** 写回 profile manifest（2 空格缩进 + 尾换行，与官方一致）。 */
export function writeManifest(dir, manifest) {
  writeFileSync(join(dir, 'package.json'), JSON.stringify(manifest, undefined, 2) + '\n')
}

/** 解析一个包的 bundle 补丁声明（无声明返回 undefined）。 */
export function bundlePatchOf(packageDir) {
  try {
    const manifest = JSON.parse(readFileSync(join(packageDir, 'package.json'), 'utf8'))
    const patch = manifest?.dsh?.bundle?.patch
    return typeof patch === 'string' ? patch : undefined
  } catch {
    return undefined
  }
}

/** 从 profile 的 node_modules 解析依赖目录（跟随 junction/symlink）。
 * 先查 profile 本地 node_modules，再查官方模块回退（profiles/node_modules——
 * 系统 bundle 与 in-box 包所在，Node 的父目录查找顺序一致）。 */
export function resolveDependencyDir(profileDir, name) {
  const candidates = [
    join(profileDir, 'node_modules', name),
    join(profileDir, '..', 'node_modules', name),
  ]
  for (const candidate of candidates) {
    if (existsSync(join(candidate, 'package.json'))) return candidate
  }
  return undefined
}

/**
 * 重算 bundle 层。返回变更摘要；无变化时不写盘。
 * @param {string} profileDir - profile 目录。
 * @param {string[]} [beforeDeps] - 操作前的依赖名集合（pnpm 已把移除的依赖删掉，
 *   官方 reconcile 用操作前集合判定「曾是依赖」——缺省时用当前依赖（纯 reconcile）。
 * @returns {{ changed: boolean, added: string[], removed: string[] }}
 */
export function reconcileBundles(profileDir, beforeDeps) {
  const manifest = readManifest(profileDir)
  const dependencies = manifest.dependencies ?? {}
  const before = [...(manifest.dsh?.profile?.bundles ?? [])]
  const bundles = [...before]
  // 1) 依赖中的新 bundle → 追加（保持依赖序）。
  for (const dep of Object.keys(dependencies)) {
    if (bundles.includes(dep)) continue
    const dir = resolveDependencyDir(profileDir, dep)
    if (dir !== undefined && bundlePatchOf(dir) !== undefined) bundles.push(dep)
  }
  // 2) 剔除失去依赖/声明的 bundle。判定「曾是依赖」：操作前集合 ∪ 当前依赖——
  //    刚被 pnpm remove 的 bundle 不在当前依赖里，但仍是依赖管理条目（非模板）。
  const wasDependency = beforeDeps !== undefined
    ? new Set([...beforeDeps, ...Object.keys(dependencies)])
    : new Set(Object.keys(dependencies))
  for (const name of [...bundles]) {
    if (!wasDependency.has(name)) continue // 模板/系统 bundle
    const dir = resolveDependencyDir(profileDir, name)
    if (dir === undefined || bundlePatchOf(dir) === undefined) {
      bundles.splice(bundles.indexOf(name), 1)
    }
  }
  const changed = before.join('\u0000') !== bundles.join('\u0000')
  if (changed) {
    manifest.dsh = { ...manifest.dsh, profile: { ...manifest.dsh?.profile, bundles } }
    writeManifest(profileDir, manifest)
  }
  return {
    changed,
    added: bundles.filter(name => !before.includes(name)),
    removed: before.filter(name => !bundles.includes(name)),
  }
}
