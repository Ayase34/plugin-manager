// CSRF 防护：跨源请求拒绝（与 whale-girl 同策略——恶意网页不能驱动管理操作）。
// 同源 fetch 会带 Origin；无 Origin（curl/CLI）视为同源放行。

/**
 * 判断请求是否跨源。
 * @param {import('node:http').IncomingMessage} req
 * @returns {boolean}
 */
export function isCrossOrigin(req) {
  const origin = req.headers.origin
  if (origin === undefined || origin === 'null') return false
  try {
    return new URL(origin).host !== req.headers.host
  } catch {
    return true
  }
}
