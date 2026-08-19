// 操作审计：JSONL 追加写 <dshHome>/data/plugin-manager/ops.log（跨重启持久）。
import { appendFileSync, mkdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

/** 审计日志路径。 */
export function auditLogPath(dshHome) {
  return join(dshHome, 'data', 'plugin-manager', 'ops.log')
}

/** 追加一条审计记录（失败静默——审计不阻塞管理操作）。 */
export function appendAudit(dshHome, record) {
  try {
    mkdirSync(join(dshHome, 'data', 'plugin-manager'), { recursive: true })
    const line = JSON.stringify({
      ts: new Date().toISOString(),
      id: record.id,
      action: record.action,
      target: record.target,
      status: record.status,
      exitCode: record.exitCode,
      error: record.error ?? null,
    })
    appendFileSync(auditLogPath(dshHome), line + '\n')
  } catch {
    // 忽略
  }
}

/** 审计尾部（新→旧）。 */
export function auditTail(dshHome, n = 20) {
  try {
    const lines = readFileSync(auditLogPath(dshHome), 'utf8').trim().split('\n').filter(Boolean)
    return lines.slice(-n).map(line => {
      try { return JSON.parse(line) } catch { return null }
    }).filter(Boolean).reverse()
  } catch {
    return []
  }
}
