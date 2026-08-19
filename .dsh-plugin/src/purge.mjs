// 卸载数据清除：删除插件的数据目录（DSH_HOME 级 + profile 级）。
// 注意：这是不可恢复操作——调用方须在 UI 明确警示后使用。
// 浏览器侧数据（localStorage/IndexedDB）与 pnpm 全局缓存不在此范围（见 README）。
import { existsSync, rmSync } from 'node:fs'
import { join } from 'node:path'

/**
 * 删除插件的数据目录。
 * @param {string} dshHome - DSH_HOME。
 * @param {string} profileDir - 目标 profile 目录。
 * @param {string} pluginName - 插件名（数据目录名与包名一致）。
 * @returns {string[]} 实际删除的目录列表。
 */
export function purgePluginData(dshHome, profileDir, pluginName) {
  const removed = []
  const candidates = [
    join(dshHome, 'data', pluginName),
    join(profileDir, 'data', pluginName),
  ]
  for (const dir of candidates) {
    if (!existsSync(dir)) continue
    try {
      rmSync(dir, { recursive: true, force: true })
      removed.push(dir)
    } catch {
      // 删除失败不阻塞卸载
    }
  }
  return removed
}

/**
 * 清理插件注册的 settings namespace 用户覆盖（settings.replace({}) → 回退默认）。
 * ns 匹配宽松：插件名、短名（去掉 scope 前缀）、loader 行 id。
 * @param {object} settings - ctx.get('settings')（可能缺失）。
 * @param {string} pluginName - 插件包名。
 * @param {string[]} rowIds - 插件的 loader 行 id。
 * @returns {Promise<string[]>} 被清理的 namespace。
 */
export async function purgeSettingsNamespace(settings, pluginName, rowIds) {
  if (settings === undefined || typeof settings.describe !== 'function' || typeof settings.replace !== 'function') {
    return []
  }
  const short = pluginName.includes('/') ? pluginName.slice(pluginName.indexOf('/') + 1) : pluginName
  const candidates = new Set([pluginName, short, ...(Array.isArray(rowIds) ? rowIds : [])])
  const cleared = []
  let descriptors = []
  try { descriptors = settings.describe({ redactSecrets: true }) } catch { return [] }
  for (const descriptor of descriptors) {
    if (descriptor === null || typeof descriptor !== 'object') continue
    if (typeof descriptor.ns !== 'string') continue
    if (candidates.has(descriptor.ns)) {
      try {
        await settings.replace(descriptor.ns, {})
        cleared.push(descriptor.ns)
      } catch {
        // 清理失败不阻塞卸载
      }
    }
  }
  return cleared
}
