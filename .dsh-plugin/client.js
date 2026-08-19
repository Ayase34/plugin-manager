window.__ModuleLoader__.load({
	id: "plugin-manager",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name2 in all)
    __defProp(target, name2, { get: all[name2], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// .dsh-plugin/client/index.mjs
var index_exports = {};
__export(index_exports, {
  apply: () => apply,
  inject: () => inject,
  name: () => name
});
module.exports = __toCommonJS(index_exports);

// .dsh-plugin/client/styles.mjs
var CSS = `
[data-plugin-manager] { color: inherit; }
/* \u6839\u5143\u7D20\u81EA\u8EAB\u643A\u5E26 data-plugin-manager\u2014\u2014\u5FC5\u987B\u7528\u65E0\u7A7A\u683C\u9009\u62E9\u5668\uFF08\u540E\u4EE3\u9009\u62E9\u5668\u5339\u914D\u4E0D\u5230\u81EA\u8EAB\uFF09 */
[data-plugin-manager].pm-root { display: grid; gap: 20px; }
[data-plugin-manager] .pm-head { display: flex; align-items: center; justify-content: space-between; gap: 14px; flex-wrap: wrap; }
[data-plugin-manager] .pm-head-left { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
[data-plugin-manager] .pm-title { font-size: 15px; font-weight: 600; }
[data-plugin-manager] .pm-sub { font-size: 12px; opacity: .68; }
[data-plugin-manager] .pm-actions { display: flex; gap: 10px; align-items: center; }
/* \u6309\u94AE\u6837\u5F0F\u5BF9\u9F50\u5B98\u65B9 ui-primitives Button\uFF1A\u57FA\u7C7B bordered\uFF08\u900F\u660E\u5E95 + border-l2\uFF09\uFF0Cprimary \u7528
   button-primary-fill \u586B\u5145 + label-primary-foreground \u524D\u666F\uFF08\u4E0D\u662F brand-text\u2014\u2014\u540E\u8005\u5728\u6697\u8272\u4E3B\u9898
   \u4E0E\u586B\u5145\u540C\u4E3A\u767D\u8272\uFF0C\u4F1A\u767D\u5E95\u767D\u5B57\uFF09 */
[data-plugin-manager] .pm-btn { border: 1px solid var(--dsw-alias-border-l2, rgba(128,128,128,.35)); background: transparent; color: inherit; border-radius: 8px; padding: 6px 14px; font-size: 12px; cursor: pointer; }
[data-plugin-manager] .pm-btn:hover:not(:disabled) { background: var(--dsw-alias-interactive-bg-hover, rgba(128,128,128,.14)); }
[data-plugin-manager] .pm-btn:disabled { opacity: .45; cursor: not-allowed; }
[data-plugin-manager] .pm-btn-primary { background: var(--dsw-alias-button-primary-fill, transparent); color: var(--dsw-alias-label-primary-foreground, var(--dsw-alias-label-primary, inherit)); border: none; }
[data-plugin-manager] .pm-btn-primary:hover:not(:disabled) { background: var(--dsw-alias-button-primary-hover, rgba(128,128,128,.2)); }
[data-plugin-manager] .pm-btn-danger { border-color: var(--dsw-alias-state-error-primary, rgba(192,57,43,.55)); color: var(--dsw-alias-state-error-primary, #C0392B); }
[data-plugin-manager] .pm-banner { border-radius: 8px; padding: 10px 14px; font-size: 12px; line-height: 1.6; }
[data-plugin-manager] .pm-banner-warn { background: var(--dsw-alias-state-warn-secondary, transparent); border: 1px solid var(--dsw-alias-state-warn-primary, rgba(184,134,11,.5)); color: inherit; }
[data-plugin-manager] .pm-banner-success { background: var(--dsw-alias-state-success-secondary, rgba(128,128,128,.12)); border: 1px solid var(--dsw-alias-state-success-primary, rgba(30,132,73,.5)); color: inherit; }
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
/* \u539F\u751F\u4E0B\u62C9\u9762\u677F\uFF1A\u8DDF\u968F\u6839 color-scheme\uFF1Boption \u7528\u7CFB\u7EDF\u8272 Canvas/CanvasText\uFF08\u968F\u4E3B\u9898\u81EA\u52A8\u5207\u6362\uFF09 */
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
`;

// .dsh-plugin/client/PluginManagerTab.jsx
var import_react6 = __toESM(require("react"), 1);

// .dsh-plugin/client/api.mjs
async function api(path, options = {}) {
  let res;
  try {
    res = await fetch(path, {
      method: options.method ?? "GET",
      headers: { "content-type": "application/json" },
      body: options.body !== void 0 ? JSON.stringify(options.body) : void 0
    });
  } catch (error) {
    throw new Error("\u7F51\u7EDC\u9519\u8BEF\uFF1A" + String(error?.message ?? error));
  }
  let data = null;
  try {
    data = await res.json();
  } catch {
  }
  if (!res.ok) {
    throw new Error(data !== null && typeof data === "object" && typeof data.error === "string" ? data.error : `HTTP ${res.status}`);
  }
  if (data === null) {
    throw new Error("\u63D2\u4EF6\u670D\u52A1\u672A\u54CD\u5E94\uFF08\u54CD\u5E94\u4E0D\u662F JSON\uFF09\u3002\u53EF\u80FD\u539F\u56E0\uFF1ANode half \u672A\u52A0\u8F7D\uFF0C\u8BF7\u91CD\u542F DSH \u540E\u518D\u8BD5");
  }
  return data;
}
function opStatusLabel(status) {
  if (status === "running") return "\u8FD0\u884C\u4E2D";
  if (status === "ok") return "\u6210\u529F";
  if (status === "error") return "\u5931\u8D25";
  return status;
}
function opActionLabel(action) {
  if (action === "install") return "\u5B89\u88C5";
  if (action === "uninstall") return "\u5378\u8F7D";
  if (action === "update") return "\u66F4\u65B0";
  if (action === "update-all") return "\u5168\u90E8\u66F4\u65B0";
  return action;
}

// .dsh-plugin/src/routes.mjs
var ROUTE_PREFIX = "/plugin-manager";
var PLUGINS_PATH = `${ROUTE_PREFIX}/plugins`;
var INSTALL_PATH = `${ROUTE_PREFIX}/plugins/install`;
var UNINSTALL_PATH = `${ROUTE_PREFIX}/plugins/uninstall`;
var UPDATE_PATH = `${ROUTE_PREFIX}/plugins/update`;
var TOGGLE_PATH = `${ROUTE_PREFIX}/plugins/toggle`;
var OPS_PATH = `${ROUTE_PREFIX}/ops`;
var PROFILES_PATH = `${ROUTE_PREFIX}/profiles`;
var PROFILE_CREATE_PATH = `${ROUTE_PREFIX}/profiles/create`;
var PROFILE_PLUGINS_PREFIX = `${ROUTE_PREFIX}/profiles`;
var CONFIGS_PATH = `${ROUTE_PREFIX}/configs`;
var CONFIGS_PREFIX = `${ROUTE_PREFIX}/configs`;

// .dsh-plugin/client/PluginCard.jsx
var import_react = __toESM(require("react"), 1);
function badges(plugin) {
  const list = [];
  if (plugin.isSystem) list.push({ key: "system", label: "\u7CFB\u7EDF", cls: "pm-badge-system" });
  if (plugin.isSelf) list.push({ key: "self", label: "\u672C\u63D2\u4EF6", cls: "pm-badge-self" });
  if (plugin.isBundle) list.push({ key: "bundle", label: "bundle \u5C42", cls: "pm-badge-bundle" });
  if (plugin.dshClient) list.push({ key: "client", label: `client${plugin.clientPlatform ? ":" + plugin.clientPlatform : ""}`, cls: "pm-badge" });
  return list;
}
function PluginCard({ plugin, busy, onToggle, onUpdate, onUninstall, onError, readOnly = false }) {
  const [open, setOpen] = (0, import_react.useState)(false);
  const canManage = !readOnly && !plugin.isSystem && !plugin.isSelf;
  const protectedPlugin = plugin.isSystem || plugin.isSelf;
  const toggle = async (event) => {
    const next = event.target.checked;
    try {
      await onToggle(plugin, next);
    } catch (error) {
      onError(String(error?.message ?? error));
    }
  };
  return /* @__PURE__ */ import_react.default.createElement("li", { className: "pm-card", "data-plugin": plugin.name }, /* @__PURE__ */ import_react.default.createElement("div", { className: "pm-card-head" }, /* @__PURE__ */ import_react.default.createElement("span", null, /* @__PURE__ */ import_react.default.createElement("span", { className: "pm-card-name" }, plugin.name), plugin.version !== null ? /* @__PURE__ */ import_react.default.createElement("span", { className: "pm-card-ver" }, "v", plugin.version) : null), /* @__PURE__ */ import_react.default.createElement("div", { className: "pm-badges" }, badges(plugin).map((b) => /* @__PURE__ */ import_react.default.createElement("span", { key: b.key, className: "pm-badge " + b.cls }, b.label)))), plugin.description !== null && plugin.description !== "" ? /* @__PURE__ */ import_react.default.createElement("div", { className: "pm-card-desc" }, plugin.description) : null, /* @__PURE__ */ import_react.default.createElement("div", { className: "pm-card-foot" }, /* @__PURE__ */ import_react.default.createElement("label", { className: "pm-toggle", title: readOnly ? "\u6D4F\u89C8\u6A21\u5F0F\uFF08\u53EA\u8BFB\uFF09" : protectedPlugin ? plugin.isSystem ? "\u7CFB\u7EDF bundle \u4E0D\u53EF\u7981\u7528" : "\u63D2\u4EF6\u7BA1\u7406\u5668\u81EA\u8EAB\u4E0D\u53EF\u7981\u7528" : "\u5207\u6362\u540E\u7ACB\u5373\u751F\u6548\uFF08\u65E0\u9700\u91CD\u542F\uFF09" }, /* @__PURE__ */ import_react.default.createElement(
    "input",
    {
      type: "checkbox",
      checked: plugin.enabled,
      disabled: !canManage || busy,
      onChange: toggle
    }
  ), /* @__PURE__ */ import_react.default.createElement("span", null, plugin.enabled ? "\u5DF2\u542F\u7528" : "\u5DF2\u7981\u7528")), /* @__PURE__ */ import_react.default.createElement("div", { className: "pm-actions-mini" }, canManage && plugin.isBundle ? /* @__PURE__ */ import_react.default.createElement("button", { type: "button", className: "pm-btn", disabled: busy, onClick: () => onUpdate(plugin), title: "\u66F4\u65B0\u6B64\u63D2\u4EF6" }, "\u66F4\u65B0") : null, canManage ? /* @__PURE__ */ import_react.default.createElement("button", { type: "button", className: "pm-btn pm-btn-danger", disabled: busy, onClick: () => onUninstall(plugin), title: "\u5378\u8F7D\u6B64\u63D2\u4EF6\uFF08\u9700\u91CD\u542F\u751F\u6548\uFF09" }, "\u5378\u8F7D") : null, /* @__PURE__ */ import_react.default.createElement("button", { type: "button", className: "pm-btn", onClick: () => setOpen((v) => !v), "aria-expanded": open }, open ? "\u6536\u8D77" : "\u8BE6\u60C5"))), open ? /* @__PURE__ */ import_react.default.createElement("div", { className: "pm-details" }, plugin.spec !== null ? /* @__PURE__ */ import_react.default.createElement("div", { className: "pm-details-row" }, /* @__PURE__ */ import_react.default.createElement("span", { className: "pm-details-key" }, "\u6765\u6E90"), /* @__PURE__ */ import_react.default.createElement("code", { className: "pm-details-val" }, plugin.spec)) : null, /* @__PURE__ */ import_react.default.createElement("div", { className: "pm-details-row" }, /* @__PURE__ */ import_react.default.createElement("span", { className: "pm-details-key" }, "\u4F4D\u7F6E"), /* @__PURE__ */ import_react.default.createElement("code", { className: "pm-details-val" }, plugin.path)), plugin.rowIds.length > 0 ? /* @__PURE__ */ import_react.default.createElement("div", { className: "pm-details-row" }, /* @__PURE__ */ import_react.default.createElement("span", { className: "pm-details-key" }, "loader \u884C"), /* @__PURE__ */ import_react.default.createElement("code", { className: "pm-details-val" }, plugin.rowIds.join(", "))) : null, /* @__PURE__ */ import_react.default.createElement("div", { className: "pm-details-row" }, /* @__PURE__ */ import_react.default.createElement("span", { className: "pm-details-key" }, "\u58F0\u660E"), /* @__PURE__ */ import_react.default.createElement("span", { className: "pm-details-val" }, plugin.dshBundle ? "dsh.bundle \u2713" : "dsh.bundle \u2014", " \xB7 ", plugin.dshClient ? "dsh.client \u2713" : "dsh.client \u2014", plugin.enabledGuess ? " \xB7 \uFF08loader \u884C\u672A\u77E5\uFF0C\u542F\u505C\u6309\u5305\u540D\u63A8\u65AD\uFF09" : "")), plugin.dependencies.length > 0 ? /* @__PURE__ */ import_react.default.createElement("div", { className: "pm-details-row" }, /* @__PURE__ */ import_react.default.createElement("span", { className: "pm-details-key" }, "\u4F9D\u8D56"), /* @__PURE__ */ import_react.default.createElement("span", { className: "pm-details-val" }, plugin.dependencies.join(", "))) : null, plugin.repository !== null ? /* @__PURE__ */ import_react.default.createElement("div", { className: "pm-details-row" }, /* @__PURE__ */ import_react.default.createElement("span", { className: "pm-details-key" }, "\u4ED3\u5E93"), /* @__PURE__ */ import_react.default.createElement("code", { className: "pm-details-val" }, plugin.repository)) : null, plugin.license !== null ? /* @__PURE__ */ import_react.default.createElement("div", { className: "pm-details-row" }, /* @__PURE__ */ import_react.default.createElement("span", { className: "pm-details-key" }, "\u8BB8\u53EF"), /* @__PURE__ */ import_react.default.createElement("span", { className: "pm-details-val" }, plugin.license)) : null) : null);
}

// .dsh-plugin/client/InstallDialog.jsx
var import_react2 = __toESM(require("react"), 1);
var EXAMPLE = "dsh plugin add github:owner/repo#main";
function InstallDialog({ onCancel, onInstall }) {
  const [command, setCommand] = (0, import_react2.useState)("");
  const [busy, setBusy] = (0, import_react2.useState)(false);
  const [error, setError] = (0, import_react2.useState)(null);
  const submit = async () => {
    if (command.trim() === "" || busy) return;
    setBusy(true);
    setError(null);
    try {
      await onInstall(command.trim());
    } catch (e) {
      setError(String(e?.message ?? e));
      setBusy(false);
    }
  };
  return /* @__PURE__ */ import_react2.default.createElement("div", { className: "pm-modal-backdrop", role: "presentation", onMouseDown: (e) => {
    if (e.target === e.currentTarget && !busy) onCancel();
  } }, /* @__PURE__ */ import_react2.default.createElement("div", { className: "pm-modal", role: "dialog", "aria-modal": "true", "aria-label": "\u5B89\u88C5\u63D2\u4EF6" }, /* @__PURE__ */ import_react2.default.createElement("h3", null, "\u5B89\u88C5\u63D2\u4EF6"), /* @__PURE__ */ import_react2.default.createElement("div", { className: "pm-modal-body" }, /* @__PURE__ */ import_react2.default.createElement(
    "input",
    {
      type: "text",
      value: command,
      placeholder: EXAMPLE,
      onChange: (e) => setCommand(e.target.value),
      onKeyDown: (e) => {
        if (e.key === "Enter") void submit();
      },
      autoFocus: true,
      spellCheck: false
    }
  ), /* @__PURE__ */ import_react2.default.createElement("div", { className: "pm-sub" }, "\u56FA\u5B9A\u683C\u5F0F\u6307\u4EE4\uFF1A", /* @__PURE__ */ import_react2.default.createElement("code", null, "dsh plugin [--profile <name>] add <plugin>"), "\u3002", /* @__PURE__ */ import_react2.default.createElement("strong", null, "\u672A\u5199 ", /* @__PURE__ */ import_react2.default.createElement("code", null, "--profile"), " \u65F6\u5B89\u88C5\u5230\u5F53\u524D\u9009\u4E2D\u7684 profile\uFF08\u4E0D\u4F1A\u88C5\u9519\u5730\u65B9\uFF09"), "\uFF1B \u663E\u5F0F\u6307\u5B9A\u5219\u4EE5\u547D\u4EE4\u4E3A\u51C6\u3002", /* @__PURE__ */ import_react2.default.createElement("code", null, "<plugin>"), " \u652F\u6301\uFF1A npm \u5305\u540D\uFF08", /* @__PURE__ */ import_react2.default.createElement("code", null, "some-plugin"), "\uFF09\u3001GitHub\uFF08", /* @__PURE__ */ import_react2.default.createElement("code", null, "github:owner/repo#main"), "\uFF09\u3001 \u672C\u5730\u7EDD\u5BF9\u8DEF\u5F84\uFF08", /* @__PURE__ */ import_react2.default.createElement("code", null, "link:C:/path"), " \u8F6F\u94FE\u6216 ", /* @__PURE__ */ import_react2.default.createElement("code", null, "file:"), " \u590D\u5236\uFF09\u3002"), /* @__PURE__ */ import_react2.default.createElement("div", { className: "pm-warn" }, "\u26A0\uFE0F \u5B89\u88C5\u7B2C\u4E09\u65B9\u63D2\u4EF6\u610F\u5473\u7740\u6267\u884C\u5176\u4EE3\u7801\uFF08\u542B prepare \u6784\u5EFA\u811A\u672C\uFF09\uFF0C\u53EF\u80FD\u8BBF\u95EE\u4F60\u7684\u6587\u4EF6\u4E0E\u51ED\u636E\u3002 \u8BF7\u786E\u8BA4\u6765\u6E90\u53EF\u4FE1\u540E\u518D\u5B89\u88C5\u3002"), error !== null ? /* @__PURE__ */ import_react2.default.createElement("div", { className: "pm-banner pm-banner-error", role: "alert" }, error) : null), /* @__PURE__ */ import_react2.default.createElement("div", { className: "pm-modal-foot" }, /* @__PURE__ */ import_react2.default.createElement("button", { type: "button", className: "pm-btn", disabled: busy, onClick: onCancel }, "\u53D6\u6D88"), /* @__PURE__ */ import_react2.default.createElement("button", { type: "button", className: "pm-btn pm-btn-primary", disabled: busy || command.trim() === "", onClick: () => void submit() }, busy ? "\u5B89\u88C5\u4E2D\u2026" : "\u5B89\u88C5"))));
}

// .dsh-plugin/client/OpsPanel.jsx
var import_react3 = __toESM(require("react"), 1);
function formatTime(ms) {
  const d = new Date(ms);
  const pad = (n) => String(n).padStart(2, "0");
  return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}
function OpRow({ op }) {
  const [showLines, setShowLines] = (0, import_react3.useState)(op.status === "running");
  const running = op.status === "running";
  return /* @__PURE__ */ import_react3.default.createElement("div", { className: "pm-op", "data-op-status": op.status }, /* @__PURE__ */ import_react3.default.createElement("div", { className: "pm-op-head" }, /* @__PURE__ */ import_react3.default.createElement("span", { className: "pm-status pm-status-" + op.status }, running ? /* @__PURE__ */ import_react3.default.createElement("span", { className: "pm-spin", "aria-hidden": "true" }) : null, opStatusLabel(op.status)), /* @__PURE__ */ import_react3.default.createElement("strong", null, opActionLabel(op.action)), /* @__PURE__ */ import_react3.default.createElement("span", { className: "pm-op-target" }, op.target), op.exitCode !== null ? /* @__PURE__ */ import_react3.default.createElement("span", { className: "pm-sub" }, "exit ", op.exitCode) : null, /* @__PURE__ */ import_react3.default.createElement("span", { className: "pm-op-time" }, formatTime(op.startedAt)), /* @__PURE__ */ import_react3.default.createElement("button", { type: "button", className: "pm-btn", onClick: () => setShowLines((v) => !v) }, showLines ? "\u6536\u8D77\u8F93\u51FA" : `\u8F93\u51FA (${op.lines.length})`)), op.error !== null ? /* @__PURE__ */ import_react3.default.createElement("div", { className: "pm-banner pm-banner-error" }, op.error) : null, showLines && op.lines.length > 0 ? /* @__PURE__ */ import_react3.default.createElement("div", { className: "pm-op-lines" }, op.lines.map((line, i) => /* @__PURE__ */ import_react3.default.createElement("div", { key: i, className: /error|ERR|failed|E\s*[0-9]+/i.test(line) ? "pm-op-line-error" : void 0 }, line))) : null);
}
function OpsPanel({ ops, audit }) {
  const [open, setOpen] = (0, import_react3.useState)(ops.some((op) => op.status === "running"));
  const running = ops.some((op) => op.status === "running");
  return /* @__PURE__ */ import_react3.default.createElement("div", { className: "pm-ops" }, /* @__PURE__ */ import_react3.default.createElement("div", { className: "pm-ops-head", onClick: () => setOpen((v) => !v), role: "button", "aria-expanded": open }, running ? /* @__PURE__ */ import_react3.default.createElement("span", { className: "pm-spin", "aria-hidden": "true" }) : null, /* @__PURE__ */ import_react3.default.createElement("strong", null, "\u64CD\u4F5C\u8BB0\u5F55"), /* @__PURE__ */ import_react3.default.createElement("span", { className: "pm-sub" }, ops.length, " \u6761\u672C\u6B21\u4F1A\u8BDD"), audit.length > 0 ? /* @__PURE__ */ import_react3.default.createElement("span", { className: "pm-sub" }, "\xB7 \u5BA1\u8BA1 ", audit.length, " \u6761") : null), open ? /* @__PURE__ */ import_react3.default.createElement("div", { className: "pm-ops-list" }, ops.length === 0 ? /* @__PURE__ */ import_react3.default.createElement("div", { className: "pm-empty" }, "\u6682\u65E0\u64CD\u4F5C\u8BB0\u5F55") : null, ops.map((op) => /* @__PURE__ */ import_react3.default.createElement(OpRow, { key: op.id, op }))) : null);
}

// .dsh-plugin/client/ConfigPanel.jsx
var import_react4 = __toESM(require("react"), 1);
function nodeAt(schema, id) {
  return schema?.refs?.[id] ?? null;
}
function deepDiff(before, after) {
  if (before === after) return void 0;
  if (before !== null && after !== null && typeof before === "object" && typeof after === "object" && !Array.isArray(before) && !Array.isArray(after)) {
    const patch = {};
    const keys = /* @__PURE__ */ new Set([...Object.keys(before), ...Object.keys(after)]);
    for (const key of keys) {
      const sub = deepDiff(before[key], after[key]);
      if (sub !== void 0) patch[key] = sub;
    }
    return Object.keys(patch).length > 0 ? patch : void 0;
  }
  return after;
}
function JsonField({ value, onChange }) {
  const [text, setText] = (0, import_react4.useState)(() => JSON.stringify(value ?? null, null, 1));
  const [error, setError] = (0, import_react4.useState)(null);
  const commit = (nextText) => {
    setText(nextText);
    try {
      const parsed = JSON.parse(nextText);
      setError(null);
      onChange(parsed);
    } catch (e) {
      setError(String(e?.message ?? e));
    }
  };
  return /* @__PURE__ */ import_react4.default.createElement("div", { className: "pm-cfg-field" }, /* @__PURE__ */ import_react4.default.createElement(
    "textarea",
    {
      className: error !== null ? "pm-cfg-json pm-cfg-error" : "pm-cfg-json",
      rows: 4,
      value: text,
      spellCheck: false,
      onChange: (e) => commit(e.target.value)
    }
  ), error !== null ? /* @__PURE__ */ import_react4.default.createElement("div", { className: "pm-cfg-err", role: "alert" }, error) : null);
}
function Field({ schema, node, value, onChange, name: name2, secret, secretPath }) {
  const meta = node?.meta ?? {};
  const label = /* @__PURE__ */ import_react4.default.createElement("span", { className: "pm-cfg-label" }, name2, meta.description !== void 0 && meta.description !== "" ? /* @__PURE__ */ import_react4.default.createElement("em", { title: String(meta.description) }, String(meta.description)) : null, secret ? /* @__PURE__ */ import_react4.default.createElement("span", { className: "pm-badge" }, "secret") : null);
  if (secret) {
    return /* @__PURE__ */ import_react4.default.createElement("div", { className: "pm-cfg-row" }, label, /* @__PURE__ */ import_react4.default.createElement("span", { className: "pm-cfg-hidden" }, "\u5DF2\u9690\u85CF\uFF08\u654F\u611F\u5B57\u6BB5\uFF0C\u4FDD\u5B58\u65F6\u4FDD\u6301\u539F\u503C\uFF09"));
  }
  if (node === null) {
    return /* @__PURE__ */ import_react4.default.createElement("div", { className: "pm-cfg-row" }, label, /* @__PURE__ */ import_react4.default.createElement(JsonField, { value, onChange }));
  }
  switch (node.type) {
    case "string":
      return /* @__PURE__ */ import_react4.default.createElement("div", { className: "pm-cfg-row" }, label, /* @__PURE__ */ import_react4.default.createElement("input", { type: "text", className: "pm-cfg-input", value: value ?? "", onChange: (e) => onChange(e.target.value) }));
    case "number":
      return /* @__PURE__ */ import_react4.default.createElement("div", { className: "pm-cfg-row" }, label, /* @__PURE__ */ import_react4.default.createElement(
        "input",
        {
          type: "number",
          className: "pm-cfg-input",
          value: value ?? "",
          onChange: (e) => {
            const raw = e.target.value;
            if (raw === "") {
              onChange(void 0);
              return;
            }
            const n = Number(raw);
            if (Number.isFinite(n)) onChange(n);
          }
        }
      ));
    case "boolean":
      return /* @__PURE__ */ import_react4.default.createElement("div", { className: "pm-cfg-row" }, label, /* @__PURE__ */ import_react4.default.createElement("input", { type: "checkbox", checked: value === true, onChange: (e) => onChange(e.target.checked) }));
    case "const":
      return /* @__PURE__ */ import_react4.default.createElement("div", { className: "pm-cfg-row" }, label, /* @__PURE__ */ import_react4.default.createElement("code", { className: "pm-cfg-fixed" }, JSON.stringify(node.value)));
    case "union": {
      const list = node.list ?? [];
      const consts = list.map((id) => nodeAt(schema, id));
      if (list.length > 0 && consts.every((n) => n !== null && n.type === "const")) {
        const options = consts.map((n) => n.value);
        return /* @__PURE__ */ import_react4.default.createElement("div", { className: "pm-cfg-row" }, label, /* @__PURE__ */ import_react4.default.createElement("select", { className: "pm-cfg-input", value: options.includes(value) ? value : "", onChange: (e) => onChange(e.target.value) }, !options.includes(value) ? /* @__PURE__ */ import_react4.default.createElement("option", { value: "", disabled: true }, "\uFF08\u5F53\u524D\u503C\u4E0D\u5728\u9009\u9879\u4E2D\uFF09") : null, options.map((opt) => /* @__PURE__ */ import_react4.default.createElement("option", { key: String(opt), value: opt }, String(opt)))));
      }
      return /* @__PURE__ */ import_react4.default.createElement("div", { className: "pm-cfg-row" }, label, /* @__PURE__ */ import_react4.default.createElement(JsonField, { value, onChange }));
    }
    case "array":
      return /* @__PURE__ */ import_react4.default.createElement("div", { className: "pm-cfg-row" }, label, /* @__PURE__ */ import_react4.default.createElement(JsonField, { value: value ?? [], onChange }));
    case "object": {
      const dict = node.dict ?? {};
      return /* @__PURE__ */ import_react4.default.createElement("div", { className: "pm-cfg-row" }, label, /* @__PURE__ */ import_react4.default.createElement("div", { className: "pm-cfg-group" }, Object.entries(dict).map(([key, id]) => /* @__PURE__ */ import_react4.default.createElement(
        Field,
        {
          key,
          schema,
          node: nodeAt(schema, id),
          name: key,
          value: value?.[key],
          onChange: (next) => onChange({ ...value ?? {}, [key]: next }),
          secret: secretPath !== void 0 && secretPath.includes(key),
          secretPath
        }
      )), Object.keys(dict).length === 0 ? /* @__PURE__ */ import_react4.default.createElement("span", { className: "pm-sub" }, "\uFF08\u7A7A\u5BF9\u8C61\uFF09") : null));
    }
    default:
      return /* @__PURE__ */ import_react4.default.createElement("div", { className: "pm-cfg-row" }, label, /* @__PURE__ */ import_react4.default.createElement(JsonField, { value, onChange }));
  }
}
function ConfigCard({ config, busy, onSave, onError }) {
  const [draft, setDraft] = (0, import_react4.useState)(() => JSON.parse(JSON.stringify(config.value ?? null)));
  const [saved, setSaved] = (0, import_react4.useState)(false);
  const root = nodeAt(config.schema, config.schema?.uid);
  const secretPaths = (config.secrets ?? []).map((s) => Array.isArray(s?.path) ? s.path.join(".") : null).filter(Boolean);
  const isSecretField = (path) => secretPaths.some((p) => p === path || p.startsWith(path + "."));
  const save = async () => {
    const patch = deepDiff(config.value, draft);
    if (patch === void 0) return;
    try {
      await onSave(config.ns, patch, config.revision);
      setSaved(true);
      setTimeout(() => setSaved(false), 2e3);
    } catch (e) {
      onError(String(e?.message ?? e));
    }
  };
  const reset = () => setDraft(JSON.parse(JSON.stringify(config.value ?? null)));
  return /* @__PURE__ */ import_react4.default.createElement("div", { className: "pm-cfg-card", "data-ns": config.ns }, /* @__PURE__ */ import_react4.default.createElement("div", { className: "pm-cfg-head" }, /* @__PURE__ */ import_react4.default.createElement("strong", { className: "pm-cfg-ns" }, config.ns), /* @__PURE__ */ import_react4.default.createElement("span", { className: "pm-badge" }, config.applies === "restart" ? "\u91CD\u542F\u751F\u6548" : "\u5B9E\u65F6\u751F\u6548"), config.plugin !== null ? /* @__PURE__ */ import_react4.default.createElement("span", { className: "pm-badge pm-badge-bundle" }, config.plugin.name) : /* @__PURE__ */ import_react4.default.createElement("span", { className: "pm-badge" }, "\u5BBF\u4E3B\u6CE8\u518C"), config.hasUser ? /* @__PURE__ */ import_react4.default.createElement("span", { className: "pm-badge" }, "\u5DF2\u8986\u76D6\u9ED8\u8BA4\u503C") : null), /* @__PURE__ */ import_react4.default.createElement("div", { className: "pm-cfg-body" }, root !== null && root.type === "object" ? /* @__PURE__ */ import_react4.default.createElement("div", { className: "pm-cfg-form" }, Object.entries(root.dict ?? {}).map(([key, id]) => /* @__PURE__ */ import_react4.default.createElement(
    Field,
    {
      key,
      schema: config.schema,
      node: nodeAt(config.schema, id),
      name: key,
      value: draft?.[key],
      onChange: (next) => setDraft((prev) => ({ ...prev ?? {}, [key]: next })),
      secret: isSecretField(key),
      secretPath: isSecretField(key) ? secretPaths : void 0
    }
  ))) : /* @__PURE__ */ import_react4.default.createElement(JsonField, { value: draft, onChange: setDraft })), /* @__PURE__ */ import_react4.default.createElement("div", { className: "pm-cfg-foot" }, /* @__PURE__ */ import_react4.default.createElement("button", { type: "button", className: "pm-btn", disabled: busy, onClick: reset }, "\u91CD\u7F6E\u4E3A\u5F53\u524D\u503C"), /* @__PURE__ */ import_react4.default.createElement("button", { type: "button", className: "pm-btn pm-btn-primary", disabled: busy, onClick: () => void save() }, busy ? "\u4FDD\u5B58\u4E2D\u2026" : saved ? "\u5DF2\u4FDD\u5B58 \u2713" : "\u4FDD\u5B58")));
}
function ConfigPanel({ configs, busy, onSave, onError }) {
  const [query, setQuery] = (0, import_react4.useState)("");
  const q = query.trim().toLocaleLowerCase();
  const filtered = configs.filter((c) => c.ns.toLocaleLowerCase().includes(q) || (c.plugin?.name ?? "").toLocaleLowerCase().includes(q));
  return /* @__PURE__ */ import_react4.default.createElement("div", { className: "pm-configs" }, /* @__PURE__ */ import_react4.default.createElement("div", { className: "pm-search" }, /* @__PURE__ */ import_react4.default.createElement("input", { type: "search", value: query, placeholder: "\u641C\u7D22\u914D\u7F6E\uFF08namespace / \u63D2\u4EF6\u540D\uFF09", "aria-label": "\u641C\u7D22\u914D\u7F6E", onChange: (e) => setQuery(e.target.value) }), /* @__PURE__ */ import_react4.default.createElement("span", { className: "pm-count" }, filtered.length, " / ", configs.length, " \u4E2A")), configs.length === 0 ? /* @__PURE__ */ import_react4.default.createElement("div", { className: "pm-empty" }, "\u6CA1\u6709\u63D2\u4EF6\u6CE8\u518C\u914D\u7F6E\uFF08settings schema\uFF09") : null, filtered.length === 0 && configs.length > 0 ? /* @__PURE__ */ import_react4.default.createElement("div", { className: "pm-empty" }, "\u65E0\u5339\u914D\u914D\u7F6E") : null, /* @__PURE__ */ import_react4.default.createElement("div", { className: "pm-grid", style: { listStyle: "none", margin: 0, padding: 0 } }, filtered.map((config) => /* @__PURE__ */ import_react4.default.createElement(ConfigCard, { key: config.ns, config, busy, onSave, onError }))));
}

// .dsh-plugin/client/NewProfileDialog.jsx
var import_react5 = __toESM(require("react"), 1);
var NAME_HINT = "\u5C0F\u5199\u5B57\u6BCD\u5F00\u5934\uFF0C\u4EC5\u9650\u5B57\u6BCD/\u6570\u5B57/\u8FDE\u5B57\u7B26\uFF08kebab-case\uFF09";
function NewProfileDialog({ onCancel, onCreate }) {
  const [name2, setName] = (0, import_react5.useState)("");
  const [busy, setBusy] = (0, import_react5.useState)(false);
  const [error, setError] = (0, import_react5.useState)(null);
  const valid = /^[a-z][a-z0-9-]*$/.test(name2.trim()) && name2.trim() !== "node_modules";
  const submit = async () => {
    if (!valid || busy) return;
    setBusy(true);
    setError(null);
    try {
      await onCreate(name2.trim());
    } catch (e) {
      setError(String(e?.message ?? e));
      setBusy(false);
    }
  };
  return /* @__PURE__ */ import_react5.default.createElement("div", { className: "pm-modal-backdrop", role: "presentation", onMouseDown: (e) => {
    if (e.target === e.currentTarget && !busy) onCancel();
  } }, /* @__PURE__ */ import_react5.default.createElement("div", { className: "pm-modal", role: "dialog", "aria-modal": "true", "aria-label": "\u65B0\u5EFA profile" }, /* @__PURE__ */ import_react5.default.createElement("h3", null, "\u65B0\u5EFA profile"), /* @__PURE__ */ import_react5.default.createElement("div", { className: "pm-modal-body" }, /* @__PURE__ */ import_react5.default.createElement(
    "input",
    {
      type: "text",
      value: name2,
      placeholder: "profile \u540D\uFF0C\u5982 work / test",
      onChange: (e) => setName(e.target.value),
      onKeyDown: (e) => {
        if (e.key === "Enter") void submit();
      },
      autoFocus: true
    }
  ), /* @__PURE__ */ import_react5.default.createElement("div", { className: "pm-sub" }, NAME_HINT, "\u3002\u65B0 profile \u5C06\u5305\u542B\u5B98\u65B9\u57FA\u7840 bundle\uFF08dsh-base + dsh-web-app\uFF09\uFF0C\u53EF\u968F\u540E\u5B89\u88C5\u63D2\u4EF6\u3002"), error !== null ? /* @__PURE__ */ import_react5.default.createElement("div", { className: "pm-banner pm-banner-error", role: "alert" }, error) : null), /* @__PURE__ */ import_react5.default.createElement("div", { className: "pm-modal-foot" }, /* @__PURE__ */ import_react5.default.createElement("button", { type: "button", className: "pm-btn", disabled: busy, onClick: onCancel }, "\u53D6\u6D88"), /* @__PURE__ */ import_react5.default.createElement("button", { type: "button", className: "pm-btn pm-btn-primary", disabled: busy || !valid, onClick: () => void submit() }, busy ? "\u521B\u5EFA\u4E2D\u2026" : "\u521B\u5EFA"))));
}

// .dsh-plugin/client/PluginManagerTab.jsx
var CONFIRM_DEFAULTS = { kind: null, plugin: null };
function PluginManagerTab() {
  const [inventory, setInventory] = (0, import_react6.useState)(null);
  const [status, setStatus] = (0, import_react6.useState)("loading");
  const [error, setError] = (0, import_react6.useState)(null);
  const [query, setQuery] = (0, import_react6.useState)("");
  const [ops, setOps] = (0, import_react6.useState)([]);
  const [busy, setBusy] = (0, import_react6.useState)(false);
  const watchers = (0, import_react6.useRef)(/* @__PURE__ */ new Map());
  const [profiles, setProfiles] = (0, import_react6.useState)([]);
  const [selected, setSelected] = (0, import_react6.useState)(null);
  const [createOpen, setCreateOpen] = (0, import_react6.useState)(false);
  const [view, setView] = (0, import_react6.useState)("plugins");
  const [configs, setConfigs] = (0, import_react6.useState)([]);
  const [installOpen, setInstallOpen] = (0, import_react6.useState)(false);
  const [success, setSuccess] = (0, import_react6.useState)(null);
  const [confirm, setConfirm] = (0, import_react6.useState)(CONFIRM_DEFAULTS);
  const [purgeData, setPurgeData] = (0, import_react6.useState)(false);
  const currentName = profiles.find((p) => p.isCurrent)?.name ?? null;
  const effectiveProfile = selected !== null && selected !== currentName ? selected : currentName;
  const targetIsCurrent = selected === null || selected === currentName;
  const loadProfiles = (0, import_react6.useCallback)(async () => {
    const data = await api(PROFILES_PATH);
    setProfiles(data.profiles ?? []);
    setSelected((prev) => {
      const current = data.profiles.find((p) => p.isCurrent)?.name ?? null;
      if (prev === null || !data.profiles.some((p) => p.name === prev)) return current;
      return prev;
    });
  }, []);
  const load = (0, import_react6.useCallback)(async () => {
    if (effectiveProfile === null) return [];
    try {
      if (targetIsCurrent) {
        const data2 = await api(PLUGINS_PATH);
        const plugins2 = data2.plugins ?? [];
        setInventory({ profile: data2.profile, plugins: plugins2, ops: data2.ops ?? [], audit: data2.audit ?? [] });
        setOps(data2.ops ?? []);
        setStatus("ready");
        setError(null);
        return plugins2;
      }
      const data = await api(`${PROFILE_PLUGINS_PREFIX}/${encodeURIComponent(effectiveProfile)}/plugins`);
      const plugins = data.plugins ?? [];
      setInventory({ profile: data.profile, plugins, ops: [], audit: [] });
      setOps([]);
      setStatus("ready");
      setError(null);
      return plugins;
    } catch (e) {
      setStatus((s) => s === "ready" ? s : "error");
      setError(String(e?.message ?? e));
      return [];
    }
  }, [effectiveProfile, targetIsCurrent]);
  const loadConfigs = (0, import_react6.useCallback)(async () => {
    try {
      const data = await api(CONFIGS_PATH);
      setConfigs(data.configs ?? []);
      setError(null);
    } catch (e) {
      setError(String(e?.message ?? e));
    }
  }, []);
  (0, import_react6.useEffect)(() => {
    void loadProfiles();
  }, [loadProfiles]);
  (0, import_react6.useEffect)(() => {
    if (effectiveProfile !== null) void load();
  }, [effectiveProfile, load]);
  (0, import_react6.useEffect)(() => {
    if (view === "configs" && targetIsCurrent) void loadConfigs();
  }, [view, targetIsCurrent, loadConfigs]);
  const showSuccess = (0, import_react6.useCallback)((message) => {
    setSuccess(message);
  }, []);
  const watchOp = (0, import_react6.useCallback)((opId, restartNeeded, beforeVersions) => {
    if (opId === void 0 || opId === null || watchers.current.has(opId)) return;
    watchers.current.set(opId, true);
    const tick = async () => {
      let op = null;
      try {
        op = await api(`${OPS_PATH}/${encodeURIComponent(opId)}`);
      } catch {
      }
      if (op !== null) {
        setOps((prev) => [op, ...prev.filter((o) => o.id !== op.id)]);
        if (op.status === "running") {
          setTimeout(tick, 800);
          return;
        }
        if (op.status === "error") {
          const tail = (op.lines ?? []).slice(-3).join(" ");
          setError(`\u64CD\u4F5C\u5931\u8D25\uFF1A${op.error ?? `pnpm \u9000\u51FA\u7801 ${op.exitCode ?? "?"}`}${tail !== "" ? `\uFF08${tail}\uFF09` : ""}`);
          return;
        }
        if (op.status === "ok") {
          const restartNote = restartNeeded ? "\uFF08\u91CD\u542F DSH \u540E\u751F\u6548\uFF09" : "";
          if (op.action === "install") {
            showSuccess(`\u2705 \u5B89\u88C5\u6210\u529F\uFF1A${op.target}${restartNote}`);
          } else if (op.action === "uninstall") {
            showSuccess(`\u2705 \u5378\u8F7D\u6210\u529F\uFF1A${op.target}${restartNote}`);
          } else if (op.action === "update-all") {
            showSuccess(`\u2705 \u5168\u90E8\u66F4\u65B0\u6210\u529F${restartNote}`);
          } else if (op.action === "update") {
            const fresh = await load();
            const after = fresh.find((p) => p.name === op.target)?.version ?? null;
            const before = beforeVersions !== null && beforeVersions[op.target] !== void 0 ? beforeVersions[op.target] : null;
            const version = before !== null && after !== null && before !== after ? ` ${before} \u2192 ${after}` : "";
            showSuccess(`\u2705 \u66F4\u65B0\u6210\u529F\uFF1A${op.target}${version}${restartNote}`);
            return;
          }
        }
        void load();
        return;
      }
      setTimeout(tick, 1500);
    };
    setTimeout(tick, 300);
  }, [load, showSuccess]);
  const profileArg = targetIsCurrent ? void 0 : effectiveProfile;
  const runOp = (0, import_react6.useCallback)(async (fn) => {
    try {
      await fn();
      return true;
    } catch (e) {
      setError(String(e?.message ?? e));
      return false;
    }
  }, []);
  const doInstall = (0, import_react6.useCallback)(async (command) => {
    setInstallOpen(false);
    await runOp(async () => {
      const result = await api(INSTALL_PATH, { method: "POST", body: { command, profile: profileArg } });
      watchOp(result.opId, result.restartNeeded === true, null);
    });
  }, [watchOp, profileArg, runOp]);
  const doUninstall = (0, import_react6.useCallback)(async (plugin, purgeData2) => {
    setConfirm(CONFIRM_DEFAULTS);
    await runOp(async () => {
      const result = await api(UNINSTALL_PATH, { method: "POST", body: { name: plugin.name, profile: profileArg, purgeData: purgeData2 === true } });
      watchOp(result.opId, result.restartNeeded === true, null);
    });
  }, [watchOp, profileArg, runOp]);
  const doUpdate = (0, import_react6.useCallback)(async (plugin) => {
    setConfirm(CONFIRM_DEFAULTS);
    const beforeVersions = {};
    for (const p of inventory?.plugins ?? []) beforeVersions[p.name] = p.version;
    await runOp(async () => {
      const result = await api(UPDATE_PATH, { method: "POST", body: { ...plugin === null ? {} : { name: plugin.name }, profile: profileArg } });
      watchOp(result.opId, result.restartNeeded === true, plugin === null ? null : beforeVersions);
    });
  }, [watchOp, inventory, profileArg, runOp]);
  const doToggle = (0, import_react6.useCallback)(async (plugin, enabled) => {
    await runOp(async () => {
      await api(TOGGLE_PATH, {
        method: "POST",
        body: { rowId: plugin.rowIds.length > 0 ? plugin.rowIds[0] : plugin.name, enabled, profile: profileArg }
      });
      await load();
    });
  }, [load, profileArg, runOp]);
  const doSaveConfig = (0, import_react6.useCallback)(async (ns, patch, expectedRevision) => {
    await api(`${CONFIGS_PREFIX}/${encodeURIComponent(ns)}`, {
      method: "POST",
      body: { patch, expectedRevision }
    });
    await loadConfigs();
  }, [loadConfigs]);
  const doCreateProfile = (0, import_react6.useCallback)(async (name2) => {
    setCreateOpen(false);
    const created = await api(PROFILE_CREATE_PATH, { method: "POST", body: { name: name2 } });
    await loadProfiles();
    setSelected(created.name);
    setView("plugins");
  }, [loadProfiles]);
  const runWithBusy = (0, import_react6.useCallback)(async (fn) => {
    setBusy(true);
    try {
      await fn();
    } finally {
      setBusy(false);
    }
  }, []);
  const filtered = inventory === null ? [] : inventory.plugins.filter((p) => {
    const q = query.trim().toLocaleLowerCase();
    if (q === "") return true;
    const name2 = typeof p.name === "string" ? p.name.toLocaleLowerCase() : "";
    const desc = typeof p.description === "string" ? p.description.toLocaleLowerCase() : "";
    return name2.includes(q) || desc.includes(q);
  });
  const confirmContent = (() => {
    const targetLabel = targetIsCurrent ? `\u5F53\u524D profile\uFF08${currentName ?? "?"}\uFF09` : `profile\u300C${selected}\u300D`;
    if (confirm.kind === "uninstall") {
      return {
        title: `\u5378\u8F7D ${confirm.plugin.name}`,
        body: /* @__PURE__ */ import_react6.default.createElement("div", { className: "pm-modal-body" }, /* @__PURE__ */ import_react6.default.createElement("p", null, "\u5C06\u4F5C\u7528\u4E8E ", /* @__PURE__ */ import_react6.default.createElement("strong", null, targetLabel), "\uFF1A\u6267\u884C ", /* @__PURE__ */ import_react6.default.createElement("code", null, "pnpm remove ", confirm.plugin.name), " \u5E76\u4ECE bundle \u5C42\u79FB\u9664\u3002\u5378\u8F7D\u540E\u9700\u91CD\u542F\u751F\u6548\u3002"), /* @__PURE__ */ import_react6.default.createElement("label", { className: "pm-toggle", style: { alignItems: "flex-start" } }, /* @__PURE__ */ import_react6.default.createElement(
          "input",
          {
            type: "checkbox",
            checked: purgeData,
            onChange: (e) => setPurgeData(e.target.checked)
          }
        ), /* @__PURE__ */ import_react6.default.createElement("span", null, /* @__PURE__ */ import_react6.default.createElement("strong", null, "\u540C\u65F6\u5220\u9664\u63D2\u4EF6\u6570\u636E"), "\uFF08", /* @__PURE__ */ import_react6.default.createElement("code", null, "~/.dsh/data/", confirm.plugin.name, "/"), "\u3001", /* @__PURE__ */ import_react6.default.createElement("code", null, "profiles/*/data/", confirm.plugin.name, "/"), "\u3001settings \u914D\u7F6E\uFF09\u2014\u2014", /* @__PURE__ */ import_react6.default.createElement("span", { style: { color: "var(--dsw-alias-state-error-primary, #C0392B)" } }, "\u4E0D\u53EF\u6062\u590D"))), /* @__PURE__ */ import_react6.default.createElement("p", { className: "pm-sub" }, "\u4E0D\u52FE\u9009\u5219\u4FDD\u7559\u6570\u636E\uFF0C\u91CD\u88C5\u63D2\u4EF6\u540E\u81EA\u52A8\u6062\u590D\u4F7F\u7528\u3002")),
        ok: "\u786E\u8BA4\u5378\u8F7D",
        danger: true,
        onOk: () => runWithBusy(() => doUninstall(confirm.plugin, purgeData))
      };
    }
    if (confirm.kind === "update") {
      return {
        title: `\u66F4\u65B0 ${confirm.plugin.name}`,
        body: /* @__PURE__ */ import_react6.default.createElement("div", { className: "pm-modal-body" }, /* @__PURE__ */ import_react6.default.createElement("p", null, "\u5C06\u4F5C\u7528\u4E8E ", /* @__PURE__ */ import_react6.default.createElement("strong", null, targetLabel), "\uFF1A\u6267\u884C ", /* @__PURE__ */ import_react6.default.createElement("code", null, "pnpm update ", confirm.plugin.name), "\u3002\u66F4\u65B0\u540E\u9700\u91CD\u542F\u751F\u6548\u3002")),
        ok: "\u786E\u8BA4\u66F4\u65B0",
        danger: false,
        onOk: () => runWithBusy(() => doUpdate(confirm.plugin))
      };
    }
    if (confirm.kind === "updateAll") {
      return {
        title: "\u5168\u90E8\u66F4\u65B0",
        body: /* @__PURE__ */ import_react6.default.createElement("div", { className: "pm-modal-body" }, /* @__PURE__ */ import_react6.default.createElement("p", null, "\u5C06\u4F5C\u7528\u4E8E ", /* @__PURE__ */ import_react6.default.createElement("strong", null, targetLabel), "\uFF1A\u6267\u884C ", /* @__PURE__ */ import_react6.default.createElement("code", null, "pnpm update"), "\uFF0C\u66F4\u65B0\u6240\u6709\u4F9D\u8D56\u5230\u5141\u8BB8\u8303\u56F4\u5185\u6700\u65B0\u7248\u672C\u3002\u66F4\u65B0\u540E\u9700\u91CD\u542F\u751F\u6548\u3002")),
        ok: "\u786E\u8BA4\u5168\u90E8\u66F4\u65B0",
        danger: false,
        onOk: () => runWithBusy(() => doUpdate(null))
      };
    }
    return null;
  })();
  return /* @__PURE__ */ import_react6.default.createElement("div", { className: "pm-root", "data-plugin-manager": true }, /* @__PURE__ */ import_react6.default.createElement("div", { className: "pm-head" }, /* @__PURE__ */ import_react6.default.createElement("div", { className: "pm-head-left" }, /* @__PURE__ */ import_react6.default.createElement("span", { className: "pm-title" }, "\u63D2\u4EF6\u7BA1\u7406"), /* @__PURE__ */ import_react6.default.createElement(
    "select",
    {
      className: "pm-profile-select",
      value: selected ?? "",
      onChange: (e) => {
        setSelected(e.target.value === "" ? null : e.target.value);
      },
      "aria-label": "\u9009\u62E9 profile",
      title: "\u64CD\u4F5C\u76EE\u6807 profile\uFF1A\u5B89\u88C5/\u5378\u8F7D/\u66F4\u65B0/\u542F\u505C\u5C06\u4F5C\u7528\u4E8E\u9009\u4E2D\u7684 profile"
    },
    /* @__PURE__ */ import_react6.default.createElement("option", { value: "" }, "\uFF08\u5F53\u524D profile\uFF09"),
    profiles.map((p) => /* @__PURE__ */ import_react6.default.createElement("option", { key: p.name, value: p.name }, p.name, p.isCurrent ? "\uFF08\u5F53\u524D\uFF09" : ""))
  ), /* @__PURE__ */ import_react6.default.createElement("button", { type: "button", className: "pm-btn", onClick: () => setCreateOpen(true), disabled: busy }, "\u65B0\u5EFA profile")), /* @__PURE__ */ import_react6.default.createElement("div", { className: "pm-actions" }, /* @__PURE__ */ import_react6.default.createElement("button", { type: "button", className: "pm-btn", onClick: () => void runWithBusy(async () => {
    await loadProfiles();
    await load();
    if (view === "configs" && targetIsCurrent) await loadConfigs();
  }), disabled: busy, title: "\u91CD\u65B0\u62C9\u53D6\u6E05\u5355/\u64CD\u4F5C\u8BB0\u5F55\u6570\u636E" }, "\u5237\u65B0\u5217\u8868"), /* @__PURE__ */ import_react6.default.createElement("button", { type: "button", className: "pm-btn", onClick: () => setConfirm({ kind: "updateAll", plugin: null }), disabled: busy || inventory === null }, "\u5168\u90E8\u66F4\u65B0"), /* @__PURE__ */ import_react6.default.createElement("button", { type: "button", className: "pm-btn pm-btn-primary", onClick: () => setInstallOpen(true) }, "\u5B89\u88C5\u63D2\u4EF6"))), /* @__PURE__ */ import_react6.default.createElement("div", { className: "pm-tabs", role: "tablist" }, /* @__PURE__ */ import_react6.default.createElement("button", { type: "button", role: "tab", "aria-selected": view === "plugins", className: view === "plugins" ? "pm-tab pm-tab-active" : "pm-tab", onClick: () => setView("plugins") }, "\u63D2\u4EF6"), /* @__PURE__ */ import_react6.default.createElement("button", { type: "button", role: "tab", "aria-selected": view === "configs", className: view === "configs" ? "pm-tab pm-tab-active" : "pm-tab", onClick: () => {
    setView("configs");
    if (targetIsCurrent) void loadConfigs();
  }, disabled: !targetIsCurrent, title: !targetIsCurrent ? "\u914D\u7F6E\u4EC5\u5BF9\u5F53\u524D profile \u53EF\u7528" : void 0 }, "\u914D\u7F6E")), !targetIsCurrent ? /* @__PURE__ */ import_react6.default.createElement("div", { className: "pm-banner pm-banner-warn" }, "\u{1F3AF} \u64CD\u4F5C\u76EE\u6807\uFF1A", /* @__PURE__ */ import_react6.default.createElement("strong", null, selected), " profile\u3002\u5B89\u88C5/\u5378\u8F7D/\u66F4\u65B0/\u542F\u505C\u5C06\u5199\u5165\u8BE5 profile\uFF08\u82E5\u5B83\u4E0D\u662F\u5F53\u524D\u8FD0\u884C\u7684 profile\uFF0C\u53D8\u66F4\u5728\u5176\u4E0B\u6B21\u542F\u52A8\u65F6\u751F\u6548\uFF09\u3002") : null, success !== null ? /* @__PURE__ */ import_react6.default.createElement("div", { className: "pm-banner pm-banner-success", role: "status" }, success, /* @__PURE__ */ import_react6.default.createElement("button", { type: "button", className: "pm-btn", style: { marginLeft: 8 }, onClick: () => setSuccess(null) }, "\u5173\u95ED")) : null, error !== null ? /* @__PURE__ */ import_react6.default.createElement("div", { className: "pm-banner pm-banner-error", role: "alert" }, error, /* @__PURE__ */ import_react6.default.createElement("button", { type: "button", className: "pm-btn", style: { marginLeft: 8 }, onClick: () => void runWithBusy(async () => {
    if (view === "configs" && targetIsCurrent) await loadConfigs();
    await load();
  }) }, "\u91CD\u8BD5")) : null, view === "plugins" ? /* @__PURE__ */ import_react6.default.createElement(import_react6.default.Fragment, null, /* @__PURE__ */ import_react6.default.createElement(OpsPanel, { ops, audit: inventory?.audit ?? [] }), /* @__PURE__ */ import_react6.default.createElement("div", { className: "pm-search" }, /* @__PURE__ */ import_react6.default.createElement("input", { type: "search", value: query, placeholder: "\u641C\u7D22\u63D2\u4EF6\uFF08\u540D\u79F0/\u63CF\u8FF0\uFF09", "aria-label": "\u641C\u7D22\u63D2\u4EF6", onChange: (e) => setQuery(e.target.value) }), /* @__PURE__ */ import_react6.default.createElement("span", { className: "pm-count" }, filtered.length, " / ", inventory?.plugins.length ?? 0, " \u4E2A")), status === "loading" ? /* @__PURE__ */ import_react6.default.createElement("div", { className: "pm-empty" }, "\u52A0\u8F7D\u4E2D\u2026") : null, status === "error" ? /* @__PURE__ */ import_react6.default.createElement("div", { className: "pm-empty" }, "\u52A0\u8F7D\u5931\u8D25\uFF0C\u8BF7\u91CD\u8BD5") : null, status === "ready" && filtered.length === 0 ? /* @__PURE__ */ import_react6.default.createElement("div", { className: "pm-empty" }, query ? "\u65E0\u5339\u914D\u63D2\u4EF6" : `${effectiveProfile ?? ""} profile \u65E0\u5DF2\u5B89\u88C5\u63D2\u4EF6`) : null, status === "ready" && filtered.length > 0 ? /* @__PURE__ */ import_react6.default.createElement("ul", { className: "pm-grid", style: { listStyle: "none", margin: 0, padding: 0 } }, filtered.map((plugin) => /* @__PURE__ */ import_react6.default.createElement(
    PluginCard,
    {
      key: plugin.name,
      plugin,
      busy,
      onToggle: doToggle,
      onUpdate: (plugin2) => setConfirm({ kind: "update", plugin: plugin2 }),
      onUninstall: (plugin2) => {
        setPurgeData(false);
        setConfirm({ kind: "uninstall", plugin: plugin2 });
      },
      onError: setError
    }
  ))) : null) : /* @__PURE__ */ import_react6.default.createElement(ConfigPanel, { configs, busy, onSave: doSaveConfig, onError: setError }), installOpen ? /* @__PURE__ */ import_react6.default.createElement(InstallDialog, { onCancel: () => setInstallOpen(false), onInstall: (command) => runWithBusy(() => doInstall(command)) }) : null, createOpen ? /* @__PURE__ */ import_react6.default.createElement(NewProfileDialog, { onCancel: () => setCreateOpen(false), onCreate: (name2) => runWithBusy(() => doCreateProfile(name2)) }) : null, confirmContent !== null ? /* @__PURE__ */ import_react6.default.createElement("div", { className: "pm-modal-backdrop", role: "presentation", onMouseDown: (e) => {
    if (e.target === e.currentTarget && !busy) setConfirm(CONFIRM_DEFAULTS);
  } }, /* @__PURE__ */ import_react6.default.createElement("div", { className: "pm-modal", role: "dialog", "aria-modal": "true" }, /* @__PURE__ */ import_react6.default.createElement("h3", null, confirmContent.title), confirmContent.body, /* @__PURE__ */ import_react6.default.createElement("div", { className: "pm-modal-foot" }, /* @__PURE__ */ import_react6.default.createElement("button", { type: "button", className: "pm-btn", disabled: busy, onClick: () => setConfirm(CONFIRM_DEFAULTS) }, "\u53D6\u6D88"), /* @__PURE__ */ import_react6.default.createElement(
    "button",
    {
      type: "button",
      className: confirmContent.danger ? "pm-btn pm-btn-danger" : "pm-btn pm-btn-primary",
      disabled: busy,
      onClick: () => void confirmContent.onOk()
    },
    busy ? "\u6267\u884C\u4E2D\u2026" : confirmContent.ok
  )))) : null);
}

// .dsh-plugin/client/index.mjs
var name = "plugin-manager";
var inject = ["slots"];
function apply(ctx) {
  if (document.querySelector("style[data-plugin-manager-style]") !== null) return;
  const styleEl = document.createElement("style");
  styleEl.setAttribute("data-plugin-manager-style", "");
  styleEl.setAttribute("data-plugin", "plugin-manager");
  styleEl.textContent = CSS;
  document.head.append(styleEl);
  ctx.effect(() => () => {
    styleEl.remove();
  }, "plugin-manager: styles");
  ctx.slots.inject("settings.plugins.tab", () => ctx.slots.register({
    name: "settings.plugins.tab",
    id: "plugin-manager",
    order: 30,
    label: () => "\u63D2\u4EF6\u7BA1\u7406",
    inject: () => ({})
  }, PluginManagerTab));
}
		return module.exports;
	}
});
