/** 配置编辑面板：对注册了 settings schema 的插件渲染表单（schemastery schema JSON → 控件）。
 * 保存策略：表单编辑解析值 → deepDiff 生成 merge 补丁 → settings.update(patch, expectedRevision)——
 * 未变字段不写入、secret 字段不触碰（redact 视图下天然安全）。
 */
import React, { useState } from 'react'

/** 节点解析（schemastery toJSON：{uid, refs}，root = refs[uid]）。 */
function nodeAt(schema, id) {
  return schema?.refs?.[id] ?? null
}

/** 深层 diff：返回仅含变化键的补丁（对象递归；数组/其他值整体替换）。无变化返回 undefined。 */
export function deepDiff(before, after) {
  if (before === after) return undefined
  if (before !== null && after !== null && typeof before === 'object' && typeof after === 'object'
    && !Array.isArray(before) && !Array.isArray(after)) {
    const patch = {}
    const keys = new Set([...Object.keys(before), ...Object.keys(after)])
    for (const key of keys) {
      const sub = deepDiff(before[key], after[key])
      if (sub !== undefined) patch[key] = sub
    }
    return Object.keys(patch).length > 0 ? patch : undefined
  }
  return after
}

/** JSON 文本编辑（数组/复杂对象/未知类型兜底）。 */
function JsonField({ value, onChange }) {
  const [text, setText] = useState(() => JSON.stringify(value ?? null, null, 1))
  const [error, setError] = useState(null)
  const commit = (nextText) => {
    setText(nextText)
    try {
      const parsed = JSON.parse(nextText)
      setError(null)
      onChange(parsed)
    } catch (e) {
      setError(String(e?.message ?? e))
    }
  }
  return (
    <div className="pm-cfg-field">
      <textarea
        className={error !== null ? 'pm-cfg-json pm-cfg-error' : 'pm-cfg-json'}
        rows={4}
        value={text}
        spellCheck={false}
        onChange={e => commit(e.target.value)}
      />
      {error !== null ? <div className="pm-cfg-err" role="alert">{error}</div> : null}
    </div>
  )
}

/** 单个字段控件（递归）。 */
function Field({ schema, node, value, onChange, name, secret, secretPath }) {
  const meta = node?.meta ?? {}
  const label = (
    <span className="pm-cfg-label">
      {name}
      {meta.description !== undefined && meta.description !== '' ? <em title={String(meta.description)}>{String(meta.description)}</em> : null}
      {secret ? <span className="pm-badge">secret</span> : null}
    </span>
  )
  if (secret) {
    return (
      <div className="pm-cfg-row">
        {label}
        <span className="pm-cfg-hidden">已隐藏（敏感字段，保存时保持原值）</span>
      </div>
    )
  }
  if (node === null) {
    return (
      <div className="pm-cfg-row">
        {label}
        <JsonField value={value} onChange={onChange} />
      </div>
    )
  }
  switch (node.type) {
    case 'string':
      return (
        <div className="pm-cfg-row">
          {label}
          <input type="text" className="pm-cfg-input" value={value ?? ''} onChange={e => onChange(e.target.value)} />
        </div>
      )
    case 'number':
      return (
        <div className="pm-cfg-row">
          {label}
          <input
            type="number"
            className="pm-cfg-input"
            value={value ?? ''}
            onChange={e => {
              const raw = e.target.value
              if (raw === '') { onChange(undefined); return }
              const n = Number(raw)
              if (Number.isFinite(n)) onChange(n)
            }}
          />
        </div>
      )
    case 'boolean':
      return (
        <div className="pm-cfg-row">
          {label}
          <input type="checkbox" checked={value === true} onChange={e => onChange(e.target.checked)} />
        </div>
      )
    case 'const':
      return (
        <div className="pm-cfg-row">
          {label}
          <code className="pm-cfg-fixed">{JSON.stringify(node.value)}</code>
        </div>
      )
    case 'union': {
      const list = node.list ?? []
      const consts = list.map(id => nodeAt(schema, id))
      if (list.length > 0 && consts.every(n => n !== null && n.type === 'const')) {
        const options = consts.map(n => n.value)
        return (
          <div className="pm-cfg-row">
            {label}
            <select className="pm-cfg-input" value={options.includes(value) ? value : ''} onChange={e => onChange(e.target.value)}>
              {!options.includes(value) ? <option value="" disabled>（当前值不在选项中）</option> : null}
              {options.map(opt => <option key={String(opt)} value={opt}>{String(opt)}</option>)}
            </select>
          </div>
        )
      }
      return (
        <div className="pm-cfg-row">
          {label}
          <JsonField value={value} onChange={onChange} />
        </div>
      )
    }
    case 'array':
      return (
        <div className="pm-cfg-row">
          {label}
          <JsonField value={value ?? []} onChange={onChange} />
        </div>
      )
    case 'object': {
      const dict = node.dict ?? {}
      return (
        <div className="pm-cfg-row">
          {label}
          <div className="pm-cfg-group">
            {Object.entries(dict).map(([key, id]) => (
              <Field
                key={key}
                schema={schema}
                node={nodeAt(schema, id)}
                name={key}
                value={value?.[key]}
                onChange={next => onChange({ ...(value ?? {}), [key]: next })}
                secret={secretPath !== undefined && secretPath.includes(key)}
                secretPath={secretPath}
              />
            ))}
            {Object.keys(dict).length === 0 ? <span className="pm-sub">（空对象）</span> : null}
          </div>
        </div>
      )
    }
    default:
      return (
        <div className="pm-cfg-row">
          {label}
          <JsonField value={value} onChange={onChange} />
        </div>
      )
  }
}

/** 单个 namespace 的配置卡片。 */
function ConfigCard({ config, busy, onSave, onError }) {
  const [draft, setDraft] = useState(() => JSON.parse(JSON.stringify(config.value ?? null)))
  const [saved, setSaved] = useState(false)
  const root = nodeAt(config.schema, config.schema?.uid)
  const secretPaths = (config.secrets ?? []).map(s => (Array.isArray(s?.path) ? s.path.join('.') : null)).filter(Boolean)
  const isSecretField = (path) => secretPaths.some(p => p === path || p.startsWith(path + '.'))

  const save = async () => {
    const patch = deepDiff(config.value, draft)
    if (patch === undefined) return
    try {
      await onSave(config.ns, patch, config.revision)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (e) {
      onError(String(e?.message ?? e))
    }
  }
  const reset = () => setDraft(JSON.parse(JSON.stringify(config.value ?? null)))

  return (
    <div className="pm-cfg-card" data-ns={config.ns}>
      <div className="pm-cfg-head">
        <strong className="pm-cfg-ns">{config.ns}</strong>
        <span className="pm-badge">{config.applies === 'restart' ? '重启生效' : '实时生效'}</span>
        {config.plugin !== null ? <span className="pm-badge pm-badge-bundle">{config.plugin.name}</span> : <span className="pm-badge">宿主注册</span>}
        {config.hasUser ? <span className="pm-badge">已覆盖默认值</span> : null}
      </div>
      <div className="pm-cfg-body">
        {root !== null && root.type === 'object' ? (
          <div className="pm-cfg-form">
            {Object.entries(root.dict ?? {}).map(([key, id]) => (
              <Field
                key={key}
                schema={config.schema}
                node={nodeAt(config.schema, id)}
                name={key}
                value={draft?.[key]}
                onChange={next => setDraft(prev => ({ ...(prev ?? {}), [key]: next }))}
                secret={isSecretField(key)}
                secretPath={isSecretField(key) ? secretPaths : undefined}
              />
            ))}
          </div>
        ) : (
          <JsonField value={draft} onChange={setDraft} />
        )}
      </div>
      <div className="pm-cfg-foot">
        <button type="button" className="pm-btn" disabled={busy} onClick={reset}>重置为当前值</button>
        <button type="button" className="pm-btn pm-btn-primary" disabled={busy} onClick={() => void save()}>
          {busy ? '保存中…' : (saved ? '已保存 ✓' : '保存')}
        </button>
      </div>
    </div>
  )
}

/** 配置面板：全部已注册 namespace 的卡片列表。 */
export function ConfigPanel({ configs, busy, onSave, onError }) {
  const [query, setQuery] = useState('')
  const q = query.trim().toLocaleLowerCase()
  const filtered = configs.filter(c => c.ns.toLocaleLowerCase().includes(q) || (c.plugin?.name ?? '').toLocaleLowerCase().includes(q))
  return (
    <div className="pm-configs">
      <div className="pm-search">
        <input type="search" value={query} placeholder="搜索配置（namespace / 插件名）" aria-label="搜索配置" onChange={e => setQuery(e.target.value)} />
        <span className="pm-count">{filtered.length} / {configs.length} 个</span>
      </div>
      {configs.length === 0 ? <div className="pm-empty">没有插件注册配置（settings schema）</div> : null}
      {filtered.length === 0 && configs.length > 0 ? <div className="pm-empty">无匹配配置</div> : null}
      <div className="pm-grid" style={{ listStyle: 'none', margin: 0, padding: 0 }}>
        {filtered.map(config => (
          <ConfigCard key={config.ns} config={config} busy={busy} onSave={onSave} onError={onError} />
        ))}
      </div>
    </div>
  )
}
