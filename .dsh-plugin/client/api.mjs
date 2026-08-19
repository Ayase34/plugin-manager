// client 侧 API 助手：同源 fetch + JSON 错误透传 + 轮询。
// 路由常量来自 src/routes.mjs（Node half 单一来源，esbuild 内联）。

/**
 * 请求插件管理 API。
 * @param {string} path - 完整路径（含前缀）。
 * @param {{ method?: string, body?: object }} [options]
 * @returns {Promise<any>} 响应 JSON。
 * @throws {Error} 非 2xx 时带服务端 error 字段。
 */
export async function api(path, options = {}) {
  let res
  try {
    res = await fetch(path, {
      method: options.method ?? 'GET',
      headers: { 'content-type': 'application/json' },
      body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
    })
  } catch (error) {
    throw new Error('网络错误：' + String(error?.message ?? error))
  }
  let data = null
  try { data = await res.json() } catch { /* 非 JSON 响应 */ }
  if (!res.ok) {
    throw new Error((data !== null && typeof data === 'object' && typeof data.error === 'string')
      ? data.error
      : `HTTP ${res.status}`)
  }
  if (data === null) {
    // 200 但非 JSON：请求落到了 SPA 回退——插件 Node half 未挂载（服务端未注册路由）。
    throw new Error('插件服务未响应（响应不是 JSON）。可能原因：Node half 未加载，请重启 DSH 后再试')
  }
  return data
}

/**
 * 轮询直到条件满足或超时。
 * @param {() => Promise<any>} fn - 每次轮询的请求。
 * @param {(value: any) => boolean} done - 返回 true 停止。
 * @param {{ interval?: number, timeout?: number, onTick?: (value: any) => void }} [opts]
 * @returns {Promise<any>} 最后的值。
 */
export async function pollUntil(fn, done, { interval = 800, timeout = 300000, onTick } = {}) {
  const deadline = Date.now() + timeout
  for (;;) {
    let value = null
    try { value = await fn() } catch { /* 单次失败继续轮询 */ }
    if (value !== null && done(value)) return value
    if (onTick !== undefined && value !== null) onTick(value)
    if (Date.now() > deadline) throw new Error('操作超时')
    await new Promise(resolveTimer => setTimeout(resolveTimer, interval))
  }
}

/** 操作状态文案。 */
export function opStatusLabel(status) {
  if (status === 'running') return '运行中'
  if (status === 'ok') return '成功'
  if (status === 'error') return '失败'
  return status
}

/** 操作动作文案。 */
export function opActionLabel(action) {
  if (action === 'install') return '安装'
  if (action === 'uninstall') return '卸载'
  if (action === 'update') return '更新'
  if (action === 'update-all') return '全部更新'
  return action
}
