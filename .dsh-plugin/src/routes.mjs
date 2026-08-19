// 路由端点单一来源：Node half 注册与 client 请求共用同一常量（client 经 esbuild 内联）。
export const ROUTE_PREFIX = '/plugin-manager'
export const PLUGINS_PATH = `${ROUTE_PREFIX}/plugins`
export const INSTALL_PATH = `${ROUTE_PREFIX}/plugins/install`
export const UNINSTALL_PATH = `${ROUTE_PREFIX}/plugins/uninstall`
export const UPDATE_PATH = `${ROUTE_PREFIX}/plugins/update`
export const TOGGLE_PATH = `${ROUTE_PREFIX}/plugins/toggle`
export const OPS_PATH = `${ROUTE_PREFIX}/ops`
export const PROFILES_PATH = `${ROUTE_PREFIX}/profiles`
export const PROFILE_CREATE_PATH = `${ROUTE_PREFIX}/profiles/create`
// 注意：prefix 常量不带尾部斜杠——webServer 的 prefix 匹配是 startsWith(prefix + '/')。
export const PROFILE_PLUGINS_PREFIX = `${ROUTE_PREFIX}/profiles`
export const CONFIGS_PATH = `${ROUTE_PREFIX}/configs`
export const CONFIGS_PREFIX = `${ROUTE_PREFIX}/configs`
