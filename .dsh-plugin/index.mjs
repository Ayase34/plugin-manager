// plugin-manager Node half：插件管理 API（清单/安装/卸载/更新/启用禁用 + 审计）。
// 契约：官方 bundle 插件形态——仓库根 package.json 声明 dsh.bundle/dsh.client；
// Node half 为完整 Cordis 插件，交互经 webServer 路由；路由端点单一来源 src/routes.mjs。
// 语义：装/卸/更 = 在 profile 目录 spawn pnpm（与官方 `dsh plugin` CLI 同底层），
// 完成后按官方 reconcile 规则维护 dsh.profile.bundles；启/禁用 = 写用户层
// cordis.patch.yml 的 id-targeted disabled 覆盖（宿主 watchUserPatches 热生效，无需重启）。
// 安全：POST 一律 CSRF 校验（跨源拒绝）+ 请求体上限；自插件与系统 bundle 禁卸/禁停。
// 审计：<dshHome>/data/plugin-manager/ops.log（JSONL 追加，跨重启持久）。
import { statSync, existsSync, readFileSync, readdirSync } from 'node:fs'
import { homedir } from 'node:os'
import { join } from 'node:path'
import { appendAudit, auditTail } from './src/audit.mjs'
import { parseInstallCommand } from './src/command.mjs'
import { isCrossOrigin } from './src/csrf.mjs'
import { purgePluginData, purgeSettingsNamespace } from './src/purge.mjs'
import { inventoryFor, collectRowIds } from './src/inventory.mjs'
import { getOp, listOps, startOp } from './src/ops.mjs'
import { removeOverrides, setDisabled } from './src/patch.mjs'
import { createProfile, listProfiles } from './src/profiles.mjs'
import { reconcileBundles, readManifest, resolveDependencyDir } from './src/reconcile.mjs'
import {
  CONFIGS_PATH, CONFIGS_PREFIX, INSTALL_PATH, OPS_PATH, PLUGINS_PATH,
  PROFILE_CREATE_PATH, PROFILE_PLUGINS_PREFIX, PROFILES_PATH,
  TOGGLE_PATH, UNINSTALL_PATH, UPDATE_PATH,
} from './src/routes.mjs'

export const name = 'plugin-manager'
// 注意：只声明 webServer——settings 是可选服务（代码内 ctx.get 条件降级）。
// 把 settings 写进 inject 会让插件在 settings 缺失/注入失败的环境整体挂载失败，
// 表现为「插件列表读不出来」（client tab 在但全部 API 失效）。
export const inject = ['webServer']

/** 本插件包名（自保护）。 */
export const SELF_NAME = 'plugin-manager'

/** 请求体上限（安装源/插件名都很短）。 */
export const BODY_LIMIT = 16384

/** 系统 bundle（模板层，不在 dependencies 中）：禁卸、禁停，防 GUI 自毁。 */
const SYSTEM_BUNDLES = new Set(['@deepseek-ai/dsh-base', '@deepseek-ai/dsh-web-app'])

// profile 目录定位：不能依赖 import.meta.dirname 向上推导——link: 安装时 Node 已跟随
// 符号链接，模块真实路径是开发目录而非 profile。可靠方案：在 DSH_HOME/profiles/* 中
// 查找装有本插件的 profile（其 node_modules 含 plugin-manager 即命中）。
// 多 profile 安装时取 cordis.yml 最近修改者 = 当前运行 profile（boot 每次重写该文件）。
const DSH_HOME = process.env.DSH_HOME ?? join(homedir(), '.dsh')

/** 候选 profile 排序：cordis.yml mtime 新者优先（当前运行 profile 判定）。导出供测试。 */
export function pickCurrentProfile(candidates) {
  const mtimeOf = (dir) => {
    try { return statSync(join(dir, 'cordis.yml')).mtimeMs } catch { return 0 }
  }
  return [...candidates].sort((a, b) => mtimeOf(b) - mtimeOf(a))[0] ?? null
}

function resolveProfileDir() {
  const profiles = join(DSH_HOME, 'profiles')
  const candidates = []
  try {
    for (const name of readdirSync(profiles)) {
      const candidate = join(profiles, name)
      if (!existsSync(join(candidate, 'package.json'))) continue
      if (existsSync(join(candidate, 'node_modules', SELF_NAME))) candidates.push(candidate)
    }
  } catch {
    return { dir: null, error: `无法读取 profile 目录 ${profiles}` }
  }
  if (candidates.length === 0) {
    return { dir: null, error: '未找到装有插件管理器的 profile（node_modules 中缺少 plugin-manager）' }
  }
  return { dir: pickCurrentProfile(candidates), error: null }
}

const PROFILE_RESOLUTION = resolveProfileDir()
const PROFILE_DIR = PROFILE_RESOLUTION.dir
const PROFILE_ERROR = PROFILE_RESOLUTION.error
// 导出供测试/诊断（运行时无副作用）。
export { DSH_HOME, PROFILE_DIR, PROFILE_ERROR }

/** 路由守卫：profile 定位失败时所有端点返回 503（插件继续存在但不做事）。 */
const guardProfile = (handler) => async (req, res) => {
  if (PROFILE_DIR === null) return json(res, 503, { error: PROFILE_ERROR ?? '无法定位 profile' })
  return handler(req, res)
}

function json(res, status, body, extra = {}) {
  res.writeHead(status, { 'content-type': 'application/json; charset=utf-8', ...extra })
  res.end(JSON.stringify(body))
}

/** 读请求体（超限返回 null）。 */
async function readBody(req) {
  let data = ''
  for await (const chunk of req) {
    data += chunk
    if (data.length > BODY_LIMIT) return null
  }
  return data
}

/** 解析 JSON body（失败返回 null）。 */
function parseJson(raw) {
  if (raw === null || raw === undefined) return null
  try {
    const body = JSON.parse(raw)
    return body !== null && typeof body === 'object' && !Array.isArray(body) ? body : null
  } catch {
    return null
  }
}

/** 卸载/禁用保护：返回 null 表示放行，否则返回错误信息。 */
function protectCheck(plugin) {
  if (plugin === null) return '插件不存在或未安装'
  if (plugin.isSelf) return '不能卸载或禁用插件管理器自身（会把自己锁死）'
  if (plugin.isSystem) return '系统 bundle 不可卸载或禁用（GUI 依赖它运行）'
  return null
}

/** 操作成功后的收尾：重算指定 profile 的 bundle 层 + 审计（异常不阻塞操作记录）。 */
function finishOp(record, beforeDeps, profileDir) {
  if (record.status !== 'ok') return
  try {
    reconcileBundles(profileDir, beforeDeps)
    appendAudit(DSH_HOME, record)
  } catch { /* 忽略 */ }
}

/**
 * 解析操作目标 profile 目录：body.profile 缺省 → 当前运行 profile；
 * 指定时校验存在（跨 profile 操作的目的地）。
 * @param {object|null} body - 请求体。
 * @returns {string} 目标 profile 目录。
 * @throws {Error} profile 不存在/非法。
 */
function resolveTargetDir(body) {
  const name = body !== null && typeof body.profile === 'string' && body.profile.trim() !== ''
    ? body.profile.trim()
    : null
  if (name === null) return PROFILE_DIR
  if (name === 'node_modules') throw new Error('node_modules 不是 profile')
  const dir = join(DSH_HOME, 'profiles', name)
  if (!existsSync(join(dir, 'package.json'))) throw new Error(`profile ${name} 不存在`)
  return dir
}

/** 目标 profile 名（body 指定或当前）。 */
function targetName(body, dir) {
  return body !== null && typeof body.profile === 'string' && body.profile.trim() !== '' ? body.profile.trim() : null
}

export function apply(ctx) {
  const webServer = typeof ctx.get === 'function' ? ctx.get('webServer') : undefined
  if (webServer === undefined) return // headless 降级：无 web 服务器时插件无操作面
  ctx.effect(() => {
    const disposers = [
      // ---- 清单：GET /plugin-manager/plugins ----
      webServer.register({
        kind: 'exact',
        path: PLUGINS_PATH,
        handler: guardProfile(async (req, res) => {
          try {
            if (req.method !== 'GET') return json(res, 405, { error: 'method not allowed; use GET' }, { allow: 'GET' })
            const inventory = inventoryFor(PROFILE_DIR, SELF_NAME)
            json(res, 200, {
              ...inventory,
              ops: listOps(),
              audit: auditTail(DSH_HOME),
            }, { 'cache-control': 'no-store' })
          } catch (error) {
            json(res, 500, { error: error instanceof Error ? error.message : String(error) })
          }
        }),
      }),

      // ---- 安装：POST /plugin-manager/plugins/install {command} ----
      // 只接受固定格式指令：dsh plugin --profile <name> add <plugin>（见 src/command.mjs）。
      webServer.register({
        kind: 'exact',
        path: INSTALL_PATH,
        handler: guardProfile(async (req, res) => {
          try {
            if (req.method !== 'POST') return json(res, 405, { error: 'method not allowed; use POST' }, { allow: 'POST' })
            if (isCrossOrigin(req)) return json(res, 403, { error: 'cross-origin request rejected' })
            const body = parseJson(await readBody(req))
            if (body === null) return json(res, 400, { error: 'invalid JSON body' })
            // 固定格式解析（拒绝自由格式 spec 输入）。
            const parsed = parseInstallCommand(body.command)
            if (!parsed.ok) return json(res, 400, { error: parsed.error })
            const { profile: cmdProfile, spec } = parsed
            // 目标 profile：命令显式指定则优先；未指定回退 body.profile（UI 选中的目标），
            // 再缺省 = 当前运行 profile（resolveTargetDir 缺省行为）。
            const effectiveBody = { profile: cmdProfile ?? body.profile }
            const targetDir = resolveTargetDir(effectiveBody)
            const targetProfile = cmdProfile ?? (typeof body.profile === 'string' && body.profile !== '' ? body.profile : null)
            const beforeDeps = Object.keys(readManifest(targetDir).dependencies ?? {})
            const op = startOp({
              action: 'install',
              target: spec,
              profileDir: targetDir,
              args: ['add', spec],
              onDone: (record) => finishOp(record, beforeDeps, targetDir),
            })
            json(res, 202, { opId: op.id, restartNeeded: true, profile: targetProfile })
          } catch (error) {
            const message = error instanceof Error ? error.message : String(error)
            json(res, message.includes('不存在') ? 404 : 500, { error: message })
          }
        }),
      }),

      // ---- 卸载：POST /plugin-manager/plugins/uninstall {name} ----
      webServer.register({
        kind: 'exact',
        path: UNINSTALL_PATH,
        handler: guardProfile(async (req, res) => {
          try {
            if (req.method !== 'POST') return json(res, 405, { error: 'method not allowed; use POST' }, { allow: 'POST' })
            if (isCrossOrigin(req)) return json(res, 403, { error: 'cross-origin request rejected' })
            const body = parseJson(await readBody(req))
            if (body === null) return json(res, 400, { error: 'invalid JSON body' })
            const name = typeof body.name === 'string' ? body.name.trim() : ''
            if (name === '') return json(res, 400, { error: '插件名不能为空' })
            const targetDir = resolveTargetDir(body)
            const profile = targetName(body, targetDir)
            const manifest = readManifest(targetDir)
            if (!(name in (manifest.dependencies ?? {}))) return json(res, 404, { error: `插件 ${name} 不在 ${profile ?? '当前'} profile 的依赖中` })
            const dir = resolveDependencyDir(targetDir, name)
            let pkg = null
            try { pkg = JSON.parse(readFileSync(join(dir, 'package.json'), 'utf8')) } catch { /* 保持 null */ }
            const plugin = {
              name,
              isSelf: name === SELF_NAME,
              isSystem: SYSTEM_BUNDLES.has(name),
              rowIds: dir !== undefined ? collectRowIds(dir, pkg) : [],
            }
            const block = protectCheck(plugin)
            if (block !== null) return json(res, 403, { error: block })
            const beforeDeps = Object.keys(manifest.dependencies ?? {})
            const purgeData = body.purgeData === true // 同时删除插件数据（不可恢复，UI 需警示）
            const op = startOp({
              action: 'uninstall',
              target: name,
              profileDir: targetDir,
              args: ['remove', name],
              onDone: async (record) => {
                if (record.status !== 'ok') return
                try {
                  reconcileBundles(targetDir, beforeDeps)
                  removeOverrides(targetDir, plugin.rowIds) // 清理孤儿 disabled 覆盖
                  if (purgeData) {
                    // 删除数据目录 + 清理 settings 用户覆盖（仅重启前插件仍在运行时可清）
                    const removed = purgePluginData(DSH_HOME, targetDir, name)
                    const settings = typeof ctx.get === 'function' ? ctx.get('settings') : undefined
                    const clearedNs = await purgeSettingsNamespace(settings, name, plugin.rowIds)
                    record.purged = { dirs: removed, settings: clearedNs }
                  }
                  appendAudit(DSH_HOME, record)
                } catch { /* 忽略 */ }
              },
            })
            json(res, 202, { opId: op.id, restartNeeded: true, profile, purgeData })
          } catch (error) {
            json(res, 500, { error: error instanceof Error ? error.message : String(error) })
          }
        }),
      }),

      // ---- 更新：POST /plugin-manager/plugins/update {name?} ----
      webServer.register({
        kind: 'exact',
        path: UPDATE_PATH,
        handler: guardProfile(async (req, res) => {
          try {
            if (req.method !== 'POST') return json(res, 405, { error: 'method not allowed; use POST' }, { allow: 'POST' })
            if (isCrossOrigin(req)) return json(res, 403, { error: 'cross-origin request rejected' })
            const body = parseJson(await readBody(req))
            if (body === null) return json(res, 400, { error: 'invalid JSON body' })
            const name = typeof body.name === 'string' ? body.name.trim() : ''
            const targetDir = resolveTargetDir(body)
            const profile = targetName(body, targetDir)
            const manifest = readManifest(targetDir)
            const isAll = name === '' || name === '*'
            if (!isAll && !(name in (manifest.dependencies ?? {}))) {
              return json(res, 404, { error: `插件 ${name} 不在 ${profile ?? '当前'} profile 的依赖中` })
            }
            const beforeDeps = Object.keys(manifest.dependencies ?? {})
            const op = startOp({
              action: isAll ? 'update-all' : 'update',
              target: isAll ? '(全部)' : name,
              profileDir: targetDir,
              args: isAll ? ['update'] : ['update', name],
              onDone: (record) => finishOp(record, beforeDeps, targetDir),
            })
            json(res, 202, { opId: op.id, restartNeeded: true, profile })
          } catch (error) {
            json(res, 500, { error: error instanceof Error ? error.message : String(error) })
          }
        }),
      }),

      // ---- 启用/禁用：POST /plugin-manager/plugins/toggle {rowId, enabled} ----
      webServer.register({
        kind: 'exact',
        path: TOGGLE_PATH,
        handler: guardProfile(async (req, res) => {
          try {
            if (req.method !== 'POST') return json(res, 405, { error: 'method not allowed; use POST' }, { allow: 'POST' })
            if (isCrossOrigin(req)) return json(res, 403, { error: 'cross-origin request rejected' })
            const body = parseJson(await readBody(req))
            if (body === null) return json(res, 400, { error: 'invalid JSON body' })
            const rowId = typeof body.rowId === 'string' ? body.rowId.trim() : ''
            if (rowId === '') return json(res, 400, { error: 'rowId 不能为空' })
            const targetDir = resolveTargetDir(body)
            const profile = targetName(body, targetDir)
            // 保护：系统 bundle / 自插件（rowIds 为空时按名称兜底判定）。
            const inventory = inventoryFor(targetDir, SELF_NAME)
            const owner = inventory.plugins.find(plugin => plugin.rowIds.includes(rowId)) ?? null
            let block = null
            if (owner === null) {
              if (rowId === SELF_NAME) block = '不能卸载或禁用插件管理器自身（会把自己锁死）'
              else if (SYSTEM_BUNDLES.has(rowId)) block = '系统 bundle 不可卸载或禁用（GUI 依赖它运行）'
              else block = `未找到 loader 行 ${rowId} 对应的插件`
            } else {
              block = protectCheck(owner)
            }
            if (block !== null) return json(res, 403, { error: block })
            const enabled = body.enabled !== false
            const result = setDisabled(targetDir, rowId, !enabled) // 复杂补丁语法 → 抛错拒绝
            json(res, 200, { rowId, action: result.action, profile }, { 'cache-control': 'no-store' })
          } catch (error) {
            const message = error instanceof Error ? error.message : String(error)
            json(res, 422, { error: message })
          }
        }),
      }),

      // ---- 操作轮询：GET /plugin-manager/ops/:id ----
      webServer.register({
        kind: 'prefix',
        path: OPS_PATH,
        handler: guardProfile(async (req, res) => {
          try {
            if (req.method !== 'GET') return json(res, 405, { error: 'method not allowed; use GET' }, { allow: 'GET' })
            const id = decodeURIComponent(new URL(req.url ?? '/', 'http://dsh.internal').pathname)
              .replace(OPS_PATH + '/', '')
            if (id === '' || id.includes('/')) return json(res, 400, { error: 'invalid op id' })
            const op = getOp(id)
            if (op === null) return json(res, 404, { error: 'op not found' })
            json(res, 200, op, { 'cache-control': 'no-store' })
          } catch (error) {
            json(res, 500, { error: error instanceof Error ? error.message : String(error) })
          }
        }),
      }),

      // ---- profile 列表：GET /plugin-manager/profiles ----
      webServer.register({
        kind: 'exact',
        path: PROFILES_PATH,
        handler: async (req, res) => {
          try {
            if (req.method !== 'GET') return json(res, 405, { error: 'method not allowed; use GET' }, { allow: 'GET' })
            const profiles = listProfiles(DSH_HOME, PROFILE_DIR)
            json(res, 200, { profiles, current: PROFILE_DIR === null ? null : (profiles.find(p => p.isCurrent)?.name ?? null) }, { 'cache-control': 'no-store' })
          } catch (error) {
            json(res, 500, { error: error instanceof Error ? error.message : String(error) })
          }
        },
      }),

      // ---- 新建 profile：POST /plugin-manager/profiles/create {name} ----
      webServer.register({
        kind: 'exact',
        path: PROFILE_CREATE_PATH,
        handler: async (req, res) => {
          try {
            if (req.method !== 'POST') return json(res, 405, { error: 'method not allowed; use POST' }, { allow: 'POST' })
            if (isCrossOrigin(req)) return json(res, 403, { error: 'cross-origin request rejected' })
            const body = parseJson(await readBody(req))
            if (body === null) return json(res, 400, { error: 'invalid JSON body' })
            const name = typeof body.name === 'string' ? body.name.trim() : ''
            const created = createProfile(DSH_HOME, name)
            json(res, 201, created)
          } catch (error) {
            const message = error instanceof Error ? error.message : String(error)
            json(res, /已存在/.test(message) ? 409 : 400, { error: message })
          }
        },
      }),

      // ---- 浏览指定 profile：GET /plugin-manager/profiles/:name/plugins（只读） ----
      webServer.register({
        kind: 'prefix',
        path: PROFILE_PLUGINS_PREFIX,
        handler: async (req, res) => {
          try {
            if (req.method !== 'GET') return json(res, 405, { error: 'method not allowed; use GET' }, { allow: 'GET' })
            const rest = decodeURIComponent(new URL(req.url ?? '/', 'http://dsh.internal').pathname)
              .replace(PROFILE_PLUGINS_PREFIX, '')
              .replace(/^\//, '')
            const match = /^([^/]+)\/plugins$/.exec(rest)
            if (match === null) return json(res, 404, { error: 'not found' })
            const name = match[1]
            if (name === 'node_modules') return json(res, 400, { error: 'node_modules 不是 profile' })
            const dir = join(DSH_HOME, 'profiles', name)
            if (!existsSync(join(dir, 'package.json'))) return json(res, 404, { error: `profile ${name} 不存在` })
            const inventory = inventoryFor(dir, SELF_NAME)
            json(res, 200, {
              profile: inventory.profile,
              plugins: inventory.plugins,
              isCurrent: dir === PROFILE_DIR,
            }, { 'cache-control': 'no-store' })
          } catch (error) {
            json(res, 500, { error: error instanceof Error ? error.message : String(error) })
          }
        },
      }),

      // ---- 配置清单：GET /plugin-manager/configs（已注册 settings namespace） ----
      webServer.register({
        kind: 'exact',
        path: CONFIGS_PATH,
        handler: async (req, res) => {
          try {
            if (req.method !== 'GET') return json(res, 405, { error: 'method not allowed; use GET' }, { allow: 'GET' })
            const settings = typeof ctx.get === 'function' ? ctx.get('settings') : undefined
            if (settings === undefined || typeof settings.describe !== 'function') {
              return json(res, 200, { configs: [], available: false }, { 'cache-control': 'no-store' })
            }
            const descriptors = settings.describe({ redactSecrets: true })
            const inventory = inventoryFor(PROFILE_DIR, SELF_NAME)
            const byName = new Map(inventory.plugins.map(p => [p.name, p]))
            const configs = descriptors.map(descriptor => ({
              ns: descriptor.ns,
              applies: descriptor.applies,
              revision: descriptor.revision,
              schema: descriptor.schema,
              value: descriptor.value,
              hasUser: descriptor.user !== undefined,
              secrets: descriptor.secrets ?? [],
              plugin: byName.get(descriptor.ns) ?? null,
            }))
            json(res, 200, { configs, available: true }, { 'cache-control': 'no-store' })
          } catch (error) {
            json(res, 500, { error: error instanceof Error ? error.message : String(error) })
          }
        },
      }),

      // ---- 配置写入：POST /plugin-manager/configs/:ns {patch 或 section, expectedRevision} ----
      webServer.register({
        kind: 'prefix',
        path: CONFIGS_PREFIX,
        handler: async (req, res) => {
          try {
            if (req.method !== 'POST') return json(res, 405, { error: 'method not allowed; use POST' }, { allow: 'POST' })
            if (isCrossOrigin(req)) return json(res, 403, { error: 'cross-origin request rejected' })
            const body = parseJson(await readBody(req))
            if (body === null) return json(res, 400, { error: 'invalid JSON body' })
            const ns = decodeURIComponent(new URL(req.url ?? '/', 'http://dsh.internal').pathname)
              .replace(CONFIGS_PREFIX, '')
              .replace(/^\//, '')
            if (ns === '' || ns.includes('/')) return json(res, 400, { error: 'invalid namespace' })
            const settings = typeof ctx.get === 'function' ? ctx.get('settings') : undefined
            if (settings === undefined || typeof settings.update !== 'function') {
              return json(res, 503, { error: 'settings 服务不可用' })
            }
            const expectedRevision = typeof body.expectedRevision === 'number' ? body.expectedRevision : undefined
            if (body.section !== undefined) {
              await settings.replace(ns, body.section, expectedRevision)
            } else if (body.patch !== undefined && body.patch !== null && typeof body.patch === 'object' && !Array.isArray(body.patch)) {
              await settings.update(ns, body.patch, expectedRevision)
            } else {
              return json(res, 400, { error: 'body 须包含 patch（合并）或 section（整体替换）' })
            }
            // 写成功：返回最新描述供 UI 刷新。
            const descriptor = settings.describe({ redactSecrets: true }).find(d => d.ns === ns) ?? null
            json(res, 200, descriptor, { 'cache-control': 'no-store' })
          } catch (error) {
            const message = error instanceof Error ? error.message : String(error)
            json(res, message.includes('SETTINGS_CONFLICT') || message.includes('revision') ? 409 : 400, { error: message })
          }
        },
      }),
    ]
    return () => { for (const dispose of disposers) dispose() }
  }, 'plugin-manager: routes')
}
