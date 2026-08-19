// 安装指令解析：只接受固定格式 `dsh plugin [--profile <name>] add <plugin>`。
// 目的：稳定 + 安全——插件源走白名单正则（npm 包名 / github: / 本地绝对路径），
// 拒绝任何含空格/引号/shell 元字符的输入（防注入与误操作）。
// --profile 可省略：缺省时由调用方决定目标（UI 当前选中的 profile，缺省 = 当前运行 profile）；
// 显式给出时以命令为准（覆盖 UI 选择）。

/** npm 包名（官方规则简化：小写、可选 @scope/、字母数字.-_~）。 */
const NPM_NAME = /^(@[a-z0-9-~][a-z0-9-._~]*\/)?[a-z0-9-~][a-z0-9-._~]*$/

/** github:owner/repo#branch（branch 可省）。 */
const GITHUB_SPEC = /^github:[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+(?:#[A-Za-z0-9_.\/-]+)?$/

/** 本地绝对路径（可选 file:/link: 前缀；Windows 盘符或 UNC 或 POSIX 根）。 */
const LOCAL_PATH = /^(file:|link:)?(([A-Za-z]:[\\/][^\s]*)|(\\\\[^\s]+)|(\/[^\s]*))$/

/** 命令格式：--profile 可选。 */
const COMMAND = /^dsh\s+plugin\s+(?:--profile\s+([a-z][a-z0-9-]*)\s+)?add\s+(.+)$/

/** profile 名（kebab-case，与 profiles.mjs 一致）。 */
const PROFILE_NAME = /^[a-z][a-z0-9-]*$/

/**
 * 校验插件源格式。
 * @param {string} spec - 插件源（去空格后）。
 * @returns {string | null} 非法时返回原因，合法返回 null。
 */
export function validateSpecFormat(spec) {
  if (typeof spec !== 'string' || spec === '') return '插件源不能为空'
  if (spec.length > 512) return '插件源过长'
  if (/\s/.test(spec)) return '插件源不能包含空格（格式：dsh plugin [--profile <name>] add <plugin>）'
  if (NPM_NAME.test(spec)) return null
  if (GITHUB_SPEC.test(spec)) return null
  if (LOCAL_PATH.test(spec)) return null
  return '插件源格式不支持：应为 npm 包名、github:owner/repo#branch 或本地绝对路径'
}

/**
 * 解析安装指令（固定格式）。
 * @param {string} command - 形如 `dsh plugin --profile web add picocolors` 或 `dsh plugin add picocolors`。
 * @returns {{ ok: true, profile: string | null, spec: string } | { ok: false, error: string }}
 *          profile 为 null 表示命令未指定（由调用方回退到 UI 选择/当前运行 profile）。
 */
export function parseInstallCommand(command) {
  if (typeof command !== 'string' || command.trim() === '') {
    return { ok: false, error: '请输入安装指令（格式：dsh plugin [--profile <name>] add <plugin>）' }
  }
  const match = COMMAND.exec(command.trim())
  if (match === null) {
    return { ok: false, error: '指令格式不正确，应为：dsh plugin [--profile <name>] add <plugin>' }
  }
  const profile = match[1] ?? null
  const spec = match[2].trim()
  if (profile !== null && !PROFILE_NAME.test(profile)) {
    return { ok: false, error: `profile 名 "${profile}" 非法（须为小写字母开头的 kebab-case）` }
  }
  const specError = validateSpecFormat(spec)
  if (specError !== null) return { ok: false, error: specError }
  return { ok: true, profile, spec }
}
