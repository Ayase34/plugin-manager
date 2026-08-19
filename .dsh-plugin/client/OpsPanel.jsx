/** 操作记录面板：最近操作列表（含进行中操作的实时输出行）。 */
import React, { useState } from 'react'
import { opActionLabel, opStatusLabel } from './api.mjs'

function formatTime(ms) {
  const d = new Date(ms)
  const pad = n => String(n).padStart(2, '0')
  return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
}

function OpRow({ op }) {
  const [showLines, setShowLines] = useState(op.status === 'running')
  const running = op.status === 'running'
  return (
    <div className="pm-op" data-op-status={op.status}>
      <div className="pm-op-head">
        <span className={'pm-status pm-status-' + op.status}>
          {running ? <span className="pm-spin" aria-hidden="true" /> : null}
          {opStatusLabel(op.status)}
        </span>
        <strong>{opActionLabel(op.action)}</strong>
        <span className="pm-op-target">{op.target}</span>
        {op.exitCode !== null ? <span className="pm-sub">exit {op.exitCode}</span> : null}
        <span className="pm-op-time">{formatTime(op.startedAt)}</span>
        <button type="button" className="pm-btn" onClick={() => setShowLines(v => !v)}>
          {showLines ? '收起输出' : `输出 (${op.lines.length})`}
        </button>
      </div>
      {op.error !== null ? <div className="pm-banner pm-banner-error">{op.error}</div> : null}
      {showLines && op.lines.length > 0 ? (
        <div className="pm-op-lines">
          {op.lines.map((line, i) => (
            <div key={i} className={/error|ERR|failed|E\s*[0-9]+/i.test(line) ? 'pm-op-line-error' : undefined}>{line}</div>
          ))}
        </div>
      ) : null}
    </div>
  )
}

/** 操作记录：ops 为本次会话的操作，audit 为持久审计尾部（新→旧）。 */
export function OpsPanel({ ops, audit }) {
  const [open, setOpen] = useState(ops.some(op => op.status === 'running'))
  const running = ops.some(op => op.status === 'running')
  return (
    <div className="pm-ops">
      <div className="pm-ops-head" onClick={() => setOpen(v => !v)} role="button" aria-expanded={open}>
        {running ? <span className="pm-spin" aria-hidden="true" /> : null}
        <strong>操作记录</strong>
        <span className="pm-sub">{ops.length} 条本次会话</span>
        {audit.length > 0 ? <span className="pm-sub">· 审计 {audit.length} 条</span> : null}
      </div>
      {open ? (
        <div className="pm-ops-list">
          {ops.length === 0 ? <div className="pm-empty">暂无操作记录</div> : null}
          {ops.map(op => <OpRow key={op.id} op={op} />)}
        </div>
      ) : null}
    </div>
  )
}
