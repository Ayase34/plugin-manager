// pnpm 操作执行器：spawn pnpm（cwd = profile 目录），流式收集输出行，
// 操作记录保存在内存（最新 50 条），供客户端轮询进度。
import { spawn } from 'node:child_process'
import { randomUUID } from 'node:crypto'

const MAX_OPS = 50
const MAX_LINES = 400
const ops = new Map()

/** 全部操作（新→旧）。 */
export function listOps() {
  return [...ops.values()].sort((a, b) => b.startedAt - a.startedAt)
}

/** 单条操作。 */
export function getOp(id) {
  return ops.get(id) ?? null
}

function trim() {
  if (ops.size <= MAX_OPS) return
  const sorted = [...ops.keys()].sort((a, b) => (ops.get(a).startedAt - ops.get(b).startedAt))
  while (ops.size > MAX_OPS) ops.delete(sorted.shift())
}

/**
 * 启动一个 pnpm 操作（异步执行，立即返回记录）。
 * @param {{ action: string, target: string, profileDir: string, args: string[], onDone?: (record: object) => void }} opts
 * @returns 操作记录（status 初始为 'running'）。
 */
export function startOp({ action, target, profileDir, args, onDone }) {
  const record = {
    id: randomUUID(),
    action,
    target,
    args: [...args],
    status: 'running',
    lines: [],
    exitCode: null,
    error: null,
    startedAt: Date.now(),
    finishedAt: null,
  }
  ops.set(record.id, record)
  trim()
  const child = spawn('pnpm', args, {
    cwd: profileDir,
    shell: process.platform === 'win32',
    windowsHide: true,
  })
  const push = (chunk) => {
    const text = String(chunk ?? '')
    for (const line of text.split(/\r?\n/)) {
      if (line === '') continue
      record.lines.push(line)
      if (record.lines.length > MAX_LINES) record.lines.splice(0, record.lines.length - MAX_LINES)
    }
  }
  child.stdout?.on('data', push)
  child.stderr?.on('data', push)
  const settle = () => {
    if (onDone !== undefined) {
      try { onDone(record) } catch { /* 回调异常不阻塞操作记录 */ }
    }
  }
  child.on('error', (error) => {
    if (record.finishedAt !== null) return
    record.status = 'error'
    record.error = String(error?.message ?? error)
    record.finishedAt = Date.now()
    settle()
  })
  child.on('close', (code) => {
    if (record.finishedAt !== null) return
    record.exitCode = code
    record.status = code === 0 ? 'ok' : 'error'
    record.finishedAt = Date.now()
    settle()
  })
  return record
}
