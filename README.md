# plugin-manager — DSH 插件管理器

DSH Web GUI 的插件管理插件：在 **设置 → 插件** 页新增「插件管理」选项卡，
提供插件总览、安装、卸载、更新、启用/禁用、多 profile 管理、配置编辑与操作审计。

## 功能

| 功能 | 说明 | 生效方式 |
|---|---|---|
| 插件总览 | 卡片列表：名称/版本/描述/来源/loader 状态/bundle·client 声明；搜索过滤 | — |
| 多 profile | 头部下拉切换操作目标 profile；浏览各 profile 的插件与 bundle 层；新建 profile | — |
| 安装 | 支持 npm 包名 / `github:owner/repo#branch` / 本地路径（`link:` 软链）；**安装到当前选中的 profile** | 需重启生效 |
| 卸载 | `pnpm remove` + bundle 层自动清理 + 孤儿覆盖清理 | 需重启生效 |
| 更新 | 单个或全部，pnpm 输出实时可见，完成后版本对比报告（x → y） | 需重启生效 |
| 启用/禁用 | 写用户层 `cordis.patch.yml` 的 id-targeted `disabled` 覆盖 | 当前 profile 热生效；其他 profile 下次启动生效 |
| 配置编辑 | 「配置」子视图：对注册了 settings schema 的 namespace 渲染表单（schemastery schema → 控件），diff 补丁 + revision 冲突检测；secret 字段只读保留 | 按插件 applies 声明 |
| 操作审计 | 每次操作写入 `~/.dsh/data/plugin-manager/ops.log`（JSONL） | — |

系统 bundle（`@deepseek-ai/dsh-base` 等）与插件管理器自身禁止卸载/禁用（防锁死）。
写操作（装/卸/更/启停）的目标 = UI 选中的 profile；缺省 = 当前运行 profile。

## 架构

- **Node half**（`.dsh-plugin/index.mjs`，纯 ESM 零依赖）：Cordis 插件，`inject: ['webServer', 'settings']`，
  路由端点单一来源 `src/routes.mjs`；装/卸/更 = 目标 profile 目录内 `spawn pnpm`
  （与官方 `dsh plugin` CLI 同底层），完成后按官方规则 reconcile `dsh.profile.bundles`；
  启/禁用 = 最小 YAML 子集（`src/yaml.mjs`）安全读写 `cordis.patch.yml`；
  配置 = `ctx.settings.describe/update`（redactSecrets 视图，secret 字段不触碰）。
- **Client half**（`.dsh-plugin/client/`）：React 组件经 esbuild 打包为 `client.js`
  （`__ModuleLoader__.load` 契约），`ctx.slots.inject('settings.plugins.tab')` 注册选项卡；
  插件/配置两个子视图，profile 选择器，浏览任意 profile。
- **安全**：POST 全部 CSRF 校验（跨源拒绝）、请求体上限 16KB、安装任意包=执行其代码的醒目警告、
  目标 profile 显式校验存在。

## 开发

```bash
pnpm install            # 安装 esbuild（构建 client.js 用）
pnpm run build:client   # .dsh-plugin/client/index.mjs → client.js
pnpm run check:client   # 校验生成物新鲜（禁止手改 client.js）
pnpm test               # node --test 单元测试（yaml/reconcile/inventory/patch/profiles）
```

安装到任意 profile（开发迭代用 `link:`）：

```bash
dsh plugin --profile <name> add link:<本目录绝对路径>
```

改代码后：Node half 改动需重启 web；client 改动只需刷新页面（重新构建 client.js 后）。

## 路由

| 方法 | 路径 | 说明 |
|---|---|---|
| GET | `/plugin-manager/plugins` | 当前 profile 清单 + 本次会话操作 + 审计尾部 |
| GET | `/plugin-manager/profiles` | profile 列表（当前置顶，排除 node_modules 回退） |
| GET | `/plugin-manager/profiles/:name/plugins` | 指定 profile 的只读清单 |
| POST | `/plugin-manager/profiles/create` | `{name}` → 新建 profile（模板 bundles + pnpm 骨架） |
| POST | `/plugin-manager/plugins/install` | `{command}` → `{opId, restartNeeded, profile}`；仅接受固定格式 `dsh plugin --profile <name> add <plugin>` |
| POST | `/plugin-manager/plugins/uninstall` | `{name, profile?}` → `{opId, restartNeeded, profile}` |
| POST | `/plugin-manager/plugins/update` | `{name?, profile?}`（缺省全部）→ `{opId, restartNeeded, profile}` |
| POST | `/plugin-manager/plugins/toggle` | `{rowId, enabled, profile?}` → 热生效 |
| GET | `/plugin-manager/ops/:id` | 操作轮询（输出行/状态/exitCode） |
| GET | `/plugin-manager/configs` | 已注册 settings namespace（schema/value/revision/redacted） |
| POST | `/plugin-manager/configs/:ns` | `{patch 或 section, expectedRevision}` → 最新描述 |

`profile` 字段缺省 = 当前运行 profile；显式指定可跨 profile 操作（写目标为其他 profile 时，变更在其下次启动生效）。

安装（固定格式，服务端严格校验）：

```
dsh plugin --profile <name> add <plugin>
```

`<plugin>` 支持：npm 包名（`picocolors`、`@scope/pkg`）、GitHub（`github:owner/repo#branch`）、
本地绝对路径（`C:/path`、`file:C:/path`、`link:C:/path`）。拒绝空格、shell 元字符与一切非白名单输入。

## 限制

- 配置编辑仅对当前运行 profile 可用（settings 服务是运行进程的）。
- 补丁文件含 `!!js` 等复杂 YAML 时拒绝启停编辑（防语义损坏），其余功能不受影响。
- 不提供一键重启 web（变更后仅提示）。
