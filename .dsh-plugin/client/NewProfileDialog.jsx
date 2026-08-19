/** 新建 profile 对话框。 */
import React, { useState } from 'react'

const NAME_HINT = '小写字母开头，仅限字母/数字/连字符（kebab-case）'

export function NewProfileDialog({ onCancel, onCreate }) {
  const [name, setName] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)
  const valid = /^[a-z][a-z0-9-]*$/.test(name.trim()) && name.trim() !== 'node_modules'

  const submit = async () => {
    if (!valid || busy) return
    setBusy(true)
    setError(null)
    try {
      await onCreate(name.trim())
    } catch (e) {
      setError(String(e?.message ?? e))
      setBusy(false)
    }
  }

  return (
    <div className="pm-modal-backdrop" role="presentation" onMouseDown={(e) => { if (e.target === e.currentTarget && !busy) onCancel() }}>
      <div className="pm-modal" role="dialog" aria-modal="true" aria-label="新建 profile">
        <h3>新建 profile</h3>
        <div className="pm-modal-body">
          <input
            type="text"
            value={name}
            placeholder="profile 名，如 work / test"
            onChange={e => setName(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') void submit() }}
            autoFocus
          />
          <div className="pm-sub">{NAME_HINT}。新 profile 将包含官方基础 bundle（dsh-base + dsh-web-app），可随后安装插件。</div>
          {error !== null ? <div className="pm-banner pm-banner-error" role="alert">{error}</div> : null}
        </div>
        <div className="pm-modal-foot">
          <button type="button" className="pm-btn" disabled={busy} onClick={onCancel}>取消</button>
          <button type="button" className="pm-btn pm-btn-primary" disabled={busy || !valid} onClick={() => void submit()}>
            {busy ? '创建中…' : '创建'}
          </button>
        </div>
      </div>
    </div>
  )
}
