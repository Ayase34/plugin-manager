// 插件清单构建：读 profile 的 package.json（dependencies + dsh.profile.bundles）、
// node_modules 中各包的实际 manifest、以及用户层 cordis.patch.yml 的启用/禁用覆盖。
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { parseEntries } from './yaml.mjs'
import { readManifest, resolveDependencyDir } from './reconcile.mjs'

/** 读用户层补丁（cordis.patch.yml）。解析失败时 error 非空（清单仍可用，禁用推断为猜测）。 */
export function readUserPatch(profileDir) {
  const path = join(profileDir, 'cordis.patch.yml')
  try {
    const { header, entries } = parseEntries(readFileSync(path, 'utf8'))
    return { header, entries, error: null }
  } catch (error) {
    return { header: [], entries: [], error: String(error?.message ?? error) }
  }
}

/** 从 bundle 包的补丁文件提取 loader 行 id（insert 行的 id ?? name）。 */
export function collectRowIds(packageDir, pkg) {
  const patchRel = pkg?.dsh?.bundle?.patch
  if (typeof patchRel !== 'string' || patchRel === '') return []
  try {
    const { entries } = parseEntries(readFileSync(join(packageDir, patchRel), 'utf8'))
    const ids = []
    for (const entry of entries) {
      if (entry === null || typeof entry !== 'object') continue
      if (Array.isArray(entry.insert)) {
        for (const row of entry.insert) {
          if (row !== null && typeof row === 'object') {
            const id = typeof row.id === 'string' ? row.id : (typeof row.name === 'string' ? row.name : null)
            if (id !== null && id !== '') ids.push(id)
          }
        }
      } else if (typeof entry.id === 'string' && entry.id !== '') {
        ids.push(entry.id)
      }
    }
    return ids
  } catch {
    return []
  }
}

/** 描述一个已安装包。无法解析 manifest 时返回 null（依赖存在但未安装的异常态）。 */
function describePlugin(profileDir, name, opts) {
  const dir = resolveDependencyDir(profileDir, name)
  if (dir === undefined) return null
  let pkg = null
  try { pkg = JSON.parse(readFileSync(join(dir, 'package.json'), 'utf8')) } catch { /* 保持 null */ }
  const rowIds = collectRowIds(dir, pkg)
  const primaryId = rowIds.length > 0 ? rowIds[0] : name
  const enabled = !opts.disabledIds.has(primaryId)
  const repository = pkg?.repository
  return {
    name,
    spec: opts.spec ?? null,
    version: pkg?.version ?? null,
    description: pkg?.description ?? null,
    license: pkg?.license ?? null,
    path: dir,
    isBundle: opts.isBundle,
    isSystem: opts.isSystem,
    isSelf: name === opts.selfName,
    dshBundle: pkg?.dsh?.bundle?.patch !== undefined,
    dshClient: pkg?.dsh?.client !== undefined,
    clientPlatform: pkg?.dsh?.client?.platform ?? null,
    rowIds,
    enabled,
    enabledGuess: rowIds.length === 0,
    dependencies: Object.keys(pkg?.dependencies ?? {}),
    repository: typeof repository === 'string' ? repository : (repository?.url ?? null),
  }
}

/**
 * 构建当前 profile 的插件清单。
 * @param {string} profileDir - profile 目录。
 * @param {string} [selfName] - 本插件名（用于 isSelf 标记）。
 * @returns {{ profile: object, plugins: object[] }}
 */
export function inventoryFor(profileDir, selfName = 'plugin-manager') {
  const manifest = readManifest(profileDir)
  const dependencies = manifest.dependencies ?? {}
  const bundles = manifest.dsh?.profile?.bundles ?? []
  const patch = readUserPatch(profileDir)
  const disabledIds = new Set(
    patch.entries
      .filter(entry => entry !== null && typeof entry === 'object' && entry.disabled === true)
      .map(entry => entry.id)
      .filter(id => typeof id === 'string' && id !== ''),
  )
  const plugins = []
  const seen = new Set()
  // bundle 层优先（展示顺序 = 加载顺序）。
  for (const name of bundles) {
    if (seen.has(name)) continue
    const info = describePlugin(profileDir, name, {
      spec: dependencies[name] ?? null,
      isBundle: true,
      isSystem: !(name in dependencies),
      disabledIds,
      selfName,
    })
    if (info !== null) { plugins.push(info); seen.add(name) }
  }
  // 其余依赖。
  for (const [name, spec] of Object.entries(dependencies)) {
    if (seen.has(name)) continue
    const info = describePlugin(profileDir, name, {
      spec,
      isBundle: false,
      isSystem: false,
      disabledIds,
      selfName,
    })
    if (info !== null) { plugins.push(info); seen.add(name) }
  }
  return {
    profile: {
      name: manifest.name ?? 'unknown',
      dir: profileDir,
      bundles,
      patchError: patch.error,
    },
    plugins,
  }
}
