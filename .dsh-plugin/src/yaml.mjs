// 最小 YAML 子集解析/序列化——专用于 cordis.patch.yml 的 loader 补丁条目。
// 支持：注释行、顶层 `- ` 列表项、嵌套缩进 map、嵌套 `- ` 列表、标量
// （null/~/空、true/false、数字、单/双引号字符串、普通字符串、行尾注释）。
// 不支持（解析失败即抛错，调用方拒绝编辑）：`!!js` 标签、多行字符串、锚点/别名、
// 流式集合（{a: 1} / [1,2] 内联）。解析失败绝不部分写入——保持用户文件安全。

/**
 * 解析补丁文件文本。
 * @param {string} text - 文件原文。
 * @returns {{ header: string[], entries: object[] }} header=文件头部注释/空行（原样保留），entries=顶层条目。
 * @throws {Error} 遇到无法解析的语法。
 */
export function parseEntries(text) {
  const lines = String(text).split(/\r?\n/)
  // 头部：首个内容行之前的注释/空行（原样保留，序列化时原样写回）。
  const header = []
  let i = 0
  while (i < lines.length) {
    const trimmed = lines[i].trim()
    if (trimmed === '' || trimmed.startsWith('#')) { header.push(lines[i]); i += 1; continue }
    break
  }
  // 结尾换行产生的末尾空行不算头部内容。
  while (header.length > 0 && header[header.length - 1] === '') header.pop()
  const body = lines.slice(i)
  const content = []
  for (const line of body) {
    const trimmed = line.trim()
    if (trimmed === '' || trimmed.startsWith('#')) continue
    content.push({ indent: (line.match(/^ */) ?? [''])[0].length, text: trimmed })
  }
  if (content.length === 0) return { header, entries: [] }
  // 空列表标记 `[]`（可带行尾注释）。
  if (content[0].text.startsWith('[]')) {
    if (content.length > 1) throw new Error(`列表标记 [] 后存在无法解析的内容: ${content[1].text}`)
    return { header, entries: [] }
  }
  const base = content[0].indent
  if (base !== 0) throw new Error(`顶层条目缩进异常: ${content[0].text}`)
  if (!content[0].text.startsWith('- ')) throw new Error(`顶层条目必须以 "- " 开头: ${content[0].text}`)
  const value = parseNode(content, base)
  if (!Array.isArray(value)) throw new Error('补丁文件顶层必须是列表')
  return { header, entries: value }
}

/** 解析一个块（map 或 list），lines 全部缩进 >= base 且 lines[0].indent === base。 */
function parseNode(lines, base) {
  if (lines[0].text.startsWith('- ')) return parseList(lines, base)
  return parseMap(lines, base)
}

/** 解析 map：`key: value` 或 `key:` + 更深缩进的子块。 */
function parseMap(lines, base) {
  const out = {}
  let i = 0
  while (i < lines.length) {
    const line = lines[i]
    if (line.indent !== base) throw new Error(`缩进错误: ${line.text}`)
    const m = /^([A-Za-z0-9_.@/-]+):(?:\s*(.*))?$/.exec(line.text)
    if (m === null) throw new Error(`不支持的键值语法: ${line.text}`)
    const key = m[1]
    const rest = (m[2] ?? '').trim()
    if (rest !== '') {
      out[key] = parseScalar(rest)
      i += 1
      continue
    }
    let j = i + 1
    const sub = []
    while (j < lines.length && lines[j].indent > base) { sub.push(lines[j]); j += 1 }
    if (sub.length === 0) out[key] = null
    else out[key] = parseNode(sub, sub[0].indent)
    i = j
  }
  return out
}

/** 解析列表：`- ` 开头的条目，条目值可为标量 / 内联 map / 子块。 */
function parseList(lines, base) {
  const out = []
  let i = 0
  while (i < lines.length) {
    const line = lines[i]
    if (line.indent !== base) throw new Error(`缩进错误: ${line.text}`)
    if (!line.text.startsWith('- ')) throw new Error(`列表项必须以 "- " 开头: ${line.text}`)
    const rest = line.text.slice(2).trim()
    if (rest === '') {
      let j = i + 1
      const sub = []
      while (j < lines.length && lines[j].indent > base) { sub.push(lines[j]); j += 1 }
      out.push(sub.length === 0 ? null : parseNode(sub, sub[0].indent))
      i = j
      continue
    }
    const m = /^([A-Za-z0-9_.@/-]+):(?:\s*(.*))?$/.exec(rest)
    if (m !== null) {
      // 内联 map 条目：把该行作为首键，续行（缩进更深）作为子块。
      const pseudo = [{ indent: base + 2, text: rest }]
      let j = i + 1
      while (j < lines.length && lines[j].indent > base) { pseudo.push(lines[j]); j += 1 }
      out.push(parseMap(pseudo, base + 2))
      i = j
      continue
    }
    out.push(parseScalar(rest))
    i += 1
  }
  return out
}

/** 标量解析：null/布尔/数字/引号字符串/普通字符串（含行尾注释剥离）。
 * 拒绝 YAML 标签（!!js）、流式集合（{...}/[...]）、锚点/别名（&/*）——
 * 无法安全往返的语法一律拒绝编辑，防语义损坏。 */
export function parseScalar(raw) {
  const s = String(raw).trim()
  if (s === '' || s === '~' || s === 'null') return null
  if (s === 'true') return true
  if (s === 'false') return false
  if (/^-?\d+$/.test(s)) return Number(s)
  if (/^-?\d+\.\d+$/.test(s)) return Number(s)
  if (s.length >= 2 && s.startsWith("'") && s.endsWith("'")) {
    return s.slice(1, -1).replace(/''/g, "'")
  }
  if (s.length >= 2 && s.startsWith('"') && s.endsWith('"')) {
    const inner = s.slice(1, -1)
    if (/\\/.test(inner)) throw new Error(`无法解析的标量语法（双引号转义不支持）: ${s}`)
    return inner
  }
  if (/^!!/.test(s) || /^[{\[]/.test(s) || /^[&*]/.test(s)) {
    throw new Error(`无法解析的标量语法（不支持标签/流式集合/锚点）: ${s}`)
  }
  const hash = s.indexOf(' #')
  return hash === -1 ? s : s.slice(0, hash).trimEnd()
}

/** 标量序列化：仅在歧义时加单引号（'' 转义）——含引号字符、冒号+空格、注释风险、
 * 首尾空格、关键字、特殊开头字符；其余（含中文、`github:...#main` 等）原样输出。 */
export function serializeScalar(value) {
  if (value === null || value === undefined) return 'null'
  if (typeof value === 'boolean') return value ? 'true' : 'false'
  if (typeof value === 'number') return Number.isFinite(value) ? String(value) : 'null'
  const s = String(value)
  if (s === '') return "''"
  const keyword = /^(true|false|null|~)$/i.test(s)
  const leading = /^[-?:,[\]{}#&*!|>'"%@`]/.test(s)
  const risky = /["']|: | #|^ | $/.test(s)
  if (!keyword && !leading && !risky) return s
  return `'${s.replace(/'/g, "''")}'`
}

/**
 * 序列化补丁文件：头部注释原样 + 条目列表。entries 为空时输出 `[]`。
 * @param {string[]} header - 头部行（含原始缩进）。
 * @param {object[]} entries - 顶层条目（每个必须是 map）。
 * @returns {string} 完整文件文本（末尾换行）。
 */
export function serializeEntries(header, entries) {
  const lines = [...header]
  if (entries.length === 0) {
    if (!lines.some(line => line.trim() === '[]')) lines.push('[]')
    return lines.join('\n') + '\n'
  }
  for (const entry of entries) {
    if (entry === null || typeof entry !== 'object' || Array.isArray(entry)) {
      throw new Error('补丁条目必须是 map')
    }
    writeMap(lines, entry, 0, true)
  }
  return lines.join('\n') + '\n'
}

/** map → 行。asItem=true 时该 map 是列表项（首个键带 `- `，其余 `  `）；否则键对齐 indent。 */
function writeMap(lines, map, indent, asItem = false) {
  const pad = ' '.repeat(indent)
  const keys = Object.keys(map)
  keys.forEach((key, idx) => {
    const lead = asItem ? (idx === 0 ? '- ' : '  ') : ''
    // 值块（map/list）缩进 = 键列 + 2。
    const keyCol = indent + lead.length
    const value = map[key]
    if (value === null || value === undefined) {
      lines.push(pad + lead + key + ': null')
    } else if (Array.isArray(value)) {
      if (value.length === 0) lines.push(pad + lead + key + ': []')
      else { lines.push(pad + lead + key + ':'); writeList(lines, value, keyCol + 2) }
    } else if (typeof value === 'object') {
      if (Object.keys(value).length === 0) lines.push(pad + lead + key + ': {}')
      else { lines.push(pad + lead + key + ':'); writeMap(lines, value, keyCol + 2, false) }
    } else {
      lines.push(pad + lead + key + ': ' + serializeScalar(value))
    }
  })
}

/** list → 行（`- ` 前缀；嵌套递归）。 */
function writeList(lines, list, indent) {
  const pad = ' '.repeat(indent)
  for (const item of list) {
    if (item === null || item === undefined) {
      lines.push(pad + '- null')
    } else if (Array.isArray(item)) {
      if (item.length === 0) lines.push(pad + '- []')
      else { lines.push(pad + '-'); writeList(lines, item, indent + 2) }
    } else if (typeof item === 'object') {
      writeMap(lines, item, indent, true)
    } else {
      lines.push(pad + '- ' + serializeScalar(item))
    }
  }
}
