/** 插件管理器主选项卡（设置 → 插件 → 插件管理）：
 * 插件/配置两个子视图；多 profile 浏览（当前 profile 可写，其他只读）；
 * 安装/卸载/更新/启停、操作面板、重启提示、更新前后版本对比。 */
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { api } from './api.mjs'
import {
  CONFIGS_PATH, CONFIGS_PREFIX, INSTALL_PATH, OPS_PATH, PLUGINS_PATH,
  PROFILE_CREATE_PATH, PROFILE_PLUGINS_PREFIX, PROFILES_PATH,
  TOGGLE_PATH, UNINSTALL_PATH, UPDATE_PATH,
} from '../src/routes.mjs'
import { PluginCard } from './PluginCard.jsx'
import { InstallDialog } from './InstallDialog.jsx'
import { ConfigPanel } from './ConfigPanel.jsx'
import { NewProfileDialog } from './NewProfileDialog.jsx'

const CONFIRM_DEFAULTS = { kind: null, plugin: null }

export function PluginManagerTab() {
  // ---- 清单状态 ----
  const [inventory, setInventory] = useState(null)
  const [status, setStatus] = useState('loading') // loading | ready | error
  const [error, setError] = useState(null)
  const [query, setQuery] = useState('')
  const [ops, setOps] = useState([])
  const [busy, setBusy] = useState(false)
  const watchers = useRef(new Map())

  // ---- 多 profile 状态 ----
  const [profiles, setProfiles] = useState([])
  const [selected, setSelected] = useState(null) // profile 名；null = 当前
  const [createOpen, setCreateOpen] = useState(false)

  // ---- 子视图与对话框 ----
  const [view, setView] = useState('plugins') // plugins | configs
  const [configs, setConfigs] = useState([])
  const [installOpen, setInstallOpen] = useState(false)
  const [success, setSuccess] = useState(null) // 操作成功提示（绿色，自动消失）
  const [confirm, setConfirm] = useState(CONFIRM_DEFAULTS)
  const [purgeData, setPurgeData] = useState(false) // 卸载时是否同时删除插件数据（默认保留）

  const currentName = profiles.find(p => p.isCurrent)?.name ?? null
  // 操作目标 profile：选中的 profile（缺省 = 当前运行 profile）。写操作跟随此目标。
  const effectiveProfile = selected !== null && selected !== currentName ? selected : currentName
  const targetIsCurrent = selected === null || selected === currentName

  const loadProfiles = useCallback(async () => {
    const data = await api(PROFILES_PATH)
    setProfiles(data.profiles ?? [])
    setSelected(prev => {
      const current = data.profiles.find(p => p.isCurrent)?.name ?? null
      // 保持用户选择；未选或所选已消失时回落到当前
      if (prev === null || !data.profiles.some(p => p.name === prev)) return current
      return prev
    })
  }, [])

  /** 加载当前视图的清单。当前 profile 含 ops/audit；其他 profile 仅清单。返回新清单插件列表。 */
  const load = useCallback(async () => {
    if (effectiveProfile === null) return []
    try {
      if (targetIsCurrent) {
        const data = await api(PLUGINS_PATH)
        const plugins = data.plugins ?? []
        setInventory({ profile: data.profile, plugins, ops: data.ops ?? [], audit: data.audit ?? [] })
        setOps(data.ops ?? [])
        setStatus('ready') // ← 关键：数据就绪必须置 ready，否则列表永远不渲染
        setError(null)
        return plugins
      }
      // 注意：PROFILE_PLUGINS_PREFIX 无尾部斜杠（webServer prefix 匹配要求），拼接必须补 '/'
      const data = await api(`${PROFILE_PLUGINS_PREFIX}/${encodeURIComponent(effectiveProfile)}/plugins`)
      const plugins = data.plugins ?? []
      setInventory({ profile: data.profile, plugins, ops: [], audit: [] })
      setOps([])
      setStatus('ready')
      setError(null)
      return plugins
    } catch (e) {
      setStatus(s => (s === 'ready' ? s : 'error'))
      setError(String(e?.message ?? e))
      return []
    }
  }, [effectiveProfile, targetIsCurrent])

  const loadConfigs = useCallback(async () => {
    try {
      const data = await api(CONFIGS_PATH)
      setConfigs(data.configs ?? [])
      setError(null)
    } catch (e) {
      setError(String(e?.message ?? e))
    }
  }, [])

  useEffect(() => { void loadProfiles() }, [loadProfiles])
  useEffect(() => { if (effectiveProfile !== null) void load() }, [effectiveProfile, load])
  useEffect(() => { if (view === 'configs' && targetIsCurrent) void loadConfigs() }, [view, targetIsCurrent, loadConfigs])

  // ---- 操作 ----
  const successTimer = useRef(null)
  /** 绿色成功提示（自动消失）。 */
  const showSuccess = useCallback((message) => {
    setSuccess(message)
    clearTimeout(successTimer.current)
    successTimer.current = setTimeout(() => setSuccess(null), 6000)
  }, [])

  const watchOp = useCallback((opId, restartNeeded, beforeVersions) => {
    if (opId === undefined || opId === null || watchers.current.has(opId)) return
    watchers.current.set(opId, true)
    const tick = async () => {
      let op = null
      try { op = await api(`${OPS_PATH}/${encodeURIComponent(opId)}`) } catch { /* 单次失败重试 */ }
      if (op !== null) {
        setOps(prev => [op, ...prev.filter(o => o.id !== op.id)])
        if (op.status === 'running') { setTimeout(tick, 800); return }
        if (op.status === 'error') {
          // 操作失败：明确展示原因（错误信息 + pnpm 输出尾部），不再静默
          const tail = (op.lines ?? []).slice(-3).join(' ')
          setError(`操作失败：${op.error ?? `pnpm 退出码 ${op.exitCode ?? '?'}`}${tail !== '' ? `（${tail}）` : ''}`)
          return
        }
        // 操作成功：绿色提示（含重启说明），不再弹黄色警告
        if (op.status === 'ok') {
          const restartNote = restartNeeded ? '（重启 DSH 后生效）' : ''
          if (op.action === 'install') {
            showSuccess(`✅ 安装成功：${op.target}${restartNote}`)
          } else if (op.action === 'uninstall') {
            showSuccess(`✅ 卸载成功：${op.target}${restartNote}`)
          } else if (op.action === 'update-all') {
            showSuccess(`✅ 全部更新成功${restartNote}`)
          } else if (op.action === 'update') {
            // 更新完成：刷新清单做版本对比，并入成功消息
            const fresh = await load()
            const after = fresh.find(p => p.name === op.target)?.version ?? null
            const before = beforeVersions !== null && beforeVersions[op.target] !== undefined ? beforeVersions[op.target] : null
            const version = before !== null && after !== null && before !== after ? ` ${before} → ${after}` : ''
            showSuccess(`✅ 更新成功：${op.target}${version}${restartNote}`)
            return
          }
        }
        void load()
        return
      }
      setTimeout(tick, 1500)
    }
    setTimeout(tick, 300)
  }, [load, showSuccess])

  /** 写操作的目标 profile 参数：当前 profile 省略（后端缺省），其他 profile 显式指定。 */
  const profileArg = targetIsCurrent ? undefined : effectiveProfile

  /** 统一操作包装：任何请求错误都显示到错误横幅（不再静默吞掉）。 */
  const runOp = useCallback(async (fn) => {
    try {
      await fn()
      return true
    } catch (e) {
      setError(String(e?.message ?? e))
      return false
    }
  }, [])

  /**
   * 安装：固定格式指令 `dsh plugin [--profile <name>] add <plugin>`（服务端严格解析）。
   * 命令未指定 --profile 时，服务端回退到 UI 当前选中的目标 profile（profileArg，
   * 缺省 = 当前运行 profile）——不会装错地方。
   */
  const doInstall = useCallback(async (command) => {
    setInstallOpen(false)
    await runOp(async () => {
      const result = await api(INSTALL_PATH, { method: 'POST', body: { command, profile: profileArg } })
      watchOp(result.opId, result.restartNeeded === true, null)
    })
  }, [watchOp, profileArg, runOp])

  const doUninstall = useCallback(async (plugin, purgeData) => {
    setConfirm(CONFIRM_DEFAULTS)
    await runOp(async () => {
      const result = await api(UNINSTALL_PATH, { method: 'POST', body: { name: plugin.name, profile: profileArg, purgeData: purgeData === true } })
      watchOp(result.opId, result.restartNeeded === true, null)
    })
  }, [watchOp, profileArg, runOp])

  const doUpdate = useCallback(async (plugin) => {
    setConfirm(CONFIRM_DEFAULTS)
    const beforeVersions = {}
    for (const p of inventory?.plugins ?? []) beforeVersions[p.name] = p.version
    await runOp(async () => {
      const result = await api(UPDATE_PATH, { method: 'POST', body: { ...(plugin === null ? {} : { name: plugin.name }), profile: profileArg } })
      watchOp(result.opId, result.restartNeeded === true, plugin === null ? null : beforeVersions)
    })
  }, [watchOp, inventory, profileArg, runOp])

  const doToggle = useCallback(async (plugin, enabled) => {
    await runOp(async () => {
      await api(TOGGLE_PATH, {
        method: 'POST',
        body: { rowId: plugin.rowIds.length > 0 ? plugin.rowIds[0] : plugin.name, enabled, profile: profileArg },
      })
      await load() // 当前 profile 热生效；其他 profile 写入下次启动生效
    })
  }, [load, profileArg, runOp])

  const doSaveConfig = useCallback(async (ns, patch, expectedRevision) => {
    await api(`${CONFIGS_PREFIX}/${encodeURIComponent(ns)}`, {
      method: 'POST',
      body: { patch, expectedRevision },
    })
    await loadConfigs()
  }, [loadConfigs])

  const doCreateProfile = useCallback(async (name) => {
    setCreateOpen(false)
    const created = await api(PROFILE_CREATE_PATH, { method: 'POST', body: { name } })
    await loadProfiles()
    setSelected(created.name) // 切到新 profile 作为操作目标
    setView('plugins')
  }, [loadProfiles])

  const runWithBusy = useCallback(async (fn) => {
    setBusy(true)
    try { await fn() } finally { setBusy(false) }
  }, [])

  // ---- 渲染数据 ----
  const filtered = inventory === null
    ? []
    : inventory.plugins.filter(p => {
        const q = query.trim().toLocaleLowerCase()
        if (q === '') return true
        const name = typeof p.name === 'string' ? p.name.toLocaleLowerCase() : ''
        const desc = typeof p.description === 'string' ? p.description.toLocaleLowerCase() : ''
        return name.includes(q) || desc.includes(q)
      })

  const confirmContent = (() => {
    const targetLabel = targetIsCurrent ? `当前 profile（${currentName ?? '?'}）` : `profile「${selected}」`
    if (confirm.kind === 'uninstall') {
      return {
        title: `卸载 ${confirm.plugin.name}`,
        body: (
          <div className="pm-modal-body">
            <p>将作用于 <strong>{targetLabel}</strong>：执行 <code>pnpm remove {confirm.plugin.name}</code> 并从 bundle 层移除。卸载后需重启生效。</p>
            <label className="pm-toggle" style={{ alignItems: 'flex-start' }}>
              <input
                type="checkbox"
                checked={purgeData}
                onChange={e => setPurgeData(e.target.checked)}
              />
              <span>
                <strong>同时删除插件数据</strong>（<code>~/.dsh/data/{confirm.plugin.name}/</code>、
                <code>profiles/*/data/{confirm.plugin.name}/</code>、settings 配置）——<span style={{ color: 'var(--dsw-alias-state-error-primary, #C0392B)' }}>不可恢复</span>
              </span>
            </label>
            <p className="pm-sub">不勾选则保留数据，重装插件后自动恢复使用。</p>
          </div>
        ),
        ok: '确认卸载',
        danger: true,
        onOk: () => runWithBusy(() => doUninstall(confirm.plugin, purgeData)),
      }
    }
    if (confirm.kind === 'update') {
      return {
        title: `更新 ${confirm.plugin.name}`,
        body: <div className="pm-modal-body"><p>将作用于 <strong>{targetLabel}</strong>：执行 <code>pnpm update {confirm.plugin.name}</code>。更新后需重启生效。</p></div>,
        ok: '确认更新',
        danger: false,
        onOk: () => runWithBusy(() => doUpdate(confirm.plugin)),
      }
    }
    if (confirm.kind === 'updateAll') {
      return {
        title: '全部更新',
        body: <div className="pm-modal-body"><p>将作用于 <strong>{targetLabel}</strong>：执行 <code>pnpm update</code>，更新所有依赖到允许范围内最新版本。更新后需重启生效。</p></div>,
        ok: '确认全部更新',
        danger: false,
        onOk: () => runWithBusy(() => doUpdate(null)),
      }
    }
    return null
  })()

  return (
    <div className="pm-root" data-plugin-manager>
      {/* ---- 头部：profile 选择 + 操作按钮 ---- */}
      <div className="pm-head">
        <div className="pm-head-left">
          <span className="pm-title">插件管理</span>
          <select
            className="pm-profile-select"
            value={selected ?? ''}
            onChange={e => { setSelected(e.target.value === '' ? null : e.target.value) }}
            aria-label="选择 profile"
            title="操作目标 profile：安装/卸载/更新/启停将作用于选中的 profile"
          >
            <option value="">（当前 profile）</option>
            {profiles.map(p => (
              <option key={p.name} value={p.name}>{p.name}{p.isCurrent ? '（当前）' : ''}</option>
            ))}
          </select>
          <button type="button" className="pm-btn" onClick={() => setCreateOpen(true)} disabled={busy}>新建 profile</button>
        </div>
        <div className="pm-actions">
          <button type="button" className="pm-btn" onClick={() => void runWithBusy(async () => { await loadProfiles(); await load(); if (view === 'configs' && targetIsCurrent) await loadConfigs() })} disabled={busy} title="重新拉取清单/操作记录数据">刷新列表</button>
          <button type="button" className="pm-btn" onClick={() => setConfirm({ kind: 'updateAll', plugin: null })} disabled={busy || inventory === null}>全部更新</button>
          <button type="button" className="pm-btn pm-btn-primary" onClick={() => setInstallOpen(true)}>安装插件</button>
        </div>
      </div>

      {/* ---- 子视图切换 ---- */}
      <div className="pm-tabs" role="tablist">
        <button type="button" role="tab" aria-selected={view === 'plugins'} className={view === 'plugins' ? 'pm-tab pm-tab-active' : 'pm-tab'} onClick={() => setView('plugins')}>插件</button>
        <button type="button" role="tab" aria-selected={view === 'configs'} className={view === 'configs' ? 'pm-tab pm-tab-active' : 'pm-tab'} onClick={() => { setView('configs'); if (targetIsCurrent) void loadConfigs() }} disabled={!targetIsCurrent} title={!targetIsCurrent ? '配置仅对当前 profile 可用' : undefined}>配置</button>
      </div>

      {!targetIsCurrent ? (
        <div className="pm-banner pm-banner-warn">
          🎯 操作目标：<strong>{selected}</strong> profile。安装/卸载/更新/启停将写入该 profile（若它不是当前运行的 profile，变更在其下次启动时生效）。
        </div>
      ) : null}

      {success !== null ? (
        <div className="pm-banner pm-banner-success" role="status">{success}</div>
      ) : null}

      {error !== null ? (
        <div className="pm-banner pm-banner-error" role="alert">
          {error}
          <button type="button" className="pm-btn" style={{ marginLeft: 8 }} onClick={() => void runWithBusy(async () => { if (view === 'configs' && targetIsCurrent) await loadConfigs(); await load() })}>重试</button>
        </div>
      ) : null}

      {view === 'plugins' ? (
        <>
          <div className="pm-search">
            <input type="search" value={query} placeholder="搜索插件（名称/描述）" aria-label="搜索插件" onChange={e => setQuery(e.target.value)} />
            <span className="pm-count">{filtered.length} / {inventory?.plugins.length ?? 0} 个</span>
          </div>
          {status === 'loading' ? <div className="pm-empty">加载中…</div> : null}
          {status === 'error' ? <div className="pm-empty">加载失败，请重试</div> : null}
          {status === 'ready' && filtered.length === 0 ? <div className="pm-empty">{query ? '无匹配插件' : `${effectiveProfile ?? ''} profile 无已安装插件`}</div> : null}
          {status === 'ready' && filtered.length > 0 ? (
            <ul className="pm-grid" style={{ listStyle: 'none', margin: 0, padding: 0 }}>
              {filtered.map(plugin => (
                <PluginCard
                  key={plugin.name}
                  plugin={plugin}
                  busy={busy}
                  onToggle={doToggle}
                  onUpdate={plugin => setConfirm({ kind: 'update', plugin })}
                  onUninstall={plugin => { setPurgeData(false); setConfirm({ kind: 'uninstall', plugin }) }}
                  onError={setError}
                />
              ))}
            </ul>
          ) : null}
        </>
      ) : (
        <ConfigPanel configs={configs} busy={busy} onSave={doSaveConfig} onError={setError} />
      )}

      {installOpen ? <InstallDialog onCancel={() => setInstallOpen(false)} onInstall={command => runWithBusy(() => doInstall(command))} /> : null}
      {createOpen ? <NewProfileDialog onCancel={() => setCreateOpen(false)} onCreate={name => runWithBusy(() => doCreateProfile(name))} /> : null}

      {confirmContent !== null ? (
        <div className="pm-modal-backdrop" role="presentation" onMouseDown={(e) => { if (e.target === e.currentTarget && !busy) setConfirm(CONFIRM_DEFAULTS) }}>
          <div className="pm-modal" role="dialog" aria-modal="true">
            <h3>{confirmContent.title}</h3>
            {confirmContent.body}
            <div className="pm-modal-foot">
              <button type="button" className="pm-btn" disabled={busy} onClick={() => setConfirm(CONFIRM_DEFAULTS)}>取消</button>
              <button
                type="button"
                className={confirmContent.danger ? 'pm-btn pm-btn-danger' : 'pm-btn pm-btn-primary'}
                disabled={busy}
                onClick={() => void confirmContent.onOk()}
              >
                {busy ? '执行中…' : confirmContent.ok}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
