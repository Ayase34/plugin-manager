/** 安装对话框：固定格式指令输入（dsh plugin [--profile <name>] add <plugin>）+ 安全警告 + 确认。 */
import React, { useState } from 'react'

const EXAMPLE = 'dsh plugin add github:owner/repo#main'

export function InstallDialog({ onCancel, onInstall }) {
  const [command, setCommand] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)

  const submit = async () => {
    if (command.trim() === '' || busy) return
    setBusy(true)
    setError(null)
    try {
      await onInstall(command.trim())
    } catch (e) {
      setError(String(e?.message ?? e))
      setBusy(false)
    }
  }

  return (
    <div className="pm-modal-backdrop" role="presentation" onMouseDown={(e) => { if (e.target === e.currentTarget && !busy) onCancel() }}>
      <div className="pm-modal" role="dialog" aria-modal="true" aria-label="安装插件">
        <h3>安装插件</h3>
        <div className="pm-modal-body">
          <input
            type="text"
            value={command}
            placeholder={EXAMPLE}
            onChange={e => setCommand(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') void submit() }}
            autoFocus
            spellCheck={false}
          />
          <div className="pm-sub">
            固定格式指令：<code>dsh plugin [--profile &lt;name&gt;] add &lt;plugin&gt;</code>。
            <strong>未写 <code>--profile</code> 时安装到当前选中的 profile（不会装错地方）</strong>；
            显式指定则以命令为准。<code>&lt;plugin&gt;</code> 支持：
            npm 包名（<code>some-plugin</code>）、GitHub（<code>github:owner/repo#main</code>）、
            本地绝对路径（<code>link:C:/path</code> 软链或 <code>file:</code> 复制）。
          </div>
          <div className="pm-warn">
            ⚠️ 安装第三方插件意味着执行其代码（含 prepare 构建脚本），可能访问你的文件与凭据。
            请确认来源可信后再安装。
          </div>
          {error !== null ? <div className="pm-banner pm-banner-error" role="alert">{error}</div> : null}
        </div>
        <div className="pm-modal-foot">
          <button type="button" className="pm-btn" disabled={busy} onClick={onCancel}>取消</button>
          <button type="button" className="pm-btn pm-btn-primary" disabled={busy || command.trim() === ''} onClick={() => void submit()}>
            {busy ? '安装中…' : '安装'}
          </button>
        </div>
      </div>
    </div>
  )
}
