/** plugin-manager 浏览器 half：注册 设置→插件 的「插件管理」选项卡。
 * 官方 bundle 插件 client 契约：经 __ModuleLoader__.load 挂载，export name/inject/apply；
 * apply 收到 client 根 ctx，用 ctx.slots.inject 等待设置槽位声明后注册
 * （卸载时随纤维自动移除选项卡）。全部交互经 Node half 的 /plugin-manager/* 路由。
 */

import { CSS } from './styles.mjs'
import { PluginManagerTab } from './PluginManagerTab.jsx'

export const name = 'plugin-manager'

/** 依赖服务：槽位系统。 */
export const inject = ['slots']

/**
 * 客户端插件入口：注入样式、注册设置选项卡。
 * @param ctx - client 根上下文（提供 slots 服务）。
 */
export function apply(ctx) {
  // 幂等守卫：重复执行（HMR/loader 重跑）不重复注入样式。
  if (document.querySelector('style[data-plugin-manager-style]') !== null) return

  const styleEl = document.createElement('style')
  styleEl.setAttribute('data-plugin-manager-style', '')
  styleEl.setAttribute('data-plugin', 'plugin-manager')
  styleEl.textContent = CSS
  document.head.append(styleEl)

  ctx.effect(() => () => { styleEl.remove() }, 'plugin-manager: styles')

  // 设置面板「插件」分区下的「插件管理」选项卡。
  ctx.slots.inject('settings.plugins.tab', () => ctx.slots.register({
    name: 'settings.plugins.tab',
    id: 'plugin-manager',
    order: 30,
    label: () => '插件管理',
    inject: () => ({}),
  }, PluginManagerTab))
}
