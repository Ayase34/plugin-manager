/** 插件卡片：徽章、启用开关、操作按钮、详情展开。 */
import React, { useState } from 'react'

function badges(plugin) {
  const list = []
  if (plugin.isSystem) list.push({ key: 'system', label: '系统', cls: 'pm-badge-system' })
  if (plugin.isSelf) list.push({ key: 'self', label: '本插件', cls: 'pm-badge-self' })
  if (plugin.isBundle) list.push({ key: 'bundle', label: 'bundle 层', cls: 'pm-badge-bundle' })
  if (plugin.dshClient) list.push({ key: 'client', label: `client${plugin.clientPlatform ? ':' + plugin.clientPlatform : ''}`, cls: 'pm-badge' })
  return list
}

export function PluginCard({ plugin, busy, onToggle, onUpdate, onUninstall, onError, readOnly = false }) {
  const [open, setOpen] = useState(false)
  const canManage = !readOnly && !plugin.isSystem && !plugin.isSelf
  const protectedPlugin = plugin.isSystem || plugin.isSelf

  const toggle = async (event) => {
    const next = event.target.checked
    try {
      await onToggle(plugin, next)
    } catch (error) {
      onError(String(error?.message ?? error))
    }
  }

  return (
    <li className="pm-card" data-plugin={plugin.name}>
      <div className="pm-card-head">
        <span>
          <span className="pm-card-name">{plugin.name}</span>
          {plugin.version !== null ? <span className="pm-card-ver">v{plugin.version}</span> : null}
        </span>
        <div className="pm-badges">
          {badges(plugin).map(b => <span key={b.key} className={'pm-badge ' + b.cls}>{b.label}</span>)}
        </div>
      </div>
      {plugin.description !== null && plugin.description !== '' ? (
        <div className="pm-card-desc">{plugin.description}</div>
      ) : null}
      <div className="pm-card-foot">
        <label className="pm-toggle" title={readOnly ? '浏览模式（只读）' : (protectedPlugin ? (plugin.isSystem ? '系统 bundle 不可禁用' : '插件管理器自身不可禁用') : '切换后立即生效（无需重启）')}>
          <input
            type="checkbox"
            checked={plugin.enabled}
            disabled={!canManage || busy}
            onChange={toggle}
          />
          <span>{plugin.enabled ? '已启用' : '已禁用'}</span>
        </label>
        <div className="pm-actions-mini">
          {canManage && plugin.isBundle ? (
            <button type="button" className="pm-btn" disabled={busy} onClick={() => onUpdate(plugin)} title="更新此插件">
              更新
            </button>
          ) : null}
          {canManage ? (
            <button type="button" className="pm-btn pm-btn-danger" disabled={busy} onClick={() => onUninstall(plugin)} title="卸载此插件（需重启生效）">
              卸载
            </button>
          ) : null}
          <button type="button" className="pm-btn" onClick={() => setOpen(v => !v)} aria-expanded={open}>
            {open ? '收起' : '详情'}
          </button>
        </div>
      </div>
      {open ? (
        <div className="pm-details">
          {plugin.spec !== null ? (
            <div className="pm-details-row"><span className="pm-details-key">来源</span><code className="pm-details-val">{plugin.spec}</code></div>
          ) : null}
          <div className="pm-details-row"><span className="pm-details-key">位置</span><code className="pm-details-val">{plugin.path}</code></div>
          {plugin.rowIds.length > 0 ? (
            <div className="pm-details-row"><span className="pm-details-key">loader 行</span><code className="pm-details-val">{plugin.rowIds.join(', ')}</code></div>
          ) : null}
          <div className="pm-details-row">
            <span className="pm-details-key">声明</span>
            <span className="pm-details-val">
              {plugin.dshBundle ? 'dsh.bundle ✓' : 'dsh.bundle —'}
              {' · '}
              {plugin.dshClient ? 'dsh.client ✓' : 'dsh.client —'}
              {plugin.enabledGuess ? ' · （loader 行未知，启停按包名推断）' : ''}
            </span>
          </div>
          {plugin.dependencies.length > 0 ? (
            <div className="pm-details-row"><span className="pm-details-key">依赖</span><span className="pm-details-val">{plugin.dependencies.join(', ')}</span></div>
          ) : null}
          {plugin.repository !== null ? (
            <div className="pm-details-row"><span className="pm-details-key">仓库</span><code className="pm-details-val">{plugin.repository}</code></div>
          ) : null}
          {plugin.license !== null ? (
            <div className="pm-details-row"><span className="pm-details-key">许可</span><span className="pm-details-val">{plugin.license}</span></div>
          ) : null}
        </div>
      ) : null}
    </li>
  )
}
