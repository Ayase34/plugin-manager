// 插件管理器样式（作用域前缀 pm-）。
// 配色策略（跟随 DSH 默认/主题）：
// 1. 文字颜色一律 inherit——继承宿主的主题色（亮/暗自动正确），层级用 opacity 表达；
// 2. 背景/边框用 DSH 主题变量（--dsw-alias-*）；变量缺失时兜底系统色
//    Canvas/CanvasText（随 color-scheme 自动切换），绝不硬编码白/黑假设；
// 3. 语义色（警告/错误/成功）用主题变量，兜底深色系语义色（亮暗背景均可读）。
export const CSS = `
[data-plugin-manager] { color: inherit; }
/* 根元素自身携带 data-plugin-manager——必须用无空格选择器（后代选择器匹配不到自身） */
[data-plugin-manager].pm-root { display: grid; gap: 20px; }
[data-plugin-manager] .pm-head { display: flex; align-items: center; justify-content: space-between; gap: 14px; flex-wrap: wrap; }
[data-plugin-manager] .pm-head-left { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
[data-plugin-manager] .pm-title { font-size: 15px; font-weight: 600; }
[data-plugin-manager] .pm-sub { font-size: 12px; opacity: .68; }
[data-plugin-manager] .pm-actions { display: flex; gap: 10px; align-items: center; }
/* 按钮样式对齐官方 ui-primitives Button：基类 bordered（透明底 + border-l2），primary 用
   button-primary-fill 填充 + label-primary-foreground 前景（不是 brand-text——后者在暗色主题
   与填充同为白色，会白底白字） */
[data-plugin-manager] .pm-btn { border: 1px solid var(--dsw-alias-border-l2, rgba(128,128,128,.35)); background: transparent; color: inherit; border-radius: 8px; padding: 6px 14px; font-size: 12px; cursor: pointer; }
[data-plugin-manager] .pm-btn:hover:not(:disabled) { background: var(--dsw-alias-interactive-bg-hover, rgba(128,128,128,.14)); }
[data-plugin-manager] .pm-btn:disabled { opacity: .45; cursor: not-allowed; }
[data-plugin-manager] .pm-btn-primary { background: var(--dsw-alias-button-primary-fill, transparent); color: var(--dsw-alias-label-primary-foreground, var(--dsw-alias-label-primary, inherit)); border: none; }
[data-plugin-manager] .pm-btn-primary:hover:not(:disabled) { background: var(--dsw-alias-button-primary-hover, rgba(128,128,128,.2)); }
[data-plugin-manager] .pm-btn-danger { border-color: var(--dsw-alias-state-error-primary, rgba(192,57,43,.55)); color: var(--dsw-alias-state-error-primary, #C0392B); }
[data-plugin-manager] .pm-banner { border-radius: 8px; padding: 10px 14px; font-size: 12px; line-height: 1.6; }
[data-plugin-manager] .pm-banner-warn { background: var(--dsw-alias-state-warn-secondary, transparent); border: 1px solid var(--dsw-alias-state-warn-primary, rgba(184,134,11,.5)); color: inherit; }
[data-plugin-manager] .pm-banner-error { background: var(--dsw-alias-state-error-secondary, transparent); border: 1px solid var(--dsw-alias-state-error-primary, rgba(192,57,43,.5)); color: inherit; }
[data-plugin-manager] .pm-search { display: flex; gap: 10px; align-items: center; }
[data-plugin-manager] .pm-search input { flex: 1; min-width: 0; background: var(--dsw-alias-bg-mask-1, transparent); border: 1px solid var(--dsw-alias-border-l1, rgba(128,128,128,.3)); color: inherit; border-radius: 8px; padding: 8px 12px; font-size: 12px; }
[data-plugin-manager] .pm-search input::placeholder { opacity: .5; }
[data-plugin-manager] .pm-count { font-size: 12px; opacity: .68; white-space: nowrap; }
[data-plugin-manager] .pm-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 14px; }
[data-plugin-manager] .pm-card { border: 1px solid var(--dsw-alias-border-l1, rgba(128,128,128,.25)); border-radius: 12px; padding: 14px 16px; background: var(--dsw-alias-bg-layer-1, Canvas); display: grid; gap: 10px; }
[data-plugin-manager] .pm-card-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 10px; }
[data-plugin-manager] .pm-card-name { font-weight: 600; font-size: 13px; word-break: break-all; }
[data-plugin-manager] .pm-card-ver { font-size: 11px; opacity: .6; margin-left: 6px; }
[data-plugin-manager] .pm-card-desc { font-size: 12px; opacity: .72; line-height: 1.5; }
[data-plugin-manager] .pm-badges { display: flex; gap: 8px; flex-wrap: wrap; }
[data-plugin-manager] .pm-badge { font-size: 10px; border-radius: 5px; padding: 2px 7px; border: 1px solid var(--dsw-alias-border-l2, rgba(128,128,128,.4)); color: inherit; opacity: .9; }
[data-plugin-manager] .pm-badge-system { background: var(--dsw-alias-bg-mask-2, rgba(128,128,128,.18)); }
[data-plugin-manager] .pm-badge-bundle { background: var(--dsw-alias-button-primary-dimmed, rgba(128,128,128,.14)); border-color: var(--dsw-alias-button-primary-dimmed, rgba(80,120,230,.4)); }
[data-plugin-manager] .pm-badge-self { background: var(--dsw-alias-state-warn-secondary, rgba(128,128,128,.12)); border-color: var(--dsw-alias-state-warn-primary, rgba(184,134,11,.45)); }
[data-plugin-manager] .pm-card-foot { display: flex; align-items: center; justify-content: space-between; gap: 10px; }
[data-plugin-manager] .pm-toggle { display: flex; align-items: center; gap: 8px; font-size: 12px; cursor: pointer; }
[data-plugin-manager] .pm-toggle input { cursor: pointer; accent-color: var(--dsw-alias-brand-primary, Highlight); }
[data-plugin-manager] .pm-toggle:has(input:disabled) { opacity: .45; cursor: not-allowed; }
[data-plugin-manager] .pm-actions-mini { display: flex; gap: 8px; }
[data-plugin-manager] .pm-details { border-top: 1px dashed var(--dsw-alias-border-l2, rgba(128,128,128,.3)); padding-top: 10px; display: grid; gap: 6px; font-size: 11px; }
[data-plugin-manager] .pm-details code { background: var(--dsw-alias-bg-mask-1, rgba(128,128,128,.15)); border-radius: 4px; padding: 1px 5px; word-break: break-all; }
[data-plugin-manager] .pm-details-row { display: flex; gap: 8px; }
[data-plugin-manager] .pm-details-key { opacity: .55; min-width: 64px; flex-shrink: 0; }
[data-plugin-manager] .pm-details-val { opacity: .85; word-break: break-all; }
[data-plugin-manager] .pm-empty { font-size: 12px; opacity: .55; text-align: center; padding: 24px 0; }
[data-plugin-manager] .pm-modal-backdrop { position: fixed; inset: 0; background: var(--dsw-alias-bg-mask-drop, rgba(0,0,0,.4)); display: grid; place-items: center; z-index: 2147483100; }
[data-plugin-manager] .pm-modal { width: min(480px, calc(100vw - 32px)); max-height: calc(100vh - 64px); overflow: auto; background: var(--dsw-alias-bg-overlay, Canvas); border: 1px solid var(--dsw-alias-border-l2, rgba(128,128,128,.35)); border-radius: 12px; padding: 20px; display: grid; gap: 16px; }
[data-plugin-manager] .pm-modal h3 { margin: 0; font-size: 14px; }
[data-plugin-manager] .pm-modal-body { font-size: 12px; line-height: 1.65; display: grid; gap: 12px; }
[data-plugin-manager] .pm-modal input[type=text] { background: var(--dsw-alias-bg-mask-1, transparent); border: 1px solid var(--dsw-alias-border-l1, rgba(128,128,128,.3)); color: inherit; border-radius: 8px; padding: 9px 12px; font-size: 13px; width: 100%; box-sizing: border-box; }
[data-plugin-manager] .pm-modal-foot { display: flex; justify-content: flex-end; gap: 10px; }
[data-plugin-manager] .pm-warn { background: var(--dsw-alias-state-warn-secondary, transparent); border: 1px solid var(--dsw-alias-state-warn-primary, rgba(184,134,11,.45)); border-radius: 8px; padding: 10px 14px; font-size: 12px; color: inherit; line-height: 1.6; }
[data-plugin-manager] .pm-ops { border: 1px solid var(--dsw-alias-border-l1, rgba(128,128,128,.25)); border-radius: 10px; overflow: hidden; }
[data-plugin-manager] .pm-ops-head { display: flex; align-items: center; gap: 10px; padding: 10px 16px; cursor: pointer; font-size: 12px; background: var(--dsw-alias-bg-mask-1, transparent); }
[data-plugin-manager] .pm-ops-list { display: grid; }
[data-plugin-manager] .pm-op { padding: 10px 16px; border-top: 1px solid var(--dsw-alias-border-l1, rgba(128,128,128,.18)); display: grid; gap: 8px; }
[data-plugin-manager] .pm-op-head { display: flex; align-items: center; gap: 10px; font-size: 12px; flex-wrap: wrap; }
[data-plugin-manager] .pm-op-target { opacity: .8; word-break: break-all; }
[data-plugin-manager] .pm-op-time { opacity: .5; font-size: 11px; margin-left: auto; }
[data-plugin-manager] .pm-status { font-size: 10px; border-radius: 5px; padding: 2px 8px; border: 1px solid var(--dsw-alias-border-l2, rgba(128,128,128,.35)); }
[data-plugin-manager] .pm-status-running { background: var(--dsw-alias-button-primary-dimmed, rgba(128,128,128,.15)); border-color: var(--dsw-alias-button-primary-dimmed, rgba(80,120,230,.45)); }
[data-plugin-manager] .pm-status-ok { background: var(--dsw-alias-state-success-secondary, rgba(128,128,128,.12)); border-color: var(--dsw-alias-state-success-primary, rgba(30,132,73,.45)); }
[data-plugin-manager] .pm-status-error { background: var(--dsw-alias-state-error-secondary, rgba(128,128,128,.12)); border-color: var(--dsw-alias-state-error-primary, rgba(192,57,43,.5)); }
[data-plugin-manager] .pm-op-lines { max-height: 220px; overflow: auto; background: var(--dsw-alias-bg-mask-1, rgba(128,128,128,.12)); border-radius: 8px; padding: 10px 12px; font-family: ui-monospace, Consolas, monospace; font-size: 11px; line-height: 1.55; white-space: pre-wrap; word-break: break-all; }
[data-plugin-manager] .pm-op-line-error { color: var(--dsw-alias-state-error-primary, #C0392B); }
[data-plugin-manager] .pm-spin { display: inline-block; width: 10px; height: 10px; border: 2px solid var(--dsw-alias-border-l2, rgba(128,128,128,.35)); border-top-color: currentColor; border-radius: 50%; animation: pm-spin .8s linear infinite; vertical-align: -1px; }
@keyframes pm-spin { to { transform: rotate(360deg); } }
/* 原生下拉面板：跟随根 color-scheme；option 用系统色 Canvas/CanvasText（随主题自动切换） */
[data-plugin-manager] .pm-profile-select { background: var(--dsw-alias-bg-mask-1, transparent); border: 1px solid var(--dsw-alias-border-l2, rgba(128,128,128,.35)); color: inherit; border-radius: 8px; padding: 6px 10px; font-size: 12px; }
[data-plugin-manager] .pm-profile-select option { background: Canvas; color: CanvasText; }
[data-plugin-manager] .pm-tabs { display: flex; gap: 8px; border-bottom: 1px solid var(--dsw-alias-border-l1, rgba(128,128,128,.25)); }
[data-plugin-manager] .pm-tab { border: 0; background: none; color: inherit; opacity: .65; padding: 8px 16px; font-size: 13px; cursor: pointer; border-bottom: 2px solid transparent; }
[data-plugin-manager] .pm-tab:hover:not(:disabled) { opacity: .9; }
[data-plugin-manager] .pm-tab:disabled { opacity: .35; cursor: not-allowed; }
[data-plugin-manager] .pm-tab-active { opacity: 1; border-bottom-color: var(--dsw-alias-brand-primary, currentColor); }
[data-plugin-manager] .pm-configs { display: grid; gap: 14px; }
[data-plugin-manager] .pm-cfg-card { border: 1px solid var(--dsw-alias-border-l1, rgba(128,128,128,.25)); border-radius: 12px; padding: 16px; background: var(--dsw-alias-bg-layer-1, Canvas); display: grid; gap: 12px; }
[data-plugin-manager] .pm-cfg-head { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
[data-plugin-manager] .pm-cfg-ns { font-size: 13px; font-weight: 600; }
[data-plugin-manager] .pm-cfg-form { display: grid; gap: 10px; }
[data-plugin-manager] .pm-cfg-row { display: grid; grid-template-columns: minmax(120px, 220px) 1fr; gap: 12px; align-items: start; font-size: 12px; }
[data-plugin-manager] .pm-cfg-label { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; padding-top: 6px; opacity: .85; }
[data-plugin-manager] .pm-cfg-label em { font-style: normal; opacity: .55; font-size: 11px; }
[data-plugin-manager] .pm-cfg-input { background: var(--dsw-alias-bg-mask-1, transparent); border: 1px solid var(--dsw-alias-border-l1, rgba(128,128,128,.3)); color: inherit; border-radius: 7px; padding: 6px 10px; font-size: 12px; min-width: 0; width: 100%; box-sizing: border-box; }
[data-plugin-manager] .pm-cfg-input[type=checkbox] { width: auto; justify-self: start; margin-top: 5px; accent-color: var(--dsw-alias-brand-primary, Highlight); }
[data-plugin-manager] .pm-cfg-json { background: var(--dsw-alias-bg-mask-1, rgba(128,128,128,.1)); border: 1px solid var(--dsw-alias-border-l1, rgba(128,128,128,.3)); color: inherit; border-radius: 7px; padding: 8px 10px; font-family: ui-monospace, Consolas, monospace; font-size: 11px; line-height: 1.55; width: 100%; box-sizing: border-box; resize: vertical; }
[data-plugin-manager] .pm-cfg-json.pm-cfg-error { border-color: var(--dsw-alias-state-error-primary, rgba(192,57,43,.6)); }
[data-plugin-manager] .pm-cfg-err { color: var(--dsw-alias-state-error-primary, #C0392B); font-size: 11px; }
[data-plugin-manager] .pm-cfg-hidden { opacity: .5; font-size: 12px; padding-top: 6px; }
[data-plugin-manager] .pm-cfg-fixed { opacity: .7; padding-top: 6px; }
[data-plugin-manager] .pm-cfg-group { display: grid; gap: 10px; border-left: 2px solid var(--dsw-alias-border-l1, rgba(128,128,128,.25)); padding-left: 12px; }
[data-plugin-manager] .pm-cfg-foot { display: flex; justify-content: flex-end; gap: 10px; }
`
