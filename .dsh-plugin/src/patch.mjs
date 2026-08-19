// 启用/禁用：写用户层 cordis.patch.yml 的 id-targeted `disabled` 覆盖。
// 该文件被宿主 watchUserPatches 监控——改动实时生效（无需重启 web）。
// 安全：解析失败（含 !!js 等复杂语法）一律拒绝编辑，绝不部分写入。
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { parseEntries, serializeEntries } from './yaml.mjs'

export const USER_PATCH_FILENAME = 'cordis.patch.yml'

/** 默认文件头（profile 由官方初始化，通常已存在；缺失时兜底创建）。 */
const DEFAULT_HEADER = [
  '# Your patch layer for this dsh profile, applied after every bundle layer:',
  '# a top-level YAML array of loader patch entries (id-targeted config',
  '# overrides, disables, and insert lists; `!!js` expressions allowed).',
]

/**
 * 设置某 loader 行的启用状态。
 * @param {string} profileDir - profile 目录。
 * @param {string} rowId - loader 行 id（来自 bundle 补丁的 insert id）。
 * @param {boolean} disabled - 是否禁用。
 * @returns {{ action: 'disabled' | 'enabled', rowId: string }}
 * @throws {Error} 补丁含无法解析的语法（拒绝编辑）。
 */
export function setDisabled(profileDir, rowId, disabled) {
  if (typeof rowId !== 'string' || rowId === '') throw new Error('rowId 无效')
  const path = join(profileDir, USER_PATCH_FILENAME)
  let header = DEFAULT_HEADER
  let entries = []
  if (existsSync(path)) {
    const parsed = parseEntries(readFileSync(path, 'utf8')) // 复杂语法 → 抛错拒绝
    header = parsed.header
    entries = parsed.entries
  }
  // 同 id 的覆盖条目（键 ⊆ id/config/disabled/order/priority）合并为一条；
  // 含未知键的条目（如 insert）原样保留——loader 按序应用，语义不变。
  const OVERRIDE_KEYS = new Set(['id', 'config', 'disabled', 'order', 'priority'])
  const rest = []
  let merged = null
  for (const entry of entries) {
    if (entry !== null && typeof entry === 'object' && entry.id === rowId
      && Object.keys(entry).every(key => OVERRIDE_KEYS.has(key))) {
      merged = { ...(merged ?? {}), ...entry }
      continue
    }
    rest.push(entry)
  }
  if (!disabled) {
    // 启用：移除 disabled 键；只剩 id 的残壳直接丢弃。
    if (merged !== null) {
      const keep = { ...merged }
      delete keep.disabled
      if (Object.keys(keep).length > 1) rest.push(keep)
    }
    writeFileSync(path, serializeEntries(header, rest))
    return { action: 'enabled', rowId }
  }
  rest.push({ id: rowId, ...(merged ?? {}), disabled: true })
  writeFileSync(path, serializeEntries(header, rest))
  return { action: 'disabled', rowId }
}

/** 卸载后清理：移除已卸载插件的孤儿 disabled 覆盖（保持补丁干净）。 */
export function removeOverrides(profileDir, rowIds) {
  if (!Array.isArray(rowIds) || rowIds.length === 0) return false
  const path = join(profileDir, USER_PATCH_FILENAME)
  if (!existsSync(path)) return false
  const parsed = parseEntries(readFileSync(path, 'utf8'))
  const target = new Set(rowIds)
  const rest = parsed.entries.filter(
    entry => !(entry !== null && typeof entry === 'object'
      && typeof entry.id === 'string' && target.has(entry.id) && 'disabled' in entry),
  )
  if (rest.length === parsed.entries.length) return false
  writeFileSync(path, serializeEntries(parsed.header, rest))
  return true
}
